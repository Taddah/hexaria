CREATE TABLE players (
  user_id      UUID PRIMARY KEY,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  components   JSONB NOT NULL DEFAULT '{}',
  version      INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE world_meta (
  id         INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  seed       TEXT NOT NULL,
  game_time  JSONB NOT NULL DEFAULT '{}',
  version    INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE map_modifications (
  q             INT NOT NULL,
  r             INT NOT NULL,
  modifications JSONB NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (q, r)
);

CREATE TABLE world_entities (
  entity_id  BIGSERIAL PRIMARY KEY,
  q          INT NOT NULL,
  r          INT NOT NULL,
  components JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_world_entities_pos ON world_entities (q, r);
