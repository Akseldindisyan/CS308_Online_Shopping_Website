CREATE TABLE IF NOT EXISTS "User" (
    User_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(120) NOT NULL,
    Surname VARCHAR(120),
    Address_ID UUID,
    Password VARCHAR(128) NOT NULL,
    Birth_Date DATE
);

CREATE TABLE IF NOT EXISTS "Product" (
    Product_ID UUID PRIMARY KEY,
    Product_Name VARCHAR(128) NOT NULL,
    Product_Image BYTEA,
    Rating DOUBLE PRECISION,
    Stock INT DEFAULT 0,
    Model VARCHAR(128),
    Serial_Number VARCHAR(128),
    Description TEXT,
    Price DOUBLE PRECISION NOT NULL,
    Distributor_Info VARCHAR(256),
    Country_of_Origin VARCHAR(64)
);

CREATE TABLE "Order" (
    Order_ID UUID PRIMARY KEY,
    Order_Place_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Is_Arrived BOOLEAN DEFAULT FALSE,
    Order_Arrival_Time TIMESTAMP
);

CREATE TABLE Order_Item (
    Product_ID UUID REFERENCES Product(Product_ID),
    Order_ID UUID REFERENCES "Order"(Order_ID),
    Count INT DEFAULT 1,
    Discount NUMERIC(5,2),
    PRIMARY KEY (Product_ID, Order_ID)
);

CREATE TABLE Review (
    Review_ID UUID PRIMARY KEY,
    Product_ID UUID REFERENCES Product(Product_ID),
    User_ID UUID REFERENCES "User"(User_ID),
    Rating DOUBLE PRECISION CHECK (Rating >= 0 AND Rating <= 5),
    Approved_By_Product_Man BOOLEAN DEFAULT FALSE,
    Product_Buy_Date DATE,
    Found_This_Helpful INT DEFAULT 0,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Approved_At TIMESTAMP
);

CREATE TABLE Address_Pool (
    Address_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Address VARCHAR(255) NOT NULL,
    City VARCHAR(50),
    Zip_Code VARCHAR(10)
);


CREATE TABLE Address_Reference_Table (
    User_ID UUID REFERENCES "User"(User_ID) ON DELETE CASCADE,
    Address_ID UUID REFERENCES Address_Pool(Address_ID) ON DELETE CASCADE,
    PRIMARY KEY (User_ID, Address_ID)
);

CREATE TABLE Invoice (
    Invoice_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Order_ID UUID REFERENCES "Order"(Order_ID),
    User_ID UUID REFERENCES "User"(User_ID),
    Address_ID UUID REFERENCES Address_Pool(Address_ID),
    TotalAmount INT,
    Tax_Rate DOUBLE PRECISION,
    Created_At DATE DEFAULT CURRENT_DATE,
    Status VARCHAR(32)
);

CREATE TABLE CartItemEntity (
    User_ID UUID REFERENCES "User"(User_ID),
    Product_ID UUID REFERENCES Product(Product_ID),
    Amount INT DEFAULT 1,
    Created_At DATE DEFAULT CURRENT_DATE,
    Updated_At DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (User_ID, Product_ID)
);

CREATE TABLE Wishlist (
    User_ID UUID REFERENCES "User"(User_ID),
    Product_ID UUID REFERENCES Product(Product_ID),
    PRIMARY KEY (User_ID, Product_ID)
);
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('f9c5c63d-6bd1-49f2-a3f4-391e080b27a1', 'USA', 'High performance laptop', 'Distributor A', 'Model X', 1200, 'Laptop A', 3.2, 'SN12345', 50, 'Laptop', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFwdG9wfGVufDB8fDB8fHww');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('a83a056d-0a25-4265-ab27-cc3100f0858e', 'Japan', '4K UHD monitor', 'Distributor D', 'Model M', 350, 'Monitor', 4.6, 'SN98765', 30, 'Accessories', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uaXRvcnxlbnwwfHwwfHx8MA%3D%3D');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('44dbfe88-2803-406b-8aa2-a4effe3ee133', 'USA', 'Mechanical keyboard', 'Distributor E', 'Model K', 100, 'Keyboard', 4.1, 'SN11223', 120, 'Accessories', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('565a75e8-1760-45fb-bb59-ae5bed7bf09d', 'China', 'Wireless mouse', 'Distributor F', 'Model S', 50, 'Mouse', 4.3, 'SN44556', 150, 'Accessories', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91c2V8ZW58MHx8MHx8fDA%3D');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('4b444b99-8f97-4463-aaff-0794d686b6d7', 'Japan', 'All-in-one printer', 'Distributor G', 'Model P', 250, 'Printer', 4, 'SN77889', 25, 'Printer', 'https://images.unsplash.com/photo-1650094980833-7373de26feb6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJpbnRlcnxlbnwwfHwwfHx8MA%3D%3D');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('b6ead94d-7ada-4379-b575-4b1ae9104582', 'USA', '10-inch tablet', 'Distributor H', 'Model T', 400, 'Laptop B', 4.4, 'SN99001', 60, 'Tablets', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFwdG9wfGVufDB8fDB8fHww');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('2eb5086d-59db-4546-ab2f-fcf6b5b2a639', 'Germany', 'Digital SLR camera', 'Distributor I', 'Model C', 900, 'Camera', 4.5, 'SN22334', 40, 'Camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fHww');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('3bdda48e-66f2-489e-bf4f-5183fd0b7938', 'China', 'Fitness smartwatch', 'Distributor J', 'Model W', 150, 'Smartwatch', 4.2, 'SN55667', 80, 'Accessories', 'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c21hcnR3YXRjaHxlbnwwfHwwfHx8MA%3D%3D');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('6ad3ef9e-a5b8-4d12-a864-7f12dbc92bbf', 'China', 'Latest smartphone', 'Distributor B', 'Model Y', 800, 'Smartphone', 4.7, 'SN54321', 100, 'Phone', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGhvbmV8ZW58MHx8MHx8fDA%3D');
INSERT INTO public.product (product_id, country_of_origin, description, distributor_info, model, price, product_name, rating, serial_number, stock, category, image_url) VALUES ('bff7591d-de8a-4d22-86f2-0a230b8ba15d', 'Germany', 'Noise-cancelling headphones', 'Distributor C', 'Model H', 200, 'Headphones', 4.2, 'SN67890', 70, 'Headphone', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lfGVufDB8fDB8fHww');

