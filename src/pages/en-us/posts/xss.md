---
layout: ../../../layouts/PostLayout.astro
title: "Cross-Site Scripting (XSS): The Classic That Never Gets Old"
description: "Understand what XSS is, how it works in practice, its real-world impact, and how to write code that is not vulnerable to this type of attack."
date: "2024-06-10"
category: "Vulnerabilities"
lang: "en-US"
---

# Cross-Site Scripting (XSS)

Imagine you're browsing a shopping website and someone left a comment on a product page. The comment was submitted through a text field on the site itself. Without you noticing, sensitive information stored in your browser was sent to an unknown server. This happened because the comment contained malicious code that the browser interpreted as a regular JavaScript script.

This type of attack is called Cross-Site Scripting, or XSS, and it can be used to steal sensitive information — such as tokens, passwords, and cookies — or even to alter the behavior of a site, redirecting users to fake pages.

This vulnerability exists because the site fails to properly validate user-supplied data. Instead of displaying the comment as plain text, the site ends up executing the malicious code embedded in it. XSS can enable many dangerous actions: theft of personal data, malware propagation, and even large-scale attacks such as phishing.

## How Does It Work?

1. **Malicious Input:** The attacker injects malicious code into an input field or URL of a vulnerable application.
2. **Browser Execution:** The malicious code is delivered to other users' browsers as part of the web page.
3. **Impact:**
    - Theft of cookies, session tokens, or sensitive data.
    - Redirection to malicious sites.
    - Modification of the page's interface or content.

## Types of XSS

1. **Reflected:** The malicious script is sent in the request and reflected directly in the response without validation.
2. **Stored:** The script is stored on the server (e.g., in a database) and executed every time the page is loaded.
3. **DOM-Based:** The script is executed entirely on the client side by manipulating the Document Object Model (DOM).

## Prevention

1. **Sanitization and Validation:** Restrict and clean user input.
2. **Output Escaping:** Convert special characters into HTML entities.
3. **Use Safe APIs:** Avoid unsafe APIs like `innerHTML` and prefer alternatives like `textContent`.

**XSS is one of the most common web vulnerabilities recognized by the [OWASP](https://owasp.org/www-community/attacks/xss/) community and is included in the Injection category (A03) of the [OWASP Top 10 (2021)](https://owasp.org/Top10/A03_2021-Injection/).**

## Examples of Flaws and Fixes in Different Languages

### Reflected XSS Flaw in Java

Consider a web application that includes user data directly in the response without validation or sanitization.

```java
// Java controller using Servlets
import javax.servlet.http.*;

public class XSSExample extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        response.setContentType("text/html");
        response.getWriter().println("<h1>Hello, " + name + "!</h1>");
    }
}

// If the attacker sends name=<script>alert('XSS')</script>, the browser will execute the malicious script.
```

### Possible Fixes

1. **Sanitize Output:** Use libraries like [OWASP Java Encoder](https://owasp.org/www-project-java-encoder/):

```java
import org.owasp.encoder.Encode;

public class SecureXSSExample extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        response.setContentType("text/html");
        response.getWriter().println("<h1>Hello, " + Encode.forHtml(name) + "!</h1>");
    }
}
```

2. **Validate Input** using Regex or libraries like Hibernate Validator to accept only valid values.

```java
if (!name.matches("[a-zA-Z0-9 ]+")) {
    throw new IllegalArgumentException("Invalid name");
}
```

## JavaScript Examples

Consider a system where comments are saved and displayed without sanitization.

Backend code:

```js
const express = require('express');
const app = express();

let comments = [];

app.use(express.urlencoded({ extended: true }));

app.post('/comment', (req, res) => {
    comments.push(req.body.comment); // Stored without sanitization
    res.send("Comment added!");
});

app.get('/comments', (req, res) => {
    res.send(`
        <h1>Comments:</h1>
        ${comments.map(c => `<p>${c}</p>`).join('')}
    `);
});

// An attacker can submit a comment like <script>alert('XSS')</script>,
// which will execute for every user who visits the page.
```

### Fix in JavaScript

1. **Sanitize Output** using libraries like DOMPurify to clean data before rendering.

```js
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

app.get('/comments', (req, res) => {
    res.send(`
        <h1>Comments:</h1>
        ${comments.map(c => `<p>${purify.sanitize(c)}</p>`).join('')}
    `);
});
```

2. **Manual Escaping:** Convert dangerous characters into HTML entities.

```js
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.get('/comments', (req, res) => {
    res.send(`
        <h1>Comments:</h1>
        ${comments.map(c => `<p>${escapeHtml(c)}</p>`).join('')}
    `);
});
```

3. **Use Safe Templating Libraries:** Frameworks like React or Angular automatically escape content, preventing XSS:

```js
const CommentList = ({ comments }) => (
    <div>
        {comments.map((comment, index) => (
            <p key={index}>{comment}</p> // React escapes automatically
        ))}
    </div>
);
```

## General Best Practices

- **Never trust user input:** Always validate and sanitize.
- **Escape data when rendering:** Use language- or framework-specific tools.
- **Use trusted libraries:**
    - Java: OWASP Java Encoder.
    - JavaScript: DOMPurify or modern frameworks like React, Angular, and Vue.js.
- **Be careful with DOM APIs:** Manipulations like **innerHTML** are dangerous. Prefer safe APIs like **textContent**:

```js
element.textContent = userInput;
```
