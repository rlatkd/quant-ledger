create table users (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  name text,
  card_number text,
  role text not null default 'member', -- 'member' | 'admin'
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  store_name text not null,
  receipt_date date not null,
  total_amount integer not null,
  raw_text text,
  category_id uuid references categories(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references receipts(id) on delete cascade,
  menu_name text not null,
  quantity integer not null,
  unit_price integer not null,
  total_price integer not null
);

-- 트랜잭션 함수: 영수증 + 항목 원자적 등록
create or replace function insert_receipt(
  p_store_name text,
  p_receipt_date date,
  p_total_amount integer,
  p_raw_text text default '',
  p_image_url text default null,
  p_category_id uuid default null,
  p_items jsonb default '[]'::jsonb
) returns uuid language plpgsql as $$
declare
  v_id uuid;
begin
  insert into receipts (store_name, receipt_date, total_amount, raw_text, image_url, category_id)
  values (p_store_name, p_receipt_date, p_total_amount, p_raw_text, p_image_url, p_category_id)
  returning id into v_id;

  insert into receipt_items (receipt_id, menu_name, quantity, unit_price, total_price)
  select v_id, item->>'menu_name', (item->>'quantity')::int, (item->>'unit_price')::int, (item->>'total_price')::int
  from jsonb_array_elements(p_items) as item;

  return v_id;
end;
$$;

-- 트랜잭션 함수: 영수증 + 항목 원자적 수정
create or replace function update_receipt(
  p_id uuid,
  p_store_name text,
  p_receipt_date date,
  p_total_amount integer,
  p_raw_text text,
  p_items jsonb default '[]'::jsonb
) returns void language plpgsql as $$
begin
  update receipts
  set store_name = p_store_name,
      receipt_date = p_receipt_date,
      total_amount = p_total_amount,
      raw_text = p_raw_text
  where id = p_id;

  if not found then
    raise exception 'receipt not found: %', p_id;
  end if;

  delete from receipt_items where receipt_id = p_id;

  insert into receipt_items (receipt_id, menu_name, quantity, unit_price, total_price)
  select p_id, item->>'menu_name', (item->>'quantity')::int, (item->>'unit_price')::int, (item->>'total_price')::int
  from jsonb_array_elements(p_items) as item;
end;
$$;

-- 성능 인덱스
create index idx_receipts_date on receipts (receipt_date desc);
create index idx_receipts_created_at on receipts (created_at desc);
create index idx_receipts_category on receipts (category_id);
create index idx_receipt_items_receipt on receipt_items (receipt_id);
