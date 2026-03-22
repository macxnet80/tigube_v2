import { getOrCreateConversation, sendMessage } from './chatService';

/**
 * Startet bzw. nutzt Chat mit dem Tierhalter und sendet eine strukturierte Bewerbung auf einen Job.
 */
export async function applyToOwnerJobViaChat(params: {
  ownerId: string;
  caretakerId: string;
  jobId: string;
  jobTitle: string;
}): Promise<{ conversationId: string } | { error: string }> {
  const { data: conv, error: convErr } = await getOrCreateConversation({
    owner_id: params.ownerId,
    caretaker_id: params.caretakerId
  });

  if (convErr || !conv) {
    return { error: convErr || 'Konversation konnte nicht geöffnet werden.' };
  }

  const content = `Hallo! Ich möchte mich auf deinen Job „${params.jobTitle}“ bewerben.\n\n(Job-ID: ${params.jobId})`;
  const { error: msgErr } = await sendMessage({
    conversation_id: conv.id,
    content
  });

  if (msgErr) {
    return { error: msgErr };
  }

  return { conversationId: conv.id };
}
