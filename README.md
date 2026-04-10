# QueenFitStyle ERP — Frontend

Interface administrativa do ecossistema QueenFitStyle, responsável pela operação interna do e-commerce.

Permite gerenciar catálogo, produtos, SKUs, categorias, imagens, estoque e preços de forma centralizada e consistente.

---

## Problema

A operação de e-commerce envolve tarefas críticas que, quando mal estruturadas, geram:

- produtos publicados com dados incompletos  
- erros manuais no cadastro de SKUs  
- dificuldade em gerenciar variações (cor, tamanho, preço)  
- baixa produtividade em operações repetitivas (CRUD)  
- falta de controle sobre o ciclo de vida dos produtos  

---

## Solução

O painel administrativo foi desenvolvido para:

- centralizar a gestão de catálogo em uma única interface  
- garantir consistência através de regras de negócio integradas ao backend  
- oferecer uma experiência rápida para operações intensivas  
- facilitar o cadastro e manutenção de produtos em escala  

---

## Resultado

- redução de erros operacionais no cadastro de produtos  
- maior controle sobre publicação e status de itens  
- aumento da produtividade na operação do catálogo  
- interface responsiva e otimizada para uso contínuo  

---

## Arquitetura

Aplicação Single Page Application (SPA) construída com React.

Motivação da escolha:

- sistema interno (sem necessidade de SEO)  
- navegação rápida sem recarregamento  
- melhor experiência para operações de CRUD intensivas  
- menor complexidade de infraestrutura  

---

## Integração com o backend

O frontend consome a API REST desenvolvida em Spring Boot, responsável por:

- regras de negócio e validações  
- persistência de dados  
- orquestração entre módulos (produto, estoque, preço, catálogo)  

Durante o desenvolvimento:

- `/erp/*` → http://localhost:8080  
- `/admin/*` → http://localhost:8080  

---

## Funcionalidades

### Produtos
- listagem paginada com filtros  
- criação, edição e visualização  
- controle de status (DRAFT → READY_FOR_SALE → PUBLISHED → INACTIVE → ARCHIVED)  

### SKUs
- gestão de variações (cor e tamanho)  
- definição de código SKU  
- controle de dimensões, preço e estoque  

### Categorias
- criação e edição  
- ativação e desativação  

### Imagens
- upload via URLs pré-assinadas (MinIO/S3)  
- definição de imagem principal  
- ordenação de imagens  

### Atributos
- consumo de cores e tamanhos definidos no backend  

---

## Tecnologias

- React  
- TypeScript  
- Vite  
- React Router DOM  
- Tailwind CSS  
- ESLint  

---

## Como rodar o projeto

### Pré-requisitos

- Node.js 18+  
- Backend rodando em http://localhost:8080  

### Instalar dependências

```bash
npm install
Rodar em desenvolvimento
npm run dev
Build de produção
npm run build
Integração com o ecossistema
````
---
# Este projeto faz parte de um sistema completo de e-commerce:

- Backend ERP: regras de negócio e persistência
https://github.com/Haddad0799/QUEENFITSTYLE-ERP-STORE-BACKEND
- Loja virtual (Next.js): vitrine pública
https://github.com/Haddad0799/QUEENFITSTYLE-STORE-UI



