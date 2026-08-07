import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { api } from "./api";
import {
  Sun,
  Moon,
  Smartphone,
  Package,
  Trash2,
  RefreshCw,
  LogOut,
  User,
  List,
  UserCheck,
  HelpCircle,
  Home as HomeIcon,
} from "lucide-react";
import Checker from "./tools/Checker";
import Deleter from "./tools/Deleter";
import ApkFinder from "./tools/ApkFinder";
import Forcer from "./tools/Forcer";
import Fetcher from "./tools/Fetcher";
import Cloner from "./tools/Cloner";
import HistoryTool from "./tools/History";
import Incidents from "./tools/Incidents";
import { IncidentsListTool } from "./tools/Incidents/IncidentsListTool";
import BugsHub from "./tools/Bugs/index";
import Home from "./tools/Home/Home";
import { History as HistoryIcon, AlertCircle, ChevronDown, ChevronUp, LifeBuoy, Wrench, PanelLeftClose, PanelLeftOpen, PlusCircle, ListFilter, Bug } from "lucide-react";
import { Button } from "./components/ui/button";
import Login from "./components/Login";
import FeedbackModal from "./components/FeedbackModal";
import SystemTour from "./components/SystemTour";

const Header = ({
  username,
  onLogout,
  onStartTour,
}: {
  username: string | null;
  onLogout: () => void;
  onStartTour: () => void;
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-border/40 gap-4">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
          MDM Hub - Tools
        </h1>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0" data-tour="header-controls">
        {username && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-md border border-border/30">
            <User size={12} className="text-muted-foreground/80" />
            <span className="font-mono">{username}</span>
          </div>
        )}
        {username && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onStartTour}
              title="Iniciar Tour"
              className="text-muted-foreground hover:text-foreground rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
            >
              <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>
            <div className="w-px h-6 bg-border hidden sm:block"></div>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Alternar Tema"
          className="text-muted-foreground hover:text-foreground rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
        >
          {theme === "dark" ? (
            <Sun size={16} className="sm:w-[18px] sm:h-[18px]" />
          ) : (
            <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />
          )}
        </Button>
        {username && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sair"
            className="text-muted-foreground hover:text-destructive rounded-full cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
          >
            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Button>
        )}
      </div>
    </header>
  );
};

const SubNavButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
  isCollapsed = false,
  "data-tour": dataTour,
}: {
  label: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
  "data-tour"?: string;
}) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    aria-label={label}
    title={isCollapsed ? label : undefined}
    data-tour={dataTour}
    className={`
      w-full flex items-center transition-all duration-150 cursor-pointer rounded-xl font-medium text-xs sm:text-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      ${
        isCollapsed
          ? "justify-center p-2.5"
          : "gap-3 px-3 py-2.5"
      }
      ${
        isActive
          ? "bg-primary/15 text-primary font-bold shadow-xs border-l-4 border-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }
    `}
  >
    <Icon size={18} className={`shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
    {!isCollapsed && <span className="whitespace-nowrap font-medium text-xs sm:text-[13px]">{label}</span>}
  </button>
);

const AccordionGroup = ({
  title,
  icon: Icon,
  badge,
  isRootBadge = false,
  defaultOpen = true,
  isCollapsed = false,
  children,
}: {
  title: string;
  icon: any;
  badge?: string;
  isRootBadge?: boolean;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <div className="space-y-2 py-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-primary shrink-0" />
          <span className="whitespace-nowrap text-xs font-bold">{title}</span>
          {badge && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                isRootBadge
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={14} className="text-muted-foreground shrink-0 ml-1" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground shrink-0 ml-1" />
        )}
      </button>

      {isOpen && (
        <div className="pl-2 space-y-1 border-l-2 border-border/40 ml-2 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const MobileTabButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    aria-label={label}
    className={`
      flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      mobile-bottom-nav-btn p-2.5 rounded-xl text-sm font-semibold
      ${
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.05]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }
    `}
  >
    <Icon
      size={18}
      className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
    />
    <span className="hidden md:inline ml-2">{label}</span>
  </button>
);

const MainApp = ({
  username,
  onLogout,
}: {
  username: string | null;
  onLogout: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "checker"
    | "deleter"
    | "apk"
    | "forcer"
    | "fetcher"
    | "cloner"
    | "history"
    | "incidents"
    | "incidents_list"
    | "bugs_hub"
  >("home");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("mdm_sidebar_collapsed") === "true";
  });

  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("mdm_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Verifica se o usuário autenticado possui perfil Root
  const restrictions = api.getRestrictions();
  const isRootUser = restrictions.isRoot;

  // Proteção de rota: Se não for usuário Root e tentar acessar abas de chamados/bugs, redireciona para "home"
  useEffect(() => {
    if (
      !isRootUser &&
      (activeTab === "incidents" ||
        activeTab === "incidents_list" ||
        activeTab === "bugs_hub")
    ) {
      setActiveTab("home");
    }
  }, [isRootUser, activeTab]);

  // Trigger tour automatically on first access (per username)
  useEffect(() => {
    if (username) {
      const tourKey = `mdm_tour_completed_${username}`;
      const hasCompletedTour = localStorage.getItem(tourKey);
      if (!hasCompletedTour) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [username]);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    if (username) {
      localStorage.setItem(`mdm_tour_completed_${username}`, "true");
    }
  };

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop Sidebar Navigation Categorizada com Suporte a Minimização */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 bg-card border-r border-border/40 z-30 justify-between transition-all duration-300 ${
          isSidebarCollapsed ? "w-16 p-2.5" : "w-72 p-5"
        }`}
      >
        <div className="space-y-5">
          {/* Brand Header & Toggle Button */}
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap">
                MDM-Tools
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
              className="text-muted-foreground hover:text-foreground rounded-xl cursor-pointer h-8 w-8 shrink-0 mx-auto md:mx-0"
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </Button>
          </div>

          <nav
            role="tablist"
            data-tour="tab-list"
            className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none pr-0.5"
          >
            {/* Início (Direct Link) */}
            <SubNavButton
              label="Início"
              icon={HomeIcon}
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              isCollapsed={isSidebarCollapsed}
              data-tour="tab-home"
            />

            {/* Acordeão Módulo 1: Gestão de Chamados (Exclusivo Root) */}
            {isRootUser && (
              <AccordionGroup
                title="Gestão de Chamados"
                icon={LifeBuoy}
                badge="Root"
                isRootBadge={true}
                defaultOpen={true}
                isCollapsed={isSidebarCollapsed}
              >
                <SubNavButton
                  label="Novo Chamado"
                  icon={PlusCircle}
                  isActive={activeTab === "incidents"}
                  onClick={() => setActiveTab("incidents")}
                  isCollapsed={isSidebarCollapsed}
                  data-tour="tab-incidents"
                />
                <SubNavButton
                  label="Lista de Chamados"
                  icon={ListFilter}
                  isActive={activeTab === "incidents_list"}
                  onClick={() => setActiveTab("incidents_list")}
                  isCollapsed={isSidebarCollapsed}
                  data-tour="tab-incidents-list"
                />
                <SubNavButton
                  label="Bugs Conhecidos"
                  icon={Bug}
                  isActive={activeTab === "bugs_hub"}
                  onClick={() => setActiveTab("bugs_hub")}
                  isCollapsed={isSidebarCollapsed}
                  data-tour="tab-bugs-hub"
                />
              </AccordionGroup>
            )}

            {/* Acordeão Módulo 2: Automações MDM */}
            <AccordionGroup
              title="Automações MDM"
              icon={Wrench}
              defaultOpen={true}
              isCollapsed={isSidebarCollapsed}
            >
              <SubNavButton
                label="Inspecionar Versões"
                icon={Smartphone}
                isActive={activeTab === "checker"}
                onClick={() => setActiveTab("checker")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-checker"
              />
              <SubNavButton
                label="Busca de APKs"
                icon={Package}
                isActive={activeTab === "apk"}
                onClick={() => setActiveTab("apk")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-apk"
              />
              <SubNavButton
                label="Deleção em Massa"
                icon={Trash2}
                isActive={activeTab === "deleter"}
                onClick={() => setActiveTab("deleter")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-deleter"
              />
              <SubNavButton
                label="Force Data em Massa"
                icon={RefreshCw}
                isActive={activeTab === "forcer"}
                onClick={() => setActiveTab("forcer")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-forcer"
              />
              <SubNavButton
                label="Exportador de Terminais"
                icon={List}
                isActive={activeTab === "fetcher"}
                onClick={() => setActiveTab("fetcher")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-fetcher"
              />
              <SubNavButton
                label="Clonar Usuário"
                icon={UserCheck}
                isActive={activeTab === "cloner"}
                onClick={() => setActiveTab("cloner")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-cloner"
              />
              <SubNavButton
                label="Histórico & Auditoria"
                icon={HistoryIcon}
                isActive={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                isCollapsed={isSidebarCollapsed}
                data-tour="tab-history"
              />
            </AccordionGroup>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          {username && !isSidebarCollapsed && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 px-3 py-2.5 rounded-xl border border-border/30">
              <User size={14} className="text-muted-foreground/80 shrink-0" />
              <span className="font-mono truncate">{username}</span>
            </div>
          )}

          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "flex-col gap-2 justify-center" : "justify-between"
            }`}
            data-tour="header-controls"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartTour}
              title="Iniciar Tour"
              className="text-muted-foreground hover:text-foreground rounded-full cursor-pointer h-8 w-8 shrink-0"
            >
              <HelpCircle size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Alternar Tema"
              className="text-muted-foreground hover:text-foreground rounded-full cursor-pointer h-8 w-8 shrink-0"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            {username && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                title="Sair"
                className="text-muted-foreground hover:text-destructive rounded-full cursor-pointer h-8 w-8 shrink-0"
              >
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area com Margem Dinâmica */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "md:pl-16" : "md:pl-72"}`}>
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-32 sm:pt-10 sm:pb-10">
          {/* Mobile Header */}
          <div className="md:hidden">
            <Header
              username={username}
              onLogout={onLogout}
              onStartTour={handleStartTour}
            />
          </div>

          <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "home" && (
              <Home
                username={username}
                onNavigate={setActiveTab}
                onStartTour={handleStartTour}
                isRootUser={isRootUser}
              />
            )}
            {activeTab === "incidents" && isRootUser && (
              <Incidents onGoToBugsHub={() => setActiveTab("bugs_hub")} />
            )}
            {activeTab === "incidents_list" && isRootUser && (
              <IncidentsListTool />
            )}
            {activeTab === "bugs_hub" && isRootUser && <BugsHub />}
            {activeTab === "checker" && <Checker />}
            {activeTab === "deleter" && <Deleter />}
            {activeTab === "apk" && <ApkFinder />}
            {activeTab === "forcer" && <Forcer />}
            {activeTab === "fetcher" && <Fetcher />}
            {activeTab === "cloner" && <Cloner />}
            {activeTab === "history" && <HistoryTool />}
          </main>
        </div>
      </div>

      {/* Mobile Floating Bottom Tab Navigation (via Portal ao document.body) */}
      {createPortal(
        <div
          role="tablist"
          className="mobile-bottom-nav flex gap-2 border border-border/40 scrollbar-none md:hidden"
        >
          <MobileTabButton
            label="Início"
            icon={HomeIcon}
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
          />
          {isRootUser && (
            <MobileTabButton
              label="Chamados"
              icon={AlertCircle}
              isActive={activeTab === "incidents"}
              onClick={() => setActiveTab("incidents")}
            />
          )}
          <MobileTabButton
            label="Versões"
            icon={Smartphone}
            isActive={activeTab === "checker"}
            onClick={() => setActiveTab("checker")}
          />
          <MobileTabButton
            label="Busca de APKs"
            icon={Package}
            isActive={activeTab === "apk"}
            onClick={() => setActiveTab("apk")}
          />
          <MobileTabButton
            label="Deleção em Massa"
            icon={Trash2}
            isActive={activeTab === "deleter"}
            onClick={() => setActiveTab("deleter")}
          />
          <MobileTabButton
            label="Force Data em Massa"
            icon={RefreshCw}
            isActive={activeTab === "forcer"}
            onClick={() => setActiveTab("forcer")}
          />
          <MobileTabButton
            label="Exportador de Terminais"
            icon={List}
            isActive={activeTab === "fetcher"}
            onClick={() => setActiveTab("fetcher")}
          />
          <MobileTabButton
            label="Clonar Usuário"
            icon={UserCheck}
            isActive={activeTab === "cloner"}
            onClick={() => setActiveTab("cloner")}
          />
          <MobileTabButton
            label="Histórico"
            icon={HistoryIcon}
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </div>,
        document.body
      )}

      <SystemTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onActivateTab={setActiveTab}
      />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.hasToken());
  const [username, setUsername] = useState<string | null>(api.getUsername());
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    api.registerOnUnauthorized(() => {
      setIsAuthenticated(false);
      setUsername(null);
      setIsSessionExpired(false);
    });

    api.registerOnSessionExpired(() => {
      setIsSessionExpired(true);
    });

    if (isAuthenticated) {
      setUsername(api.getUsername());
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUsername(api.getUsername());
    setIsSessionExpired(false);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUsername(null);
    setIsSessionExpired(false);
  };

  const handleOverlayLoginSuccess = () => {
    setIsSessionExpired(false);
    api.resolveSessionExpired(true);
    setUsername(api.getUsername());
  };

  const handleOverlayCancel = () => {
    api.resolveSessionExpired(false);
    api.logout();
    setIsSessionExpired(false);
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <ThemeProvider>
      {isAuthenticated ? (
        <>
          <MainApp username={username} onLogout={handleLogout} />
          {isSessionExpired && (
            <Login
              onLoginSuccess={handleOverlayLoginSuccess}
              isOverlay={true}
              onCancel={handleOverlayCancel}
            />
          )}
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      <FeedbackModal isAuthenticated={isAuthenticated} username={username} />
    </ThemeProvider>
  );
}

export default App;
