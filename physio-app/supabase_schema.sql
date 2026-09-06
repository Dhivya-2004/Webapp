-- Drop existing tables if they exist so this script runs cleanly
drop table if exists public.purchases;
drop table if exists public.appointments;
drop table if exists public.profiles;

-- 1. Create custom profiles table extending auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('patient', 'doctor', 'admin', 'nurse')),
  name text,

  qualification text,
  clinic_name text,
  address text,
  phone text,
  gender text,
  college_name text,
  experience text,
  degree_photo_url text,
  specialization text,
  service_procedures jsonb,
  previous_employment_title text,
  previous_employment_clinic text,
  bls_acls_services jsonb,
  special_equipment jsonb,
  languages_known jsonb,
  profile_photo_url text,
  aadhar_card_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.profiles(id) not null,
  date text not null,
  time text not null,
  reason text,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;
create policy "Users can view their own appointments." on appointments for select using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "Patients can create appointments." on appointments for insert with check (auth.uid() = patient_id);
create policy "Doctors and patients can update their appointments." on appointments for update using (auth.uid() = patient_id or auth.uid() = doctor_id);

-- Enable real-time for appointments
-- (Safely try to add it, ignoring if it already exists)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'appointments') then
    alter publication supabase_realtime add table appointments;
  end if;
end
$$;

-- 3. Purchases table
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  product_id text not null,
  product_name text not null,
  size text,
  price numeric not null,
  payment_method text not null,
  status text default 'Ordered', -- Ordered, Delivered, Cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.purchases enable row level security;
create policy "Users can view their own purchases." on purchases for select using (auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can create purchases." on purchases for insert with check (auth.uid() = user_id);
create policy "Admins can update purchases." on purchases for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin') or auth.uid() = user_id);

-- 4. Notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
create policy "Users can view their own notifications." on notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications." on notifications for insert with check (true);
create policy "Users can update their notifications." on notifications for update using (auth.uid() = user_id);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table notifications;
  end if;
end
$$;

-- Add status column to profiles table for admin approval flow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';
