---
layout: ../../../layouts/PostLayout.astro
title: "Cross-Site Scripting (XSS): O Clássico Que Não Envelhece"
description: "Entenda o que é XSS, como funciona na prática, qual o seu impacto real e como escrever código que não seja vulnerável a esse tipo de ataque."
date: "2024-06-10"
category: "Vulnerabilidades"
lang: "pt-BR"
---

# Cross-Site Scripting (XSS)

Imagine que você está navegando em um site de compras, e alguém deixou um comentário sobre um produto. O comentário foi inserido em um campo de texto do próprio site. Porém sem você perceber algumas informações sensíveis que estavam armazenadas no seu navegador foram enviadas para um servidor desconhecido. Isso aconteceu devido ao comentário possuir códigos maliciosos que foram interpretados pelo navegador como um simples script JavaScript.

Esse tipo de ataque é chamado de Cross-Site Scripting, ou XSS, e pode ser usado para roubar informações confidenciais, como tokens, senhas, cookies, ou até mesmo para alterar o comportamento do site, redirecionando os usuários para páginas falsas.

Essa vulnerabilidade é possível porque o site não valida corretamente os dados inseridos pelo usuário. Então, em vez de apenas exibir o comentário como texto, o site acaba executando o código malicioso embutido ali. O XSS pode ser usado para muitas ações perigosas: roubo de dados pessoais, propagação de vírus e até ataques em larga escala, como phishing.

## Como Funciona?

1. Entrada Maliciosa: O atacante insere código malicioso em um campo de entrada ou URL de uma aplicação vulnerável.
2. Execução no Navegador: O código malicioso é enviado ao navegador de outros usuários como parte da página web.
3. Impacto:
    - Roubo de cookies, tokens de sessão ou dados sensíveis.
    - Redirecionamento para sites maliciosos.
    - Modificação da interface ou conteúdo da página.

## Tipos de XSS

1. Refletido: O script malicioso é enviado na requisição e refletido diretamente na resposta sem validação.
2. Armazenado: O script é armazenado no servidor (em um banco de dados, por exemplo) e executado sempre que a página é carregada.
3. Baseado em DOM: O script é executado diretamente no lado do cliente, manipulando o Document Object Model (DOM).

## Prevenção

1. Sanitização e Validação: Limitar e limpar entradas do usuário.
2. Escapar Saída: Converter caracteres especiais em entidades HTML.
3. Usar APIs Seguras: Evitar APIs inseguras como innerHTML e usar alternativas como textContent.

**XSS é uma das vulnerabilidades mais comuns na web mencionado pela comunidade da [OWASP](https://owasp.org/www-community/attacks/xss/) e incluso na categoria de Injection (A03) do [OWASP TOP 10 (2021)](https://owasp.org/Top10/A03_2021-Injection/).** 

## Segue alguns exemplos de falhas e correções para Cross-Site Scripting (XSS) em diferentes linguagens.

### Exemplo de Falha de XSS Refletido em Java

Imagine uma aplicação web onde os dados do usuário são incluídos diretamente na resposta sem validação ou sanitização.

```java
// Controlador Java usando Servlets
import javax.servlet.http.*;

public class XSSExample extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        response.setContentType("text/html");
        response.getWriter().println("<h1>Olá, " + name + "!</h1>");
    }
}

// Se o atacante enviar name=<script>alert('XSS')</script>, o navegador executará o script malicioso.
```

### Possíveis correções

1. Sanitizar Saída: Use bibliotecas como [OWASP Java Encoder]():

```java

import org.owasp.encoder.Encode;

public class SecureXSSExample extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        response.setContentType("text/html");
        response.getWriter().println("<h1>Olá, " + Encode.forHtml(name) + "!</h1>");
    }
}
```

2. Validar Entrada utilizando Regex ou bibliotecas como Hibernate Validator para aceitar apenas valores válidos.
```java
    if (!name.matches("[a-zA-Z0-9 ]+")) {
        throw new IllegalArgumentException("Nome inválido");
    }
```

## Exemplos da falha em JavaScript

Imagine um sistema onde comentários são salvos e exibidos sem sanitização.
Código Backend:
```js
const express = require('express');
const app = express();

let comments = [];

app.use(express.urlencoded({ extended: true }));

app.post('/comment', (req, res) => {
    comments.push(req.body.comment); // Armazena sem sanitização
    res.send("Comentário adicionado!");
});

app.get('/comments', (req, res) => {
    res.send(`
        <h1>Comentários:</h1>
        ${comments.map(c => `<p>${c}</p>`).join('')}
    `);
});

// Um atacante pode enviar um comentário como <script>alert('XSS')</script>, que será executado para todos os usuários.
```
Correção em JavaScript

1. Sanitizar Saída utilizando bibliotecas como DOMPurify para limpar dados antes de renderizá-los.
```js
Exemplo com DOMPurify:

const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

app.get('/comments', (req, res) => {
    res.send(`
        <h1>Comentários:</h1>
        ${comments.map(c => `<p>${purify.sanitize(c)}</p>`).join('')}
    `);
});
```

2. Escape Manual: Converta caracteres perigosos para entidades HTML.
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
        <h1>Comentários:</h1>
        ${comments.map(c => `<p>${escapeHtml(c)}</p>`).join('')}
    `);
});
```

3. Usar Bibliotecas de Templates Seguras: Frameworks como React ou Angular automaticamente escapam conteúdo, prevenindo XSS:
```js
const CommentList = ({ comments }) => (
    <div>
        {comments.map((comment, index) => (
            <p key={index}>{comment}</p> // React escapa automaticamente
        ))}
    </div>
);
```

## Boas Práticas Gerais

- Nunca confiar na entrada do usuário: Sempre validar e sanitizar.
- Escapar dados ao renderizar: Use ferramentas específicas para cada linguagem ou framework.
- Bibliotecas confiáveis:
    - Java: OWASP Java Encoder.
    - JavaScript: DOMPurify ou frameworks modernos como React, Angular e Vue.js.
- Cuidado com APIs DOM: Manipulações como **innerHTML** são perigosas. Prefira APIs seguras, como **textContent**:
```js
    element.textContent = userInput;
```