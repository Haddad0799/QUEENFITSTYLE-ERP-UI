<div align="center">

# 👑 QueenFitStyle — ERP UI

**Painel administrativo (backoffice) para gestão do e-commerce de roupas de academia feminina.**

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Sobre o projeto

Este repositório contém o **front-end do sistema ERP** da QueenFitStyle — um sistema **interno** de backoffice utilizado para gerenciar o catálogo de produtos de um e-commerce de moda fitness feminina.

Por se tratar de uma aplicação interna (sem necessidade de indexação por mecanismos de busca), a escolha por **React como SPA (Single Page Application)** foi deliberada: não há preocupação com SEO, e a arquitetura SPA oferece uma experiência de navegação mais fluida e rápida para os operadores do sistema.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| **Catálogo de Produtos** | Listagem paginada com filtros por status e categoria, criação e edição de produtos |
| **Detalhes do Produto** | Gestão completa de SKUs (variações cor/tamanho), dimensões, preços, estoque e imagens |
| **Categorias** | CRUD completo com criação, renomeação e ativação/desativação de categorias |
| **Upload de Imagens** | Upload direto para S3/MinIO via URLs pré-assinadas (presigned URLs) |
| **Tema Claro/Escuro** | Alternância de tema com persistência via `localStorage` |

---

## 🏗️ Arquitetura & Decisões Técnicas

### Por que React (SPA) e não Next.js/Remix?

Como o sistema é um **painel administrativo interno**, não há necessidade de:
- Server-Side Rendering (SSR) para SEO
- Geração estática de páginas (SSG)
- Hidratação de conteúdo para crawlers

Uma SPA com React puro oferece **menor complexidade**, **menos overhead de infraestrutura** e um **DX (Developer Experience) mais simples** para este caso de uso.

### Design System com CSS Custom Properties + Tailwind v4

O projeto implementa um **sistema de design tokens** robusto utilizando CSS Custom Properties nativas como camada de abstração, consumidas pelo Tailwind CSS via `@theme`:

```css
/* Tokens semânticos em :root e .dark */
:root {
  --brand: #db2777;
  --surface: #ffffff;
  --heading: #111827;
  /* ... */
}

/* Mapeamento para o Tailwind */
@theme {
  --color-brand: var(--brand);
  --color-surface: var(--surface);
  /* ... */
}
```

Isso permite:
- **Troca de tema (light/dark)** apenas alternando a classe `.dark` no `<html>`, sem reprocessar nenhum CSS
- **Consistência visual** — todos os componentes consomem os mesmos tokens semânticos (`text-heading`, `bg-surface`, `border-edge`, etc.)
- **Manutenibilidade** — alterações de paleta propagam automaticamente para toda a aplicação

### API Client genérico e tipado

O módulo [`src/lib/api-client.ts`](src/lib/api-client.ts) implementa um cliente HTTP wrapper sobre a Fetch API com:
- Métodos tipados com generics (`get<T>`, `post<T>`, `patch<T>`, `put<T>`, `delete<T>`)
- Serialização automática de query parameters (incluindo arrays e objetos)
- Tratamento centralizado de erros com suporte ao formato RFC 7807 (Problem Details)
- Tratamento inteligente de respostas vazias (204, `content-length: 0`)

### Proxy reverso no Vite

O `vite.config.ts` configura um **proxy reverso** para as rotas `/erp` e `/admin`, redirecionando para a API backend em `localhost:8080`. Isso elimina problemas de CORS durante o desenvolvimento e permite que o front-end consuma a API sem configuração adicional:

```ts
proxy: {
  '/erp':   { target: 'http://localhost:8080', changeOrigin: true },
  '/admin': { target: 'http://localhost:8080', changeOrigin: true },
}
```

### Upload de imagens via Presigned URLs

O fluxo de upload de imagens adota o padrão de **presigned URLs** (compatível com S3/MinIO):

1. O front-end solicita URLs pré-assinadas ao backend (`POST /erp/products/{id}/colors/{colorId}/images/upload-urls`)
2. O backend gera URLs temporárias (15 min) de escrita direta no object storage
3. O front-end faz upload via `PUT` diretamente ao storage, sem trafegar binários pelo backend
4. Após o upload, o front-end confirma as referências das imagens no backend

Essa abordagem **reduz a carga no backend** e permite uploads paralelos de alta performance.

### Tipagem estrita com TypeScript

O projeto utiliza TypeScript com configuração **strict mode** completa, incluindo:
- `strict: true`
- `noUnusedLocals` / `noUnusedParameters`
- `noFallthroughCasesInSwitch`
- `noUncheckedSideEffectImports`
- `verbatimModuleSyntax`

Os tipos do domínio são organizados em `src/types/`, modelando fielmente as DTOs da API backend (produtos, SKUs, categorias, dimensões, preços, estoque, imagens).

---

## 📁 Estrutura do projeto

```
src/
├── assets/               # Recursos estáticos (imagens, SVGs)
├── config.ts             # Constantes de configuração (API base URL, page size)
├── lib/
│   └── api-client.ts     # Cliente HTTP genérico e tipado (wrapper da Fetch API)
├── layout/
│   ├── PageShell.tsx      # Shell principal (sidebar + topbar + conteúdo)
│   ├── Sidebar.tsx        # Navegação lateral com links do catálogo
│   └── Topbar.tsx         # Barra superior com busca e toggle de tema
├── pages/
│   ├── ProductsPage.tsx       # Listagem paginada de produtos com filtros
│   ├── ProductCreatePage.tsx  # Formulário de criação de produto
│   ├── ProductDetailsPage.tsx # Gestão completa do produto (SKUs, imagens, preços)
│   └── CategoriesPage.tsx     # CRUD de categorias
├── types/
│   ├── products.ts        # DTOs de produto e SKU
│   ├── categories.ts      # DTOs de categorias
│   └── catalog-aux.ts     # DTOs auxiliares (cores, tamanhos, dimensões, preços, imagens)
├── App.tsx                # Roteamento principal (React Router v7)
├── App.css                # Estilos específicos do App
├── main.tsx               # Entry point (React 19 + StrictMode)
└── index.css              # Design tokens + tema light/dark + estilos base
```

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [React](https://react.dev) | 19 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Tipagem estática |
| [Vite](https://vite.dev) | 7 | Build tool & dev server com HMR |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Framework CSS utility-first |
| [React Router](https://reactrouter.com) | 7 | Roteamento client-side (SPA) |
| [ESLint](https://eslint.org) | 9 | Linting (flat config) |
| [PostCSS](https://postcss.org) | 8 | Processamento CSS (via Tailwind) |

> **Nota:** O projeto utiliza versões recentes de todas as ferramentas — React 19, Vite 7, Tailwind v4, ESLint 9 (flat config) — garantindo acesso às APIs e otimizações mais modernas do ecossistema.

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org) >= 18
- [npm](https://www.npmjs.com) (incluso com Node.js)
- Backend da API rodando em `http://localhost:8080` (ou ajustar o proxy no `vite.config.ts`)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Haddad0799/QUEENFITSTYLE-ERP-UI.git
cd QUEENFITSTYLE-ERP-UI

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em **http://localhost:5174**.

### Build de produção

```bash
npm run build
```

Os artefatos de build serão gerados na pasta `dist/`.

### Preview do build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 🔌 Integração com o Backend

O front-end se comunica com uma API REST que gerencia o domínio do e-commerce. As principais rotas consumidas:

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/erp/products` | Listagem paginada de produtos |
| `POST` | `/erp/products` | Criação de produto |
| `GET` | `/erp/products/:id` | Detalhes de um produto |
| `GET` | `/erp/categories` | Listagem de categorias |
| `POST` | `/erp/categories` | Criação de categoria |
| `PATCH` | `/erp/categories/:id/rename` | Renomeação de categoria |
| `PATCH` | `/erp/categories/:id/activate` | Ativação de categoria |
| `PATCH` | `/erp/categories/:id/deactivate` | Desativação de categoria |
| `POST` | `/erp/products/:id/colors/:colorId/images/upload-urls` | Obtenção de presigned URLs |

> Para mais detalhes sobre o contrato de upload de imagens, consulte o arquivo [`ENDPOINT_SPEC.md`](ENDPOINT_SPEC.md).

---

## 📄 Licença

Projeto privado — uso interno QueenFitStyle.
