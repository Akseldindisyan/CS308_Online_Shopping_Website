

-- 1. user_entity
CREATE TABLE IF NOT EXISTS user_entity (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120)        NOT NULL,
    surname       VARCHAR(120),
    username      VARCHAR(100) UNIQUE,
    email         VARCHAR(255) UNIQUE,
    password      VARCHAR(255)        NOT NULL,
    date_of_birth DATE,
    role          VARCHAR(20)         NOT NULL DEFAULT 'CUSTOMER'
                      CHECK (role IN ('CUSTOMER', 'SALES_MANAGER', 'PRODUCT_MANAGER'))
);

-- 2. address_pool
CREATE TABLE IF NOT EXISTS address_pool (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address    VARCHAR(255) NOT NULL,
    city       VARCHAR(50),
    zip_code   VARCHAR(10)
);

-- 3. address_entity
CREATE TABLE IF NOT EXISTS address_entity (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city        VARCHAR(100),
    street      VARCHAR(255),
    postal_code VARCHAR(20),
    country     VARCHAR(100),
    user_id     UUID NOT NULL REFERENCES user_entity(id) ON DELETE CASCADE
);

-- 4. address_reference_table 
CREATE TABLE IF NOT EXISTS address_reference_table (
    user_id    UUID REFERENCES user_entity(id)          ON DELETE CASCADE,
    address_id UUID REFERENCES address_pool(address_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, address_id)
);

-- 5. product
CREATE TABLE IF NOT EXISTS product (
    product_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name      VARCHAR(255)     NOT NULL,
    product_image     BYTEA,
    rating            DOUBLE PRECISION NOT NULL DEFAULT 0,
    stock             INTEGER          NOT NULL DEFAULT 0,
    model             VARCHAR(128),
    serial_number     VARCHAR(128),
    description       TEXT,
    price             DOUBLE PRECISION NOT NULL,
    distributor_info  VARCHAR(256),
    country_of_origin VARCHAR(64),
    category          VARCHAR(64),
    image_url         VARCHAR(1055)
);

-- 6. cart_entity
CREATE TABLE IF NOT EXISTS cart_entity (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES user_entity(id) ON DELETE SET NULL,
    guest_token VARCHAR(255),
    checked_out BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. cart_item_entity
CREATE TABLE IF NOT EXISTS cart_item_entity (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id    UUID NOT NULL REFERENCES cart_entity(id)     ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL DEFAULT 1,
    created_at DATE    DEFAULT CURRENT_DATE,
    updated_at DATE    DEFAULT CURRENT_DATE
);

-- 8. review
CREATE TABLE IF NOT EXISTS review (
    review_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id              UUID REFERENCES product(product_id),
    user_id                 UUID REFERENCES user_entity(id),
    rating                  DOUBLE PRECISION CHECK (rating >= 0 AND rating <= 5),
    approved_by_product_man BOOLEAN DEFAULT FALSE,
    product_buy_date        DATE,
    found_this_helpful      INT DEFAULT 0,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at             TIMESTAMP
);

-- 9. invoice
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES user_entity(id)          ON DELETE SET NULL,
    address_id  UUID REFERENCES address_pool(address_id) ON DELETE SET NULL,
    totalamount DOUBLE PRECISION NOT NULL DEFAULT 0,
    tax_rate    DOUBLE PRECISION,
    created_at  TIMESTAMP DEFAULT NOW(),
    status      VARCHAR(32)
);

-- 10. invoice_item_entity
CREATE TABLE IF NOT EXISTS invoice_item_entity (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID NOT NULL REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    product_id  UUID REFERENCES product(product_id)          ON DELETE SET NULL,
    quantity    INTEGER          NOT NULL DEFAULT 1,
    unit_price  DOUBLE PRECISION NOT NULL,
    total_price DOUBLE PRECISION NOT NULL
);

-- 11. delivery_entity
CREATE TABLE IF NOT EXISTS delivery_entity (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID UNIQUE REFERENCES invoice(invoice_id)  ON DELETE CASCADE,
    customer_id UUID REFERENCES user_entity(id)             ON DELETE SET NULL,
    address_id  UUID REFERENCES address_entity(id)          ON DELETE SET NULL,
    completed   BOOLEAN   NOT NULL DEFAULT FALSE,
    status      VARCHAR(50),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 12. wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    user_id    UUID NOT NULL REFERENCES user_entity(id)     ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, product_id)
);


-- ============================================================
--  DML: POPULATE TABLES
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
INSERT INTO user_entity (id, name, surname, username, email, password, date_of_birth, role) VALUES
  ('11000000-0000-0000-0000-000000000001', 'Ayşe',   'Kaya',   'ayse.kaya',   'ayse@example.com',    'hashed_pw_1', '1990-03-15', 'CUSTOMER'),
  ('11000000-0000-0000-0000-000000000002', 'Mehmet', 'Demir',  'mehmet.d',    'mehmet@example.com',  'hashed_pw_2', '1985-07-22', 'CUSTOMER'),
  ('11000000-0000-0000-0000-000000000003', 'Elif',   'Şahin',  'elif.sahin',  'elif@example.com',    'hashed_pw_3', '1995-11-05', 'CUSTOMER'),
  ('11000000-0000-0000-0000-000000000010', 'Ali',    'Yıldız', 'ali.manager', 'ali.mgr@example.com', 'hashed_pw_4', '1980-01-10', 'SALES_MANAGER'),
  ('11000000-0000-0000-0000-000000000011', 'Selin',  'Çelik',  'selin.pm',    'selin.pm@example.com','hashed_pw_5', '1988-06-30', 'PRODUCT_MANAGER');

-- ── Address Pool ─────────────────────────────────────────────
INSERT INTO address_pool (address_id, address, city, zip_code) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Bağdat Caddesi No:42',  'İstanbul', '34710'),
  ('a0000000-0000-0000-0000-000000000002', 'Kızılay Mah. 3. Sok',   'Ankara',   '06600'),
  ('a0000000-0000-0000-0000-000000000003', 'Karşıyaka Mah. 5. Cad', 'İzmir',    '35600');

-- ── Address Reference ────────────────────────────────────────
INSERT INTO address_reference_table (user_id, address_id) VALUES
  ('11000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002'),
  ('11000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003');

-- ── Address Entity ───────────────────────────────────────────
INSERT INTO address_entity (id, city, street, postal_code, country, user_id) VALUES
  ('22000000-0000-0000-0000-000000000001', 'İstanbul', 'Bağdat Caddesi No:42',  '34710', 'Türkiye', '11000000-0000-0000-0000-000000000001'),
  ('22000000-0000-0000-0000-000000000002', 'Ankara',   'Kızılay Mah. 3. Sok',   '06600', 'Türkiye', '11000000-0000-0000-0000-000000000002'),
  ('22000000-0000-0000-0000-000000000003', 'İzmir',    'Karşıyaka Mah. 5. Cad', '35600', 'Türkiye', '11000000-0000-0000-0000-000000000003');

-- ── Products ─────────────────────────────────────────────────
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES
  ('f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 'USA',     'High performance laptop',    'Distributor A', 'Model X', 1200, 'Laptop A',   3.2, 'SN12345', 50,  'Laptop',      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFwdG9wfGVufDB8fDB8fHww'),
  ('a83a056d-0a25-4265-ab27-cc3100f0858e', 'Japan',   '4K UHD monitor',             'Distributor D', 'Model M', 350,  'Monitor',    4.6, 'SN98765', 30,  'Accessories', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uaXRvcnxlbnwwfHwwfHx8MA%3D%3D'),
  ('44dbfe88-2803-406b-8aa2-a4effe3ee133', 'USA',     'Mechanical keyboard',        'Distributor E', 'Model K', 100,  'Keyboard',   4.1, 'SN11223', 120, 'Accessories', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D'),
  ('565a75e8-1760-45fb-bb59-ae5bed7bf09d', 'China',   'Wireless mouse',             'Distributor F', 'Model S', 50,   'Mouse',      4.3, 'SN44556', 150, 'Accessories', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91c2V8ZW58MHx8MHx8fDA%3D'),
  ('4b444b99-8f97-4463-aaff-0794d686b6d7', 'Japan',   'All-in-one printer',         'Distributor G', 'Model P', 250,  'Printer',    4.0, 'SN77889', 25,  'Printer',     'https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJpbnRlcnxlbnwwfHwwfHx8MA%3D%3D'),
  ('b6ead94d-7ada-4379-b575-4b1ae9104582', 'USA',     '10-inch tablet',             'Distributor H', 'Model T', 400,  'Laptop B',   4.4, 'SN99001', 60,  'Tablets',     'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFwdG9wfGVufDB8fDB8fHww'),
  ('2eb5086d-59db-4546-ab2f-fcf6b5b2a639', 'Germany', 'Digital SLR camera',         'Distributor I', 'Model C', 900,  'Camera',     4.5, 'SN22334', 40,  'Camera',      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fHww'),
  ('3bdda48e-66f2-489e-bf4f-5183fd0b7938', 'China',   'Fitness smartwatch',         'Distributor J', 'Model W', 150,  'Smartwatch', 4.2, 'SN55667', 80,  'Accessories', 'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c21hcnR3YXRjaHxlbnwwfHwwfHx8MA%3D%3D'),
  ('6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', 'China',   'Latest smartphone',          'Distributor B', 'Model Y', 800,  'Smartphone', 4.7, 'SN54321', 100, 'Phone',       'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGhvbmV8ZW58MHx8MHx8fDA%3D'),
  ('bff7591d-de8a-4d22-86f2-0a230b8ba15d', 'Germany', 'Noise-cancelling headphones','Distributor C', 'Model H', 200,  'Headphones', 4.2, 'SN67890', 70,  'Headphone',   'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lfGVufDB8fDB8fHww'),
  ('33000000-0000-0000-0000-000000000003', 'Japonya', 'Kablosuz ANC kulaklık, 30 saat', 'Sony Türkiye', 'WH1000XM5/B', 8499,  'Sony WH-1000XM5', 4.7, 'SN-003-SWH', 80, 'Headphone',   NULL),
  ('33000000-0000-0000-0000-000000000005', 'Çin',     '27" 4K IPS, USB-C 90W',      'Dell Türkiye',  'U2723D',  18750, 'Dell U2723D', 4.5, 'SN-005-DEL', 35, 'Accessories', NULL);

-- ── Carts ────────────────────────────────────────────────────
INSERT INTO cart_entity (id, user_id, guest_token, checked_out) VALUES
  ('44000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', NULL,        FALSE),
  ('44000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', NULL,        TRUE),
  ('44000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', NULL,        FALSE),
  ('44000000-0000-0000-0000-000000000004', NULL,                                   'GUEST-XYZ', FALSE);

-- ── Cart Items ───────────────────────────────────────────────
INSERT INTO cart_item_entity (id, cart_id, product_id, quantity) VALUES
  ('55000000-0000-0000-0000-000000000001', '44000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000003', 1),
  ('55000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', '44dbfe88-2803-406b-8aa2-a4effe3ee133', 2),
  ('55000000-0000-0000-0000-000000000003', '44000000-0000-0000-0000-000000000002', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 1),
  ('55000000-0000-0000-0000-000000000004', '44000000-0000-0000-0000-000000000003', '6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', 3),
  ('55000000-0000-0000-0000-000000000005', '44000000-0000-0000-0000-000000000004', '565a75e8-1760-45fb-bb59-ae5bed7bf09d', 1);

-- ── Reviews ──────────────────────────────────────────────────
INSERT INTO review (review_id, product_id, user_id, rating, approved_by_product_man, product_buy_date, found_this_helpful) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', '11000000-0000-0000-0000-000000000001', 4.5, TRUE,  '2025-01-15', 3),
  ('cc000000-0000-0000-0000-000000000002', '6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', '11000000-0000-0000-0000-000000000002', 4.0, FALSE, '2025-02-10', 1),
  ('cc000000-0000-0000-0000-000000000003', 'bff7591d-de8a-4d22-86f2-0a230b8ba15d', '11000000-0000-0000-0000-000000000003', 5.0, TRUE,  '2025-03-01', 7);

-- ── Invoices ─────────────────────────────────────────────────
INSERT INTO invoice (invoice_id, user_id, address_id, totalamount, tax_rate, created_at, status) VALUES
  ('66000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 54999.00, 0.18, '2025-01-10 14:30:00', 'PAID'),
  ('66000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 19297.00, 0.18, '2025-02-05 09:15:00', 'PAID'),
  ('66000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',  8499.00, 0.18, '2025-03-20 16:00:00', 'PENDING');

-- ── Invoice Items ────────────────────────────────────────────
INSERT INTO invoice_item_entity (id, invoice_id, product_id, quantity, unit_price, total_price) VALUES
  ('77000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 1, 54999.00, 54999.00),
  ('77000000-0000-0000-0000-000000000002', '66000000-0000-0000-0000-000000000002', '44dbfe88-2803-406b-8aa2-a4effe3ee133', 2,  2899.00,  5798.00),
  ('77000000-0000-0000-0000-000000000003', '66000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000005', 1, 13499.00, 13499.00),
  ('77000000-0000-0000-0000-000000000004', '66000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000003', 1,  8499.00,  8499.00);

-- ── Deliveries ───────────────────────────────────────────────
INSERT INTO delivery_entity (id, invoice_id, customer_id, address_id, completed, status, created_at) VALUES
  ('88000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000002', TRUE,  'DELIVERED',  '2025-01-12 10:00:00'),
  ('88000000-0000-0000-0000-000000000002', '66000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', FALSE, 'IN_TRANSIT', '2025-02-06 08:30:00'),
  ('88000000-0000-0000-0000-000000000003', '66000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', '22000000-0000-0000-0000-000000000003', FALSE, 'PREPARING',  '2025-03-21 11:00:00');

-- ── Wishlist ─────────────────────────────────────────────────
INSERT INTO wishlist (user_id, product_id) VALUES
  ('11000000-0000-0000-0000-000000000001', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1'),
  ('11000000-0000-0000-0000-000000000001', 'a83a056d-0a25-4265-ab27-cc3100f0858e'),
  ('11000000-0000-0000-0000-000000000002', 'bff7591d-de8a-4d22-86f2-0a230b8ba15d'),
  ('11000000-0000-0000-0000-000000000003', '6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf'),
  ('11000000-0000-0000-0000-000000000003', '44dbfe88-2803-406b-8aa2-a4effe3ee133');