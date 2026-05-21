---
layout: ../../../layouts/PostLayout.astro
title: "SQL Injection: When the Database Obeys the Attacker"
description: "A direct guide to SQL Injection — how the vulnerability works, practical exploitation examples, and the defenses that actually work."
date: "2024-06-03"
category: "Vulnerabilities"
lang: "en-US"
---

## What is SQL Injection?

**SQL Injection (SQLi)** is a vulnerability that allows an attacker to interfere with the SQL queries that an application makes to its database. When user inputs are interpolated directly into queries without proper handling, the database cannot distinguish data from commands — and the attacker gains control over the query's logic.

It is one of the oldest vulnerabilities and is still widely exploited. OWASP consistently keeps it among the top threats to web application security.

---

## How It Works

Consider a login system with the following query:

```sql
SELECT * FROM users WHERE username = 'INPUT' AND password = 'INPUT';
```

With legitimate inputs, the logic works as expected. But if the username field accepts the value:

```
' OR '1'='1
```

The resulting query becomes:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...';
```

The condition `'1'='1'` is always true — the attacker authenticates without valid credentials.

---

## Types of SQL Injection

### In-band SQLi

The injection result is displayed directly in the HTTP response. This is the easiest type to exploit.

- **Error-based**: database error messages reveal structure and data
- **UNION-based**: the attacker appends a `UNION SELECT` to extract data from other tables

```sql
-- UNION-based: extracting system users
' UNION SELECT username, password, NULL FROM admin_users--
```

### Blind SQLi

The application does not display the query result, but the attacker infers information from its behavior:

- **Boolean-based**: the response varies depending on whether the condition is true or false
- **Time-based**: uses functions like `SLEEP()` to deduce data from response time

```sql
-- Time-based: if the first letter of the database name is 'a', wait 5 seconds
' AND IF(SUBSTRING(database(),1,1)='a', SLEEP(5), 0)--
```

### Out-of-band SQLi

Exfiltrates data through external channels (DNS, HTTP) — useful when in-band and blind approaches aren't viable.

---

## Real-World Impact

Depending on the database user's permissions and server configuration, SQL Injection may allow:

- **Authentication bypass**: administrative access without credentials
- **Full exfiltration**: dump of all tables — users, passwords, sensitive data
- **Data modification**: arbitrary UPDATE or DELETE on records
- **Privilege escalation**: if the database user has elevated permissions
- **OS command execution**: via `xp_cmdshell` (SQL Server) or `INTO OUTFILE` (MySQL)
- **Internal pivoting**: access to the internal network from the database server

> In 2009, the Heartland Payment Systems attack — via SQL Injection — resulted in the breach of over 130 million credit card records. Estimated damages reached hundreds of millions of dollars.

---

## How to Prevent

### 1. Prepared Statements (Parameterized Queries)

This is the primary and most effective defense. The database receives the SQL command and the data separately — data is never interpreted as code.

**PHP + PDO:**
```php
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
$stmt->execute([$username, $password]);
```

**Python + sqlite3:**
```python
cursor.execute(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    (username, password)
)
```

**Java + PreparedStatement:**
```java
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE username = ? AND password = ?"
);
stmt.setString(1, username);
stmt.setString(2, password);
```

### 2. Parameterized Stored Procedures

Equivalent to prepared statements at the database level, as long as they are implemented correctly (no dynamic internal concatenation).

### 3. Principle of Least Privilege

The database user the application connects with should have **only the necessary permissions**:

- Read access only on tables that require reading
- Write access only where needed
- Never `DROP`, `CREATE`, or `EXECUTE` in production

### 4. Input Validation and Allowlisting

For values that cannot be parameterized (table names, columns, sort order), use strict allowlisting:

```python
ALLOWED_COLUMNS = {'name', 'date', 'amount'}
if column not in ALLOWED_COLUMNS:
    raise ValueError("Invalid column")
```

### 5. WAF as an Additional Layer

Web Application Firewalls detect known SQLi patterns, but **do not replace** secure code — they are an extra defensive layer, not the primary one.

---

## Testing Tools

- **sqlmap**: automated detection and exploitation of SQLi (authorized environments only)
- **Burp Suite**: request interception and modification for manual testing
- **DVWA / WebGoat**: intentionally vulnerable environments for practice

---

## Further Reading

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy — SQL Injection](https://portswigger.net/web-security/sql-injection)
- CWE-89: Improper Neutralization of Special Elements used in an SQL Command
