-- ============================================================
--  DDL: CREATE TABLES
-- ============================================================

-- 1. user_entity
CREATE TABLE IF NOT EXISTS user_entity (
                                           id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100)        NOT NULL,
    surname       VARCHAR(100)        NOT NULL,
    username      VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password      VARCHAR(255)        NOT NULL,
    date_of_birth DATE,
    role          VARCHAR(20)         NOT NULL DEFAULT 'CUSTOMER'
    CHECK (role IN ('CUSTOMER', 'SALES_MANAGER', 'PRODUCT_MANAGER'))
    );

-- 2. address_entity
CREATE TABLE IF NOT EXISTS address_entity (
                                              id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city        VARCHAR(100),
    street      VARCHAR(255),
    postal_code VARCHAR(20),
    country     VARCHAR(100),
    user_id     UUID NOT NULL REFERENCES user_entity(id) ON DELETE CASCADE
    );

-- 3. product
CREATE TABLE IF NOT EXISTS product (
                                       product_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name      VARCHAR(255)     NOT NULL,
    rating            DOUBLE PRECISION NOT NULL DEFAULT 0,
    stock             INTEGER          NOT NULL DEFAULT 0,
    model             VARCHAR(100),
    serial_number     VARCHAR(100),
    description       TEXT,
    price             DOUBLE PRECISION NOT NULL,
    distributor_info  VARCHAR(255),
    country_of_origin VARCHAR(100)
    );

-- 4. cart_entity
CREATE TABLE IF NOT EXISTS cart_entity (
                                           id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES user_entity(id) ON DELETE SET NULL,
    guest_token VARCHAR(255),
    checked_out BOOLEAN NOT NULL DEFAULT FALSE
    );

-- 5. cart_item_entity
CREATE TABLE IF NOT EXISTS cart_item_entity (
                                                id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id    UUID NOT NULL REFERENCES cart_entity(id)      ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id)  ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL DEFAULT 1
    );

-- 6. invoice
CREATE TABLE IF NOT EXISTS invoice (
                                       invoice_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES user_entity(id) ON DELETE SET NULL,
    totalamount DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
    );

-- 7. invoice_item_entity
CREATE TABLE IF NOT EXISTS invoice_item_entity (
                                                   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID NOT NULL REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    product_id  UUID REFERENCES product(product_id)          ON DELETE SET NULL,
    quantity    INTEGER          NOT NULL DEFAULT 1,
    unit_price  DOUBLE PRECISION NOT NULL,
    total_price DOUBLE PRECISION NOT NULL
    );

-- 8. delivery_entity
CREATE TABLE IF NOT EXISTS delivery_entity (
                                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID UNIQUE REFERENCES invoice(invoice_id)   ON DELETE CASCADE,
    customer_id UUID REFERENCES user_entity(id)              ON DELETE SET NULL,
    address_id  UUID REFERENCES address_entity(id)           ON DELETE SET NULL,
    completed   BOOLEAN   NOT NULL DEFAULT FALSE,
    status      VARCHAR(50),
    created_at  TIMESTAMP DEFAULT NOW()
    );

-- 9. wishlist
CREATE TABLE IF NOT EXISTS wishlist (
                                        user_id    UUID NOT NULL REFERENCES user_entity(id)     ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, product_id)
    );


-- ============================================================
--  DML: POPULATE TABLES
-- ============================================================

-- Users  (prefix: 11000000)
INSERT INTO user_entity (id, name, surname, username, email, password, date_of_birth, role) VALUES
                                                                                                ('11000000-0000-0000-0000-000000000001', 'Ayse',   'Kaya',   'ayse.kaya',   'yunusoglumut@gmail.com',    'hashed_pw_1', '1990-03-15', 'CUSTOMER'),
                                                                                                ('11000000-0000-0000-0000-000000000002', 'Mehmet', 'Demir',  'mehmet.d',    'yunusoglumut@gmail.com',  'hashed_pw_2', '1985-07-22', 'CUSTOMER'),
                                                                                                ('11000000-0000-0000-0000-000000000003', 'Elif',   'Sahin',  'elif.sahin',  'yunusoglumut@gmail.com',    'hashed_pw_3', '1995-11-05', 'CUSTOMER'),
                                                                                                ('11000000-0000-0000-0000-000000000010', 'Ali',    'Yildiz', 'ali.manager', 'yunusoglumut@gmail.com', 'hashed_pw_4', '1980-01-10', 'SALES_MANAGER'),
                                                                                                ('11000000-0000-0000-0000-000000000011', 'Selin',  'Celik',  'selin.pm',    'yunusoglumut@gmail.com','hashed_pw_5', '1988-06-30', 'PRODUCT_MANAGER');

-- Addresses  (prefix: 22000000)
INSERT INTO address_entity (id, city, street, postal_code, country, user_id) VALUES
                                                                                 ('22000000-0000-0000-0000-000000000001', 'Istanbul', 'Bagdat Caddesi No:42',  '34710', 'Turkiye', '11000000-0000-0000-0000-000000000001'),
                                                                                 ('22000000-0000-0000-0000-000000000002', 'Ankara',   'Kizilay Mah. 3. Sok',   '06600', 'Turkiye', '11000000-0000-0000-0000-000000000002'),
                                                                                 ('22000000-0000-0000-0000-000000000003', 'Izmir',    'Karsiyaka Mah. 5. Cad', '35600', 'Turkiye', '11000000-0000-0000-0000-000000000003'),
                                                                                 ('22000000-0000-0000-0000-000000000004', 'Istanbul', 'Nisantasi Abdi Ipekci',  '34367', 'Turkiye', '11000000-0000-0000-0000-000000000001');

-- Products  (prefix: 33000000)
INSERT INTO product (product_id, product_name, rating, stock, model, serial_number, description, price, distributor_info, country_of_origin) VALUES
                                                                                                                                                 ('33000000-0000-0000-0000-000000000001', 'MacBook Pro 14',        4.8,  50, 'MBP14-M3',    'SN-001-MPB', 'Apple M3 Pro, 18 GB RAM, 512 GB SSD',   54999.00, 'iDepo Elektronik',   'USA'),
                                                                                                                                                 ('33000000-0000-0000-0000-000000000002', 'Samsung Galaxy S24',    4.6, 120, 'SM-S921B',    'SN-002-SGS', '6.2 AMOLED, 256 GB, 12 GB RAM',         27999.00, 'Samsung Turkiye',    'South Korea'),
                                                                                                                                                 ('33000000-0000-0000-0000-000000000003', 'Sony WH-1000XM5',       4.7,  80, 'WH1000XM5/B', 'SN-003-SWH', 'Wireless ANC headphones, 30hr battery',  8499.00, 'Sony Turkiye',       'Japan'),
                                                                                                                                                 ('33000000-0000-0000-0000-000000000004', 'Logitech MX Master 3S', 4.9, 200, 'MX-M3S',      'SN-004-LGT', 'Silent click, 8000 DPI, USB-C',          2899.00, 'Logitech Dist.',     'Switzerland'),
                                                                                                                                                 ('33000000-0000-0000-0000-000000000005', 'Dell U2723D Monitor',   4.5,  35, 'U2723D',      'SN-005-DEL', '27 inch 4K IPS, USB-C 90W, KVM switch', 18750.00, 'Dell Turkiye',       'China'),
                                                                                                                                                 ('33000000-0000-0000-0000-000000000006', 'Kindle Paperwhite 5',   4.4, 150, 'KPW5-11G',    'SN-006-KND', '11th gen, 8 GB, waterproof, no ads',     2199.00, 'Amazon Turkiye',     'USA');

-- Carts  (prefix: 44000000)
INSERT INTO cart_entity (id, user_id, guest_token, checked_out) VALUES
                                                                    ('44000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', NULL,        FALSE),
                                                                    ('44000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', NULL,        TRUE),
                                                                    ('44000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', NULL,        FALSE),
                                                                    ('44000000-0000-0000-0000-000000000004', NULL,                                   'GUEST-XYZ', FALSE);

-- Cart Items  (prefix: 55000000)
INSERT INTO cart_item_entity (id, cart_id, product_id, quantity) VALUES
                                                                     ('55000000-0000-0000-0000-000000000001', '44000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000003', 1),
                                                                     ('55000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000004', 2),
                                                                     ('55000000-0000-0000-0000-000000000003', '44000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000001', 1),
                                                                     ('55000000-0000-0000-0000-000000000004', '44000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000006', 3),
                                                                     ('55000000-0000-0000-0000-000000000005', '44000000-0000-0000-0000-000000000004', '33000000-0000-0000-0000-000000000002', 1);

-- Invoices  (prefix: 66000000)
INSERT INTO invoice (invoice_id, user_id, totalamount, created_at) VALUES
                                                                       ('66000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', 54999.00, '2025-01-10 14:30:00'),
                                                                       ('66000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 19297.00, '2025-02-05 09:15:00'),
                                                                       ('66000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003',  8499.00, '2025-03-20 16:00:00');

-- Invoice Items  (prefix: 77000000)
INSERT INTO invoice_item_entity (id, invoice_id, product_id, quantity, unit_price, total_price) VALUES
                                                                                                    ('77000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001', 1, 54999.00, 54999.00),
                                                                                                    ('77000000-0000-0000-0000-000000000002', '66000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000004', 2,  2899.00,  5798.00),
                                                                                                    ('77000000-0000-0000-0000-000000000003', '66000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000005', 1, 13499.00, 13499.00),
                                                                                                    ('77000000-0000-0000-0000-000000000004', '66000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000003', 1,  8499.00,  8499.00);

-- Deliveries  (prefix: 88000000)
INSERT INTO delivery_entity (id, invoice_id, customer_id, address_id, completed, status, created_at) VALUES
                                                                                                         ('88000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000002', TRUE,  'DELIVERED',  '2025-01-12 10:00:00'),
                                                                                                         ('88000000-0000-0000-0000-000000000002', '66000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', FALSE, 'IN_TRANSIT', '2025-02-06 08:30:00'),
                                                                                                         ('88000000-0000-0000-0000-000000000003', '66000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', '22000000-0000-0000-0000-000000000003', FALSE, 'PREPARING',  '2025-03-21 11:00:00');

-- Wishlist
INSERT INTO wishlist (user_id, product_id) VALUES
                                               ('11000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001'),
                                               ('11000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000005'),
                                               ('11000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000003'),
                                               ('11000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000002'),
                                               ('11000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000004');