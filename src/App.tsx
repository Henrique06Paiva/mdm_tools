import { useState, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { api } from './api';
import { Sun, Moon, Smartphone, Package, Trash2 } from 'lucide-react';
import Checker from './tools/Checker';
import Deleter from './tools/Deleter';
import ApkFinder from './tools/ApkFinder';

const Header = ({ status, isAuthenticating }: { status: string, isAuthenticating: boolean }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '4px' }}>MDM Hub</h1>
        <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Gerenciamento de inventário</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text2)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAuthenticating ? 'var(--amber)' : 'var(--green)' }}></div>
          {status}
        </div>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }}></div>
        <button 
          onClick={toggleTheme} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}
          title="Alternar Tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

const MainApp = () => {
  const [activeTab, setActiveTab] = useState<'checker' | 'deleter' | 'apk'>('checker');
  const [authStatus, setAuthStatus] = useState('Autenticando...');
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const login = async () => {
      const success = await api.performLogin();
      setIsAuthenticating(false);
      setAuthStatus(success ? 'Autenticado' : 'Falha na Autenticação');
    };
    login();
  }, []);

  const TabButton = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        border: 'none',
        background: activeTab === id ? 'var(--bg2)' : 'transparent',
        color: activeTab === id ? 'var(--text)' : 'var(--text3)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="shell">
      <Header status={authStatus} isAuthenticating={isAuthenticating} />
      
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
        <TabButton id="checker" label="Version Checker" icon={Smartphone} />
        <TabButton id="apk" label="APK Finder" icon={Package} />
        <TabButton id="deleter" label="Deleção em Massa" icon={Trash2} />
      </div>

      <div className="tab-content">
        {activeTab === 'checker' && <Checker />}
        {activeTab === 'deleter' && <Deleter />}
        {activeTab === 'apk' && <ApkFinder />}
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
