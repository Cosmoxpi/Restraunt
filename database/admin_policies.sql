-- Add policies to allow admins to view all orders and order items

-- First, create a function to check if a user is an approved admin
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() 
    AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql;

-- Add policy for admins to view all orders
DROP POLICY IF EXISTS "Allow admins to view all orders" ON orders;
CREATE POLICY "Allow admins to view all orders" 
  ON orders FOR SELECT
  USING (is_approved_admin());

-- Add policy for admins to update order status
DROP POLICY IF EXISTS "Allow admins to update orders" ON orders;
CREATE POLICY "Allow admins to update orders" 
  ON orders FOR UPDATE
  USING (is_approved_admin());

-- Add policy for admins to view all order items
DROP POLICY IF EXISTS "Allow admins to view all order items" ON order_items;
CREATE POLICY "Allow admins to view all order items" 
  ON order_items FOR SELECT
  USING (is_approved_admin());
