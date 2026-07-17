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
} from "lucide-react";
import Checker from "./tools/Checker";
import Deleter from "./tools/Deleter";
import ApkFinder from "./tools/ApkFinder";
import Forcer from "./tools/Forcer";
import Fetcher from "./tools/Fetcher";
import Cloner from "./tools/Cloner";
import { Button } from "./components/ui/button";
import Login from "./components/Login";
import FeedbackModal from "./components/FeedbackModal";
import SystemTour from "./components/SystemTour";

const Header = ({
  status,
  isAuthenticating,
  username,
  onLogout,
  onStartTour,
}: {
  status: string;
  isAuthenticating: boolean;
  username: string | null;
  onLogout: () => void;
  onStartTour: () => void;
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-border/40">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">
          MDM Hub - Tools
        </h1>
      </div>
      <div className="flex items-center gap-4" data-tour="header-controls">
        {username && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-md border border-border/30">
            <User size={12} className="text-muted-foreground/80" />
            <span className="font-mono">{username}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
          <div
            className={`w-2 h-2 rounded-full ${isAuthenticating ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
          ></div>
          {status}
        </div>
        <div className="w-px h-6 bg-border"></div>
        {username && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onStartTour}
              title="Iniciar Tour"
              className="text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
            >
              <HelpCircle size={18} />
            </Button>
            <div className="w-px h-6 bg-border"></div>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Alternar Tema"
          className="text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        {username && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Sair"
            className="text-muted-foreground hover:text-destructive rounded-full cursor-pointer"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </header>
  );
};

const TabButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
  "data-tour": dataTour,
}: {
  label: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
  "data-tour"?: string;
}) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    aria-label={label}
    data-tour={dataTour}
    className={`
      flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      mobile-bottom-nav-btn
      md:gap-2 md:px-4 md:py-2.5 md:rounded-lg text-sm font-semibold
      ${
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02]"
      }
    `}
  >
    <Icon
      size={18}
      className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
    />
    <span className="hidden md:inline">{label}</span>
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
    "checker" | "deleter" | "apk" | "forcer" | "fetcher" | "cloner"
  >("checker");
  const [authStatus] = useState("Autenticado");
  const [isAuthenticating] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

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

  useEffect(() => {
    const el = document.querySelector('[data-tour="tab-list"]');
    if (el) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      console.log(`TABLIST DEBUG - Rect: top=${rect.top} bottom=${rect.bottom} left=${rect.left} right=${rect.right} width=${rect.width} height=${rect.height}`);
      console.log(`TABLIST DEBUG - Style: position=${style.position} bottom=${style.bottom} display=${style.display} visibility=${style.visibility} zIndex=${style.zIndex} opacity=${style.opacity}`);
    } else {
      console.log("TABLIST DEBUG: Element not found in DOM");
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-32 sm:pt-10 sm:pb-32">
        <Header
          status={authStatus}
          isAuthenticating={isAuthenticating}
          username={username}
          onLogout={onLogout}
          onStartTour={handleStartTour}
        />

        {/* Desktop Tab Navigation */}
        <div
          role="tablist"
          data-tour="tab-list"
          className="
            hidden md:flex gap-2 mb-8 bg-muted/20 p-1.5 border border-border/40 w-full scrollbar-none
            md:flex-nowrap md:flex-wrap md:w-fit rounded-xl overflow-x-auto
          "
        >
          <TabButton
            label="Validação de versão"
            icon={Smartphone}
            isActive={activeTab === "checker"}
            onClick={() => setActiveTab("checker")}
            data-tour="tab-checker"
          />
          <TabButton
            label="Busca de APKs"
            icon={Package}
            isActive={activeTab === "apk"}
            onClick={() => setActiveTab("apk")}
            data-tour="tab-apk"
          />
          <TabButton
            label="Deleção em Massa"
            icon={Trash2}
            isActive={activeTab === "deleter"}
            onClick={() => setActiveTab("deleter")}
            data-tour="tab-deleter"
          />
          <TabButton
            label="Force Data em Massa"
            icon={RefreshCw}
            isActive={activeTab === "forcer"}
            onClick={() => setActiveTab("forcer")}
            data-tour="tab-forcer"
          />
          <TabButton
            label="Exportador de Terminais"
            icon={List}
            isActive={activeTab === "fetcher"}
            onClick={() => setActiveTab("fetcher")}
            data-tour="tab-fetcher"
          />
          <TabButton
            label="Clonar Usuário"
            icon={UserCheck}
            isActive={activeTab === "cloner"}
            onClick={() => setActiveTab("cloner")}
            data-tour="tab-cloner"
          />
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "checker" && <Checker />}
          {activeTab === "deleter" && <Deleter />}
          {activeTab === "apk" && <ApkFinder />}
          {activeTab === "forcer" && <Forcer />}
          {activeTab === "fetcher" && <Fetcher />}
          {activeTab === "cloner" && <Cloner />}
        </main>
      </div>

      {/* Mobile Floating Bottom Tab Navigation (via Portal to escape parenting context issues) */}
      {createPortal(
        <div
          role="tablist"
          className="mobile-bottom-nav flex gap-2 border border-border/40 scrollbar-none md:hidden"
        >
          <TabButton
            label="Validação de versão"
            icon={Smartphone}
            isActive={activeTab === "checker"}
            onClick={() => setActiveTab("checker")}
          />
          <TabButton
            label="Busca de APKs"
            icon={Package}
            isActive={activeTab === "apk"}
            onClick={() => setActiveTab("apk")}
          />
          <TabButton
            label="Deleção em Massa"
            icon={Trash2}
            isActive={activeTab === "deleter"}
            onClick={() => setActiveTab("deleter")}
          />
          <TabButton
            label="Force Data em Massa"
            icon={RefreshCw}
            isActive={activeTab === "forcer"}
            onClick={() => setActiveTab("forcer")}
          />
          <TabButton
            label="Exportador de Terminais"
            icon={List}
            isActive={activeTab === "fetcher"}
            onClick={() => setActiveTab("fetcher")}
          />
          <TabButton
            label="Clonar Usuário"
            icon={UserCheck}
            isActive={activeTab === "cloner"}
            onClick={() => setActiveTab("cloner")}
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
