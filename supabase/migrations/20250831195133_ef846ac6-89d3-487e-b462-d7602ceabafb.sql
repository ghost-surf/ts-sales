-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'operador');
CREATE TYPE public.document_type AS ENUM ('FACT', 'COT');
CREATE TYPE public.document_status AS ENUM ('draft', 'issued', 'paid', 'canceled');
CREATE TYPE public.unit_type AS ENUM ('metros', 'pcs');
CREATE TYPE public.payment_method AS ENUM ('numerario', 'cheque');
CREATE TYPE public.movement_type AS ENUM ('debit', 'credit');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operador',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit unit_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_qty DECIMAL(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit unit_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nuit TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table (for invoices and quotes)
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type document_type NOT NULL,
  code TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subtotal_products DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal_services DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_applied BOOLEAN NOT NULL DEFAULT false,
  vat_applied BOOLEAN NOT NULL DEFAULT true,
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status document_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_items table
CREATE TABLE public.document_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'service')),
  item_id UUID NOT NULL,
  description TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit unit_type,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_code TEXT NOT NULL UNIQUE,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  method payment_method NOT NULL,
  cheque_number TEXT,
  amount DECIMAL(10,2) NOT NULL,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_documents table (many-to-many)
CREATE TABLE public.payment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  UNIQUE(payment_id, document_id)
);

-- Create counters table for document numbering
CREATE TABLE public.counters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('FACT', 'COT', 'REC')),
  last_number INTEGER NOT NULL DEFAULT 0,
  UNIQUE(year, type)
);

-- Create stock_movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  type movement_type NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit unit_type NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for other tables (authenticated users only)
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can view services" ON public.services
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can manage clients" ON public.clients
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage documents" ON public.documents
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage document items" ON public.document_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage payments" ON public.payments
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage payment documents" ON public.payment_documents
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view counters" ON public.counters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update counters" ON public.counters
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert counters" ON public.counters
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view stock movements" ON public.stock_movements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert stock movements" ON public.stock_movements
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'operador'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial data
INSERT INTO public.categories (name, unit) VALUES
  ('Tubos Alta Pressão', 'metros'),
  ('Conexões', 'pcs'),
  ('Serviços Técnicos', 'pcs');

INSERT INTO public.products (category_id, name, description, price, stock_qty, low_stock_threshold, unit) VALUES
  ((SELECT id FROM public.categories WHERE name = 'Tubos Alta Pressão'), 'Tubo 1/2" Alta Pressão', 'Tubo hidráulico de alta pressão 1/2 polegada', 12.50, 100.0, 10.0, 'metros'),
  ((SELECT id FROM public.categories WHERE name = 'Conexões'), 'Curva 90º 3/4"', 'Curva de 90 graus para tubo de 3/4 polegada', 8.75, 50, 5, 'pcs'),
  ((SELECT id FROM public.categories WHERE name = 'Conexões'), 'Válvula de Esfera 1"', 'Válvula de esfera para tubo de 1 polegada', 25.90, 15, 3, 'pcs');

INSERT INTO public.services (category_id, name, price) VALUES
  ((SELECT id FROM public.categories WHERE name = 'Serviços Técnicos'), 'Montagem de Linha', 50.00),
  ((SELECT id FROM public.categories WHERE name = 'Serviços Técnicos'), 'Aperto de Junções', 25.00),
  ((SELECT id FROM public.categories WHERE name = 'Serviços Técnicos'), 'Teste de Pressão', 35.00);

-- Initialize counters for current year
INSERT INTO public.counters (year, type, last_number) VALUES
  (EXTRACT(YEAR FROM NOW())::INTEGER, 'FACT', 0),
  (EXTRACT(YEAR FROM NOW())::INTEGER, 'COT', 0),
  (EXTRACT(YEAR FROM NOW())::INTEGER, 'REC', 0);