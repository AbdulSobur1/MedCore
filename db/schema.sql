create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum (
    'ADMIN',
    'DOCTOR',
    'RECEPTIONIST',
    'PHARMACIST',
    'ACCOUNTANT',
    'PATIENT'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  name text not null,
  role user_role not null,
  phone text,
  department text,
  is_active boolean not null default true,
  is_head_admin boolean not null default false,
  otp_hash text,
  otp_expiry timestamptz,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists patient_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  patient_id text not null unique,
  date_of_birth date,
  gender text,
  blood_type text,
  address text,
  emergency_contact text
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references users(id) on delete cascade,
  doctor_user_id uuid references users(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references users(id) on delete cascade,
  doctor_user_id uuid references users(id) on delete set null,
  medication text not null,
  dosage text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references users(id) on delete cascade,
  amount_kobo integer not null,
  status text not null default 'pending',
  issued_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists users_role_idx on users(role);
create index if not exists appointments_patient_idx on appointments(patient_user_id);
create index if not exists appointments_doctor_idx on appointments(doctor_user_id);
create index if not exists prescriptions_patient_idx on prescriptions(patient_user_id);
create index if not exists invoices_patient_idx on invoices(patient_user_id);
