# Royal BNF – Royal Bed and Food

**Your Stay. Your Taste. Your Experience.**

Royal BNF is a hotel booking platform that combines accommodation reservations with hotel-prepared regional food experiences. Customers can explore hotels, book rooms, browse regional food menus and order food during their confirmed stay.

The platform connects hotel accommodation and food services in one place, allowing hotels to manage food orders placed by their guests.

## Key Features

### Customer Module
- Customer registration and secure login.
- Browse available hotels and rooms.
- View hotel details and room information.
- Book rooms and manage reservations.
- Browse hotel food menus without logging in.
- Add multiple food items to a cart.
- Place food orders using an eligible confirmed booking.
- View food order history and order status.

### Hotel Owner Module
- Secure hotel owner login.
- View food orders associated with the owner's hotel.
- Monitor food order statuses.
- Accept or reject pending orders.
- Mark accepted orders as served.

## Royal Food Experience

The main differentiator of Royal BNF is its integrated food-ordering experience.

Customers can browse regional food menus offered by individual hotels. Food orders are associated with a confirmed hotel booking rather than a separate restaurant or delivery service.

### Food Ordering Rules
- Customers must be authenticated to place food orders.
- A valid confirmed booking is required.
- The booking must belong to the logged-in customer.
- The selected food items must belong to the same hotel as the booking.
- Food items must be available.
- Multiple food items can be included in one order.
- The serving date must fall within the booking period.
- The backend calculates item totals and the final order amount using database prices.

### Order Status Workflow

`PENDING → ACCEPTED → SERVED`

A hotel owner can also reject a pending order.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Java 17, Spring Boot |
| Database | MySQL 8 |
| ORM | Spring Data JPA, Hibernate |
| Authentication | Spring Security, JWT |
| Password Hashing | BCrypt |
| Backend Build Tool | Maven |
| Frontend Build Tool | npm |

## System Architecture

Royal BNF follows a client-server architecture.

1. React frontend handles the user interface.
2. Spring Boot backend processes REST API requests.
3. Spring Security and JWT handle authentication and authorization.
4. Service classes implement application business rules.
5. Spring Data JPA repositories interact with MySQL.
6. MySQL stores application data.

## Database Design

The application uses MySQL and Spring Data JPA.

Important database entities include:

- Customers
- Hotels
- Hotel Owners
- Rooms
- Bookings
- Food Categories
- Food Items
- Hotel Food Menus
- Food Orders
- Food Order Items

### Multi-Item Food Orders

A food order can contain multiple food-order items.

The parent `food_orders` record stores order-level information such as booking, serving date, instructions, status and total amount.

The child `food_order_items` records store individual menu items, quantities, unit prices and item totals.

This structure allows multiple dishes to be included in one customer order.

## Project Structure

```text
RoyalBNF/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── database/
│   ├── sample-data.sql
│   └── migrations/
├── screenshots/
├── DESIGN.md
└── README.md
```

## Prerequisites

Install the following before running the application:

- Java Development Kit (JDK) 17
- MySQL Server 8
- Node.js and npm
- Git

The backend includes a Maven Wrapper, so a separate Maven installation is not required.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/surajnaikwade-cmyk/RoyalBNF.git
cd RoyalBNF
```

### 2. Configure the Database

Create the MySQL database:

```sql
CREATE DATABASE royal_bnf;
```

Configure the database username, password and JWT secret as environment variables.

PowerShell example:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
$env:JWT_SECRET = "your_base64_encoded_secret"
```

Use your own credentials and a secure Base64-encoded JWT secret. Never commit actual credentials or secrets to GitHub.

**Database note:** Creating an empty database alone does not create the application tables. Use the project's appropriate database schema and sample-data setup. The migration file `V2__multi_item_food_orders.sql` is currently pinned to the test database `royal_bnf_restore_test`; do not execute it against the original `royal_bnf` database.

### 3. Run the Backend

Open a terminal in the backend directory:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend URL:

`http://localhost:8080`

### 4. Run the Frontend

Open another terminal in the frontend directory:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

## Testing

### Backend Tests

From the backend directory:

```powershell
.\mvnw.cmd clean test
```

### Frontend Production Build

From the frontend directory:

```powershell
npm run build
```

## Security

- Customer and hotel-owner authentication.
- Password hashing using BCrypt.
- JWT-based authentication for protected endpoints.
- Role-based access control for hotel-owner operations.
- Customer booking ownership validation.
- Hotel-specific food-order access restrictions.
- Server-side validation of food availability, quantities and prices.
- Database credentials and JWT secrets supplied through environment variables.

## Screenshots

Application screenshots will be included here to demonstrate:

- Homepage and hotel listing.
- Hotel details and room selection.
- Customer registration and login.
- Hotel food menu.
- Multi-item food cart and checkout.
- Customer food order history.
- Hotel-owner order management.

## Project Status

The current project version includes the core hotel booking workflow, integrated regional food ordering, multi-item food orders, customer order history and hotel-owner order management.

The implementation has been tested using the project's test database and manual API and frontend verification.

## Repository

GitHub: https://github.com/surajnaikwade-cmyk/RoyalBNF

---

**Royal BNF – Royal Bed and Food**

*Your Stay. Your Taste. Your Experience.*
