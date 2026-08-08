# CampusDesk

CampusDesk is a full-stack campus resource booking system that allows students to reserve campus facilities such as seminar halls, labs, conference rooms, auditoriums, and sports facilities. It includes role-based authentication, booking conflict detection, and an admin dashboard for resource and booking management.

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Backend

* Node.js
* Express.js
* Mongoose

### Database

* MongoDB (Atlas or Local)

### Authentication

* Email OTP (Ethereal Email for development)
* JWT (JSON Web Tokens)

---

## Features

### Student

* Login using Email OTP
* Browse available campus resources
* Search and filter resources
* View resource schedules
* Book available time slots
* Prevent overlapping bookings
* View and cancel personal bookings

### Admin

* Separate Admin Login
* Add resources
* Edit resources
* Delete resources
* View all bookings
* Cancel bookings
* Filter bookings by resource, status, and date

### System

* Role-based authentication
* Booking conflict detection
* Rate limiting for security (Max 3 OTP requests per 15 mins)

---

# Project Structure

```text
CampusDesk
│
├── client
│   ├── css/
│   ├── js/
│   └── *.html
│
├── server
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
│
├── DESIGN.md
└── README.md
```

# Installation

Clone the repository:

```bash
git clone https://github.com/ManthanSiroya/Campus-Desk
cd Campus-Desk
```

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

*No installation required (Vanilla HTML/CSS/JS).*

# Environment Variables

Create a `.env` file inside the **server** folder (you can copy `.env.example`).

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/campus_desk
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
```

### Environment Variables

| **Variable** | **Description**                    |
| ------------ | ---------------------------------- |
| MONGO_URI    | MongoDB Atlas connection string    |
| PORT         | Backend port (Default: 5000)       |
| JWT_SECRET   | Secret used for JWT authentication |

> **Note**
>
> Nodemailer is configured to use Ethereal Email for development. Test accounts are generated automatically on the fly, so no email credentials are required in the `.env` file.

# Database Setup & Seeding

Populate the database with sample resources to get started.

```bash
cd server
node seed.js
```

# Run the Project

## Start Backend

```bash
cd server
node server.js
```

Backend runs at:

```text
http://localhost:5000
```

## Start Frontend

Because the frontend is built with Vanilla HTML/JS, it can be served using any local web server.

**Using VS Code Live Server (Recommended):**

1. Open the `client` folder in VS Code.
2. Right-click on `login.html`.
3. Select **Open with Live Server**.

Frontend runs at (port may vary):

```text
http://127.0.0.1:5500
```

# Live Demo

**Frontend**

```text
[Insert your frontend deployment link here]
```

**Backend**

```text
[Insert your backend deployment link here]
```

# Authentication

The application uses Email OTP authentication.

Development mode uses **Ethereal Email**:

When an OTP is requested, the backend automatically generates a temporary test email server and catches the email.

For production deployments, replace the Ethereal configuration in `server/routes/auth.js` with a real SMTP provider (e.g., Gmail App Passwords, SendGrid, or Resend).

# Design Document

Please refer to [**DESIGN.md**](./DESIGN.md) for:

* Overlap-check logic
* Double-booking race condition discussion
* Authentication persistence after refresh
* Debugging experience

# How you can get OTP

Steps:

1. Open the project locally in your code editor. Installation steps given above.
2. Start Backend:

```bash
cd server
npm start
```

3. Start Frontend:

   Open `client/login.html` with VS Code Live Server.

4. Enter your Name and Email on the login screen and click **Request OTP**.

5. Check your backend terminal (Node console). You will see a message like this:

   `🔗 Preview your OTP email here: https://ethereal.email/message/...`

6. `Ctrl + Click` that link in your terminal to open the fake inbox in your browser.

7. Read the 6-digit OTP from the email, enter it on the website, and sign in!

# Demo Video

[Insert your demo video Drive/YouTube link here]

# License

This project was created for educational purposes and hackathon submissions.
