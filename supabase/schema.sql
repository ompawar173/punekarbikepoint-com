-- Create bikes table
CREATE TABLE IF NOT EXISTS bikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price BIGINT NOT NULL,
  km_driven INT DEFAULT 0,
  fuel_type VARCHAR(50) DEFAULT 'Petrol',
  condition VARCHAR(50) DEFAULT 'good',
  location VARCHAR(255) DEFAULT 'Pune',
  owner VARCHAR(100) DEFAULT 'Owner',
  description TEXT,
  features TEXT[],
  images TEXT[],
  seller_note TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  bike_title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create upcoming_bikes table
CREATE TABLE IF NOT EXISTS upcoming_bikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  expected_price BIGINT,
  launch_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL
);

-- Enable RLS
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read bikes" ON bikes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Anyone can read upcoming bikes" ON upcoming_bikes FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bikes_featured ON bikes(is_featured);
CREATE INDEX IF NOT EXISTS idx_bikes_brand ON bikes(brand);
CREATE INDEX IF NOT EXISTS idx_inquiries_bike_id ON inquiries(bike_id);
