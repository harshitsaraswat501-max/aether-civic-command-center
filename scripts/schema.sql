create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  urgency integer default 50,
  status text default 'Pending',
  lat double precision not null,
  lng double precision not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.agent_logs (
  id uuid default gen_random_uuid() primary key,
  agent_name text not null,
  action_taken text not null,
  confidence numeric,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);
