# CS308 Online Shopping Website

A comprehensive, full-stack e-commerce platform built with a Spring Boot backend and TypeScript frontend. Developed using Agile SCRUM methodologies, this system supports concurrent sessions and features distinct operational dashboards for Customers, Sales Managers, and Product Managers.

## Tech Stack
* **Backend:** Java, Spring Boot, PostgreSQL
* **Frontend:** TypeScript, Node.js (npm)
* **Architecture:** Web API, concurrent session handling.
* **Methodology:** 2-week Agile SCRUM sprints, unit testing, and active product/sprint backlog management.

## Core Features
* **Customer Portal:** Browse, search, and sort products without an account. Secure checkout features automated stock reduction and PDF invoice generation sent via email. Includes wishlists, 1-5 star ratings, and a 30-day automated refund system.
* **Sales Management:** Execute dynamic discount campaigns with automatic price calculation and wishlist notifications. Access financial reporting dashboards for revenue and profit/loss tracking. Authorize or reject customer refund requests.
* **Product & Delivery Management:** Maintain the inventory database, manage product categories, and moderate customer comments. Process shipments and update order statuses (processing, in-transit, delivered).

## How to Set Up

### 1. Environment Variables (.env)
Create a `.env` file in the `backend/src/` directory with the following variables:
```env
DB_HOST=localhost:5432
DB_USERNAME=postgres
DB_PASS=your_database_password
JWT_SECRET=your_random_secret_string
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
```

### 2. Database Setup
1. Open pgAdmin.
2. Create a new database.
3. Execute the SQL script located at `src/main/java/com/backend/backend/cs308db.sql` via the Query Tool to generate the required tables.

### 3. Backend Execution (IntelliJ IDEA)
1. Open **Run/Debug Configurations**.
2. Create a new **Spring Boot** or **Application** configuration.
3. Set the Main Class to `com.backend.backend.AccessingDataJpaApplication`.
4. Set the Java SDK to **Java 21**.
5. In the "Environment variables" field, click the folder/file icon and select your `backend/src/.env` file.
6. Click **Apply** and **Run**.

### 4. Frontend Execution
Open a new terminal window, navigate to your frontend directory, and execute the following commands:
```bash
npm install
npm run dev
```
