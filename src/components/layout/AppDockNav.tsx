import React from 'react';
import {
  Plus,
  Home,
  Receipt,
  Settings,
  Printer,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';

interface AppDockNavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onNewLaunch: () => void;
  onPrint: () => void;
  onManage?: () => void;
  toggleTheme: () => void;
  isDark: boolean;
  onLogout: () => void;
}

export default function AppDockNav({
  activeTab,
  onChangeTab,
  onNewLaunch,
  onPrint,
  onManage,
  toggleTheme,
  isDark,
  onLogout
}: AppDockNavProps) {
  const handleManage = () => {
    if (onManage) {
      onManage();
    } else {
      window.location.href = '/gerenciar.html';
    }
  };

  return (
    <nav
      className="dock-nav-fixed"
      aria-label="Navegação Principal"
    >
      <Dock
        className="dock-panel"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: '6px 14px',
          borderRadius: 22,
          backgroundColor: 'var(--panel)',
          border: '1px solid var(--panel-line)',
          boxShadow: 'var(--shadow-modal)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        panelHeight={58}
        magnification={68}
        distance={110}
      >
        {/* 1. NOVO LANÇAMENTO (Botão de Ação Destaque) */}
        <DockItem
          style={{
            backgroundColor: 'var(--blue)',
            borderRadius: '9999px',
            color: '#ffffff',
            boxShadow: 'var(--shadow-glow-blue)',
            border: 'none',
          }}
          onClick={onNewLaunch}
        >
          <DockLabel>Novo Lançamento</DockLabel>
          <DockIcon>
            <Plus size={22} color="#ffffff" strokeWidth={2.8} />
          </DockIcon>
        </DockItem>

        {/* 2. INÍCIO */}
        <DockItem
          style={{
            backgroundColor: activeTab === 'home' ? 'var(--blue-bg)' : 'transparent',
            borderColor: activeTab === 'home' ? 'var(--blue-border)' : 'transparent',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 14,
            color: activeTab === 'home' ? 'var(--blue-glow)' : 'var(--muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onClick={() => onChangeTab('home')}
        >
          <DockLabel>Início</DockLabel>
          <DockIcon>
            <Home
              size={20}
              color={activeTab === 'home' ? 'var(--blue-glow)' : 'var(--muted)'}
              strokeWidth={activeTab === 'home' ? 2.5 : 1.8}
            />
          </DockIcon>
        </DockItem>

        {/* 3. EXTRATO */}
        <DockItem
          style={{
            backgroundColor: activeTab === 'transactions' ? 'var(--blue-bg)' : 'transparent',
            borderColor: activeTab === 'transactions' ? 'var(--blue-border)' : 'transparent',
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 14,
            color: activeTab === 'transactions' ? 'var(--blue-glow)' : 'var(--muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onClick={() => onChangeTab('transactions')}
        >
          <DockLabel>Extrato</DockLabel>
          <DockIcon>
            <Receipt
              size={20}
              color={activeTab === 'transactions' ? 'var(--blue-glow)' : 'var(--muted)'}
              strokeWidth={activeTab === 'transactions' ? 2.5 : 1.8}
            />
          </DockIcon>
        </DockItem>

        {/* 4. GERENCIAR */}
        <DockItem
          style={{
            backgroundColor: 'transparent',
            borderRadius: 14,
            color: 'var(--muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onClick={handleManage}
        >
          <DockLabel>Gerenciar</DockLabel>
          <DockIcon>
            <Settings size={20} color="var(--muted)" strokeWidth={1.8} />
          </DockIcon>
        </DockItem>

        {/* 5. IMPRIMIR */}
        <DockItem
          style={{
            backgroundColor: 'transparent',
            borderRadius: 14,
            color: 'var(--muted)',
            transition: 'background-color 150ms ease, color 150ms ease',
          }}
          onClick={onPrint}
        >
          <DockLabel>Imprimir Relatório</DockLabel>
          <DockIcon>
            <Printer size={20} color="var(--muted)" strokeWidth={1.8} />
          </DockIcon>
        </DockItem>

        {/* 6. TEMA */}
        <DockItem
          style={{
            backgroundColor: 'transparent',
            borderRadius: 14,
            transition: 'background-color 150ms ease',
          }}
          onClick={toggleTheme}
        >
          <DockLabel>{isDark ? 'Modo Claro' : 'Modo Escuro'}</DockLabel>
          <DockIcon>
            {isDark ? (
              <Sun size={20} color="#fbbf24" strokeWidth={1.8} />
            ) : (
              <Moon size={20} color="#6366f1" strokeWidth={1.8} />
            )}
          </DockIcon>
        </DockItem>

        {/* 7. SAIR */}
        <DockItem
          style={{
            backgroundColor: 'transparent',
            borderRadius: 14,
            color: 'var(--red)',
            transition: 'background-color 150ms ease',
          }}
          onClick={onLogout}
        >
          <DockLabel style={{ color: 'var(--red)' }}>Sair</DockLabel>
          <DockIcon>
            <LogOut size={20} color="var(--red)" strokeWidth={1.8} />
          </DockIcon>
        </DockItem>
      </Dock>
    </nav>
  );
}
