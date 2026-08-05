# Billora Backend Documentation

## Project Overview

Billora is a billing and business management application with a backend built on:

- Next.js
- TypeScript
- Prisma ORM
- MySQL

The backend supports billing, inventory, sales, accounting, cash flow, GST management, reporting, and role-based access control.

## Architecture

The backend architecture includes:

- Next.js API routes
- Prisma ORM for database access
- MySQL as the persistent data store

## Setup

1. Install dependencies:

```bash
bun install
```

2. Configure environment variables in `.env`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/billora"
```

3. Run Prisma migrations:

```bash
bunx prisma migrate dev
```

4. Generate Prisma Client:

```bash
bunx prisma generate
```

5. Seed the database:

```bash
bunx prisma db seed
```

## Authentication

The project uses Prisma with MySQL for authentication, including:

- bcrypt password hashing
- JWT authentication
- HTTP-only cookies

## Role-based Access

Implemented roles include:

- Owner
- Admin
- User
- Delivery

Each role has access to different application modules and permissions.

## Database Models

Key models include:

- `User`
- `Role`
- `Company`
- `Product`
- `Invoice`
- `Expense`
- `VendorPayment`
- `ProductionPlan`
- `ProductionIn`
- `ProductionOut`
- `Wastage`
- `Whatsapp` templates and balance models

## Notes

- Prisma is the main ORM layer between the application and MySQL.
- Use MySQL Workbench or another client to inspect the `billora` database.
- This README focuses on backend setup and core architecture.

## Permission Model

Purpose:

Stores available application modules.

Examples:

```
Dashboard
Billing
Inventory
Reports
Accounting
Cash Flow
```

---

## RolePermission Model

Purpose:

Maps roles with allowed modules.

Example:

```
Owner
 |
 |
Dashboard
Billing
Inventory
Reports
```

---

## LoginHistory Model

Purpose:

Tracks user login activity.

Stores:

```
userId
loginTime
status
```

---

# Files Created

## Prisma

```
prisma/schema.prisma
```

Purpose:

Database models and relationships.

---

```
prisma/seed.ts
```

Purpose:

Creates initial:

- Roles
- Permissions
- Users
- Role mappings

---

## Database Connection

File:

```
src/lib/prisma.ts
```

Purpose:

Creates Prisma Client singleton.

---

## Authentication Logic

File:

```
src/lib/auth.ts
```

Implemented:

- Password hashing
- JWT creation
- JWT verification
- Cookie handling

---

## Login API

File:

```
src/app/api/auth/login/route.ts
```

Responsibilities:

- Receive username/password
- Validate user
- Check password
- Get role
- Get permissions
- Create token
- Save login history

---

## Logout API

File:

```
src/app/api/auth/logout/route.ts
```

Responsibilities:

- Remove authentication cookie
- Logout user

---

## Middleware

File:

```
src/middleware.ts
```

Responsibilities:

- Protect private routes
- Check JWT token
- Redirect unauthenticated users
- Attach user information

---

# Login API Response

Example:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "owner",
    "role": "Owner"
  },
  "permissions": ["Dashboard", "Billing", "Inventory"]
}
```

---

# Frontend Integration

Login now supports:

```
Owner Login
Admin Login
User Login
Delivery Login
```

Sidebar navigation is filtered based on permissions.

---

# Role Based Navigation

Flow:

```
Login
 |
 |
Get Role
 |
 |
Get Permissions
 |
 |
Filter Sidebar
 |
 |
Show Allowed Modules Only
```

---

# Current Completed Backend Modules

## Authentication

Status:

Completed ✅

## Role Management

Status:

Completed ✅

## Permission Management

Status:

Completed ✅

## Database Connection

Status:

Completed ✅

## Prisma Setup

Status:

Completed ✅

---

# Current Database Status

Synced:

```
Prisma Schema ✅
Migration History ✅
MySQL Database ✅
MySQL Workbench ✅
```

---

# Next Backend Development Plan

## 1. GST Master

Will include:

- GST Percentage
- CGST
- SGST
- IGST
- Custom GST Rates
- Future GST changes support

## 2. Company Settings

Will include:

- Company Name
- GST Number
- State Code
- Tax Mode

GST Modes:

```
GST Visible

GST Included Hidden

Without GST
```

## 3. Customer Master

Will include:

- Customer details
- GST Number
- State Code

## 4. Product Master

Will include:

- Product details
- Price
- GST Mapping
- Stock

## 5. Billing Module

Will include:

- Invoice creation
- GST calculation
- CGST/SGST calculation
- IGST calculation
- Tax hidden mode
- No GST mode

## 6. Inventory Module

## 7. Cash Flow Module

## 8. Accounting Module

## 9. Reports Module

---

# Development Rules

For every new backend module:

1. Update Prisma schema

2. Create migration

```
bunx prisma migrate dev --name module_name
```

3. Generate Prisma client

```
bunx prisma generate
```

4. Update seed data if required

5. Verify tables in MySQL Workbench

6. Create API routes

7. Connect frontend

---

# Backend Status

Billora backend foundation is completed.

The system is now ready for business modules to be built on top of the existing authentication and database architecture.
