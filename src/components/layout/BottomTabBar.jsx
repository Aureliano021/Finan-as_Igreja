import React from 'react';
import { Home, Receipt, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'transactions', label: 'Extrato', icon: Receipt },
  { id: 'analytics', label: 'Análise', icon: BarChart3 },
  { id: 'account', label: 'Conta', icon: Settings }
];

/**
 * BottomTabBar Component
 * Navegação fixa no rodapé otimizada para toque no mobile.
 */
export default function BottomTabBar({
  activeTab = 'home',
  onChangeTab
}) {
  return (
    <nav className="bottom-tab-bar" aria-label="Navegação Principal">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onChangeTab && onChangeTab(tab.id)}
            aria-selected={isActive}
            role="tab"
          >
            <div className="tab-icon-wrapper">
              <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
