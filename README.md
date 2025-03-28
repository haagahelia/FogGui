# Login Application Configuration

This document provides the necessary steps to configure and run the login application.

## Setup Instructions

### 1. Create the `.env.local` File

Create a file named `.env.local` and add the following content:

```ini
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=file:./user.db
NEXT_PUBLIC_FOG_API_BASE_URL=your-base-url-here
NEXT_PUBLIC_FOG_API_USER_KEY=your-user-key-here
NEXT_PUBLIC_FOG_API_TOKEN=your-api-key-here
```

### 2. Generate a Secure Secret Key

To generate a secure key for `NEXTAUTH_SECRET`, follow the steps for your operating system:

#### **Windows (PowerShell) – No Installation Needed**
1. Open **PowerShell**.
2. Run the following command:

   ```powershell
   [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

This will generate a 32-byte random string encoded in Base64.

#### **Windows (PowerShell) – Using OpenSSL**
If OpenSSL is already installed, you can use:

   ```powershell
   openssl rand -base64 32
   ```

#### **Mac/Linux (Terminal)**
1. Open **Terminal**.
2. Run the following command:

   ```sh
   openssl rand -base64 32
   ```

#### **Add the Generated Key to `.env.local`**
1. Copy the generated key.
2. Open your `.env.local` file and replace `your-secret-here` with the copied key:

   ```ini
   NEXTAUTH_SECRET=paste-your-generated-key-here
   ```

This ensures secure authentication for your application.

### 3. Retrieve FOG API Credentials

To obtain the necessary FOG API credentials, follow these steps:

#### Finding `NEXT_PUBLIC_FOG_API_BASE_URL`
1. Log in to your FOG Management Panel.
2. Navigate to **Settings** or **API Configuration**.
3. Locate the **Base URL** for the API and copy it.
4. Paste it into the `NEXT_PUBLIC_FOG_API_BASE_URL` field in your `.env.local` file.

#### Finding `NEXT_PUBLIC_FOG_API_USER_KEY`
1. In the FOG Management Panel, go to **User Settings** or **API Access**.
2. Find your **User API Key** (it may be labeled as `FOG_API_USER_KEY` or similar).
3. Copy the key and paste it into the `NEXT_PUBLIC_FOG_API_USER_KEY` field in your `.env.local` file.

#### Finding `NEXT_PUBLIC_FOG_API_TOKEN`
1. In the FOG Management Panel, go to **Security** or **API Tokens**.
2. Generate a new API Token if one does not already exist.
3. Copy the token and paste it into the `NEXT_PUBLIC_FOG_API_TOKEN` field in your `.env.local` file.

### 4. Install Dependencies

Run the following command to install necessary dependencies:

```sh
npm install
```

### 5. Start the Application

Run the following command to start the application:

```sh
npm run dev
```

The application should now be up and running.
=======
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
