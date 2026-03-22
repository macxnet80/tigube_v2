import { getOrCreateConversation, sendMessage } from './chatService';
import { isCaretakerLikeUserType } from '../utils';

function marketplaceConversationParticipants(params: {
  sellerId: string;
  buyerId: string;
  sellerUserType: string | null | undefined;
  buyerUserType: string | null | undefined;
}): { owner_id: string; caretaker_id: string } {
  const sellerCt = isCaretakerLikeUserType(params.sellerUserType);
  const buyerCt = isCaretakerLikeUserType(params.buyerUserType);
  if (sellerCt && !buyerCt) {
    return { owner_id: params.buyerId, caretaker_id: params.sellerId };
  }
  return { owner_id: params.sellerId, caretaker_id: params.buyerId };
}

/**
 * Startet Chat zur Marktplatz-Anzeige (owner/caretaker-Spalten gemäß tigube-Konversationsmodell).
 */
export async function contactSellerAboutListing(params: {
  sellerId: string;
  buyerId: string;
  listingId: string;
  listingTitle: string;
  sellerUserType: string | null | undefined;
  buyerUserType: string | null | undefined;
}): Promise<{ conversationId: string } | { error: string }> {
  const { owner_id, caretaker_id } = marketplaceConversationParticipants({
    sellerId: params.sellerId,
    buyerId: params.buyerId,
    sellerUserType: params.sellerUserType,
    buyerUserType: params.buyerUserType,
  });

  const { data: conv, error: convErr } = await getOrCreateConversation({
    owner_id,
    caretaker_id,
  });

  if (convErr || !conv) {
    return { error: convErr || 'Konversation konnte nicht geöffnet werden.' };
  }

  const content = `Hallo! Ich interessiere mich für deine Marktplatz-Anzeige „${params.listingTitle}“.\n\n(Anzeige-ID: ${params.listingId})`;
  const { error: msgErr } = await sendMessage({
    conversation_id: conv.id,
    content,
  });

  if (msgErr) {
    return { error: msgErr };
  }

  return { conversationId: conv.id };
}
