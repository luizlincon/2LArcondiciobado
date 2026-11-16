-- 2L Ar Condicionado: esquema principal
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type request_status as enum ('novo','em_analise','aguardando_confirmacao','confirmado','concluido','cancelado');
create type appointment_kind as enum ('appointment','block');
create type reminder_status as enum ('pendente','contatado','concluido');

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Perfis (extensão de auth.users). Somente role 'admin' acessa o painel.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 120),
  phone text not null check (phone ~ '^[0-9]{10,11}$'),         -- normalizado, sem DDI
  address text not null default '', neighborhood text not null default '', city text not null default 'Brasília',
  notes text not null default '', needs_review boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Evita duplicidade: um cliente ativo por telefone
create unique index customers_phone_active_uq on customers (phone) where deleted_at is null;
create index customers_name_idx on customers (lower(name));

create table equipment (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  type text not null default 'Split', brand text not null, model text not null default '',
  btus integer check (btus is null or btus between 1000 and 200000),
  serial text not null default '', room text not null default '',
  last_service_at date, next_maintenance_at date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index equipment_customer_idx on equipment (customer_id) where deleted_at is null;
create index equipment_next_idx on equipment (next_maintenance_at) where deleted_at is null;

create table service_catalog (
  id text primary key, title text not null, description text not null default '',
  active boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into service_catalog (id, title, sort_order) values
 ('higienizacao','Higienização e limpeza',1),('manutencao_preventiva','Manutenção preventiva',2),
 ('manutencao_corretiva','Manutenção corretiva',3),('instalacao','Instalação',4),
 ('desinstalacao','Desinstalação',5),('carga_gas','Carga de gás e diagnóstico',6);

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid unique,
  customer_id uuid not null references customers(id) on delete restrict,
  service_id text not null references service_catalog(id),
  quantity integer not null check (quantity between 1 and 50),
  location text not null check (char_length(location) between 3 and 250),
  notes text not null default '' check (char_length(notes) <= 1000),
  preferred_date date, preferred_period text not null default 'indiferente' check (preferred_period in ('manha','tarde','indiferente')),
  status request_status not null default 'novo',
  quote_value numeric(10,2) check (quote_value is null or quote_value >= 0),
  appointment_id uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index quote_requests_status_idx on quote_requests (status, created_at desc);
create index quote_requests_customer_idx on quote_requests (customer_id);

create table quote_request_photos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references quote_requests(id) on delete cascade,
  storage_path text not null, content_type text not null, size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);
create index quote_request_photos_req_idx on quote_request_photos (request_id);

-- Agendamentos e bloqueios. Conflitos são impedidos pelo próprio banco (exclusion constraint).
create table appointments (
  id uuid primary key default gen_random_uuid(),
  kind appointment_kind not null default 'appointment',
  customer_id uuid references customers(id) on delete restrict,
  request_id uuid references quote_requests(id) on delete set null,
  equipment_id uuid references equipment(id) on delete set null,
  service_id text references service_catalog(id),
  starts_at timestamptz not null, ends_at timestamptz not null,
  status request_status not null default 'aguardando_confirmacao',
  notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (kind = 'block' or customer_id is not null),
  constraint appointments_no_overlap exclude using gist (tstzrange(starts_at, ends_at) with &&) where (status <> 'cancelado')
);
create index appointments_range_idx on appointments (starts_at, ends_at);
alter table quote_requests add constraint quote_requests_appt_fk foreign key (appointment_id) references appointments(id) on delete set null;

create table service_visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  equipment_id uuid references equipment(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  service_id text not null references service_catalog(id),
  visited_on date not null check (visited_on <= current_date),
  notes text not null default '', address text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  maintenance_interval_months integer check (maintenance_interval_months is null or maintenance_interval_months between 1 and 120),
  next_maintenance_at date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index service_visits_customer_idx on service_visits (customer_id, visited_on desc);
create index service_visits_equipment_idx on service_visits (equipment_id, visited_on desc);
create index service_visits_date_idx on service_visits (visited_on);

create table visit_photos (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references service_visits(id) on delete cascade,
  storage_path text not null, content_type text not null, size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table maintenance_reminders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  equipment_id uuid references equipment(id) on delete cascade,
  visit_id uuid not null references service_visits(id) on delete cascade,
  due_date date not null, status reminder_status not null default 'pendente',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index maintenance_due_idx on maintenance_reminders (due_date) where status <> 'concluido';

create table company_settings (
  id boolean primary key default true check (id), -- linha única
  company_name text not null default '2L Ar Condicionado', whatsapp text, default_duration_minutes int not null default 120,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into company_settings (whatsapp) values ('5561994415050');

create table business_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  enabled boolean not null default true, opens time not null default '08:00', closes time not null default '18:00',
  check (closes > opens), updated_at timestamptz not null default now()
);
insert into business_hours (weekday, enabled) select d, d between 1 and 5 from generate_series(0,6) d;

-- Rate limit do formulário público (usado só pela Edge Function com service role)
create table submit_rate_limit (ip_hash text not null, created_at timestamptz not null default now());
create index submit_rate_limit_idx on submit_rate_limit (ip_hash, created_at);

-- updated_at automático
do $$ declare t text; begin
  foreach t in array array['profiles','customers','equipment','service_catalog','quote_requests','appointments','service_visits','maintenance_reminders','company_settings','business_hours']
  loop execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t); end loop;
end $$;

-- Validação de horário de funcionamento no servidor (bloqueios são isentos)
create or replace function check_business_hours() returns trigger language plpgsql as $$
declare h business_hours; s timestamp; e timestamp;
begin
  if new.kind = 'block' or new.status = 'cancelado' then return new; end if;
  s := new.starts_at at time zone 'America/Sao_Paulo'; e := new.ends_at at time zone 'America/Sao_Paulo';
  if s::date <> e::date then raise exception 'O atendimento deve começar e terminar no mesmo dia'; end if;
  select * into h from business_hours where weekday = extract(dow from s);
  if not found or not h.enabled then raise exception 'A empresa não funciona neste dia da semana'; end if;
  if s::time < h.opens or e::time > h.closes then raise exception 'Fora do horário de funcionamento (% às %)', h.opens, h.closes; end if;
  return new;
end $$;
create trigger appointments_hours before insert or update on appointments for each row execute function check_business_hours();

-- Conclusão de atendimento em uma única transação:
-- visita (com coordenadas) + próxima manutenção + lembrete + equipamento + agendamento/solicitação.
create or replace function complete_visit(
  p_customer uuid, p_equipment uuid, p_appointment uuid, p_service text, p_date date, p_notes text,
  p_address text, p_lat double precision, p_lng double precision, p_interval int, p_specific date
) returns uuid language plpgsql security invoker as $$
declare v_next date; v_id uuid;
begin
  v_next := coalesce(p_specific, case when p_interval is not null then (p_date + make_interval(months => p_interval))::date end);
  insert into service_visits (customer_id, equipment_id, appointment_id, service_id, visited_on, notes, address, latitude, longitude, maintenance_interval_months, next_maintenance_at)
  values (p_customer, p_equipment, p_appointment, p_service, p_date, p_notes, p_address, p_lat, p_lng, p_interval, v_next) returning id into v_id;
  if v_next is not null then
    update maintenance_reminders set status = 'concluido' where equipment_id is not distinct from p_equipment and p_equipment is not null and status = 'pendente';
    insert into maintenance_reminders (customer_id, equipment_id, visit_id, due_date) values (p_customer, p_equipment, v_id, v_next);
  end if;
  if p_equipment is not null then update equipment set last_service_at = p_date, next_maintenance_at = v_next where id = p_equipment; end if;
  if p_appointment is not null then
    update appointments set status = 'concluido' where id = p_appointment;
    update quote_requests set status = 'concluido' where appointment_id = p_appointment;
  end if;
  return v_id;
end $$;
