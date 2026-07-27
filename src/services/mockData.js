/**
 * Mock data for Church Financial Management
 * Mirrors backend models structure: Membro, Dizimos, Ofertas, Despesas
 */

export const mockMembros = [
  { id: 1, nome: "João Pedro Silva", cpf: "12345678901", email: "joao.pedro@email.com", celular: "(31) 99887-1122", membro: true, batizado: true },
  { id: 2, nome: "Maria Aparecida Oliveira", cpf: "23456789012", email: "maria.oliver@email.com", celular: "(31) 99776-2233", membro: true, batizado: true },
  { id: 3, nome: "Carlos Eduardo Santos", cpf: "34567890123", email: "carlos.santos@email.com", celular: "(31) 99665-3344", membro: true, batizado: true },
  { id: 4, nome: "Ana Paula Ferreira", cpf: "45678901234", email: "ana.paula@email.com", celular: "(31) 99554-4455", membro: true, batizado: true },
  { id: 5, nome: "Lucas Gabriel Costa", cpf: "56789012345", email: "lucas.costa@email.com", celular: "(31) 99443-5566", membro: true, batizado: false },
  { id: 6, nome: "Fernanda Souza Lima", cpf: "67890123456", email: "fernanda.souza@email.com", celular: "(31) 99332-6677", membro: true, batizado: true },
  { id: 7, nome: "Roberto Alves Ribeiro", cpf: "78901234567", email: "roberto.alves@email.com", celular: "(31) 99221-7788", membro: true, batizado: true },
  { id: 8, nome: "Juliana Rodrigues Martins", cpf: "89012345678", email: "juliana.martins@email.com", celular: "(31) 99110-8899", membro: true, batizado: true }
];

export const mockDizimos = [
  // Julho 2026 (Mês Atual)
  { id: 101, membro_id: 1, valor: 450.00, data: "2026-07-05" },
  { id: 102, membro_id: 2, valor: 320.00, data: "2026-07-05" },
  { id: 103, membro_id: 3, valor: 600.00, data: "2026-07-12" },
  { id: 104, membro_id: 4, valor: 250.00, data: "2026-07-12" },
  { id: 105, membro_id: 6, valor: 850.00, data: "2026-07-19" },
  { id: 106, membro_id: 7, valor: 500.00, data: "2026-07-19" },
  { id: 107, membro_id: 8, valor: 400.00, data: "2026-07-26" },

  // Junho 2026
  { id: 201, membro_id: 1, valor: 450.00, data: "2026-06-07" },
  { id: 202, membro_id: 2, valor: 300.00, data: "2026-06-07" },
  { id: 203, membro_id: 3, valor: 600.00, data: "2026-06-14" },
  { id: 204, membro_id: 5, valor: 200.00, data: "2026-06-21" },
  { id: 205, membro_id: 6, valor: 800.00, data: "2026-06-28" },

  // Maio 2026
  { id: 301, membro_id: 1, valor: 450.00, data: "2026-05-03" },
  { id: 302, membro_id: 4, valor: 250.00, data: "2026-05-10" },
  { id: 303, membro_id: 7, valor: 500.00, data: "2026-05-17" },
  { id: 304, membro_id: 8, valor: 350.00, data: "2026-05-24" }
];

export const mockOfertas = [
  // Julho 2026
  { id: 101, valor: 285.50, data: "2026-07-05" }, // Culto Domingo Manhã
  { id: 102, valor: 412.00, data: "2026-07-05" }, // Culto Domingo Noite
  { id: 103, valor: 145.00, data: "2026-07-08" }, // Culto de Ensino Quarta
  { id: 104, valor: 350.00, data: "2026-07-12" }, // Culto de Celebração
  { id: 105, valor: 198.50, data: "2026-07-15" }, // Oração Quinta
  { id: 106, valor: 520.00, data: "2026-07-19" }, // Culto com Santa Ceia
  { id: 107, valor: 310.00, data: "2026-07-26" }, // Culto de Missões

  // Junho 2026
  { id: 201, valor: 310.00, data: "2026-06-07" },
  { id: 202, valor: 180.00, data: "2026-06-14" },
  { id: 203, valor: 450.00, data: "2026-06-21" },
  { id: 204, valor: 290.00, data: "2026-06-28" },

  // Maio 2026
  { id: 301, valor: 275.00, data: "2026-05-03" },
  { id: 302, valor: 380.00, data: "2026-05-10" },
  { id: 303, valor: 410.00, data: "2026-05-24" }
];

export const mockDespesas = [
  // Julho 2026
  { id: 101, nome: "Aluguel do Templo e Galpão", valor: 1500.00, data: "2026-07-02" },
  { id: 102, nome: "Conta de Energia Elétrica (CEMIG)", valor: 385.40, data: "2026-07-08" },
  { id: 103, nome: "Conta de Água e Esgoto (COPASA)", valor: 142.80, data: "2026-07-10" },
  { id: 104, nome: "Compra de Pão e Vinho (Santa Ceia)", valor: 95.00, data: "2026-07-17" },
  { id: 105, nome: "Manutenção do Ar Condicionado", valor: 250.00, data: "2026-07-20" },
  { id: 106, nome: "Cabo XLR e Conectores Mesa de Som", valor: 120.00, data: "2026-07-22" },

  // Junho 2026
  { id: 201, nome: "Aluguel do Templo e Galpão", valor: 1500.00, data: "2026-06-02" },
  { id: 202, nome: "Conta de Energia Elétrica (CEMIG)", valor: 410.00, data: "2026-06-09" },
  { id: 203, nome: "Manutenção e Pintura Fachada", valor: 650.00, data: "2026-06-15" },
  { id: 204, nome: "Material de Limpeza e Papelaria", valor: 180.00, data: "2026-06-22" },

  // Maio 2026
  { id: 301, nome: "Aluguel do Templo e Galpão", valor: 1500.00, data: "2026-05-02" },
  { id: 302, nome: "Conta de Energia Elétrica (CEMIG)", valor: 360.00, data: "2026-05-08" },
  { id: 303, nome: "Oferta Pastoral de Amor (Preletor Convidado)", valor: 300.00, data: "2026-05-20" }
];
