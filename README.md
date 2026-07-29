# Billora Backend Documentation

## Project Overview

Billora is a billing and business management application built with:

- Next.js
- TypeScript
- Prisma ORM
- MySQL Database
- MySQL Workbench

The backend is designed to support multiple business types with features like:

- Billing
- Inventory
- Sales
- Accounting
- Cash Flow
- GST Management
- Reports
- User Role Management

---

# Backend Architecture

```
Frontend (Next.js)
        |
        |
API Routes
        |
        |
Prisma ORM
        |
        |
MySQL Database
        |
        |
MySQL Workbench
```

Prisma acts as the database layer between the application and MySQL.

---

# Database Setup

## Database Name

```
billora
```

## Database Tool

MySQL Workbench

## ORM

Prisma

## Prisma Commands Used

Install Prisma:

```
bun add prisma @prisma/client
```

Initialize Prisma:

```
bunx prisma init
```

Migration:

```
bunx prisma migrate dev
```

Generate Prisma Client:

```
bunx prisma generate
```

Seed Database:

```
bunx prisma db seed
```

---

# Environment Configuration

File:

```
.env
```

Database connection:

```
DATABASE_URL="mysql://username:password@localhost:3306/billora"
```

---

# Authentication System

Authentication has been implemented using:

- Prisma
- MySQL
- bcrypt password hashing
- JWT authentication
- HTTP Only Cookies

---

# Authentication Flow

```
User Login
    |
    |
Username + Password
    |
    |
Login API
    |
    |
Check User in MySQL
    |
    |
Verify Password
    |
    |
Find User Role
    |
    |
Fetch Permissions
    |
    |
Create JWT Token
    |
    |
Set Authentication Cookie
    |
    |
Redirect User
```

---

# User Roles Implemented

Current roles:

## Owner

Access:

```
All Modules
```

---

## Admin

Access:

```
Dashboard
Billing
View Bill
Inventory
Master
Reports
Production
Sales
WhatsApp
Events
Cash Flow
Accounting
```

---

## User

Restricted Access:

```
Dashboard
Billing
View Bill
Reports
```

---

## Delivery

Restricted Access:

```
Dashboard
View Bill
```

---

# Database Models Created

## User Model

Purpose:

Stores application users.

Fields:

```
id
username
password
name
roleId
createdAt
updatedAt
```

---

## Role Model

Purpose:

Stores user roles.

Example:

```
Owner
Admin
User
Delivery
```

---

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

# Current Progress

```
Authentication          ✅
Role Management         ✅
Permission System       ✅
Prisma Setup            ✅
MySQL Connection        ✅

GST Master              Pending
Company Setup           Pending
Customer Master         Pending
Product Master          Pending
Billing Backend         Pending
Inventory Backend      Pending
Accounting Backend     Pending
```

---

# Backend Status

Billora backend foundation is completed.

The system is now ready for business modules to be built on top of the existing authentication and database architecture.
