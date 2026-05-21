ALTER TABLE entries
ADD COLUMN observation_frequency TEXT
  CHECK (observation_frequency IN ('AD','x1','x2','x3'));