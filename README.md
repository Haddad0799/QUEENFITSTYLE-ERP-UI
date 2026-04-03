# Queenfitstyle ERP — Frontend

Interface administrativa do ecossistema Queenfitstyle, responsável pela operação interna do e-commerce.

Permite gerenciar catálogo, produtos, SKUs, categorias, imagens, estoque e preços de forma centralizada e consistente.

---

## Problema

A operação de e-commerce envolve tarefas críticas que, quando mal estruturadas, geram:

- Produtos publicados com dados incompletos
- Erros manuais no cadastro de SKUs
- Dificuldade em gerenciar variações (cor, tamanho, preço)
- Baixa produtividade em operações repetitivas (CRUD)
- Falta de controle sobre o ciclo de vida dos produtos

---

## Solução

O painel administrativo foi desenvolvido para:

- Centralizar toda a gestão de catálogo em uma única interface
- Garantir consistência através de regras de negócio integradas ao backend
- Oferecer uma experiência rápida e fluida para operações intensivas
- Facilitar o cadastro e manutenção de produtos em escala

---

## Resultado

- Redução de erros operacionais no cadastro de produtos
- Maior controle sobre publicação e status de itens
- Aumento da produtividade na operação do catálogo
- Interface responsiva e otimizada para uso contínuo

---

## Arquitetura

Aplicação Single Page Application (SPA) construída com React.

Motivação da escolha:

- Sistema interno (sem necessidade de SEO)
- Navegação rápida sem recarregamento
- Melhor experiência para operações de CRUD intensivas
- Menor complexidade de infraestrutura

---

## Integração com Backend

O frontend consome a API REST do backend (Spring Boot), responsável por:

- Regras de negócio e validações
- Persistência de dados
- Orquestração entre módulos (produto, estoque, preço, catálogo)

Durante o desenvolvimento:

/erp/*  →  http://localhost:8080  
/admin/* →  http://localhost:8080  

---

## Funcionalidades

### Produtos

- Listagem paginada com filtros
- Criação, edição e visualização
- Controle de status (DRAFT → READY_FOR_SALE → PUBLISHED → INACTIVE → ARCHIVED)

### SKUs

- Gestão de variações (cor e tamanho)
- Definição de código SKU
- Controle de dimensões, preço e estoque

### Categorias

- Criação e edição
- Ativação e desativação

### Imagens

- Upload via URLs pré-assinadas (MinIO/S3)
- Definição de imagem principal
- Ordenação de imagens

### Atributos

- Consumo de cores e tamanhos definidos no backend

---

## Estrutura do Projeto

src/
├── components/
├── layout/
├── lib/
├── pages/
│   ├── ProductsPage
│   ├── ProductCreatePage
│   ├── ProductDetailsPage
│   └── CategoriesPage
├── types/
└── config.ts

---

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- ESLint

---

## Execução

Pré-requisitos:

- Node.js 18+
- Backend rodando em localhost:8080

Instalar dependências:

npm install

Rodar em desenvolvimento:

npm run dev

Build de produção:

npm run build

---

## Integração com o Ecossistema

Este projeto faz parte de um sistema completo de e-commerce:

- Backend ERP: regras de negócio e persistência
- Painel administrativo: operação interna (este projeto)
- Loja virtual: vitrine pública com SEO e performance

Para mais detalhes, consulte o repositório do backend.
