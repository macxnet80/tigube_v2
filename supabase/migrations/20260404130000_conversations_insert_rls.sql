-- Konversationen: INSERT-Policy fehlte — Betreuer konnten bei Gesuchen keine neue Konversation anlegen (RLS).
-- Erlaubt nur Zeilen, bei denen der eingeloggte Nutzer Besitzer oder Betreuer ist.

DROP POLICY IF EXISTS "Users can create conversations they participate in" ON public.conversations;

CREATE POLICY "Users can create conversations they participate in"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    OR caretaker_id = auth.uid()
  );
