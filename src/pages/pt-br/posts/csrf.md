---
layout: ../../../layouts/PostLayout.astro
title: "Cross-Site Request Forgery"
description: "Quando um site malicioso faz seu navegador agir contra você."
date: "2024-06-03"
category: "Vulnerabilidades"
lang: "pt-BR"
---

# Cross-Site Request Forgery

O CSRF é uma vulnerabilidade que permite a um atacante enganar um usuário autenticado para executar ações não intencionais em uma aplicação web onde ele está logado. Isso ocorre porque navegadores enviam automaticamente cookies de autenticação com as requisições, mesmo que tenham sido originadas de um site malicioso.

Como Funciona?

1. O usuário faz login em uma aplicação (por exemplo, um banco online).
2. O atacante engana o usuário para visitar um site malicioso ou abrir um link especialmente criado.
3. Esse link contém uma solicitação maliciosa para a aplicação legítima, utilizando os cookies de sessão do usuário.
4. O navegador do usuário envia a requisição para a aplicação como se fosse legítima, já que os cookies de autenticação são incluídos automaticamente.

## Exemplo de Falha CSRF
### Cenário Vulnerável:
Código Backend (Node.js com Express):

```js
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/transfer', (req, res) => {
    const { amount, toAccount } = req.body;

    // Realiza a transferência diretamente
    if (req.isAuthenticated) {
        // Lógica de transferência aqui
        res.send(`Transferência de ${amount} para ${toAccount} realizada com sucesso.`);
    } else {
        res.status(403).send("Não autorizado.");
    }
});

app.listen(3000);
```

### Exploração:

O atacante pode criar uma página maliciosa com um formulário oculto:
```html
<html>
<body>
    <form action="http://banco.com/transfer" method="POST">
        <input type="hidden" name="amount" value="10000">
        <input type="hidden" name="toAccount" value="123456">
        <script>
            document.forms[0].submit();
        </script>
    </form>
</body>
</html>
```

- Quando o usuário logado acessa esta página, o navegador envia automaticamente o cookie de sessão e a transferência é realizada.

## Correções de CSRF
### 1. Tokens CSRF

Um token CSRF é um valor único gerado no servidor e associado à sessão do usuário. Ele deve ser incluído em todas as requisições que realizam alterações no estado do servidor.
#### Exemplo com Token CSRF (Express + csurf):

```js
const csrf = require('csurf');
const express = require('express');
const app = express();

// Configura o middleware de CSRF
const csrfProtection = csrf({ cookie: true });
app.use(require('cookie-parser')());
app.use(express.urlencoded({ extended: true }));

// Rota para exibir o formulário com o token CSRF
app.get('/transfer', csrfProtection, (req, res) => {
    res.send(`
        <form action="/transfer" method="POST">
            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
            <input type="text" name="amount" placeholder="Valor">
            <input type="text" name="toAccount" placeholder="Conta">
            <button type="submit">Transferir</button>
        </form>
    `);
});

// Rota para processar a transferência
app.post('/transfer', csrfProtection, (req, res) => {
    const { amount, toAccount } = req.body;
    res.send(`Transferência de ${amount} para ${toAccount} realizada com sucesso.`);
});

app.listen(3000);
```

- O token _csrf é verificado automaticamente pelo middleware.

## 2. Verificar a Origem da Requisição

Validar os cabeçalhos Origin e Referer para garantir que a requisição veio de uma página legítima.
Exemplo:
```js
app.post('/transfer', (req, res) => {
    const origin = req.get('Origin');
    if (origin !== 'http://banco.com') {
        return res.status(403).send("Origem não autorizada.");
    }

    // Prosseguir com a lógica de transferência
    res.send("Transferência realizada.");
});
```
Limitação: Pode ser burlado em navegadores antigos ou mal configurados.

## 3. Usar Métodos Seguros para Requisições

- Alterações no estado devem usar métodos POST, PUT ou DELETE, nunca GET.
- Navegadores não permitem que formulários enviem requisições POST automaticamente sem interação explícita do usuário.

## 4. Configuração de Cookies com Flag SameSite

Defina os cookies de sessão como SameSite, restringindo o envio deles a requisições originadas do mesmo domínio.
Exemplo (Express):
```js
app.use(require('cookie-session')({
    name: 'session',
    secret: 'secret-key',
    cookie: {
        sameSite: 'Strict', // Ou 'Lax'
        httpOnly: true,
        secure: true
    }
}));

```

### Resumo de Boas Práticas

1. Sempre use tokens CSRF em aplicações que realizam alterações no estado.
2. Valide os cabeçalhos Origin e Referer para identificar requisições suspeitas.
3. Configure cookies com a flag SameSite e HttpOnly.
4. Utilize métodos seguros como POST para operações sensíveis.

Com essas correções, você pode mitigar os riscos de CSRF e proteger sua aplicação contra solicitações maliciosas.