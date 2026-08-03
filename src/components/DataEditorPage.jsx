import React, { useState, useEffect, startTransition } from 'react';
import Navbar from './Navbar';
import ViewTransition from './SafeViewTransition';
import ApiConfigModal from './ApiConfigModal';
import { 
  Users, 
  HeartHandshake, 
  Gift, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle,
  Database,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { fetchAllFinancialData, createRecord, updateRecord, deleteRecord } from '../services/api';
import { getStoredUser } from '../services/auth';
import { formatCurrency, formatDateBR } from '../services/utils';

export default function DataEditorPage() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'mock', message: 'Carregando…' });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Datasets
  const [membros, setMembros] = useState([]);
  const [dizimos, setDizimos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  // Active Tab ('membros' | 'dizimos' | 'ofertas' | 'despesas')
  const [activeTab, setActiveTab] = useState('membros');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Form State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if creating new
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Data from API
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllFinancialData();
      setMembros(Array.isArray(data?.membros) ? data.membros : []);
      setDizimos(Array.isArray(data?.dizimos) ? data.dizimos : []);
      setOfertas(Array.isArray(data?.ofertas) ? data.ofertas : []);
      setDespesas(Array.isArray(data?.despesas) ? data.despesas : []);
      setConnectionStatus({
        status: data?.status || 'offline',
        userStatus: data?.userStatus,
        message: data?.message || 'Conexão estabelecida.'
      });
    } catch (err) {
      showToast('Erro ao conectar com a API Backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map member IDs to member objects for quick lookup
  const membrosMap = React.useMemo(() => {
    const map = {};
    membros.forEach(m => {
      if (m && m.id != null) map[m.id] = m;
    });
    return map;
  }, [membros]);

  // Tab switching with ViewTransition
  const handleTabChange = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
      setSearchTerm('');
    });
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    const today = new Date().toISOString().split('T')[0];
    if (activeTab === 'membros') {
      setFormData({ nome: '', data_nascimento: '', membro: false, batizado: false, uniao_estavel: false });
    } else if (activeTab === 'dizimos') {
      setFormData({ membro_id: membros[0]?.id || '', valor: '', data: today });
    } else if (activeTab === 'ofertas') {
      setFormData({ culto: 'Culto de Domingo', valor: '', data: today });
    } else if (activeTab === 'despesas') {
      setFormData({ tipo_despesa: 'Água', descricao: 'Água', valor: '', data: today });
    }
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'membros') {
      const dob = item.data_nascimento ? String(item.data_nascimento).split('T')[0] : '';
      setFormData({
        nome: item.nome || '',
        data_nascimento: dob,
        membro: item.membro !== undefined ? Boolean(item.membro) : false,
        batizado: item.batizado !== undefined ? Boolean(item.batizado) : false,
        uniao_estavel: item.uniao_estavel !== undefined ? Boolean(item.uniao_estavel) : Boolean(item.dizimista)
      });
    } else if (activeTab === 'dizimos') {
      const dateVal = item.data ? String(item.data).split('T')[0] : '';
      setFormData({ membro_id: item.membro_id || '', valor: item.valor || '', data: dateVal });
    } else if (activeTab === 'ofertas') {
      const dateVal = item.data ? String(item.data).split('T')[0] : '';
      setFormData({ culto: item.culto || item.tipo || 'Culto Geral', valor: item.valor || '', data: dateVal });
    } else if (activeTab === 'despesas') {
      const dateVal = item.data ? String(item.data).split('T')[0] : '';
      const descName = item.descricao || item.nome || '';
      const isPreset = ['Água', 'Luz', 'Internet'].includes(descName);
      setFormData({
        tipo_despesa: isPreset ? descName : 'Outros',
        descricao: descName,
        valor: item.valor || '',
        data: dateVal
      });
    }
    setIsModalOpen(true);
  };

  // Save Form (Create or Update)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEdit = !!editingItem;
    const endpointMap = { membros: 'membros', dizimos: 'dizimos', ofertas: 'ofertas', despesas: 'despesas' };
    const endpoint = endpointMap[activeTab];

    let result;
    if (isEdit) {
      result = await updateRecord(endpoint, editingItem.id, formData);
    } else {
      result = await createRecord(endpoint, formData);
    }

    setIsSubmitting(false);

    if (result.success) {
      showToast(isEdit ? 'Registro atualizado com sucesso!' : 'Novo registro cadastrado com sucesso!');
      setIsModalOpen(false);
      loadData(); // Refresh list
    } else {
      // Offline fallback: Update local state immediately for seamless demonstration
      const newId = isEdit ? editingItem.id : Date.now();
      const updatedRecord = { id: newId, ...formData };
      
      if (activeTab === 'membros') {
        setMembros(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
      } else if (activeTab === 'dizimos') {
        setDizimos(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
      } else if (activeTab === 'ofertas') {
        setOfertas(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
      } else if (activeTab === 'despesas') {
        setDespesas(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
      }

      showToast(isEdit ? 'Registro atualizado localmente (Modo Demonstrativo).' : 'Registro cadastrado localmente (Modo Demonstrativo).', 'success');
      setIsModalOpen(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    const endpointMap = { membros: 'membros', dizimos: 'dizimos', ofertas: 'ofertas', despesas: 'despesas' };
    const endpoint = endpointMap[activeTab];

    const result = await deleteRecord(endpoint, deletingItem.id);
    setIsDeleting(false);

    // Update local state in both online or offline fallback modes
    if (activeTab === 'membros') {
      setMembros(prev => prev.filter(i => i.id !== deletingItem.id));
    } else if (activeTab === 'dizimos') {
      setDizimos(prev => prev.filter(i => i.id !== deletingItem.id));
    } else if (activeTab === 'ofertas') {
      setOfertas(prev => prev.filter(i => i.id !== deletingItem.id));
    } else if (activeTab === 'despesas') {
      setDespesas(prev => prev.filter(i => i.id !== deletingItem.id));
    }

    showToast('Registro removido com sucesso!');
    setDeletingItem(null);
  };

  // Filtering list by search term
  const search = searchTerm.toLowerCase();
  const filteredList = React.useMemo(() => {
    if (activeTab === 'membros') {
      return membros.filter(m => (m?.nome || '').toLowerCase().includes(search) || formatDateBR(m?.data_nascimento).includes(search));
    } else if (activeTab === 'dizimos') {
      return dizimos.filter(d => {
        const m = membrosMap[d.membro_id];
        const name = m?.nome || `Membro ID: ${d.membro_id}`;
        return name.toLowerCase().includes(search) || formatDateBR(d.data).includes(search);
      });
    } else if (activeTab === 'ofertas') {
      return ofertas.filter(o => (o?.culto || o?.tipo || '').toLowerCase().includes(search) || formatDateBR(o.data).includes(search));
    } else if (activeTab === 'despesas') {
      return despesas.filter(d => (d?.descricao || d?.nome || '').toLowerCase().includes(search) || formatDateBR(d.data).includes(search));
    }
    return [];
  }, [activeTab, membros, dizimos, ofertas, despesas, membrosMap, search]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 🌊 Ambient Background */}
      <div className="ambient-bg-orbs no-print" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Top Navbar */}
      <Navbar
        mainTab="gerenciar"
        onChangeMainTab={(tab) => {
          if (tab === 'dashboard' || tab === 'explorer') {
            window.location.href = '/index.html';
          }
        }}
        connectionStatus={connectionStatus}
        onRefresh={loadData}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Page Banner */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> Central de Lançamentos & Edição
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              Gerenciamento de Dados da Igreja
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Cadastre novos registros ou modifique e remova cadastros existentes com sincronização em tempo real.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="/index.html"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <ArrowLeft size={16} /> Voltar ao Painel
            </a>
            <button
              className="btn btn-primary"
              onClick={handleOpenCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800 }}
            >
              <Plus size={18} /> Novo Registro
            </button>
          </div>
        </div>

        {/* Entity Tabs & Search Control */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Entity Tabs */}
            <div className="tab-list" role="tablist" aria-label="Abas de Gerenciamento" style={{ flex: '1 1 320px' }}>
              <button
                role="tab"
                aria-selected={activeTab === 'membros'}
                className={`tab-button ${activeTab === 'membros' ? 'active' : ''}`}
                onClick={() => handleTabChange('membros')}
              >
                <Users size={16} /> Membros ({membros.length})
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'dizimos'}
                className={`tab-button ${activeTab === 'dizimos' ? 'active' : ''}`}
                onClick={() => handleTabChange('dizimos')}
              >
                <HeartHandshake size={16} /> Dízimos ({dizimos.length})
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'ofertas'}
                className={`tab-button ${activeTab === 'ofertas' ? 'active' : ''}`}
                onClick={() => handleTabChange('ofertas')}
              >
                <Gift size={16} /> Ofertas ({ofertas.length})
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'despesas'}
                className={`tab-button ${activeTab === 'despesas' ? 'active' : ''}`}
                onClick={() => handleTabChange('despesas')}
              >
                <CreditCard size={16} /> Despesas ({despesas.length})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Filtrar nesta aba…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <ViewTransition enter="fade-in" exit="fade-out" default="none">
          <div className="glass-card" style={{ padding: '20px', minHeight: '400px' }}>
            
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-primary)' }} />
                <p>Carregando registros…</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>Nenhum registro encontrado nesta categoria.</p>
                <button
                  className="btn btn-primary"
                  onClick={handleOpenCreate}
                  style={{ marginTop: '12px', fontSize: '0.85rem' }}
                >
                  + Cadastrar Primeiro Registro
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {activeTab === 'membros' && (
                        <>
                          <th style={{ padding: '12px' }}>ID</th>
                          <th style={{ padding: '12px' }}>Nome Completo</th>
                          <th style={{ padding: '12px' }}>Data de Nascimento</th>
                          <th style={{ padding: '12px' }}>Situação do Membro</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                        </>
                      )}
                      {activeTab === 'dizimos' && (
                        <>
                          <th style={{ padding: '12px' }}>Membro Dizimista</th>
                          <th style={{ padding: '12px' }}>Data</th>
                          <th style={{ padding: '12px' }}>Valor</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                        </>
                      )}
                      {activeTab === 'ofertas' && (
                        <>
                          <th style={{ padding: '12px' }}>Culto / Origem</th>
                          <th style={{ padding: '12px' }}>Data</th>
                          <th style={{ padding: '12px' }}>Valor</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                        </>
                      )}
                      {activeTab === 'despesas' && (
                        <>
                          <th style={{ padding: '12px' }}>Descrição da Despesa</th>
                          <th style={{ padding: '12px' }}>Data</th>
                          <th style={{ padding: '12px' }}>Valor</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item) => (
                      <tr key={`${activeTab}-${item.id}`} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        {activeTab === 'membros' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>#{item.id}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.nome}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateBR(item.data_nascimento)}</td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                                  background: item.membro ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                  color: item.membro ? '#10b981' : '#64748b'
                                }}>
                                  {item.membro ? '✓ Membro' : '✕ Não Membro'}
                                </span>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                                  background: item.batizado ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                  color: item.batizado ? '#3b82f6' : '#64748b'
                                }}>
                                  {item.batizado ? '✓ Batizado' : '✕ Não Batizado'}
                                </span>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                                  background: (item.uniao_estavel ?? item.dizimista) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                  color: (item.uniao_estavel ?? item.dizimista) ? '#8b5cf6' : '#64748b'
                                }}>
                                  {(item.uniao_estavel ?? item.dizimista) ? '✓ União Estável' : '✕ Solteiro(a)'}
                                </span>
                              </div>
                            </td>
                          </>
                        )}

                        {activeTab === 'dizimos' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {membrosMap[item.membro_id]?.nome || `Membro ID: ${item.membro_id}`}
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateBR(item.data)}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#10b981' }}>{formatCurrency(item.valor)}</td>
                          </>
                        )}

                        {activeTab === 'ofertas' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.culto || item.tipo || 'Culto Geral'}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateBR(item.data)}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(item.valor)}</td>
                          </>
                        )}

                        {activeTab === 'despesas' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.descricao || item.nome}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateBR(item.data)}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(item.valor)}</td>
                          </>
                        )}

                        {/* Action Buttons */}
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                              onClick={() => handleOpenEdit(item)}
                              title="Editar registro"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => setDeletingItem(item)}
                              title="Excluir registro"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ViewTransition>

      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', background: '#ffffff', borderRadius: '20px', color: '#0f172a' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', pb: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingItem ? <Edit size={18} color="var(--accent-primary)" /> : <Plus size={18} color="var(--accent-primary)" />}
                {editingItem ? 'Editar Registro' : 'Novo Registro'} ({activeTab.toUpperCase()})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* MEMBROS FIELDS */}
              {activeTab === 'membros' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      className="text-input"
                      style={{ width: '100%', color: '#0f172a' }}
                      value={formData.nome || ''}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      className="text-input"
                      style={{ width: '100%', color: '#0f172a' }}
                      value={formData.data_nascimento || ''}
                      onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    />
                  </div>

                  {/* 3 Booleans (Desmarcados por Padrão): Membro, Batizado, União Estável */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                      Situação do Cadastrado
                    </span>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
                      <input
                        type="checkbox"
                        checked={!!formData.membro}
                        onChange={(e) => setFormData({ ...formData, membro: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#1565c0', cursor: 'pointer' }}
                      />
                      Membro
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
                      <input
                        type="checkbox"
                        checked={!!formData.batizado}
                        onChange={(e) => setFormData({ ...formData, batizado: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#1565c0', cursor: 'pointer' }}
                      />
                      Batizado
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}>
                      <input
                        type="checkbox"
                        checked={!!formData.uniao_estavel}
                        onChange={(e) => setFormData({ ...formData, uniao_estavel: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#1565c0', cursor: 'pointer' }}
                      />
                      União Estável
                    </label>
                  </div>
                </>
              )}

              {/* DÍZIMOS FIELDS */}
              {activeTab === 'dizimos' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Membro *</label>
                    <select
                      required
                      className="select-input"
                      style={{ width: '100%', color: '#0f172a' }}
                      value={formData.membro_id || ''}
                      onChange={(e) => setFormData({ ...formData, membro_id: Number(e.target.value) })}
                    >
                      <option value="">Selecione um membro…</option>
                      {membros.map(m => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.valor || ''}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Data *</label>
                      <input
                        type="date"
                        required
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.data || ''}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* OFERTAS FIELDS */}
              {activeTab === 'ofertas' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Culto / Origem *</label>
                    <input
                      type="text"
                      required
                      className="text-input"
                      style={{ width: '100%', color: '#0f172a' }}
                      value={formData.culto || ''}
                      onChange={(e) => setFormData({ ...formData, culto: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.valor || ''}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Data *</label>
                      <input
                        type="date"
                        required
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.data || ''}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DESPESAS FIELDS (Preset: Água, Luz, Internet, Outros) */}
              {activeTab === 'despesas' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Tipo de Despesa *</label>
                    <select
                      className="select-input"
                      style={{ width: '100%', color: '#0f172a' }}
                      value={formData.tipo_despesa || 'Água'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          tipo_despesa: val,
                          descricao: val !== 'Outros' ? val : (formData.descricaoCustom || '')
                        });
                      }}
                    >
                      <option value="Água">Água</option>
                      <option value="Luz">Luz</option>
                      <option value="Internet">Internet</option>
                      <option value="Outros">Outros…</option>
                    </select>
                  </div>

                  {formData.tipo_despesa === 'Outros' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Descrição Personalizada *</label>
                      <input
                        type="text"
                        required
                        className="text-input"
                        placeholder="Ex: Manutenção de Equipamentos"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.descricaoCustom || (['Água', 'Luz', 'Internet'].includes(formData.descricao) ? '' : formData.descricao) || ''}
                        onChange={(e) => setFormData({ ...formData, descricaoCustom: e.target.value, descricao: e.target.value })}
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.valor || ''}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Data *</label>
                      <input
                        type="date"
                        required
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.data || ''}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Salvando…' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '24px', background: '#ffffff', borderRadius: '20px', color: '#0f172a', textAlign: 'center' }}>
            <AlertCircle size={44} color="#ef4444" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800 }}>Confirmar Exclusão</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
              Tem certeza que deseja excluir este registro ({activeTab})? Esta ação não poderá ser desfeita.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingItem(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Excluindo…' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.875rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} /> {toast.message}
        </div>
      )}

      {/* Api Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
