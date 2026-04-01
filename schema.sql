-- Create users table (extends Supabase auth)
create table public.users (
  id uuid references auth.users not null primary key,
  role text check(role in ('admin', 'user')) default 'user',
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;
create policy "Users can view their own data." on public.users for select using (auth.uid() = id);

-- Function to handle new user registration
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, email)
  values (new.id, 'user', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Alerts Table
create table public.alerts (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  message text not null,
  area text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Traffic Table
create table public.traffic (
  id uuid default uuid_generate_v4() primary key,
  route text not null,
  congestion_level text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Electricity Table
create table public.electricity (
  id uuid default uuid_generate_v4() primary key,
  area text not null,
  status text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Water Supply Table
create table public.water_supply (
  id uuid default uuid_generate_v4() primary key,
  area text not null,
  status text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Parking Table
create table public.parking (
  id uuid default uuid_generate_v4() primary key,
  location text not null,
  total_slots integer not null,
  available_slots integer not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transport Table
create table public.transport (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  route text not null,
  availability text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  transport_id uuid references public.transport(id) not null,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for all tables
alter publication supabase_realtime add table alerts, traffic, parking, electricity, water_supply, transport, bookings;

-- Turn off RLS for rapid MVP testing
alter table public.alerts disable row level security;
alter table public.traffic disable row level security;
alter table public.electricity disable row level security;
alter table public.water_supply disable row level security;
alter table public.parking disable row level security;
alter table public.transport disable row level security;
alter table public.bookings disable row level security;
