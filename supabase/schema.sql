create extension if not exists "pgcrypto";

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_one_and_done boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  completed_by text not null,
  completed_at timestamptz not null default now()
);

create index if not exists task_completions_task_id_completed_at_idx
  on task_completions (task_id, completed_at desc);
