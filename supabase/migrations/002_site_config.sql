-- Site-wide configuration table
create table if not exists site_config (
  key        text        primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Default: sunrise/sunset animation enabled
insert into site_config (key, value)
values ('themeAnimation', '{"enabled": true}'::jsonb)
on conflict (key) do nothing;

-- Enable RLS
alter table site_config enable row level security;

-- Public read — ThemeToggle must work for all visitors (anon + authenticated)
create policy "Public can read site_config"
  on site_config for select
  to anon, authenticated
  using (true);

-- Only admins can write
create policy "Admins can insert site_config"
  on site_config for insert
  to authenticated
  with check (is_admin());

create policy "Admins can update site_config"
  on site_config for update
  to authenticated
  using (is_admin())
  with check (is_admin());
