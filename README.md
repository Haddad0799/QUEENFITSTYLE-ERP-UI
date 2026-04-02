# QueenFitStyle ERP — Frontend

Interface administrativa (backoffice) do ERP da **QueenFitStyle**, marca de roupas de academia feminina. Permite o gerenciamento completo do catálogo de produtos, SKUs, categorias, imagens, estoque e precificação.

## Por que React (SPA)?

Por se tratar de um **sistema interno** (backoffice), não há necessidade de SEO ou renderização server-side. Um SPA com React oferece:

- Navegação rápida sem recarregar a página
- Melhor experiência para operações de CRUD intensivas
- Simplicidade na arquitetura — sem camada de servidor Node intermediária

## Tech Stack

| Camada        | Tecnologia                        |
|---------------|-----------------------------------|
| Framework     | React 19 + TypeScript 5.9         |
| Build Tool    | Vite 7                            |
| Roteamento    | React Router DOM 7                |
| Estilização   | Tailwind CSS 4                    |
| Linting       | ESLint 9 + typescript-eslint      |
| HTTP Client   | Fetch API nativa (wrapper próprio)|

## Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis (ex: ProductStatusSection)
├── layout/            # Shell da aplicação (Sidebar, Topbar, PageShell)
├── lib/               # Utilitários (api-client com wrapper fetch genérico)
├── pages/             # Páginas da aplicação
│   ├── ProductsPage       # Listagem paginada de produtos
│   ├── ProductCreatePage  # Cadastro de novo produto
│   ├── ProductDetailsPage # Detalhes + SKUs de um produto
│   └── CategoriesPage     # CRUD de categorias
├── types/             # Tipagens TypeScript (products, categories, catalog-aux)
└── config.ts          # Constantes (API base URL, page size)
```

## Funcionalidades

- **Produtos** — listagem paginada com filtros, criação, edição, visualização de detalhes e status (`DRAFT` → `READY_FOR_SALE` → `PUBLISHED` → `INACTIVE` → `ARCHIVED`)
- **SKUs** — gerenciamento de variações (cor + tamanho), código SKU, dimensões, preço de custo/venda e estoque
- **Categorias** — criação, renomeação, ativação/desativação
- **Imagens** — upload via URLs pré-assinadas (MinIO/S3), reordenação e definição de imagem principal
- **Cores & Tamanhos** — atributos fixos consumidos dos endpoints administrativos

## Integração com o Backend

O frontend se comunica com uma API REST Java (Spring Boot) via proxy do Vite em desenvolvimento:

```
/erp/*  →  http://localhost:8080
/admin/* →  http://localhost:8080
```

### Arquitetura do Backend

O backend segue **Clean Architecture** com módulos Maven independentes:

| Módulo      | Responsabilidade                                  |
|-------------|---------------------------------------------------|
| `app`       | Bootstrap da aplicação + exception handler global  |
| `attribute` | Categorias, cores e tamanhos (domínio + CRUD)      |
| `product`   | Produtos, SKUs, imagens e publicação no catálogo   |
| `catalog`   | View materializada para o catálogo público (e-commerce) |
| `inventory` | Estoque (movimentações, reservas, saldo)           |
| `pricing`   | Preço de custo e venda por SKU                     |
| `storage`   | Upload/download de imagens (MinIO via presigned URLs) |
| `shared`    | Configuração JDBI, exceptions base, migrations Flyway |

## Pré-requisitos

- **Node.js** ≥ 18
- **Backend** rodando em `localhost:8080` (ver repositório do backend)

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 5174)
npm run dev

# Build de produção
npm run build

# Lint
npm run lint
```

## Scripts Disponíveis

| Comando         | Descrição                          |
|-----------------|------------------------------------|
| `npm run dev`   | Servidor dev com HMR (porta 5174)  |
| `npm run build` | Type-check + build para produção   |
| `npm run lint`  | Análise estática com ESLint        |
| `npm run preview` | Preview do build de produção     |
