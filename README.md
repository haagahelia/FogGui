# Technical Documentation for FogGUI

## 1. Introduction

### 1.1 Purpose

The purpose of this project is to provide a user-friendly interface for managing FOG server tasks, such as deploying images, managing hosts, and creating multicast sessions. It simplifies interactions with the FOG API through a modern web application.

### 1.2 Scope

This application is designed for IT administrators and technicians who use FOG servers for imaging and managing devices. It provides features like group management, image deployment, and task monitoring.

### 1.3 Audience

This documentation is intended for:

- IT administrators setting up and maintaining the application.
- Developers contributing to the project.
- End-users interacting with the application for FOG server management.

## 2. System Overview

### 2.1 Architecture

The application is built using the following architecture:

- **Frontend:** Next.js (React-based framework).
- **Backend:** API routes in Next.js for server-side logic.
- **Database:** SQLite for local data storage.
- **FOG Server:** External service for managing imaging tasks.

### 2.2 Technologies Used

- **Node.js:** JavaScript runtime for server-side development.
- **Next.js:** Framework for building React applications with server-side rendering.
- **pnpm:** Fast and efficient package manager.
- **Tailwind css:** For building the user interface.
- **FOG API:** For interacting with the FOG server.

### 2.3 Dependencies

Key dependencies include:

- `next`
- `react`
- `fogproject`
- `sqlite3`
- `next-auth`

## 3. Installation Guide

### 3.1 Prerequisites

- **Node.js:** Install the latest LTS version from [https://nodejs.org](https://nodejs.org).
- **pnpm:** Install globally using:

```bash
npm install -g pnpm
```

### 3.2 System Requirements

- **Operating System:** Windows, macOS, or Linux.
- **Node.js version:** 16 or higher.
- **Disk Space:** At least 1GB of free disk space.

### 3.3 Installation Steps

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd FogGui

# Install dependencies
pnpm install
```

- Create a `.env` file in the root directory and configure it (see Configuration Guide).

## 4. Configuration Guide

### 4.1 Configuration Parameters

The `.env` file should include:

```
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_USE_DUMMY_DATA=false
FOG_API_URL=https://your-fog-server/api
FOG_API_USER_KEY=your-user-key
FOG_API_TOKEN=your-api-token
NEXT_PUBLIC_PRIMARY_DISK_1=primary-disk-1-path
NEXT_PUBLIC_PRIMARY_DISK_2=primary-disk-2-path
```

### 4.2 Environment Setup

Generate a secure `NEXTAUTH_SECRET`:

- **Windows (PowerShell):**
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Mac/Linux:**
  ```bash
  openssl rand -hex 32
  ```

Replace `your-secret-here` in `.env.local` with the generated key.

### 4.3 External Services Integration

Obtain FOG API credentials from the FOG Management Panel:

- **Base URL:** Found in Settings or API Configuration.
- **User Key:** Found in User Settings or API Access.
- **API Token:** Found in Security or API Tokens.

### 4.4 First Login

After initialization, the system will create a sqlite user database and its first user.

```
username: admin
password: admin
```

**After the first login, you must change the password immediately.**

## 5. Usage Guide

### 5.1 User Interface Overview

The application includes the following pages:

- **Dashboard:** Select Group, Image, Primary Disk, Schedule (WIP) for multicast. View current scheduled tasks and hosts active tasks for selected Group.

### 5.2 User Authentication

The application uses **NextAuth** for secure login. Ensure `NEXTAUTH_SECRET` is configured correctly.

### 5.3 Core Functionality

- **Multicast Management:** Create and view multicast tasks

## 6. Project Structure

```
FogGui/
├── public/         # Static assets and mock data
├── src/
│ ├── app/          # Next.js pages and API routes
│ │ ├── page.tsx    # Login page
│ │ ├── layout.tsx  # Root layout
│ │ ├── admin/      # Admin pages
│ │ ├── dashboard/  # Main dashboard
│ │ ├── userview/   # User view
│ │ └── api/        # Backend API endpoints
│ │     ├── auth/   # Authentication
│ │     ├── hosts/  # Host management
│ │     ├── images/ # Image management
│ │     ├── groups/ # Group management
│ │     ├── tasks/  # Task management
│ │     └── actions/ # FOG actions (multicast, etc.)
│ │
│ ├── components/   # Reusable React components
│ ├── hooks/        # Custom React hooks
│ ├── lib/          # Core utilities (auth, db, helper functions, error handler functions)
│ ├── services/     # API service layer
│ ├── types/        # TypeScript type definitions
│ └── styles/       # Global styles
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 7. API Documentation

| Method     | Endpoint                           | Description                            | Required Parameters                                                    |
| ---------- | ---------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| **GET**    | `/api/groups`                      | Fetch all groups                       | -                                                                      |
| **GET**    | `/api/groupassociations`           | Fetch all group-to-host associations   | -                                                                      |
| **GET**    | `/api/hosts`                       | Fetch all hosts                        | -                                                                      |
| **GET**    | `/api/images`                      | Fetch all images                       | -                                                                      |
| **GET**    | `/api/tasks`                       | Fetch all tasks                        | -                                                                      |
| **GET**    | `/api/tasks/active`                | Fetch active tasks                     | -                                                                      |
| **GET**    | `/api/actions/list/tasktype`       | Fetch available task types             | -                                                                      |
| **GET**    | `/api/actions/tests`               | Test endpoint for FOG API connectivity | -                                                                      |
| **GET**    | `/api/actions/multicast/sessions`  | Fetch active multicast sessions        | -                                                                      |
| **GET**    | `/api/actions/multicast/scheduled` | Fetch scheduled multicast tasks        | -                                                                      |
| **GET**    | `/api/users`                       | Fetch all local users                  | -                                                                      |
| **GET**    | `/api/auth/[...nextauth]`          | NextAuth handler endpoint              | -                                                                      |
| **POST**   | `/api/create-account`              | Create a local user account            | `username`, `password`                                                 |
| **POST**   | `/api/change-password`             | Change a local user's password         | `username`, `currentPassword`, `newPassword`                           |
| **POST**   | `/api/actions/multicast`           | Start or schedule multicast            | `groupID`, `imageID`, `kernelDevice`<br>Optional: `scheduledStartTime` |
| **POST**   | `/api/auth/[...nextauth]`          | NextAuth sign-in/session POST handler  | Handled by NextAuth                                                    |
| **DELETE** | `/api/actions/multicast`           | Cancel an active multicast session     | `sessionID`                                                            |
| **DELETE** | `/api/actions/multicast/scheduled` | Cancel a scheduled multicast task      | `scheduledTaskID`                                                      |

## 8. Deployment

### 8.1 Deployment Process

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## 9. Support and Maintenance

### 9.1 Troubleshooting Guide

- **Issue:** Application not starting.  
  **Solution:** Check `.env` configuration and ensure dependencies are installed.

### 9.2 Frequently Asked Questions (FAQs)

- **Q:** How do I reset my API credentials?  
  **A:** Regenerate them in the FOG Management Panel.
