This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# Application Configuration

This document provides the necessary steps to configure and run the login application.

## Setup Instructions

### 1. Create the `.env.local` File

Create a file named `.env.local` and add the following content:

```ini
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=file:./user.db
```

### 2. Generate a Secure Secret Key

Replace `your-secret-here` with a secure key generated using the following command in Command Prompt or PowerShell:

```sh
openssl rand -base64 32
```

Copy and paste the generated key into the `NEXTAUTH_SECRET` field in your `.env.local` file.

### 3. Install Dependencies

Run the following command to install necessary dependencies:

```sh
npm install
```

### 4. Start the Application

Run the following command to start the application:

```sh
npm run dev
```

The application should now be up and running.

---

For any issues, ensure your `.env.local` file is correctly configured and that you have installed all dependencies.



