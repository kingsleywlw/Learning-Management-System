# Learning Management System

A full-stack Learning Management System (LMS) built with Next.js, React, TypeScript, MongoDB, and Clerk. The platform provides role-based functionality for students, teachers, and administrators to support course management and online learning workflows.

## Features

- Role-based access for students, teachers, and administrators
- User authentication and management with Clerk
- MongoDB database integration using Mongoose
- REST API architecture with 40+ API endpoints
- Course management functionality
- Course discussion forum
- Threaded comments and discussions
- Forum tag filtering and paginated search
- Calendar functionality
- Responsive user interface

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- DaisyUI

**Backend**
- Next.js API Routes
- MongoDB
- Mongoose

**Authentication**
- Clerk

**Additional Libraries**
- Recharts
- React Big Calendar
- React Calendar
- Lucide React

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kingsleywlw/Learning-Management-System.git
cd Learning-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory and configure the required environment variables.

```env
MONGODB_URI=your_mongodb_connection_string
```

Clerk credentials are also required for authentication. Add the appropriate Clerk environment variables for your Clerk application.

> Do not commit `.env` or `.env.local` files to the repository.

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

```text
actions/       Server-side actions
app/           Application routes, pages, and API endpoints
components/    Reusable UI components
context/       React context providers
db/            Database connection configuration
hooks/         Custom React hooks
models/        MongoDB/Mongoose models
public/        Static assets
types/         TypeScript type definitions
utils/         Utility functions
```

## Security

Sensitive configuration such as database credentials and authentication keys is managed through environment variables. Environment files are excluded from version control through `.gitignore`.

## Project Context

This application was developed as a team project to apply full-stack web development concepts including authentication, role-based access control, REST APIs, database integration, and modern React/Next.js development.