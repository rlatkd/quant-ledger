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
