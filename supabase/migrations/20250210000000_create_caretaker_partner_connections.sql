-- Migration: Partner-Funktionalität für Dienstleister/Betreuer
-- Erstellt: 2025-02-10
-- Zweck: Ermöglicht es Dienstleistern/Betreuern, andere Dienstleister/Betreuer als Partner zu speichern

-- 1. Tabelle für Caretaker-Partner Verbindungen erstellen
CREATE TABLE IF NOT EXISTS public.caretaker_partner_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caretaker_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Eindeutige Verbindung pro Caretaker-Partner Paar
  UNIQUE(caretaker_id, partner_id),
  
  -- Verhindere, dass jemand sich selbst als Partner speichert
  CHECK (caretaker_id != partner_id)
);

-- 2. Indizes für Performance-Optimierung
CREATE INDEX IF NOT EXISTS idx_caretaker_partner_connections_caretaker_id 
  ON public.caretaker_partner_connections(caretaker_id);

CREATE INDEX IF NOT EXISTS idx_caretaker_partner_connections_partner_id 
  ON public.caretaker_partner_connections(partner_id);

CREATE INDEX IF NOT EXISTS idx_caretaker_partner_connections_created_at 
  ON public.caretaker_partner_connections(created_at DESC);

-- Composite Index für häufige Lookup-Queries
CREATE INDEX IF NOT EXISTS idx_caretaker_partner_lookup 
  ON public.caretaker_partner_connections(caretaker_id, partner_id);

-- 3. Trigger für automatische updated_at Aktualisierung
CREATE OR REPLACE FUNCTION public.update_caretaker_partner_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_caretaker_partner_connections_updated_at
  BEFORE UPDATE ON public.caretaker_partner_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_caretaker_partner_connections_updated_at();

-- 4. Row Level Security (RLS) aktivieren
ALTER TABLE public.caretaker_partner_connections ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies erstellen

-- Policy: Benutzer können ihre eigenen Partner-Verbindungen sehen
CREATE POLICY "Users can view their own partner connections" 
ON public.caretaker_partner_connections
FOR SELECT 
USING (
  auth.uid() = caretaker_id
);

-- Policy: Benutzer können ihre eigenen Partner-Verbindungen erstellen
CREATE POLICY "Users can create their own partner connections" 
ON public.caretaker_partner_connections
FOR INSERT 
WITH CHECK (
  auth.uid() = caretaker_id
);

-- Policy: Benutzer können ihre eigenen Partner-Verbindungen löschen
CREATE POLICY "Users can delete their own partner connections" 
ON public.caretaker_partner_connections
FOR DELETE 
USING (
  auth.uid() = caretaker_id
);

-- 6. Kommentare für Dokumentation
COMMENT ON TABLE public.caretaker_partner_connections IS 
'Verwaltet Partner-Verbindungen zwischen Dienstleistern/Betreuern. Ermöglicht es Dienstleistern/Betreuern, andere Dienstleister/Betreuer als Partner zu speichern.';

COMMENT ON COLUMN public.caretaker_partner_connections.caretaker_id IS 
'ID des Dienstleisters/Betreuers, der den Partner speichert';

COMMENT ON COLUMN public.caretaker_partner_connections.partner_id IS 
'ID des gespeicherten Partners (kann Dienstleister oder Betreuer sein)';

-- Migration erfolgreich abgeschlossen
-- Tabelle: caretaker_partner_connections ✅
-- Indizes: Performance-optimiert ✅  
-- RLS: Sicherheitsrichtlinien ✅
-- Trigger: Automatische updated_at Aktualisierung ✅

