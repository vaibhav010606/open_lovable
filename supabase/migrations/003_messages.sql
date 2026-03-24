create table messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Users own their messages"
  on messages for all
  using (
    auth.uid() = (
      select user_id from projects where id = project_id
    )
  );
