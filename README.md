# MDM Hub Tools — Documentação Técnica

> **Versão:** 1.2.1 | **Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4

---

## 1. Visão Geral

**MDM Hub Tools** é uma aplicação web interna desenvolvida pela **Amazonas Inovare Tecnologia** para operações de gerenciamento em massa de dispositivos móveis registrados em uma plataforma MDM (Mobile Device Management).

A aplicação funciona como um painel centralizado de ferramentas que se comunicam com a API do MDM Hub (`api.gateway.mdm-hub.com`), permitindo que administradores realizem operações em lote sobre o inventário de terminais, sem a necessidade de acessar individualmente cada dispositivo no portal principal.

### Propósito Central

| Problema                                                      | Solução                                           |
| ------------------------------------------------------------- | ------------------------------------------------- |
| Verificar versão de apps em centenas de terminais manualmente | **Versões** em massa via planilha                 |
| Localizar o link de download de um APK específico             | **Busca de APKs** por package name e versão       |
| Remover dispositivos obsoletos do inventário em bulk          | **Deleção em Massa** a partir de lista de seriais |
| Forçar sincronização de dados em terminais offline            | **Force Data em Massa** via lista de seriais      |

---

## 2. Arquitetura Geral

```
MDM Hub Tools (SPA React)
│
├── Autenticação (JWT Bearer Token)
│   └── POST /api-acl/authentication/login
│
└── Ferramentas (Tabs)
    ├── Checker  → GET /api-eqp/equipment + GET /api-eqp/equipment-application-historic/{id}
    ├── ApkFinder → GET /api-application/application + GET /api-application/application/{id}
    ├── Deleter  → GET /api-eqp/equipment + PATCH /api-eqp/equipment/{id} + DELETE /api-eqp/equipment/{id}
    └── Forcer   → POST /api-eqp/device-data/device/{serial}/force-data
```

### Padrão de Arquitetura de Componentes

Cada ferramenta segue o mesmo padrão de separação de responsabilidades:

```
tools/<NomeDaFerramenta>/
  ├── index.tsx          — Componente orquestrador (layout principal da ferramenta)
  ├── ConfigPanel.tsx    — Painel de configuração e entrada de dados
  ├── ProgressPanel.tsx  — Exibição de progresso, estatísticas e tabela de resultados
  ├── LogPanel.tsx       — Painel de logs em tempo real
  └── use<Ferramenta>.ts — Hook customizado com toda a lógica e estado
```

Este padrão garante que a lógica de negócio fique completamente isolada nos hooks, e os componentes TSX sejam apenas responsáveis pela apresentação.

---

## 3. Estrutura de Arquivos

```
mdm_tools/
├── src/
│   ├── main.tsx                  — Ponto de entrada da aplicação
│   ├── App.tsx                   — Componente raiz: roteamento entre Login e MainApp
│   ├── ThemeContext.tsx           — Context + Provider para tema claro/escuro
│   ├── api.ts                    — Serviço de API centralizado (classe ApiService)
│   ├── index.css                 — Estilos globais e tokens de design (Tailwind v4)
│   ├── components/
│   │   ├── Login.tsx             — Tela de autenticação
│   │   └── ui/                   — Biblioteca de componentes UI base
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── table.tsx
│   └── tools/
│       ├── Checker/              — Ferramenta: Versões
│       ├── ApkFinder/            — Ferramenta: Busca de APKs
│       ├── Deleter/              — Ferramenta: Deleção em massa
│       └── Forcer/               — Ferramenta: Force Data em massa
├── index.html
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## 4. Tecnologias e Dependências

### Dependências de Produção

| Pacote                     | Versão  | Uso                                      |
| -------------------------- | ------- | ---------------------------------------- |
| `react`                    | ^19.2.8 | Framework UI principal                   |
| `react-dom`                | ^19.2.8 | Renderização no DOM                      |
| `tailwindcss`              | ^4.3.3  | Utilitários CSS                          |
| `@tailwindcss/vite`        | ^4.3.3  | Plugin Vite para Tailwind v4             |
| `lucide-react`             | ^1.25.0 | Ícones SVG                               |
| `xlsx`                     | ^0.18.5 | Leitura e escrita de planilhas Excel/CSV |
| `@radix-ui/react-slot`     | ^1.3.0  | Composição de componentes (botão)        |
| `class-variance-authority` | ^0.7.1  | Variantes de classes CSS                 |
| `clsx`                     | ^2.1.1  | Utilitário para classes condicionais     |
| `tailwind-merge`           | ^3.6.0  | Merge de classes Tailwind sem conflitos  |

### Dependências de Desenvolvimento

| Pacote                 | Versão  | Uso                              |
| ---------------------- | ------- | -------------------------------- |
| `vite`                 | ^8.1.5  | Bundler e dev server             |
| `typescript`           | ~6.0.3  | Tipagem estática                 |
| `@vitejs/plugin-react` | ^6.0.4  | Plugin React para Vite (usa Oxc) |
| `eslint`               | ^10.7.0 | Linting de código                |

---

## 5. Autenticação

### Fluxo de Login

```
Usuário insere credenciais
        ↓
POST /api-acl/authentication/login
  Headers: { x-tenant-code: <TENANT>, content-type: application/json }
  Body:    { username, password }
        ↓
Resposta: { access_token | token }
        ↓
Token salvo em: localStorage("mdm_token")
Username/password salvos em: sessionStorage (para renovação automática)
        ↓
App renderiza <MainApp />
```

### Renovação Automática de Token (Auto-Refresh)

A classe `ApiService` implementa renovação transparente de token:

1. Toda requisição é enviada com `Authorization: Bearer <token>`
2. Se o servidor retornar **HTTP 401**, o serviço tenta relogar automaticamente usando as credenciais salvas na `sessionStorage`
3. Se o relogin for bem-sucedido, a requisição original é **repetida automaticamente**
4. Se falhar, o usuário é deslogado e redirecionado para o Login

### Rate Limiting (HTTP 429)

O serviço detecta respostas `429 Too Many Requests` e aplica **exponential backoff**:

- Aguarda `backoff` ms (inicialmente 1000ms)
- Dobra o tempo a cada tentativa: 1s → 2s → 4s
- Máximo de 3 tentativas por requisição

### Persistência de Sessão

| Dado           | Storage          | Motivo                                   |
| -------------- | ---------------- | ---------------------------------------- |
| `mdm_token`    | `localStorage`   | Persiste entre abas e sessões do browser |
| `mdm_username` | `sessionStorage` | Limpo ao fechar a aba                    |
| `mdm_password` | `sessionStorage` | Limpo ao fechar a aba                    |
| `mdm_theme`    | `localStorage`   | Persiste preferência de tema             |

> ⚠️ **Atenção:** A senha é armazenada em `sessionStorage` para viabilizar o auto-refresh silencioso do token. Isso é um trade-off de segurança: garante UX sem interrupções em sessões longas, mas a senha fica em texto claro no storage do browser durante a sessão ativa.

### Logout

O método `api.logout()` limpa todos os dados de `localStorage` e `sessionStorage` e dispara o callback `onUnauthorized`, que redireciona para a tela de Login.

---

## 6. Camada de API (`src/api.ts`)

A classe `ApiService` é instanciada como singleton exportado (`export const api`). Ela centraliza toda a comunicação com o backend.

### Configuração

```typescript
CONFIG.BASE_URL =
  process.env.VITE_API_BASE_URL || "https://api.gateway.mdm-hub.com";
CONFIG.TENANT = process.env.VITE_API_TENANT || "portal";
```

### Métodos Públicos

| Método                                  | Descrição                                       |
| --------------------------------------- | ----------------------------------------------- |
| `login(username, password)`             | Autentica e salva o token                       |
| `logout()`                              | Limpa sessão e notifica listeners               |
| `fetch(url, options, retries, backoff)` | Wrapper de fetch com auth, retry e rate-limit   |
| `hasToken()`                            | Retorna `true` se há um token ativo             |
| `getUsername()`                         | Retorna o username da sessão atual              |
| `getTenant()`                           | Retorna o código do tenant ativo                |
| `registerOnUnauthorized(callback)`      | Registra callback para evento de logout forçado |

---

## 7. Ferramentas

### 7.1 Versões (Checker)

**Localização:** `src/tools/Checker/`

**Propósito:** Verificar, em lote, quais apps (por package name) estão instalados nos terminais listados numa planilha e quais versões estão ativas.

#### Como usar

1. Informe um ou mais **Package Names** dos aplicativos a verificar (ex: `com.mdmservice`)
2. Faça upload de uma planilha `.xlsx` ou `.csv` contendo os números de série
3. Selecione a coluna que contém os seriais (se necessário)
4. Clique em **Iniciar** — o progresso aparece em tempo real
5. Ao final, exporte os resultados em `.xlsx`

#### Fluxo de processamento

```
Para cada serial (em lotes de 5 simultâneos):
  1. GET /api-eqp/equipment?key={serial}
     → Obtém: ID, nome, grupo, política, status, powerOn, lastUpdate

  2. Para cada package name configurado:
     GET /api-eqp/equipment-application-historic/{eqId}?boSystem=false
     GET /api-eqp/equipment-application-historic/{eqId}?boSystem=true
     → Pagina até encontrar a versão de todos os packages

  3. Determina status de conectividade:
     - Online: powerOn=true AND lastUpdate < 10 minutos atrás
     - Offline: caso contrário

  4. Monta linha de resultado com:
     Serial | Nome | Grupo | Política | Status | Conexão | Versão(ões) | Horário
```

#### Dados gerados por serial

| Campo                | Fonte API                                             |
| -------------------- | ----------------------------------------------------- |
| Serial Number        | Input da planilha                                     |
| Nome do Equipamento  | `eq.name`                                             |
| Grupo de Equipamento | `eq.equipmentGroup.name` (vários fallbacks)           |
| Política de Uso      | `eq.usePolicy.name` (vários fallbacks)                |
| Status               | `eq.status === 1` → Ativo / Inativo                   |
| Conexão              | `eq.powerOn && lastUpdate < 10min` → Online / Offline |
| Versão por package   | `applicationVersionHistoric[].version`                |
| Horário da Consulta  | Timestamp local                                       |

#### Exportação

O resultado é exportado como arquivo `MDM_Versoes_<timestamp>.xlsx` via biblioteca `xlsx`.

---

### 7.2 Busca de APKs (ApkFinder)

**Localização:** `src/tools/ApkFinder/`

**Propósito:** Encontrar os links de download direto (APK path) de aplicativos com versões específicas, filtrados por corporação.

#### Como usar

1. Informe o **ID da Corporação** no MDM Hub
2. Informe o(s) **Package Names** dos apps (opcional, para filtrar)
3. Informe a(s) **Versões** que deseja localizar
4. Clique em **Buscar** — os resultados aparecem com links clicáveis

#### Fluxo de processamento

```
1. GET /api-application/application?corporationId={corpId}&limit=500
   → Lista todos os apps da corporação

2. Filtra apps pelo package name (se informado)

3. Para cada app filtrado:
   GET /api-application/application/{app.id}
   → Obtém detalhes com applicationVersions[]
        └── applicationVersionApks[]
              ├── versionName (ex: "1.5.1")
              └── apkPath (URL de download)

4. Retorna resultados onde versionName ou v.name bate com as versões buscadas
```

#### Dados retornados

| Campo        | Descrição                          |
| ------------ | ---------------------------------- |
| ID           | ID interno do app                  |
| Nome         | Nome do aplicativo                 |
| Package Name | Identificador do pacote Android    |
| Versão       | Versão do APK encontrada           |
| Tamanho      | Tamanho do arquivo (se disponível) |
| Link         | URL direta para download do APK    |

---

### 7.3 Deleção em Massa (Deleter)

**Localização:** `src/tools/Deleter/`

**Propósito:** Remover definitivamente equipamentos do inventário MDM a partir de uma lista de números de série.

> ⚠️ **Atenção:** Esta operação é **irreversível**. Os equipamentos são permanentemente deletados do MDM Hub. Equipamentos ativos são inativados automaticamente antes da deleção.

#### Como usar

1. Faça upload de uma planilha `.xlsx` com seriais na **coluna A** (linha 1 = cabeçalho)
2. Revise o número de seriais carregados
3. Clique em **Iniciar Deleção** — acompanhe o progresso em tempo real

#### Fluxo de processamento

```
Para cada serial (em lotes de 5 simultâneos):
  1. GET /api-eqp/equipment?key={serial}
     → Busca o equipamento pelo serial

  2. Se não encontrado:
     → Marca como "N/E" (Não Encontrado), incrementa skip

  3. Se encontrado E status = 1 (Ativo):
     PATCH /api-eqp/equipment/{id}
     Body: { status: 0, companyId, subsidiaryId, equipmentTypeId, corporationId, name }
     → Inativa o equipamento primeiro

  4. DELETE /api-eqp/equipment/{id}
     → Deleta definitivamente

  5. Registra resultado: Deletado / Não Encontrado / Erro
```

#### Estatísticas monitoradas

| Contador | Significado                 |
| -------- | --------------------------- |
| Total    | Total de seriais carregados |
| Feitos   | Deletados com sucesso       |
| Falhas   | Erros durante o processo    |
| Pulados  | Não encontrados (N/E)       |

---

### 7.4 Force Data em Massa (Forcer)

**Localização:** `src/tools/Forcer/`

**Propósito:** Enviar o comando **Force Data** para múltiplos terminais simultaneamente, forçando-os a sincronizar seus dados de inventário com o servidor MDM.

#### O que é Force Data?

O comando Force Data instrui o agente MDM instalado no terminal a coletar e enviar imediatamente todos os dados de inventário (apps instalados, configurações, status de hardware, etc.) para o servidor, sem aguardar o ciclo de sincronização agendado. Útil quando:

- Um terminal acabou de receber um novo app e precisa reportar a versão
- O terminal está desatualizado no portal e você precisa dos dados mais recentes

#### Como usar

1. Faça upload de uma planilha `.xlsx` com seriais na **coluna A** (linha 1 = cabeçalho)
2. Clique em **Enviar Force Data** — o processo inicia imediatamente

#### Fluxo de processamento

```
Para cada serial (em lotes de 5 simultâneos):
  POST /api-eqp/device-data/device/{serial}/force-data
  Headers: { accept: "application/json, text/plain, */*" }
  → Sem body necessário

  Resultado: Enviado com sucesso / Erro
```

#### Observações importantes

- O endpoint aceita o **serial diretamente na URL** (não requer busca prévia do ID do equipamento)
- O sucesso do comando indica que a requisição foi aceita pelo servidor — a sincronização real depende do terminal estar online e com o agente MDM ativo
- Seriais vazios são pulados automaticamente

---

## 8. Sistema de Temas

**Arquivo:** `src/ThemeContext.tsx`

A aplicação suporta temas **claro** e **escuro**, gerenciados via React Context.

### Lógica de inicialização

```typescript
// Prioridade de detecção:
1. localStorage.getItem("mdm_theme")                      // Preferência salva pelo usuário
2. window.matchMedia("prefers-color-scheme: dark")        // Preferência do sistema operacional
3. Padrão: "light"
```

### Aplicação do tema

O tema é aplicado via atributo HTML no elemento raiz:

```html
<html data-theme="dark">
  <!-- ou data-theme="light" -->
</html>
```

O Tailwind CSS v4 utiliza este atributo para alternar os tokens de cor CSS definidos em `index.css`.

### Hook de uso

```typescript
const { theme, toggleTheme } = useTheme();
// theme: "light" | "dark"
// toggleTheme(): alterna entre os dois valores
```

---

## 9. Componentes UI Base (`src/components/ui/`)

Biblioteca de componentes primitivos, construída sobre Radix UI e Tailwind, seguindo o padrão **shadcn/ui**.

| Componente                                          | Arquivo      | Uso                                                                |
| --------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `Button`                                            | `button.tsx` | Botões com variantes: `default`, `ghost`, `outline`, `destructive` |
| `Input` / `Label`                                   | `input.tsx`  | Campos de texto estilizados                                        |
| `Card` / `CardHeader` / `CardContent` / `CardTitle` | `card.tsx`   | Contêineres de seção                                               |
| `Badge`                                             | `badge.tsx`  | Tags de status: `default`, `secondary`, `destructive`              |
| `Table` e sub-componentes                           | `table.tsx`  | Tabela de resultados estilizada                                    |

---

## 10. Processamento Concorrente

Todas as ferramentas que processam listas (Checker, Deleter, Forcer) compartilham o mesmo padrão de concorrência controlada:

```typescript
const concurrency = 5; // 5 requisições simultâneas

for (let i = 0; i < serials.length; i += concurrency) {
  const batch = serials.slice(i, i + concurrency);
  await processBatch(batch); // Promise.all() interno
}
```

Isso garante:

- **Throughput alto**: 5 terminais processados em paralelo
- **Segurança**: Não satura a API com centenas de requisições simultâneas
- **Progressividade**: A UI atualiza a cada lote concluído

---

## 11. Sistema de Logs

Todas as ferramentas utilizam um painel de logs em tempo real com 4 tipos de mensagem:

| Tipo   | Cor visual    | Quando usar                                     |
| ------ | ------------- | ----------------------------------------------- |
| `info` | Azul/neutro   | Informações gerais, início de processos         |
| `ok`   | Verde         | Operações concluídas com sucesso                |
| `warn` | Amarelo/âmbar | Avisos não críticos (ex: serial não encontrado) |
| `err`  | Vermelho      | Erros que afetam a operação                     |

Os logs são exibidos em **ordem cronológica inversa** (mais recentes no topo) e incluem o horário de cada evento.

---

## 12. Variáveis de Ambiente

Configure no arquivo `.env` na raiz do projeto:

| Variável            | Padrão                            | Descrição                          |
| ------------------- | --------------------------------- | ---------------------------------- |
| `VITE_API_BASE_URL` | `https://api.gateway.mdm-hub.com` | URL base da API MDM Hub            |
| `VITE_API_TENANT`   | `portal`                          | Código do tenant/corporação padrão |

### Exemplo de `.env`

```env
VITE_API_BASE_URL=https://api.gateway.mdm-hub.com
VITE_API_TENANT=minha-empresa
```

> **Nota:** O tenant aparece visível na tela de Login para o usuário saber qual corporação está acessando.

---

## 13. Endpoints da API Consumidos

| Ferramenta       | Método   | Endpoint                                          | Descrição                        |
| ---------------- | -------- | ------------------------------------------------- | -------------------------------- |
| Todas            | `POST`   | `/api-acl/authentication/login`                   | Autenticação                     |
| Checker, Deleter | `GET`    | `/api-eqp/equipment?key={serial}`                 | Busca equipamento por serial     |
| Checker          | `GET`    | `/api-eqp/equipment-application-historic/{id}`    | Histórico de apps do equipamento |
| ApkFinder        | `GET`    | `/api-application/application?corporationId={id}` | Lista apps de uma corporação     |
| ApkFinder        | `GET`    | `/api-application/application/{id}`               | Detalhes e versões de um app     |
| Deleter          | `PATCH`  | `/api-eqp/equipment/{id}`                         | Inativar equipamento             |
| Deleter          | `DELETE` | `/api-eqp/equipment/{id}`                         | Deletar equipamento              |
| Forcer           | `POST`   | `/api-eqp/device-data/device/{serial}/force-data` | Forçar sincronização             |

---

## 14. Fluxo de Dados da Aplicação

```
                      ┌─────────────────────────────────────┐
                      │          App.tsx (Raiz)              │
                      │  api.hasToken() → isAuthenticated    │
                      └──────────────┬──────────────────────┘
                                     │
                    ┌────────────────┴─────────────────┐
                    │                                  │
             isAuthenticated=false           isAuthenticated=true
                    │                                  │
             ┌──────▼──────┐                  ┌───────▼──────┐
             │  Login.tsx   │                  │  MainApp.tsx  │
             │  api.login() │                  │  Tab Router   │
             └──────┬───────┘                  └───────┬──────┘
                    │ onLoginSuccess                    │
                    └──────────────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │                      │
        <Checker />           <ApkFinder />           <Deleter />           <Forcer />
        useChecker()          useApkSearch()           useDeleter()          useForcer()
              │                      │                      │                      │
              └──────────────────────┴──────────────────────┴──────────────────────┘
                                             │
                                      api.fetch()
                                (JWT + tenant + retry)
                                             │
                                  MDM Hub REST API
```

---

## 15. Guia de Desenvolvimento

### Instalação e Setup

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env  # ou criar manualmente

# Iniciar servidor de desenvolvimento
npm run dev
```

### Scripts disponíveis

| Script     | Comando           | Descrição                                               |
| ---------- | ----------------- | ------------------------------------------------------- |
| Dev server | `npm run dev`     | Inicia Vite HMR em modo desenvolvimento                 |
| Build      | `npm run build`   | Compila TypeScript e gera bundle de produção em `dist/` |
| Lint       | `npm run lint`    | Executa ESLint em todo o projeto                        |
| Preview    | `npm run preview` | Serve o build de produção localmente                    |

### Adicionando uma nova ferramenta

1. Crie a pasta `src/tools/NovaTool/`
2. Implemente o hook `useNovaTool.ts` com toda a lógica de negócio
3. Crie os componentes: `index.tsx`, `ConfigPanel.tsx`, `ProgressPanel.tsx`, `LogPanel.tsx`
4. Registre a nova aba em `src/App.tsx`:
   - Adicione o tipo na union: `"checker" | "deleter" | "apk" | "forcer" | "nova"`
   - Adicione um `<TabButton>` no `tablist`
   - Adicione a renderização condicional no `<main>`

### Deploy

O projeto está configurado para deploy na **Vercel**. Para deploy manual:

```bash
npm run build
# Servir o diretório dist/ com qualquer servidor estático
```

---

## 16. Considerações de Segurança

| Risco                             | Status         | Mitigação                                                   |
| --------------------------------- | -------------- | ----------------------------------------------------------- |
| Token JWT exposto no localStorage | ⚠️ Conhecido   | Padrão comum em SPAs; token tem vida curta via auto-refresh |
| Senha em sessionStorage           | ⚠️ Necessário  | Limitado ao ciclo de vida da aba do browser                 |
| CORS                              | ✅ Gerenciado  | Controlado pela API do MDM Hub                              |
| HTTPS                             | ✅ Obrigatório | URL base usa HTTPS por padrão                               |
| XSS                               | ✅ Protegido   | React escapa automaticamente conteúdo dinâmico              |
| Deleção sem confirmação dupla     | ⚠️ Atenção     | Considerar adicionar modal de confirmação no Deleter        |

---

_Documentação gerada com base na análise do código-fonte — v1.2.1 — Amazonas Inovare Tecnologia._
