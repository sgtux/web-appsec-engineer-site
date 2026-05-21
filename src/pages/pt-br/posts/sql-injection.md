---
layout: ../../../layouts/PostLayout.astro
title: "SQL Injection: Quando o Banco de Dados Obedece ao Atacante"
description: "Um guia direto sobre SQL Injection — como a vulnerabilidade funciona, exemplos práticos de exploração e as defesas que realmente funcionam."
date: "2024-06-03"
category: "Vulnerabilidades"
lang: "pt-BR"
---

## O Que é SQL Injection?

**SQL Injection (SQLi)** é uma vulnerabilidade que permite a um atacante interferir nas consultas SQL que uma aplicação faz ao seu banco de dados. Quando entradas do usuário são interpoladas diretamente em queries sem tratamento adequado, o banco de dados não consegue distinguir dados de comandos — e o atacante passa a controlar a lógica da consulta.

É uma das vulnerabilidades mais antigas e ainda amplamente explorada. O OWASP a mantém consistentemente entre as principais ameaças à segurança de aplicações web.

---

## Como Funciona

Considere um sistema de login com a seguinte query:

```sql
SELECT * FROM usuarios WHERE usuario = 'INPUT' AND senha = 'INPUT';
```

Com entradas legítimas, a lógica funciona como esperado. Mas se o campo de usuário aceitar o valor:

```
' OR '1'='1
```

A query resultante se torna:

```sql
SELECT * FROM usuarios WHERE usuario = '' OR '1'='1' AND senha = '...';
```

A condição `'1'='1'` é sempre verdadeira — o atacante autentica sem credenciais válidas.

---

## Tipos de SQL Injection

### In-band SQLi

O resultado da injeção é exibido diretamente na resposta HTTP. É o tipo mais fácil de explorar.

- **Error-based**: mensagens de erro do banco revelam estrutura e dados
- **UNION-based**: o atacante adiciona um `UNION SELECT` para extrair dados de outras tabelas

```sql
-- UNION-based: extraindo usuários do sistema
' UNION SELECT username, password, NULL FROM admin_users--
```

### Blind SQLi

A aplicação não exibe o resultado da query, mas o atacante infere informações pelo comportamento:

- **Boolean-based**: a resposta varia conforme a condição é verdadeira ou falsa
- **Time-based**: usa funções como `SLEEP()` para deduzir dados pelo tempo de resposta

```sql
-- Time-based: se a primeira letra do nome do banco for 'a', aguarda 5 segundos
' AND IF(SUBSTRING(database(),1,1)='a', SLEEP(5), 0)--
```

### Out-of-band SQLi

Exfiltra dados via canais externos (DNS, HTTP) — útil quando in-band e blind não são viáveis.

---

## Impacto Real

Dependendo das permissões do usuário do banco de dados e da configuração do servidor, SQL Injection pode permitir:

- **Bypass de autenticação**: acesso administrativo sem credenciais
- **Exfiltração completa**: dump de todas as tabelas — usuários, senhas, dados sensíveis
- **Modificação de dados**: UPDATE ou DELETE em registros arbitrários
- **Escalada de privilégios**: se o usuário do banco tiver permissões elevadas
- **Execução de comandos no SO**: via `xp_cmdshell` (SQL Server) ou `INTO OUTFILE` (MySQL)
- **Pivoting interno**: acesso à rede interna a partir do banco de dados

> Em 2009, o ataque Heartland Payment Systems — via SQL Injection — resultou no vazamento de mais de 130 milhões de dados de cartões de crédito. Danos estimados em centenas de milhões de dólares.

---

## Como Prevenir

### 1. Prepared Statements (Consultas Parametrizadas)

Esta é a defesa primária e mais eficaz. O banco recebe o comando SQL e os dados separadamente — dados nunca são interpretados como código.

**PHP + PDO:**
```php
$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?');
$stmt->execute([$usuario, $senha]);
```

**Python + sqlite3:**
```python
cursor.execute(
    "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
    (usuario, senha)
)
```

**Java + PreparedStatement:**
```java
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?"
);
stmt.setString(1, usuario);
stmt.setString(2, senha);
```

### 2. Stored Procedures Parametrizadas

Equivalente a prepared statements no nível do banco de dados, desde que implementadas corretamente (sem concatenação dinâmica interna).

### 3. Princípio do Menor Privilégio

O usuário do banco de dados que a aplicação usa deve ter **apenas as permissões necessárias**:

- Leitura em tabelas que exige leitura
- Escrita apenas onde necessário
- Nunca `DROP`, `CREATE` ou `EXECUTE` em produção

### 4. Validação e Allowlisting de Entrada

Para valores que não podem ser parametrizados (nomes de tabelas, colunas, ordenação), use allowlisting estrita:

```python
ALLOWED_COLUMNS = {'nome', 'data', 'valor'}
if coluna not in ALLOWED_COLUMNS:
    raise ValueError("Coluna inválida")
```

### 5. WAF como Camada Adicional

Web Application Firewalls detectam padrões conhecidos de SQLi, mas **não substituem** código seguro — são uma camada de defesa extra, não a principal.

---

## Ferramentas para Teste

- **sqlmap**: automação de detecção e exploração de SQLi (apenas em ambientes autorizados)
- **Burp Suite**: interceptação e modificação de requisições para teste manual
- **DVWA / WebGoat**: ambientes vulneráveis intencionalmente para prática

---

## Leitura Complementar

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy — SQL Injection](https://portswigger.net/web-security/sql-injection)
- CWE-89: Improper Neutralization of Special Elements used in an SQL Command
