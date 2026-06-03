# Neon Migration Plan

The current MedCore app stores users in `localStorage`, so accounts are browser-specific. Neon should become the shared source of truth for admins, staff, and patients.

## Recommended Path

1. Create a Neon Postgres database from the Vercel Marketplace for this project.
2. Add the generated `DATABASE_URL` to Vercel environment variables.
3. Apply `db/schema.sql` in Neon SQL Editor.
4. Replace localStorage auth with server-backed auth.
5. Store passwords as hashes only. Never store plain text passwords in Neon.

## Unified Users Model

Use one `users` table for all login-capable identities:

- `ADMIN`
- `DOCTOR`
- `RECEPTIONIST`
- `PHARMACIST`
- `ACCOUNTANT`
- `PATIENT`

Patient-specific fields live in `patient_profiles`, linked by `user_id`.

## Super Admin Seed

Seed this first account as the head admin:

```text
email: abdullahabdulsobur@gmail.com
password: Abdulsobur1
role: ADMIN
is_head_admin: true
```

In production, hash that password with bcrypt before inserting it.

## Route Scoping

When API routes are added:

- Patients query only rows where `patient_user_id = session.user.id`.
- Doctors query only rows where `doctor_user_id = session.user.id`.
- Admins query all rows.

This keeps `/admin/dashboard` system-wide and `/patient/dashboard` personal.
