-- Track last activity per chat session for sidebar ordering.

alter table public.chat_sessions
add column if not exists updated_at timestamptz not null default now();

update public.chat_sessions s
set updated_at = coalesce(
  (select max(m.created_at) from public.chat_messages m where m.session_id = s.id),
  s.created_at
);

create index if not exists idx_chat_sessions_user_id_updated_at
on public.chat_sessions (user_id, updated_at desc);

create or replace function public.touch_chat_session_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_sessions
  set updated_at = now()
  where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_touch_session_updated_at on public.chat_messages;
create trigger chat_messages_touch_session_updated_at
after insert on public.chat_messages
for each row execute function public.touch_chat_session_on_message();
