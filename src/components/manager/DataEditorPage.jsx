import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  HeartHandshake,
  Gift,
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  Music,
  Mic,
  BookOpen,
  Guitar
} from 'lucide-react';
import AppShell from '../layout/AppShell';
import TopBar from '../layout/TopBar';
import Badge from '../shared/Badge';
import Toast from '../shared/Toast';
import StatusCard from '../auth/StatusCard';
import PeriodPicker from '../shared/PeriodPicker';
import ConfirmSheet from '../shared/ConfirmSheet';
import MemberFormSheet from './MemberFormSheet';
import EditRecordSheet from './EditRecordSheet';
import EscalaFormSheet from './EscalaFormSheet';
import CargoFormSheet from './CargoFormSheet';
import LaunchBottomSheet from '../launch/LaunchBottomSheet';
import ApiConfigSheet from '../account/ApiConfigSheet';
import NextCultoCard from '../home/NextCultoCard';

import { fetchAllFinancialData, deleteRecord, checkApiHealth } from '../../services/api';
import {
  fetchEscalas,
  fetchCargos,
  deleteEscala,
  deleteCargo,
  canAccessCultos,
  deserializeEscalaDescricao
} from '../../services/cultos';
import { getStoredUser } from '../../services/auth';
import { formatCurrency, formatDateBR, getRecordDate, getRecordValue, parseDateParts, MONTHS } from '../../services/utils';

/**
 * Filtro de período genérico
 */
function filterByPeriod(items, viewMode, year, month) {
  if (!Array.isArray(items)) return [];
  if (viewMode === 'all') return items;
  return items.filter((item) => {
    const rawDate = getRecordDate(item) || item?.created_at || item?.data_criacao;
    if (!rawDate) return true;
    const { year: itemYear, month: itemMonth } = parseDateParts(rawDate);
    if (!itemYear || !itemMonth) return true;
    if (viewMode === 'year') return itemYear === year;
    return itemYear === year && itemMonth === month;
  });
}

export default function DataEditorPage() {
  const [currentUser] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState('membros'); // 'membros' | 'dizimos' | 'ofertas' | 'despesas' | 'escalas' | 'cargos'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'online', message: '' });
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Período de visualização
  const [viewMode, setViewMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // Julho

  // Conjuntos de dados
  const [membros, setMembros] = useState([]);
  const [dizimos, setDizimos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [cargos, setCargos] = useState([]);

  // Modais e Sheets
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingRecordType, setEditingRecordType] = useState('dizimos');

  const [isEscalaSheetOpen, setIsEscalaSheetOpen] = useState(false);
  const [editingEscala, setEditingEscala] = useState(null);

  const [isCargoSheetOpen, setIsCargoSheetOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);

  const [isCreateLaunchOpen, setIsCreateLaunchOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carrega dados da API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, loadedEscalas, loadedCargos] = await Promise.all([
        fetchAllFinancialData(),
        fetchEscalas().catch(() => []),
        fetchCargos().catch(() => [])
      ]);

      setMembros(Array.isArray(data?.membros) ? data.membros : []);
      setDizimos(Array.isArray(data?.dizimos) ? data.dizimos : []);
      setOfertas(Array.isArray(data?.ofertas) ? data.ofertas : []);
      setDespesas(Array.isArray(data?.despesas) ? data.despesas : []);
      setEscalas(Array.isArray(loadedEscalas) ? loadedEscalas : []);
      setCargos(Array.isArray(loadedCargos) ? loadedCargos : []);

      setConnectionStatus({
        status: data?.status || 'offline',
        message: data?.message || ''
      });
    } catch {
      setConnectionStatus({
        status: 'offline',
        message: 'O servidor backend foi desligado ou está inacessível. Peça ao administrador para ligá-lo.'
      });
      setToast({ type: 'error', message: 'Falha ao sincronizar dados com o servidor.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Monitoramento contínuo de status da API (heartbeat & retorno de foco)
  useEffect(() => {
    let isMounted = true;

    const verifyServerHealth = async () => {
      if (loading) return;

      try {
        const health = await checkApiHealth();
        if (!isMounted) return;

        if (!health.online) {
          setConnectionStatus((prev) => {
            if (prev.status !== 'offline') {
              return {
                status: 'offline',
                message: 'O servidor de API Backend foi desligado ou perdeu a conexão. Peça ao administrador para ligá-lo.'
              };
            }
            return prev;
          });
        } else {
          setConnectionStatus((prev) => {
            if (prev.status === 'offline') {
              loadData();
            }
            return prev;
          });
        }
      } catch {
        if (isMounted) {
          setConnectionStatus({
            status: 'offline',
            message: 'O servidor de API Backend foi desligado ou perdeu a conexão. Peça ao administrador para ligá-lo.'
          });
        }
      }
    };

    const intervalId = setInterval(verifyServerHealth, 20000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        verifyServerHealth();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [loading, loadData]);

  // Anos disponíveis
  const availableYears = useMemo(() => {
    const yearsSet = new Set([2026, 2025, 2024]);
    [...dizimos, ...ofertas, ...despesas].forEach((item) => {
      const d = getRecordDate(item);
      if (d) {
        const { year } = parseDateParts(d);
        if (year && year > 2000 && year < 2100) yearsSet.add(year);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [dizimos, ofertas, despesas]);

  // Mapa de membros por ID
  const membrosMap = useMemo(() => {
    const map = {};
    if (Array.isArray(membros)) {
      membros.forEach((m) => {
        if (m && m.id != null) map[m.id] = m;
      });
    }
    return map;
  }, [membros]);

  // Itens filtrados pelo período selecionado
  const dizimosInPeriod = useMemo(
    () => filterByPeriod(dizimos, viewMode, selectedYear, selectedMonth),
    [dizimos, viewMode, selectedYear, selectedMonth]
  );

  const ofertasInPeriod = useMemo(
    () => filterByPeriod(ofertas, viewMode, selectedYear, selectedMonth),
    [ofertas, viewMode, selectedYear, selectedMonth]
  );

  const despesasInPeriod = useMemo(
    () => filterByPeriod(despesas, viewMode, selectedYear, selectedMonth),
    [despesas, viewMode, selectedYear, selectedMonth]
  );

  // Totais do período
  const totalDizimosPeriodo = useMemo(() => dizimosInPeriod.reduce((acc, item) => acc + getRecordValue(item), 0), [dizimosInPeriod]);
  const totalOfertasPeriodo = useMemo(() => ofertasInPeriod.reduce((acc, item) => acc + getRecordValue(item), 0), [ofertasInPeriod]);
  const totalDespesasPeriodo = useMemo(() => despesasInPeriod.reduce((acc, item) => acc + getRecordValue(item), 0), [despesasInPeriod]);

  // Filtragem por busca
  const filteredMembros = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return membros;
    return membros.filter((m) => (m.nome || '').toLowerCase().includes(term));
  }, [membros, searchTerm]);

  const filteredDizimos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return dizimosInPeriod.filter((d) => {
      const member = membrosMap[d.membro_id];
      const memberName = typeof member === 'object' ? (member.nome || '') : String(member || '');
      const date = getRecordDate(d) || '';
      const val = String(getRecordValue(d));
      return memberName.toLowerCase().includes(term) || date.includes(term) || val.includes(term);
    });
  }, [dizimosInPeriod, membrosMap, searchTerm]);

  const filteredOfertas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ofertasInPeriod.filter((o) => {
      const date = getRecordDate(o) || '';
      const val = String(getRecordValue(o));
      return date.includes(term) || val.includes(term);
    });
  }, [ofertasInPeriod, searchTerm]);

  const filteredDespesas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return despesasInPeriod.filter((desp) => {
      const desc = desp.nome || desp.descricao || '';
      const date = getRecordDate(desp) || '';
      const val = String(getRecordValue(desp));
      return desc.toLowerCase().includes(term) || date.includes(term) || val.includes(term);
    });
  }, [despesasInPeriod, searchTerm]);

  // Filtragem de Escalas
  const filteredEscalas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sorted = [...escalas].sort((a, b) => {
      const dateA = a.data ? new Date(a.data) : new Date(0);
      const dateB = b.data ? new Date(b.data) : new Date(0);
      return dateB - dateA;
    });

    if (!term) return sorted;

    return sorted.filter((escala) => {
      const descObj = deserializeEscalaDescricao(escala.descricao);
      const dataStr = escala.data ? formatDateBR(escala.data) : '';
      const rawData = escala.data || '';
      const tituloMatch = (descObj.titulo || '').toLowerCase().includes(term);
      const dataMatch = dataStr.includes(term) || rawData.includes(term);
      const obsMatch = (descObj.observacoes || '').toLowerCase().includes(term);
      const musicMatch = Array.isArray(descObj.louvores) && descObj.louvores.some(l => l.toLowerCase().includes(term));
      const teamMatch = Array.isArray(escala.itens) && escala.itens.some(it => {
        const m = membrosMap[it.membro_id];
        return m && (m.nome || '').toLowerCase().includes(term);
      });
      return tituloMatch || dataMatch || obsMatch || musicMatch || teamMatch;
    });
  }, [escalas, searchTerm, membrosMap]);

  // Filtragem de Cargos
  const filteredCargos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return cargos;
    return cargos.filter((c) => {
      const member = membrosMap[c.membro_id];
      const memberName = member?.nome || '';
      return memberName.toLowerCase().includes(term);
    });
  }, [cargos, searchTerm, membrosMap]);

  // Nome do período formatado
  const periodLabel = useMemo(() => {
    if (viewMode === 'all') return 'Todos os lançamentos';
    if (viewMode === 'year') return `Ano de ${selectedYear}`;
    const mName = MONTHS.find((m) => m.value === selectedMonth)?.label || '';
    return `${mName} ${selectedYear}`;
  }, [viewMode, selectedYear, selectedMonth]);

  // Ações de Exclusão
  const handleRequestDelete = (type, id, label) => {
    setItemToDelete({ type, id, label });
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.type === 'escala') {
        const res = await deleteEscala(itemToDelete.id);
        if (res.success) {
          setToast({ type: 'success', message: `${itemToDelete.label} excluído com sucesso!` });
          setIsDeleteOpen(false);
          setItemToDelete(null);
          loadData();
        } else {
          setToast({ type: 'error', message: res.message || 'Erro ao excluir escala.' });
        }
      } else if (itemToDelete.type === 'cargo') {
        const res = await deleteCargo(itemToDelete.id);
        if (res.success) {
          setToast({ type: 'success', message: `${itemToDelete.label} excluído com sucesso!` });
          setIsDeleteOpen(false);
          setItemToDelete(null);
          loadData();
        } else {
          setToast({ type: 'error', message: res.message || 'Erro ao excluir registro de cargos.' });
        }
      } else {
        const endpoint = itemToDelete.type === 'membro'
          ? 'membro'
          : itemToDelete.type === 'dizimos'
          ? 'dizimos'
          : itemToDelete.type === 'ofertas'
          ? 'ofertas'
          : 'despesas';

        const res = await deleteRecord(endpoint, itemToDelete.id);

        if (res.success) {
          setToast({ type: 'success', message: `${itemToDelete.label} excluído com sucesso!` });
          setIsDeleteOpen(false);
          setItemToDelete(null);
          loadData();
        } else {
          setToast({ type: 'error', message: res.message || 'Erro ao excluir registro.' });
        }
      }
    } catch {
      setToast({ type: 'error', message: 'Falha na conexão com o servidor.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Ação de Edição
  const handleEditRecord = (type, item) => {
    if (type === 'membro') {
      setEditingMember(item);
      setIsMemberSheetOpen(true);
    } else {
      setEditingRecordType(type);
      setEditingRecord(item);
      setIsEditRecordOpen(true);
    }
  };

  // Verificação de acesso e abas disponíveis
  const hasCultosAccess = useMemo(() => canAccessCultos(currentUser, cargos), [currentUser, cargos]);

  const availableTabs = useMemo(() => {
    const list = [
      { id: 'membros', label: 'Membros', icon: Users, count: membros.length },
      { id: 'dizimos', label: 'Dízimos', icon: HeartHandshake, count: dizimosInPeriod.length },
      { id: 'ofertas', label: 'Ofertas', icon: Gift, count: ofertasInPeriod.length },
      { id: 'despesas', label: 'Despesas', icon: CreditCard, count: despesasInPeriod.length }
    ];
    if (hasCultosAccess) {
      list.push({ id: 'escalas', label: 'Cultos / Escala', icon: Sparkles, count: escalas.length });
      list.push({ id: 'cargos', label: 'Cargos', icon: ShieldCheck, count: cargos.length });
    }
    return list;
  }, [membros.length, dizimosInPeriod.length, ofertasInPeriod.length, despesasInPeriod.length, hasCultosAccess, escalas.length, cargos.length]);

  // Checagens de acesso e conectividade
  const isUnauth = !currentUser || connectionStatus.status === 'unauthenticated';
  const isOffline = connectionStatus.status === 'offline';

  if (isUnauth) {
    return (
      <AppShell
        header={
          <TopBar
            title="Central de Gestão"
            subtitle="Administração e Cadastros"
            connectionStatus="offline"
            backButton={{ onClick: () => { window.location.href = '/index.html'; } }}
          />
        }
      >
        <div className="card" style={{ maxWidth: 440, margin: '40px auto', textAlign: 'center', padding: '32px 20px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Autenticação Necessária</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20 }}>
            Você precisa estar autenticado para acessar a área administrativa.
          </p>
          <a href="/login.html" className="btn btn-primary btn-block">
            Fazer Login / Criar Conta
          </a>
        </div>
      </AppShell>
    );
  }

  if (isOffline) {
    return (
      <AppShell
        header={
          <TopBar
            title="Central de Gestão"
            subtitle="Administração e Cadastros"
            user={currentUser}
            connectionStatus="offline"
            onRefresh={loadData}
            isRefreshing={loading}
            backButton={{ onClick: () => { window.location.href = '/index.html'; } }}
          />
        }
        toast={
          toast ? (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          ) : null
        }
        modal={
          <ApiConfigSheet
            isOpen={isApiConfigOpen}
            onClose={() => setIsApiConfigOpen(false)}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
          />
        }
      >
        <StatusCard
          status="offline"
          user={currentUser}
          message={connectionStatus.message || 'O servidor backend foi desligado ou está inacessível. Peça ao administrador para ligá-lo.'}
          onRetry={loadData}
          onConfigureApi={() => setIsApiConfigOpen(true)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      header={
        <TopBar
          title="Central de Gestão"
          subtitle="Administração e Cadastros"
          user={currentUser}
          connectionStatus={connectionStatus.status === 'online' ? 'online' : 'offline'}
          onRefresh={loadData}
          isRefreshing={loading}
          backButton={{
            onClick: () => {
              window.location.href = '/index.html';
            }
          }}
        />
      }
      toast={
        toast ? (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null
      }
      modal={
        <>
          {/* Sheet de Membros */}
          <MemberFormSheet
            isOpen={isMemberSheetOpen}
            onClose={() => {
              setIsMemberSheetOpen(false);
              setEditingMember(null);
            }}
            initialData={editingMember}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
            onError={(msg) => setToast({ type: 'error', message: msg })}
          />

          {/* Sheet de Edição de Dízimo/Oferta/Despesa */}
          <EditRecordSheet
            isOpen={isEditRecordOpen}
            onClose={() => {
              setIsEditRecordOpen(false);
              setEditingRecord(null);
            }}
            recordType={editingRecordType}
            record={editingRecord}
            membros={membros}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
            onError={(msg) => setToast({ type: 'error', message: msg })}
          />

          {/* Sheet de Cultos / Escalas */}
          <EscalaFormSheet
            isOpen={isEscalaSheetOpen}
            onClose={() => {
              setIsEscalaSheetOpen(false);
              setEditingEscala(null);
            }}
            initialData={editingEscala}
            membros={membros}
            cargos={cargos}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
            onError={(msg) => setToast({ type: 'error', message: msg })}
          />

          {/* Sheet de Cargos */}
          <CargoFormSheet
            isOpen={isCargoSheetOpen}
            onClose={() => {
              setIsCargoSheetOpen(false);
              setEditingCargo(null);
            }}
            initialData={editingCargo}
            membros={membros}
            cargosExistentes={cargos}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
            onError={(msg) => setToast({ type: 'error', message: msg })}
          />

          {/* Sheet de Criação Geral (Lançamentos Financeiros) */}
          <LaunchBottomSheet
            isOpen={isCreateLaunchOpen}
            onClose={() => setIsCreateLaunchOpen(false)}
            membros={membros}
            defaultDate={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
            onSuccess={(msg) => {
              setToast({ type: 'success', message: msg });
              loadData();
            }}
            onError={(msg) => setToast({ type: 'error', message: msg })}
          />

          {/* Sheet de Confirmação de Exclusão */}
          <ConfirmSheet
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão"
            description={`Tem certeza que deseja excluir ${itemToDelete?.label || 'este registro'}?`}
            isDeleting={isDeleting}
          />
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tabs de Seleção de Entidade */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))`,
          background: 'var(--panel)',
          border: '1px solid var(--panel-line)',
          borderRadius: 'var(--radius-sm)',
          padding: 3,
          gap: 2,
          overflowX: 'auto'
        }}>
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 2px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: isActive ? 'var(--blue-bg)' : 'transparent',
                  color: isActive ? 'var(--blue-glow)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  minWidth: '54px'
                }}
              >
                <Icon size={16} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {tab.label}
                </span>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Seletor de Período (apenas para abas financeiras) */}
        {(activeTab === 'dizimos' || activeTab === 'ofertas' || activeTab === 'despesas') && (
          <PeriodPicker
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChangeYear={setSelectedYear}
            onChangeMonth={setSelectedMonth}
            availableYears={availableYears}
          />
        )}

        {/* Banner de Resumo da Aba Ativa */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--panel)',
          border: '1px solid var(--panel-line)',
          fontSize: '0.82rem'
        }}>
          <span style={{ color: 'var(--muted)' }}>
            {activeTab === 'membros' && `Total de membros cadastrados: ${membros.length}`}
            {activeTab === 'dizimos' && `${filteredDizimos.length} dízimos em ${periodLabel}`}
            {activeTab === 'ofertas' && `${filteredOfertas.length} ofertas em ${periodLabel}`}
            {activeTab === 'despesas' && `${filteredDespesas.length} despesas em ${periodLabel}`}
            {activeTab === 'escalas' && `${filteredEscalas.length} cultos cadastrados`}
            {activeTab === 'cargos' && `${filteredCargos.length} membros com funções atribuídas`}
          </span>

          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: activeTab === 'despesas' ? 'var(--red-glow)' : 'var(--blue-glow)' }}>
            {activeTab === 'dizimos' && formatCurrency(totalDizimosPeriodo)}
            {activeTab === 'ofertas' && formatCurrency(totalOfertasPeriodo)}
            {activeTab === 'despesas' && formatCurrency(totalDespesasPeriodo)}
            {activeTab === 'escalas' && (
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 500 }}>
                🎵 Playbacks integrados
              </span>
            )}
            {activeTab === 'cargos' && (
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 500 }}>
                Aptidões ministeriais
              </span>
            )}
          </span>
        </div>

        {/* Barra de Ações: Busca + Botão Adicionar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder={`Buscar em ${activeTab}…`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: 36, paddingRight: searchTerm ? 32 : 12, fontSize: '0.84rem' }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'membros') {
                setEditingMember(null);
                setIsMemberSheetOpen(true);
              } else if (activeTab === 'escalas') {
                setEditingEscala(null);
                setIsEscalaSheetOpen(true);
              } else if (activeTab === 'cargos') {
                setEditingCargo(null);
                setIsCargoSheetOpen(true);
              } else {
                setIsCreateLaunchOpen(true);
              }
            }}
            className="btn btn-primary btn-sm"
            style={{ whiteSpace: 'nowrap', padding: '9px 14px' }}
          >
            <Plus size={15} />
            <span>
              {activeTab === 'membros' && 'Novo Membro'}
              {activeTab === 'escalas' && 'Novo Culto'}
              {activeTab === 'cargos' && 'Atribuir Cargos'}
              {activeTab !== 'membros' && activeTab !== 'escalas' && activeTab !== 'cargos' && 'Novo'}
            </span>
          </button>
        </div>

        {/* TAB 1: MEMBROS */}
        {activeTab === 'membros' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredMembros.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--panel)',
                  border: '1px solid var(--panel-line)',
                  gap: 12
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
                      #{m.id}
                    </span>
                    {m.membro !== false && <Badge variant="blue">Membro</Badge>}
                    {m.batizado && <Badge variant="neutral">Batizado</Badge>}
                    {m.uniao_estavel && <Badge variant="neutral">União Estável</Badge>}
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: 'var(--text)' }}>
                    {m.nome}
                  </p>

                  {m.data_nascimento && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      Nascimento: {formatDateBR(m.data_nascimento)}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleEditRecord('membro', m)}
                    className="action-btn edit"
                    title={`Editar ${m.nome}`}
                    aria-label={`Editar ${m.nome}`}
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestDelete('membro', m.id, `o membro "${m.nome}"`)}
                    className="action-btn delete"
                    title={`Excluir ${m.nome}`}
                    aria-label={`Excluir ${m.nome}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredMembros.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                Nenhum membro encontrado.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DÍZIMOS */}
        {activeTab === 'dizimos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDizimos.map((d) => {
              const member = membrosMap[d.membro_id];
              const memberName = typeof member === 'object' ? (member.nome || '') : String(member || `Membro #${d.membro_id}`);

              return (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel)',
                    border: '1px solid var(--panel-line)',
                    gap: 12
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                      #{d.id} • {formatDateBR(getRecordDate(d))}
                    </span>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: '2px 0 0 0', color: 'var(--text)' }}>
                      {memberName}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue-glow)', fontSize: '0.95rem' }}>
                      {formatCurrency(getRecordValue(d))}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleEditRecord('dizimos', d)}
                      className="action-btn edit"
                      title="Editar dízimo"
                      aria-label="Editar dízimo"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestDelete('dizimos', d.id, `o dízimo de ${memberName} (${formatCurrency(getRecordValue(d))})`)}
                      className="action-btn delete"
                      title="Excluir dízimo"
                      aria-label="Excluir dízimo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredDizimos.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                Nenhum dízimo no período ({periodLabel}).
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OFERTAS */}
        {activeTab === 'ofertas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredOfertas.map((o) => (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--panel)',
                  border: '1px solid var(--panel-line)',
                  gap: 12
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    #{o.id} • Oferta de Culto
                  </span>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: '2px 0 0 0', color: 'var(--text)' }}>
                    Data: {formatDateBR(getRecordDate(o))}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue-glow)', fontSize: '0.95rem' }}>
                    {formatCurrency(getRecordValue(o))}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditRecord('ofertas', o)}
                    className="action-btn edit"
                    title="Editar oferta"
                    aria-label="Editar oferta"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestDelete('ofertas', o.id, `a oferta de ${formatCurrency(getRecordValue(o))}`)}
                    className="action-btn delete"
                    title="Excluir oferta"
                    aria-label="Excluir oferta"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredOfertas.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                Nenhuma oferta no período ({periodLabel}).
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DESPESAS */}
        {activeTab === 'despesas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDespesas.map((desp) => (
              <div
                key={desp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--panel)',
                  border: '1px solid var(--panel-line)',
                  gap: 12
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    #{desp.id} • {formatDateBR(getRecordDate(desp))}
                  </span>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: '2px 0 0 0', color: 'var(--text)' }}>
                    {desp.nome || desp.descricao || 'Despesa'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red-glow)', fontSize: '0.95rem' }}>
                    {formatCurrency(getRecordValue(desp))}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditRecord('despesas', desp)}
                    className="action-btn edit"
                    title="Editar despesa"
                    aria-label="Editar despesa"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestDelete('despesas', desp.id, `a despesa "${desp.nome}" (${formatCurrency(getRecordValue(desp))})`)}
                    className="action-btn delete"
                    title="Excluir despesa"
                    aria-label="Excluir despesa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {filteredDespesas.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                Nenhuma despesa no período ({periodLabel}).
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CULTOS / ESCALAS */}
        {activeTab === 'escalas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Destaque do Próximo Culto */}
            <NextCultoCard
              escalas={escalas}
              membrosMap={membrosMap}
              showManageButton={false}
            />

            {filteredEscalas.map((escala) => {
              const descObj = deserializeEscalaDescricao(escala.descricao);
              const dataFormatada = escala.data ? formatDateBR(escala.data) : 'Data a definir';
              const tituloCulto = descObj.titulo || 'Culto de Celebração';
              const louvores = Array.isArray(descObj.louvores) ? descObj.louvores : [];
              const itens = Array.isArray(escala.itens) ? escala.itens : [];

              return (
                <div
                  key={escala.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--panel)',
                    border: '1px solid var(--panel-line)'
                  }}
                >
                  {/* Cabeçalho do Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          background: 'var(--blue-bg)',
                          color: 'var(--blue-glow)',
                          border: '1px solid var(--blue-border)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: 600
                        }}>
                          📅 {dataFormatada}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)' }}>
                          #Culto-{escala.id}
                        </span>
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text)',
                        margin: 0
                      }}>
                        {tituloCulto}
                      </h3>
                    </div>

                    {/* Botões de Ação */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEscala(escala);
                          setIsEscalaSheetOpen(true);
                        }}
                        className="action-btn edit"
                        title="Editar culto e escala"
                        aria-label="Editar culto"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDelete('escala', escala.id, `o culto "${tituloCulto}" (${dataFormatada})`)}
                        className="action-btn delete"
                        title="Excluir escala"
                        aria-label="Excluir escala"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Equipe Litúrgica */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel-elevated)',
                    border: '1px solid var(--panel-line)'
                  }}>
                    {[
                      { role: 'preletor', label: 'Preletor', badge: '🎙️', icon: Mic, color: '#38bdf8' },
                      { role: 'dirigente', label: 'Dirigente', badge: '📖', icon: BookOpen, color: '#a78bfa' },
                      { role: 'cantor', label: 'Cantor(a)', badge: '🎤', icon: Music, color: '#f472b6' },
                      { role: 'musico', label: 'Músico', badge: '🎸', icon: Guitar, color: '#fb923c' }
                    ].map((cfg) => {
                      const matchedItem = itens.find((it) => {
                        const f = (it.funcao || '').toLowerCase();
                        return f.includes(cfg.role) || (cfg.role === 'musico' && f.includes('músico'));
                      });
                      const membro = matchedItem ? membrosMap[matchedItem.membro_id] : null;

                      return (
                        <div key={cfg.role} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '0.68rem', color: cfg.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {cfg.badge} {cfg.label}
                          </span>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: membro ? 600 : 400,
                            color: membro ? 'var(--text)' : 'var(--muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {membro ? membro.nome : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Louvores Escolhidos */}
                  {louvores.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Music size={13} style={{ color: 'var(--blue-glow)' }} /> Louvores Selecionados ({louvores.length}):
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {louvores.map((louvor, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.74rem',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-xs)',
                              background: 'var(--panel-hover)',
                              border: '1px solid var(--panel-line)',
                              color: 'var(--text)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <span style={{ color: 'var(--blue-glow)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{idx + 1}.</span>
                            {louvor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {descObj.observacoes && (
                    <p style={{
                      fontSize: '0.76rem',
                      fontStyle: 'italic',
                      color: 'var(--muted)',
                      margin: 0,
                      paddingTop: 4,
                      borderTop: '1px dashed var(--panel-line)'
                    }}>
                      "{descObj.observacoes}"
                    </p>
                  )}
                </div>
              );
            })}

            {filteredEscalas.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                <Sparkles size={32} style={{ margin: '0 auto 10px', color: 'var(--blue-glow)', opacity: 0.6 }} />
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Nenhum culto encontrado</p>
                <p style={{ fontSize: '0.82rem' }}>Clique em "Novo Culto" para registrar uma nova escala com sorteio de louvores.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CARGOS */}
        {activeTab === 'cargos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredCargos.map((cargo) => {
              const member = membrosMap[cargo.membro_id];
              const memberName = member?.nome || `Membro #${cargo.membro_id}`;

              const badgesList = [
                { key: 'preletor', label: 'Preletor', badge: '🎙️', active: cargo.preletor, color: '#38bdf8' },
                { key: 'dirigente', label: 'Dirigente', badge: '📖', active: cargo.dirigente, color: '#a78bfa' },
                { key: 'cantor', label: 'Cantor', badge: '🎤', active: cargo.cantor, color: '#f472b6' },
                { key: 'musico', label: 'Músico', badge: '🎸', active: cargo.musico, color: '#fb923c' },
                { key: 'tesoureiro', label: 'Tesoureiro', badge: '💰', active: cargo.tesoureiro, color: '#34d399' }
              ].filter((b) => b.active);

              return (
                <div
                  key={cargo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--panel)',
                    border: '1px solid var(--panel-line)',
                    gap: 12
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                        #{cargo.id} • Membro #{cargo.membro_id}
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0, color: 'var(--text)' }}>
                      {memberName}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {badgesList.map((b) => (
                        <span
                          key={b.key}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--panel-hover)',
                            border: `1px solid ${b.color}40`,
                            color: b.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {b.badge} {b.label}
                        </span>
                      ))}
                      {badgesList.length === 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                          Nenhum cargo ativo
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCargo(cargo);
                        setIsCargoSheetOpen(true);
                      }}
                      className="action-btn edit"
                      title="Editar cargos do membro"
                      aria-label="Editar cargos"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestDelete('cargo', cargo.id, `os cargos de "${memberName}"`)}
                      className="action-btn delete"
                      title="Excluir registro de cargos"
                      aria-label="Excluir cargo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCargos.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                Nenhum registro de cargo atribuído encontrado.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
