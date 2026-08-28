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
  List,
  UserCheck,
  HelpCircle,
  Home as HomeIcon,
  Terminal,
  History as HistoryIcon,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  ListFilter,
  Bug,
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
import { Button } from "./components/ui/button";
import Login from "./components/Login";
import FeedbackModal from "./components/FeedbackModal";
import ReleaseNotesButton from "./components/ReleaseNotesButton";
import SystemTour from "./components/SystemTour";

// Mobile Header component (shown only below md breakpoint)
const MobileHeader = ({
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
    <header className="flex justify-between items-center mb-6 pb-4 border-b border-border/40 gap-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Terminal size={16} className="text-primary-foreground" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-foreground whitespace-nowrap font-mono">
          MDM Hub
        </h1>
      </div>

      <div
        className="flex items-center gap-1 flex-shrink-0"
        data-tour="header-controls"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onStartTour}
          title="Iniciar Tour"
          className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer h-9 w-9"
        >
          <HelpCircle size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Alternar Tema"
          className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer h-9 w-9"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        {username && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sair"
            className="text-muted-foreground hover:text-destructive rounded-lg cursor-pointer h-9 w-9"
          >
            <LogOut size={16} />
          </Button>
        )}
      </div>
    </header>
  );
};

// Sidebar navigation item button
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
      w-full flex items-center transition-all duration-150 cursor-pointer rounded-lg font-medium text-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
      ${isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"}
      ${
        isActive
          ? "bg-primary/10 text-primary font-semibold shadow-xs"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      }
    `}
  >
    {!isCollapsed && (
      <span
        className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${
          isActive ? "bg-primary scale-100" : "bg-transparent scale-0"
        }`}
      />
    )}
    <Icon
      size={17}
      className={`shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/70"}`}
    />
    {!isCollapsed && <span className="whitespace-nowrap text-sm">{label}</span>}
  </button>
);

// Accordion group for sidebar sections
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
    return <div className="space-y-1 py-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-primary/70 shrink-0" />
          <span className="whitespace-nowrap">{title}</span>
          {badge && (
            <span
              className={`text-[9px] font-bold px-1.5 py-px rounded uppercase shrink-0 ${
                isRootBadge
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp
            size={14}
            className="text-muted-foreground/50 shrink-0 ml-1"
          />
        ) : (
          <ChevronDown
            size={14}
            className="text-muted-foreground/50 shrink-0 ml-1"
          />
        )}
      </button>

      {isOpen && (
        <div className="space-y-0.5 pl-1 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Mobile floating tab bar button
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
      mobile-bottom-nav-btn p-2.5 rounded-xl
      ${
        isActive
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 scale-[1.08]"
          : "text-muted-foreground/70 hover:bg-accent hover:text-foreground"
      }
    `}
  >
    <Icon
      size={17}
      className={
        isActive ? "text-primary-foreground" : "text-muted-foreground/70"
      }
    />
    <span className="hidden md:inline ml-2 text-sm">{label}</span>
  </button>
);

type ActiveTab =
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
  | "bugs_hub";

// Main authenticated application
const MainApp = ({
  username,
  onLogout,
}: {
  username: string | null;
  onLogout: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
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

  const restrictions = api.getRestrictions();
  const isRootUser = restrictions.isRoot;

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

  const userInitial = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 justify-between transition-all duration-300 sidebar-glow
          ${isSidebarCollapsed ? "w-[68px] p-3" : "w-[280px] p-5"}
        `}
        style={{
          backgroundColor: "var(--color-sidebar)",
          borderRight: "1px solid var(--color-sidebar-border)",
        }}
      >
        <div className="space-y-5">
          {/* Brand and toggle */}
          <div
            className={`flex items-center gap-2.5 py-1 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}
          >
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Terminal size={16} className="text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-foreground font-mono tracking-tight leading-tight whitespace-nowrap">
                    MDM Hub
                  </p>
                  {/* <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest leading-tight">
                    Tools Platform
                  </p> */}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
              className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer h-8 w-8 shrink-0"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </Button>
          </div>

          {/* Nav links */}
          <nav
            role="tablist"
            data-tour="tab-list"
            className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none"
          >
            <SubNavButton
              label="Inicio"
              icon={HomeIcon}
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              isCollapsed={isSidebarCollapsed}
              data-tour="tab-home"
            />

            {isRootUser && (
              <div className={isSidebarCollapsed ? "" : "mt-2"}>
                <AccordionGroup
                  title="Chamados"
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
              </div>
            )}

            <div className={isSidebarCollapsed ? "" : "mt-2"}>
              <AccordionGroup
                title="Automacoes MDM"
                icon={Wrench}
                defaultOpen={true}
                isCollapsed={isSidebarCollapsed}
              >
                <SubNavButton
                  label="Inspecionar Versoes"
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
                  label="Delecao em Massa"
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
                  label="Clonar Usuario"
                  icon={UserCheck}
                  isActive={activeTab === "cloner"}
                  onClick={() => setActiveTab("cloner")}
                  isCollapsed={isSidebarCollapsed}
                  data-tour="tab-cloner"
                />
                <SubNavButton
                  label="Historico e Auditoria"
                  icon={HistoryIcon}
                  isActive={activeTab === "history"}
                  onClick={() => setActiveTab("history")}
                  isCollapsed={isSidebarCollapsed}
                  data-tour="tab-history"
                />
              </AccordionGroup>
            </div>
          </nav>
        </div>

        {/* Sidebar footer */}
        <div
          className={`space-y-3 pt-4 border-t border-border/30 ${isSidebarCollapsed ? "flex flex-col items-center gap-1.5" : ""}`}
        >
          {username && !isSidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/40 border border-border/30">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-foreground font-mono">
                  {userInitial}
                </span>
              </div>
              <span className="font-mono text-sm font-medium text-foreground truncate">
                {username}
              </span>
            </div>
          )}
          {username && isSidebarCollapsed && (
            <div
              className="w-8 h-8 rounded-md bg-primary flex items-center justify-center cursor-default"
              title={username}
            >
              <span className="text-xs font-bold text-primary-foreground font-mono">
                {userInitial}
              </span>
            </div>
          )}

          <div
            className={`flex items-center ${isSidebarCollapsed ? "flex-col gap-1.5" : "gap-1.5"}`}
            data-tour="header-controls"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartTour}
              title="Iniciar Tour"
              className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer h-8 w-8 shrink-0"
            >
              <HelpCircle size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title="Alternar Tema"
              className="text-muted-foreground hover:text-foreground rounded-lg cursor-pointer h-8 w-8 shrink-0"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            {username && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                title="Sair"
                className="text-muted-foreground hover:text-destructive rounded-lg cursor-pointer h-8 w-8 shrink-0"
              >
                <LogOut size={16} />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "md:pl-[68px]" : "md:pl-[280px]"}`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-32 sm:pt-8 sm:pb-12">
          {/* Mobile header */}
          <div className="md:hidden">
            <MobileHeader
              username={username}
              onLogout={onLogout}
              onStartTour={handleStartTour}
            />
          </div>

          <main className="animate-in fade-in slide-in-from-bottom-2 duration-400">
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

      {/* Mobile bottom nav via React Portal */}
      {createPortal(
        <div
          role="tablist"
          className="mobile-bottom-nav flex gap-1 scrollbar-none md:hidden"
        >
          <MobileTabButton
            label="Inicio"
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
            label="Versoes"
            icon={Smartphone}
            isActive={activeTab === "checker"}
            onClick={() => setActiveTab("checker")}
          />
          <MobileTabButton
            label="APKs"
            icon={Package}
            isActive={activeTab === "apk"}
            onClick={() => setActiveTab("apk")}
          />
          <MobileTabButton
            label="Delecao"
            icon={Trash2}
            isActive={activeTab === "deleter"}
            onClick={() => setActiveTab("deleter")}
          />
          <MobileTabButton
            label="Force Data"
            icon={RefreshCw}
            isActive={activeTab === "forcer"}
            onClick={() => setActiveTab("forcer")}
          />
          <MobileTabButton
            label="Exportar"
            icon={List}
            isActive={activeTab === "fetcher"}
            onClick={() => setActiveTab("fetcher")}
          />
          <MobileTabButton
            label="Clonar"
            icon={UserCheck}
            isActive={activeTab === "cloner"}
            onClick={() => setActiveTab("cloner")}
          />
          <MobileTabButton
            label="Historico"
            icon={HistoryIcon}
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </div>,
        document.body,
      )}

      <SystemTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        onActivateTab={setActiveTab}
      />
    </div>
  );
};

// Root application with auth gate
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
      <ReleaseNotesButton />
    </ThemeProvider>
  );
}

export default App;
