# MDM Tools - Project-Scoped Agent Rules

Este arquivo documenta os padrões e diretrizes de design de interface (UI/UX) estabelecidos para o projeto MDM Tools, focando na usabilidade móvel, acessibilidade e prevenção de quebras de layout.

## 1. Navegação Principal no Mobile

- **Renderização via React Portal:** O menu de navegação de abas no mobile (resoluções abaixo de `768px`) deve sempre ser renderizado através de React Portal (`createPortal`) anexado ao `document.body`. Isso contorna de forma definitiva restrições de empilhamento de CSS (stacking contexts) e propriedades de animação (`transform`) dos elementos pais que quebram o posicionamento `fixed`.
- **Layout Flutuante (Floating Bottom Bar):** A barra de abas no rodapé móvel deve ser flutuante, elevada do rodapé da janela (`bottom: 12px`, `left: 12px`, `right: 12px`) com `z-index: 9999` e cantos arredondados (`border-radius: 1rem`). Isso evita que ela seja coberta por barras nativas de navegadores ou rodapés de emulação de dispositivos.
- **Redução para Ícones:** Em telas pequenas, oculte os textos das abas (`hidden md:inline`) e mantenha apenas os ícones centralizados e com `aria-label` descritivos para fins de acessibilidade (WCAG 2.2).

## 2. Prevenção de Scroll Horizontal ("Quebra de Tela")

- **Viewport Fixo:** Mantenha sempre `html, body { max-width: 100vw; overflow-x: hidden; }` no arquivo global de estilos (`index.css`) para blindar a página inteira contra rolagem lateral indesejada.
- **Tabelas Responsivas:** Toda tabela de dados volumosa ou com colunas largas deve obrigatoriamente ser envelopada em um container wrapper com controle de scroll interno:
  ```tsx
  <div className="w-full max-w-full overflow-x-auto rounded-md border border-border/40">
    <Table>...</Table>
  </div>
  ```
  Isso faz com que as colunas rolem internamente dentro do próprio card da ferramenta, impedindo que o card ou o layout da página seja esticado horizontalmente.

## 3. Posicionamento de Elementos Flutuantes

- **Botão de Feedback:** Para evitar colisões de cliques com a barra de navegação no rodapé, o botão de feedback deve ter comportamento responsivo de posicionamento:
  - No desktop: `bottom-6 right-6`
  - No mobile (abaixo de `768px`): `bottom-[88px] right-4` (`max-md:bottom-[88px] max-md:right-4`)
    Isso o posiciona perfeitamente na zona ergonômica de alcance do polegar, mas logo acima da barra de navegação flutuante.

## 4. Design do Cabeçalho (Header)

- **Compacto e Clean:** Evite badges de status estáticos longos ou pesados que consumam muito espaço horizontal útil do cabeçalho.
- **Título Resiliente:** O título principal (`MDM Hub - Tools`) deve usar a classe `whitespace-nowrap` e dimensionamento responsivo (`text-lg sm:text-2xl`) para garantir o alinhamento em linha única com os controles no topo, prevenindo quebras de linha em viewports de 360px a 430px.

## 5. Padrão Obrigatório de Git, Branches, Commits e Releases

- **Feature Branches:** Toda nova funcionalidade, módulo ou refatoração deve ser criada em uma branch com prefixo semântico:
  - `feature/<nome-da-feature>` (ex: `feature/bugs-catalog-module`)
  - `fix/<nome-do-fix>` (ex: `fix/table-scrollbars-dropdown`)
- **Commits Convencionais:** Mensagens de commit estruturadas seguindo o padrão Conventional Commits:
  - `feat(bugs): descrição da funcionalidade`
  - `fix(bugs): correção de bug ou layout`
  - `refactor(bugs): refatoração de código ou componentes`
- **Fluxo de Release e Merge:**
  1. Atualizar a versão correspondente no `package.json` (Semantic Versioning: `MAJOR.MINOR.PATCH`).
  2. Registrar o histórico completo de novidades e melhorias em `src/data/releaseNotes.ts` marcando `isLatest: true`.
  3. Criar a branch de release: `git checkout -b release/vX.Y.Z`.
  4. Realizar o commit das alterações na branch de release.
  5. Executar o teste de build do projeto: `npm run build` (garantindo 100% de sucesso e 0 erros de TypeScript/Vite).
  6. Realizar o merge da branch de release na `main`: `git checkout main && git merge release/vX.Y.Z`.
  7. Criar a tag correspondente: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
