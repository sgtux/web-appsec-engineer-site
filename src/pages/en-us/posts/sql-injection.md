---
layout: ../../../layouts/PostLayout.astro
title: "SQL Injection: When the Database Obeys the Attacker"
description: "A straightforward guide to SQL Injection — how the vulnerability works, practical exploitation examples, and defenses that actually work."
date: "2024-06-03"
category: "Vulnerabilities"
lang: "en-US"
---

### SQL Injection

SQL Injection is a vulnerability that occurs when an application allows user-supplied input to be embedded into SQL queries without proper validation or sanitization. This lets an attacker manipulate the query to access or modify unauthorized information in the database.

### How Does It Work?

1. **Unsafe User Input:** The application builds SQL queries by concatenating strings directly from user input.
2. **Query Manipulation:** The attacker injects malicious SQL commands into the input.
3. **Impact:**
    - Leakage of sensitive data.
    - Modification or deletion of data.
    - Full control of the database in some cases.

## Vulnerability Example

### Vulnerable Code (JavaScript with Node.js):

```js
const express = require('express');
const mysql = require('mysql');
const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'testdb'
});

app.get('/login', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    // Vulnerable SQL query
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    connection.query(query, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send("Login successful!");
        } else {
            res.send("Invalid credentials!");
        }
    });
});

app.listen(3000);
```

Exploitation:

- Browser input:

```bash
/login?username=admin'--&password=anything
```

- Resulting SQL query:

```bash
SELECT * FROM users WHERE username = 'admin'--' AND password = 'anything';
```

Everything after `--` is ignored, allowing login without a password.

## Fix

### 1. Use Prepared Statements

Prepared statements automatically treat input data as values, preventing them from being interpreted as SQL commands.

Example in Node.js:

```js
app.get('/login', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    // Secure query with parameters
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    connection.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send("Login successful!");
        } else {
            res.send("Invalid credentials!");
        }
    });
});
```

### 2. Validate and Sanitize User Input

Enforce restrictions to ensure data is in the expected format.

```js
const username = req.query.username;
if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(400).send("Invalid username!");
    return;
}
```

### 3. Restrict Database Privileges

- Use database accounts with the least privilege necessary.
- Prevent the application from executing commands like `DROP`, `ALTER`, or `DELETE`.

## Another Example: Data Exfiltration

Malicious input:

```sql
' OR '1'='1'; --
```

Resulting query:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1'; -- AND password = '...';
```

The attack returns all users because `OR '1'='1'` is always true.

## Best Practices for Prevention

1. Use **Prepared Statements** or ORMs (such as Hibernate, Sequelize, etc.).
2. **Escape Input:** Sanitize data with appropriate libraries.
3. **Input Validation:** Accept only expected formats.
4. **Monitor the Database:** Use auditing tools to detect suspicious queries.
5. **Implement Defense in Depth:** Combine multiple layers of protection.

These examples illustrate the potential impact of SQL Injection and how to remediate it.
