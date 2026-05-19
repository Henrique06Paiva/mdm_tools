import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { api } from "./api";
import { Sun, Moon, Smartphone, Package, Trash2 } from "lucide-react";
import Checker from "./tools/Checker";
import Deleter from "./tools/Deleter";
import ApkFinder from "./tools/ApkFinder";
import { Button } from "./components/ui/button";

const Header = ({
  status,
  isAuthenticating,
}: {
  status: string;
  isAuthenticating: boolean;
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-border/40">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">
          MDM Hub
        </h1>
        <div className="text-sm text-muted-foreground font-medium">
          Gerenciamento de inventário
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
          <div
            className={`w-2 h-2 rounded-full ${isAuthenticating ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
          ></div>
          {status}
        </div>
        <div className="w-px h-6 bg-border"></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Alternar Tema"
          className="text-muted-foreground hover:text-foreground rounded-full"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
};

const TabButton = ({
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
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      ${
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02]"
      }
    `}
  >
    <Icon
      size={16}
      className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
    />
    {label}
  </button>
);

const MainApp = () => {
  const [activeTab, setActiveTab] = useState<"checker" | "deleter" | "apk">(
    "checker",
  );
  const [authStatus, setAuthStatus] = useState("Autenticando...");
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const login = async () => {
      const success = await api.performLogin();
      setIsAuthenticating(false);
      setAuthStatus(success ? "Autenticado" : "Falha na Autenticação");
    };
    login();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Header status={authStatus} isAuthenticating={isAuthenticating} />

        <div 
          role="tablist"
          className="flex overflow-x-auto flex-nowrap md:flex-wrap gap-2 mb-8 bg-muted/20 p-1.5 rounded-xl border border-border/40 w-full md:w-fit scrollbar-none"
        >
          <TabButton
            label="Version Checker"
            icon={Smartphone}
            isActive={activeTab === "checker"}
            onClick={() => setActiveTab("checker")}
          />
          <TabButton
            label="APK Finder"
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
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "checker" && <Checker />}
          {activeTab === "deleter" && <Deleter />}
          {activeTab === "apk" && <ApkFinder />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

export default App;
