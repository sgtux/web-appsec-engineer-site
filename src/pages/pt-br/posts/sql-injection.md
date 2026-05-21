---
layout: ../../../layouts/PostLayout.astro
title: "SQL Injection: Quando o Banco de Dados Obedece ao Atacante"
description: "Um guia direto sobre SQL Injection — como a vulnerabilidade funciona, exemplos práticos de exploração e as defesas que realmente funcionam."
date: "2024-06-03"
category: "Vulnerabilidades"
lang: "pt-BR"
---

### SQL Injection
SQL Injection é uma vulnerabilidade que ocorre quando um aplicativo permite que dados de entrada do usuário sejam incorporados em consultas SQL sem validação ou sanitização adequada. Isso permite que um atacante manipule a consulta SQL para acessar ou modificar informações não autorizadas no banco de dados.

### Como Funciona?

1. Entrada do Usuário Não Segura: O aplicativo constrói consultas SQL concatenando strings diretamente a partir de entradas do usuário.
2. Manipulação de Consultas: O atacante insere comandos SQL maliciosos na entrada do usuário.
3. Impacto:
    - Vazamento de dados sensíveis.
    - Modificação ou exclusão de dados.
    - Controle total do banco de dados em alguns casos.

## Exemplo de Falha:
### Código Vulnerável (JavaScript com Node.js):

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

    // Consulta SQL vulnerável
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    connection.query(query, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send("Login bem-sucedido!");
        } else {
            res.send("Credenciais inválidas!");
        }
    });
});

app.listen(3000);
```

Exploração:

- Entrada do usuário no navegador:
```bash
/login?username=admin'--&password=anything
```

- Resultado da consulta SQL:
```bash
SELECT * FROM users WHERE username = 'admin'--' AND password = 'anything';
```
A parte após -- é ignorada, permitindo login sem senha.

## Correção:

1. Usar Consultas Preparadas (Prepared Statements):

Consultas preparadas tratam automaticamente os dados de entrada como valores, evitando que eles sejam interpretados como comandos SQL.
Exemplo em Node.js:

```js
app.get('/login', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    // Consulta segura com parâmetros
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    connection.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send("Login bem-sucedido!");
        } else {
            res.send("Credenciais inválidas!");
        }
    });
});
```

### 2. Validar e Sanitizar Entrada do Usuário:

Imponha restrições para garantir que os dados estejam no formato esperado.
Exemplo:

```js
const username = req.query.username;
if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(400).send("Nome de usuário inválido!");
    return;
}
```

### 3. Restringir Privilégios do Banco de Dados:

- Use contas de banco de dados com o menor privilégio possível.
- Impedir que o aplicativo execute comandos como DROP, ALTER, ou DELETE.

## Outro Exemplo: Exfiltração de Dados
Entrada Maliciosa:
```sql
' OR '1'='1'; --
```
Consulta Resultante:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1'; -- AND password = '...';
```

- O ataque retorna todos os usuários, já que OR '1'='1' sempre é verdadeiro.

## Boas Práticas para Prevenção:

1. Usar **Prepared Statements** ou ORMs (como Hibernate, Sequelize, etc.).
2. **Escapar Entradas**: Sanitizar dados com bibliotecas apropriadas.
3. **Validação de Entrada**: Aceitar apenas formatos esperados.
4. **Monitorar o Banco de Dados**: Use ferramentas de auditoria para detectar consultas suspeitas.
5. **Implemente a Defesa em Profundidade**: Combine várias camadas de proteção.

Esses exemplos mostram o impacto potencial e como corrigir vulnerabilidades de SQL Injection.