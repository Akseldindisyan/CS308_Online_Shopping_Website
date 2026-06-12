DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- 0. category
CREATE TABLE IF NOT EXISTS category (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL
    );

-- 1. user_entity
CREATE TABLE IF NOT EXISTS user_entity (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120)        NOT NULL,
    surname       VARCHAR(120),
    username      VARCHAR(100) UNIQUE,
    email         VARCHAR(255) UNIQUE,
    password      VARCHAR(255)        NOT NULL,
    date_of_birth DATE,
    country VARCHAR(120),
    city VARCHAR(120),
    street VARCHAR(120),
    postal_code VARCHAR(20),
    role          VARCHAR(20)         NOT NULL DEFAULT 'CUSTOMER'
    CHECK (role IN ('CUSTOMER', 'SALES_MANAGER', 'PRODUCT_MANAGER')),
    tax_id VARCHAR(11),
    address VARCHAR(255),
    nat_id VARCHAR(11)
    );


-- 2. product
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
    image_url         VARCHAR(1055),
    active            boolean,
    warranty_status   VARCHAR(64),
    discount_rate     DOUBLE PRECISION NOT NULL DEFAULT 0
    );

-- 3. cart_entity
CREATE TABLE IF NOT EXISTS cart_entity (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES user_entity(id) ON DELETE SET NULL,
    guest_token VARCHAR(255),
    checked_out BOOLEAN NOT NULL DEFAULT FALSE
    );

-- 4. cart_item_entity
CREATE TABLE IF NOT EXISTS cart_item_entity (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id    UUID NOT NULL REFERENCES cart_entity(id)     ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL DEFAULT 1,
    created_at DATE    DEFAULT CURRENT_DATE,
    updated_at DATE    DEFAULT CURRENT_DATE
    );

-- 5. review
CREATE TABLE IF NOT EXISTS review (
    review_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id              UUID REFERENCES product(product_id),
    user_id                 UUID REFERENCES user_entity(id),
    rating                  DOUBLE PRECISION CHECK (rating >= 0 AND rating <= 5),
    review_comment                 TEXT,
    approved_by_product_man BOOLEAN DEFAULT FALSE,
    product_buy_date        DATE,
    found_this_helpful      INT DEFAULT 0,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at             TIMESTAMP
    );

-- 6. invoice
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES user_entity(id)          ON DELETE SET NULL,
    totalamount DOUBLE PRECISION NOT NULL DEFAULT 0,
    tax_rate    DOUBLE PRECISION,
    created_at  TIMESTAMP DEFAULT NOW(),
    status      VARCHAR(32)
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
    invoice_id  UUID UNIQUE REFERENCES invoice(invoice_id)  ON DELETE CASCADE,
    customer_id UUID REFERENCES user_entity(id)             ON DELETE SET NULL,
    address     VARCHAR(500),
    completed   BOOLEAN   NOT NULL DEFAULT FALSE,
    status      VARCHAR(50),
    created_at  TIMESTAMP DEFAULT NOW()
    );

ALTER TABLE delivery_entity ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE product DROP CONSTRAINT IF EXISTS product_warranty_status_check;
ALTER TABLE product ALTER COLUMN warranty_status TYPE VARCHAR(64);

-- Back-fill addresses for existing sample deliveries (no-op on fresh DBs)
UPDATE delivery_entity SET address = 'Atatürk Mah. Cumhuriyet Cad. No:12, 34000 İstanbul' WHERE id = '88000000-0000-0000-0000-000000000001' AND address IS NULL;
UPDATE delivery_entity SET address = 'Bağcılar Mah. Millet Sok. No:5 D:3, 06000 Ankara'   WHERE id = '88000000-0000-0000-0000-000000000002' AND address IS NULL;
UPDATE delivery_entity SET address = 'Konak Mah. Fevzi Paşa Blv. No:88, 35000 İzmir'     WHERE id = '88000000-0000-0000-0000-000000000003' AND address IS NULL;

-- 9. wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    user_id    UUID NOT NULL REFERENCES user_entity(id)     ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, product_id)
    );
-- 10. refund logic
CREATE TABLE IF NOT EXISTS refund_requests (
                                               refund_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES user_entity(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'UNDECIDED'
    CHECK (status IN ('UNDECIDED', 'ACCEPTED', 'REJECTED')),
    date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS refund_request_items (
                                                    refund_id       UUID NOT NULL REFERENCES refund_requests(refund_id) ON DELETE CASCADE,
    invoice_item_id UUID NOT NULL REFERENCES invoice_item_entity(id) ON DELETE CASCADE,
    PRIMARY KEY (refund_id, invoice_item_id)
    );


-- ============================================================
--  DML: POPULATE TABLES
-- ============================================================

-- ── Categories ───────────────────────────────────────────────
INSERT INTO category (name) VALUES
    ('Laptop'),
    ('Phone'),
    ('Tablet'),
    ('Headphone'),
    ('Camera'),
    ('Printer'),
    ('Accessories')
ON CONFLICT (name) DO NOTHING;

-- ── Users ────────────────────────────────────────────────────
INSERT INTO user_entity (id, name, surname, username, email, password, date_of_birth, role) VALUES
    ('11000000-0000-0000-0000-000000000001', 'Ayşe',   'Kaya',   'ayse.kaya',   'ayse@example.com',    'hashed_pw_1', '1990-03-15', 'CUSTOMER'),
    ('11000000-0000-0000-0000-000000000002', 'Mehmet', 'Demir',  'mehmet.d',    'mehmet@example.com',  'hashed_pw_2', '1985-07-22', 'CUSTOMER'),
    ('11000000-0000-0000-0000-000000000003', 'Elif',   'Şahin',  'elif.sahin',  'elif@example.com',    'hashed_pw_3', '1995-11-05', 'CUSTOMER'),
    ('11000000-0000-0000-0000-000000000020', 'Fixture', 'Customer','customer', 'fixture.customer@example.com', 'customer123', '1992-04-18', 'CUSTOMER'),
    ('11000000-0000-0000-0000-000000000010', 'Ali',    'Yıldız', 'ali.manager', 'ali.mgr@example.com', 'hashed_pw_4', '1980-01-10', 'SALES_MANAGER'),
    ('11000000-0000-0000-0000-000000000011', 'Selin',  'Çelik',  'selin.pm',    'selin.pm@example.com','hashed_pw_5', '1988-06-30', 'PRODUCT_MANAGER')
ON CONFLICT (id) DO NOTHING;


-- ── Products ─────────────────────────────────────────────────
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url, warranty_status, active, discount_rate) VALUES
    ('f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 'USA',     'High performance laptop',    'Distributor A', 'Model X', 1200, 'Laptop A',   0, 'SN12345', 50,  'Laptop',      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFwdG9wfGVufDB8fDB8fHww', 'active', TRUE, 0),
    ('a83a056d-0a25-4265-ab27-cc3100f0858e', 'Japan',   '4K UHD monitor',             'Distributor D', 'Model M', 350,  'Monitor',    0, 'SN98765', 30,  'Accessories', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uaXRvcnxlbnwwfHwwfHx8MA%3D%3D', 'active', TRUE, 0),
    ('44dbfe88-2803-406b-8aa2-a4effe3ee133', 'USA',     'Mechanical keyboard',        'Distributor E', 'Model K', 100,  'Keyboard',   0, 'SN11223', 120, 'Accessories', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D', 'active', TRUE, 0),
    ('565a75e8-1760-45fb-bb59-ae5bed7bf09d', 'China',   'Wireless mouse',             'Distributor F', 'Model S', 50,   'Mouse',      0, 'SN44556', 150, 'Accessories', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91c2V8ZW58MHx8MHx8fDA%3D', 'active', TRUE, 0),
    ('4b444b99-8f97-4463-aaff-0794d686b6d7', 'Japan',   'All-in-one printer',         'Distributor G', 'Model P', 250,  'Printer',    0, 'SN77889', 25,  'Printer',     'https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJpbnRlcnxlbnwwfHwwfHx8MA%3D%3D', 'active', TRUE, 0),
    ('b6ead94d-7ada-4379-b575-4b1ae9104582', 'USA',     '10-inch tablet',             'Distributor H', 'Model T', 400,  'Tablet',     0, 'SN99001', 60,  'Tablets',     'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFwdG9wfGVufDB8fDB8fHww', 'active', TRUE, 0),
    ('2eb5086d-59db-4546-ab2f-fcf6b5b2a639', 'Germany', 'Digital SLR camera',         'Distributor I', 'Model C', 900,  'Camera',     0, 'SN22334', 40,  'Camera',      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fHww', 'active', TRUE, 0),
    ('3bdda48e-66f2-489e-bf4f-5183fd0b7938', 'China',   'Fitness smartwatch',         'Distributor J', 'Model W', 150,  'Smartwatch', 0, 'SN55667', 80,  'Accessories', 'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c21hcnR3YXRjaHxlbnwwfHwwfHx8MA%3D%3D', 'active', TRUE, 0),
    ('6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', 'China',   'Latest smartphone',          'Distributor B', 'Model Y', 800,  'Smartphone', 0, 'SN54321', 100, 'Phone',       'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGhvbmV8ZW58MHx8MHx8fDA%3D', 'active', TRUE, 0),
    ('bff7591d-de8a-4d22-86f2-0a230b8ba15d', 'Germany', 'Noise-cancelling headphones','Distributor C', 'Model H', 200,  'Headphones', 0, 'SN67890', 70,  'Headphone',   'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lfGVufDB8fDB8fHww', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-000000000003', 'Japan',   'Best headphone',              'Distributor A', 'Model B', 8499, 'Headphone B',0, 'SN56789', 80,  'Headphone',   'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lfGVufDB8fDB8fHww', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-000000000005', 'China',   'Curved Monitor',             'Distributor A',  'Model B', 18750,'Monitor B',  0, 'SN56789', 35,  'Accessories', 'https://images.unsplash.com/photo-1666771410140-0573b232426e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fE1vbml0b3J8ZW58MHx8MHx8fDA%3D', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-00000000000a', 'Turkey',  'Out-of-stock fixture product',             'Fixture Distributor', 'Model A', 100, 'Product A', 0, 'FIXTURE-A', 0,  'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/100000054863/100000054863_0_MC/107249459.jpg', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-00000000000b', 'Turkey',  'Single-item-stock fixture product',         'Fixture Distributor', 'Model B', 200, 'Product B', 0, 'FIXTURE-B', 1,  'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/100000058776/100000058776_0_MC/117159602.jpg', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-00000000000c', 'Turkey',  'Multi-item-stock fixture product',          'Fixture Distributor', 'Model C', 300, 'Product C', 0, 'FIXTURE-C', 10, 'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/145062155/145062155_0_MC/81113301.jpg', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-00000000000e', 'Turkey',  'Purchased more than one month ago',         'Fixture Distributor', 'Model E', 400, 'Product E', 0, 'FIXTURE-E', 10, 'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/786294646/786294646_0_MC/63431f49b6214bb599e988791b8bdd43.jpg', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-00000000000f', 'Turkey',  'Purchased less than one month ago',         'Fixture Distributor', 'Model F', 500, 'Product F', 0, 'FIXTURE-F', 10, 'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/100000054846/100000054846_0_MC/113803996.jpg', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-000000000010', 'Turkey',  'Recently purchased processing product',     'Fixture Distributor', 'Model G', 600, 'Product G', 0, 'FIXTURE-G', 10, 'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/780292949/780292949_0_MC/ea0c46afb80f4f1eba05f5f8b0e7dea2.jpg', 'active', TRUE, 0),
    ('33000000-0000-0000-0000-000000000011', 'Turkey',  'Recently purchased in-transit product',     'Fixture Distributor', 'Model H', 700, 'Product H', 0, 'FIXTURE-H', 10, 'Accessories', 'https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/125078434/125078434_0_MC/60698827.jpg', 'active', TRUE, 0)
ON CONFLICT (product_id) DO NOTHING;

-- Product D is intentionally not seeded. It is reserved for creation by a product manager.

-- ── Carts ────────────────────────────────────────────────────
INSERT INTO cart_entity (id, user_id, guest_token, checked_out) VALUES
    ('44000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', NULL,        FALSE),
    ('44000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', NULL,        TRUE),
    ('44000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', NULL,        FALSE),
    ('44000000-0000-0000-0000-000000000004', NULL,                                   'GUEST-XYZ', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ── Cart Items ───────────────────────────────────────────────
INSERT INTO cart_item_entity (id, cart_id, product_id, quantity) VALUES
    ('55000000-0000-0000-0000-000000000001', '44000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000003', 1),
    ('55000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', '44dbfe88-2803-406b-8aa2-a4effe3ee133', 2),
    ('55000000-0000-0000-0000-000000000003', '44000000-0000-0000-0000-000000000002', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 1),
    ('55000000-0000-0000-0000-000000000004', '44000000-0000-0000-0000-000000000003', '6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', 3),
    ('55000000-0000-0000-0000-000000000005', '44000000-0000-0000-0000-000000000004', '565a75e8-1760-45fb-bb59-ae5bed7bf09d', 1)
ON CONFLICT (id) DO NOTHING;

-- ── Reviews ──────────────────────────────────────────────────
INSERT INTO review (review_id, product_id, user_id, rating, review_comment, approved_by_product_man, product_buy_date, found_this_helpful) VALUES
    ('cc000000-0000-0000-0000-000000000001', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', '11000000-0000-0000-0000-000000000001', 4.5, 'This product is super.',                                                                        TRUE,  '2025-01-15', 3),
    ('cc000000-0000-0000-0000-000000000002', '6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', '11000000-0000-0000-0000-000000000002', 4.0, 'This product is bad.',                                                                          FALSE, '2025-02-10', 1),
    ('cc000000-0000-0000-0000-000000000003', 'bff7591d-de8a-4d22-86f2-0a230b8ba15d', '11000000-0000-0000-0000-000000000003', 5.0, 'This is THE MosT aMAZINGGGGGGG ProdUCTTTTT I have ever seennnnnn IN My lifeeee.', TRUE,  '2025-03-01', 7)
ON CONFLICT (review_id) DO NOTHING;

-- ── Invoices ─────────────────────────────────────────────────
INSERT INTO invoice (invoice_id, user_id, totalamount, tax_rate, created_at, status) VALUES
    ('66000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', 54999.00, 0.18, '2025-01-10 14:30:00', 'PENDING'),
    ('66000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 19297.00, 0.18, '2025-02-05 09:15:00', 'PENDING'),
    ('66000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003',  8499.00, 0.18, '2025-03-20 16:00:00', 'PENDING'),
    ('66000000-0000-0000-0000-00000000000e', '11000000-0000-0000-0000-000000000020',   400.00, 0.18, CURRENT_TIMESTAMP - INTERVAL '45 days', 'PENDING'),
    ('66000000-0000-0000-0000-00000000000f', '11000000-0000-0000-0000-000000000020',   500.00, 0.18, CURRENT_TIMESTAMP - INTERVAL '15 days', 'PENDING'),
    ('66000000-0000-0000-0000-000000000010', '11000000-0000-0000-0000-000000000020',   600.00, 0.18, CURRENT_TIMESTAMP - INTERVAL '2 days',  'PENDING'),
    ('66000000-0000-0000-0000-000000000011', '11000000-0000-0000-0000-000000000020',   700.00, 0.18, CURRENT_TIMESTAMP - INTERVAL '1 day',   'PENDING')
ON CONFLICT (invoice_id) DO NOTHING;

-- ── Invoice Items ────────────────────────────────────────────
INSERT INTO invoice_item_entity (id, invoice_id, product_id, quantity, unit_price, total_price) VALUES
    ('77000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 1, 54999.00, 54999.00),
    ('77000000-0000-0000-0000-000000000002', '66000000-0000-0000-0000-000000000002', '44dbfe88-2803-406b-8aa2-a4effe3ee133', 2,  2899.00,  5798.00),
    ('77000000-0000-0000-0000-000000000003', '66000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000005', 1, 13499.00, 13499.00),
    ('77000000-0000-0000-0000-000000000004', '66000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000003', 1,  8499.00,  8499.00),
    ('77000000-0000-0000-0000-00000000000e', '66000000-0000-0000-0000-00000000000e', '33000000-0000-0000-0000-00000000000e', 1,   400.00,   400.00),
    ('77000000-0000-0000-0000-00000000000f', '66000000-0000-0000-0000-00000000000f', '33000000-0000-0000-0000-00000000000f', 1,   500.00,   500.00),
    ('77000000-0000-0000-0000-000000000010', '66000000-0000-0000-0000-000000000010', '33000000-0000-0000-0000-000000000010', 1,   600.00,   600.00),
    ('77000000-0000-0000-0000-000000000011', '66000000-0000-0000-0000-000000000011', '33000000-0000-0000-0000-000000000011', 1,   700.00,   700.00)
ON CONFLICT (id) DO NOTHING;

-- ── Deliveries ───────────────────────────────────────────────
INSERT INTO delivery_entity (id, invoice_id, customer_id, address, completed, status, created_at) VALUES
    ('88000000-0000-0000-0000-000000000001', '66000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', 'Atatürk Mah. Cumhuriyet Cad. No:12, 34000 İstanbul', TRUE,  'COMPLETED',  '2025-01-12 10:00:00'),
    ('88000000-0000-0000-0000-000000000002', '66000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'Bağcılar Mah. Millet Sok. No:5 D:3, 06000 Ankara',   FALSE, 'IN_TRANSIT', '2025-02-06 08:30:00'),
    ('88000000-0000-0000-0000-000000000003', '66000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'Konak Mah. Fevzi Paşa Blv. No:88, 35000 İzmir',     FALSE, 'PENDING',    '2025-03-21 11:00:00'),
    ('88000000-0000-0000-0000-00000000000e', '66000000-0000-0000-0000-00000000000e', '11000000-0000-0000-0000-000000000020', 'Fixture Mah. Test Cad. No:1, Istanbul', TRUE,  'COMPLETED',  CURRENT_TIMESTAMP - INTERVAL '43 days'),
    ('88000000-0000-0000-0000-00000000000f', '66000000-0000-0000-0000-00000000000f', '11000000-0000-0000-0000-000000000020', 'Fixture Mah. Test Cad. No:1, Istanbul', TRUE,  'COMPLETED',  CURRENT_TIMESTAMP - INTERVAL '13 days'),
    ('88000000-0000-0000-0000-000000000010', '66000000-0000-0000-0000-000000000010', '11000000-0000-0000-0000-000000000020', 'Fixture Mah. Test Cad. No:1, Istanbul', FALSE, 'PENDING',    CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('88000000-0000-0000-0000-000000000011', '66000000-0000-0000-0000-000000000011', '11000000-0000-0000-0000-000000000020', 'Fixture Mah. Test Cad. No:1, Istanbul', FALSE, 'IN_TRANSIT', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ── Wishlist ─────────────────────────────────────────────────
INSERT INTO wishlist (user_id, product_id) VALUES
    ('11000000-0000-0000-0000-000000000001', 'f9c5c63d-6bd1-49f2-a3f4-391e080b27a1'),
    ('11000000-0000-0000-0000-000000000001', 'a83a056d-0a25-4265-ab27-cc3100f0858e'),
    ('11000000-0000-0000-0000-000000000002', 'bff7591d-de8a-4d22-86f2-0a230b8ba15d'),
    ('11000000-0000-0000-0000-000000000003', '6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf'),
    ('11000000-0000-0000-0000-000000000003', '44dbfe88-2803-406b-8aa2-a4effe3ee133')
ON CONFLICT (user_id, product_id) DO NOTHING;

-- ── Refunds ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refund_requests (
                                               refund_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES user_entity(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'UNDECIDED'
    CHECK (status IN ('UNDECIDED', 'ACCEPTED', 'REJECTED')),
    date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS refund_request_items (
                                                    refund_id       UUID NOT NULL REFERENCES refund_requests(refund_id) ON DELETE CASCADE,
    invoice_item_id UUID NOT NULL REFERENCES invoice_item_entity(id) ON DELETE CASCADE,
    PRIMARY KEY (refund_id, invoice_item_id)
    );
