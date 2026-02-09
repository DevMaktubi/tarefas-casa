create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table task_completions
  add column if not exists participant_id uuid null references participants(id) on delete set null;

create index if not exists task_completions_participant_id_idx
  on task_completions (participant_id);
