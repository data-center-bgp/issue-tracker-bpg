-- Progress timeline for issues. Run once in the Supabase SQL Editor.
-- Schema below is the old cloud project's; for the self-hosted one, replace
-- every issue_tracker_bpg with issue_tracker.
--
-- Each row is one progress update. A trigger copies the latest update onto
-- issues (progress, status, actual_close_date), so the dashboard keeps reading
-- issues.progress and never needs to know about this table.

create table if not exists issue_tracker_bpg.issue_progress_updates (
  id          bigint generated always as identity primary key,
  issue_id    bigint not null
              references issue_tracker_bpg.issues(id) on delete cascade,
  progress    smallint not null check (progress between 0 and 100),
  note        text not null check (length(btrim(note)) > 0),
  author_name text,
  created_at  timestamptz not null default now()
);

create index if not exists issue_progress_updates_issue_idx
  on issue_tracker_bpg.issue_progress_updates (issue_id, created_at desc);

-- Updates are append-only: no UPDATE or DELETE for app users (rows still go
-- away with their issue through the cascade above).
alter table issue_tracker_bpg.issue_progress_updates enable row level security;

create policy "authenticated can read progress updates"
  on issue_tracker_bpg.issue_progress_updates
  for select to authenticated using (true);

create policy "authenticated can add progress updates"
  on issue_tracker_bpg.issue_progress_updates
  for insert to authenticated with check (true);

grant select, insert on issue_tracker_bpg.issue_progress_updates to authenticated;
grant usage, select on all sequences in schema issue_tracker_bpg to authenticated;

create or replace function issue_tracker_bpg.apply_progress_update()
returns trigger
language plpgsql
as $$
begin
  update issue_tracker_bpg.issues
  set progress = new.progress,
      status = case when new.progress = 100 then 'completed' else 'on_progress' end,
      actual_close_date = case
        when new.progress = 100 then coalesce(actual_close_date, current_date)
        when status = 'completed' then null   -- reopened
        else actual_close_date
      end,
      updated_at = now()
  where id = new.issue_id;
  return new;
end;
$$;

drop trigger if exists apply_progress_update
  on issue_tracker_bpg.issue_progress_updates;

create trigger apply_progress_update
  after insert on issue_tracker_bpg.issue_progress_updates
  for each row execute function issue_tracker_bpg.apply_progress_update();
