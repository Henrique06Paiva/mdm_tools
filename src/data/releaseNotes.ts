export type ChangeType = "feat" | "fix" | "improvement";

export interface ReleaseChange {
  type: ChangeType;
  description: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  summary?: string;
  changes: ReleaseChange[];
  isLatest?: boolean;
}

export const releaseNotesData: ReleaseNote[] = [
  {
    version: "v1.4.0",
    date: "23 de Julho de 2026",
    title: "Nova Home Page & Central de Release Notes ✨",
    summary:
      "Apresentamos a nova tela inicial do MDM Hub Tools com visão geral, atalhos rápidos para ferramentas e acompanhamento contínuo de novidades do sistema.",
    isLatest: true,
    changes: [
      {
        type: "feat",
        description:
          "Página inicial interativa com boas-vindas personalizadas ao usuário e atalhos com 1 clique para todas as ferramentas.",
      },
      {
        type: "feat",
        description:
          "Central de Release Notes com filtros por categoria (Feats, Fixes, Melhorias) para acompanhamento de atualizações.",
      },
      {
        type: "improvement",
        description:
          "Navegação aprimorada com integração total entre os cards de utilitários e as abas do sistema.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "23 de Julho de 2026",
    title: "Ajustes de Tema Escuro & Acessibilidade Mobile 🌙",
    summary:
      "Melhorias no contraste de cores do modo escuro e aprimoramento da navegação flutuante em dispositivos móveis.",
    changes: [
      {
        type: "improvement",
        description:
          "Suavização das cores de fundo no tema escuro para reduzir fadiga visual e aumentar contraste.",
      },
      {
        type: "improvement",
        description:
          "Fixação da barra flutuante mobile via React Portal para prevenção de conflitos de contexto de empilhamento (stacking context).",
      },
      {
        type: "fix",
        description:
          "Ajuste na posição do botão de feedback no mobile para evitar sobreposição com a navegação inferior.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "15 de Julho de 2026",
    title: "Histórico de Auditoria & Ferramenta de Clonagem de Usuário 👥",
    summary:
      "Lançamento de novas ferramentas para auditoria de ações e duplicação ágil de permissões de usuários.",
    changes: [
      {
        type: "feat",
        description:
          "Ferramenta de Clonagem de Usuário para duplicar configurações de acessos entre contas de forma automatizada.",
      },
      {
        type: "feat",
        description:
          "Módulo de Histórico & Auditoria com busca e exportação dos registros de operações executadas.",
      },
      {
        type: "improvement",
        description:
          "Adição de rotulagem e formatação responsiva de tabelas pesadas com scroll horizontal interno.",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "01 de Julho de 2026",
    title: "Operações em Massa (Deleção, Sync & Exportação) 🚀",
    summary:
      "Conjunto de ferramentas para gestão em lote de dispositivos via upload de planilhas Excel.",
    changes: [
      {
        type: "feat",
        description:
          "Deleção em Massa de terminais inativos com processamento em lote e logs em tempo real.",
      },
      {
        type: "feat",
        description:
          "Force Data em Massa para envio de comandos de sincronização forçada com o MDM.",
      },
      {
        type: "feat",
        description:
          "Exportador de Terminais com geração de relatórios completos em arquivos .xlsx.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "10 de Junho de 2026",
    title: "Lançamento do MDM Hub - Tools 📦",
    summary:
      "Versão inicial da plataforma unificada para validação de versões de firmware, busca de APKs e gestão de MDM.",
    changes: [
      {
        type: "feat",
        description:
          "Módulo Versões para verificação comparativa de pacotes e firmware nos dispositivos.",
      },
      {
        type: "feat",
        description:
          "Módulo Busca de APKs para localização e download direto de instaladores cadastrados.",
      },
      {
        type: "feat",
        description:
          "Sistema de autenticação segura, persistência de token e suporte a temas Claro/Escuro.",
      },
    ],
  },
];
