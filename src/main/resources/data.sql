-- ========================================
-- ROLES - Jogosultságok
-- ========================================
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Rendszer adminisztrátor - teljes hozzáférés'),
('USER', 'Normál felhasználó - szobafoglalás és értékelés');

-- ========================================
-- ROOM STATUS - Szoba státuszok
-- ========================================
INSERT INTO room_status (name, description) VALUES
                                                ('AVAILABLE', 'Szoba elérhető a foglaláshoz'),
                                                ('BOOKED', 'Szoba már foglalt'),
                                                ('MAINTENANCE', 'Szoba karbantartás alatt');

-- ========================================
-- ROOM TYPES - Szobatípusok
-- ========================================
INSERT INTO room_types (name, base_price, description) VALUES
                                                           ('SINGLE', 45.00, 'Egyágyas szoba - 1 fő'),
                                                           ('DOUBLE', 65.00, 'Dupla szoba - 2 fő'),
                                                           ('TRIPLE', 85.00, 'Hármas szoba - 3 fő'),
                                                           ('SUITE', 150.00, 'Luxus szobakomplexum - 4 fő'),
                                                           ('PENTHOUSE', 250.00, 'Tetőtéri deluxe szoba - 2 fő');

-- ========================================
-- ROOMS - Szobák
-- ========================================
INSERT INTO rooms (room_number, floor, room_status_id, room_type_id, max_guests) VALUES
-- 1. emelet (SINGLE és DOUBLE)
('101', 1, 1, 1, 1),
('102', 1, 1, 1, 1),
('103', 1, 1, 2, 2),
('104', 1, 1, 2, 2),
('105', 1, 1, 3, 3),

-- 2. emelet (DOUBLE és TRIPLE)
('201', 2, 1, 2, 2),
('202', 2, 1, 2, 2),
('203', 2, 1, 3, 3),
('204', 2, 1, 3, 3),
('205', 2, 2, 2, 2),

-- 3. emelet (SUITE)
('301', 3, 1, 4, 4),
('302', 3, 1, 4, 4),
('303', 3, 1, 4, 4),

-- 4. emelet (PENTHOUSE)
('401', 4, 1, 5, 2),
('402', 4, 1, 5, 2);

-- ========================================
-- USERS - Felhasználók
-- ========================================
-- Jelszó: admin123 (BCrypt: $2a$10$...)
INSERT INTO users (username, email, phone, created_at) VALUES
                                                           ('admin_user', 'admin@softdream.hu', '+36201234567', NOW()),
                                                           ('john_doe', 'john.doe@gmail.com', '+36301234567', NOW()),
                                                           ('jane_smith', 'jane.smith@gmail.com', '+36302234567', NOW()),
                                                           ('peter_kovacs', 'peter.kovacs@gmail.com', '+36303234567', NOW()),
                                                           ('maria_szabo', 'maria.szabo@gmail.com', '+36304234567', NOW());

-- ========================================
-- USER AUTH - Jelszavak (BCrypt kódolt)
-- ========================================
-- Jelszó: admin123
-- Jelszó: user123
INSERT INTO user_auth (user_id, password_hash, role_id) VALUES
                                                            (1, '$2a$10$slYQmyNdGzin7olVN3p5Be0DWHtzbqgFmC7ZzD3Z2Z8K5p9C5xWPG', 1),  -- admin_user / admin123
                                                            (2, '$2a$10$slYQmyNdGzin7olVN3p5Be0DWHtzbqgFmC7ZzD3Z2Z8K5p9C5xWPG', 2),  -- john_doe / admin123
                                                            (3, '$2a$10$slYQmyNdGzin7olVN3p5Be0DWHtzbqgFmC7ZzD3Z2Z8K5p9C5xWPG', 2),  -- jane_smith / admin123
                                                            (4, '$2a$10$slYQmyNdGzin7olVN3p5Be0DWHtzbqgFmC7ZzD3Z2Z8K5p9C5xWPG', 2),  -- peter_kovacs / admin123
                                                            (5, '$2a$10$slYQmyNdGzin7olVN3p5Be0DWHtzbqgFmC7ZzD3Z2Z8K5p9C5xWPG', 2);  -- maria_szabo / admin123

-- ========================================
-- REVIEWS - Értékelések
-- ========================================
INSERT INTO reviews (user_id, room_id, rating, comment, created_at) VALUES
                                                                        (2, 3, 5, 'Fantasztikus szoba! Nagyon tiszta és kényelmes. Az ágyon volt egy fürdőköpeny.', NOW()),
                                                                        (3, 5, 4, 'Jó szoba, kicsit zsúfolt volt, de az ár érte megfelel.', NOW()),
                                                                        (4, 1, 5, 'Egyágyas szobák ritkán ilyen jók. Nagyobb mint vártam!', NOW()),
                                                                        (2, 5, 4, 'Hármas szoba jó áron. Ajánlom!', NOW());
