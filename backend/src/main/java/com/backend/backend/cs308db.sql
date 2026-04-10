CREATE TABLE "User" (
    User_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(120) NOT NULL,
    Surname VARCHAR(120),
    Address_ID UUID,
    Password VARCHAR(128) NOT NULL,
    Birth_Date DATE
);

CREATE TABLE Product (
    Product_ID SERIAL PRIMARY KEY,
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
    Order_ID SERIAL PRIMARY KEY,
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
);b

CREATE TABLE Wishlist (
    User_ID UUID REFERENCES "User"(User_ID),
    Product_ID INT REFERENCES Product(Product_ID),
    PRIMARY KEY (User_ID, Product_ID)
);

INSERT INTO Product (Product_Name, Rating, Stock, Model, Serial_Number, Description, Price, Distributor_Info, Country_of_Origin)
VALUES
    ('Laptop A',    4.5, 50,  'Model X', 'SN12345', 'High performance laptop',       1200.0, 'Distributor A', 'USA'),
    ('Smartphone',  4.7, 100, 'Model Y', 'SN54321', 'Latest smartphone',              800.0, 'Distributor B', 'China'),
    ('Headphones',  4.2, 70,  'Model H', 'SN67890', 'Noise-cancelling headphones',    200.0, 'Distributor C', 'Germany'),
    ('Monitor',     4.6, 30,  'Model M', 'SN98765', '4K UHD monitor',                 350.0, 'Distributor D', 'Japan'),
    ('Keyboard',    4.1, 120, 'Model K', 'SN11223', 'Mechanical keyboard',            100.0, 'Distributor E', 'USA'),
    ('Mouse',       4.3, 150, 'Model S', 'SN44556', 'Wireless mouse',                  50.0, 'Distributor F', 'China'),
    ('Printer',     4.0, 25,  'Model P', 'SN77889', 'All-in-one printer',             250.0, 'Distributor G', 'Japan'),
    ('Laptop B',    4.4, 60,  'Model T', 'SN99001', '10-inch tablet',                 400.0, 'Distributor H', 'USA'),
    ('Camera',      4.5, 40,  'Model C', 'SN22334', 'Digital SLR camera',             900.0, 'Distributor I', 'Germany'),
    ('Smartwatch',  4.2, 80,  'Model W', 'SN55667', 'Fitness smartwatch',             150.0, 'Distributor J', 'China');
