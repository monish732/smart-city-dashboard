-- Seed Sample Data

insert into public.traffic (route, congestion_level) values
('Downtown', 'moderate'),
('Midtown', 'severe'),
('Uptown', 'low'),
('Brooklyn', 'low');

insert into public.parking (location, total_slots, available_slots) values
('Downtown', 500, 120),
('Midtown', 800, 5),
('Queens', 300, 150),
('Bronx', 200, 80);

insert into public.electricity (area, status) values
('Downtown', 'normal'),
('Midtown', 'normal'),
('Brooklyn', 'outage'),
('Uptown', 'normal');

insert into public.water_supply (area, status) values
('All Areas', 'normal');

insert into public.transport (type, route, availability) values
('metro', 'A Train (Uptown to Downtown)', 'active'),
('metro', 'L Train (Manhattan to Brooklyn)', 'delayed'),
('bus', 'M15 (East Side)', 'active'),
('bike', 'CityBike Station Hubs', 'active');
