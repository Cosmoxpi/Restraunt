-- Create tables for Food Shop application

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL, -- Price in Indian Rupees (₹)
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  is_popular BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL, -- Total amount in Indian Rupees (₹)
  delivery_address TEXT,
  delivery_fee DECIMAL(10, 2) DEFAULT 0, -- Delivery fee in Indian Rupees (₹)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Create policies only if they don't exist
DO $$
BEGIN
    -- Check if policy exists for categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'Allow public read access to categories'
    ) THEN
        CREATE POLICY "Allow public read access to categories"
          ON categories FOR SELECT
          USING (true);
    END IF;

    -- Check if policy exists for menu_items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'menu_items' AND policyname = 'Allow public read access to menu_items'
    ) THEN
        CREATE POLICY "Allow public read access to menu_items"
          ON menu_items FOR SELECT
          USING (true);
    END IF;

    -- Check for other policies and create if needed
    -- ... similar checks for other policies
END
$$;

CREATE POLICY "Allow users to read their own profiles"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profiles"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow admins to read their own data"
  ON admins FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow admins to update their own data"
  ON admins FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow users to read their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to insert their own order items"
  ON order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS menu_items_category_id_idx ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_menu_item_id_idx ON order_items(menu_item_id);


-- After your existing policies, add these insert policies for categories and menu_items

-- Add insert policy for categories
DROP POLICY IF EXISTS "Allow insert access to categories" ON categories;
CREATE POLICY "Allow insert access to categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Add insert policy for menu_items
DROP POLICY IF EXISTS "Allow insert access to menu_items" ON menu_items;
CREATE POLICY "Allow insert access to menu_items"
  ON menu_items FOR INSERT
  WITH CHECK (true);