-- Segurança: RLS em todas as tabelas. O público (anon) NÃO lê nem escreve nada diretamente.
-- Admin = usuário autenticado com profile.role = 'admin'.
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
$$;
revoke all on function is_admin() from public; grant execute on function is_admin() to authenticated;

do $$ declare t text; begin
  foreach t in array array['profiles','customers','equipment','service_catalog','quote_requests','quote_request_photos','appointments','service_visits','visit_photos','maintenance_reminders','company_settings','business_hours','submit_rate_limit']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on %I from anon', t);
  end loop;
  foreach t in array array['customers','equipment','service_catalog','quote_requests','quote_request_photos','appointments','service_visits','visit_photos','maintenance_reminders','company_settings','business_hours']
  loop execute format('create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin())', t || '_admin_all', t); end loop;
end $$;

create policy profiles_self_read on profiles for select to authenticated using (id = auth.uid());
-- submit_rate_limit: sem policy = ninguém além do service role (Edge Function).

-- Storage privado: fotos só para admin (leitura via URL assinada). Upload público passa pela Edge Function.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('request-photos','request-photos',false, 8388608, array['image/jpeg','image/png','image/webp','image/heic','image/heif']),
       ('visit-photos','visit-photos',false, 8388608, array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do nothing;
create policy photos_admin_all on storage.objects for all to authenticated
  using (bucket_id in ('request-photos','visit-photos') and is_admin())
  with check (bucket_id in ('request-photos','visit-photos') and is_admin());
