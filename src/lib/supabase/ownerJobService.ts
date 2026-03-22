import { supabase } from './client';
import type { Database } from './database.types';

export type OwnerJobRow = Database['public']['Tables']['owner_jobs']['Row'];
export type OwnerJobInsert = Database['public']['Tables']['owner_jobs']['Insert'];
export type OwnerJobUpdate = Database['public']['Tables']['owner_jobs']['Update'];

export interface OwnerJobPetSummary {
  id: string;
  name: string;
}

export interface OwnerJobWithPets extends OwnerJobRow {
  pet_ids: string[];
  pets: OwnerJobPetSummary[];
}

export interface OpenJobListItem extends OwnerJobRow {
  pet_ids: string[];
  pets: OwnerJobPetSummary[];
  owner_first_name: string | null;
  owner_last_name: string | null;
}

export interface ListOpenJobsFilters {
  locationQuery?: string;
  serviceTag?: string;
  dateFrom?: string;
}

async function attachPetsToJobs(jobs: OwnerJobRow[]): Promise<OwnerJobWithPets[]> {
  if (jobs.length === 0) return [];
  const jobIds = jobs.map((j) => j.id);
  const { data: links, error: linkErr } = await supabase
    .from('owner_job_pets')
    .select('job_id, pet_id, pets(id, name)')
    .in('job_id', jobIds);

  if (linkErr) {
    console.error('owner_job_pets load:', linkErr);
  }

  const byJob = new Map<string, { pet_ids: string[]; pets: OwnerJobPetSummary[] }>();
  for (const jid of jobIds) {
    byJob.set(jid, { pet_ids: [], pets: [] });
  }
  for (const row of links || []) {
    const jid = row.job_id;
    const pet = row.pets as { id: string; name: string } | null;
    const entry = byJob.get(jid);
    if (!entry || !pet) continue;
    entry.pet_ids.push(pet.id);
    entry.pets.push({ id: pet.id, name: pet.name });
  }

  return jobs.map((j) => {
    const extra = byJob.get(j.id) || { pet_ids: [], pets: [] };
    return { ...j, ...extra };
  });
}

export const ownerJobService = {
  async listJobsByOwner(ownerId: string): Promise<{ data: OwnerJobWithPets[]; error: string | null }> {
    const { data, error } = await supabase
      .from('owner_jobs')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    const withPets = await attachPetsToJobs(data || []);
    return { data: withPets, error: null };
  },

  async listOpenJobs(
    filters: ListOpenJobsFilters = {}
  ): Promise<{ data: OpenJobListItem[]; error: string | null }> {
    let q = supabase
      .from('owner_jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (filters.locationQuery?.trim()) {
      q = q.ilike('location_text', `%${filters.locationQuery.trim()}%`);
    }
    if (filters.serviceTag) {
      q = q.contains('service_tags', [filters.serviceTag]);
    }
    if (filters.dateFrom) {
      q = q.or(`date_to.is.null,date_to.gte.${filters.dateFrom}`);
    }

    const { data: jobs, error } = await q;
    if (error) return { data: [], error: error.message };

    const withPets = await attachPetsToJobs(jobs || []);
    const ownerIds = [...new Set(withPets.map((j) => j.owner_id))];
    if (ownerIds.length === 0) return { data: [], error: null };

    const { data: users, error: uerr } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .in('id', ownerIds);

    if (uerr) return { data: [], error: uerr.message };
    const userMap = new Map((users || []).map((u) => [u.id, u]));

    const list: OpenJobListItem[] = withPets.map((j) => {
      const u = userMap.get(j.owner_id);
      return {
        ...j,
        owner_first_name: u?.first_name ?? null,
        owner_last_name: u?.last_name ?? null,
      };
    });

    return { data: list, error: null };
  },

  async getJob(jobId: string): Promise<{ data: OwnerJobWithPets | null; error: string | null }> {
    const { data, error } = await supabase.from('owner_jobs').select('*').eq('id', jobId).maybeSingle();
    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: null };
    const [withPets] = await attachPetsToJobs([data]);
    return { data: withPets, error: null };
  },

  async createJob(payload: {
    ownerId: string;
    title: string;
    description: string;
    date_from?: string | null;
    date_to?: string | null;
    location_text?: string | null;
    service_tags?: string[];
    budget_hint?: string | null;
    pet_ids?: string[];
  }): Promise<{ data: OwnerJobWithPets | null; error: string | null }> {
    const insert: OwnerJobInsert = {
      owner_id: payload.ownerId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      status: 'open',
      date_from: payload.date_from || null,
      date_to: payload.date_to || null,
      location_text: payload.location_text?.trim() || null,
      service_tags: payload.service_tags?.length ? payload.service_tags : [],
      budget_hint: payload.budget_hint?.trim() || null,
    };

    const { data: job, error } = await supabase.from('owner_jobs').insert(insert).select('*').single();
    if (error || !job) return { data: null, error: error?.message || 'Insert fehlgeschlagen' };

    const petIds = payload.pet_ids || [];
    if (petIds.length > 0) {
      const rows = petIds.map((pet_id) => ({ job_id: job.id, pet_id }));
      const { error: perr } = await supabase.from('owner_job_pets').insert(rows);
      if (perr) {
        await supabase.from('owner_jobs').delete().eq('id', job.id);
        return { data: null, error: perr.message };
      }
    }

    return this.getJob(job.id);
  },

  async updateJob(
    jobId: string,
    ownerId: string,
    payload: {
      title?: string;
      description?: string;
      status?: 'open' | 'closed' | 'filled';
      date_from?: string | null;
      date_to?: string | null;
      location_text?: string | null;
      service_tags?: string[];
      budget_hint?: string | null;
      pet_ids?: string[];
    }
  ): Promise<{ data: OwnerJobWithPets | null; error: string | null }> {
    const { data: existing, error: exErr } = await supabase
      .from('owner_jobs')
      .select('id, owner_id')
      .eq('id', jobId)
      .maybeSingle();
    if (exErr || !existing || existing.owner_id !== ownerId) {
      return { data: null, error: 'Job nicht gefunden oder keine Berechtigung' };
    }

    const update: OwnerJobUpdate = {};
    if (payload.title !== undefined) update.title = payload.title.trim();
    if (payload.description !== undefined) update.description = payload.description.trim();
    if (payload.status !== undefined) update.status = payload.status;
    if (payload.date_from !== undefined) update.date_from = payload.date_from;
    if (payload.date_to !== undefined) update.date_to = payload.date_to;
    if (payload.location_text !== undefined) update.location_text = payload.location_text?.trim() || null;
    if (payload.service_tags !== undefined) update.service_tags = payload.service_tags;
    if (payload.budget_hint !== undefined) update.budget_hint = payload.budget_hint?.trim() || null;

    if (Object.keys(update).length > 0) {
      const { error: uerr } = await supabase.from('owner_jobs').update(update).eq('id', jobId);
      if (uerr) return { data: null, error: uerr.message };
    }

    if (payload.pet_ids !== undefined) {
      await supabase.from('owner_job_pets').delete().eq('job_id', jobId);
      if (payload.pet_ids.length > 0) {
        const rows = payload.pet_ids.map((pet_id) => ({ job_id: jobId, pet_id }));
        const { error: ierr } = await supabase.from('owner_job_pets').insert(rows);
        if (ierr) return { data: null, error: ierr.message };
      }
    }

    return this.getJob(jobId);
  },

  async deleteJob(jobId: string, ownerId: string): Promise<{ error: string | null }> {
    const { data: existing } = await supabase.from('owner_jobs').select('owner_id').eq('id', jobId).maybeSingle();
    if (!existing || existing.owner_id !== ownerId) {
      return { error: 'Job nicht gefunden oder keine Berechtigung' };
    }
    const { error } = await supabase.from('owner_jobs').delete().eq('id', jobId);
    return { error: error?.message || null };
  },

  /** Nur offene Jobs eines Owners (für öffentliches Profil) */
  async listOpenJobsForOwner(ownerId: string): Promise<{ data: OwnerJobWithPets[]; error: string | null }> {
    const { data, error } = await supabase
      .from('owner_jobs')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    const withPets = await attachPetsToJobs(data || []);
    return { data: withPets, error: null };
  },
};
