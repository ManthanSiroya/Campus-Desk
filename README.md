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

* Email OTP (Gmail SMTP Integration)
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
* Rate limiting for security (Max 3 OTP requests per 10 mins)

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
EMAIL_USER=your_actual_gmail@gmail.com
EMAIL_PASS=your16digitpassword
```

### Environment Variables

| **Variable** | **Description**                             |
| ------------ | ------------------------------------------- |
| MONGO_URI    | MongoDB Atlas connection string             |
| PORT         | Backend port (Default: 5000)                |
| JWT_SECRET   | Secret used for JWT authentication          |
| EMAIL_USER   | Gmail address used to send OTPs             |
| EMAIL_PASS   | 16-character Gmail App Password (no spaces) |

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
2. Right-click on `index.html` (or `login.html`).
3. Select **Open with Live Server**.

Frontend runs at (port may vary):

```text
http://127.0.0.1:5500
```

# Live Demo

**Frontend**

```text
https://campus-desk-phi.vercel.app
```

**Backend**

```text
https://campus-desk.onrender.com
```

# Authentication

The application uses Email OTP authentication.

The backend is configured to use **Nodemailer with Gmail SMTP**. When a user requests an OTP, the server securely authenticates with the provided `EMAIL_USER` and `EMAIL_PASS` (App Password) and sends a real 6-digit code directly to the user's inbox.

# Design Document

Please refer to [**DESIGN.md**](./DESIGN.md) for:

* Overlap-check logic
* Double-booking race condition discussion
* Authentication persistence after refresh
* Debugging experience

# How you can get OTP

Steps:

1. Visit the live frontend URL: `https://campus-desk-phi.vercel.app` (or run it locally).
2. Enter your Name and a valid Email address on the login screen.
3. Click **Request OTP**.
4. Open your actual email inbox (check the spam folder just in case).
5. Read the 6-digit OTP from the email, enter it on the website, and sign in!

# Demo Video

[Insert your demo video Drive/YouTube link here]

# License

This project was created for educational purposes and hackathon submissions.
