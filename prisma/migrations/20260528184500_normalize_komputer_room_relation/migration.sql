-- Backfill existing free-text room values into pokoj records, then normalize komputer to roomId.

INSERT INTO pokoj (name)
SELECT DISTINCT k.room
FROM komputer k
LEFT JOIN pokoj p ON p.name = k.room
WHERE k.room IS NOT NULL
  AND k.room <> ''
  AND p.id IS NULL;

ALTER TABLE komputer
  ADD COLUMN roomId INT NULL,
  ADD INDEX komputer_roomId_idx (roomId);

UPDATE komputer k
LEFT JOIN pokoj p ON p.name = k.room
SET k.roomId = p.id
WHERE k.room IS NOT NULL
  AND k.room <> '';

ALTER TABLE komputer
  ADD CONSTRAINT komputer_roomId_fkey
  FOREIGN KEY (roomId) REFERENCES pokoj(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE komputer
  DROP COLUMN room;
