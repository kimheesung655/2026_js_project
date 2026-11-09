alter table public.schools enable row level security;
alter table public.profiles enable row level security;

create policy "학교 목록 조회"
on public.schools for select
using (true);

create policy "프로필 조회"
on public.profiles for select
using (true);

create policy "본인 프로필 생성"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "본인 프로필 수정"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
