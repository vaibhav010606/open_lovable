create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Untitled Project',
  description text,
  files jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Users own their projects"
  on projects for all
  using (auth.uid() = user_id);
