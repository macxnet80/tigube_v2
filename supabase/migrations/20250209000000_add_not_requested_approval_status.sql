-- Migration: Füge 'not_requested' als gültigen approval_status hinzu
-- Diese Migration erweitert die approval_status CHECK-Constraint und ändert den DEFAULT-Wert

-- 1. Erweitere die CHECK-Constraint, um 'not_requested' zu erlauben
-- Zuerst die alte Constraint löschen (falls vorhanden)
ALTER TABLE caretaker_profiles 
DROP CONSTRAINT IF EXISTS caretaker_profiles_approval_status_check;

-- Neue Constraint mit 'not_requested' hinzufügen
ALTER TABLE caretaker_profiles 
ADD CONSTRAINT caretaker_profiles_approval_status_check 
CHECK (approval_status IN ('not_requested', 'pending', 'approved', 'rejected'));

-- 2. Ändere den DEFAULT-Wert auf 'not_requested' für neue Einträge
ALTER TABLE caretaker_profiles 
ALTER COLUMN approval_status SET DEFAULT 'not_requested';

-- 3. Setze bestehende Profile ohne approval_status oder mit NULL auf 'not_requested'
-- (aber nur wenn sie noch nie eine Freigabe angefordert haben)
UPDATE caretaker_profiles 
SET approval_status = 'not_requested'
WHERE approval_status IS NULL 
   OR (approval_status = 'pending' AND approval_requested_at IS NULL);

-- 4. Aktualisiere den Kommentar
COMMENT ON COLUMN caretaker_profiles.approval_status IS 'Status of profile approval: not_requested, pending, approved, rejected';




