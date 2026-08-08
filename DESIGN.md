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

Back-to-back bookings are allowed.

For example:

| User   | Booking Time  |
| ------ | ------------- |
| User A | 10:00 → 11:00 |
| User B | 11:00 → 12:00 |

These bookings pass successfully because the validation uses strictly greater-than/less-than operators:

```text
<  and  >
```

rather than inclusive operators:

```text
<=  and  >=
```

Therefore, the exact minute one booking ends, the next booking is allowed to begin without triggering an overlap error.

---

## 2. Double-Booking Race Conditions

A race condition could theoretically occur if two students view the same available timeslot on their UI and click the **Book** button at the exact same millisecond.

Because both requests hit the Node.js server simultaneously, the database overlap-check query might return **"available"** for both requests before either request has actually been saved to the database.

This could potentially result in a double booking.

### Production Solution

To handle this in a production environment, I would utilize:

* **MongoDB unique compound indexes**, indexing on both `resourceId` and `timeSlot`
* **Atomic database transactions**

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

## 4. Debugging Challenge: Silent Client-Side Failure

During development, the OTP request button completely stopped working. Clicking it did nothing, and the backend received no API requests.

### Error

By opening the browser's Developer Console, I discovered the following uncaught error:

```text
TypeError: Cannot read properties of null (reading 'value')
```

### Root Cause

I traced the exact point of failure back to my `login.js` file.

The script was attempting to read a `user-name` input field to send to the backend, but that element had not been added to the HTML DOM yet.

As a result, the script crashed immediately **before the network fetch could execute**.

### Solution

I fixed the issue by properly adding the required input element to the HTML:

```html
<input id="user-name">
```

I also wrapped the JavaScript variable declarations in a guard clause:

```javascript
if (!nameElement) return;
```

This safely catches and handles missing DOM elements in the future, preventing the client-side script from crashing before the API request can be executed.
