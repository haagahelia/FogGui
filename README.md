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
- **Material-UI:** For building the user interface.
- **FOG API:** For interacting with the FOG server.

### 2.3 Dependencies
Key dependencies include:
- `next`
- `react`
- `@mui/material`
- `@mui/x-data-grid`
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
cd foggui

# Install dependencies
pnpm install
```

- Create a `.env.local` file in the root directory and configure it (see Configuration Guide).

## 4. Configuration Guide

### 4.1 Configuration Parameters
The `.env.local` file should include:
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

## 5. Usage Guide

### 5.1 User Interface Overview
The application includes the following pages:
- **Dashboard:** Overview of tasks and hosts.
- **Groups:** Manage groups and multicast sessions.
- **Images:** View and manage images.
- **Hosts:** Manage individual hosts.

### 5.2 User Authentication
The application uses **NextAuth** for secure login. Ensure `NEXTAUTH_SECRET` is configured correctly.

### 5.3 Core Functionality
- **Group Management:** Create, update, and delete groups.
- **Image Deployment:** Assign images to hosts and start deployment tasks.
- **Task Monitoring:** View and manage active tasks.

### 5.4 Advanced Features
- **Multicast Sessions:** Start multicast deployments for groups.
- **Dummy Data Mode:** Use dummy data for testing by setting:
  ```env
  NEXT_PUBLIC_USE_DUMMY_DATA=true
  ```

### 5.5 Troubleshooting
Common Issues:
- **Missing `.env.local` file:** Ensure it exists and is correctly configured.
- **API errors:** Verify FOG API credentials and server connectivity.

## 6. API Documentation

### 6.1 Endpoints
- `GET /api/groups`: Fetch all groups.
- `POST /api/groups`: Create a new group.
- `PUT /api/groups`: Update group details.
- `POST /api/images`: Assign an image to a host.

### 6.2 Request and Response Formats
- **Request:** JSON format.
- **Response:** JSON format with success or error messages.

### 6.3 Authentication and Authorization
All API requests require:
- `fog-api-token`
- `fog-user-token`

## 7. Database Schema

### 7.1 Entity-Relationship Diagram
The database includes tables for users, tasks, and groups.

### 7.2 Table Definitions
- **Users:** Stores user credentials and session data.
- **Tasks:** Tracks active and completed tasks.
- **Groups:** Stores group information.

### 7.3 Relationships and Constraints
- **Tasks** are linked to **groups** and **hosts**.

## 8. Testing

### 8.1 Test Plan
- Test API endpoints using tools like Postman.
- Verify UI functionality manually.

### 8.2 Test Cases
- Create a group and verify it appears in the list.
- Start a multicast session and check the task status.

### 8.3 Test Results
- Document test results for future reference.

## 9. Deployment

### 9.1 Deployment Process
```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### 9.2 Known Issues and Limitations
- Dummy data mode is for testing only and should not be used in production.

## 10. Support and Maintenance

### 10.1 Troubleshooting Guide
- **Issue:** Application not starting.  
  **Solution:** Check `.env.local` configuration and ensure dependencies are installed.

### 10.2 Frequently Asked Questions (FAQs)
- **Q:** How do I reset my API credentials?  
  **A:** Regenerate them in the FOG Management Panel.

## 11. Glossary

### 11.1 Terms and Definitions
- **FOG:** Free Open-Source Ghost, a computer imaging solution.
- **Multicast:** Deploying an image to multiple devices simultaneously.
- **NextAuth:** Authentication library for Next.js.
```