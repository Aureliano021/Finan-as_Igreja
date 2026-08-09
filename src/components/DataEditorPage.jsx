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
  const [connectionStatus, setConnectionStatus] = useState({ status: 'offline', message: 'Carregando…' });
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

  // Batch Entry State ('batch' | 'single')
  const [creationMode, setCreationMode] = useState('batch');
  const [batchDefaultDate, setBatchDefaultDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [batchRows, setBatchRows] = useState([]);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper: Create single empty row for batch entry
  const createEmptyRow = (tab, dateVal) => {
    const id = Math.random().toString(36).substring(2, 9);
    if (tab === 'membros') {
      return { _tempId: id, nome: '', data_nascimento: '', membro: false, batizado: false, uniao_estavel: false };
    } else if (tab === 'dizimos') {
      return { _tempId: id, membro_id: membros[0]?.id || '', valor: '', data: dateVal };
    } else if (tab === 'ofertas') {
      return { _tempId: id, valor: '', data: dateVal };
    } else if (tab === 'despesas') {
      return { _tempId: id, nome: '', valor: '', data: dateVal };
    }
    return { _tempId: id };
  };

  // Add N empty rows to batch list
  const handleAddBatchRows = (count = 5) => {
    const today = batchDefaultDate || new Date().toISOString().split('T')[0];
    const newRows = Array.from({ length: count }, () => createEmptyRow(activeTab, today));
    setBatchRows(prev => [...prev, ...newRows]);
  };

  // Apply default date to all batch rows
  const handleApplyDateToAll = (newDate) => {
    setBatchDefaultDate(newDate);
    setBatchRows(prev => prev.map(r => ({ ...r, data: newDate })));
  };

  // Update a single field in a batch row
  const handleUpdateBatchRow = (index, field, value) => {
    setBatchRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Remove a batch row
  const handleRemoveBatchRow = (index) => {
    setBatchRows(prev => prev.filter((_, i) => i !== index));
  };

  // Clear completely empty rows
  const handleClearEmptyBatchRows = () => {
    setBatchRows(prev => prev.filter(r => {
      if (activeTab === 'membros') return Boolean((r.nome || '').trim());
      if (activeTab === 'dizimos') return Boolean(r.membro_id && Number(r.valor) > 0);
      if (activeTab === 'ofertas') return Boolean(Number(r.valor) > 0);
      if (activeTab === 'despesas') return Boolean((r.nome || '').trim() && Number(r.valor) > 0);
      return true;
    }));
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

  // Open Modal for Create (Defaults to Batch Entry Mode with 5 empty rows)
  const handleOpenCreate = () => {
    setEditingItem(null);
    setCreationMode('batch');
    const today = new Date().toISOString().split('T')[0];
    setBatchDefaultDate(today);

    // Initial 5 rows ready for bulk typing
    const initialRows = Array.from({ length: 5 }, () => createEmptyRow(activeTab, today));
    setBatchRows(initialRows);

    if (activeTab === 'membros') {
      setFormData({ nome: '', data_nascimento: '', membro: false, batizado: false, uniao_estavel: false });
    } else if (activeTab === 'dizimos') {
      setFormData({ membro_id: membros[0]?.id || '', valor: '', data: today });
    } else if (activeTab === 'ofertas') {
      setFormData({ valor: '', data: today });
    } else if (activeTab === 'despesas') {
      setFormData({ nome: '', valor: '', data: today });
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
      setFormData({ membro_id: item.membro_id || '', valor: item.valor != null ? String(item.valor) : '', data: dateVal });
    } else if (activeTab === 'ofertas') {
      const dateVal = item.data ? String(item.data).split('T')[0] : '';
      setFormData({ valor: item.valor != null ? String(item.valor) : '', data: dateVal });
    } else if (activeTab === 'despesas') {
      const dateVal = item.data ? String(item.data).split('T')[0] : '';
      setFormData({
        nome: item.nome || item.descricao || '',
        valor: item.valor != null ? String(item.valor) : '',
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
    const endpointMap = { membros: 'membro', dizimos: 'dizimos', ofertas: 'ofertas', despesas: 'despesas' };
    const endpoint = endpointMap[activeTab];

    let payload = {};

    if (activeTab === 'membros') {
      if (isEdit) {
        // Compute partial payload (only changed fields) for PUT /membro/{id}
        const initialDob = editingItem.data_nascimento ? String(editingItem.data_nascimento).split('T')[0] : '';
        const initialMembro = Boolean(editingItem.membro);
        const initialBatizado = Boolean(editingItem.batizado);
        const initialUniaoEstavel = Boolean(editingItem.uniao_estavel ?? editingItem.dizimista);

        payload = {};
        if (formData.nome !== (editingItem.nome || '')) {
          payload.nome = String(formData.nome || '').trim();
        }
        if ((formData.data_nascimento || '') !== initialDob) {
          payload.data_nascimento = formData.data_nascimento || null;
        }
        if (Boolean(formData.membro) !== initialMembro) {
          payload.membro = Boolean(formData.membro);
        }
        if (Boolean(formData.batizado) !== initialBatizado) {
          payload.batizado = Boolean(formData.batizado);
        }
        if (Boolean(formData.uniao_estavel) !== initialUniaoEstavel) {
          payload.uniao_estavel = Boolean(formData.uniao_estavel);
        }
      } else {
        // Enforce mandatory payload structure for POST /membro
        payload = {
          nome: String(formData.nome || '').trim(),
          data_nascimento: (formData.data_nascimento || '').trim() || new Date().toISOString().split('T')[0],
          membro: Boolean(formData.membro),
          batizado: Boolean(formData.batizado),
          uniao_estavel: Boolean(formData.uniao_estavel)
        };
      }
    } else if (activeTab === 'despesas') {
      // Mandatory fields for POST /despesas and PUT /despesas/{id}: nome, data, valor
      payload = {
        nome: String(formData.nome || '').trim(),
        data: formData.data,
        valor: Math.round(Number(formData.valor))
      };
    } else if (activeTab === 'ofertas') {
      // Mandatory fields for POST /ofertas and PUT /ofertas/{id}: valor, data
      payload = {
        valor: Number(formData.valor),
        data: formData.data
      };
    } else if (activeTab === 'dizimos') {
      const membId = Number(formData.membro_id);
      const val = Number(formData.valor);
      if (!isEdit && (!membId || isNaN(membId))) {
        setIsSubmitting(false);
        showToast('Por favor, selecione um membro cadastrado da lista.', 'error');
        return;
      }
      if (isNaN(val) || val <= 0) {
        setIsSubmitting(false);
        showToast('Por favor, informe um valor numérico válido.', 'error');
        return;
      }
      if (!formData.data) {
        setIsSubmitting(false);
        showToast('Por favor, informe a data do dízimo.', 'error');
        return;
      }

      if (isEdit) {
        // PUT /dizimos/{id} is partial (optional fields: membro_id, valor, data)
        const initialDate = editingItem.data ? String(editingItem.data).split('T')[0] : '';
        const initialMembroId = Number(editingItem.membro_id);
        const initialValor = Number(editingItem.valor);

        payload = {};
        if (membId && membId !== initialMembroId) {
          payload.membro_id = membId;
        }
        if (val !== initialValor) {
          payload.valor = val;
        }
        if ((formData.data || '') !== initialDate) {
          payload.data = formData.data;
        }
      } else {
        // POST /dizimos requires: membro_id, valor, data
        payload = {
          membro_id: membId,
          valor: val,
          data: formData.data
        };
      }
    }

    let result;
    if (isEdit) {
      result = await updateRecord(endpoint, editingItem.id, payload);
    } else {
      result = await createRecord(endpoint, payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      showToast(isEdit ? 'Registro atualizado com sucesso!' : 'Novo registro cadastrado com sucesso!');
      setIsModalOpen(false);
      loadData(); // Refresh list
    } else {
      // API error display
      if (result.message) {
        showToast(result.message, 'error');
      } else {
        const newId = isEdit ? editingItem.id : Date.now();
        const updatedRecord = { id: newId, ...(isEdit ? { ...editingItem, ...payload } : payload) };
        
        if (activeTab === 'membros') {
          setMembros(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
        } else if (activeTab === 'dizimos') {
          setDizimos(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
        } else if (activeTab === 'ofertas') {
          setOfertas(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
        } else if (activeTab === 'despesas') {
          setDespesas(prev => isEdit ? prev.map(i => i.id === newId ? updatedRecord : i) : [updatedRecord, ...prev]);
        }

        showToast(isEdit ? 'Registro atualizado localmente.' : 'Registro cadastrado localmente.', 'success');
        setIsModalOpen(false);
      }
    }
  };

  // NOTE: O servidor backend aceita a criação de apenas 1 registro por requisição (POST /membro, POST /dizimos, etc.).
  // O lançamento em lote executa as requisições de POST de forma sequencial (item por item no backend).
  const handleSaveBatch = async (e) => {
    e.preventDefault();

    const validPayloads = [];

    for (const r of batchRows) {
      if (activeTab === 'membros') {
        const name = (r.nome || '').trim();
        if (name) {
          validPayloads.push({
            nome: name,
            data_nascimento: (r.data_nascimento || '').trim() || batchDefaultDate || '2000-01-01',
            membro: Boolean(r.membro),
            batizado: Boolean(r.batizado),
            uniao_estavel: Boolean(r.uniao_estavel)
          });
        }
      } else if (activeTab === 'dizimos') {
        const membId = Number(r.membro_id);
        const val = Number(r.valor);
        const dateVal = r.data || batchDefaultDate;
        if (membId && !isNaN(membId) && !isNaN(val) && val > 0 && dateVal) {
          validPayloads.push({
            membro_id: membId,
            valor: val,
            data: dateVal
          });
        }
      } else if (activeTab === 'ofertas') {
        const val = Number(r.valor);
        const dateVal = r.data || batchDefaultDate;
        if (!isNaN(val) && val > 0 && dateVal) {
          validPayloads.push({
            valor: val,
            data: dateVal
          });
        }
      } else if (activeTab === 'despesas') {
        const name = (r.nome || '').trim();
        const val = Math.round(Number(r.valor));
        const dateVal = r.data || batchDefaultDate;
        if (name && !isNaN(val) && val > 0 && dateVal) {
          validPayloads.push({
            nome: name,
            valor: val,
            data: dateVal
          });
        }
      }
    }

    if (validPayloads.length === 0) {
      showToast('Por favor, preencha ao menos uma linha com dados válidos.', 'error');
      return;
    }

    setIsSubmitting(true);
    const endpointMap = { membros: 'membro', dizimos: 'dizimos', ofertas: 'ofertas', despesas: 'despesas' };
    const endpoint = endpointMap[activeTab];

    let successCount = 0;
    const errorMessages = [];
    const addedLocalRecords = [];

    for (let i = 0; i < validPayloads.length; i++) {
      const payload = validPayloads[i];
      const res = await createRecord(endpoint, payload);
      if (res.success) {
        successCount++;
      } else if (connectionStatus.status === 'offline') {
        const newId = Date.now() + Math.floor(Math.random() * 1000) + i;
        addedLocalRecords.push({ id: newId, ...payload });
      } else {
        errorMessages.push(res.message || 'Erro ao cadastrar registro no servidor.');
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      showToast(`${successCount} registro(s) cadastrado(s) com sucesso em lote!`);
      if (errorMessages.length > 0) {
        setTimeout(() => {
          showToast(`Atenção: ${errorMessages.length} registro(s) falharam: ${errorMessages.join('; ')}`, 'error');
        }, 1500);
      }
      setIsModalOpen(false);
      loadData();
    } else if (addedLocalRecords.length > 0) {
      if (activeTab === 'membros') {
        setMembros(prev => [...addedLocalRecords, ...prev]);
      } else if (activeTab === 'dizimos') {
        setDizimos(prev => [...addedLocalRecords, ...prev]);
      } else if (activeTab === 'ofertas') {
        setOfertas(prev => [...addedLocalRecords, ...prev]);
      } else if (activeTab === 'despesas') {
        setDespesas(prev => [...addedLocalRecords, ...prev]);
      }
      showToast(`${addedLocalRecords.length} registro(s) cadastrado(s) em lote localmente.`, 'success');
      setIsModalOpen(false);
    } else {
      showToast(`Falha no cadastro em lote: ${errorMessages.join('; ') || 'Verifique se os dados estão corretos.'}`, 'error');
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    const endpointMap = { membros: 'membro', dizimos: 'dizimos', ofertas: 'ofertas', despesas: 'despesas' };
    const endpoint = endpointMap[activeTab];

    const result = await deleteRecord(endpoint, deletingItem.id);
    setIsDeleting(false);

    if (result.success) {
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
    } else if (result.conflict || result.status === 409) {
      showToast(result.message || 'Não é possível excluir um membro com registros vinculados.', 'error');
      setDeletingItem(null);
    } else {
      showToast(result.message || 'Erro ao excluir registro.', 'error');
      setDeletingItem(null);
    }
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
      return ofertas.filter(o => formatDateBR(o.data).includes(search) || String(o.valor || '').includes(search));
    } else if (activeTab === 'despesas') {
      return despesas.filter(d => (d?.nome || d?.descricao || '').toLowerCase().includes(search) || formatDateBR(d.data).includes(search));
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
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(360px, 70vw, 620px)',
          height: 'clamp(360px, 70vw, 620px)',
          pointerEvents: 'none',
          opacity: 0.45,
          zIndex: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mixBlendMode: 'multiply'
        }}>
          <img src="/church-logo-bw.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Top Navbar */}
      <Navbar
        mainTab="gerenciar"
        onChangeMainTab={(tab) => {
          if (tab === 'dashboard') {
            window.location.href = '/index.html';
          } else if (tab === 'explorer') {
            window.location.href = '/index.html?tab=explorer';
          }
        }}
        connectionStatus={connectionStatus}
        onRefresh={loadData}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '24px 16px' }}>
        
        {connectionStatus.status === 'unauthenticated' ? (
          <div style={{
            maxWidth: '540px',
            margin: '40px auto',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }} role="alert">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              🔒
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Autenticação Necessária
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
              {connectionStatus.message || 'Sessão expirada ou não autenticada. Por favor, faça login novamente.'}
            </p>
            <a
              href="/login.html"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(21, 101, 192, 0.3)'
              }}
            >
              Fazer Login / Criar Conta
            </a>
          </div>
        ) : (
          <>
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
                          <th style={{ padding: '12px' }}>ID</th>
                          <th style={{ padding: '12px' }}>Membro Dizimista</th>
                          <th style={{ padding: '12px' }}>Data</th>
                          <th style={{ padding: '12px' }}>Valor</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                        </>
                      )}
                      {activeTab === 'ofertas' && (
                        <>
                          <th style={{ padding: '12px' }}>ID</th>
                          <th style={{ padding: '12px' }}>Data</th>
                          <th style={{ padding: '12px' }}>Valor</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
                        </>
                      )}
                      {activeTab === 'despesas' && (
                        <>
                          <th style={{ padding: '12px' }}>ID</th>
                          <th style={{ padding: '12px' }}>Nome da Despesa</th>
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
                                  {item.membro ? '✓ Membro' : '✕ Membro'}
                                </span>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                                  background: item.batizado ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                  color: item.batizado ? '#3b82f6' : '#64748b'
                                }}>
                                  {item.batizado ? '✓ Batizado' : '✕ Batizado'}
                                </span>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                                  background: (item.uniao_estavel ?? item.dizimista) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                  color: (item.uniao_estavel ?? item.dizimista) ? '#8b5cf6' : '#64748b'
                                }}>
                                  {(item.uniao_estavel ?? item.dizimista) ? '✓ União Estável' : '✕ União Estável'}
                                </span>
                              </div>
                            </td>
                          </>
                        )}

                        {activeTab === 'dizimos' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>#{item.id}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {membrosMap[item.membro_id]?.nome || `Membro ID: ${item.membro_id}`}
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateBR(item.data)}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#10b981' }}>{formatCurrency(item.valor)}</td>
                          </>
                        )}

                        {activeTab === 'ofertas' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>#{item.id}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{formatDateBR(item.data)}</td>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(item.valor)}</td>
                          </>
                        )}

                        {activeTab === 'despesas' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>#{item.id}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.nome || item.descricao}</td>
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
          </>
        )}

      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: (!editingItem && creationMode === 'batch') ? '1080px' : '540px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '24px',
            color: '#0f172a',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            transition: 'all 0.3s ease'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.08em' }}>
                  {activeTab === 'dizimos' ? 'Dízimos' : activeTab === 'despesas' ? 'Despesas' : activeTab === 'ofertas' ? 'Ofertas' : 'Membros'}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editingItem ? <Edit size={20} color="var(--accent-primary)" /> : <Plus size={20} color="var(--accent-primary)" />}
                  {editingItem ? `Editar Registro #${editingItem.id}` : `Adicionar Novos Registros (${activeTab.toUpperCase()})`}
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'rgba(241, 245, 249, 0.8)', border: '1px solid #cbd5e1', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Creation Mode Switcher (Lançamento em Lote vs Único) */}
            {!editingItem && (
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
                <button
                  type="button"
                  onClick={() => setCreationMode('batch')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: creationMode === 'batch' ? '#1565c0' : 'transparent',
                    color: creationMode === 'batch' ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Plus size={15} /> ⚡ Lançamento em Lote (Múltiplos)
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMode('single')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: creationMode === 'single' ? '#1565c0' : 'transparent',
                    color: creationMode === 'single' ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Edit size={15} /> 👤 Registro Único
                </button>
              </div>
            )}

            {/* BATCH MODE FORM */}
            {!editingItem && creationMode === 'batch' ? (
              <form onSubmit={handleSaveBatch} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                
                {/* Batch Tools Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px'
                }}>
                  {/* Default Date Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Data padrão:</span>
                    <input
                      type="date"
                      className="text-input"
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      value={batchDefaultDate}
                      onChange={(e) => handleApplyDateToAll(e.target.value)}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(Aplica a todas as linhas)</span>
                  </div>

                  {/* Add Rows Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Adicionar:</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddBatchRows(1)}
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      + 1 linha
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddBatchRows(5)}
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', background: '#e2e8f0' }}
                    >
                      + 5 linhas
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAddBatchRows(10)}
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', background: '#e2e8f0' }}
                    >
                      + 10 linhas
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleClearEmptyBatchRows}
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', color: '#64748b' }}
                      title="Remover linhas sem dados preenchidos"
                    >
                      Limpar vazias
                    </button>
                  </div>
                </div>

                {/* Batch Dynamic Rows Table */}
                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '14px', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 10, borderBottom: '2px solid #cbd5e1' }}>
                      <tr style={{ textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 12px', width: '40px', textAlign: 'center' }}>#</th>
                        
                        {activeTab === 'membros' && (
                          <>
                            <th style={{ padding: '10px 12px' }}>Nome Completo *</th>
                            <th style={{ padding: '10px 12px', width: '160px' }}>Data Nasc.</th>
                            <th style={{ padding: '10px 12px', width: '100px', textAlign: 'center' }}>Membro?</th>
                            <th style={{ padding: '10px 12px', width: '100px', textAlign: 'center' }}>Batizado?</th>
                            <th style={{ padding: '10px 12px', width: '110px', textAlign: 'center' }}>U. Estável?</th>
                          </>
                        )}

                        {activeTab === 'dizimos' && (
                          <>
                            <th style={{ padding: '10px 12px' }}>Membro Dizimista *</th>
                            <th style={{ padding: '10px 12px', width: '160px' }}>Valor (R$) *</th>
                            <th style={{ padding: '10px 12px', width: '160px' }}>Data *</th>
                          </>
                        )}

                        {activeTab === 'ofertas' && (
                          <>
                            <th style={{ padding: '10px 12px' }}>Valor (R$) *</th>
                            <th style={{ padding: '10px 12px', width: '220px' }}>Data *</th>
                          </>
                        )}

                        {activeTab === 'despesas' && (
                          <>
                            <th style={{ padding: '10px 12px' }}>Nome / Descrição da Despesa *</th>
                            <th style={{ padding: '10px 12px', width: '160px' }}>Valor (R$) *</th>
                            <th style={{ padding: '10px 12px', width: '160px' }}>Data *</th>
                          </>
                        )}

                        <th style={{ padding: '10px 12px', width: '50px', textAlign: 'center' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchRows.map((row, index) => (
                        <tr key={row._tempId || index} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>
                            {index + 1}
                          </td>

                          {activeTab === 'membros' && (
                            <>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="text"
                                  placeholder="Nome completo do membro"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.nome || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'nome', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="date"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.data_nascimento || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'data_nascimento', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={!!row.membro}
                                  onChange={(e) => handleUpdateBatchRow(index, 'membro', e.target.checked)}
                                  style={{ width: '18px', height: '18px', accentColor: '#1565c0', cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={!!row.batizado}
                                  onChange={(e) => handleUpdateBatchRow(index, 'batizado', e.target.checked)}
                                  style={{ width: '18px', height: '18px', accentColor: '#1565c0', cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={!!row.uniao_estavel}
                                  onChange={(e) => handleUpdateBatchRow(index, 'uniao_estavel', e.target.checked)}
                                  style={{ width: '18px', height: '18px', accentColor: '#1565c0', cursor: 'pointer' }}
                                />
                              </td>
                            </>
                          )}

                          {activeTab === 'dizimos' && (
                            <>
                              <td style={{ padding: '8px 12px' }}>
                                <select
                                  className="select-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.membro_id || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'membro_id', Number(e.target.value))}
                                >
                                  <option value="">Selecione o membro…</option>
                                  {membros.map(m => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}
                                  value={row.valor || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'valor', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="date"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.data || batchDefaultDate}
                                  onChange={(e) => handleUpdateBatchRow(index, 'data', e.target.value)}
                                />
                              </td>
                            </>
                          )}

                          {activeTab === 'ofertas' && (
                            <>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Valor da oferta (R$)"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5' }}
                                  value={row.valor || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'valor', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="date"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.data || batchDefaultDate}
                                  onChange={(e) => handleUpdateBatchRow(index, 'data', e.target.value)}
                                />
                              </td>
                            </>
                          )}

                          {activeTab === 'despesas' && (
                            <>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="text"
                                  list="despesas-suggestions"
                                  placeholder="Ex: Conta de energia, Material..."
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.nome || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'nome', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700, color: '#e11d48' }}
                                  value={row.valor || ''}
                                  onChange={(e) => handleUpdateBatchRow(index, 'valor', e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <input
                                  type="date"
                                  className="text-input"
                                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
                                  value={row.data || batchDefaultDate}
                                  onChange={(e) => handleUpdateBatchRow(index, 'data', e.target.value)}
                                />
                              </td>
                            </>
                          )}

                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveBatchRow(index)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                              title="Remover esta linha"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Batch Footer with Totals & Submit */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#475569' }}>
                      {batchRows.length} linha(s) total
                    </span>
                    {activeTab !== 'membros' && (
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                        Total em Lote: {formatCurrency(batchRows.reduce((sum, r) => sum + (Number(r.valor) || 0), 0))}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
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
                      style={{ padding: '10px 24px', fontWeight: 800, borderRadius: '12px' }}
                    >
                      {isSubmitting ? 'Salvando Lote…' : `Salvar Registros em Lote`}
                    </button>
                  </div>
                </div>

              </form>
            ) : (
              /* SINGLE ITEM FORM (For editing or single record creation) */
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

                    {/* 3 Booleans: Membro, Batizado, União Estável */}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Valor (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Ex: 150.75"
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
                )}

                {/* DESPESAS FIELDS */}
                {activeTab === 'despesas' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Nome da Despesa *</label>
                      <input
                        type="text"
                        required
                        list="despesas-suggestions"
                        placeholder="Ex: Conta de energia"
                        className="text-input"
                        style={{ width: '100%', color: '#0f172a' }}
                        value={formData.nome || ''}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      />
                      <datalist id="despesas-suggestions">
                        <option value="Conta de energia" />
                        <option value="Conta de água" />
                        <option value="Internet e Telefone" />
                        <option value="Aluguel do Imóvel" />
                        <option value="Manutenção de Equipamentos" />
                        <option value="Material de Escritório" />
                        <option value="Ceia e Alimentos" />
                      </datalist>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Valor (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="Ex: 250.00"
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
            )}

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
