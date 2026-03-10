# Database Monitoring Dashboard

Welcome to the Database Monitoring Dashboard! This application allows you to monitor your SQL Server and PostgreSQL databases from a single, easy-to-use web interface.

This guide is written for everyone, even if you don't have a lot of programming experience. Follow these steps to get the app running on your own computer or server.

## 📋 Prerequisites

Before you begin, you need to have **Node.js** installed on your computer. Node.js is the engine that runs this application.

1. Go to the [Node.js website](https://nodejs.org/).
2. Download and install the **LTS (Long Term Support)** version for your operating system (Windows, Mac, or Linux).
3. Follow the installation wizard (the default settings are fine).

## 🚀 Getting Started

### 1. Download the Code
Download this entire codebase to your computer and extract the folder if it's in a ZIP file. Open your terminal (Command Prompt or PowerShell on Windows, Terminal on Mac/Linux) and navigate to the folder where you extracted the code.

```bash
cd path/to/your/extracted/folder
```

### 2. Install Dependencies
Once you are inside the project folder in your terminal, run the following command to download all the necessary background packages the app needs to run:

```bash
npm install
```
*(This might take a minute or two depending on your internet speed.)*

### 3. Configure Your Databases
You need to tell the app which databases you want to monitor. 

1. Open the folder and navigate to `public/config.yaml`.
2. Open `config.yaml` in any text editor (like Notepad, TextEdit, or VS Code).
3. You will see a list of servers. You can edit this file to match your actual database servers.

Here is an example of how to add a SQL Server and a PostgreSQL server:

```yaml
servers:
  - type: sqlserver
    label: SQL Server
    instances:
      - name: My-Production-DB
        host: 192.168.1.100       # The IP address or hostname of your database
        port: 1433                # The port (1433 is default for SQL Server)
        user: sa                  # Your database username
        password: MySecretPassword! # Your database password
        options:
          encrypt: false
          trustServerCertificate: true

  - type: postgres
    label: PostgreSQL
    instances:
      - name: My-Postgres-DB
        host: localhost
        port: 5432
        user: postgres
        password: MySecretPassword!
```

*Note: Make sure the indentation (spaces at the beginning of the lines) stays consistent, as YAML files are sensitive to spaces!*

### 4. Start the Application

Now that your databases are configured, you can start the app!

Run this command in your terminal:

```bash
npm run dev
```

You should see a message saying the server is running. Open your web browser (Chrome, Firefox, Safari, etc.) and go to:

👉 **http://localhost:3000**

You should now see the dashboard!

---

## 🔒 Security Tip: Hiding Passwords (Optional)

If you don't want to save your passwords in plain text inside the `config.yaml` file, you can use Environment Variables instead.

1. Remove the `password: ...` line from your `config.yaml`.
2. Create a new file named `.env` in the root folder of the project (the same folder as `package.json`).
3. Add your passwords to the `.env` file using this format: `DB_PASS_` + `YOUR_INSTANCE_NAME` (replace hyphens with underscores and make it uppercase).

For example, if your instance name in `config.yaml` is `My-Production-DB`, your `.env` file should look like this:

```env
DB_PASS_MY_PRODUCTION_DB=MySecretPassword!
```
The app will automatically find the password securely!

---

## 📦 Deploying for Production (Advanced)

If you want to run this app permanently on a server (instead of just testing it on your computer), it's best to "build" it first so it runs faster.

1. Build the app:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```
The app will now be running efficiently on port 3000.

## ❓ Troubleshooting

- **"'tsx' is not recognized..."**: This error happens if the background packages haven't been installed yet. Make sure you run `npm install` in your terminal first before running `npm run dev`.
- **"npm is not recognized"**: You need to install Node.js (see Prerequisites) or restart your terminal.
- **"Instance not found" or Database Connection Errors**: Double-check your `config.yaml` file. Ensure the host, port, username, and password are correct, and that your database server allows external connections.
- **Port 3000 is already in use**: If another app is using port 3000, you'll need to stop that app first.
