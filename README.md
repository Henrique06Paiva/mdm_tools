# MDM Hub Tools — Documentação Técnica

> **Versão:** 1.6.0 | **Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4

---

## 1. Visão Geral

**MDM Hub Tools** é uma aplicação web corporativa de alta performance desenvolvida pela **Amazonas Inovare Tecnologia** para operações de gerenciamento em massa, diagnósticos avançados e gestão padronizada de chamados operacionais para plataformas MDM (Mobile Device Management).

A aplicação centraliza a comunicação com a API do MDM Hub (`api.gateway.mdm-hub.com`) e o backend Supabase, permitindo que analistas e administradores realizem operações em lote e auditorias de incidentes com agilidade e confiabilidade.

### Principais Módulos

| Módulo | Solução / Propósito |
|---|---|
| **Inspecionar Versões (Checker)** | Auditoria e comparação em lote de firmware, pacotes e status de conexão. |
| **Busca de APKs (ApkFinder)** | Localização ágil de links diretos de download de instaladores cadastrados. |
| **Deleção em Massa (Deleter)** | Inativação e remoção definitiva de terminais via planilha. |
| **Force Data em Massa (Forcer)** | Envio de comandos em lote para forçar sincronização imediata dos dispositivos. |
| **Exportador de Terminais (Fetcher)** | Extração estruturada de terminais por corporação/filial com exportação em Excel. |
| **Clonar Usuário (Cloner)** | Duplicação de perfis de acesso e permissões entre contas. |
| **Histórico & Auditoria** | Rastreabilidade e consulta detalhada de operações executadas. |
| **Gestão de Chamados (Incidents)** | Registro padronizado com os 6 campos obrigatórios e upload/paste de evidências. |
| **Bugs Conhecidos (Bugs Hub)** | Catalogação de causas raízes e deduplicação de chamados correlacionados. |

---

## 2. Arquitetura do Sistema

```
MDM Hub Tools (SPA React 19)
│
├── Autenticação (JWT Bearer Token / Multi-tenant)
│   └── POST /api-acl/authentication/login
│
├── Módulos de Automação MDM (api.gateway.mdm-hub.com)
│   ├── Checker   → GET /api-eqp/equipment + GET /api-eqp/equipment-application-historic/{id}
│   ├── ApkFinder → GET /api-application/application + GET /api-application/application/{id}
│   ├── Deleter   → GET /api-eqp/equipment + PATCH /api-eqp/equipment/{id} + DELETE /api-eqp/equipment/{id}
│   ├── Forcer    → POST /api-eqp/device-data/device/{serial}/force-data
│   ├── Fetcher   → GET /api-report/equipment + GET /api-eqp/device-data/device/{serial}
│   └── Cloner    → POST /api-acl/user
│
└── Módulos de Chamados e Auditoria (Supabase)
    ├── Incidents → Supabase Database (Tabela bug_incidents)
    ├── Bugs Hub  → Supabase Database (Tabela known_bugs)
    └── Histórico → Supabase Database (Tabela operations_history)
```

---

## 3. Padrões de Design e UI/UX (v1.6.0)

A versão 1.6.0 introduz uma renovação completa de UI/UX baseada no **Tailwind CSS v4** e tokens de alta ergonomia:

* **Paleta Azul Cobalto Enterprise:** Alto contraste e legibilidade com acentos dinâmicos (`Light Mode: oklch(46% 0.24 260)` e `Dark Mode: oklch(62% 0.22 255)`).
* **Sidebar Expandida (280px):** Menu lateral largo e claro com ícones de 17px, texto em 14px e badges informativos discretos.
* **Layout Widescreen Resiliente:** Área útil ampliada para `max-w-6xl` sem espaço vazio ocioso.
* **Manuais no Rodapé:** O bloco `Instruções & Ajuda` fica recolhido no final de cada tela, mantendo o topo focado na ação operacional.
* **Tabelas Responsivas:** Envelopadas em wrappers com `overflow-x-auto` e scroll horizontal interno.
* **Mobile Floating Bar:** Barra flutuante renderizada via `createPortal` anexada ao `document.body`, contornando limitações de empilhamento CSS.

---

## 4. Estrutura do Projeto

```
mdm_tools/
├── src/
│   ├── main.tsx                  — Ponto de entrada da aplicação
│   ├── App.tsx                   — Shell principal, sidebar e roteamento de abas
│   ├── ThemeContext.tsx          — Gestor de tema claro/escuro
│   ├── api.ts                    — Camada de API singleton para MDM Gateway
│   ├── index.css                 — Design system e tokens de estilo CSS
│   ├── components/
│   │   ├── Login.tsx             — Tela de login corporativa
│   │   ├── ManualViewer.tsx      — Componente de manual/ajuda no rodapé
│   │   ├── ReleaseNotes.tsx      — Central de notas de versão
│   │   ├── FeedbackModal.tsx     — Modal de feedback
│   │   └── ui/                   — Biblioteca de componentes base (shadcn/ui style)
│   ├── data/
│   │   └── releaseNotes.ts       — Registro cronológico de releases
│   ├── services/
│   │   └── supabaseService.ts    — Cliente e serviços Supabase
│   └── tools/
│       ├── Home/                 — Dashboard inicial
│       ├── Checker/              — Inspeção de versões
│       ├── ApkFinder/            — Busca de APKs
│       ├── Deleter/              — Deleção em massa
│       ├── Forcer/               — Sincronização em massa
│       ├── Fetcher/              — Exportador de terminais
│       ├── Cloner/               — Clonador de usuários
│       ├── History/              — Auditoria de operações
│       ├── Incidents/            — Gestão e abertura de chamados
│       └── Bugs/                 — Catálogo de bugs conhecidos
├── index.html
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## 5. Tecnologias e Dependências

| Pacote | Versão | Propósito |
|---|---|---|
| `react` / `react-dom` | ^19.2.8 | Framework e renderizador UI |
| `vite` | ^8.1.5 | Bundler de alta velocidade com compilador Oxc |
| `tailwindcss` / `@tailwindcss/vite` | ^4.3.3 | Estilização utilitária de última geração |
| `@supabase/supabase-js` | ^2.110.8 | Persistência de auditoria e chamados |
| `lucide-react` | ^1.25.0 | Conjunto de ícones vetoriais |
| `xlsx` | ^0.18.5 | Processamento e exportação de planilhas Excel |
| `typescript` | ~6.0.3 | Tipagem estática rigorosa |

---

## 6. Scripts Disponíveis

```bash
# Iniciar ambiente de desenvolvimento (HMR ativo)
npm run dev

# Compilar TypeScript e gerar bundle de produção
npm run build

# Executar linter ESLint
npm run lint

# Visualizar o build de produção localmente
npm run preview
```

---

## 7. Variáveis de Ambiente

Crie ou atualize o arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=https://api.gateway.mdm-hub.com
VITE_API_TENANT=portal
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

---

_Documentação técnica atualizada — v1.6.0 — Amazonas Inovare Tecnologia._
