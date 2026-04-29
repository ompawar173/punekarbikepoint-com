-- Insert sample bikes
INSERT INTO bikes (title, brand, model, year, price, km_driven, fuel_type, condition, location, owner, is_featured, images, description, features)
VALUES
('Honda Activa 5G 2022', 'Honda', 'Activa', 2022, 45000, 15000, 'Petrol', 'Excellent', 'Pune', 'Owner', true, ARRAY['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=500&fit=crop'], 'Well maintained Honda Activa in excellent condition', ARRAY['Automatic', 'Fuel Efficient', 'Good Mileage']),
('Bajaj Pulsar 150 2021', 'Bajaj', 'Pulsar', 2021, 75000, 25000, 'Petrol', 'Good', 'Pune', 'Owner', true, ARRAY['https://images.unsplash.com/photo-1516591891074-4fb68c1e4e23?w=800&h=500&fit=crop'], 'Sports bike with great performance', ARRAY['Digital Display', 'ABS', 'Self Start']),
('Royal Enfield Classic 350 2020', 'Royal Enfield', 'Classic', 2020, 140000, 30000, 'Petrol', 'Good', 'Pune', 'Owner', true, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop'], 'Iconic Royal Enfield Classic with smooth riding', ARRAY['Air Cooled', 'Low Maintenance', 'Retro Design']),
('Honda CB Shine 2019', 'Honda', 'CB Shine', 2019, 65000, 45000, 'Petrol', 'Average', 'Pune', 'Owner', false, ARRAY['https://images.unsplash.com/photo-1606611283684-ace0d36b2e46?w=800&h=500&fit=crop'], 'Reliable commuter bike with good fuel efficiency', ARRAY['Reliable', 'Fuel Efficient', 'Easy to Maintain']);

-- Insert upcoming bikes
INSERT INTO upcoming_bikes (title, description, image, expected_price, launch_date)
VALUES
('Honda CB 500X Adventure', 'Premium adventure tourer with advanced features', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop', 550000, '2026-06-01'),
('Bajaj Pulsar NS 200 2026', 'Latest generation sports bike with modern tech', 'https://images.unsplash.com/photo-1516591891074-4fb68c1e4e23?w=800&h=500&fit=crop', 125000, '2026-07-15');
