---
layout: ../../../layouts/PostLayout.astro
title: "Cross-Site Request Forgery"
description: "When a malicious site makes your browser act against you."
date: "2024-06-03"
category: "Vulnerabilities"
lang: "en-US"
---

# Cross-Site Request Forgery

CSRF is a vulnerability that allows an attacker to trick an authenticated user into performing unintended actions on a web application where they are logged in. This happens because browsers automatically send authentication cookies with requests, even when those requests originate from a malicious site.

## How Does It Work?

1. The user logs in to an application (e.g., an online banking site).
2. The attacker tricks the user into visiting a malicious site or clicking a specially crafted link.
3. That link contains a malicious request targeting the legitimate application, using the user's session cookies.
4. The user's browser sends the request to the application as if it were legitimate, since authentication cookies are included automatically.

## CSRF Vulnerability Example

### Vulnerable Scenario

Backend code (Node.js with Express):

```js
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/transfer', (req, res) => {
    const { amount, toAccount } = req.body;

    // Performs the transfer directly
    if (req.isAuthenticated) {
        // Transfer logic here
        res.send(`Transfer of ${amount} to ${toAccount} completed successfully.`);
    } else {
        res.status(403).send("Unauthorized.");
    }
});

app.listen(3000);
```

### Exploitation

The attacker can create a malicious page with a hidden form:

```html
<html>
<body>
    <form action="http://bank.com/transfer" method="POST">
        <input type="hidden" name="amount" value="10000">
        <input type="hidden" name="toAccount" value="123456">
        <script>
            document.forms[0].submit();
        </script>
    </form>
</body>
</html>
```

When the logged-in user visits this page, the browser automatically sends the session cookie and the transfer is executed.

## CSRF Fixes

### 1. CSRF Tokens

A CSRF token is a unique value generated on the server and tied to the user's session. It must be included in every request that modifies server state.

Example with CSRF token (Express + csurf):

```js
const csrf = require('csurf');
const express = require('express');
const app = express();

// Configure the CSRF middleware
const csrfProtection = csrf({ cookie: true });
app.use(require('cookie-parser')());
app.use(express.urlencoded({ extended: true }));

// Route to display the form with the CSRF token
app.get('/transfer', csrfProtection, (req, res) => {
    res.send(`
        <form action="/transfer" method="POST">
            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
            <input type="text" name="amount" placeholder="Amount">
            <input type="text" name="toAccount" placeholder="Account">
            <button type="submit">Transfer</button>
        </form>
    `);
});

// Route to process the transfer
app.post('/transfer', csrfProtection, (req, res) => {
    const { amount, toAccount } = req.body;
    res.send(`Transfer of ${amount} to ${toAccount} completed successfully.`);
});

app.listen(3000);
```

The `_csrf` token is validated automatically by the middleware.

### 2. Verify Request Origin

Validate the `Origin` and `Referer` headers to ensure the request came from a legitimate page.

```js
app.post('/transfer', (req, res) => {
    const origin = req.get('Origin');
    if (origin !== 'http://bank.com') {
        return res.status(403).send("Unauthorized origin.");
    }

    // Proceed with transfer logic
    res.send("Transfer completed.");
});
```

**Limitation:** This can be bypassed in older or misconfigured browsers.

### 3. Use Safe HTTP Methods for Requests

- State-changing operations must use `POST`, `PUT`, or `DELETE` — never `GET`.
- Browsers do not allow forms to submit `POST` requests automatically without explicit user interaction.

### 4. Configure Cookies with the SameSite Flag

Set session cookies to `SameSite`, restricting them to requests originating from the same domain.

```js
app.use(require('cookie-session')({
    name: 'session',
    secret: 'secret-key',
    cookie: {
        sameSite: 'Strict', // or 'Lax'
        httpOnly: true,
        secure: true
    }
}));
```

## Best Practices Summary

1. Always use CSRF tokens in applications that perform state-changing operations.
2. Validate `Origin` and `Referer` headers to identify suspicious requests.
3. Configure cookies with the `SameSite` and `HttpOnly` flags.
4. Use safe methods like `POST` for sensitive operations.

With these fixes in place, you can mitigate CSRF risks and protect your application against malicious cross-site requests.
