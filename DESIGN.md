# Campus Desk — System Design Document

> This document explains the architectural decisions, logic, and debugging processes behind the Campus Desk application.

---

## 1. Overlap-Check Logic & Back-to-Back Bookings

To prevent double-booking, the backend checks if a requested time slot overlaps with any existing approved bookings for that specific resource.

The logic validates two conditions simultaneously:

```text
new booking start time < existing booking end time

                       AND

new booking end time > existing booking start time
```

### Back-to-Back Bookings

Back-to-back bookings are explicitly allowed.

**For example:**

| **User** | **Booking Time** |
| -------- | ---------------- |
| User A   | 10:00 → 11:00    |
| User B   | 11:00 → 12:00    |

These bookings pass successfully because the validation utilizes strictly greater-than/less-than operators (`<` and `>`), rather than inclusive operators (`<=` and `>=`).

Therefore, the exact minute one booking ends, the next booking is allowed to begin without triggering an overlap error.

---

## 2. Double-Booking Race Conditions

A race condition could theoretically occur if two students view the same available timeslot on their UI and click the **Book** button at the exact same millisecond.

Because both requests hit the Node.js server simultaneously, the database overlap-check query might return **"available"** for both requests before either request has actually been saved to the database. This could potentially result in a double booking.

### Production Solution

To handle this in a production environment, I would utilize:

* **MongoDB unique compound indexes:** Indexing on both `resourceId` and `timeSlot`.
* **Atomic database transactions:** Executing the read and write as a single operation.

This guarantees that the database explicitly locks the time block during the write operation, accepting the first request and safely rejecting the second request with a conflict error.

---

## 3. Authentication State After a Hard Refresh

The application maintains authentication statelessly using **JSON Web Tokens (JWT)**.

When a user successfully logs in via their OTP:

1. The server generates and sends back a secure JWT.
2. The frontend client receives the token.
3. The token is persistently stored in the browser's `localStorage`.

### After a Hard Refresh

When the user performs a hard refresh, the Vanilla JavaScript immediately checks `localStorage` upon initialization.

If a valid token exists:

1. The application recognizes that the user is still authenticated.
2. The token is automatically attached to the `Authorization` header.
3. Subsequent API requests include the token.
4. The backend continuously verifies the user's identity.

This allows the user to remain authenticated without having to log in again after refreshing the page.

---

## 4. Debugging Challenge: Production Email OTP Delivery

During deployment, the Email OTP request route successfully triggered on the frontend without errors, but users were not receiving any authentication emails in their actual inboxes.

### Error / Symptom

There were no explicit crashes in the server logs. Instead, the backend was quietly logging test links:

```text
Preview your OTP email here: https://ethereal.email/message/...
```

### Root Cause

The initial codebase utilized **Nodemailer with Ethereal Email**. Ethereal is a mock SMTP service designed exclusively for local testing. It intercepts outbound emails and generates fake, local-only web inboxes instead of routing messages to external public email addresses (e.g., `@gmail.com` or `@yahoo.com`). When deployed to Render, the live backend was still capturing the OTPs internally rather than physically sending them.

### Solution

To fix this for the production environment, I transitioned the Nodemailer configuration to a real SMTP provider.

1. I generated a **16-character Google App Password** to bypass standard 2FA restrictions for automated apps.
2. I stored the credentials securely in Render's Environment Variables (`EMAIL_USER` and `EMAIL_PASS`).
3. I updated the backend transporter configuration in `auth.js` to route through Gmail:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

This successfully connected the deployed application to a live mail server, allowing it to instantly deliver OTPs to real user inboxes.
