// ============================================================
// EstudaAI — Sistema de Gestão de Estudos v4.1
// Arquitetura modular: auth / users / editais / planos / progresso
// Perfis: Admin | Coach | Aluno
// Persistência: Supabase (PostgreSQL)
// ============================================================

import { useState, useRef, createContext, useContext, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// SUPABASE — Cliente e persistência
// ============================================================
const SUPABASE_URL = "https://ogmlsmmybqmrnrilzesg.supabase.co";
const SUPABASE_KEY = "sb_publishable_dsUx1e6SQo_yuXg77NN-MA_HEL33DSo";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let _persistTimer = null;
function persistToSupabase(db) {
  clearTimeout(_persistTimer);
  _persistTimer = setTimeout(async () => {
    try {
      await supabase
        .from("app_state")
        .upsert({ id: "main", data: db, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn("[EstudaAI] Supabase persist error:", e);
    }
  }, 800);
}

// ============================================================
// MODULE: storage — Banco de dados em memória (singleton)
// ============================================================
const defaultDB = {
  users: [
    { id: "u1", name: "Administrador", email: "admin@estudaai.com", password: "admin123", role: "admin", createdAt: "2025-01-01T00:00:00.000Z" },
    { id: "u2", name: "Prof. Carlos", email: "carlos@estudaai.com", password: "coach123", role: "coach", createdAt: "2025-01-01T00:00:00.000Z" },
    { id: "u3", name: "Ana Lima", email: "ana@estudaai.com", password: "aluno123", role: "aluno", coachId: "u2", createdAt: "2025-01-01T00:00:00.000Z" },
  ],
  editais: [
    {
      id: "ed1", name: "Concurso TRT 2025", coachId: "u2",
      materias: [
        { id: "m1", name: "Direito Constitucional", color: "#6366f1", topicos: [
          { id: "t1", name: "Princípios Fundamentais" },
          { id: "t2", name: "Direitos Fundamentais" },
          { id: "t3", name: "Organização do Estado" },
          { id: "t4", name: "Poder Legislativo" },
        ]},
        { id: "m2", name: "Língua Portuguesa", color: "#ec4899", topicos: [
          { id: "t5", name: "Fonologia" },
          { id: "t6", name: "Morfologia" },
          { id: "t7", name: "Sintaxe" },
        ]},
        { id: "m3", name: "Raciocínio Lógico", color: "#14b8a6", topicos: [
          { id: "t8", name: "Proposições" },
          { id: "t9", name: "Tabela Verdade" },
        ]},
      ],
    },
  {
    id: "ed2", name: "Auditor de Controle Externo — TCE-RJ", coachId: "u2",
    materias: [
      { id: "m20", name: "Língua Portuguesa", color: "#ec4899", topicos: [
        { id: "t200", name: "Compreensão e interpretação de textos" },
        { id: "t201", name: "Tipologia textual" },
        { id: "t202", name: "Ortografia oficial" },
        { id: "t203", name: "Acentuação gráfica" },
        { id: "t204", name: "Emprego das classes de palavras" },
        { id: "t205", name: "Emprego do sinal indicativo de crase" },
        { id: "t206", name: "Sintaxe da oração e do período" },
        { id: "t207", name: "Pontuação" },
        { id: "t208", name: "Concordância nominal e verbal" },
        { id: "t209", name: "Regência nominal e verbal" },
        { id: "t210", name: "Significação das palavras" },
        { id: "t211", name: "Redação oficial (princípios e pronomes de tratamento)" },
      ]},
      { id: "m21", name: "Administração Pública", color: "#6366f1", topicos: [
        { id: "t212", name: "Estado, governo e administração pública: conceitos, elementos, poderes e organização; natureza, fins e princípios" },
        { id: "t213", name: "Organização administrativa do Estado" },
        { id: "t214", name: "Administração direta e indireta" },
        { id: "t215", name: "Agentes públicos: espécies e classificação; poderes, deveres e prerrogativas; cargo, emprego e função públicos" },
        { id: "t216", name: "Poderes administrativos" },
        { id: "t217", name: "Atos administrativos: conceitos, requisitos, atributos, classificação, espécies e invalidação" },
        { id: "t218", name: "Controle e responsabilização da administração: controle administrativo, judicial e legislativo; responsabilidade civil do Estado" },
        { id: "t219", name: "Governabilidade, governança e accountability" },
        { id: "t220", name: "Planejamento e controle governamentais" },
        { id: "t221", name: "Gerenciamento e avaliação de políticas públicas" },
      ]},
      { id: "m22", name: "Ética no Serviço Público", color: "#14b8a6", topicos: [
        { id: "t222", name: "Resolução nº 335/2019 (Código de Ética dos Servidores do TCE-RJ)" },
      ]},
      { id: "m23", name: "Legislação Institucional", color: "#f59e0b", topicos: [
        { id: "t223", name: "Deliberação nº 338/2023 (Regimento Interno do TCE-RJ)" },
        { id: "t224", name: "Lei Complementar nº 63/1990 (Lei Orgânica do TCE-RJ)" },
        { id: "t225", name: "Lei Estadual nº 4.787/2006 (Quadro de Pessoal e Plano de Carreiras do TCE-RJ)" },
        { id: "t226", name: "Decreto-Lei Estadual nº 220/1975 (Estatuto dos Funcionários Públicos Civis do ERJ)" },
        { id: "t227", name: "Decreto Estadual nº 2.479/1979 (Regulamento do Estatuto dos Funcionários Públicos Civis do ERJ)" },
      ]},
      { id: "m24", name: "Auditoria Governamental", color: "#ef4444", topicos: [
        { id: "t228", name: "Normas de auditoria do TCU (Portaria-TCU nº 280/2010)" },
        { id: "t229", name: "Técnicas e Controle: Auditoria e Fiscalização" },
        { id: "t230", name: "Papéis de trabalho, nota, relatório, registro de constatações, certificado e parecer" },
        { id: "t231", name: "Amostragem (IN nº 01/2001 - SFCI)" },
        { id: "t232", name: "Controle externo no setor público federal" },
        { id: "t233", name: "Normas de Auditoria do TCU – NAT: classificação e objetivos da auditoria" },
        { id: "t234", name: "Identificação e avaliação de objetivos, riscos e controles" },
        { id: "t235", name: "Comunicação com o auditado e requisições de documentos e informações" },
        { id: "t236", name: "Planejamento e execução de auditorias" },
        { id: "t237", name: "Relatório de auditoria" },
        { id: "t238", name: "Regimento Interno do TCU: atividade de controle externo" },
        { id: "t239", name: "Prestação de Contas e Relatório de Gestão: IN nº 63/2010 do TCU" },
        { id: "t240", name: "Da fiscalização contábil, financeira e orçamentária" },
        { id: "t241", name: "Lei Complementar nº 101/2000 (LRF): transparência, controle e fiscalização" },
        { id: "t242", name: "Lei nº 4.320/1964: Título VIII – Controle da execução orçamentária" },
        { id: "t243", name: "Execução de auditoria nas contas patrimoniais e de resultados" },
        { id: "t244", name: "Normas vigentes do CFC: Normas Profissionais de Auditor Independente (NBC PAs)" },
        { id: "t245", name: "NBC TA 200 – Objetivos gerais do auditor e condução da auditoria" },
        { id: "t246", name: "NBC TA 230 – Documentação de auditoria" },
        { id: "t247", name: "NBC TA 240 – Responsabilidade do auditor em relação à fraude" },
        { id: "t248", name: "Série 700 das NBC TAs – Formação da opinião e emissão do relatório" },
        { id: "t249", name: "NBC TI 01 – Auditoria Interna" },
        { id: "t250", name: "NBC PI 01 – Normas Profissionais do Auditor Interno" },
        { id: "t251", name: "NBASP – Normas Brasileiras de Auditoria do Setor Público" },
      ]},
      { id: "m25", name: "Contabilidade Pública", color: "#8b5cf6", topicos: [
        { id: "t252", name: "Conceito, objeto e regime" },
        { id: "t253", name: "Campo de aplicação" },
        { id: "t254", name: "Conceitos e princípios básicos da Lei nº 4.320/1964" },
        { id: "t255", name: "Plano Plurianual (PPA), Lei de Diretrizes Orçamentárias (LDO) e Lei Orçamentária Anual (LOA)" },
        { id: "t256", name: "Balanço financeiro, patrimonial, orçamentário e demonstrativo das variações" },
        { id: "t257", name: "Registros contábeis de operações" },
        { id: "t258", name: "Orçamento público: elaboração, acompanhamento e fiscalização" },
        { id: "t259", name: "Créditos adicionais: especiais, extraordinários, ilimitados e suplementares" },
        { id: "t260", name: "Princípios orçamentários" },
        { id: "t261", name: "Diretrizes orçamentárias" },
        { id: "t262", name: "Processo orçamentário" },
        { id: "t263", name: "Suprimento de fundos" },
        { id: "t264", name: "Restos a pagar" },
        { id: "t265", name: "Despesas de exercícios anteriores" },
        { id: "t266", name: "Conta única do Tesouro" },
        { id: "t267", name: "Tomadas e prestações de contas" },
        { id: "t268", name: "Controladoria" },
        { id: "t269", name: "Auditoria" },
        { id: "t270", name: "MCASP – 10ª edição" },
        { id: "t271", name: "Sistema de Planejamento e Orçamento e de Programação Financeira (Lei nº 10.180/2001)" },
        { id: "t272", name: "NBCASP – Normas Brasileiras de Contabilidade Aplicadas ao Setor Público" },
        { id: "t273", name: "SIAFI – Sistema Integrado de Administração Financeira do Governo Federal" },
      ]},
      { id: "m26", name: "Administração Financeira e Orçamentária (AFO)", color: "#22d3ee", topicos: [
        { id: "t274", name: "Orçamento público: conceito, noções gerais, campo de atuação, ciclo orçamentário e princípios orçamentários; créditos adicionais" },
        { id: "t275", name: "Orçamento-programa: conceito e finalidade" },
        { id: "t276", name: "Instrumentos de planejamento governamental: PPA, LDO e LOA" },
        { id: "t277", name: "Reserva de contingência" },
        { id: "t278", name: "Contingenciamento de dotações" },
        { id: "t279", name: "Receita pública: conceito, classificações e estágios; receita orçamentária e extraorçamentária" },
        { id: "t280", name: "Despesa pública: conceito, classificações e estágios; despesa orçamentária e extraorçamentária" },
        { id: "t281", name: "Restos a pagar (AFO)" },
        { id: "t282", name: "Despesas de exercícios anteriores (AFO)" },
        { id: "t283", name: "Fundos especiais" },
      ]},
    ],
  },
  ],
  alunoEditais: [{ alunoId: "u3", editalId: "ed1" }, { alunoId: "u3", editalId: "ed2" }],
  planos: [],
  progresso: [],
  studyNotes: [],
  gamificacao: [],
  logs: [],
  simulados: [],
  questoes: [],
  tentativas: [],
  resumoComments: [],
  resumoAdditions: [],
  materialFiles: [],
};

// Singleton mutável — funciona como "banco em memória"
let _db = JSON.parse(JSON.stringify(defaultDB));
let _listeners = [];

const storage = {
  get() { return _db; },
  set(updater) {
    _db = typeof updater === "function" ? updater(_db) : { ..._db, ...updater };
    _listeners.forEach(fn => fn(_db));
    persistToSupabase(_db);
    return _db;
  },
  async load() {
    try {
      const { data, error } = await supabase
        .from("app_state")
        .select("data")
        .eq("id", "main")
        .single();
      if (data?.data && !error) {
        _db = { ...defaultDB, ...data.data };
        _listeners.forEach(fn => fn(_db));
      }
    } catch (e) {
      console.warn("[EstudaAI] Supabase load error:", e);
    }
  },
  subscribe(fn) { _listeners.push(fn); return () => { _listeners = _listeners.filter(l => l !== fn); }; },
};

// ============================================================
// MODULE: auth
// ============================================================
let _session = null;

const authModule = {
  login(identifier, password) {
    const db = storage.get();
    const id = identifier.trim().toLowerCase();
    const user = db.users.find(u =>
      (u.email.toLowerCase() === id || u.name.toLowerCase() === id) && u.password === password
    );
    if (!user) return { success: false, error: "Usuário ou senha incorretos." };
    _session = user;
    return { success: true, user };
  },
  logout() { _session = null; },
  getSession() { return _session; },
  resetPassword(userId, newPassword) {
    storage.set(db => ({ ...db, users: db.users.map(u => u.id === userId ? { ...u, password: newPassword } : u) }));
    logModule.add("admin", `Senha resetada para usuário ${userId}`);
  },
};

// ============================================================
// MODULE: log
// ============================================================
const logModule = {
  add(actorId, message, meta = {}) {
    storage.set(db => ({
      ...db,
      logs: [...db.logs, { id: `log${Date.now()}${Math.random()}`, actorId, message, meta, createdAt: new Date().toISOString() }],
    }));
  },
  getAll() { return storage.get().logs; },
  getByUser(userId) { return storage.get().logs.filter(l => l.actorId === userId || l.meta?.targetId === userId); },
};

// ============================================================
// MODULE: users
// ============================================================
const usersModule = {
  getAll() { return storage.get().users; },
  getById(id) { return storage.get().users.find(u => u.id === id); },
  getCoaches() { return storage.get().users.filter(u => u.role === "coach"); },
  getAlunos(coachId = null) {
    const all = storage.get().users.filter(u => u.role === "aluno");
    return coachId ? all.filter(u => u.coachId === coachId) : all;
  },
  create(data) {
    const user = { id: `u${Date.now()}`, ...data, createdAt: new Date().toISOString() };
    storage.set(db => ({ ...db, users: [...db.users, user] }));
    logModule.add(data.createdBy || "system", `Usuário criado: ${data.name} (${data.role})`);
    return user;
  },
  update(id, data) {
    storage.set(db => ({ ...db, users: db.users.map(u => u.id === id ? { ...u, ...data } : u) }));
    logModule.add(data.updatedBy || "system", `Usuário atualizado: ${id}`);
  },
  delete(id) {
    storage.set(db => ({ ...db, users: db.users.filter(u => u.id !== id) }));
    logModule.add("system", `Usuário removido: ${id}`);
  },
};

// ============================================================
// MODULE: editais
// ============================================================
const editaisModule = {
  getAll() { return storage.get().editais; },
  getByCoach(coachId) { return storage.get().editais.filter(e => e.coachId === coachId); },
  getById(id) { return storage.get().editais.find(e => e.id === id); },
  create(data) {
    const edital = { id: `ed${Date.now()}`, ...data, materias: data.materias || [], createdAt: new Date().toISOString() };
    storage.set(db => ({ ...db, editais: [...db.editais, edital] }));
    return edital;
  },
  update(id, data) { storage.set(db => ({ ...db, editais: db.editais.map(e => e.id === id ? { ...e, ...data } : e) })); },
  delete(id) { storage.set(db => ({ ...db, editais: db.editais.filter(e => e.id !== id) })); },
  associarAluno(alunoId, editalId) {
    storage.set(db => {
      if (db.alunoEditais.find(ae => ae.alunoId === alunoId && ae.editalId === editalId)) return db;
      return { ...db, alunoEditais: [...db.alunoEditais, { alunoId, editalId }] };
    });
    logModule.add("coach", `Edital ${editalId} associado ao aluno ${alunoId}`);
  },
  desassociarAluno(alunoId, editalId) {
    storage.set(db => ({ ...db, alunoEditais: db.alunoEditais.filter(ae => !(ae.alunoId === alunoId && ae.editalId === editalId)) }));
  },
  getByAluno(alunoId) {
    const db = storage.get();
    const ids = db.alunoEditais.filter(ae => ae.alunoId === alunoId).map(ae => ae.editalId);
    return db.editais.filter(e => ids.includes(e.id));
  },
};

// ============================================================
// MODULE: planos
// ============================================================
const REVIEW_INTERVALS = [1, 7, 14, 21];
const REVIEW_PRESETS = {
  baixa:    [1, 14, 21],
  moderada: [1, 7, 14, 21],
  intensa:  [1, 7, 14, 21, 30],
};
const REVIEW_PRESET_LABELS = { baixa: "Baixa", moderada: "Moderada", intensa: "Intensa" };
const REVIEW_PRESET_DESCS  = { baixa: "3 revisões: 1, 14, 21d", moderada: "4 revisões: 1, 7, 14, 21d", intensa: "5 revisões: 1, 7, 14, 21, 30d" };

const planosModule = {
  generate(alunoId, editalId, rotina) {
    const edital = editaisModule.getById(editalId);
    if (!edital) return null;
    // Filter to selected materias (if provided), otherwise use all
    const materiaIds = rotina.materiaIds && rotina.materiaIds.length > 0 ? rotina.materiaIds : null;
    const materias = materiaIds
      ? edital.materias.filter(m => materiaIds.includes(m.id))
      : edital.materias;
    // Filter topics by coverage level (nivelCobertura)
    // nivelCobertura is now an array: ["baixa", "media", "alta"]
    const nivelCobertura = rotina.nivelCobertura || ["media"];
    const filtrarPorNivel = (topicos) => {
      return topicos.filter(t => {
        // If any of the selected levels has content, include this topic
        return nivelCobertura.some(nivel => {
          switch(nivel) {
            case "baixa": return t.conteudoBaixa?.trim().length > 0;
            case "media": return t.conteudoMedia?.trim().length > 0;
            case "alta": return t.conteudoAlta?.trim().length > 0;
            default: return false;
          }
        });
      });
    };
    // Build per-materia topic queues and interleave round-robin
    const queues = materias.map(m =>
      filtrarPorNivel(m.topicos).map(t => ({ ...t, materiaId: m.id, materiaName: m.name, materiaColor: m.color, materiaReviewPreset: m.reviewPreset || "moderada" }))
    );
    const allTopicos = [];
    let remaining = queues.filter(q => q.length > 0);
    let cursors = queues.map(() => 0);
    while (remaining.some((_, i) => cursors[i] < queues[i].length)) {
      for (let i = 0; i < queues.length; i++) {
        if (cursors[i] < queues[i].length) {
          allTopicos.push(queues[i][cursors[i]]);
          cursors[i]++;
        }
      }
    }
    const plan = {}, reviews = {};
    let topicIdx = 0;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    // Support both new diasConfig {0:0,1:2,...} and legacy {dias:[],aulasPorDia:n}
    const diasConfig = rotina.diasConfig || null;
    const aulasPorDia = rotina.aulasPorDia || 1;
    const diasEstudo = rotina.dias || [1, 2, 3, 4, 5];
    function aulasNoDia(dow) {
      if (diasConfig) return diasConfig[dow] || 0;
      return diasEstudo.includes(dow) ? aulasPorDia : 0;
    }
    let dayOffset = 0;
    // Ensure plan is long enough for all topics + reviews (intensa strategy goes up to day 30, so add buffer)
    const maxDays = allTopicos.length * 5 + 100;
    while (topicIdx < allTopicos.length && dayOffset < maxDays) {
      const d = new Date(start); d.setDate(d.getDate() + dayOffset);
      const dow = d.getDay();
      const key = localDateKey(d);
      if (!plan[key]) plan[key] = { date: key, topicos: [], reviews: [] };
      const aulasHoje = aulasNoDia(dow);
      if (aulasHoje > 0) {
        for (let a = 0; a < aulasHoje && topicIdx < allTopicos.length; a++) {
          plan[key].topicos.push({ ...allTopicos[topicIdx] });
          const reviewIntervals = REVIEW_PRESETS[allTopicos[topicIdx].materiaReviewPreset || "moderada"] || REVIEW_INTERVALS;
          reviewIntervals.forEach(interval => {
            // Move review to next study day if it falls on a day off
            let revDate = new Date(d); revDate.setDate(revDate.getDate() + interval);
            let safety = 0;
            while (aulasNoDia(revDate.getDay()) === 0 && safety < 7) {
              revDate.setDate(revDate.getDate() + 1);
              safety++;
            }
            const revKey = localDateKey(revDate);
            if (!reviews[revKey]) reviews[revKey] = [];
            reviews[revKey].push({ ...allTopicos[topicIdx], reviewInterval: interval });
          });
          topicIdx++;
        }
      } // end aulasHoje > 0
      dayOffset++;
    }
    Object.entries(reviews).forEach(([key, revs]) => {
      if (!plan[key]) plan[key] = { date: key, topicos: [], reviews: [] };
      // Deduplication: avoid adding the same review (same topic + same interval) twice
      const reviewKeys = new Set();
      revs.forEach(r => {
        const dedupKey = `${r.id}|${r.reviewInterval}`;
        if (!reviewKeys.has(dedupKey)) {
          plan[key].reviews.push(r);
          reviewKeys.add(dedupKey);
        }
      });
    });
    // Cap reviews per day — redistribute overflow to next study day
    const maxRevDay = rotina.maxRevisoesPorDia || 0;
    if (maxRevDay > 0) {
      const sortedKeys = Object.keys(plan).sort();
      for (let i = 0; i < sortedKeys.length; i++) {
        const dk = sortedKeys[i];
        if (plan[dk].reviews.length > maxRevDay) {
          const overflow = plan[dk].reviews.splice(maxRevDay);
          let j = i + 1;
          while (j < sortedKeys.length && aulasNoDia(new Date(sortedKeys[j]+"T12:00:00").getDay()) === 0) j++;
          if (j < sortedKeys.length) {
            plan[sortedKeys[j]].reviews = [...overflow, ...plan[sortedKeys[j]].reviews];
          } else {
            // Extend plan by finding the next study day after the last key
            const lastDate = new Date(sortedKeys[sortedKeys.length-1]+"T12:00:00");
            let extDate = new Date(lastDate); extDate.setDate(extDate.getDate()+1);
            let safety3 = 0;
            while (aulasNoDia(extDate.getDay()) === 0 && safety3 < 14) { extDate.setDate(extDate.getDate()+1); safety3++; }
            const extKey = localDateKey(extDate);
            if (!plan[extKey]) plan[extKey] = { date: extKey, topicos: [], reviews: [] };
            plan[extKey].reviews.push(...overflow);
            sortedKeys.push(extKey);
          }
        }
      }
    }
    const plano = { id: `pl${Date.now()}`, alunoId, editalId, rotina, plan, nivelCobertura, createdAt: new Date().toISOString() };
    storage.set(db => ({
      ...db,
      planos: [...db.planos.filter(p => !(p.alunoId === alunoId && p.editalId === editalId)), plano],
    }));
    logModule.add(alunoId, `Plano gerado para edital ${editalId}`, { editalId });
    return plano;
  },
  getByAluno(alunoId) { return storage.get().planos.filter(p => p.alunoId === alunoId); },
  getById(id) { return storage.get().planos.find(p => p.id === id); },
  delete(planoId) {
    storage.set(db => ({
      ...db,
      planos:    db.planos.filter(p => p.id !== planoId),
      progresso: db.progresso.filter(p => p.planoId !== planoId),
    }));
  },
  updateRotina(planoId, alunoId, novaRotina) {
    const plano = this.getById(planoId);
    if (!plano) return null;
    logModule.add(alunoId, `Rotina alterada`, { planoId, rotina: novaRotina });
    // Preserve past plan entries (dates before today) so previous weeks stay visible
    const todayKey = localDateKey();
    const pastPlan = {};
    Object.entries(plano.plan || {}).forEach(([key, day]) => {
      if (key < todayKey) pastPlan[key] = day;
    });
    // regenerarFuturo: keeps same plano.id, only rebuilds lessons from today forward
    this.regenerarFuturo(planoId, alunoId, novaRotina);
    // Merge past entries back so historical weeks remain intact
    if (Object.keys(pastPlan).length > 0) {
      storage.set(db => ({
        ...db,
        planos: db.planos.map(p => p.id === planoId ? { ...p, plan: { ...pastPlan, ...p.plan } } : p),
      }));
    }
    return this.getById(planoId);
  },
};

// ============================================================
// MODULE: progresso
// ============================================================
const progressoModule = {
  toggle(alunoId, planoId, key) {
    storage.set(db => {
      const prog = db.progresso;
      const idx = prog.findIndex(p => p.alunoId === alunoId && p.planoId === planoId && p.key === key);
      if (idx >= 0) {
        const updated = [...prog];
        updated[idx] = { ...updated[idx], done: !updated[idx].done };
        return { ...db, progresso: updated };
      }
      return { ...db, progresso: [...prog, { alunoId, planoId, key, done: true, at: new Date().toISOString() }] };
    });
  },
  isDone(alunoId, planoId, key) {
    const item = storage.get().progresso.find(p => p.alunoId === alunoId && p.planoId === planoId && p.key === key);
    return item ? item.done : false;
  },
  saveNote(alunoId, planoId, topicId, note) {
    storage.set(db => {
      const notes = db.studyNotes || [];
      const idx = notes.findIndex(n => n.alunoId === alunoId && n.planoId === planoId && n.topicId === topicId);
      if (idx >= 0) {
        const updated = [...notes];
        updated[idx] = { ...updated[idx], note, updatedAt: new Date().toISOString() };
        return { ...db, studyNotes: updated };
      }
      return { ...db, studyNotes: [...notes, { alunoId, planoId, topicId, note, updatedAt: new Date().toISOString() }] };
    });
  },
  getNote(alunoId, planoId, topicId) {
    return (storage.get().studyNotes || []).find(n => n.alunoId === alunoId && n.planoId === planoId && n.topicId === topicId)?.note || "";
  },
  getStats(alunoId, planoId) {
    const plano = planosModule.getById(planoId);
    if (!plano) return null;
    const totalAulas = Object.values(plano.plan).reduce((a, d) => a + d.topicos.length, 0);
    const totalReviews = Object.values(plano.plan).reduce((a, d) => a + d.reviews.length, 0);
    const prog = storage.get().progresso.filter(p => p.alunoId === alunoId && p.planoId === planoId && p.done);
    const aulasFeitas = prog.filter(p => !p.key.endsWith("-rev")).length;
    const reviewsFeitas = prog.filter(p => p.key.endsWith("-rev")).length;
    const pct = totalAulas ? Math.round((aulasFeitas / totalAulas) * 100) : 0;
    const aulasPorDia = plano.rotina?.aulasPorDia || 1;
    const diasRestantes = aulasFeitas < totalAulas ? Math.ceil((totalAulas - aulasFeitas) / aulasPorDia) : 0;
    const previsao = diasRestantes > 0
      ? new Date(Date.now() + diasRestantes * 86400000).toLocaleDateString("pt-BR")
      : "Concluído!";
    return { totalAulas, aulasFeitas, totalReviews, reviewsFeitas, pct, previsao };
  },
  saveDone(alunoId, planoId, key) {
    storage.set(db => {
      const prog = db.progresso;
      const idx = prog.findIndex(p => p.alunoId === alunoId && p.planoId === planoId && p.key === key);
      if (idx >= 0) {
        const updated = [...prog];
        updated[idx] = { ...updated[idx], done: true };
        return { ...db, progresso: updated };
      }
      return { ...db, progresso: [...prog, { alunoId, planoId, key, done: true, at: new Date().toISOString() }] };
    });
  },
};

// ============================================================
// MODULE: resumo (comentários e complementos do coach)
// ============================================================
const resumoModule = {
  saveCoachComment(alunoId, planoId, topicId, coachId, comment) {
    storage.set(db => {
      const comments = db.resumoComments || [];
      const idx = comments.findIndex(c => c.alunoId === alunoId && c.planoId === planoId && c.topicId === topicId);
      if (idx >= 0) {
        const updated = [...comments];
        updated[idx] = { ...updated[idx], coachComment: comment, coachId, updatedAt: new Date().toISOString() };
        return { ...db, resumoComments: updated };
      }
      return { ...db, resumoComments: [...comments, { alunoId, planoId, topicId, coachComment: comment, coachId, updatedAt: new Date().toISOString() }] };
    });
  },
  getCoachComment(alunoId, planoId, topicId) {
    return (storage.get().resumoComments || []).find(c => c.alunoId === alunoId && c.planoId === planoId && c.topicId === topicId)?.coachComment || "";
  },
  saveCoachAddition(alunoId, planoId, topicId, coachId, addition) {
    storage.set(db => {
      const additions = db.resumoAdditions || [];
      const idx = additions.findIndex(a => a.alunoId === alunoId && a.planoId === planoId && a.topicId === topicId);
      if (idx >= 0) {
        const updated = [...additions];
        updated[idx] = { ...updated[idx], addition, coachId, updatedAt: new Date().toISOString() };
        return { ...db, resumoAdditions: updated };
      }
      return { ...db, resumoAdditions: [...additions, { alunoId, planoId, topicId, addition, coachId, updatedAt: new Date().toISOString() }] };
    });
  },
  getCoachAddition(alunoId, planoId, topicId) {
    return (storage.get().resumoAdditions || []).find(a => a.alunoId === alunoId && a.planoId === planoId && a.topicId === topicId)?.addition || "";
  },
};

// ============================================================
// MODULE: gamificacao
// ============================================================
const NIVEIS = [
  { level:1, name:"Iniciante",  min:0,    max:100,  emoji:"🌱" },
  { level:2, name:"Estudante",  min:100,  max:300,  emoji:"📖" },
  { level:3, name:"Dedicado",   min:300,  max:700,  emoji:"🎯" },
  { level:4, name:"Focado",     min:700,  max:1400, emoji:"🔥" },
  { level:5, name:"Expert",     min:1400, max:2500, emoji:"⚡" },
  { level:6, name:"Mestre",     min:2500, max:4000, emoji:"🏆" },
  { level:7, name:"Lenda",      min:4000, max:Infinity, emoji:"👑" },
];

const gamificacaoModule = {
  get(alunoId) {
    return storage.get().gamificacao?.find(g => g.alunoId === alunoId) ||
      { alunoId, weekGoal: 5 };
  },
  calcXP(alunoId, planoId) {
    const prog = storage.get().progresso.filter(p => p.alunoId === alunoId && p.planoId === planoId && p.done);
    return prog.filter(p => !p.key.endsWith("-rev")).length * 10 +
           prog.filter(p =>  p.key.endsWith("-rev")).length * 5;
  },
  getNivel(xp) {
    return NIVEIS.find(n => xp >= n.min && xp < n.max) || NIVEIS[NIVEIS.length - 1];
  },
  getStreakAtual(alunoId, planoId) {
    const prog = storage.get().progresso.filter(
      p => p.alunoId === alunoId && p.planoId === planoId && p.done && !p.key.endsWith("-rev")
    );
    const days = [...new Set(prog.map(p => p.key.split("-").slice(0,3).join("-")))].sort().reverse();
    if (!days.length) return 0;
    const today = new Date(); today.setHours(0,0,0,0);
    let streak = 0;
    let expected = new Date(today);
    for (const dk of days) {
      const expKey = localDateKey(expected);
      if (dk === expKey) { streak++; expected.setDate(expected.getDate() - 1); }
      else if (dk < expKey) break;
    }
    return streak;
  },
  getMetaSemanal(alunoId, planoId) {
    const prog = storage.get().progresso.filter(
      p => p.alunoId === alunoId && p.planoId === planoId && p.done && !p.key.endsWith("-rev")
    );
    const today = new Date(); today.setHours(0,0,0,0);
    const mon = new Date(today); mon.setDate(today.getDate() - ((today.getDay()+6)%7));
    const monKey = localDateKey(mon);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const sunKey = localDateKey(sun);
    const thisWeek = prog.filter(p => { const dk=p.key.split("-").slice(0,3).join("-"); return dk>=monKey&&dk<=sunKey; });
    const meta = this.get(alunoId).weekGoal || 5;
    return { feitas: thisWeek.length, meta };
  },
  setMeta(alunoId, meta) {
    storage.set(db => {
      const arr = db.gamificacao || [];
      const idx = arr.findIndex(g => g.alunoId === alunoId);
      const ex = idx >= 0 ? arr[idx] : { alunoId, weekGoal: 5 };
      const upd = { ...ex, weekGoal: meta };
      return { ...db, gamificacao: idx >= 0 ? arr.map((g,i) => i===idx ? upd : g) : [...arr, upd] };
    });
  },
};

// ============================================================
// MODULE: simulados (Exam/Quizzes)
// ============================================================
const simuladosModule = {
  create(coachId, editalId, nome, tipo, materiaId, descricao) {
    const id = "sim_" + Math.random().toString(36).substr(2,9);
    const simulado = {
      id, coachId, editalId, nome, tipo, materiaId: tipo === "geral" ? null : materiaId, descricao,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    storage.set(db => ({ ...db, simulados: [...(db.simulados || []), simulado] }));
    return simulado;
  },
  getById(id) {
    return (storage.get().simulados || []).find(s => s.id === id);
  },
  getByCoach(coachId) {
    return (storage.get().simulados || []).filter(s => s.coachId === coachId);
  },
  getByEdital(editalId) {
    return (storage.get().simulados || []).filter(s => s.editalId === editalId);
  },
  update(id, updates) {
    storage.set(db => ({
      ...db,
      simulados: (db.simulados || []).map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)
    }));
  },
  delete(id) {
    storage.set(db => ({
      ...db,
      simulados: (db.simulados || []).filter(s => s.id !== id),
      questoes: (db.questoes || []).filter(q => q.simuladoId !== id),
      tentativas: (db.tentativas || []).filter(t => t.simuladoId !== id)
    }));
  }
};

// ============================================================
// MODULE: questões (Quiz Questions)
// ============================================================
const questoesModule = {
  create(simuladoId, tipo, enunciado, alternativas, gabarito, ordem) {
    const id = "q_" + Math.random().toString(36).substr(2,9);
    const questao = {
      id, simuladoId, tipo, enunciado, alternativas: alternativas || [], gabarito, ordem: ordem || 0,
      createdAt: new Date().toISOString()
    };
    storage.set(db => ({ ...db, questoes: [...(db.questoes || []), questao] }));
    return questao;
  },
  getBySimulado(simuladoId) {
    return ((storage.get().questoes || []).filter(q => q.simuladoId === simuladoId)).sort((a,b) => a.ordem - b.ordem);
  },
  getById(id) {
    return (storage.get().questoes || []).find(q => q.id === id);
  },
  update(id, updates) {
    storage.set(db => ({
      ...db,
      questoes: (db.questoes || []).map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  },
  delete(id) {
    storage.set(db => ({
      ...db,
      questoes: (db.questoes || []).filter(q => q.id !== id),
      tentativas: (db.tentativas || []).filter(t => !t.respostas?.some(r => r.questaoId === id))
    }));
  }
};

// ============================================================
// MODULE: tentativas (Quiz Attempts)
// ============================================================
const tentativasModule = {
  create(simuladoId, alunoId) {
    const id = "tent_" + Math.random().toString(36).substr(2,9);
    const tentativa = {
      id, simuladoId, alunoId, respostas: [], startedAt: new Date().toISOString(), finishedAt: null, status: "em_andamento"
    };
    storage.set(db => ({ ...db, tentativas: [...(db.tentativas || []), tentativa] }));
    return tentativa;
  },
  getById(id) {
    return (storage.get().tentativas || []).find(t => t.id === id);
  },
  getBySimuladoAluno(simuladoId, alunoId) {
    return (storage.get().tentativas || []).filter(t => t.simuladoId === simuladoId && t.alunoId === alunoId);
  },
  responder(tentativaId, questaoId, resposta) {
    storage.set(db => {
      const tentativas = db.tentativas || [];
      return {
        ...db,
        tentativas: tentativas.map(t => {
          if (t.id !== tentativaId) return t;
          const idx = t.respostas.findIndex(r => r.questaoId === questaoId);
          if (idx >= 0) {
            const newResps = [...t.respostas];
            newResps[idx] = { questaoId, resposta, respondidaEm: new Date().toISOString() };
            return { ...t, respostas: newResps };
          }
          return { ...t, respostas: [...t.respostas, { questaoId, resposta, respondidaEm: new Date().toISOString() }] };
        })
      };
    });
  },
  salvarTempoDecorrido(tentativaId, tempoSegundos) {
    storage.set(db => {
      const tentativas = db.tentativas || [];
      return {
        ...db,
        tentativas: tentativas.map(t => t.id === tentativaId
          ? { ...t, tempoDecorridoSegundos: tempoSegundos }
          : t
        )
      };
    });
  },
  finalizar(tentativaId, tempoDecorridoSegundos) {
    storage.set(db => {
      const tentativas = db.tentativas || [];
      const tentativa = tentativas.find(t => t.id === tentativaId);
      if (!tentativa) return db;
      const questoes = questoesModule.getBySimulado(tentativa.simuladoId);
      let acertos = 0, erros = 0;
      const respostasIncorretas = [];
      questoes.forEach(q => {
        const resp = tentativa.respostas.find(r => r.questaoId === q.id);
        if (resp && resp.resposta === q.gabarito) acertos++;
        else {
          erros++;
          respostasIncorretas.push({ questaoId: q.id, questaoEnunciado: q.enunciado });
        }
      });
      return {
        ...db,
        tentativas: tentativas.map(t => t.id === tentativaId
          ? { ...t, finishedAt: new Date().toISOString(), status: "finalizada", acertos, erros, tempoDecorridoSegundos, respostasIncorretas }
          : t
        )
      };
    });
  },
  getResultados(simuladoId, coachId) {
    const simulado = simuladosModule.getById(simuladoId);
    if (!simulado || simulado.coachId !== coachId) return null;
    const tentativas = (storage.get().tentativas || []).filter(t => t.simuladoId === simuladoId && t.status === "finalizada");
    return { simulado, tentativas };
  }
};

// ============================================================
// MODULE: migração de editais
// ============================================================
// Utilitário para calcular similaridade entre strings (Levenshtein distance)
function calcularSimilaridade(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0; // Match perfeito

  // Remover palavras comuns e comparar
  const removerStopwords = (s) => s.replace(/\b(e|ou|de|da|do|à|a|o)\b/gi, '').trim();
  const s1clean = removerStopwords(s1);
  const s2clean = removerStopwords(s2);

  // Se ficou igual após remover stopwords, é um match muito bom
  if (s1clean === s2clean && s1clean.length > 0) return 0.95;

  // Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  const distance = matrix[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLen);
}

const migracaoModule = {
  // Analisar compatibilidade entre dois editais
  analisarCompatibilidade(editalAtualId, novoEditalId) {
    const editalAtual = editaisModule.getById(editalAtualId);
    const novoEdital = editaisModule.getById(novoEditalId);

    if (!editalAtual || !novoEdital) return null;

    const materiaAtualMap = new Map(editalAtual.materias.map(m => [m.id, m]));
    const materiaNovaMap = new Map(novoEdital.materias.map(m => [m.id, m]));

    const compatibilidade = {
      automaticas: [],    // Matérias com nome exatamente igual
      manuais: [],        // Matérias similares que precisam confirmação
      removidas: [],      // Matérias que não existem no novo edital
      novas: []          // Matérias que só existem no novo edital
    };

    // Verificar matérias do edital atual
    editalAtual.materias.forEach(materiaAtual => {
      const match = novoEdital.materias.find(m => m.id === materiaAtual.id);

      if (match) {
        // Match exato por ID
        compatibilidade.automaticas.push({
          id: materiaAtual.id,
          nome: materiaAtual.name,
          novoId: match.id,
          novoNome: match.name,
          similaridade: 1.0
        });
      } else {
        // Procurar matérias similares por nome
        let melhorMatch = null;
        let melhorSimilaridade = 0;

        novoEdital.materias.forEach(materiaNovaCandidata => {
          const sim = calcularSimilaridade(materiaAtual.name, materiaNovaCandidata.name);
          if (sim > melhorSimilaridade && sim >= 0.6) {
            melhorSimilaridade = sim;
            melhorMatch = materiaNovaCandidata;
          }
        });

        if (melhorMatch) {
          compatibilidade.manuais.push({
            id: materiaAtual.id,
            nome: materiaAtual.name,
            novoId: melhorMatch.id,
            novoNome: melhorMatch.name,
            similaridade: melhorSimilaridade,
            requerConfirmacao: true
          });
        } else {
          compatibilidade.removidas.push({
            id: materiaAtual.id,
            nome: materiaAtual.name
          });
        }
      }
    });

    // Verificar matérias novas
    novoEdital.materias.forEach(materiaNovaMateria => {
      const existe = compatibilidade.automaticas.some(a => a.novoId === materiaNovaMateria.id) ||
                     compatibilidade.manuais.some(m => m.novoId === materiaNovaMateria.id);
      if (!existe) {
        compatibilidade.novas.push({
          id: materiaNovaMateria.id,
          nome: materiaNovaMateria.name
        });
      }
    });

    return compatibilidade;
  },

  // Executar a migração
  executarMigracao(alunoId, planoId, novoEditalId, confirmacoesManuais) {
    const plano = planosModule.getById(planoId);
    if (!plano) return { sucesso: false, erro: "Plano não encontrado" };

    const editalAtual = editaisModule.getById(plano.editalId);
    const novoEdital = editaisModule.getById(novoEditalId);
    if (!editalAtual || !novoEdital) return { sucesso: false, erro: "Edital não encontrado" };

    const compatibilidade = this.analisarCompatibilidade(plano.editalId, novoEditalId);

    // Validar confirmações manuais
    const materiasConfirmadas = new Map();
    compatibilidade.automaticas.forEach(a => {
      materiasConfirmadas.set(a.id, a.novoId);
    });

    if (confirmacoesManuais) {
      Object.entries(confirmacoesManuais).forEach(([materiaId, novoMateriaId]) => {
        materiasConfirmadas.set(materiaId, novoMateriaId);
      });
    }

    // Buscar progresso do aluno
    const progresso = (storage.get().progresso || []).filter(p => p.alunoId === alunoId && p.planoId === planoId);
    const notas = (storage.get().studyNotes || []).filter(n => n.alunoId === alunoId && n.planoId === planoId);

    // Mapear topicIds do plano antigo para o novo
    const novoPlano = JSON.parse(JSON.stringify(plano));
    novoPlano.editalId = novoEditalId;

    const materiaAtualMap = new Map(editalAtual.materias.map(m => [m.id, m]));
    const materiaNovaMap = new Map(novoEdital.materias.map(m => [m.id, m]));

    // Reconstruir plan preservando tópicos das matérias mapeadas
    const novoPlanoStructure = {};

    Object.entries(plano.plan).forEach(([dataKey, dayData]) => {
      const novoTopicos = [];
      const novoReviews = [];

      // Processar tópicos
      dayData.topicos.forEach(topico => {
        const materiaAtual = materiaAtualMap.get(topico.materiaId);
        const novoMateriaId = materiasConfirmadas.get(topico.materiaId);

        if (novoMateriaId) {
          const novaMateria = materiaNovaMap.get(novoMateriaId);
          if (novaMateria) {
            novoTopicos.push({
              ...topico,
              materiaId: novoMateriaId,
              materiaName: novaMateria.name,
              materiaColor: novaMateria.color,
              materiaReviewPreset: novaMateria.reviewPreset || "moderada"
            });
          }
        }
      });

      // Processar reviews
      dayData.reviews.forEach(review => {
        const novoMateriaId = materiasConfirmadas.get(review.materiaId);
        if (novoMateriaId) {
          const novaMateria = materiaNovaMap.get(novoMateriaId);
          if (novaMateria) {
            novoReviews.push({
              ...review,
              materiaId: novoMateriaId,
              materiaName: novaMateria.name,
              materiaColor: novaMateria.color,
              materiaReviewPreset: novaMateria.reviewPreset || "moderada"
            });
          }
        }
      });

      if (novoTopicos.length > 0 || novoReviews.length > 0) {
        novoPlanoStructure[dataKey] = {
          date: dataKey,
          topicos: novoTopicos,
          reviews: novoReviews
        };
      }
    });

    novoPlano.plan = novoPlanoStructure;

    // Atualizar plano
    storage.set(db => {
      const planos = db.planos.map(p => p.id === planoId ? novoPlano : p);
      return { ...db, planos };
    });

    // Registrar log da migração
    logModule.add(alunoId, `Migração de edital: ${editalAtual.name} → ${novoEdital.name}`, {
      planoId,
      editalAnterior: plano.editalId,
      novoEdital: novoEditalId,
      materiasMapeadas: Object.fromEntries(materiasConfirmadas),
      compatibilidade
    });

    return {
      sucesso: true,
      novoPlano,
      resumo: {
        materiasMapeadas: compatibilidade.automaticas.length + (confirmacoesManuais ? Object.keys(confirmacoesManuais).length : 0),
        materiasRemovidas: compatibilidade.removidas.length,
        materiasNovas: compatibilidade.novas.length
      }
    };
  }
};

// Adiantar aulas: move N topics from future days to today
planosModule.adiantarAulas = function(planoId, howMany) {
  const plano = this.getById(planoId);
  if (!plano) return 0;
  const todayKey = localDateKey();
  const futureDays = Object.keys(plano.plan).filter(dk => dk > todayKey).sort();
  const topicsToMove = [];
  for (const dk of futureDays) {
    if (topicsToMove.length >= howMany) break;
    for (const t of plano.plan[dk].topicos) {
      if (topicsToMove.length >= howMany) break;
      topicsToMove.push({ topic: t, fromDay: dk });
    }
  }
  if (topicsToMove.length === 0) return 0;
  storage.set(db => {
    const planos = db.planos.map(p => {
      if (p.id !== planoId) return p;
      const np = JSON.parse(JSON.stringify(p.plan));
      if (!np[todayKey]) np[todayKey] = { date: todayKey, topicos: [], reviews: [] };
      for (const { topic, fromDay } of topicsToMove) {
        np[fromDay].topicos = np[fromDay].topicos.filter(t => t.id !== topic.id);
        np[todayKey].topicos.push(topic);
        // Remove old reviews and reschedule from today
        Object.keys(np).forEach(dk => {
          if (dk > todayKey) np[dk].reviews = np[dk].reviews.filter(r => r.id !== topic.id);
        });
        const intervals = REVIEW_PRESETS[topic.materiaReviewPreset || "moderada"] || REVIEW_INTERVALS;
        const todayDate = new Date(todayKey + "T12:00:00");
        intervals.forEach(interval => {
          const rd = new Date(todayDate); rd.setDate(rd.getDate() + interval);
          const rk = localDateKey(rd);
          if (!np[rk]) np[rk] = { date: rk, topicos: [], reviews: [] };
          if (!np[rk].reviews.find(r => r.id === topic.id))
            np[rk].reviews.push({ ...topic, reviewInterval: interval });
        });
      }
      return { ...p, plan: np };
    });
    return { ...db, planos };
  });
  return topicsToMove.length;
};

// Adicionar reagendarTopico ao planosModule
// Regenera apenas as aulas não feitas (a partir de hoje), mantém progresso existente e o mesmo plano.id
planosModule.regenerarFuturo = function(planoId, alunoId, novaRotina) {
  const plano = this.getById(planoId);
  if (!plano) return null;
  const rotina = novaRotina || plano.rotina;
  const edital = editaisModule.getById(plano.editalId);
  if (!edital) return null;
  const todayKey = localDateKey();
  // Collect done topic IDs (lessons already studied)
  const db = storage.get();
  const doneProgresso = (db.progresso || []).filter(p => p.planoId === planoId && p.done && !p.key.endsWith('-rev'));
  const doneTopicIds = new Set(doneProgresso.map(p => p.key.substring(11))); // strip 'YYYY-MM-DD-'
  // Build list of all plan topics not yet done
  const materiaIds = rotina.materiaIds && rotina.materiaIds.length > 0 ? rotina.materiaIds : null;
  const materias = materiaIds ? edital.materias.filter(m => materiaIds.includes(m.id)) : edital.materias;
  const queues = materias.map(m =>
    m.topicos.map(t => ({ ...t, materiaId: m.id, materiaName: m.name, materiaColor: m.color, materiaReviewPreset: m.reviewPreset || "moderada" }))
  );
  const allTopicos = [];
  let cursors = queues.map(() => 0);
  while (queues.some((q, i) => cursors[i] < q.length)) {
    for (let i = 0; i < queues.length; i++) {
      if (cursors[i] < queues[i].length) { allTopicos.push(queues[i][cursors[i]]); cursors[i]++; }
    }
  }
  // Filter to only not-done topics
  const remaining = allTopicos.filter(t => !doneTopicIds.has(t.id));
  // Build new schedule from today
  const diasConfig = rotina.diasConfig || null;
  const aulasPorDia = rotina.aulasPorDia || 1;
  const diasEstudo = rotina.dias || [1,2,3,4,5];
  function aulasNoDia(dow) {
    if (diasConfig) return diasConfig[dow] || 0;
    return diasEstudo.includes(dow) ? aulasPorDia : 0;
  }
  const plan = {}, reviews = {};
  let topicIdx = 0;
  const start = new Date(); start.setHours(0,0,0,0);
  let dayOffset = 0;
  const maxDays = remaining.length * 5 + 60;
  while (topicIdx < remaining.length && dayOffset < maxDays) {
    const d = new Date(start); d.setDate(d.getDate() + dayOffset);
    const dow = d.getDay();
    const key = localDateKey(d);
    if (!plan[key]) plan[key] = { date: key, topicos: [], reviews: [] };
    const aulasHoje = aulasNoDia(dow);
    if (aulasHoje > 0) {
      for (let a = 0; a < aulasHoje && topicIdx < remaining.length; a++) {
        plan[key].topicos.push({ ...remaining[topicIdx] });
        const intervals = REVIEW_PRESETS[remaining[topicIdx].materiaReviewPreset || "moderada"] || REVIEW_INTERVALS;
        intervals.forEach(interval => {
          let revDate = new Date(d); revDate.setDate(revDate.getDate() + interval);
          let safety = 0;
          while (aulasNoDia(revDate.getDay()) === 0 && safety < 7) { revDate.setDate(revDate.getDate() + 1); safety++; }
          const revKey = localDateKey(revDate);
          if (!reviews[revKey]) reviews[revKey] = [];
          reviews[revKey].push({ ...remaining[topicIdx], reviewInterval: interval });
        });
        topicIdx++;
      }
    }
    dayOffset++;
  }
  Object.entries(reviews).forEach(([key, revs]) => {
    if (!plan[key]) plan[key] = { date: key, topicos: [], reviews: [] };
    plan[key].reviews.push(...revs);
  });
  // Cap reviews per day
  const maxRevDay = rotina.maxRevisoesPorDia || 0;
  if (maxRevDay > 0) {
    const sortedKeys = Object.keys(plan).sort();
    for (let i = 0; i < sortedKeys.length; i++) {
      const dk = sortedKeys[i];
      if (plan[dk].reviews.length > maxRevDay) {
        const overflow = plan[dk].reviews.splice(maxRevDay);
        let j = i + 1;
        while (j < sortedKeys.length && aulasNoDia(new Date(sortedKeys[j]+"T12:00:00").getDay()) === 0) j++;
        if (j < sortedKeys.length) plan[sortedKeys[j]].reviews = [...overflow, ...plan[sortedKeys[j]].reviews];
        else sortedKeys.push(sortedKeys[sortedKeys.length-1]); // fallback
      }
    }
  }
  // Update existing plan in-place (keep planoId and progress)
  storage.set(db => ({
    ...db,
    planos: db.planos.map(p => p.id === planoId ? { ...p, rotina, plan } : p),
  }));
  return this.getById(planoId);
};

// Regenera do zero mantendo o mesmo plano.id (progresso e notas existentes continuam válidos)
planosModule.regenerarDoZero = function(planoId, alunoId, novaRotina) {
  const plano = this.getById(planoId);
  if (!plano) return null;
  const rotina = novaRotina || plano.rotina;
  // generate() removes old plan (by alunoId+editalId) but does NOT touch progresso/studyNotes
  const newPlano = this.generate(alunoId, plano.editalId, rotina);
  if (!newPlano) return null;
  const newId = newPlano.id;
  // Swap newPlano.id → planoId so existing progress/notes entries remain valid (they still reference planoId)
  storage.set(db => ({
    ...db,
    planos: db.planos.map(p => p.id === newId ? { ...p, id: planoId } : p),
    progresso: db.progresso.filter(p => p.planoId !== newId),
    studyNotes: (db.studyNotes || []).filter(n => n.planoId !== newId),
  }));
  return this.getById(planoId);
};

planosModule.reagendarTopico = function(planoId, dateKey, topicoId) {
  const plano = this.getById(planoId);
  if (!plano) return;
  const topico = (plano.plan[dateKey]?.topicos || []).find(t => t.id === topicoId);
  if (!topico) return;
  const diasEstudo = plano.rotina?.dias || [1,2,3,4,5];
  const start = new Date(dateKey + "T12:00:00");
  start.setDate(start.getDate() + 1);
  let nextDay = null;
  for (let i = 0; i < 30; i++) {
    if (diasEstudo.includes(start.getDay())) { nextDay = localDateKey(start); break; }
    start.setDate(start.getDate() + 1);
  }
  if (!nextDay) return;
  storage.set(db => {
    const planos = db.planos.map(p => {
      if (p.id !== planoId) return p;
      const np = JSON.parse(JSON.stringify(p.plan));
      if (np[dateKey]) np[dateKey].topicos = np[dateKey].topicos.filter(t => t.id !== topicoId);
      Object.keys(np).forEach(dk => { if (dk > dateKey) np[dk].reviews = np[dk].reviews.filter(r => r.id !== topicoId); });
      if (!np[nextDay]) np[nextDay] = { date: nextDay, topicos: [], reviews: [] };
      np[nextDay].topicos = [...np[nextDay].topicos, topico];
      const nd = new Date(nextDay + "T12:00:00");
      REVIEW_INTERVALS.forEach(interval => {
        const rd = new Date(nd); rd.setDate(rd.getDate() + interval);
        const rk = localDateKey(rd);
        if (!np[rk]) np[rk] = { date: rk, topicos: [], reviews: [] };
        if (!np[rk].reviews.find(r => r.id === topicoId))
          np[rk].reviews = [...np[rk].reviews, { ...topico, reviewInterval: interval }];
      });
      return { ...p, plan: np };
    });
    return { ...db, planos };
  });
};

// ============================================================
// DESIGN SYSTEM
// ============================================================
const COLORS_MATERIAS = ["#6366f1","#ec4899","#14b8a6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#10b981","#f97316","#3b82f6"];
const DAYS_FULL = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
// Usa data LOCAL do browser (evita bug de fuso: após 22h BRT o toISOString() já retorna dia seguinte UTC)
// Obter data de hoje em São Paulo
function getTodaySaoPaulo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year').value);
  const month = parseInt(parts.find(p => p.type === 'month').value);
  const day = parseInt(parts.find(p => p.type === 'day').value);

  const dateInSaoPaulo = new Date(year, month - 1, day);
  dateInSaoPaulo.setHours(0, 0, 0, 0);
  return dateInSaoPaulo;
}

function localDateKey(d) {
  const x = d || new Date();
  // Converter para fuso horário de São Paulo (America/Sao_Paulo)
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });

  const parts = formatter.formatToParts(x);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;

  return `${year}-${month}-${day}`;
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap");
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07080f;--s1:#0e0f1a;--s2:#151625;--s3:#1c1e30;--s4:#22243a;
  --b1:rgba(255,255,255,0.06);--b2:rgba(255,255,255,0.1);--b3:rgba(255,255,255,0.18);
  --t1:#eeeef8;--t2:#9898b8;--t3:#5a5a80;
  --green:#22d3a5;--green-d:rgba(34,211,165,0.12);--green-b:rgba(34,211,165,0.25);
  --blue:#60a5fa;--blue-d:rgba(96,165,250,0.12);
  --purple:#a78bfa;--purple-d:rgba(167,139,250,0.12);
  --red:#f87171;--red-d:rgba(248,113,113,0.12);
  --amber:#fbbf24;--amber-d:rgba(251,191,36,0.12);
  --r:12px;--r-sm:8px;--r-lg:18px;--r-xl:26px;
  --shadow:0 8px 32px rgba(0,0,0,0.5);
  font-family:"Instrument Sans",sans-serif;font-size:14px;line-height:1.5;color:var(--t1)
}
html,body{background:var(--bg);min-height:100vh}
h1,h2,h3,h4{font-family:"Cabinet Grotesk",sans-serif;line-height:1.2}
.app-layout{display:flex;min-height:100vh}
.sidebar{width:248px;background:var(--s1);border-right:1px solid var(--b1);display:flex;flex-direction:column;padding:16px 10px;position:fixed;top:0;left:0;bottom:0;z-index:100;overflow-y:auto}
.main{margin-left:248px;flex:1;padding:28px 32px;min-height:100vh}
.logo{padding:10px 12px 20px;border-bottom:1px solid var(--b1);margin-bottom:8px}
.logo h2{font-size:20px;font-weight:900;letter-spacing:-0.5px}
.logo .dot{color:var(--green)}
.logo p{font-size:11px;color:var(--t3);margin-top:3px}
.nav-lbl{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--t3);padding:12px 12px 5px}
.nav-btn{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-sm);cursor:pointer;transition:all 0.15s;color:var(--t2);font-size:13px;font-weight:500;border:none;background:none;width:100%;text-align:left}
.nav-btn:hover{background:var(--s2);color:var(--t1)}
.nav-btn.active{background:var(--green-d);color:var(--green);font-weight:600}
.nav-icon{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:var(--s3);flex-shrink:0;font-size:14px}
.nav-btn.active .nav-icon{background:var(--green-b)}
.nav-spacer{flex:1}
.user-pill{margin:8px 4px 0;padding:10px 12px;background:var(--s2);border-radius:var(--r);border:1px solid var(--b1)}
.user-pill-name{font-size:13px;font-weight:600;margin-bottom:1px}
.user-pill-role{font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px}
.ph{margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.ph h1{font-size:26px;font-weight:900;letter-spacing:-0.5px}
.ph p{color:var(--t2);font-size:13px;margin-top:3px}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r-lg);padding:22px}
.card-sm{background:var(--s2);border:1px solid var(--b1);border-radius:var(--r);padding:14px}
.card-title{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--t3);margin-bottom:14px}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.stat{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:18px;display:flex;flex-direction:column;gap:4px}
.stat-l{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--t3)}
.stat-v{font-size:30px;font-weight:900;font-family:"Cabinet Grotesk";line-height:1.1}
.stat-s{font-size:12px;color:var(--t2)}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:var(--r-sm);border:none;cursor:pointer;font-family:"Cabinet Grotesk";font-size:13px;font-weight:700;transition:all 0.18s;white-space:nowrap;line-height:1}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
.btn-green{background:var(--green);color:#07080f}
.btn-green:hover:not(:disabled){background:#2ff5c0;transform:translateY(-1px);box-shadow:0 4px 16px rgba(34,211,165,0.3)}
.btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--b2)}
.btn-ghost:hover:not(:disabled){background:var(--s2);color:var(--t1)}
.btn-red{background:var(--red-d);color:var(--red);border:1px solid rgba(248,113,113,0.2)}
.btn-red:hover:not(:disabled){background:rgba(248,113,113,0.2)}
.btn-blue{background:var(--blue-d);color:var(--blue);border:1px solid rgba(96,165,250,0.2)}
.btn-blue:hover:not(:disabled){background:rgba(96,165,250,0.2)}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-xs{padding:4px 9px;font-size:11px}
.btn-icon{padding:7px;border-radius:var(--r-sm)}
.badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.3px}
.bg{background:var(--green-d);color:var(--green)}
.bb{background:var(--blue-d);color:var(--blue)}
.bp{background:var(--purple-d);color:var(--purple)}
.br{background:var(--red-d);color:var(--red)}
.ba{background:var(--amber-d);color:var(--amber)}
.bn{background:var(--s3);color:var(--t2)}
.form-group{margin-bottom:13px}
.lbl{display:block;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--t2);margin-bottom:5px}
.inp{width:100%;padding:9px 12px;background:var(--s2);border:1px solid var(--b2);border-radius:var(--r-sm);color:var(--t1);font-family:inherit;font-size:13px;outline:none;transition:border-color .15s}
.inp:focus{border-color:var(--green)}
.inp::placeholder{color:var(--t3)}
select.inp{cursor:pointer}
.table{width:100%;border-collapse:collapse}
.table th{text-align:left;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--t3);padding:8px 12px;border-bottom:1px solid var(--b1)}
.table td{padding:11px 12px;border-bottom:1px solid var(--b1);font-size:13px;vertical-align:middle}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:rgba(255,255,255,0.02)}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal{background:var(--s1);border:1px solid var(--b2);border-radius:var(--r-xl);padding:28px;width:100%;max-width:520px;max-height:85vh;overflow-y:auto}
.modal-wide{max-width:680px}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.modal-hd h2{font-size:19px;font-weight:900}
.modal-ft{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:18px;border-top:1px solid var(--b1)}
.modal-x{background:none;border:none;color:var(--t2);cursor:pointer;padding:4px 8px;border-radius:6px;font-size:16px;line-height:1}
.modal-x:hover{color:var(--t1);background:var(--s2)}
.pbar{height:5px;background:var(--s3);border-radius:5px;overflow:hidden}
.pbar-fill{height:100%;border-radius:5px;transition:width .5s ease}
.row{display:flex;align-items:center;gap:8px}
.row-b{display:flex;align-items:center;justify-content:space-between;gap:8px}
.mt2{margin-top:8px}.mt3{margin-top:12px}.mt4{margin-top:16px}
.mb2{margin-bottom:8px}.mb3{margin-bottom:12px}.mb4{margin-bottom:16px}
.text-sm{font-size:12px}.text-xs{font-size:11px}.text-muted{color:var(--t2)}.text-dim{color:var(--t3)}
.fw6{font-weight:600}.fw7{font-weight:700}.fw9{font-weight:900}
.fh{font-family:"Cabinet Grotesk",sans-serif}
.empty{text-align:center;padding:50px 20px;color:var(--t3)}
.empty h3{font-size:16px;font-weight:700;color:var(--t2);margin-bottom:6px}
.dot-c{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.ck-btn{width:22px;height:22px;min-width:22px;border-radius:6px;border:1.5px solid var(--b2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:transparent;transition:all .15s}
.ck-btn:hover{border-color:var(--green);color:var(--green)}
.ck-btn.ck{background:var(--green);border-color:var(--green);color:#07080f}
.topic-row{display:flex;align-items:center;gap:9px;padding:8px 11px;background:var(--s2);border-radius:var(--r-sm);margin-bottom:5px;border:1px solid transparent}
.topic-row:hover{border-color:var(--b2)}
.topic-row.done{opacity:0.4}
.topic-row.done .tr-name{text-decoration:line-through}
.tr-name{flex:1;font-size:13px}
.tr-tag{font-size:11px;color:var(--t3)}
.rev-sec{border-left:2px solid var(--amber);padding-left:11px;margin-top:9px}
.rev-lbl{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--amber);margin-bottom:5px}
.day-card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:15px;margin-bottom:9px}
.day-card.today{border-color:var(--green)}
.sec-card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r-lg);overflow:hidden;margin-bottom:14px}
.sec-hd{padding:14px 18px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between}
.chip{display:inline-flex;align-items:center;padding:3px 8px;background:var(--s3);border:1px solid var(--b1);border-radius:5px;font-size:11px;margin:2px}
.alert{padding:11px 14px;border-radius:var(--r-sm);font-size:13px;margin-bottom:14px;display:flex;gap:9px;align-items:flex-start}
.alert-blue{background:var(--blue-d);border:1px solid rgba(96,165,250,0.2);color:#93c5fd}
.alert-green{background:var(--green-d);border:1px solid rgba(34,211,165,0.2);color:var(--green)}.alert-red{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#f87171}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px;position:relative;overflow:hidden}
.login-wrap::before{content:'';position:absolute;width:500px;height:500px;background:radial-gradient(circle,rgba(34,211,165,0.07) 0%,transparent 70%);top:-80px;left:-80px;pointer-events:none}
.foco-topic{background:var(--s2);border:1.5px solid var(--b2);border-radius:18px;padding:32px 28px;margin-bottom:20px;text-align:center;transition:border-color .2s}
.foco-topic:hover{border-color:var(--green)}
.btn-estudar{background:var(--green);color:#07080f;font-family:"Cabinet Grotesk";font-size:17px;font-weight:900;width:100%;padding:16px;border-radius:10px;border:none;cursor:pointer;transition:all .18s;margin-bottom:10px}
.btn-estudar:hover{background:#2ff5c0;transform:translateY(-1px);box-shadow:0 6px 20px rgba(34,211,165,0.35)}
.btn-pular{background:transparent;color:var(--t2);border:1px solid var(--b2);font-family:"Cabinet Grotesk";font-size:13px;font-weight:700;width:100%;padding:11px;border-radius:10px;cursor:pointer;transition:all .15s}
.btn-pular:hover{background:var(--s2);color:var(--t1)}
.step-bar{display:flex;gap:6px;margin-bottom:28px}
.step-seg{height:6px;border-radius:3px;flex:1;transition:all .3s}
.wizard-center{max-width:520px;margin:0 auto}
.edital-opt{padding:14px 18px;border-radius:12px;cursor:pointer;margin-bottom:10px;border:2px solid var(--b2);background:var(--s2);transition:all .15s}
.edital-opt:hover{border-color:var(--b3)}
.edital-opt.sel{border-color:var(--green);background:var(--green-d)}
.dia-pill{padding:8px 12px;border-radius:8px;cursor:pointer;border:1.5px solid var(--b2);background:var(--s2);color:var(--t2);font-family:"Cabinet Grotesk";font-weight:700;font-size:12px;transition:all .15s;user-select:none}
.dia-pill.sel{border-color:var(--green);background:var(--green-d);color:var(--green)}
.apd-pill{flex:1;padding:10px 0;border-radius:8px;cursor:pointer;text-align:center;border:1.5px solid var(--b2);background:var(--s2);color:var(--t2);font-family:"Cabinet Grotesk";font-weight:700;font-size:16px;transition:all .15s}
.apd-pill.sel{border-color:var(--green);background:var(--green-d);color:var(--green)}
.streak-bar{display:flex;align-items:center;gap:12px}
.gami-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
@media(max-width:700px){.gami-grid{grid-template-columns:1fr 1fr}.g4{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr}.sidebar{display:none}.main{margin-left:0}}
.login-wrap::after{content:'';position:absolute;width:350px;height:350px;background:radial-gradient(circle,rgba(96,165,250,0.05) 0%,transparent 70%);bottom:-30px;right:-30px;pointer-events:none}
.rank-table{width:100%;border-collapse:collapse}.rank-table th{text-align:left;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--t3);padding:10px 12px;border-bottom:1px solid var(--b2)}.rank-table td{padding:12px;border-bottom:1px solid var(--b1);font-size:13px;vertical-align:middle}.rank-pos{font-family:"Cabinet Grotesk";font-weight:900;font-size:18px;width:36px;text-align:center}.rank-1{color:#fbbf24}.rank-2{color:#9ca3af}.rank-3{color:#b45309}.preset-btn{padding:6px 12px;border-radius:7px;border:1.5px solid var(--b2);background:var(--s3);cursor:pointer;font-size:12px;font-weight:600;color:var(--t2);transition:all .15s}.preset-btn.active{border-color:var(--green);background:var(--green-d);color:var(--green)}.adiantar-btn{width:100%;padding:12px;border-radius:10px;border:1.5px dashed var(--amber);background:var(--amber-d);cursor:pointer;font-size:13px;font-weight:700;color:var(--amber);display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;margin-top:10px}.adiantar-btn:hover{background:rgba(251,191,36,.2)}.mat-link{color:var(--blue);font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:5px;background:var(--blue-d);white-space:nowrap;flex-shrink:0}.mat-link:hover{background:rgba(96,165,250,.25)}.upload-zone{border:2px dashed var(--b2);border-radius:10px;padding:22px;text-align:center;cursor:pointer;transition:all .15s}.upload-zone:hover{border-color:var(--blue);background:var(--blue-d)}
.login-box{background:var(--s1);border:1px solid var(--b2);border-radius:var(--r-xl);padding:40px;width:100%;max-width:400px;position:relative;z-index:1;box-shadow:var(--shadow)}
.login-logo{text-align:center;margin-bottom:32px}
.login-logo h1{font-size:32px;font-weight:900;letter-spacing:-1px}
.login-logo p{color:var(--t2);font-size:12px;margin-top:5px}
.profile-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:24px}
.pc{padding:14px 8px;border:1.5px solid var(--b1);border-radius:var(--r);cursor:pointer;text-align:center;transition:all .18s;background:var(--s2)}
.pc:hover{border-color:var(--b3);background:var(--s3)}
.pc.sel{border-color:var(--green);background:var(--green-d)}
.pc-icon{font-size:22px;margin-bottom:6px}
.pc-name{font-family:"Cabinet Grotesk";font-size:13px;font-weight:700}
.pc-sub{font-size:10px;color:var(--t3);margin-top:1px}
.divider{border:none;border-top:1px solid var(--b1);margin:18px 0}
.err{color:var(--red);font-size:12px;text-align:center;margin-top:8px;font-weight:600}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fadeIn .2s ease}
`;

// ============================================================
// COMPONENTE: AlunoOnboarding — wizard "Começar Hoje"
// ============================================================
function AlunoOnboarding({ user, editais, onGenerate }) {
  const firstEdital = editaisModule.getById(editais[0]?.id || "");
  const [step, setStep] = useState(1);
  const [editalId, setEditalId] = useState(editais[0]?.id || "");
  const [materiaIds, setMateriaIds] = useState(() => firstEdital ? firstEdital.materias.map(m => m.id) : []);
  // diasConfig: { 0:0, 1:2, 2:2, 3:2, 4:2, 5:2, 6:0 } — 0 = folga
  const [diasConfig, setDiasConfig] = useState({ 0:0, 1:2, 2:2, 3:2, 4:2, 5:2, 6:0 });
  const [rotinaMode, setRotinaMode] = useState("manual"); // "manual" | "data"
  const [dataFim, setDataFim] = useState("");
  const [maxRevisoes, setMaxRevisoes] = useState(5);
  const [nivelCobertura, setNivelCobertura] = useState(["media"]); // array of selected levels: "alta", "media", "baixa"
  function setDayAulas(dow, val) {
    setDiasConfig(prev => ({ ...prev, [dow]: Math.max(0, Math.min(5, val)) }));
  }
  function calcSugestao() {
    if (!dataFim || totalTop === 0) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const fim = new Date(dataFim + "T00:00:00");
    const diasTotal = Math.round((fim - today) / 86400000);
    if (diasTotal <= 0) return null;
    const semanasTotal = diasTotal / 7;
    const aulasSemanaNeed = Math.ceil(totalTop / semanasTotal);
    const apd = Math.max(1, Math.ceil(aulasSemanaNeed / 5));
    const capped = Math.min(5, apd);
    const sugestedCfg = { 0:0, 1:capped, 2:capped, 3:capped, 4:capped, 5:capped, 6:0 };
    const aulasSemSug = capped * 5;
    const semanasSug = aulasSemSug > 0 ? Math.ceil(totalTop / aulasSemSug) : 0;
    return { diasTotal, semanasTotal: Math.ceil(semanasTotal), aulasSemanaNeed, apd: capped, sugestedCfg, semanasSug };
  }
  const sugestao = rotinaMode === "data" ? calcSugestao() : null;

  const edital = editaisModule.getById(editalId);

  // When edital changes, default to all materias selected
  function handleSelectEdital(id) {
    setEditalId(id);
    const ed = editaisModule.getById(id);
    setMateriaIds(ed ? ed.materias.map(m => m.id) : []);
  }

  function toggleMateria(id) {
    setMateriaIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  const selectedMaterias = edital ? edital.materias.filter(m => materiaIds.includes(m.id)) : [];
  const totalTop = selectedMaterias.reduce((a,m) => a + m.topicos.length, 0);
  const aulasSem = Object.values(diasConfig).reduce((a,n) => a + n, 0);
  const semanas = aulasSem > 0 ? Math.ceil(totalTop / aulasSem) : 0;
  const previsao = semanas > 0 ? new Date(Date.now() + semanas*7*86400000).toLocaleDateString("pt-BR",{day:"2-digit",month:"long"}) : "—";
  const diasAtivos = Object.values(diasConfig).filter(n => n > 0).length;

  function handleGerar() {
    planosModule.generate(user.id, editalId, { diasConfig, materiaIds, maxRevisoesPorDia: maxRevisoes, nivelCobertura });
    onGenerate();
  }

  return (
    <div className="wizard-center">
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:44}}>🎯</div>
        <h1 style={{fontSize:26,fontWeight:900,marginTop:8,letterSpacing:"-0.5px"}}>Começar Hoje</h1>
        <p style={{color:"var(--t2)",marginTop:5,fontSize:13}}>Configure sua rotina e gere seu plano personalizado</p>
      </div>
      <div className="step-bar">
        {[1,2,3,4].map(s=><div key={s} className="step-seg" style={{background:s<=step?"var(--green)":"var(--s3)",opacity:s<step?0.55:1}}/>)}
      </div>

      {/* STEP 1 — Edital */}
      {step===1&&(
        <div className="card fi">
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:26}}>📋</div>
            <h2 style={{fontSize:17,fontWeight:900,marginTop:6}}>Qual é o seu objetivo?</h2>
            <p style={{color:"var(--t2)",fontSize:13,marginTop:3}}>Escolha o edital que deseja estudar</p>
          </div>
          {editais.map(e=>{
            const tot=e.materias.reduce((a,m)=>a+m.topicos.length,0);
            return(<div key={e.id} className={`edital-opt${editalId===e.id?" sel":""}`} onClick={()=>handleSelectEdital(e.id)}>
              <div style={{fontFamily:"Cabinet Grotesk",fontWeight:700,fontSize:15,color:editalId===e.id?"var(--green)":"var(--t1)"}}>{e.name}</div>
              <div style={{fontSize:12,color:"var(--t3)",marginTop:3}}>{e.materias.length} matérias · {tot} tópicos</div>
            </div>);
          })}
          <button className="btn btn-green mt4" style={{width:"100%"}} disabled={!editalId} onClick={()=>setStep(2)}>Continuar →</button>
        </div>
      )}

      {/* STEP 2 — Matérias */}
      {step===2&&(
        <div className="card fi">
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:26}}>📚</div>
            <h2 style={{fontSize:17,fontWeight:900,marginTop:6}}>Quais matérias estudar?</h2>
            <p style={{color:"var(--t2)",fontSize:13,marginTop:3}}>Os tópicos serão alternados entre as matérias selecionadas</p>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8,gap:8}}>
            <button className="btn btn-ghost btn-xs" onClick={()=>setMateriaIds(edital.materias.map(m=>m.id))}>Todas</button>
            <button className="btn btn-ghost btn-xs" onClick={()=>setMateriaIds([])}>Nenhuma</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:320,overflowY:"auto"}}>
            {edital&&edital.materias.map(m=>{
              const sel = materiaIds.includes(m.id);
              return (
                <div key={m.id} onClick={()=>toggleMateria(m.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:10,border:`1.5px solid ${sel?"var(--green)":"var(--b2)"}`,background:sel?"var(--s2)":"var(--s1)",cursor:"pointer",transition:"all .15s"}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:m.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:sel?"var(--green)":"var(--t1)"}}>{m.name}</div>
                    <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>{m.topicos.length} tópico{m.topicos.length!==1?"s":""}</div>
                  </div>
                  <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${sel?"var(--green)":"var(--b2)"}`,background:sel?"var(--green)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#07080f",fontWeight:900}}>
                    {sel&&"✓"}
                  </div>
                </div>
              );
            })}
          </div>
          {materiaIds.length>0&&<div style={{marginTop:10,fontSize:12,color:"var(--t3)",textAlign:"center"}}>{materiaIds.length} matéria{materiaIds.length!==1?"s":""} · {totalTop} tópico{totalTop!==1?"s":""} selecionado{totalTop!==1?"s":""}</div>}
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(1)}>← Voltar</button>
            <button className="btn btn-green" style={{flex:2}} disabled={materiaIds.length===0} onClick={()=>setStep(3)}>Continuar →</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Rotina por dia */}
      {step===3&&(
        <div className="card fi">
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:26}}>⏰</div>
            <h2 style={{fontSize:17,fontWeight:900,marginTop:6}}>Sua rotina de estudos</h2>
          </div>
          {/* Mode toggle */}
          <div style={{display:"flex",gap:6,marginBottom:18,background:"var(--s2)",borderRadius:10,padding:4}}>
            <button onClick={()=>setRotinaMode("manual")} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:rotinaMode==="manual"?"var(--s4)":"transparent",color:rotinaMode==="manual"?"var(--t1)":"var(--t3)",transition:"all .15s"}}>⚙️ Configurar por dia</button>
            <button onClick={()=>setRotinaMode("data")} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:rotinaMode==="data"?"var(--s4)":"transparent",color:rotinaMode==="data"?"var(--t1)":"var(--t3)",transition:"all .15s"}}>📅 Por data de término</button>
          </div>

          {rotinaMode==="data"?(
            <div>
              <div className="form-group">
                <label className="lbl">Data de término do ciclo</label>
                <input className="inp" type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)}
                  min={localDateKey(new Date(Date.now()+86400000))}/>
              </div>
              {sugestao?(
                <div style={{marginTop:12}}>
                  <div style={{background:"var(--s2)",borderRadius:12,padding:"16px 18px",marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Sugestão automática</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
                      <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--green)"}}>{sugestao.apd}</div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>aulas/dia</div></div>
                      <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--blue)"}}>{sugestao.aulasSemanaNeed}</div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>aulas/sem</div></div>
                      <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--amber)"}}>{sugestao.semanasSug}</div><div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>semanas</div></div>
                    </div>
                    <div style={{fontSize:12,color:"var(--t2)",textAlign:"center"}}>Seg a Sex, {sugestao.apd} aula{sugestao.apd>1?"s":""} por dia</div>
                  </div>
                  <button className="btn btn-green" style={{width:"100%",marginBottom:8}} onClick={()=>{setDiasConfig(sugestao.sugestedCfg);planosModule.generate(user.id,editalId,{diasConfig:sugestao.sugestedCfg,materiaIds,maxRevisoesPorDia:maxRevisoes});onGenerate();}}>🚀 Criar plano automaticamente</button>
                  <button className="btn btn-ghost" style={{width:"100%"}} onClick={()=>{setDiasConfig(sugestao.sugestedCfg);setRotinaMode("manual");}}>⚙️ Ajustar manualmente</button>
                </div>
              ):(
                dataFim?<div className="alert alert-red mt3">Data inválida ou no passado.</div>
                       :<p style={{color:"var(--t3)",fontSize:13,textAlign:"center",marginTop:10}}>Selecione uma data para ver a sugestão.</p>
              )}
              {/* Máx. revisões — também no modo automático */}
              <div style={{marginTop:16,padding:"14px 16px",borderRadius:10,background:"var(--s2)",border:"1px solid var(--b1)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:10}}>🔁 Máx. revisões por dia</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>setMaxRevisoes(r=>Math.max(1,r-1))} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:20,color:"var(--amber)",minWidth:32,textAlign:"center"}}>{maxRevisoes}</span>
                  <button onClick={()=>setMaxRevisoes(r=>Math.min(20,r+1))} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  <span style={{fontSize:11,color:"var(--t3)",marginLeft:4}}>revisões/dia — excedente vai pro próximo dia</span>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(2)}>← Voltar</button>
              </div>
            </div>
          ):(
            <div>
              <p style={{color:"var(--t2)",fontSize:13,marginBottom:12,textAlign:"center"}}>Quantas aulas por dia? Zero = folga</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {DAYS_FULL.map((name, dow) => {
                  const val = diasConfig[dow] || 0;
                  const ativo = val > 0;
                  return (
                    <div key={dow} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${ativo?"var(--green)":"var(--b2)"}`,background:ativo?"var(--s2)":"var(--s1)",transition:"all .15s"}}>
                      <span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,fontSize:13,width:48,color:ativo?"var(--t1)":"var(--t3)"}}>{name.slice(0,3)}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                        <button onClick={()=>setDayAulas(dow, val-1)} style={{width:28,height:28,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}} disabled={val===0}>−</button>
                        <span style={{width:24,textAlign:"center",fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:15,color:ativo?"var(--green)":"var(--t3)"}}>{val === 0 ? "—" : val}</span>
                        <button onClick={()=>setDayAulas(dow, val+1)} style={{width:28,height:28,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}} disabled={val===5}>+</button>
                      </div>
                      <span style={{width:80,fontSize:11,color:ativo?"var(--t2)":"var(--t3)",textAlign:"right"}}>{ativo ? `${val} aula${val>1?"s":""}` : "folga"}</span>
                    </div>
                  );
                })}
              </div>
              {aulasSem>0&&<div style={{marginTop:10,fontSize:12,color:"var(--t3)",textAlign:"center"}}>{aulasSem} aula{aulasSem!==1?"s":""}/semana · {diasAtivos} dia{diasAtivos!==1?"s":""} ativos</div>}
              <div style={{marginTop:16,padding:"14px 16px",borderRadius:10,background:"var(--s2)",border:"1px solid var(--b1)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:10}}>🔁 Máx. revisões por dia</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>setMaxRevisoes(r=>Math.max(1,r-1))} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:20,color:"var(--amber)",minWidth:32,textAlign:"center"}}>{maxRevisoes}</span>
                  <button onClick={()=>setMaxRevisoes(r=>Math.min(20,r+1))} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  <span style={{fontSize:11,color:"var(--t3)",marginLeft:4}}>revisões/dia — excedente vai pro próximo dia</span>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(2)}>← Voltar</button>
                <button className="btn btn-green" style={{flex:2}} disabled={aulasSem===0} onClick={()=>setStep(4)}>Continuar →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 — Confirmação */}
      {step===4&&(
        <div className="card fi">
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:26}}>🚀</div>
            <h2 style={{fontSize:17,fontWeight:900,marginTop:6}}>Tudo pronto!</h2>
            <p style={{color:"var(--t2)",fontSize:13,marginTop:3}}>Veja como ficará seu plano</p>
          </div>
          <div style={{background:"var(--s2)",borderRadius:12,padding:"18px 20px",marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--green)"}}>{totalTop}</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Tópicos</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--blue)"}}>{semanas}sem</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Duração</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--amber)"}}>{diasAtivos}×/sem</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Frequência</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,fontFamily:"Cabinet Grotesk",color:"var(--t1)",marginTop:3}}>{previsao}</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Previsão</div></div>
            </div>
            <div style={{borderTop:"1px solid var(--b1)",marginTop:14,paddingTop:12,textAlign:"center"}}>
              <span style={{fontSize:12,color:"var(--t3)"}}>🔁 Máx. revisões por dia: </span>
              <span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:14,color:"var(--amber)"}}>{maxRevisoes}</span>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Matérias no plano ({materiaIds.length})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {selectedMaterias.map(m=>(
                <span key={m.id} style={{display:"inline-flex",alignItems:"center",gap:5,background:"var(--s3)",border:"1px solid var(--b2)",borderRadius:99,padding:"4px 10px",fontSize:12}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:m.color,display:"inline-block"}}/>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Níveis de cobertura selecionados</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {nivelCobertura.length > 0 ? nivelCobertura.map(nivel => {
                const levelConfig = {
                  baixa: { label: "Baixa", emoji: "🟢", color: "var(--green)" },
                  media: { label: "Média", emoji: "🟡", color: "var(--amber)" },
                  alta: { label: "Alta", emoji: "🔴", color: "var(--red)" }
                };
                const cfg = levelConfig[nivel];
                return (
                  <span key={nivel} style={{display:"inline-flex",alignItems:"center",gap:5,background:"var(--s3)",border:`1px solid ${cfg.color}`,borderRadius:99,padding:"4px 10px",fontSize:12,color:cfg.color,fontWeight:600}}>
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              }) : <span style={{fontSize:12,color:"var(--t3)"}}>Nenhum nível selecionado</span>}
            </div>
          </div>
          <div style={{marginBottom:14,padding:"14px 16px",borderRadius:10,background:"var(--s2)",border:"1px solid var(--b1)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:12}}>📖 Nível de Cobertura</div>
            <p style={{fontSize:12,color:"var(--t3)",marginBottom:12}}>Escolha quais níveis incluir no seu plano:</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                { id: "baixa", emoji: "🟢", label: "Baixa Cobertura", desc: "Resumos curtos", color: "var(--green)" },
                { id: "media", emoji: "🟡", label: "Média Cobertura", desc: "Conteúdo balanceado", color: "var(--amber)" },
                { id: "alta", emoji: "🔴", label: "Alta Cobertura", desc: "Conteúdo completo", color: "var(--red)" },
              ].map(opt => {
                const isSelected = nivelCobertura.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setNivelCobertura(prev =>
                        isSelected
                          ? prev.filter(n => n !== opt.id)
                          : [...prev, opt.id]
                      );
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? opt.color : "var(--b2)"}`,
                      background: isSelected ? "var(--s3)" : "var(--s1)",
                      cursor: "pointer",
                      transition: "all .15s"
                    }}
                  >
                    <span style={{fontSize:16}}>{opt.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:isSelected ? opt.color : "var(--t1)"}}>{opt.label}</div>
                      <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>{opt.desc}</div>
                    </div>
                    <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${isSelected ? opt.color : "var(--b2)"}`,background:isSelected ? opt.color : "transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#07080f",fontWeight:900}}>
                      {isSelected && "✓"}
                    </div>
                  </div>
                );
              })}
            </div>
            {nivelCobertura.length === 0 && (
              <div style={{marginTop:10,fontSize:11,color:"var(--red)",fontWeight:600}}>Selecione pelo menos um nível</div>
            )}
          </div>

          <div className="alert alert-blue mb4"><span>🔁</span><span>Tópicos alternados entre matérias + revisões automáticas em 1, 7, 14, 21 e 30 dias.</span></div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={()=>setStep(3)}>← Voltar</button>
            <button className="btn btn-green" style={{flex:2}} disabled={nivelCobertura.length === 0} onClick={handleGerar}>🚀 Gerar Plano!</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE: EstudarAgoraModal — foco topic a topic
// ============================================================
function EstudarAgoraModal({ user, plano, onClose, onRefresh }) {
  const today = localDateKey();
  const [idx, setIdx] = useState(0);
  const [concluidos, setConcluidos] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [tick, setTick] = useState(0);
  const [showMaterials, setShowMaterials] = useState(false);
  const dayData = plano.plan[today] || { topicos:[], reviews:[] };
  // Combine lessons and reviews for today
  const allItems = [
    ...dayData.topicos.map(t => ({ ...t, type: "lesson", id: t.id })),
    ...(dayData.reviews || []).map(r => ({ ...r, type: "review", id: r.id, reviewInterval: r.reviewInterval }))
  ];
  const pending = allItems.filter(item => {
    const key = item.type === "review" ? `${today}-${item.id}-rev` : `${today}-${item.id}`;
    return !progressoModule.isDone(user.id, plano.id, key);
  });
  const xpGanho = concluidos * 10;
  const currentTopic = pending[idx];

  const getMaterialFiles = (topicId) => {
    const materiais = storage.get().materiais || [];
    const topic = materiais.find(m => m.topicId === topicId && m.editalId === plano?.editalId);

    // Suportar ambas as estruturas: nova (com files array) e antiga (com url direto)
    if (topic?.files && Array.isArray(topic.files)) {
      return topic.files;
    } else if (topic?.url) {
      // Converter estrutura antiga para nova
      return [{
        url: topic.url,
        filename: topic.filename,
        type: "Material",
        addedAt: topic.savedAt || new Date().toISOString()
      }];
    }
    return [];
  };

  const topicMaterials = currentTopic ? getMaterialFiles(currentTopic.id) : [];

  // Load note whenever topic changes
  useEffect(() => {
    if (currentTopic) {
      setNoteText(progressoModule.getNote(user.id, plano.id, currentTopic.id));
    }
  }, [idx, currentTopic?.id]);

  function avanca() { if (idx+1 >= pending.length) setIdx(pending.length); else setIdx(i=>i+1); }
  function handleOk() {
    if (noteText.trim()) progressoModule.saveNote(user.id, plano.id, currentTopic.id, noteText.trim());
    const key = currentTopic.type === "review" ? `${today}-${currentTopic.id}-rev` : `${today}-${currentTopic.id}`;
    progressoModule.toggle(user.id, plano.id, key);
    setConcluidos(c=>c+1); avanca(); onRefresh(); setTick(t=>t+1);
  }
  function handlePular() {
    if (noteText.trim()) progressoModule.saveNote(user.id, plano.id, currentTopic.id, noteText.trim());
    // Only allow rescheduling for lessons, not reviews
    if (currentTopic.type === "lesson") {
      planosModule.reagendarTopico(plano.id, today, currentTopic.id);
    }
    avanca(); onRefresh(); setTick(t=>t+1);
  }
  const finished = idx >= pending.length;
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      {/* Modal de Materiais */}
      {showMaterials && (
        <div className="overlay" onClick={() => setShowMaterials(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999}}>
          <div className="modal fi" style={{maxWidth:500,padding:"40px 30px",zIndex:10000}} onClick={e => e.stopPropagation()}>
            <div className="modal-hd" style={{marginBottom:"30px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{currentTopic?.name || "Materiais"}</h2>
              <button className="modal-x" onClick={() => setShowMaterials(false)}>✕</button>
            </div>
            {topicMaterials.length > 0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {topicMaterials.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding:"16px",
                      borderRadius:8,
                      background:"var(--blue-d)",
                      border:"1px solid var(--blue)",
                      textDecoration:"none",
                      display:"flex",
                      flexDirection:"column",
                      gap:4,
                      cursor:"pointer",
                      transition:"all 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--blue)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--blue-d)"}
                  >
                    <div style={{fontSize:13,fontWeight:600,color:"var(--blue)"}}>
                      📄 {file.type}
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)",wordBreak:"break-word"}}>
                      {file.filename}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,color:"var(--t3)"}}>
                <div style={{fontSize:40}}>⚠️</div>
                <p style={{margin:0,textAlign:"center"}}>Nenhum material disponível para este tópico.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        {finished || pending.length===0 ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:56,marginBottom:12}}>{pending.length===0?"😎":"🎉"}</div>
            <h2 style={{fontSize:22,fontWeight:900,marginBottom:8}}>{pending.length===0?"Tudo feito hoje!":"Sessão concluída!"}</h2>
            <p style={{color:"var(--t2)",marginBottom:20}}>
              {pending.length===0?"Você já completou todas as aulas de hoje.":"Você completou "+concluidos+" aula"+(concluidos!==1?"s":"")+" nessa sessão."}
            </p>
            {xpGanho>0&&<div className="badge bg" style={{fontSize:13,padding:"7px 16px",marginBottom:20}}>+{xpGanho} XP ganho! 🔥</div>}
            <button className="btn btn-green" style={{width:"100%"}} onClick={onClose}>Fechar</button>
          </div>
        ) : (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--t3)"}}>
                  {currentTopic.type === "review" ? `Revisão ${idx+1}` : `Aula ${idx+1}`} de {pending.length}
                </div>
                <h2 style={{fontSize:18,fontWeight:900}}>▶ {currentTopic.type === "review" ? "Revisar" : "Estudar"} Agora</h2>
              </div>
              <button className="modal-x" onClick={onClose}>✕</button>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:22}}>
              {pending.map((_,i)=><div key={i} style={{flex:1,height:5,borderRadius:3,background:i<idx?"var(--green)":i===idx?"var(--green)":"var(--s3)",opacity:i<idx?0.45:1,transition:"all .3s"}}/>)}
            </div>
            <div className="foco-topic">
              <div style={{width:14,height:14,borderRadius:"50%",background:currentTopic.materiaColor,margin:"0 auto 10px"}}/>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--t3)",marginBottom:8}}>
                {currentTopic.type === "review" ? `${currentTopic.materiaName} • Revisão ${currentTopic.reviewInterval}d` : currentTopic.materiaName}
              </div>
              <div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",lineHeight:1.25}}>{currentTopic.name}</div>
              {currentTopic.type === "review" && (
                <div style={{fontSize:12,color:"var(--amber)",marginTop:8,fontWeight:600}}>
                  🕐 Revisão programada para {currentTopic.reviewInterval} dias após o estudo
                </div>
              )}
              <button
                onClick={() => setShowMaterials(true)}
                style={{
                  marginTop:14,
                  padding:"8px 14px",
                  borderRadius:6,
                  background: topicMaterials.length > 0 ? "var(--blue)" : "var(--s3)",
                  color: topicMaterials.length > 0 ? "white" : "var(--t2)",
                  border: topicMaterials.length > 0 ? "none" : "1px solid var(--b2)",
                  fontSize:12,
                  fontWeight:600,
                  cursor:"pointer",
                  display:"inline-flex",
                  alignItems:"center",
                  gap:6,
                  transition:"all 0.15s"
                }}
                onMouseEnter={(e) => {
                  if (topicMaterials.length > 0) {
                    e.target.style.background = "var(--blue-d)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (topicMaterials.length > 0) {
                    e.target.style.background = "var(--blue)";
                  }
                }}
              >
                📎 {topicMaterials.length > 0 ? `Ver ${topicMaterials.length} material${topicMaterials.length !== 1 ? "is" : ""}` : "Sem materiais"}
              </button>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,fontWeight:700,letterSpacing:.6,textTransform:"uppercase",color:"var(--t3)",display:"block",marginBottom:7}}>📝 Resumo / Anotações</label>
              <textarea
                className="inp"
                style={{minHeight:90,resize:"vertical",fontFamily:"inherit",fontSize:13,lineHeight:1.6}}
                value={noteText}
                onChange={e=>setNoteText(e.target.value)}
                placeholder="Escreva aqui o que você entendeu, pontos importantes, macetes..."
              />
            </div>
            <button className="btn-estudar" onClick={handleOk}>
              ✅ {currentTopic.type === "review" ? "Revisão Concluída" : "Concluído"} — próximo →
            </button>
            {currentTopic.type === "lesson" && (
              <button className="btn-pular" onClick={handlePular}>📅 Pular e reagendar para depois</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function Modal({ open, onClose, title, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal fi ${wide ? "modal-wide" : ""}`}>
        <div className="modal-hd">
          <h2>{title}</h2>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
}

function Confirm({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title || "Confirmar"}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-red" onClick={onConfirm}>Confirmar</button></>}>
      <p className="text-muted">{message}</p>
    </Modal>
  );
}

function PBar({ pct, color }) {
  return <div className="pbar"><div className="pbar-fill" style={{ width: `${Math.min(pct,100)}%`, background: color || "var(--green)" }} /></div>;
}

// ============================================================
// LOGIN PAGE
// ============================================================
const PROFILES = [
  { role: "admin",  icon: "🛡️", name: "Admin",  sub: "Plataforma",  email: "admin@estudaai.com",  password: "admin123" },
  { role: "coach",  icon: "🎓", name: "Coach",  sub: "Professores", email: "carlos@estudaai.com", password: "coach123" },
  { role: "aluno",  icon: "📖", name: "Aluno",  sub: "Estudantes",  email: "ana@estudaai.com",    password: "aluno123" },
];

function LoginPage({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function pickProfile(p) {
    setSelected(p.role);
    setEmail("");
    setPassword("");
    setError("");
  }

  function handleEmailChange(val) {
    setEmail(val);
    setError("");
    const id = val.trim().toLowerCase();
    if (!id) { setSelected(null); return; }
    const db = storage.get();
    const match = db.users.find(u =>
      u.email.toLowerCase() === id || u.name.toLowerCase() === id
    );
    setSelected(match ? match.role : null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const result = authModule.login(email.trim(), password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 300);
  }

  return (
    <div className="login-wrap">
      <div className="login-box fi">
        <div className="login-logo">
          <h1>Estuda<span style={{ color: "var(--green)" }}>AI</span></h1>
          <p>Sistema de Gestão de Estudos</p>
        </div>
        <p className="text-xs text-dim mb2 fw7" style={{ letterSpacing: ".8px", textTransform: "uppercase" }}>Perfil</p>
        <div className="profile-grid">
          {PROFILES.map(p => (
            <div key={p.role} className={`pc ${selected === p.role ? "sel" : ""}`} onClick={() => pickProfile(p)}>
              <div className="pc-icon">{p.icon}</div>
              <div className="pc-name">{p.name}</div>
              <div className="pc-sub">{p.sub}</div>
            </div>
          ))}
        </div>
        <hr className="divider" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="lbl">E-mail ou usuário</label>
            <input className="inp" type="text" value={email} onChange={e => handleEmailChange(e.target.value)} placeholder="email@exemplo.com ou nome" required autoComplete="username" />
          </div>
          <div className="form-group">
            <label className="lbl">Senha</label>
            <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="err">{error}</p>}
          <button type="submit" className="btn btn-green mt3" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Entrando..." : "Entrar →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// LAYOUT
// ============================================================
const NAV = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "coaches",   label: "Coaches",   icon: "🎓" },
    { id: "alunos",    label: "Alunos",    icon: "👥" },
    { id: "logs",      label: "Logs",      icon: "📋" },
    { id: "debug",     label: "Debug",     icon: "🔧" },
  ],
  coach: [
    { id: "dashboard",      label: "Dashboard",      icon: "⊞" },
    { id: "alunos",         label: "Meus Alunos",    icon: "👥" },
    { id: "editais",        label: "Editais",        icon: "📄" },
    { id: "gerenciar-plano", label: "Gerenciar Planos", icon: "📋" },
    { id: "progresso",      label: "Progresso",      icon: "📊" },
    { id: "conteudo",       label: "Conteúdo",       icon: "📚" },
    { id: "resumos",        label: "Resumos",        icon: "✍️" },
    { id: "simulados",      label: "Simulados",      icon: "📝" },
    { id: "ranking",        label: "Ranking",        icon: "🏆" },
    { id: "migracao",       label: "Migração",       icon: "🔄" },
  ],
  aluno: [
    { id: "dashboard", label: "Dashboard",       icon: "⊞" },
    { id: "plano",     label: "Meu Plano",       icon: "📅" },
    { id: "rotina",    label: "Rotina",           icon: "⚙️" },
    { id: "progresso", label: "Progresso",        icon: "📊" },
    { id: "conteudos", label: "Conteúdos",       icon: "📚" },
    { id: "simulados", label: "Simulados",       icon: "📝" },
    { id: "ranking",   label: "Ranking",          icon: "🏆" },
  ],
};
const ROLE_LABEL = { admin: "Administrador", coach: "Coach", aluno: "Aluno" };

function Layout({ user, page, setPage, onLogout, children }) {
  const nav = NAV[user.role] || [];
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <h2>Estuda<span className="dot">AI</span></h2>
          <p>Sistema de Estudos</p>
        </div>
        <div className="nav-lbl">Menu</div>
        {nav.map(item => (
          <button key={item.id} className={`nav-btn ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="nav-spacer" />
        <div className="user-pill">
          <div className="user-pill-name">{user.name}</div>
          <div className="user-pill-role">{ROLE_LABEL[user.role]}</div>
          <button className="btn btn-ghost btn-xs mt2" style={{ width: "100%", justifyContent: "center" }} onClick={onLogout}>Sair</button>
        </div>
      </aside>
      <main className="main"><div className="fi">{children}</div></main>
    </div>
  );
}

// ============================================================
// ADMIN PAGES
// ============================================================
function AdminDashboard({ refresh }) {
  const db = storage.get();
  const coaches = db.users.filter(u => u.role === "coach");
  const alunos  = db.users.filter(u => u.role === "aluno");
  const logs    = [...db.logs].reverse().slice(0, 6);
  return (
    <div>
      <div className="ph"><div><h1>Dashboard Admin</h1><p>Visão geral da plataforma</p></div></div>
      <div className="g4 mb4">
        <div className="stat"><div className="stat-l">Coaches</div><div className="stat-v" style={{color:"var(--blue)"}}>{coaches.length}</div></div>
        <div className="stat"><div className="stat-l">Alunos</div><div className="stat-v" style={{color:"var(--green)"}}>{alunos.length}</div></div>
        <div className="stat"><div className="stat-l">Editais</div><div className="stat-v" style={{color:"var(--purple)"}}>{db.editais.length}</div></div>
        <div className="stat"><div className="stat-l">Logs</div><div className="stat-v" style={{color:"var(--amber)"}}>{db.logs.length}</div></div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-title">Coaches</div>
          {coaches.length === 0 ? <p className="text-muted text-sm">Nenhum coach.</p> : coaches.map(c => (
            <div key={c.id} className="row-b" style={{padding:"9px 0",borderBottom:"1px solid var(--b1)"}}>
              <div><div className="fw6">{c.name}</div><div className="text-xs text-dim">{c.email}</div></div>
              <span className="badge bn">{alunos.filter(a=>a.coachId===c.id).length} aluno(s)</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Últimos logs</div>
          {logs.length === 0 ? <p className="text-muted text-sm">Sem logs.</p> : logs.map(l => (
            <div key={l.id} style={{padding:"7px 0",borderBottom:"1px solid var(--b1)"}}>
              <div className="text-sm fw6">{l.message}</div>
              <div className="text-xs text-dim">{new Date(l.createdAt).toLocaleString("pt-BR")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminCoaches({ refresh }) {
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({ name:"", email:"", password:"" });
  const [confirm, setConfirm] = useState(null);
  const [resetM, setResetM] = useState(null);
  const [newPass, setNewPass] = useState("");
  const coaches = usersModule.getCoaches();
  const alunos  = usersModule.getAlunos();

  function openNew()  { setEditing(null); setForm({name:"",email:"",password:""}); setModal(true); }
  function openEdit(c){ setEditing(c.id); setForm({name:c.name,email:c.email,password:""}); setModal(true); }
  function save() {
    if (!form.name || !form.email) return;
    if (editing) { const u={name:form.name,email:form.email,updatedBy:"admin"}; if(form.password)u.password=form.password; usersModule.update(editing,u); }
    else { if(!form.password)return; usersModule.create({...form,role:"coach",createdBy:"admin"}); }
    refresh(); setModal(false);
  }
  function del(id) { usersModule.delete(id); refresh(); setConfirm(null); }
  function resetPass() { if(!newPass)return; authModule.resetPassword(resetM,newPass); refresh(); setResetM(null); setNewPass(""); }

  return (
    <div>
      <div className="ph"><div><h1>Coaches</h1><p>Gerencie os professores</p></div><button className="btn btn-green" onClick={openNew}>+ Novo Coach</button></div>
      <div className="card">
        {coaches.length===0 ? <div className="empty"><h3>Nenhum coach</h3></div> :
          <table className="table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Alunos</th><th>Ações</th></tr></thead>
            <tbody>{coaches.map(c=>(
              <tr key={c.id}>
                <td className="fw6">{c.name}</td><td className="text-muted">{c.email}</td>
                <td><span className="badge bn">{alunos.filter(a=>a.coachId===c.id).length}</span></td>
                <td><div className="row">
                  <button className="btn btn-ghost btn-xs" onClick={()=>openEdit(c)}>Editar</button>
                  <button className="btn btn-blue btn-xs" onClick={()=>{setResetM(c.id);setNewPass("");}}>Reset Senha</button>
                  <button className="btn btn-red btn-xs" onClick={()=>setConfirm(c.id)}>Remover</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar Coach":"Novo Coach"}
        footer={<><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-green" onClick={save}>Salvar</button></>}>
        <div className="form-group"><label className="lbl">Nome</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Nome completo"/></div>
        <div className="form-group"><label className="lbl">E-mail</label><input className="inp" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@exemplo.com"/></div>
        <div className="form-group"><label className="lbl">{editing?"Nova Senha (opcional)":"Senha"}</label><input className="inp" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••"/></div>
      </Modal>
      <Modal open={!!resetM} onClose={()=>setResetM(null)} title="Resetar Senha"
        footer={<><button className="btn btn-ghost" onClick={()=>setResetM(null)}>Cancelar</button><button className="btn btn-green" onClick={resetPass}>Salvar</button></>}>
        <div className="form-group"><label className="lbl">Nova Senha</label><input className="inp" type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Nova senha"/></div>
      </Modal>
      <Confirm open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={()=>del(confirm)} title="Remover Coach" message="Remover permanentemente?"/>
    </div>
  );
}

function AdminAlunos({ refresh }) {
  const [confirm, setConfirm] = useState(null);
  const [resetM, setResetM]   = useState(null);
  const [newPass, setNewPass] = useState("");
  const [modal, setModal]     = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]       = useState({name:"",email:""});
  const alunos = usersModule.getAlunos();

  function del(id) { usersModule.delete(id); refresh(); setConfirm(null); }
  function resetPass() { if(!newPass)return; authModule.resetPassword(resetM,newPass); refresh(); setResetM(null); setNewPass(""); }
  function openEdit(u) { setEditingId(u.id); setForm({name:u.name,email:u.email}); setModal(true); }
  function save() { usersModule.update(editingId,{...form,updatedBy:"admin"}); refresh(); setModal(false); }

  return (
    <div>
      <div className="ph"><div><h1>Alunos</h1><p>Todos os alunos</p></div></div>
      <div className="card">
        {alunos.length===0 ? <div className="empty"><h3>Nenhum aluno</h3></div> :
          <table className="table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Coach</th><th>Ações</th></tr></thead>
            <tbody>{alunos.map(a=>{
              const coach = a.coachId ? usersModule.getById(a.coachId) : null;
              return (
                <tr key={a.id}>
                  <td className="fw6">{a.name}</td><td className="text-muted">{a.email}</td>
                  <td>{coach?<span className="badge bb">{coach.name}</span>:<span className="text-dim">—</span>}</td>
                  <td><div className="row">
                    <button className="btn btn-ghost btn-xs" onClick={()=>openEdit(a)}>Editar</button>
                    <button className="btn btn-blue btn-xs" onClick={()=>{setResetM(a.id);setNewPass("");}}>Reset Senha</button>
                    <button className="btn btn-red btn-xs" onClick={()=>setConfirm(a.id)}>Remover</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        }
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title="Editar Aluno"
        footer={<><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-green" onClick={save}>Salvar</button></>}>
        <div className="form-group"><label className="lbl">Nome</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
        <div className="form-group"><label className="lbl">E-mail</label><input className="inp" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
      </Modal>
      <Modal open={!!resetM} onClose={()=>setResetM(null)} title="Resetar Senha"
        footer={<><button className="btn btn-ghost" onClick={()=>setResetM(null)}>Cancelar</button><button className="btn btn-green" onClick={resetPass}>Salvar</button></>}>
        <div className="form-group"><label className="lbl">Nova Senha</label><input className="inp" type="password" value={newPass} onChange={e=>setNewPass(e.target.value)}/></div>
      </Modal>
      <Confirm open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={()=>del(confirm)} title="Remover Aluno" message="Tem certeza?"/>
    </div>
  );
}

function AdminLogs() {
  const logs = [...logModule.getAll()].reverse();
  return (
    <div>
      <div className="ph"><div><h1>Logs do Sistema</h1></div></div>
      <div className="card">
        {logs.length===0 ? <div className="empty"><h3>Nenhum log</h3></div> :
          <table className="table">
            <thead><tr><th>Data/Hora</th><th>Ator</th><th>Mensagem</th></tr></thead>
            <tbody>{logs.map(l=>{
              const u=usersModule.getById(l.actorId);
              return (
                <tr key={l.id}>
                  <td className="text-xs text-dim" style={{whiteSpace:"nowrap"}}>{new Date(l.createdAt).toLocaleString("pt-BR")}</td>
                  <td><span className="badge bn">{u?u.name:l.actorId}</span></td>
                  <td className="text-sm">{l.message}</td>
                </tr>
              );
            })}</tbody>
          </table>
        }
      </div>
    </div>
  );
}

// ============================================================
// COACH PAGES
// ============================================================
function CoachDashboard({ user }) {
  const alunos  = usersModule.getAlunos(user.id);
  const editais = editaisModule.getByCoach(user.id);
  const planos  = storage.get().planos;
  return (
    <div>
      <div className="ph"><div><h1>Olá, {user.name.split(" ")[0]}! 👋</h1><p>Acompanhe seus alunos</p></div></div>
      <div className="g4 mb4">
        <div className="stat"><div className="stat-l">Alunos</div><div className="stat-v" style={{color:"var(--blue)"}}>{alunos.length}</div></div>
        <div className="stat"><div className="stat-l">Editais</div><div className="stat-v" style={{color:"var(--purple)"}}>{editais.length}</div></div>
        <div className="stat"><div className="stat-l">Com Plano</div><div className="stat-v" style={{color:"var(--green)"}}>{alunos.filter(a=>planos.some(p=>p.alunoId===a.id)).length}</div></div>
        <div className="stat"><div className="stat-l">Tópicos</div><div className="stat-v" style={{color:"var(--amber)"}}>{editais.reduce((a,e)=>a+e.materias.reduce((b,m)=>b+m.topicos.length,0),0)}</div></div>
      </div>
      <div className="card">
        <div className="card-title">Progresso dos alunos</div>
        {alunos.length===0 ? <p className="text-muted text-sm">Nenhum aluno cadastrado.</p> : alunos.map(a=>{
          const plano=planos.find(p=>p.alunoId===a.id);
          const stats=plano?progressoModule.getStats(a.id,plano.id):null;
          return (
            <div key={a.id} style={{padding:"12px 0",borderBottom:"1px solid var(--b1)"}}>
              <div className="row-b mb2">
                <div className="row"><span className="fw6">{a.name}</span><span className={`badge ${plano?"bg":"bn"}`}>{plano?"Ativo":"Sem plano"}</span></div>
                {stats&&<span className="text-xs text-dim">Previsão: {stats.previsao}</span>}
              </div>
              {stats?<><div className="row-b mb2 text-xs text-dim"><span>{stats.aulasFeitas}/{stats.totalAulas} aulas</span><span>{stats.pct}%</span></div><PBar pct={stats.pct}/></>:<p className="text-xs text-dim">Plano não gerado.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoachAlunos({ user, refresh }) {
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({name:"",email:"",password:""});
  const [assocM, setAssocM] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const alunos  = usersModule.getAlunos(user.id);
  const editais = editaisModule.getByCoach(user.id);

  function openNew()  { setEditing(null); setForm({name:"",email:"",password:""}); setModal(true); }
  function openEdit(a){ setEditing(a.id); setForm({name:a.name,email:a.email,password:""}); setModal(true); }
  function save() {
    if (!form.name||!form.email) return;
    if (editing) { const u={name:form.name,email:form.email,updatedBy:user.id}; if(form.password)u.password=form.password; usersModule.update(editing,u); }
    else { if(!form.password)return; usersModule.create({...form,role:"aluno",coachId:user.id,createdBy:user.id}); }
    refresh(); setModal(false);
  }
  function del(id) { usersModule.delete(id); refresh(); setConfirm(null); }

  return (
    <div>
      <div className="ph"><div><h1>Meus Alunos</h1></div><button className="btn btn-green" onClick={openNew}>+ Novo Aluno</button></div>
      <div className="card">
        {alunos.length===0 ? <div className="empty"><h3>Nenhum aluno</h3></div> :
          <table className="table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Edital</th><th>Ações</th></tr></thead>
            <tbody>{alunos.map(a=>{
              const ae=editaisModule.getByAluno(a.id);
              return (
                <tr key={a.id}>
                  <td className="fw6">{a.name}</td><td className="text-muted">{a.email}</td>
                  <td>{ae.length>0?ae.map(e=><span key={e.id} className="chip">{e.name}</span>):<span className="text-dim">—</span>}</td>
                  <td><div className="row">
                    <button className="btn btn-ghost btn-xs" onClick={()=>openEdit(a)}>Editar</button>
                    <button className="btn btn-blue btn-xs" onClick={()=>setAssocM(a)}>Edital</button>
                    <button className="btn btn-red btn-xs" onClick={()=>setConfirm(a.id)}>Remover</button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        }
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar Aluno":"Novo Aluno"}
        footer={<><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-green" onClick={save}>Salvar</button></>}>
        <div className="form-group"><label className="lbl">Nome</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Nome completo"/></div>
        <div className="form-group"><label className="lbl">E-mail</label><input className="inp" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@exemplo.com"/></div>
        <div className="form-group"><label className="lbl">{editing?"Nova Senha (opcional)":"Senha inicial"}</label><input className="inp" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••"/></div>
      </Modal>
      {assocM&&<AssocEditalModal aluno={assocM} editais={editais} onClose={()=>{setAssocM(null);refresh();}}/>}
      <Confirm open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={()=>del(confirm)} title="Remover Aluno" message="Tem certeza?"/>
    </div>
  );
}

function AssocEditalModal({ aluno, editais, onClose }) {
  const [current, setCurrent] = useState(()=>editaisModule.getByAluno(aluno.id).map(e=>e.id));
  function toggle(editalId) {
    if (current.includes(editalId)) { editaisModule.desassociarAluno(aluno.id,editalId); setCurrent(c=>c.filter(x=>x!==editalId)); }
    else { editaisModule.associarAluno(aluno.id,editalId); setCurrent(c=>[...c,editalId]); }
  }
  return (
    <Modal open={true} onClose={onClose} title={`Editais — ${aluno.name}`} footer={<button className="btn btn-green" onClick={onClose}>Fechar</button>}>
      {editais.length===0?<p className="text-muted">Crie editais primeiro.</p>:editais.map(e=>(
        <div key={e.id} className="row-b" style={{padding:"11px 0",borderBottom:"1px solid var(--b1)"}}>
          <div><div className="fw6">{e.name}</div><div className="text-xs text-dim">{e.materias.reduce((a,m)=>a+m.topicos.length,0)} tópicos</div></div>
          <button className={`btn btn-sm ${current.includes(e.id)?"btn-red":"btn-green"}`} onClick={()=>toggle(e.id)}>{current.includes(e.id)?"Desassociar":"Associar"}</button>
        </div>
      ))}
    </Modal>
  );
}

function CoachEditais({ user, refresh }) {
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState({name:"",materias:[]});
  const [matM, setMatM]     = useState(false);
  const [matForm, setMatForm] = useState({name:"",color:"#6366f1",topicos:[],reviewPreset:"moderada"});
  const [matRaw, setMatRaw]   = useState("");
  const [editMatIdx, setEditMatIdx] = useState(null);
  const [confirm, setConfirm] = useState(null);
  // Material attachment modal: { idx, tab:"upload"|"url", urlInput, uploading, error }
  const [matAttach, setMatAttach] = useState(null);
  // Topic details editor: { idx, promptSugerido, conteudoAlta, conteudoMedia, conteudoBaixa }
  const [topicoEditar, setTopicoEditar] = useState(null);
  const editais = editaisModule.getByCoach(user.id);

  function openNew()  { setEditing(null); setForm({name:"",materias:[]}); setModal(true); }
  function openEdit(e){ setEditing(e.id); setForm({name:e.name,materias:JSON.parse(JSON.stringify(e.materias))}); setModal(true); }
  function saveEdital() {
    if (!form.name) return;
    if (editing) editaisModule.update(editing,{name:form.name,materias:form.materias});
    else editaisModule.create({name:form.name,coachId:user.id,materias:form.materias});
    refresh(); setModal(false);
  }
  function parseTopicosRaw(raw) {
    if (!raw.trim()) return [];
    const numberedMatch = raw.match(/^\s*\d+[\.\):]?\s+/);
    if (numberedMatch) {
      const parts = raw.split(/\n|(?=\d+[\.\):]?\s+)/).map(s=>s.replace(/^\s*\d+[\.\):]?\s*/,'').trim()).filter(Boolean);
      if (parts.length > 1) return parts;
    }
    if (raw.includes(';')) return raw.split(';').map(s=>s.trim()).filter(Boolean);
    const byLine = raw.split('\n').map(s=>s.replace(/^\s*[-•*]\s*/,'').trim()).filter(Boolean);
    if (byLine.length > 1) return byLine;
    return [raw.trim()];
  }
  // topicos are objects: { name, materialUrl?, materialName? }
  function openNewMat()  { setEditMatIdx(null); setMatForm({name:"",color:"#6366f1",topicos:[],reviewPreset:"moderada"}); setMatRaw(""); setMatM(true); }
  function openEditMat(i){ const m=form.materias[i]; setEditMatIdx(i); setMatForm({name:m.name,color:m.color,reviewPreset:m.reviewPreset||"moderada",topicos:m.topicos.map(t=>({name:t.name,promptSugerido:t.promptSugerido||"",conteudoAlta:t.conteudoAlta||"",conteudoMedia:t.conteudoMedia||"",conteudoBaixa:t.conteudoBaixa||"",materialUrl:t.materialUrl,materialName:t.materialName}))}); setMatRaw(m.topicos.map(t=>t.name).join('\n')); setMatM(true); }
  function handleMatRawChange(val) {
    setMatRaw(val);
    const names = parseTopicosRaw(val);
    setMatForm(f=>({...f, topicos: names.map((name,i)=>({name, promptSugerido:f.topicos[i]?.promptSugerido||"", conteudoAlta:f.topicos[i]?.conteudoAlta||"", conteudoMedia:f.topicos[i]?.conteudoMedia||"", conteudoBaixa:f.topicos[i]?.conteudoBaixa||"", materialUrl:f.topicos[i]?.materialUrl, materialName:f.topicos[i]?.materialName}))}));
  }
  function removeTopico(i) {
    const next = matForm.topicos.filter((_,j)=>j!==i);
    setMatForm(f=>({...f, topicos: next}));
    setMatRaw(next.map(t=>t.name).join('\n'));
  }

  function abrirEditarTopico(i) {
    const t = matForm.topicos[i];
    setTopicoEditar({
      idx: i,
      promptSugerido: t.promptSugerido || "",
      conteudoAlta: t.conteudoAlta || "",
      conteudoMedia: t.conteudoMedia || "",
      conteudoBaixa: t.conteudoBaixa || ""
    });
  }

  function salvarDetalhesTopico() {
    if (!topicoEditar) return;
    setMatForm(f => ({
      ...f,
      topicos: f.topicos.map((t, i) =>
        i === topicoEditar.idx
          ? {
              ...t,
              promptSugerido: topicoEditar.promptSugerido,
              conteudoAlta: topicoEditar.conteudoAlta,
              conteudoMedia: topicoEditar.conteudoMedia,
              conteudoBaixa: topicoEditar.conteudoBaixa
            }
          : t
      )
    }));
    setTopicoEditar(null);
  }
  function saveMat() {
    const valid = matForm.topicos.filter(t=>t.name?.trim());
    if (!matForm.name||valid.length===0) return;
    const mat={id:editMatIdx!==null?form.materias[editMatIdx].id:`m${Date.now()}`,name:matForm.name,color:matForm.color,reviewPreset:matForm.reviewPreset||"moderada",
      topicos:valid.map((t,i)=>({
        id:`t${Date.now()}-${i}`,
        name:t.name,
        promptSugerido:t.promptSugerido||"",
        conteudoAlta:t.conteudoAlta||"",
        conteudoMedia:t.conteudoMedia||"",
        conteudoBaixa:t.conteudoBaixa||"",
        ...(t.materialUrl?{materialUrl:t.materialUrl,materialName:t.materialName}:{})
      }))};
    if (editMatIdx!==null) setForm(f=>({...f,materias:f.materias.map((m,i)=>i===editMatIdx?mat:m)}));
    else setForm(f=>({...f,materias:[...f.materias,mat]}));
    setMatM(false);
  }
  // Supabase Storage upload
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file || matAttach===null) return;
    if (file.size > 20 * 1024 * 1024) { setMatAttach(a=>({...a,error:"Arquivo muito grande. Máximo 20MB."})); return; }
    setMatAttach(a=>({...a,uploading:true,error:null}));
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const path = `topicos/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from('materiais').upload(path, file, {upsert:true});
    if (error) {
      setMatAttach(a=>({...a,uploading:false,error:`Erro no upload: ${error.message}. Use a aba URL.`}));
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(path);
    setMatForm(f=>({...f,topicos:f.topicos.map((t,i)=>i===matAttach.idx?{...t,materialUrl:publicUrl,materialName:file.name}:t)}));
    setMatAttach(null);
  }
  function saveUrlAttach() {
    const url = matAttach?.urlInput?.trim();
    if (!url) return;
    setMatForm(f=>({...f,topicos:f.topicos.map((t,i)=>i===matAttach.idx?{...t,materialUrl:url,materialName:url}:t)}));
    setMatAttach(null);
  }
  function removeMaterial(idx) {
    setMatForm(f=>({...f,topicos:f.topicos.map((t,i)=>i===idx?{name:t.name}:t)}));
  }

  return (
    <div>
      <div className="ph"><div><h1>Editais</h1><p>Gerencie editais e matérias</p></div><button className="btn btn-green" onClick={openNew}>+ Novo Edital</button></div>
      {editais.length===0?<div className="card"><div className="empty"><h3>Nenhum edital</h3></div></div>:editais.map(e=>(
        <div className="sec-card" key={e.id}>
          <div className="sec-hd">
            <div><div className="fw7 fh" style={{fontSize:15}}>{e.name}</div><div className="text-xs text-dim mt2">{e.materias.reduce((a,m)=>a+m.topicos.length,0)} tópicos</div></div>
            <div className="row"><button className="btn btn-ghost btn-sm" onClick={()=>openEdit(e)}>Editar</button><button className="btn btn-red btn-sm" onClick={()=>setConfirm(e.id)}>Remover</button></div>
          </div>
          <div style={{padding:"12px 18px 14px"}}>
            {e.materias.map(m=>(
              <div key={m.id} className="row mb2" style={{flexWrap:"wrap"}}>
                <div className="dot-c" style={{background:m.color}}/><span className="fw6 text-sm">{m.name}</span><span className="badge bn">{m.topicos.length} tóp.</span>
                {m.topicos.slice(0,4).map(t=><span key={t.id} className="chip">{t.name}</span>)}
                {m.topicos.length>4&&<span className="chip">+{m.topicos.length-4}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Editar Edital":"Novo Edital"} wide
        footer={<><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-green" onClick={saveEdital}>Salvar</button></>}>
        <div className="form-group"><label className="lbl">Nome do Edital</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Concurso TRT 2025"/></div>
        <div className="row-b mb3 mt4"><span className="fw7 fh">Matérias ({form.materias.length})</span><button className="btn btn-ghost btn-sm" onClick={openNewMat}>+ Matéria</button></div>
        {form.materias.length===0?<p className="text-muted text-sm mb3">Nenhuma matéria.</p>:form.materias.map((m,idx)=>(
          <div key={m.id} className="card-sm row-b mb2">
            <div className="row"><div className="dot-c" style={{background:m.color}}/><span className="fw6">{m.name}</span><span className="badge bn">{m.topicos.length} tóp.</span></div>
            <div className="row"><button className="btn btn-ghost btn-xs" onClick={()=>openEditMat(idx)}>Editar</button><button className="btn btn-red btn-xs" onClick={()=>setForm(f=>({...f,materias:f.materias.filter((_,i)=>i!==idx)}))}>✕</button></div>
          </div>
        ))}
      </Modal>
      <Modal open={matM} onClose={()=>setMatM(false)} title={editMatIdx!==null?"Editar Matéria":"Nova Matéria"}
        footer={<><button className="btn btn-ghost" onClick={()=>setMatM(false)}>Cancelar</button><button className="btn btn-green" onClick={saveMat}>Confirmar</button></>}>
        <div className="form-group"><label className="lbl">Nome</label><input className="inp" value={matForm.name} onChange={e=>setMatForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Direito Constitucional"/></div>
        <div className="form-group"><label className="lbl">Cor</label><div className="row" style={{flexWrap:"wrap",gap:7}}>{COLORS_MATERIAS.map(c=><div key={c} onClick={()=>setMatForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:7,background:c,cursor:"pointer",border:matForm.color===c?"3px solid white":"3px solid transparent"}}/>)}</div></div>
        <div className="form-group">
          <label className="lbl">Ciclo de Revisão</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.keys(REVIEW_PRESETS).map(key=>(
              <button key={key} type="button" className={`preset-btn${matForm.reviewPreset===key?" active":""}`} onClick={()=>setMatForm(f=>({...f,reviewPreset:key}))}>
                {REVIEW_PRESET_LABELS[key]}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"var(--t3)",marginTop:5}}>{REVIEW_PRESET_DESCS[matForm.reviewPreset]}</div>
        </div>
        <div className="form-group">
          <label className="lbl">Tópicos</label>
          <textarea
            className="inp"
            style={{minHeight:110,resize:"vertical",fontFamily:"inherit",lineHeight:1.55,fontSize:13}}
            value={matRaw}
            onChange={e=>handleMatRawChange(e.target.value)}
            placeholder={"Cole ou digite os tópicos. Formatos aceitos:\n• Um por linha\n• Separados por ponto e vírgula: Tópico A; Tópico B\n• Numerados: 1 Tópico A 2 Tópico B"}
          />
          {matForm.topicos.length>0&&(
            <div style={{marginTop:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>
                {matForm.topicos.length} tópico{matForm.topicos.length!==1?"s":""} detectado{matForm.topicos.length!==1?"s":""}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,maxHeight:180,overflowY:"auto"}}>
                {matForm.topicos.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,background:"var(--s3)",border:`1px solid ${t.conteudoAlta||t.conteudoMedia||t.conteudoBaixa?"var(--green)":"var(--b2)"}`,borderRadius:99,padding:"4px 10px 4px 12px",fontSize:12,maxWidth:"100%"}}>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{t.name}</span>
                    {(t.conteudoAlta||t.conteudoMedia||t.conteudoBaixa)&&<span title="Tem conteúdo de níveis" style={{fontSize:11,color:"var(--green)",flexShrink:0}}>📚</span>}
                    {t.promptSugerido&&<span title="Tem prompt sugerido" style={{fontSize:11,color:"var(--amber)",flexShrink:0}}>💡</span>}
                    <button title="Editar detalhes (prompt e conteúdo por nível)" onClick={()=>abrirEditarTopico(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--blue)",fontSize:12,lineHeight:1,padding:"0 2px",flexShrink:0}}>✎</button>
                    {t.materialUrl&&<span title={t.materialName} style={{fontSize:11,color:"var(--green)",flexShrink:0}}>📎</span>}
                    <button title={t.materialUrl?"Trocar material":"Anexar material"} onClick={()=>setMatAttach({idx:i,tab:"upload",urlInput:"",uploading:false,error:null})} style={{background:"none",border:"none",cursor:"pointer",color:t.materialUrl?"var(--green)":"var(--t3)",fontSize:12,lineHeight:1,padding:"0 2px",flexShrink:0}}>🔗</button>
                    {t.materialUrl&&<button title="Remover material" onClick={()=>removeMaterial(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--amber)",fontSize:11,lineHeight:1,padding:0,flexShrink:0}}>⊘</button>}
                    <button onClick={()=>removeTopico(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--t3)",fontSize:14,lineHeight:1,padding:0,flexShrink:0}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Confirm open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={()=>{editaisModule.delete(confirm);refresh();setConfirm(null);}} title="Remover Edital" message="Tem certeza?"/>
      {matAttach!==null&&(
        <div className="overlay" onClick={()=>setMatAttach(null)} style={{zIndex:9999}}>
          <div className="modal fi" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h2>📎 Anexar Material</h2><button className="modal-x" onClick={()=>setMatAttach(null)}>✕</button></div>
            <p style={{fontSize:12,color:"var(--t3)",marginBottom:14}}>Tópico: <strong>{matForm.topicos[matAttach.idx]?.name}</strong></p>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <button type="button" className={`preset-btn${matAttach.tab==="upload"?" active":""}`} onClick={()=>setMatAttach(a=>({...a,tab:"upload"}))}>⬆ Upload</button>
              <button type="button" className={`preset-btn${matAttach.tab==="url"?" active":""}`} onClick={()=>setMatAttach(a=>({...a,tab:"url"}))}>🔗 URL</button>
            </div>
            {matAttach.tab==="upload"?(
              <>
                <label className="upload-zone">
                  <input type="file" style={{display:"none"}} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"/>
                  {matAttach.uploading?(
                    <div style={{color:"var(--t2)"}}>⏳ Enviando...</div>
                  ):(
                    <>
                      <div style={{fontSize:36,marginBottom:8}}>📁</div>
                      <div style={{fontWeight:700,marginBottom:4}}>Clique para selecionar arquivo</div>
                      <div style={{fontSize:11,color:"var(--t3)"}}>PDF, DOC, imagens — máx. 20MB</div>
                    </>
                  )}
                </label>
                {matAttach.error&&<div className="alert alert-red mt3" style={{fontSize:12}}>{matAttach.error}</div>}
              </>
            ):(
              <>
                <div className="form-group">
                  <label className="lbl">URL do material</label>
                  <input className="inp" value={matAttach.urlInput} onChange={e=>setMatAttach(a=>({...a,urlInput:e.target.value}))} placeholder="https://..."/>
                </div>
                <button className="btn btn-green" style={{width:"100%"}} onClick={saveUrlAttach}>Salvar URL</button>
              </>
            )}
            {matForm.topicos[matAttach?.idx]?.materialUrl&&(
              <div style={{marginTop:14,padding:"10px 12px",borderRadius:9,background:"var(--s3)",border:"1px solid var(--green)",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:"var(--green)",fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📎 {matForm.topicos[matAttach.idx].materialName}</span>
                <a href={matForm.topicos[matAttach.idx].materialUrl} target="_blank" rel="noreferrer" style={{fontSize:11,color:"var(--blue)",textDecoration:"none"}}>Abrir</a>
                <button onClick={()=>removeMaterial(matAttach.idx)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",fontSize:11}}>Remover</button>
              </div>
            )}
          </div>
        </div>
      )}
      {topicoEditar !== null && (
        <div className="overlay" onClick={() => setTopicoEditar(null)} style={{ zIndex: 9999 }}>
          <div className="modal fi" style={{ maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h2>✎ Editar Tópico: {matForm.topicos[topicoEditar.idx]?.name}</h2>
              <button className="modal-x" onClick={() => setTopicoEditar(null)}>✕</button>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Prompt Sugerido */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="lbl">💡 Prompt Sugerido</label>
                <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                  Suira um prompt de estudo para este tópico. O aluno pode usá-lo para gerar materiais com IA.
                </p>
                <textarea
                  className="inp"
                  style={{ minHeight: 80, fontFamily: "inherit", resize: "vertical" }}
                  value={topicoEditar.promptSugerido}
                  onChange={e => setTopicoEditar(s => ({ ...s, promptSugerido: e.target.value }))}
                  placeholder="Ex: Explique os conceitos principais de estequiometria e como calcular..."
                />
              </div>

              {/* Conteúdo Alta Cobertura */}
              <div className="form-group" style={{ marginBottom: 20, padding: 12, borderRadius: 8, background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <label className="lbl" style={{ color: "var(--red)" }}>🔴 Alta Cobertura</label>
                <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                  Cole aqui o conteúdo completo, detalhado e aprofundado para este tópico.
                </p>
                <textarea
                  className="inp"
                  style={{ minHeight: 120, fontFamily: "inherit", resize: "vertical" }}
                  value={topicoEditar.conteudoAlta}
                  onChange={e => setTopicoEditar(s => ({ ...s, conteudoAlta: e.target.value }))}
                  placeholder="Conteúdo detalhado e aprofundado..."
                />
              </div>

              {/* Conteúdo Média Cobertura */}
              <div className="form-group" style={{ marginBottom: 20, padding: 12, borderRadius: 8, background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)" }}>
                <label className="lbl" style={{ color: "var(--amber)" }}>🟡 Média Cobertura</label>
                <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                  Cole o conteúdo essencial, focado nos pontos principais.
                </p>
                <textarea
                  className="inp"
                  style={{ minHeight: 120, fontFamily: "inherit", resize: "vertical" }}
                  value={topicoEditar.conteudoMedia}
                  onChange={e => setTopicoEditar(s => ({ ...s, conteudoMedia: e.target.value }))}
                  placeholder="Conteúdo essencial e sintetizado..."
                />
              </div>

              {/* Conteúdo Baixa Cobertura */}
              <div className="form-group" style={{ marginBottom: 20, padding: 12, borderRadius: 8, background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                <label className="lbl" style={{ color: "var(--green)" }}>🟢 Baixa Cobertura</label>
                <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                  Cole apenas o resumo, conceitos principais em poucas linhas.
                </p>
                <textarea
                  className="inp"
                  style={{ minHeight: 100, fontFamily: "inherit", resize: "vertical" }}
                  value={topicoEditar.conteudoBaixa}
                  onChange={e => setTopicoEditar(s => ({ ...s, conteudoBaixa: e.target.value }))}
                  placeholder="Resumo e conceitos principais..."
                />
              </div>
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--b2)", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setTopicoEditar(null)}>
                Cancelar
              </button>
              <button className="btn btn-green" style={{ flex: 1 }} onClick={salvarDetalhesTopico}>
                ✓ Salvar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoachProgresso({ user }) {
  const alunos = usersModule.getAlunos(user.id);
  const planos = storage.get().planos;
  return (
    <div>
      <div className="ph"><div><h1>Progresso dos Alunos</h1></div></div>
      {alunos.length===0?<div className="card"><div className="empty"><h3>Nenhum aluno</h3></div></div>:alunos.map(a=>{
        const ap=planos.filter(p=>p.alunoId===a.id);
        return (
          <div className="sec-card mb4" key={a.id}>
            <div className="sec-hd"><div className="fw7 fh" style={{fontSize:15}}>{a.name}</div><span className="badge bb">{a.email}</span></div>
            <div style={{padding:"14px 18px"}}>
              {ap.length===0?<p className="text-muted text-sm">Sem plano.</p>:ap.map(plano=>{
                const stats=progressoModule.getStats(a.id,plano.id);
                const edital=editaisModule.getById(plano.editalId);
                if (!stats) return null;
                return (
                  <div key={plano.id} className="card-sm mb3">
                    <div className="row-b mb3"><div className="fw6">{edital?.name}</div><span className={`badge ${stats.pct===100?"bg":"bn"}`}>{stats.pct}%</span></div>
                    <div className="g3 mb3">
                      <div style={{textAlign:"center"}}><div className="fw9 fh" style={{fontSize:22,color:"var(--green)"}}>{stats.aulasFeitas}</div><div className="text-xs text-dim">Feitas</div></div>
                      <div style={{textAlign:"center"}}><div className="fw9 fh" style={{fontSize:22}}>{stats.totalAulas-stats.aulasFeitas}</div><div className="text-xs text-dim">Restantes</div></div>
                      <div style={{textAlign:"center"}}><div className="fw7 fh" style={{fontSize:12,color:"var(--amber)",marginTop:4}}>{stats.previsao}</div><div className="text-xs text-dim">Previsão</div></div>
                    </div>
                    <PBar pct={stats.pct}/>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// COACH: Gerenciar Planos
// ============================================================
function CoachGerenciarPlanos({ user, refresh }) {
  const alunos = usersModule.getAlunos(user.id);
  const planos = storage.get().planos;
  const [selectedAlunoId, setSelectedAlunoId] = useState(alunos[0]?.id || null);
  const [view, setView] = useState("tabela"); // "tabela" | "cronograma" | "migracao"
  const [modalAula, setModalAula] = useState(null); // { alunoId, planoId, date, topicId, action }
  const [anotacao, setAnotacao] = useState("");
  const [novaData, setNovaData] = useState("");
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tabPrincipal, setTabPrincipal] = useState("planos"); // "planos" | "migracao"

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const alunoPlanos = planos.filter(p => p.alunoId === selectedAlunoId);

  function salvarAlteracao(alunoId, planoId, topicId, date, action, notes = "") {
    const registro = {
      id: `alter${Date.now()}`,
      alunoId,
      planoId,
      topicId,
      date,
      action, // "mark_done" | "mark_pending" | "cancel" | "reschedule"
      notes,
      realizadoPor: user.id,
      realizadoEm: new Date().toISOString(),
    };
    storage.set(db => ({
      ...db,
      auditLog: [...(db.auditLog || []), registro],
    }));
  }

  function marcarComoConcluida(alunoId, planoId, date, topicId, dataRealizacao) {
    const dataParaUsar = dataRealizacao || date;
    if (anotacao.trim()) salvarAlteracao(alunoId, planoId, topicId, dataParaUsar, "mark_done", anotacao);
    progressoModule.saveDone(alunoId, planoId, `${dataParaUsar}-${topicId}`);

    // Schedule reviews from the completion date
    const plano = planosModule.getById(planoId);
    if (plano) {
      const topicObj = Object.values(plano.plan || {}).flatMap(d => d.topicos).find(t => t.id === topicId);
      if (topicObj) {
        storage.set(db => {
          const planos = db.planos.map(p => {
            if (p.id !== planoId) return p;
            const np = JSON.parse(JSON.stringify(p.plan));
            const lessonDate = new Date(dataParaUsar + "T12:00:00");
            const intervals = REVIEW_PRESETS[topicObj.materiaReviewPreset || "moderada"] || REVIEW_INTERVALS;
            intervals.forEach(interval => {
              const rd = new Date(lessonDate); rd.setDate(rd.getDate() + interval);
              const rk = localDateKey(rd);
              if (!np[rk]) np[rk] = { date: rk, topicos: [], reviews: [] };
              if (!np[rk].reviews.find(r => r.id === topicId))
                np[rk].reviews.push({ ...topicObj, reviewInterval: interval });
            });
            return { ...p, plan: np };
          });
          return { ...db, planos };
        });
      }
    }

    setModalAula(null);
    setAnotacao("");
    setDataRealizacao("");
    setSuccessMessage("✅ Aula marcada como concluída!");
    setTimeout(() => setSuccessMessage(""), 3000);
    refresh();
  }

  function desmarcarComoConcluida(alunoId, planoId, date, topicId) {
    if (anotacao.trim()) salvarAlteracao(alunoId, planoId, topicId, date, "mark_pending", anotacao);
    progressoModule.toggle(alunoId, planoId, `${date}-${topicId}`);
    persistToSupabase(storage.get());
    setModalAula(null);
    setAnotacao("");
    setSuccessMessage("⏳ Aula marcada como pendente!");
    setTimeout(() => setSuccessMessage(""), 3000);
    refresh();
  }

  function cancelarAula(alunoId, planoId, date, topicId) {
    salvarAlteracao(alunoId, planoId, topicId, date, "cancel", anotacao);
    const plano = planosModule.getById(planoId);
    if (plano?.plan?.[date]) {
      storage.set(db => ({
        ...db,
        planos: db.planos.map(p => p.id === planoId ? {
          ...p,
          plan: { ...p.plan, [date]: { ...p.plan[date], topicos: p.plan[date].topicos.filter(t => t.id !== topicId) } }
        } : p),
      }));
      persistToSupabase(storage.get());
    }
    setModalAula(null);
    setAnotacao("");
    setSuccessMessage("❌ Aula cancelada!");
    setTimeout(() => setSuccessMessage(""), 3000);
    refresh();
  }

  function reagendarAula(alunoId, planoId, date, topicId, newDate) {
    if (!newDate) return;
    salvarAlteracao(alunoId, planoId, topicId, date, "reschedule", `Movido de ${date} para ${newDate}`);

    persistToSupabase(storage.get());

    const plano = planosModule.getById(planoId);
    if (plano?.plan) {
      const aula = plano.plan[date]?.topicos.find(t => t.id === topicId);
      if (aula) {
        const novoPlano = { ...plano.plan };
        // Remove from old date
        novoPlano[date] = { ...novoPlano[date], topicos: novoPlano[date].topicos.filter(t => t.id !== topicId) };
        // Add to new date
        if (!novoPlano[newDate]) novoPlano[newDate] = { date: newDate, topicos: [], reviews: [] };
        novoPlano[newDate].topicos.push(aula);
        storage.set(db => ({
          ...db,
          planos: db.planos.map(p => p.id === planoId ? { ...p, plan: novoPlano } : p),
        }));
        persistToSupabase(storage.get());
      }
    }
    setModalAula(null);
    setNovaData("");
    setSuccessMessage(`🔄 Aula reagendada para ${new Date(newDate + "T12:00:00").toLocaleDateString("pt-BR")}!`);
    setTimeout(() => setSuccessMessage(""), 3000);
    refresh();
  }

  if (!selectedAluno) return <div className="card"><div className="empty"><h3>Nenhum aluno</h3></div></div>;

  return (
    <div>
      <div className="ph"><div><h1>Gerenciar Planos de Aulas</h1><p>Ajuste cronogramas e registre aulas</p></div></div>

      {/* Abas principais */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--b2)", paddingBottom: 12 }}>
        <button
          onClick={() => setTabPrincipal("planos")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: tabPrincipal === "planos" ? "var(--blue)" : "transparent",
            color: tabPrincipal === "planos" ? "white" : "var(--t2)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          📊 Planos
        </button>
        <button
          onClick={() => setTabPrincipal("migracao")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: tabPrincipal === "migracao" ? "var(--blue)" : "transparent",
            color: tabPrincipal === "migracao" ? "white" : "var(--t2)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          🔄 Migração
        </button>
      </div>

      {successMessage && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 8,
          background: 'var(--green-d)',
          color: 'var(--green)',
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
          border: '1px solid var(--green)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {successMessage}
        </div>
      )}

      {tabPrincipal === "migracao" ? (
        <CoachMigracao user={user} alunos={alunos} refresh={refresh} setSuccessMessage={setSuccessMessage} />
      ) : (
        <>
      {/* Seleção de aluno */}
      <div className="card mb4">
        <div className="card-title">Selecione um aluno</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alunos.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAlunoId(a.id)}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: `2px solid ${selectedAlunoId === a.id ? "var(--green)" : "var(--b2)"}`,
                background: selectedAlunoId === a.id ? "var(--green-d)" : "var(--s1)",
                color: selectedAlunoId === a.id ? "var(--green)" : "var(--t2)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all .15s",
              }}
            >
              {a.name} ({a.email})
            </button>
          ))}
        </div>
      </div>

      {/* Planos do aluno */}
      {alunoPlanos.length === 0 ? (
        <div className="card"><div className="empty"><h3>Nenhum plano ativo</h3></div></div>
      ) : (
        alunoPlanos.map(plano => (
          <div key={plano.id} className="card mb4">
            <div className="card-title" style={{ marginBottom: 16 }}>
              {editaisModule.getById(plano.editalId)?.name}
              <span style={{ marginLeft: 8, fontSize: 12, color: "var(--t3)" }}>{Object.keys(plano.plan || {}).length} aulas</span>
            </div>

            {/* Abas de visualização */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button
                onClick={() => setView("tabela")}
                className={`preset-btn ${view === "tabela" ? "active" : ""}`}
              >
                📊 Tabela
              </button>
              <button
                onClick={() => setView("cronograma")}
                className={`preset-btn ${view === "cronograma" ? "active" : ""}`}
              >
                📅 Cronograma
              </button>
            </div>

            {/* VISTA 1: Tabela */}
            {view === "tabela" && (
              <CoachPlanoTabela
                aluno={selectedAluno}
                plano={plano}
                setModalAula={setModalAula}
              />
            )}

            {/* VISTA 2: Cronograma */}
            {view === "cronograma" && (
              <CoachPlanoCronograma
                aluno={selectedAluno}
                plano={plano}
                setModalAula={setModalAula}
              />
            )}
          </div>
        ))
      )}

      {/* MODAL: Ação na aula */}
      {modalAula && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div className="card" style={{ maxWidth: 500, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              {modalAula.action === "mark_done" && "✅ Marcar aula como realizada"}
              {modalAula.action === "mark_pending" && "⏳ Marcar como não realizada"}
              {modalAula.action === "cancel" && "❌ Cancelar aula"}
              {modalAula.action === "reschedule" && "🔄 Reagendar aula"}
            </div>

            {modalAula.action === "mark_done" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", display: "block", marginBottom: 6 }}>
                    📅 Data de conclusão
                  </label>
                  <input
                    type="date"
                    value={dataRealizacao || modalAula.date}
                    onChange={(e) => setDataRealizacao(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--b2)",
                      background: "var(--s1)",
                      color: "var(--t2)",
                      fontSize: 13,
                    }}
                  />
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
                    A partir dessa data, as revisões serão agendadas automaticamente
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", display: "block", marginBottom: 6 }}>
                    📝 Anotações (opcional)
                  </label>
                  <textarea
                    value={anotacao}
                    onChange={(e) => setAnotacao(e.target.value)}
                    placeholder="Ex: Aluno completou com excelência..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--b2)",
                      background: "var(--s1)",
                      color: "var(--t2)",
                      fontSize: 13,
                      minHeight: 80,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </>
            )}

            {(modalAula.action === "mark_pending" || modalAula.action === "cancel") && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", display: "block", marginBottom: 6 }}>
                  📝 Anotações (opcional)
                </label>
                <textarea
                  value={anotacao}
                  onChange={(e) => setAnotacao(e.target.value)}
                  placeholder="Ex: Aluno completou com excelência..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--b2)",
                    background: "var(--s1)",
                    color: "var(--t2)",
                    fontSize: 13,
                    minHeight: 80,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            )}

            {modalAula.action === "reschedule" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", display: "block", marginBottom: 6 }}>
                  📅 Nova data
                </label>
                <input
                  type="date"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--b2)",
                    background: "var(--s1)",
                    color: "var(--t2)",
                    fontSize: 13,
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => {
                  setModalAula(null);
                  setAnotacao("");
                  setNovaData("");
                  setDataRealizacao("");
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-green"
                style={{ flex: 1 }}
                onClick={() => {
                  if (modalAula.action === "mark_done") marcarComoConcluida(modalAula.alunoId, modalAula.planoId, modalAula.date, modalAula.topicId, dataRealizacao);
                  else if (modalAula.action === "mark_pending") desmarcarComoConcluida(modalAula.alunoId, modalAula.planoId, modalAula.date, modalAula.topicId);
                  else if (modalAula.action === "cancel") cancelarAula(modalAula.alunoId, modalAula.planoId, modalAula.date, modalAula.topicId);
                  else if (modalAula.action === "reschedule") reagendarAula(modalAula.alunoId, modalAula.planoId, modalAula.date, modalAula.topicId, novaData);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

// Componente: Migração de Edital
function CoachMigracao({ user, alunos, refresh, setSuccessMessage }) {
  const [selectedAlunoId, setSelectedAlunoId] = useState(alunos[0]?.id || null);
  const [selectedNovoEditalId, setSelectedNovoEditalId] = useState("");
  const [compatibilidade, setCompatibilidade] = useState(null);
  const [confirmacoesManuais, setConfirmacoesManuais] = useState({});
  const [mostrando, setMostrando] = useState("selecao"); // "selecao" | "analise" | "confirmacao"

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const alunoPlanos = (storage.get().planos || []).filter(p => p.alunoId === selectedAlunoId);
  const alunoPlanoAtivo = alunoPlanos[0];

  const editaisDisponiveis = editaisModule.getByCoach(user.id);
  const editalAtual = alunoPlanoAtivo ? editaisModule.getById(alunoPlanoAtivo.editalId) : null;
  const novoEdital = selectedNovoEditalId ? editaisModule.getById(selectedNovoEditalId) : null;

  function analisarCompatibilidade() {
    if (!selectedNovoEditalId) {
      alert("Selecione um novo edital");
      return;
    }
    if (!alunoPlanoAtivo) {
      alert("Selecione um aluno com um plano ativo");
      return;
    }
    const compat = migracaoModule.analisarCompatibilidade(alunoPlanoAtivo.editalId, selectedNovoEditalId);
    setCompatibilidade(compat);
    setMostrando("analise");
    setConfirmacoesManuais({});
  }

  function confirmarMigracao() {
    if (!alunoPlanoAtivo) return;

    // Validar confirmações manuais
    const todasConfirmadas = compatibilidade.automaticas.length + Object.keys(confirmacoesManuais).length >=
                            (compatibilidade.automaticas.length + compatibilidade.manuais.length);

    if (compatibilidade.manuais.length > 0 && Object.keys(confirmacoesManuais).length < compatibilidade.manuais.length) {
      alert("Por favor, confirme todas as matérias similares");
      return;
    }

    const resultado = migracaoModule.executarMigracao(
      selectedAlunoId,
      alunoPlanoAtivo.id,
      selectedNovoEditalId,
      confirmacoesManuais
    );

    if (resultado.sucesso) {
      setSuccessMessage(`✅ Edital migrado com sucesso! ${resultado.resumo.materiasMapeadas} matérias transferidas`);
      setMostrando("selecao");
      setSelectedNovoEditalId("");
      setCompatibilidade(null);
      refresh();
    } else {
      alert("Erro: " + resultado.erro);
    }
  }

  return (
    <div>
      {mostrando === "selecao" && (
        <>
          {alunos.length === 0 ? (
            <div className="card mb4">
              <div className="empty"><h3>Nenhum aluno disponível</h3></div>
            </div>
          ) : (
            <>
              <div className="card mb4">
                <div className="card-title">Selecione um aluno</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {alunos.map(a => (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAlunoId(a.id); setMostrando("selecao"); }}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: `2px solid ${selectedAlunoId === a.id ? "var(--green)" : "var(--b2)"}`,
                        background: selectedAlunoId === a.id ? "var(--green-d)" : "var(--s1)",
                        color: selectedAlunoId === a.id ? "var(--green)" : "var(--t2)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all .15s",
                      }}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>

              {!selectedAluno ? (
                <div className="card mb4">
                  <div className="empty"><h3>Selecione um aluno acima</h3></div>
                </div>
              ) : !alunoPlanoAtivo ? (
                <div className="card mb4">
                  <div className="empty"><h3>Este aluno não tem um plano ativo</h3></div>
                </div>
              ) : (
            <div className="card mb4">
              <div className="card-title" style={{ marginBottom: 20 }}>Informações do Plano Atual</div>

              <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 12, borderRadius: 8, background: "var(--s2)" }}>
                  <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700, marginBottom: 4 }}>
                    📘 Edital Atual
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>
                    {editalAtual?.name}
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 8, background: "var(--s2)" }}>
                  <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700, marginBottom: 4 }}>
                    📊 Progresso
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {(() => {
                      const stats = progressoModule.getStats(selectedAlunoId, alunoPlanoAtivo.id);
                      return (
                        <>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)" }}>
                            {stats.aulasFeitas}/{stats.totalAulas} aulas
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)" }}>
                            {stats.reviewsFeitas}/{stats.totalReviews} revisões
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
                            {stats.pct}% concluído
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 8 }}>
                  🎯 Selecione o novo edital
                </label>
                <select
                  value={selectedNovoEditalId}
                  onChange={(e) => setSelectedNovoEditalId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--b2)",
                    background: "var(--s2)",
                    color: "var(--t1)",
                    fontSize: 13
                  }}
                >
                  <option value="">-- Selecione um edital --</option>
                  {editaisDisponiveis.filter(e => e.id !== alunoPlanoAtivo.editalId).map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={analisarCompatibilidade}
                disabled={!selectedNovoEditalId}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedNovoEditalId ? "var(--blue)" : "var(--s3)",
                  color: selectedNovoEditalId ? "white" : "var(--t3)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: selectedNovoEditalId ? "pointer" : "not-allowed"
                }}
              >
                Analisar Compatibilidade →
              </button>
            </div>
              )}
            </>
          )}
        </>
      )}

      {mostrando === "analise" && compatibilidade && (
        <CoachMigracaoAnalise
          compatibilidade={compatibilidade}
          editalAtual={editalAtual}
          novoEdital={novoEdital}
          confirmacoesManuais={confirmacoesManuais}
          setConfirmacoesManuais={setConfirmacoesManuais}
          onConfirmar={() => setMostrando("confirmacao")}
          onVoltar={() => setMostrando("selecao")}
        />
      )}

      {mostrando === "confirmacao" && compatibilidade && (
        <CoachMigracaoConfirma
          compatibilidade={compatibilidade}
          confirmacoesManuais={confirmacoesManuais}
          onConfirmar={confirmarMigracao}
          onVoltar={() => setMostrando("analise")}
        />
      )}
    </div>
  );
}

// Subcomponente: Análise de Compatibilidade
function CoachMigracaoAnalise({ compatibilidade, editalAtual, novoEdital, confirmacoesManuais, setConfirmacoesManuais, onConfirmar, onVoltar }) {
  return (
    <div>
      <div className="card mb4">
        <div className="card-title">
          📋 Análise de Migração
        </div>
        <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20 }}>
          {editalAtual?.name} → {novoEdital?.name}
        </div>

        {/* Matérias Automáticas */}
        {compatibilidade.automaticas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 12 }}>
              ✓ Migração Automática ({compatibilidade.automaticas.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {compatibilidade.automaticas.map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--green-d)",
                    border: "1px solid var(--green)",
                    fontSize: 12,
                    color: "var(--green)"
                  }}
                >
                  {m.nome} ✓
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matérias Manuais */}
        {compatibilidade.manuais.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginBottom: 12 }}>
              ⚠️ Confirmação Necessária ({compatibilidade.manuais.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {compatibilidade.manuais.map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--s2)",
                    border: "1px solid var(--amber)",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--amber)", marginBottom: 8 }}>
                    {m.nome} (Similaridade: {(m.similaridade * 100).toFixed(0)}%)
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--t2)" }}>Mapear para:</span>
                    <select
                      value={confirmacoesManuais[m.id] || ""}
                      onChange={(e) => setConfirmacoesManuais(prev => ({ ...prev, [m.id]: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--b2)",
                        background: "var(--s1)",
                        fontSize: 11
                      }}
                    >
                      <option value="">-- Selecione --</option>
                      <option value={m.novoId}>{m.novoNome} (Sugerido)</option>
                      {novoEdital?.materias?.filter(mat => mat.id !== m.novoId).map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matérias Removidas */}
        {compatibilidade.removidas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", marginBottom: 12 }}>
              ❌ Não encontradas ({compatibilidade.removidas.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {compatibilidade.removidas.map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--red-d)",
                    border: "1px solid var(--red)",
                    fontSize: 12,
                    color: "var(--red)"
                  }}
                >
                  {m.nome} (será arquivada)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matérias Novas */}
        {compatibilidade.novas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", marginBottom: 12 }}>
              ➕ Novas matérias ({compatibilidade.novas.length})
            </div>
            <div style={{ fontSize: 11, color: "var(--t2)" }}>
              Serão adicionadas como "não iniciadas" no novo edital
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button
            onClick={onVoltar}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--b2)",
              background: "transparent",
              color: "var(--t2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ← Voltar
          </button>
          <button
            onClick={onConfirmar}
            disabled={compatibilidade.manuais.some(m => !confirmacoesManuais[m.id])}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              background: compatibilidade.manuais.some(m => !confirmacoesManuais[m.id]) ? "var(--s3)" : "var(--green)",
              color: compatibilidade.manuais.some(m => !confirmacoesManuais[m.id]) ? "var(--t3)" : "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: compatibilidade.manuais.some(m => !confirmacoesManuais[m.id]) ? "not-allowed" : "pointer"
            }}
          >
            Avançar →
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponente: Confirmação Final
function CoachMigracaoConfirma({ compatibilidade, confirmacoesManuais, onConfirmar, onVoltar }) {
  return (
    <div>
      <div className="card">
        <div style={{
          padding: 24,
          borderRadius: 12,
          background: "var(--amber-d)",
          border: "2px solid var(--amber)",
          marginBottom: 20
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--amber)", marginBottom: 12 }}>
            ⚠️ Confirme a Migração
          </div>
          <ul style={{ fontSize: 13, color: "var(--amber)", lineHeight: 1.8, marginLeft: 20 }}>
            <li>✓ Progresso de estudo será preservado</li>
            <li>✓ Revisões agendadas continuarão ativas</li>
            <li>✓ Anotações e notas do aluno serão mantidas</li>
            <li>❌ Matérias não encontradas serão arquivadas</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onVoltar}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--b2)",
              background: "transparent",
              color: "var(--t2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ← Voltar
          </button>
          <button
            onClick={onConfirmar}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--green)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ✓ Executar Migração
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente: Vista em tabela
function CoachPlanoTabela({ aluno, plano, setModalAula }) {
  const aulas = [];
  Object.entries(plano.plan || {}).forEach(([date, day]) => {
    day.topicos?.forEach(t => {
      const done = progressoModule.isDone(aluno.id, plano.id, `${date}-${t.id}`);
      aulas.push({ date, topic: t, done, type: "aula" });
    });
    day.reviews?.forEach(r => {
      const done = progressoModule.isDone(aluno.id, plano.id, `${date}-${r.id}-rev`);
      aulas.push({ date, topic: r, done, type: "review" });
    });
  });
  aulas.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid var(--b2)" }}>
          <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--t3)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Data</th>
          <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--t3)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Tipo</th>
          <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--t3)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Tópico</th>
          <th style={{ padding: "10px 12px", textAlign: "center", color: "var(--t3)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Status</th>
          <th style={{ padding: "10px 12px", textAlign: "center", color: "var(--t3)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {aulas.map((aula, i) => (
          <tr key={i} style={{ borderBottom: "1px solid var(--b2)", background: aula.done ? "rgba(34, 197, 94, 0.1)" : "transparent" }}>
            <td style={{ padding: "12px", color: "var(--t2)", fontWeight: 600 }}>{aula.date}</td>
            <td style={{ padding: "12px", color: "var(--t3)" }}>{aula.type === "aula" ? "📚 Aula" : "🔁 Revisão"}</td>
            <td style={{ padding: "12px", color: "var(--t2)" }}>{aula.topic.name?.slice(0, 40)}</td>
            <td style={{ padding: "12px", textAlign: "center", color: aula.done ? "var(--green)" : "var(--amber)" }}>
              {aula.done ? "✅ Feita" : "⏳ Pendente"}
            </td>
            <td style={{ padding: "12px", textAlign: "center", display: "flex", gap: 6, justifyContent: "center" }}>
              <button
                className="btn-xs"
                onClick={() => setModalAula({ alunoId: aluno.id, planoId: plano.id, date: aula.date, topicId: aula.topic.id, action: aula.done ? "mark_pending" : "mark_done" })}
                style={{ padding: "4px 10px", fontSize: 11, background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 6, cursor: "pointer" }}
              >
                {aula.done ? "Desfazer" : "✓ Concluir"}
              </button>
              <button
                onClick={() => setModalAula({ alunoId: aluno.id, planoId: plano.id, date: aula.date, topicId: aula.topic.id, action: "reschedule" })}
                style={{ padding: "4px 10px", fontSize: 11, background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 6, cursor: "pointer" }}
              >
                🔄
              </button>
              <button
                onClick={() => setModalAula({ alunoId: aluno.id, planoId: plano.id, date: aula.date, topicId: aula.topic.id, action: "cancel" })}
                style={{ padding: "4px 10px", fontSize: 11, background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 6, cursor: "pointer" }}
              >
                ❌
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Componente: Vista em cronograma
function CoachPlanoCronograma({ aluno, plano, setModalAula }) {
  const sorted = Object.keys(plano.plan || {}).sort();
  let weekStart = null;
  const semanas = [];

  sorted.forEach(date => {
    const d = new Date(date + "T00:00:00");
    const wStart = new Date(d);
    wStart.setDate(d.getDate() - d.getDay() + 1);
    const wKey = localDateKey(wStart);
    if (!weekStart || wKey !== weekStart) {
      weekStart = wKey;
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      semanas.push({ start: wKey, end: localDateKey(wEnd), dias: {} });
    }
    const currentWeek = semanas[semanas.length - 1];
    if (!currentWeek.dias[date]) currentWeek.dias[date] = plano.plan[date];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {semanas.map((sem, wi) => (
        <div key={wi}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 12 }}>
            📅 {sem.start} — {sem.end}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {Object.entries(sem.dias).map(([date, day]) => (
              <div key={date} style={{ padding: 14, borderRadius: 10, border: "1px solid var(--b2)", background: "var(--s2)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--t1)" }}>{date}</div>
                {(day.topicos || []).map((t, i) => {
                  const done = progressoModule.isDone(aluno.id, plano.id, `${date}-${t.id}`);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "8px 10px",
                        marginBottom: 6,
                        borderRadius: 7,
                        background: done ? "var(--green-d)" : "var(--s3)",
                        color: done ? "var(--green)" : "var(--t2)",
                        fontSize: 12,
                        textDecoration: done ? "line-through" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name?.slice(0, 20)}</span>
                      <button onClick={() => setModalAula({ alunoId: aluno.id, planoId: plano.id, date, topicId: t.id, action: "mark_done" })} style={{ padding: "2px 6px", fontSize: 10, background: "transparent", border: "none", cursor: "pointer" }}>✓</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ALUNO PAGES
// ============================================================
function AlunoDashboard({ user, setPage }) {
  const [estudarOpen, setEstudarOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const plano  = planosModule.getByAluno(user.id)[0]||null;
  const stats  = plano?progressoModule.getStats(user.id,plano.id):null;
  const edital = plano?editaisModule.getById(plano.editalId):null;
  const today  = localDateKey();
  const td     = plano?.plan?.[today]||{topicos:[],reviews:[]};
  const tdDone = td.topicos.filter(t=>progressoModule.isDone(user.id,plano?.id,`${today}-${t.id}`)).length;
  const tdPend = td.topicos.length - tdDone;
  const xp     = plano ? gamificacaoModule.calcXP(user.id, plano.id) : 0;
  const nivel  = gamificacaoModule.getNivel(xp);
  const streak = plano ? gamificacaoModule.getStreakAtual(user.id, plano.id) : 0;
  const meta   = plano ? gamificacaoModule.getMetaSemanal(user.id, plano.id) : { feitas:0, meta:5 };
  const xpPct  = nivel.max===Infinity ? 100 : Math.round(((xp-nivel.min)/(nivel.max-nivel.min))*100);
  const metaPct= Math.min(100, meta.meta>0 ? Math.round(meta.feitas/meta.meta*100) : 0);
  function refresh() { setTick(t=>t+1); }
  return (
    <div>
      <div className="ph">
        <div><h1>Olá, {user.name.split(" ")[0]}! 📚</h1><p>Continue de onde parou</p></div>
        {plano&&tdPend>0&&<button className="btn btn-green" style={{fontSize:15,padding:"12px 22px"}} onClick={()=>setEstudarOpen(true)}>▶ Estudar Agora</button>}
      </div>

      {/* Gamification strip */}
      {plano&&(
        <div className="gami-grid">
          <div className="card-sm" style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:26,lineHeight:1}}>🔥</div>
            <div>
              <div style={{fontSize:24,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--amber)",lineHeight:1}}>{streak}</div>
              <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Dias seguidos</div>
            </div>
          </div>
          <div className="card-sm">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Nível {nivel.level}</div>
                <div style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:13}}>{nivel.emoji} {nivel.name}</div>
              </div>
              <div style={{fontSize:11,color:"var(--purple)",fontWeight:700}}>{xp} XP</div>
            </div>
            <div className="pbar"><div className="pbar-fill" style={{width:`${xpPct}%`,background:"var(--purple)"}}/></div>
          </div>
          <div className="card-sm">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontSize:10,color:"var(--t3)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Meta semanal</div>
                <div style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:13}}>🎯 {meta.feitas}/{meta.meta}</div>
              </div>
              <span className={`badge ${meta.feitas>=meta.meta?"bg":"bn"}`}>{metaPct}%</span>
            </div>
            <div className="pbar"><div className="pbar-fill" style={{width:`${metaPct}%`,background:"var(--blue)"}}/></div>
          </div>
        </div>
      )}

      {!plano?(
        <div className="card"><div className="empty">
          <div style={{fontSize:40,marginBottom:8}}>🎯</div>
          <h3>Nenhum plano ativo</h3>
          <p style={{marginBottom:16}}>Crie seu plano personalizado em minutos.</p>
          <button className="btn btn-green" onClick={()=>setPage("plano")}>🚀 Começar Hoje</button>
        </div></div>
      ):(
        <>
          <div className="g4 mb4">
            <div className="stat"><div className="stat-l">Hoje</div><div className="stat-v">{tdDone}/{td.topicos.length}</div><div className="stat-s">aulas</div></div>
            <div className="stat"><div className="stat-l">Total feitas</div><div className="stat-v" style={{color:"var(--green)"}}>{stats?.aulasFeitas}</div><div className="stat-s">de {stats?.totalAulas}</div></div>
            <div className="stat"><div className="stat-l">Progresso</div><div className="stat-v">{stats?.pct}%</div></div>
            <div className="stat"><div className="stat-l">Previsão</div><div className="stat-v" style={{fontSize:14,marginTop:6,color:"var(--amber)"}}>{stats?.previsao}</div></div>
          </div>
          <div className="g2">
            <div className="card">
              <div className="card-title">Progresso — {edital?.name}</div>
              <div className="row-b mb2 text-sm text-muted"><span>{stats?.aulasFeitas} concluídas</span><span>{stats?.pct}%</span></div>
              <PBar pct={stats?.pct||0}/>
              <div className="row mt3 text-xs text-dim" style={{gap:14}}>
                <span>✅ {stats?.aulasFeitas} feitas</span><span>⏳ {(stats?.totalAulas||0)-(stats?.aulasFeitas||0)} restantes</span><span>🔄 {stats?.reviewsFeitas} revisões</span>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Aulas de Hoje</div>
              {td.topicos.length===0?<p className="text-muted text-sm">Sem aulas hoje 🎉</p>:(
                <>
                  {td.topicos.slice(0,5).map((t,i)=>{
                    const done=progressoModule.isDone(user.id,plano.id,`${today}-${t.id}`);
                    return <div key={i} className={`topic-row ${done?"done":""}`}><div className="dot-c" style={{background:t.materiaColor}}/><span className="tr-name">{t.name}</span>{done&&<span className="badge bg" style={{fontSize:10}}>✓</span>}</div>;
                  })}
                  {tdPend>0&&<button className="btn btn-green mt3" style={{width:"100%"}} onClick={()=>setEstudarOpen(true)}>▶ Estudar Agora ({tdPend} pendente{tdPend!==1?"s":""})</button>}
                </>
              )}
            </div>
          </div>
        </>
      )}
      {estudarOpen&&plano&&<EstudarAgoraModal user={user} plano={plano} onClose={()=>{setEstudarOpen(false);refresh();}} onRefresh={refresh}/>}
    </div>
  );
}

function AlunoPlano({ user, refresh }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [tick, setTick] = useState(0);
  const [gerarEdital, setGerarEdital] = useState("");
  const [showEstudar2, setShowEstudar2] = useState(false);  // ← moved above conditional return
  const [showAdiantar, setShowAdiantar] = useState(false);
  const [adiantarQtd, setAdiantarQtd] = useState(2);
  const [expandedNote, setExpandedNote] = useState(null); // topicId whose note is expanded
  const [showRegerar, setShowRegerar] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(null); // topicId for PDF modal
  const plano   = planosModule.getByAluno(user.id)[0]||null;
  const editais = editaisModule.getByAluno(user.id);
  const today   = new Date(); today.setHours(0,0,0,0);

  function gerarPlano() {
    if (!gerarEdital) return;
    planosModule.generate(user.id,gerarEdital,{dias:[1,2,3,4,5],aulasPorDia:1});
    refresh();
  }
  function toggle(key) { if(!plano)return; progressoModule.toggle(user.id,plano.id,key); setTick(t=>t+1); }
  function getWeekDays(offset) {
    const mon=new Date(today); mon.setDate(today.getDate()-today.getDay()+1+offset*7);
    return Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return localDateKey(d);});
  }
  function getTopicMaterial(topicId) {
    const materiais = storage.get().materiais || [];
    return materiais.find(m => m.topicId === topicId && m.editalId === plano?.editalId);
  }
  const weekDays=getWeekDays(weekOffset);
  const wLabel=`${new Date(weekDays[0]+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} – ${new Date(weekDays[6]+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}`;

  if (!plano) return (
    <div>
      <div className="ph"><div><h1>Meu Plano</h1><p>Gere seu plano personalizado</p></div></div>
      {editais.length===0
        ? <div className="card"><div className="empty"><h3>Nenhum edital associado</h3><p>Peça ao seu coach para associar um edital.</p></div></div>
        : <AlunoOnboarding user={user} editais={editais} onGenerate={refresh}/>
      }
    </div>
  );

  const edital=editaisModule.getById(plano.editalId);
  const todayKeyP = localDateKey(today);
  const todayDataP = plano.plan[todayKeyP]||{topicos:[],reviews:[]};
  const todayDoneP = todayDataP.topicos.filter(t=>progressoModule.isDone(user.id,plano.id,`${todayKeyP}-${t.id}`)).length;
  const allTodayDone = todayDataP.topicos.length > 0 && todayDoneP === todayDataP.topicos.length;
  function handleAdiantar() {
    const moved = planosModule.adiantarAulas(plano.id, adiantarQtd);
    setShowAdiantar(false); setTick(t=>t+1); refresh();
    if (moved === 0) alert("Não há aulas futuras para adiantar.");
  }
  const getMaterialFiles = (topicId) => {
    const materiais = storage.get().materiais || [];
    const topic = materiais.find(m => m.topicId === topicId && m.editalId === plano?.editalId);

    // Suportar ambas as estruturas: nova (com files array) e antiga (com url direto)
    if (topic?.files && Array.isArray(topic.files)) {
      return topic.files;
    } else if (topic?.url) {
      // Converter estrutura antiga para nova
      return [{
        url: topic.url,
        filename: topic.filename,
        type: "Material",
        addedAt: topic.savedAt || new Date().toISOString()
      }];
    }
    return [];
  };

  const topicMaterials = showPdfModal ? getMaterialFiles(showPdfModal) : [];
  const topicName = plano?.plan ? Object.values(plano.plan).flatMap(d => d.topicos).find(t => t.id === showPdfModal)?.name : null;

  return (
    <div>
      {showPdfModal && (
        <div className="overlay" onClick={()=>setShowPdfModal(null)}>
          <div className="modal fi" style={{maxWidth:500,padding:"40px 30px"}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hd" style={{marginBottom:"30px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{topicName || "Materiais"}</h2>
              <button className="modal-x" onClick={()=>setShowPdfModal(null)}>✕</button>
            </div>
            {topicMaterials.length > 0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {topicMaterials.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding:"16px",
                      borderRadius:8,
                      background:"var(--blue-d)",
                      border:"1px solid var(--blue)",
                      textDecoration:"none",
                      display:"flex",
                      flexDirection:"column",
                      gap:4,
                      cursor:"pointer",
                      transition:"all 0.15s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "var(--blue)"}
                    onMouseLeave={(e) => e.target.style.background = "var(--blue-d)"}
                  >
                    <div style={{fontSize:13,fontWeight:600,color:"var(--blue)"}}>
                      📄 {file.type}
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)",wordBreak:"break-word"}}>
                      {file.filename}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,color:"var(--t3)"}}>
                <div style={{fontSize:40}}>⚠️</div>
                <p style={{margin:0,textAlign:"center"}}>Nenhum material disponível para este tópico.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {showEstudar2&&<EstudarAgoraModal user={user} plano={plano} onClose={()=>{setShowEstudar2(false);setTick(t=>t+1);refresh();}}/>}
      {showAdiantar&&(
        <div className="overlay" onClick={()=>setShowAdiantar(false)}>
          <div className="modal fi" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h2>⚡ Adiantar Aulas</h2><button className="modal-x" onClick={()=>setShowAdiantar(false)}>✕</button></div>
            <p style={{color:"var(--t2)",fontSize:13,marginBottom:20}}>Você completou todas as aulas de hoje! Quantas aulas dos próximos dias quer adiantar?</p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:24}}>
              <button onClick={()=>setAdiantarQtd(q=>Math.max(1,q-1))} style={{width:36,height:36,borderRadius:9,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:20,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:32,color:"var(--amber)",minWidth:48,textAlign:"center"}}>{adiantarQtd}</span>
              <button onClick={()=>setAdiantarQtd(q=>Math.min(10,q+1))} style={{width:36,height:36,borderRadius:9,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:20,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
            <button className="btn btn-green" style={{width:"100%"}} onClick={handleAdiantar}>⚡ Adiantar {adiantarQtd} aula{adiantarQtd!==1?"s":""}</button>
          </div>
        </div>
      )}
      {showRegerar&&(
        <div className="overlay" onClick={()=>setShowRegerar(false)}>
          <div className="modal fi" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h2>🔄 Regerar Plano</h2><button className="modal-x" onClick={()=>setShowRegerar(false)}>✕</button></div>
            <p style={{color:"var(--t2)",fontSize:13,marginBottom:20}}>Escolha como deseja regenerar seu plano de estudos:</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <button className="btn btn-green" style={{textAlign:"left",padding:"16px 18px",borderRadius:12,height:"auto",flexDirection:"column",alignItems:"flex-start",gap:4}} onClick={()=>{planosModule.regenerarFuturo(plano.id,user.id,plano.rotina);setShowRegerar(false);refresh();}}>
                <span style={{fontWeight:900,fontSize:14}}>📅 Continuar de onde parei</span>
                <span style={{fontSize:11,opacity:.8,fontWeight:400}}>Reagenda apenas as aulas não feitas a partir de hoje. Mantém todo o progresso e notas.</span>
              </button>
              <button className="btn" style={{background:"var(--s3)",border:"1.5px solid var(--b2)",color:"var(--t1)",textAlign:"left",padding:"16px 18px",borderRadius:12,height:"auto",flexDirection:"column",alignItems:"flex-start",gap:4}} onClick={()=>{planosModule.regenerarDoZero(plano.id,user.id,plano.rotina);setShowRegerar(false);refresh();}}>
                <span style={{fontWeight:900,fontSize:14}}>🔁 Regenerar do zero</span>
                <span style={{fontSize:11,opacity:.7,fontWeight:400}}>Recria o plano completo. O progresso já registrado é mantido no histórico.</span>
              </button>
              <button className="btn btn-ghost" onClick={()=>setShowRegerar(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div className="ph"><div><h1>Meu Plano</h1><p>{edital?.name}</p></div><div className="row" style={{gap:8}}><button className="btn btn-green btn-sm" style={{fontSize:13}} onClick={()=>setShowEstudar2(true)}>▶ Estudar Agora</button><button className="btn btn-ghost btn-sm" onClick={()=>setShowRegerar(true)}>🔄 Regerar</button><button className="btn btn-red btn-sm" onClick={()=>{if(window.confirm("Excluir o plano? Todo o progresso será perdido.")){ planosModule.delete(plano.id);refresh();}}}>🗑 Excluir</button></div></div>
      <div className="row mb4">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setWeekOffset(w=>w-1)}>◀</button>
        <span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,minWidth:200,textAlign:"center"}}>{wLabel}</span>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setWeekOffset(w=>w+1)}>▶</button>
        {weekOffset!==0&&<button className="btn btn-ghost btn-sm" onClick={()=>setWeekOffset(0)}>Hoje</button>}
      </div>
      {weekDays.map(dk=>{
        const d=plano.plan[dk]||{topicos:[],reviews:[]};
        const date=new Date(dk+"T00:00:00");
        const isToday=dk===localDateKey(today);
        return (
          <div key={dk} className={`day-card ${isToday?"today":""}`}>
            <div className="row-b mb3">
              <div><div style={{fontFamily:"Cabinet Grotesk",fontWeight:700,fontSize:14}}>{DAYS_FULL[date.getDay()]}</div><div className="text-xs text-dim">{date.toLocaleDateString("pt-BR")}</div></div>
              {isToday&&<span className="badge bg">Hoje</span>}
            </div>
            {d.topicos.length===0&&d.reviews.length===0&&<p className="text-sm text-muted">Nenhum conteúdo</p>}
            {d.topicos.length>0&&<div className="mb3">{d.topicos.map((t,i)=>{const key=`${dk}-${t.id}`;const done=progressoModule.isDone(user.id,plano.id,key);const material=getTopicMaterial(t.id);return(<div key={i} className={`topic-row ${done?"done":""}`}><div className="dot-c" style={{background:t.materiaColor}}/><span className="tr-name">{t.name}</span>{(t.materialUrl||material)&&<button onClick={()=>setShowPdfModal(t.id)} className="mat-link" style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",fontSize:11,color:"var(--blue)"}}>📎</button>}<span className="tr-tag">{t.materiaName}</span><button className={`ck-btn ${done?"ck":""}`} onClick={()=>toggle(key)}>{done&&<CheckIcon/>}</button></div>);})}</div>}
            {isToday&&allTodayDone&&<button className="adiantar-btn" onClick={()=>setShowAdiantar(true)}>⚡ Adiantar aulas de amanhã</button>}
            {d.reviews.length>0&&<div className="rev-sec"><div className="rev-lbl">Revisões</div>{d.reviews.map((r,i)=>{const key=`${dk}-${r.id}-rev`;const done=progressoModule.isDone(user.id,plano.id,key);const nota=progressoModule.getNote(user.id,plano.id,r.id);const isOpen=expandedNote===`${dk}-${r.id}`;return(<div key={i}><div className={`topic-row ${done?"done":""}`}><div className="dot-c" style={{background:r.materiaColor}}/><span className="tr-name">{r.name}</span><span className="tr-tag">🕐 {r.reviewInterval}d</span>{nota&&<button onClick={()=>setExpandedNote(isOpen?null:`${dk}-${r.id}`)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:isOpen?"var(--amber)":"var(--t3)",padding:"0 4px",flexShrink:0}} title="Ver anotações">📝</button>}<button className={`ck-btn ${done?"ck":""}`} onClick={()=>toggle(key)}>{done&&<CheckIcon/>}</button></div>{isOpen&&nota&&<div style={{margin:"6px 0 8px 24px",padding:"10px 13px",background:"var(--s2)",borderRadius:9,borderLeft:"3px solid var(--amber)",fontSize:12,color:"var(--t2)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{nota}</div>}</div>);})}</div>}
          </div>
        );
      })}
    </div>
  );
}

function AlunoRotina({ user, refresh }) {
  const plano = planosModule.getByAluno(user.id)[0]||null;
  // Initialize diasConfig from saved rotina (support both old and new format)
  function initDiasConfig() {
    if (plano?.rotina?.diasConfig) return plano.rotina.diasConfig;
    if (plano?.rotina?.dias) {
      const cfg = {0:0,1:0,2:0,3:0,4:0,5:0,6:0};
      plano.rotina.dias.forEach(d => { cfg[d] = plano.rotina.aulasPorDia || 1; });
      return cfg;
    }
    return {0:0,1:2,2:2,3:2,4:2,5:2,6:0};
  }
  const [diasConfig, setDiasConfig] = useState(initDiasConfig);
  const [maxRevisoes, setMaxRevisoes] = useState(plano?.rotina?.maxRevisoesPorDia || 5);
  const [saved, setSaved] = useState(false);
  const [ltick, setLtick] = useState(0);
  const logs = logModule.getByUser(user.id);

  function setDayAulas(dow, val) {
    setDiasConfig(prev => ({ ...prev, [dow]: Math.max(0, Math.min(5, val)) }));
    setSaved(false);
  }
  const aulasSem = Object.values(diasConfig).reduce((a,n) => a+n, 0);
  function handleSave() {
    if (!plano || aulasSem===0) return;
    planosModule.updateRotina(plano.id, user.id, { diasConfig, maxRevisoesPorDia: maxRevisoes });
    refresh(); setLtick(t=>t+1); setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  }

  if (!plano) return (
    <div><div className="ph"><div><h1>Rotina</h1></div></div><div className="card"><div className="empty"><h3>Nenhum plano ativo</h3><p>Gere um plano primeiro.</p></div></div></div>
  );

  return (
    <div>
      <div className="ph"><div><h1>Rotina de Estudos</h1><p>Configure sua agenda semanal</p></div></div>
      <div className="g2">
        <div className="card">
          <div className="card-title">Aulas por dia</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {DAYS_FULL.map((name, dow) => {
              const val = diasConfig[dow] || 0;
              const ativo = val > 0;
              return (
                <div key={dow} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${ativo?"var(--green)":"var(--b2)"}`,background:ativo?"var(--s2)":"var(--s1)",transition:"all .15s"}}>
                  <span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,fontSize:13,width:60,color:ativo?"var(--t1)":"var(--t3)"}}>{name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                    <button onClick={()=>setDayAulas(dow,val-1)} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}} disabled={val===0}>−</button>
                    <span style={{width:28,textAlign:"center",fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:15,color:ativo?"var(--green)":"var(--t3)"}}>{val===0?"—":val}</span>
                    <button onClick={()=>setDayAulas(dow,val+1)} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}} disabled={val===5}>+</button>
                  </div>
                  <span style={{width:70,fontSize:11,color:ativo?"var(--t2)":"var(--t3)",textAlign:"right"}}>{ativo?`${val} aula${val>1?"s":""}` : "folga"}</span>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:12,color:"var(--t3)",marginBottom:12}}>{aulasSem} aula{aulasSem!==1?"s":""}/semana</div>
          <div style={{padding:"14px 16px",borderRadius:10,background:"var(--s2)",border:"1px solid var(--b1)",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--t2)",marginBottom:10}}>🔁 Máx. revisões por dia</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>{setMaxRevisoes(r=>Math.max(1,r-1));setSaved(false);}} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:20,color:"var(--amber)",minWidth:32,textAlign:"center"}}>{maxRevisoes}</span>
              <button onClick={()=>{setMaxRevisoes(r=>Math.min(20,r+1));setSaved(false);}} style={{width:30,height:30,borderRadius:7,border:"1.5px solid var(--b2)",background:"var(--s3)",cursor:"pointer",fontSize:16,fontWeight:700,color:"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              <span style={{fontSize:11,color:"var(--t3)",marginLeft:4}}>revisões/dia — excedente vai pro próximo dia</span>
            </div>
          </div>
          {saved&&<div className="alert alert-green mb3">✓ Rotina atualizada! Plano regenerado.</div>}
          <button className="btn btn-green" disabled={aulasSem===0} onClick={handleSave}>Salvar Rotina</button>
        </div>
        <div className="card">
          <div className="card-title">Histórico de Alterações</div>
          {logs.length===0?<p className="text-muted text-sm">Nenhuma alteração registrada.</p>:[...logs].reverse().slice(0,10).map(l=>(
            <div key={l.id} style={{padding:"8px 0",borderBottom:"1px solid var(--b1)"}}>
              <div className="text-sm fw6">{l.message}</div>
              <div className="text-xs text-dim">{new Date(l.createdAt).toLocaleString("pt-BR")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlunoProgresso({ user }) {
  const plano  = planosModule.getByAluno(user.id)[0]||null;
  const stats  = plano?progressoModule.getStats(user.id,plano.id):null;
  const edital = plano?editaisModule.getById(plano.editalId):null;
  if (!plano||!stats) return (
    <div><div className="ph"><div><h1>Meu Progresso</h1></div></div><div className="card"><div className="empty"><h3>Nenhum plano ativo</h3></div></div></div>
  );
  return (
    <div>
      <div className="ph"><div><h1>Meu Progresso</h1><p>{edital?.name}</p></div></div>
      <div className="g4 mb4">
        <div className="stat"><div className="stat-l">Aulas feitas</div><div className="stat-v" style={{color:"var(--green)"}}>{stats.aulasFeitas}</div><div className="stat-s">de {stats.totalAulas}</div></div>
        <div className="stat"><div className="stat-l">Revisões</div><div className="stat-v" style={{color:"var(--amber)"}}>{stats.reviewsFeitas}</div><div className="stat-s">de {stats.totalReviews}</div></div>
        <div className="stat"><div className="stat-l">Conclusão</div><div className="stat-v">{stats.pct}%</div></div>
        <div className="stat"><div className="stat-l">Previsão</div><div className="stat-v" style={{fontSize:14,marginTop:6,color:"var(--amber)"}}>{stats.previsao}</div></div>
      </div>
      <div className="card mb4"><div className="card-title">Geral</div><div className="row-b mb2 text-sm"><span className="fw6">{edital?.name}</span><span className="text-muted">{stats.pct}%</span></div><PBar pct={stats.pct}/></div>
      <div className="card">
        <div className="card-title">Por Matéria</div>
        {(edital?.materias||[]).map(m=>{
          const mTop=Object.values(plano.plan).flatMap(d=>d.topicos.filter(t=>t.materiaId===m.id));
          const mFei=mTop.filter(t=>{const dk=Object.entries(plano.plan).find(([,d])=>d.topicos.some(tp=>tp.id===t.id))?.[0];return dk&&progressoModule.isDone(user.id,plano.id,`${dk}-${t.id}`);}).length;
          const pct=mTop.length?Math.round((mFei/mTop.length)*100):0;
          return (
            <div key={m.id} style={{marginBottom:16}}>
              <div className="row-b mb2"><div className="row"><div className="dot-c" style={{background:m.color}}/><span className="fw6">{m.name}</span></div><span className="text-sm text-muted">{mFei}/{mTop.length} — {pct}%</span></div>
              <PBar pct={pct} color={m.color}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// ALUNO: Conteúdos — Visualizar todos os materiais disponíveis
// ============================================================
function AlunoConteudos({ user }) {
  const [showPdfModal, setShowPdfModal] = useState(null);
  const plano = planosModule.getByAluno(user.id)[0] || null;
  const editais = editaisModule.getByAluno(user.id);
  const edital = plano ? editaisModule.getById(plano.editalId) : null;

  if (!plano || !edital) {
    return (
      <div>
        <div className="ph"><div><h1>📚 Conteúdos</h1><p>Materiais disponíveis para estudo</p></div></div>
        <div className="card"><div className="empty"><h3>Nenhum plano ativo</h3><p>Gere um plano para acessar os materiais.</p></div></div>
      </div>
    );
  }

  // Obter todos os materiais disponíveis
  const materiais = storage.get().materiais || [];
  const materiaisDoEdital = materiais.filter(m => m.editalId === edital.id);

  // Construir mapa de topicos com materiais
  const topicosComMaterial = new Map();
  edital.materias?.forEach(materia => {
    materia.topicos?.forEach(topic => {
      const hasMaterial = materiaisDoEdital.find(m => m.topicId === topic.id);
      if (hasMaterial) {
        topicosComMaterial.set(topic.id, {
          ...topic,
          materiaId: materia.id,
          materiaName: materia.name,
          materiaColor: materia.color,
          material: hasMaterial
        });
      }
    });
  });

  const getMaterialFiles = (topicId) => {
    const materiais = storage.get().materiais || [];
    const topic = materiais.find(m => m.topicId === topicId && m.editalId === edital?.id);

    // Suportar ambas as estruturas: nova (com files array) e antiga (com url direto)
    if (topic?.files && Array.isArray(topic.files)) {
      return topic.files;
    } else if (topic?.url) {
      // Converter estrutura antiga para nova
      return [{
        url: topic.url,
        filename: topic.filename,
        type: "Material",
        addedAt: topic.savedAt || new Date().toISOString()
      }];
    }
    return [];
  };

  const topicMaterials = showPdfModal ? getMaterialFiles(showPdfModal) : [];

  // Encontrar o nome do tópico selecionado
  const selectedTopicName = showPdfModal ? Array.from(topicosComMaterial.values()).find(t => t.id === showPdfModal)?.name : null;

  return (
    <div>
      {showPdfModal && (
        <div className="overlay" onClick={() => setShowPdfModal(null)}>
          <div className="modal fi" style={{maxWidth:500,padding:"40px 30px"}} onClick={e => e.stopPropagation()}>
            <div className="modal-hd" style={{marginBottom:"30px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{selectedTopicName || "Materiais"}</h2>
              <button className="modal-x" onClick={() => setShowPdfModal(null)}>✕</button>
            </div>
            {topicMaterials.length > 0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {topicMaterials.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding:"16px",
                      borderRadius:8,
                      background:"var(--blue-d)",
                      border:"1px solid var(--blue)",
                      textDecoration:"none",
                      display:"flex",
                      flexDirection:"column",
                      gap:4,
                      cursor:"pointer",
                      transition:"all 0.15s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "var(--blue)"}
                    onMouseLeave={(e) => e.target.style.background = "var(--blue-d)"}
                  >
                    <div style={{fontSize:13,fontWeight:600,color:"var(--blue)"}}>
                      📄 {file.type}
                    </div>
                    <div style={{fontSize:11,color:"var(--t3)",wordBreak:"break-word"}}>
                      {file.filename}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,color:"var(--t3)"}}>
                <div style={{fontSize:40}}>⚠️</div>
                <p style={{margin:0,textAlign:"center"}}>Nenhum material disponível para este tópico.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="ph"><div><h1>📚 Conteúdos</h1><p>Materiais disponíveis para estudo — {edital.name}</p></div></div>

      {topicosComMaterial.size === 0 ? (
        <div className="card"><div className="empty"><h3>Nenhum conteúdo disponível</h3><p>Seu coach ainda não adicionou materiais.</p></div></div>
      ) : (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Materiais por Matéria</div>
          <div style={{ display: "grid", gap: 24 }}>
            {edital.materias?.map(materia => {
              const topicosMateria = Array.from(topicosComMaterial.values()).filter(t => t.materiaId === materia.id);
              if (topicosMateria.length === 0) return null;

              return (
                <div key={materia.id} style={{ borderLeft: `4px solid ${materia.color}`, paddingLeft: 16 }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>
                    {materia.name}
                  </h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {topicosMateria.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => setShowPdfModal(topic.id)}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: "var(--s2)",
                          border: "1px solid var(--b2)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textAlign: "left",
                          color: "inherit",
                          fontFamily: "inherit",
                          fontSize: "inherit"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "var(--s3)"}
                        onMouseLeave={(e) => e.target.style.background = "var(--s2)"}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>
                            {topic.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--t3)" }}>
                            📄 {topic.material.filename}
                          </div>
                        </div>
                        <div style={{ fontSize: 18, flexShrink: 0 }}>📎</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN: Debug — simulação de tempo
// ============================================================
function AdminDebug() {
  const today = new Date(); today.setHours(0,0,0,0);
  const [simDate, setSimDate] = useState(localDateKey(today));
  const [selectedAluno, setSelectedAluno] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const alunos = usersModule.getAlunos();
  const planos = storage.get().planos;

  // Derived simulated date from manual offset
  const baseDate = new Date(simDate + "T00:00:00");
  const simDt = new Date(baseDate); simDt.setDate(simDt.getDate() + dayOffset);
  const simKey = localDateKey(simDt);
  const diffDays = Math.round((simDt - today) / 86400000);

  const aluno = alunos.find(a => a.id === selectedAluno);
  const plano = aluno ? planos.find(p => p.alunoId === aluno.id) : null;
  const edital = plano ? editaisModule.getById(plano.editalId) : null;
  const dayData = plano?.plan?.[simKey] || { topicos:[], reviews:[] };

  // Compute cumulative stats up to simKey
  function statsUpTo(key) {
    if (!plano) return null;
    const prog = storage.get().progresso.filter(p => p.alunoId === selectedAluno && p.planoId === plano.id && p.done);
    const totalAulas = Object.values(plano.plan).reduce((a,d) => a+d.topicos.length, 0);
    const aulasFeitas = prog.filter(p => {
      const dk = p.key.split("-").slice(0,3).join("-");
      return dk <= key && !p.key.endsWith("-rev");
    }).length;
    const pct = totalAulas ? Math.round((aulasFeitas/totalAulas)*100) : 0;
    return { totalAulas, aulasFeitas, pct };
  }

  const stats = statsUpTo(simKey);
  const xp = plano ? gamificacaoModule.calcXP(selectedAluno, plano.id) : 0;
  const nivel = gamificacaoModule.getNivel(xp);

  // Week view centered on simKey
  function getWeek() {
    const dow = simDt.getDay();
    const mon = new Date(simDt); mon.setDate(simDt.getDate() - ((dow+6)%7));
    return Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return localDateKey(d);});
  }
  const weekKeys = getWeek();

  function jumpDays(n) { setDayOffset(o => o + n); }
  function resetDate() { setSimDate(localDateKey(today)); setDayOffset(0); }

  const diffLabel = diffDays === 0 ? "🟢 Hoje (real)" : diffDays > 0 ? `+${diffDays} dias no futuro` : `${Math.abs(diffDays)} dias no passado`;

  return (
    <div>
      <div className="ph">
        <div><h1>🔧 Debug — Simulador de Tempo</h1><p>Simule datas e veja o comportamento do plano</p></div>
        <button className="btn btn-ghost btn-sm" onClick={resetDate}>🔄 Voltar ao hoje</button>
      </div>

      {/* Controls */}
      <div className="card mb4">
        <div className="card-title">Configuração</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div className="form-group" style={{margin:0}}>
            <label className="lbl">Aluno</label>
            <select className="inp" value={selectedAluno} onChange={e=>setSelectedAluno(e.target.value)}>
              <option value="">— selecione —</option>
              {alunos.map(a=><option key={a.id} value={a.id}>{a.name}{planos.some(p=>p.alunoId===a.id)?"":" (sem plano)"}</option>)}
            </select>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label className="lbl">Data base</label>
            <input className="inp" type="date" value={simDate} onChange={e=>{setSimDate(e.target.value);setDayOffset(0);}}/>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"var(--t3)"}}>Navegar:</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>jumpDays(-7)}>◀◀ -7d</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>jumpDays(-1)}>◀ -1d</button>
          <div style={{background:"var(--s2)",border:"1.5px solid var(--b2)",borderRadius:10,padding:"8px 18px",textAlign:"center",minWidth:200}}>
            <div style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:18,color:"var(--green)"}}>{simDt.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}</div>
            <div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>{diffLabel}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>jumpDays(1)}>+1d ▶</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>jumpDays(7)}>+7d ▶▶</button>
        </div>
      </div>

      {!selectedAluno ? (
        <div className="card"><div className="empty"><h3>Selecione um aluno para simular</h3></div></div>
      ) : !plano ? (
        <div className="card"><div className="empty"><h3>Aluno sem plano gerado</h3></div></div>
      ) : (
        <>
          {/* Stats snapshot */}
          <div className="g4 mb4">
            <div className="stat"><div className="stat-l">Data simulada</div><div className="stat-v" style={{fontSize:13,color:"var(--amber)",marginTop:4}}>{simDt.toLocaleDateString("pt-BR")}</div></div>
            <div className="stat"><div className="stat-l">Aulas concluídas</div><div className="stat-v" style={{color:"var(--green)"}}>{stats?.aulasFeitas}</div><div className="stat-s">de {stats?.totalAulas}</div></div>
            <div className="stat"><div className="stat-l">Progresso</div><div className="stat-v">{stats?.pct}%</div></div>
            <div className="stat"><div className="stat-l">XP / Nível</div><div className="stat-v" style={{fontSize:13}}>{xp} XP</div><div className="stat-s">{nivel.emoji} {nivel.name}</div></div>
          </div>

          {/* Day detail */}
          <div className="g2 mb4">
            <div className="card">
              <div className="card-title">📅 {simDt.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}</div>
              {dayData.topicos.length===0&&dayData.reviews.length===0 ? (
                <p className="text-muted text-sm">Sem conteúdo programado — folga ou dia não configurado.</p>
              ) : (
                <>
                  {dayData.topicos.length>0&&(
                    <div className="mb3">
                      <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Aulas ({dayData.topicos.length})</div>
                      {dayData.topicos.map((t,i)=>{
                        const key=`${simKey}-${t.id}`;
                        const done=progressoModule.isDone(selectedAluno,plano.id,key);
                        return <div key={i} className={`topic-row ${done?"done":""}`}><div className="dot-c" style={{background:t.materiaColor}}/><span className="tr-name">{t.name}</span><span className="tr-tag">{t.materiaName}</span>{done&&<span className="badge bg" style={{fontSize:10}}>✓</span>}</div>;
                      })}
                    </div>
                  )}
                  {dayData.reviews.length>0&&(
                    <div className="rev-sec">
                      <div className="rev-lbl">Revisões ({dayData.reviews.length})</div>
                      {dayData.reviews.map((r,i)=>{
                        const key=`${simKey}-${r.id}-rev`;
                        const done=progressoModule.isDone(selectedAluno,plano.id,key);
                        return <div key={i} className={`topic-row ${done?"done":""}`}><div className="dot-c" style={{background:r.materiaColor}}/><span className="tr-name">{r.name}</span><span className="tr-tag">🕐 {r.reviewInterval}d</span>{done&&<span className="badge bg" style={{fontSize:10}}>✓</span>}</div>;
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Week overview */}
            <div className="card">
              <div className="card-title">Semana simulada</div>
              {weekKeys.map(dk=>{
                const dd = plano.plan[dk]||{topicos:[],reviews:[]};
                const dDate = new Date(dk+"T00:00:00");
                const isSim = dk === simKey;
                const isReal = dk === localDateKey(today);
                return (
                  <div key={dk} onClick={()=>{ const diff=Math.round((dDate-today)/86400000); setDayOffset(diff); }}
                    style={{padding:"8px 10px",borderRadius:8,marginBottom:4,cursor:"pointer",border:`1.5px solid ${isSim?"var(--green)":isReal?"var(--amber)":"var(--b1)"}`,background:isSim?"var(--green-d)":isReal?"var(--amber-d)":"transparent",transition:"all .15s"}}>
                    <div className="row-b">
                      <div style={{fontFamily:"Cabinet Grotesk",fontWeight:700,fontSize:12,color:isSim?"var(--green)":isReal?"var(--amber)":"var(--t2)"}}>
                        {DAYS_FULL[dDate.getDay()].slice(0,3)} {dDate.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}
                        {isReal&&<span style={{marginLeft:5,fontSize:10,opacity:.7}}>(hoje)</span>}
                      </div>
                      <div style={{fontSize:11,color:"var(--t3)"}}>
                        {dd.topicos.length>0&&<span>{dd.topicos.length}📖 </span>}
                        {dd.reviews.length>0&&<span>{dd.reviews.length}🔁</span>}
                        {dd.topicos.length===0&&dd.reviews.length===0&&<span style={{color:"var(--t3)"}}>folga</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edital info */}
          <div className="card">
            <div className="card-title">Plano — {edital?.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--blue)"}}>{Object.keys(plano.plan).length}</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>Dias no plano</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--purple)"}}>{Object.values(plano.plan).reduce((a,d)=>a+d.topicos.length,0)}</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>Total aulas</div></div>
              <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,fontFamily:"Cabinet Grotesk",color:"var(--amber)"}}>{Object.values(plano.plan).reduce((a,d)=>a+d.reviews.length,0)}</div><div style={{fontSize:11,color:"var(--t3)",fontWeight:700,textTransform:"uppercase"}}>Total revisões</div></div>
            </div>
            <PBar pct={stats?.pct||0} color="var(--green)"/>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// ALUNO: Simulados
// ============================================================
function AlunoSimulados({ user, refresh }) {
  const editais = editaisModule.getByAluno(user.id);
  const [editalId, setEditalId] = useState(editais[0]?.id || "");
  const [resolvendo, setResolvendo] = useState(null);

  const edital = editaisModule.getById(editalId);
  const simulados = edital ? simuladosModule.getByEdital(editalId) : [];

  return (
    <div>
      <div className="ph"><div><h1>📝 Simulados</h1><p>Resolva simulados e pratique</p></div></div>

      {editais.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--t2)" }}>
            Selecione um edital:
          </label>
          <select
            value={editalId}
            onChange={(e) => setEditalId(e.target.value)}
            style={{
              maxWidth: 350,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--b2)",
              background: "var(--s2)",
              color: "var(--t1)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {editais.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      )}

      {!edital ? (
        <div className="card"><div className="empty"><h3>Nenhum edital disponível</h3></div></div>
      ) : simulados.length === 0 ? (
        <div className="card"><div className="empty"><h3>Nenhum simulado disponível para este edital</h3></div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {simulados.map(sim => {
            const tentativas = tentativasModule.getBySimuladoAluno(sim.id, user.id);
            const finalizadas = tentativas.filter(t => t.status === "finalizada");
            const emAndamento = tentativas.find(t => t.status === "em_andamento");

            return (
              <div
                key={sim.id}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--s2)",
                  border: "1px solid var(--b2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
                    {sim.nome}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                    {sim.tipo === "geral" ? "Simulado Geral" : "Simulado Específico"}
                  </div>
                  {sim.descricao && (
                    <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8 }}>
                      {sim.descricao}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 11, color: "var(--t3)" }}>
                  {finalizadas.length > 0 && (
                    <div>✓ {finalizadas.length} tentativa{finalizadas.length > 1 ? 's' : ''} finalizada{finalizadas.length > 1 ? 's' : ''}</div>
                  )}
                  {emAndamento && (
                    <div style={{ color: "var(--amber)" }}>⏳ Tentativa em andamento</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  {emAndamento ? (
                    <button
                      onClick={() => setResolvendo(emAndamento.id)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "var(--amber)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const nova = tentativasModule.create(sim.id, user.id);
                        setResolvendo(nova.id);
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "var(--blue)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resolvendo && (
        <ResolverSimulado tentativaId={resolvendo} onVoltar={() => { setResolvendo(null); refresh?.(); }} />
      )}
    </div>
  );
}

// Componente para resolver simulado
function ResolverSimulado({ tentativaId, onVoltar }) {
  const tentativa = tentativasModule.getById(tentativaId);
  if (!tentativa) return null;

  const simulado = simuladosModule.getById(tentativa.simuladoId);
  const questoes = questoesModule.getBySimulado(tentativa.simuladoId);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [tempoDecorridoSegundos, setTempoDecorridoSegundos] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(
    simulado?.tempoLimiteMinutos ? simulado.tempoLimiteMinutos * 60 : null
  );
  const [finalizado, setFinalizado] = useState(false);
  const q = questoes[questaoAtual];

  useEffect(() => {
    if (finalizado || !tempoRestante) return;
    const interval = setInterval(() => {
      setTempoDecorridoSegundos(prev => prev + 1);
      setTempoRestante(prev => {
        if (prev <= 1) {
          setFinalizado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [finalizado, tempoRestante]);

  if (!q) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: "var(--s1)", padding: 24, borderRadius: 12, maxWidth: 400, width: "90%"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", marginBottom: 16 }}>
            Simulado concluído!
          </div>
          <div style={{ color: "var(--t2)", marginBottom: 20 }}>
            Obrigado por resolver este simulado. Você pode resolver novamente a qualquer momento.
          </div>
          <button
            onClick={() => {
              tentativasModule.finalizar(tentativaId, tempoDecorridoSegundos);
              onVoltar();
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "none",
              background: "var(--blue)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, overflowY: "auto"
    }}>
      <div style={{
        background: "var(--s1)", padding: 24, borderRadius: 12, maxWidth: 600, width: "90%",
        margin: "20px auto"
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--t3)" }}>
            Questão {questaoAtual + 1} de {questoes.length}
          </div>
          {tempoRestante !== null && (
            <div style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: tempoRestante <= 60 ? "var(--red)" : "var(--s2)",
              color: tempoRestante <= 60 ? "white" : "var(--amber)",
              fontSize: 12,
              fontWeight: 600
            }}>
              ⏱️ {Math.floor(tempoRestante / 60)}:{String(tempoRestante % 60).padStart(2, "0")}
            </div>
          )}
        </div>
        <div style={{
          height: 4, background: "var(--b2)", borderRadius: 2,
          overflow: "hidden", marginBottom: 20
        }}>
          <div style={{
            height: "100%", background: "var(--blue)",
            width: `${((questaoAtual + 1) / questoes.length) * 100}%`
          }}></div>
        </div>

        {q.textBase && (
          <div style={{ marginBottom: 24, padding: 16, borderRadius: 8, background: "var(--s2)", border: "1px solid var(--b2)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", marginBottom: 12, textTransform: "uppercase" }}>
              📚 Texto
            </div>
            <div style={{
              fontSize: 13,
              color: "var(--t1)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              {q.textBase}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)", marginBottom: 16 }}>
            {q.enunciado}
          </div>

          {q.tipo === "ce" ? (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  tentativasModule.responder(tentativaId, q.id, "C");
                  setQuestaoAtual(questaoAtual + 1);
                }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 6,
                  border: "2px solid var(--green)", background: "transparent",
                  color: "var(--green)", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s"
                }}
              >
                ✓ Certo
              </button>
              <button
                onClick={() => {
                  tentativasModule.responder(tentativaId, q.id, "E");
                  setQuestaoAtual(questaoAtual + 1);
                }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 6,
                  border: "2px solid var(--red)", background: "transparent",
                  color: "var(--red)", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s"
                }}
              >
                ✗ Errado
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.alternativas.map((alt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    tentativasModule.responder(tentativaId, q.id, alt);
                    setQuestaoAtual(questaoAtual + 1);
                  }}
                  style={{
                    padding: "12px", borderRadius: 6,
                    border: "1px solid var(--b2)", background: "var(--s2)",
                    color: "var(--t1)", fontSize: 13,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s"
                  }}
                  onMouseOver={(e) => { e.target.style.background = "var(--s3)"; }}
                  onMouseOut={(e) => { e.target.style.background = "var(--s2)"; }}
                >
                  {String.fromCharCode(65 + i)}. {alt}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            tentativasModule.salvarTempoDecorrido(tentativaId, tempoDecorridoSegundos);
            onVoltar();
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid var(--b2)",
            background: "transparent",
            color: "var(--t2)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Sair e salvar progresso
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ALUNO: Ranking (visão do aluno — vê a si mesmo no ranking)
// ============================================================
function AlunoRanking({ user }) {
  const editais = editaisModule.getByAluno(user.id);
  const [editalId, setEditalId] = useState(editais[0]?.id || "");
  const planos = storage.get().planos;

  const edital = editaisModule.getById(editalId);
  if (!edital) return (
    <div><div className="ph"><div><h1>🏆 Ranking</h1></div></div>
    <div className="card"><div className="empty"><h3>Nenhum edital associado</h3></div></div></div>
  );

  // Pega todos os alunos que têm plano neste edital
  const todosAlunos = usersModule.getAlunos().filter(a => planos.some(p => p.alunoId === a.id && p.editalId === editalId));

  const ranking = todosAlunos.map(a => {
    const plano = planos.find(p => p.alunoId === a.id && p.editalId === editalId);
    const xp = plano ? gamificacaoModule.calcXP(a.id, plano.id) : 0;
    const stats = plano ? progressoModule.getStats(a.id, plano.id) : null;
    const streak = plano ? gamificacaoModule.getStreakAtual(a.id, plano.id) : 0;
    const nivel = gamificacaoModule.getNivel(xp);
    return { aluno: a, xp, aulas: stats?.aulasFeitas || 0, streak, nivel, pct: stats?.pct || 0, isMe: a.id === user.id };
  }).sort((a, b) => b.xp - a.xp || b.aulas - a.aulas);

  const posClass = (i) => i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
  const posEmoji = (i) => i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
  const myPos = ranking.findIndex(r => r.isMe);

  return (
    <div>
      <div className="ph"><div><h1>🏆 Ranking</h1><p>Sua posição entre os colegas</p></div></div>
      {editais.length > 1 && (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {editais.map(e => (
            <button key={e.id} className={`preset-btn${editalId===e.id?" active":""}`} onClick={()=>setEditalId(e.id)}>{e.name}</button>
          ))}
        </div>
      )}
      {myPos >= 0 && (
        <div style={{background:"var(--green-d)",border:"1.5px solid var(--green)",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:32}}>{posEmoji(myPos)||`#${myPos+1}`}</div>
          <div>
            <div style={{fontFamily:"Cabinet Grotesk",fontWeight:900,fontSize:18,color:"var(--green)"}}>Você está em {myPos===0?"1º lugar":`${myPos+1}º lugar`}!</div>
            <div style={{fontSize:12,color:"var(--t2)",marginTop:2}}>{ranking[myPos].xp} XP · {ranking[myPos].aulas} aulas concluídas</div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="card-title" style={{marginBottom:16}}>{edital.name}</div>
        {ranking.length === 0 ? (
          <p className="text-muted text-sm">Nenhum colega com plano neste edital ainda.</p>
        ) : (
          <table className="rank-table">
            <thead>
              <tr>
                <th style={{width:50}}>#</th>
                <th>Aluno</th>
                <th>Nível</th>
                <th>XP</th>
                <th>Aulas</th>
                <th>🔥</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.aluno.id} style={r.isMe ? {background:"var(--green-d)"} : {}}>
                  <td><div className={`rank-pos ${posClass(i)}`}>{posEmoji(i)||`${i+1}`}</div></td>
                  <td>
                    <div className="fw6" style={r.isMe?{color:"var(--green)"}:{}}>{r.aluno.name}{r.isMe&&" (você)"}</div>
                  </td>
                  <td><span className="badge bn">{r.nivel.emoji} {r.nivel.name}</span></td>
                  <td><span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,color:"var(--purple)"}}>{r.xp}</span></td>
                  <td><span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,color:"var(--green)"}}>{r.aulas}</span></td>
                  <td><span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,color:"var(--amber)"}}>{r.streak}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// COACH: Upload de Conteúdo/Materiais
// ============================================================
function CoachConteudo({ user, refresh }) {
  const editais = editaisModule.getByCoach(user.id);
  const [editalId, setEditalId] = useState(editais[0]?.id || "");
  const [selectedEditaisForUpload, setSelectedEditaisForUpload] = useState(new Set([editais[0]?.id || ""]));
  const [urlInput, setUrlInput] = useState({});
  const [fileTypeInput, setFileTypeInput] = useState({});
  const [savingUrl, setSavingUrl] = useState({});
  const [urlError, setUrlError] = useState("");
  const [urlSuccess, setUrlSuccess] = useState("");

  const toggleEditalSelection = (editalIdToToggle) => {
    const newSelected = new Set(selectedEditaisForUpload);
    if (newSelected.has(editalIdToToggle)) {
      newSelected.delete(editalIdToToggle);
    } else {
      newSelected.add(editalIdToToggle);
    }
    setSelectedEditaisForUpload(newSelected);
  };

  const edital = editaisModule.getById(editalId);

  const handleSaveUrl = (topicId, topicName) => {
    const url = urlInput[topicId]?.trim();
    const fileType = fileTypeInput[topicId]?.trim() || "Material";

    if (!url) {
      setUrlError("Insira um URL válido");
      setTimeout(() => setUrlError(""), 3000);
      return;
    }

    if (selectedEditaisForUpload.size === 0) {
      setUrlError("Selecione pelo menos um edital");
      setTimeout(() => setUrlError(""), 3000);
      return;
    }

    setSavingUrl(s => ({ ...s, [topicId]: true }));
    setUrlError("");
    setUrlSuccess("");

    try {
      // Extrair o nome do arquivo do URL
      const filename = url.split('/').pop() || url;
      const newFile = { url, filename, type: fileType, addedAt: new Date().toISOString() };

      // Buscar ou criar entrada de materiais para este tópico em MÚLTIPLOS editais
      const materiais = storage.get().materiais || [];

      // Para cada edital selecionado, salvar o arquivo
      selectedEditaisForUpload.forEach(selectedEditalId => {
        let existing = materiais.find(m => m.topicId === topicId && m.editalId === selectedEditalId);

        if (existing) {
          // Adicionar à lista de arquivos existente
          existing.files = existing.files || [];
          existing.files.push(newFile);
        } else {
          // Criar novo registro
          materiais.push({
            topicId,
            editalId: selectedEditalId,
            topicName,
            files: [newFile]
          });
        }
      });

      storage.get().materiais = materiais;
      persistToSupabase(storage.get());

      const editaisCount = selectedEditaisForUpload.size;
      setUrlSuccess(`Arquivo "${fileType}" adicionado em ${editaisCount} edital${editaisCount > 1 ? 'is' : ''}!`);
      setTimeout(() => setUrlSuccess(""), 3000);
      setUrlInput(u => ({ ...u, [topicId]: "" }));
      setFileTypeInput(u => ({ ...u, [topicId]: "" }));
      refresh?.();
    } catch (err) {
      setUrlError(`Erro: ${err.message}`);
    } finally {
      setSavingUrl(s => ({ ...s, [topicId]: false }));
    }
  };

  const handleRemoveFile = (topicId, fileIndex) => {
    const materiais = storage.get().materiais || [];
    const existing = materiais.find(m => m.topicId === topicId && m.editalId === editalId);

    if (existing) {
      existing.files = existing.files || [];
      existing.files.splice(fileIndex, 1);

      // Se não houver mais arquivos, remover o registro
      if (existing.files.length === 0) {
        const filtered = materiais.filter(m => !(m.topicId === topicId && m.editalId === editalId));
        storage.get().materiais = filtered;
      } else {
        storage.get().materiais = materiais;
      }

      persistToSupabase(storage.get());
      refresh?.();
    }
  };

  const getMaterialsList = (topicId) => {
    const materiais = storage.get().materiais || [];
    const existing = materiais.find(m => m.topicId === topicId && m.editalId === editalId);
    return existing?.files || [];
  };

  return (
    <div>
      <div className="ph"><div><h1>📚 Conteúdo</h1><p>Adicione links de materiais por tópico</p></div></div>

      {urlSuccess && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: 'var(--green-d)',
          color: 'var(--green)',
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600
        }}>✓ {urlSuccess}</div>
      )}

      {urlError && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: 'var(--red-d)',
          color: 'var(--red)',
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600
        }}>✗ {urlError}</div>
      )}

      <div style={{ marginBottom: 20, padding: 16, borderRadius: 10, background: "var(--s2)", border: "1px solid var(--b1)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 12 }}>
          📚 Selecione os editais para este conteúdo:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {editais.map(e => (
            <label
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${selectedEditaisForUpload.has(e.id) ? "var(--green)" : "var(--b2)"}`,
                background: selectedEditaisForUpload.has(e.id) ? "var(--green-d)" : "var(--s1)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <input
                type="checkbox"
                checked={selectedEditaisForUpload.has(e.id)}
                onChange={() => toggleEditalSelection(e.id)}
                style={{ cursor: "pointer", width: 18, height: 18 }}
              />
              <span style={{ color: selectedEditaisForUpload.has(e.id) ? "var(--green)" : "var(--t1)", fontWeight: 600, fontSize: 13 }}>
                {e.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {!edital ? (
        <div className="card"><div className="empty"><h3>Nenhum edital</h3></div></div>
      ) : (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>{edital.name}</div>

          {edital.materias?.length === 0 ? (
            <p className="text-muted text-sm">Nenhuma matéria neste edital.</p>
          ) : (
            <div style={{ display: "grid", gap: 24 }}>
              {edital.materias.map(materia => (
                <div key={materia.id} style={{ borderLeft: `4px solid ${materia.color}`, paddingLeft: 16 }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>
                    {materia.name}
                  </h3>

                  <div style={{ display: "grid", gap: 12 }}>
                    {materia.topicos?.map(topic => {
                      const files = getMaterialsList(topic.id);
                      return (
                        <div
                          key={topic.id}
                          style={{
                            padding: 12,
                            borderRadius: 8,
                            background: "var(--s2)",
                            border: `1px solid ${files.length > 0 ? "var(--green)" : "var(--b2)"}`,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 12 }}>
                            {topic.name}
                          </div>

                          {/* Lista de arquivos */}
                          {files.length > 0 && (
                            <div style={{ marginBottom: 12, display: "grid", gap: 8 }}>
                              {files.map((file, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: 8,
                                    borderRadius: 6,
                                    background: "var(--s3)",
                                    border: "1px solid var(--green)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8
                                  }}
                                >
                                  <div style={{ fontSize: 11, flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: "var(--green)", marginBottom: 2 }}>
                                      {file.type}
                                    </div>
                                    <div style={{ color: "var(--t3)", wordBreak: "break-all" }}>
                                      {file.filename}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFile(topic.id, idx)}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: 4,
                                      border: "none",
                                      background: "var(--red-d)",
                                      color: "var(--red)",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      whiteSpace: "nowrap",
                                      flexShrink: 0
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Formulário para adicionar novo arquivo */}
                          <div style={{ display: "grid", gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Tipo do arquivo (ex: Lei, Resumo, Aula)"
                              value={fileTypeInput[topic.id] || ""}
                              onChange={(e) => setFileTypeInput(u => ({ ...u, [topic.id]: e.target.value }))}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid var(--b2)",
                                background: "var(--s3)",
                                color: "var(--t1)",
                                fontSize: 12,
                                fontFamily: "inherit"
                              }}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                type="text"
                                placeholder="Colar link do arquivo (ex: https://...)"
                                value={urlInput[topic.id] || ""}
                                onChange={(e) => setUrlInput(u => ({ ...u, [topic.id]: e.target.value }))}
                                style={{
                                  flex: 1,
                                  padding: "8px 10px",
                                  borderRadius: 6,
                                  border: "1px solid var(--b2)",
                                  background: "var(--s3)",
                                  color: "var(--t1)",
                                  fontSize: 12,
                                  fontFamily: "inherit"
                                }}
                              />
                              <button
                                onClick={() => handleSaveUrl(topic.id, topic.name)}
                                disabled={savingUrl[topic.id]}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: 6,
                                  border: "none",
                                  background: "var(--blue)",
                                  color: "white",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: savingUrl[topic.id] ? "not-allowed" : "pointer",
                                  opacity: savingUrl[topic.id] ? 0.6 : 1,
                                  transition: "all 0.15s",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {savingUrl[topic.id] ? "⏳" : "➕"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COACH: Resumos de Alunos
// ============================================================
function CoachResumos({ user, refresh }) {
  const alunos = usersModule.getAlunos(user.id);
  const editaisCoach = editaisModule.getByCoach(user.id);
  const [alunoId, setAlunoId] = useState(alunos[0]?.id || "");
  const [editalId, setEditalId] = useState(editaisCoach[0]?.id || "");
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [editComment, setEditComment] = useState({});
  const [editAddition, setEditAddition] = useState({});
  const [savingState, setSavingState] = useState({});
  const [modalMarcarData, setModalMarcarData] = useState(null); // { topicId, scheduledDate }
  const [dataRealizacao, setDataRealizacao] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const aluno = alunos.find(a => a.id === alunoId);
  const edital = editaisCoach.find(e => e.id === editalId);
  const plano = storage.get().planos.find(p => p.alunoId === alunoId && p.editalId === editalId);

  const getAllTopics = () => {
    if (!edital) return [];
    const topics = [];
    edital.materias?.forEach(mat => {
      mat.topicos?.forEach(topic => {
        topics.push({ ...topic, materiaId: mat.id, materiaName: mat.name, materiaColor: mat.color });
      });
    });
    return topics;
  };

  const allTopics = getAllTopics();

  const saveComment = (topicId) => {
    if (!plano) return;
    const comment = editComment[topicId] || "";
    setSavingState(s => ({ ...s, [topicId]: true }));
    resumoModule.saveCoachComment(alunoId, plano.id, topicId, user.id, comment);
    persistToSupabase(storage.get());
    setTimeout(() => {
      setSavingState(s => ({ ...s, [topicId]: false }));
      setEditComment(c => ({ ...c, [topicId]: "" }));
      refresh?.();
    }, 300);
  };

  const saveAddition = (topicId) => {
    if (!plano) return;
    const addition = editAddition[topicId] || "";
    setSavingState(s => ({ ...s, [`add-${topicId}`]: true }));
    resumoModule.saveCoachAddition(alunoId, plano.id, topicId, user.id, addition);
    persistToSupabase(storage.get());
    setTimeout(() => {
      setSavingState(s => ({ ...s, [`add-${topicId}`]: false }));
      setEditAddition(a => ({ ...a, [topicId]: "" }));
      refresh?.();
    }, 300);
  };

  const marcarConcluida = (topicId) => {
    if (!plano) return;
    // Find the scheduled date for this topic in the plan
    let dateKey = null;
    Object.entries(plano.plan || {}).forEach(([dk, day]) => {
      if (day.topicos?.find(t => t.id === topicId)) dateKey = dk;
    });
    // Fall back to today if not found in plan
    if (!dateKey) dateKey = localDateKey();

    // Open modal to select completion date
    setModalMarcarData({ topicId, scheduledDate: dateKey });
    setDataRealizacao(dateKey); // Default to scheduled date
  };

  const confirmarMarcarConcluida = () => {
    if (!modalMarcarData || !plano) return;
    const { topicId } = modalMarcarData;
    const dataParaUsar = dataRealizacao || modalMarcarData.scheduledDate;

    progressoModule.saveDone(alunoId, plano.id, `${dataParaUsar}-${topicId}`);
    // Ensure reviews are scheduled from the lesson date (re-create if missing)
    const topicObj = Object.values(plano.plan || {}).flatMap(d => d.topicos).find(t => t.id === topicId);
    if (topicObj) {
      storage.set(db => {
        const planos = db.planos.map(p => {
          if (p.id !== plano.id) return p;
          const np = JSON.parse(JSON.stringify(p.plan));
          const lessonDate = new Date(dataParaUsar + "T12:00:00");
          const intervals = REVIEW_PRESETS[topicObj.materiaReviewPreset || "moderada"] || REVIEW_INTERVALS;
          intervals.forEach(interval => {
            const rd = new Date(lessonDate); rd.setDate(rd.getDate() + interval);
            const rk = localDateKey(rd);
            if (!np[rk]) np[rk] = { date: rk, topicos: [], reviews: [] };
            if (!np[rk].reviews.find(r => r.id === topicId))
              np[rk].reviews.push({ ...topicObj, reviewInterval: interval });
          });
          return { ...p, plan: np };
        });
        return { ...db, planos };
      });
    }
    persistToSupabase(storage.get());
    setModalMarcarData(null);
    setDataRealizacao("");

    // Show success message
    const topicName = allTopics.find(t => t.id === topicId)?.name || "Aula";
    setSuccessMessage(`✅ ${topicName} marcada como concluída em ${new Date(dataParaUsar + "T12:00:00").toLocaleDateString("pt-BR")}`);
    setTimeout(() => setSuccessMessage(""), 4000);

    // Force a state update to re-render the component
    setExpandedTopic(null);
    setTimeout(() => {
      refresh?.();
    }, 100);
  };

  return (
    <div>
      <div className="ph"><div><h1>✍️ Resumos</h1><p>Visualize e comente os resumos dos alunos</p></div></div>

      {successMessage && (
        <div style={{
          padding: '14px 16px',
          borderRadius: 8,
          background: 'var(--green-d)',
          color: 'var(--green)',
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
          border: '1px solid var(--green)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--t2)" }}>
            Selecione um aluno:
          </label>
          <select
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--b2)",
              background: "var(--s2)",
              color: "var(--t1)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {alunos.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
            ))}
          </select>
        </div>

        {editaisCoach.length > 1 && (
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--t2)" }}>
              Selecione um edital:
            </label>
            <select
              value={editalId}
              onChange={(e) => setEditalId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--b2)",
                background: "var(--s2)",
                color: "var(--t1)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              {editaisCoach.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!aluno || !edital || !plano ? (
        <div className="card"><div className="empty"><h3>Nenhum plano ativo para este aluno neste edital</h3></div></div>
      ) : (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>{aluno.name} — {edital.name}</div>

          {allTopics.length === 0 ? (
            <p className="text-muted text-sm">Nenhum tópico neste edital.</p>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {allTopics.filter(topic => {
                const studentNote = progressoModule.getNote(alunoId, plano.id, topic.id);
                return studentNote.trim().length > 0;
              }).length === 0 ? (
                <p className="text-muted text-sm">Nenhum resumo enviado pelos alunos ainda.</p>
              ) : (
                <>
                  {allTopics.filter(topic => {
                    const studentNote = progressoModule.getNote(alunoId, plano.id, topic.id);
                    return studentNote.trim().length > 0;
                  }).map(topic => {
                    const studentNote = progressoModule.getNote(alunoId, plano.id, topic.id);
                    const coachComment = resumoModule.getCoachComment(alunoId, plano.id, topic.id);
                    const coachAddition = resumoModule.getCoachAddition(alunoId, plano.id, topic.id);
                    const isExpanded = expandedTopic === topic.id;
                    const hasResume = studentNote.trim().length > 0;
                    // Check if lesson is marked done (search all possible dates in the plan)
                    const isDoneAula = plano ? Object.entries(plano.plan || {}).some(([dk]) =>
                      progressoModule.isDone(alunoId, plano.id, `${dk}-${topic.id}`)
                    ) : false;

                return (
                  <div
                    key={topic.id}
                    style={{
                      borderLeft: `4px solid ${topic.materiaColor}`,
                      paddingLeft: 16,
                      paddingTop: 12,
                      paddingRight: 12,
                      paddingBottom: 12,
                      borderRadius: 8,
                      background: "var(--s2)",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
                          {topic.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>
                          {topic.materiaName}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>
                          {hasResume ? (
                            <span style={{ color: "var(--green)" }}>✓ Resumo enviado</span>
                          ) : (
                            <span style={{ color: "var(--t3)" }}>○ Sem resumo</span>
                          )}
                          {isDoneAula ? (
                            <span style={{ marginLeft: 12, color: "var(--green)" }}>✅ Concluída</span>
                          ) : (
                            <span style={{ marginLeft: 12, color: "var(--amber)" }}>⏳ Pendente</span>
                          )}
                          {coachComment && <span style={{ marginLeft: 12, color: "var(--blue)" }}>💬 Comentário</span>}
                          {coachAddition && <span style={{ marginLeft: 12, color: "var(--amber)" }}>➕ Complementado</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 18, transition: "all 0.2s" }}>
                        {isExpanded ? "▼" : "▶"}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--b2)" }} onClick={(e) => e.stopPropagation()}>
                        {/* Resumo do Aluno */}
                        {hasResume ? (
                          <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>
                              📝 Resumo do Aluno:
                            </div>
                            <div
                              style={{
                                padding: 12,
                                borderRadius: 6,
                                background: "var(--s3)",
                                fontSize: 13,
                                color: "var(--t1)",
                                lineHeight: 1.5,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                maxHeight: 200,
                                overflowY: "auto",
                                marginBottom: 12
                              }}
                            >
                              {studentNote}
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: 12, borderRadius: 6, background: "var(--s3)", fontSize: 12, color: "var(--t3)", marginBottom: 16 }}>
                            O aluno ainda não enviou um resumo para este tópico.
                          </div>
                        )}

                        {/* Comentário do Coach */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>
                            💬 Seu Comentário:
                          </div>
                          <textarea
                            value={editComment[topic.id] || coachComment}
                            onChange={(e) => setEditComment(c => ({ ...c, [topic.id]: e.target.value }))}
                            placeholder="Adicione seu comentário sobre a qualidade do resumo..."
                            style={{
                              width: "100%",
                              minHeight: 80,
                              padding: 10,
                              borderRadius: 6,
                              border: "1px solid var(--b2)",
                              background: "var(--s3)",
                              color: "var(--t1)",
                              fontSize: 12,
                              fontFamily: "inherit",
                              marginBottom: 8,
                              resize: "vertical"
                            }}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); saveComment(topic.id); }}
                            disabled={savingState[topic.id]}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "none",
                              background: "var(--blue)",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: savingState[topic.id] ? "not-allowed" : "pointer",
                              opacity: savingState[topic.id] ? 0.6 : 1,
                              transition: "all 0.15s"
                            }}
                          >
                            {savingState[topic.id] ? "💾 Salvando..." : "💾 Salvar Comentário"}
                          </button>
                        </div>

                        {/* Marcar como concluída */}
                        {!isDoneAula && hasResume && (
                          <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid var(--green)" }}>
                            <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8 }}>
                              O aluno enviou o resumo mas a aula ainda não está marcada como concluída no plano.
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); marcarConcluida(topic.id); }}
                              style={{
                                padding: "6px 14px", borderRadius: 6, border: "none",
                                background: "var(--green)", color: "white",
                                fontSize: 12, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              ✅ Marcar como Concluída
                            </button>
                          </div>
                        )}

                        {/* Complemento do Coach */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>
                            ➕ Complementar Resumo:
                          </div>
                          <textarea
                            value={editAddition[topic.id] || coachAddition}
                            onChange={(e) => setEditAddition(a => ({ ...a, [topic.id]: e.target.value }))}
                            placeholder="Adicione conteúdo adicional ou correções ao resumo..."
                            style={{
                              width: "100%",
                              minHeight: 80,
                              padding: 10,
                              borderRadius: 6,
                              border: "1px solid var(--b2)",
                              background: "var(--s3)",
                              color: "var(--t1)",
                              fontSize: 12,
                              fontFamily: "inherit",
                              marginBottom: 8,
                              resize: "vertical"
                            }}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); saveAddition(topic.id); }}
                            disabled={savingState[`add-${topic.id}`]}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "none",
                              background: "var(--amber)",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: savingState[`add-${topic.id}`] ? "not-allowed" : "pointer",
                              opacity: savingState[`add-${topic.id}`] ? 0.6 : 1,
                              transition: "all 0.15s"
                            }}
                          >
                            {savingState[`add-${topic.id}`] ? "💾 Salvando..." : "💾 Salvar Complemento"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal — Marcar Conclusão com Data */}
      {modalMarcarData && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }} onClick={() => setModalMarcarData(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--s1)", borderRadius: 12, padding: "24px 20px", maxWidth: 400,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, color: "var(--t1)" }}>
              ✅ Marcar como Concluída
            </div>
            <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 14 }}>
              Em qual data o aluno concluiu esta aula?
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 8 }}>
                Data de Conclusão:
              </label>
              <input
                type="date"
                value={dataRealizacao}
                onChange={(e) => setDataRealizacao(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--b2)", background: "var(--s2)",
                  color: "var(--t1)", fontSize: 13, fontWeight: 500
                }}
              />
              {dataRealizacao && (
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>
                  📅 {new Date(dataRealizacao + "T12:00:00").toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setModalMarcarData(null);
                  setDataRealizacao("");
                }}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8,
                  border: "1.5px solid var(--b2)", background: "var(--s2)",
                  color: "var(--t1)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarMarcarConcluida}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8,
                  border: "none", background: "var(--green)",
                  color: "white", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s"
                }}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COACH: Simulados
// ============================================================
function CoachSimulados({ user, refresh }) {
  const editais = editaisModule.getByCoach(user.id);
  const [editalId, setEditalId] = useState(editais[0]?.id || "");
  const [criando, setCriando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);

  const edital = editaisModule.getById(editalId);
  const simulados = edital ? simuladosModule.getByEdital(editalId) : [];

  return (
    <div>
      <div className="ph"><div><h1>📝 Simulados</h1><p>Crie e gerencie simulados para seus alunos</p></div></div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        {editais.length > 1 && (
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--t2)" }}>
              Selecione um edital:
            </label>
            <select
              value={editalId}
              onChange={(e) => setEditalId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--b2)",
                background: "var(--s2)",
                color: "var(--t1)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              {editais.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => setCriando(true)}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: "var(--blue)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          + Novo Simulado
        </button>
      </div>

      {!edital ? (
        <div className="card"><div className="empty"><h3>Nenhum edital disponível</h3></div></div>
      ) : simulados.length === 0 ? (
        <div className="card"><div className="empty"><h3>Nenhum simulado criado ainda</h3></div></div>
      ) : (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Simulados de {edital.name}</div>
          <div style={{ display: "grid", gap: 12 }}>
            {simulados.map(sim => {
              const questoes = questoesModule.getBySimulado(sim.id);
              const tentativas = (storage.get().tentativas || []).filter(t => t.simuladoId === sim.id);
              const finalizadas = tentativas.filter(t => t.status === "finalizada");

              return (
                <div
                  key={sim.id}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: "var(--s2)",
                    border: "1px solid var(--b2)",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onClick={() => setSelecionado(sim.id)}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--b2)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
                        {sim.nome}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>
                        {sim.tipo === "geral" ? "Simulado Geral" : "Simulado Específico"}
                        {sim.descricao && ` • ${sim.descricao}`}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t2)" }}>
                        {questoes.length} questão{questoes.length !== 1 ? 's' : ''} • {finalizadas.length} tentativa{finalizadas.length !== 1 ? 's' : ''} realizadas
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Tem certeza que deseja deletar o simulado "${sim.nome}"? Todas as questões e tentativas serão removidas.`)) {
                            simuladosModule.delete(sim.id);
                            refresh?.();
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          background: "var(--red)",
                          color: "white",
                          fontSize: 11,
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                        onMouseOver={(e) => { e.target.style.opacity = "0.8"; }}
                        onMouseOut={(e) => { e.target.style.opacity = "1"; }}
                      >
                        🗑️ Deletar
                      </button>
                      <div style={{ fontSize: 18 }}>▶</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {criando && (
        <ModalCriarSimulado
          editalId={editalId}
          coachId={user.id}
          onClose={() => { setCriando(false); refresh?.(); }}
        />
      )}

      {selecionado && (
        <ModalGerenciarSimulado
          simuladoId={selecionado}
          coachId={user.id}
          onClose={() => { setSelecionado(null); refresh?.(); }}
        />
      )}
    </div>
  );
}

// Modal para criar simulado
function ModalCriarSimulado({ editalId, coachId, onClose }) {
  const edital = editaisModule.getById(editalId);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("geral");
  const [materiaId, setMateriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tempoLimite, setTempoLimite] = useState("");
  const [temTextoMotivador, setTemTextoMotivador] = useState(false);
  const [textoMotivador, setTextoMotivador] = useState("");
  const [numQuestoes, setNumQuestoes] = useState(1);

  const materia = edital?.materias?.find(m => m.id === materiaId);
  const ehLinguaPortuguesa = materia?.name?.includes("Língua Portuguesa") || materia?.name?.includes("Português");

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "var(--s1)", padding: 24, borderRadius: 12, maxWidth: 450, width: "90%"
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", marginBottom: 20 }}>
          Novo Simulado
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
            Nome do simulado:
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex: Simulado de Direito Constitucional"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--b2)",
              background: "var(--s2)",
              color: "var(--t1)",
              fontSize: 13
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
            Tipo:
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                checked={tipo === "geral"}
                onChange={() => setTipo("geral")}
              />
              <span style={{ fontSize: 13, color: "var(--t1)" }}>Geral</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                checked={tipo === "especifico"}
                onChange={() => setTipo("especifico")}
              />
              <span style={{ fontSize: 13, color: "var(--t1)" }}>Específico</span>
            </label>
          </div>
        </div>

        {tipo === "especifico" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
                Matéria:
              </label>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--b2)",
                  background: "var(--s2)",
                  color: "var(--t1)",
                  fontSize: 13
                }}
              >
                <option value="">Selecione uma matéria</option>
                {edital?.materias?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {ehLinguaPortuguesa && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 6, background: "var(--s2)", border: "1px solid var(--b2)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--t1)" }}>
                  📚 Há um texto motivador para este simulado?
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flex: 1 }}>
                    <input
                      type="radio"
                      checked={!temTextoMotivador}
                      onChange={() => { setTemTextoMotivador(false); setTextoMotivador(""); setNumQuestoes(1); }}
                    />
                    <span style={{ fontSize: 12, color: "var(--t1)" }}>Não</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flex: 1 }}>
                    <input
                      type="radio"
                      checked={temTextoMotivador}
                      onChange={() => setTemTextoMotivador(true)}
                    />
                    <span style={{ fontSize: 12, color: "var(--t1)" }}>Sim</span>
                  </label>
                </div>

                {temTextoMotivador && (
                  <>
                    <textarea
                      value={textoMotivador}
                      onChange={(e) => setTextoMotivador(e.target.value)}
                      placeholder="Cole aqui o texto motivador..."
                      style={{
                        width: "100%",
                        minHeight: 80,
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--b2)",
                        background: "var(--s3)",
                        color: "var(--t1)",
                        fontSize: 12,
                        fontFamily: "inherit",
                        resize: "vertical",
                        marginBottom: 12
                      }}
                    />
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
                        Quantas questões usarão este texto?
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={numQuestoes}
                        onChange={(e) => setNumQuestoes(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--b2)",
                          background: "var(--s3)",
                          color: "var(--t1)",
                          fontSize: 12
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
            Descrição (opcional):
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="ex: Simulado com questões de 2024"
            style={{
              width: "100%",
              minHeight: 60,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--b2)",
              background: "var(--s2)",
              color: "var(--t1)",
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
            Tempo Limite (opcional, em minutos):
          </label>
          <input
            type="number"
            value={tempoLimite}
            onChange={(e) => setTempoLimite(e.target.value)}
            placeholder="ex: 60"
            min="0"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--b2)",
              background: "var(--s2)",
              color: "var(--t1)",
              fontSize: 13
            }}
          />
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>
            Deixe em branco para sem limite de tempo
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              const sim = simuladosModule.create(coachId, editalId, nome, tipo, materiaId, descricao);
              const updates = {};
              if (tempoLimite) {
                updates.tempoLimiteMinutos = parseInt(tempoLimite);
              }
              if (ehLinguaPortuguesa && temTextoMotivador && textoMotivador) {
                updates.textoMotivador = textoMotivador;
                updates.numQuestoes = numQuestoes;
              }
              if (ehLinguaPortuguesa) {
                updates.isPortuguese = true;
              }
              if (Object.keys(updates).length > 0) {
                simuladosModule.update(sim.id, updates);
              }
              onClose();
            }}
            disabled={!nome || (tipo === "especifico" && !materiaId) || (ehLinguaPortuguesa && temTextoMotivador && !textoMotivador)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 6,
              border: "none",
              background: "var(--blue)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: !nome || (tipo === "especifico" && !materiaId) || (ehLinguaPortuguesa && temTextoMotivador && !textoMotivador) ? "not-allowed" : "pointer",
              opacity: !nome || (tipo === "especifico" && !materiaId) || (ehLinguaPortuguesa && temTextoMotivador && !textoMotivador) ? 0.5 : 1
            }}
          >
            Criar
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--b2)",
              background: "transparent",
              color: "var(--t2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para gerenciar simulado
function ModalGerenciarSimulado({ simuladoId, coachId, onClose }) {
  const simulado = simuladosModule.getById(simuladoId);
  const questoes = questoesModule.getBySimulado(simuladoId);
  const [adicionandoQuestao, setAdicionandoQuestao] = useState(false);
  const [tab, setTab] = useState("questoes"); // "questoes" ou "resultados"
  const [detalhesTomando, setDetalhesTomando] = useState(null); // Para visualizar detalhes de uma tentativa
  const tentativas = (storage.get().tentativas || []).filter(t => t.simuladoId === simuladoId && t.status === "finalizada");
  const alunos = usersModule.getAlunos(coachId);

  if (!simulado) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, overflowY: "auto"
    }}>
      <div style={{
        background: "var(--s1)", padding: 24, borderRadius: 12, maxWidth: 600, width: "90%",
        margin: "20px auto"
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--t1)" }}>
              {simulado.nome}
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              {questoes.length} questão{questoes.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: "var(--b2)",
              color: "var(--t1)",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Fechar
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid var(--b2)", paddingBottom: 12 }}>
          <button
            onClick={() => setTab("questoes")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: tab === "questoes" ? "var(--blue)" : "transparent",
              color: tab === "questoes" ? "white" : "var(--t2)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            📝 Questões ({questoes.length})
          </button>
          <button
            onClick={() => setTab("resultados")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: tab === "resultados" ? "var(--blue)" : "transparent",
              color: tab === "resultados" ? "white" : "var(--t2)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            📊 Resultados ({tentativas.length})
          </button>
        </div>

        {tab === "questoes" && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setAdicionandoQuestao(true)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "var(--green)",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              + Adicionar Questão
            </button>
          </div>
        )}

        {tab === "questoes" && (
          <>
            {questoes.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 8, background: "var(--s2)", color: "var(--t3)", textAlign: "center" }}>
                Nenhuma questão adicionada ainda
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {questoes.map((q, i) => (
                  <div
                    key={q.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      background: "var(--s2)",
                      border: "1px solid var(--b2)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 6 }}>
                          Questão {i + 1}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--t1)", marginBottom: 6 }}>
                          {q.enunciado}
                        </div>
                        {q.tipo === "multipla" && (
                          <div style={{ fontSize: 11, color: "var(--t3)" }}>
                            {q.alternativas.map((alt, idx) => (
                              <div key={idx}>{String.fromCharCode(65 + idx)}. {alt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          questoesModule.delete(q.id);
                          onClose();
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          background: "var(--red)",
                          color: "white",
                          fontSize: 11,
                          cursor: "pointer"
                        }}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "resultados" && (
          <div>
            {tentativas.length === 0 ? (
              <div style={{ padding: 16, borderRadius: 8, background: "var(--s2)", color: "var(--t3)", textAlign: "center" }}>
                Nenhuma tentativa realizada ainda
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tentativas.map(tent => {
                  const aluno = alunos.find(a => a.id === tent.alunoId);
                  const minutos = Math.floor(tent.tempoDecorridoSegundos / 60);
                  const segundos = tent.tempoDecorridoSegundos % 60;

                  return (
                    <div
                      key={tent.id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        background: "var(--s2)",
                        border: "1px solid var(--b2)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 4 }}>
                            {aluno?.name || "Aluno"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--t3)" }}>
                            {new Date(tent.finishedAt).toLocaleDateString("pt-BR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: tent.acertos >= tent.erros ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                            {tent.acertos}/{questoes.length}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: tent.acertos >= tent.erros ? "var(--green)" : "var(--red)", marginBottom: 4 }}>
                            {Math.round((tent.acertos / questoes.length) * 100)}%
                          </div>
                          <div style={{ fontSize: 11, color: "var(--t3)" }}>
                            ⏱️ {minutos}m {segundos}s
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                        <div style={{ padding: 8, borderRadius: 6, background: "var(--s3)", textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>✓ Acertos</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>{tent.acertos}</div>
                        </div>
                        <div style={{ padding: 8, borderRadius: 6, background: "var(--s3)", textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>✗ Erros</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--red)" }}>{tent.erros}</div>
                        </div>
                      </div>

                      {tent.respostasIncorretas?.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--b2)" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)", marginBottom: 6 }}>
                            Questões com erro:
                          </div>
                          <div style={{ fontSize: 11, color: "var(--t3)", display: "flex", flexDirection: "column", gap: 4 }}>
                            {tent.respostasIncorretas.map((q, idx) => (
                              <div key={idx}>• {q.questaoEnunciado?.substring(0, 60)}...</div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setDetalhesTomando(tent)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--blue)",
                            background: "transparent",
                            color: "var(--blue)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                          onMouseOver={(e) => { e.target.style.background = "var(--blue)"; e.target.style.color = "white"; }}
                          onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "var(--blue)"; }}
                        >
                          📋 Ver Detalhes
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {detalhesTomando && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1001, overflowY: "auto"
          }}>
            <div style={{
              background: "var(--s1)", padding: 24, borderRadius: 12, maxWidth: 700, width: "90%",
              margin: "20px auto"
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>
                    Detalhes da Tentativa
                  </div>
                  <div style={{ fontSize: 12, color: "var(--t3)" }}>
                    {alunos.find(a => a.id === detalhesTomando.alunoId)?.name || "Aluno"}
                  </div>
                </div>
                <button
                  onClick={() => setDetalhesTomando(null)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--b2)",
                    color: "var(--t1)",
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Fechar
                </button>
              </div>

              <div style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 8, background: "var(--s2)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginBottom: 4 }}>✓ Acertos</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{detalhesTomando.acertos}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: "var(--s2)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--red)", fontWeight: 600, marginBottom: 4 }}>✗ Erros</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--red)" }}>{detalhesTomando.erros}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: "var(--s2)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "var(--amber)", fontWeight: 600, marginBottom: 4 }}>📊 Taxa</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>
                    {Math.round((detalhesTomando.acertos / questoes.length) * 100)}%
                  </div>
                </div>
              </div>

              {detalhesTomando.respostasIncorretas?.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 12 }}>
                    Questões com Erro ({detalhesTomando.respostasIncorretas.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {detalhesTomando.respostasIncorretas.map((q, idx) => (
                      <div key={idx} style={{
                        padding: 12, borderRadius: 8, background: "var(--s2)",
                        border: "1px solid rgba(239, 68, 68, 0.3)", borderLeft: "4px solid var(--red)"
                      }}>
                        <div style={{ fontSize: 12, color: "var(--t1)", marginBottom: 8, fontWeight: 600 }}>
                          {q.questaoEnunciado}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 6 }}>
                          <strong>Sua resposta:</strong> {q.respostaAluno || "Não respondida"}
                        </div>
                        {q.respostaCorreta && (
                          <div style={{ fontSize: 11, color: "var(--green)" }}>
                            <strong>✓ Resposta correta:</strong> {q.respostaCorreta}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detalhesTomando.respostasIncorretas?.length === 0 && (
                <div style={{
                  padding: 16, borderRadius: 8, background: "var(--green)", color: "white",
                  textAlign: "center", fontWeight: 600
                }}>
                  🎉 Perfeito! Todas as respostas estão corretas!
                </div>
              )}
            </div>
          </div>
        )}

        {adicionandoQuestao && (
          <ModalAdicionarQuestao
            simuladoId={simuladoId}
            onClose={() => { setAdicionandoQuestao(false); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}

// Subcomponente para um formulário de questão individual
function FormQuestao({ index, data, onChange, textosUsados, comTextoMotivador }) {
  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--b2)", background: "var(--s2)", color: "var(--t1)", fontSize: 12 };
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "var(--s3)", border: "1px solid var(--b2)", marginBottom: 12 }}>
      {comTextoMotivador && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Questão {index + 1}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--t2)" }}>Tipo:</label>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: "var(--t1)" }}>
            <input type="radio" checked={data.tipo === "ce"} onChange={() => onChange({ ...data, tipo: "ce", gabarito: "", alternativas: ["","","",""] })} />
            Certo ou Errado
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: "var(--t1)" }}>
            <input type="radio" checked={data.tipo === "multipla"} onChange={() => onChange({ ...data, tipo: "multipla", gabarito: "" })} />
            Múltipla Escolha
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--t2)" }}>Enunciado:</label>
        <textarea
          value={data.enunciado}
          onChange={(e) => onChange({ ...data, enunciado: e.target.value })}
          placeholder="Digite o enunciado da questão..."
          style={{ ...inputStyle, minHeight: 70, fontFamily: "inherit", resize: "vertical" }}
        />
      </div>

      {data.tipo === "ce" ? (
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>Gabarito:</label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: "var(--t1)" }}>
              <input type="radio" checked={data.gabarito === "C"} onChange={() => onChange({ ...data, gabarito: "C" })} />
              Certo
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: "var(--t1)" }}>
              <input type="radio" checked={data.gabarito === "E"} onChange={() => onChange({ ...data, gabarito: "E" })} />
              Errado
            </label>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--t2)" }}>Alternativas:</label>
            {data.alternativas.map((alt, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "var(--t3)", minWidth: 18 }}>{String.fromCharCode(65 + i)}.</span>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => {
                    const alts = [...data.alternativas]; alts[i] = e.target.value;
                    onChange({ ...data, alternativas: alts });
                  }}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--t2)" }}>Gabarito:</label>
            <select value={data.gabarito} onChange={(e) => onChange({ ...data, gabarito: e.target.value })} style={inputStyle}>
              <option value="">Selecione o gabarito</option>
              {data.alternativas.map((alt, i) => alt && (
                <option key={i} value={alt}>{String.fromCharCode(65 + i)}. {alt}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

const questaoVazia = () => ({ tipo: "ce", enunciado: "", alternativas: ["", "", "", ""], gabarito: "" });

// Modal para adicionar questão
function ModalAdicionarQuestao({ simuladoId, onClose }) {
  const questoesExistentes = questoesModule.getBySimulado(simuladoId);
  const textosUsados = [...new Map(questoesExistentes.map(q => [q.textBase, q.textBase])).values()].filter(Boolean);

  // Etapa: "pergunta" → "formulario"
  const [etapa, setEtapa] = useState("pergunta");
  const [temTextoMotivador, setTemTextoMotivador] = useState(null); // null = não respondido
  const [textoMotivador, setTextoMotivador] = useState("");
  const [numQuestoes, setNumQuestoes] = useState(1);
  const [questoesData, setQuestoesData] = useState([questaoVazia()]);

  const atualizarNumQuestoes = (n) => {
    const num = Math.max(1, Math.min(20, n));
    setNumQuestoes(num);
    setQuestoesData(prev => {
      const novo = Array.from({ length: num }, (_, i) => prev[i] || questaoVazia());
      return novo;
    });
  };

  const atualizarQuestao = (i, data) => {
    setQuestoesData(prev => prev.map((q, idx) => idx === i ? data : q));
  };

  const todasValidas = () => {
    if (temTextoMotivador && !textoMotivador.trim()) return false;
    return questoesData.every(q => q.enunciado.trim() && q.gabarito);
  };

  const handleAdicionar = () => {
    questoesData.forEach(q => {
      const nova = questoesModule.create(simuladoId, q.tipo, q.enunciado, q.tipo === "multipla" ? q.alternativas : [], q.gabarito);
      if (temTextoMotivador && textoMotivador.trim()) {
        questoesModule.update(nova.id, { textBase: textoMotivador, numQuestoes });
      }
    });
    onClose();
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--b2)", background: "var(--s2)", color: "var(--t1)", fontSize: 13 };
  const btnStyle = (active) => ({ padding: "10px 20px", borderRadius: 8, border: active ? "2px solid var(--blue)" : "2px solid var(--b2)", background: active ? "var(--blue-d)" : "transparent", color: active ? "var(--blue)" : "var(--t2)", fontSize: 13, fontWeight: 700, cursor: "pointer", flex: 1, transition: "all 0.15s" });

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1001, overflowY: "auto", padding: "20px 0"
    }}>
      <div style={{
        background: "var(--s1)", padding: 24, borderRadius: 12, maxWidth: 540, width: "90%",
        margin: "auto", maxHeight: "90vh", overflowY: "auto"
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", marginBottom: 20 }}>
          {etapa === "pergunta" ? "Nova Questão" : temTextoMotivador ? `Questões do Texto Motivador` : "Nova Questão"}
        </div>

        {/* ETAPA 1: Pergunta sobre texto motivador */}
        {etapa === "pergunta" && (
          <>
            <div style={{ marginBottom: 20, padding: 16, borderRadius: 8, background: "var(--s2)", border: "1px solid var(--b2)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", marginBottom: 16 }}>
                📚 Esta questão possui texto motivador?
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => { setTemTextoMotivador(false); setEtapa("formulario"); atualizarNumQuestoes(1); }} style={btnStyle(temTextoMotivador === false)}>
                  ✗ Não
                </button>
                <button onClick={() => setTemTextoMotivador(true)} style={btnStyle(temTextoMotivador === true)}>
                  ✓ Sim
                </button>
              </div>
            </div>

            {temTextoMotivador === true && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
                    Cole o texto motivador:
                  </label>
                  <textarea
                    value={textoMotivador}
                    onChange={(e) => setTextoMotivador(e.target.value)}
                    placeholder="Cole aqui o texto para interpretação..."
                    style={{ ...inputStyle, minHeight: 120, fontFamily: "inherit", resize: "vertical" }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--t2)" }}>
                    Quantas questões usarão este texto?
                  </label>
                  <input
                    type="number"
                    min="1" max="20"
                    value={numQuestoes}
                    onChange={(e) => atualizarNumQuestoes(parseInt(e.target.value) || 1)}
                    style={inputStyle}
                  />
                </div>

                <button
                  onClick={() => { atualizarNumQuestoes(numQuestoes); setEtapa("formulario"); }}
                  disabled={!textoMotivador.trim()}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 8, border: "none",
                    background: textoMotivador.trim() ? "var(--blue)" : "var(--b2)",
                    color: "white", fontSize: 13, fontWeight: 700, cursor: textoMotivador.trim() ? "pointer" : "not-allowed"
                  }}
                >
                  Continuar → Preencher {numQuestoes} Questão{numQuestoes > 1 ? "s" : ""}
                </button>
              </>
            )}
          </>
        )}

        {/* ETAPA 2: Formulário(s) de questão */}
        {etapa === "formulario" && (
          <>
            {temTextoMotivador && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "var(--s2)", border: "1px solid var(--b2)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  📚 Texto Motivador
                </div>
                <div style={{ fontSize: 12, color: "var(--t1)", lineHeight: 1.6, maxHeight: 100, overflowY: "auto" }}>
                  {textoMotivador}
                </div>
                <button
                  onClick={() => setEtapa("pergunta")}
                  style={{ marginTop: 8, fontSize: 11, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  ← Editar texto
                </button>
              </div>
            )}

            <div style={{ maxHeight: "50vh", overflowY: "auto", paddingRight: 4 }}>
              {questoesData.map((q, i) => (
                <FormQuestao
                  key={i}
                  index={i}
                  data={q}
                  onChange={(data) => atualizarQuestao(i, data)}
                  textosUsados={textosUsados}
                  comTextoMotivador={temTextoMotivador}
                />
              ))}
            </div>
          </>
        )}

        {/* Botões de ação */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {etapa === "formulario" && (
            <button
              onClick={handleAdicionar}
              disabled={!todasValidas()}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 6, border: "none",
                background: "var(--blue)", color: "white", fontSize: 13, fontWeight: 600,
                cursor: todasValidas() ? "pointer" : "not-allowed",
                opacity: todasValidas() ? 1 : 0.5
              }}
            >
              Adicionar {questoesData.length > 1 ? `${questoesData.length} Questões` : "Questão"}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: etapa === "formulario" ? 1 : undefined, padding: "10px 12px", borderRadius: 6,
              border: "1px solid var(--b2)", background: "transparent",
              color: "var(--t2)", fontSize: 13, fontWeight: 600, cursor: "pointer",
              width: etapa === "pergunta" && temTextoMotivador === null ? "100%" : undefined
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COACH: Ranking de Alunos
// ============================================================
function CoachRanking({ user }) {
  const editais = editaisModule.getByCoach(user.id);
  const [editalId, setEditalId] = useState(editais[0]?.id || "");
  const alunos = usersModule.getAlunos(user.id);
  const planos = storage.get().planos;

  const edital = editaisModule.getById(editalId);

  const ranking = alunos.map(a => {
    const plano = planos.find(p => p.alunoId === a.id && p.editalId === editalId);
    if (!plano) return { aluno: a, xp: 0, aulas: 0, streak: 0, nivel: gamificacaoModule.getNivel(0), plano: null };
    const xp = gamificacaoModule.calcXP(a.id, plano.id);
    const stats = progressoModule.getStats(a.id, plano.id);
    const streak = gamificacaoModule.getStreakAtual(a.id, plano.id);
    const nivel = gamificacaoModule.getNivel(xp);
    return { aluno: a, xp, aulas: stats?.aulasFeitas || 0, streak, nivel, plano, pct: stats?.pct || 0 };
  }).sort((a, b) => b.xp - a.xp || b.aulas - a.aulas);

  const posClass = (i) => i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"";
  const posEmoji = (i) => i===0?"🥇":i===1?"🥈":i===2?"🥉":"";

  return (
    <div>
      <div className="ph"><div><h1>🏆 Ranking de Alunos</h1><p>Classificação por edital</p></div></div>
      {editais.length > 1 && (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {editais.map(e => (
            <button key={e.id} className={`preset-btn${editalId===e.id?" active":""}`} onClick={()=>setEditalId(e.id)}>{e.name}</button>
          ))}
        </div>
      )}
      {!edital ? (
        <div className="card"><div className="empty"><h3>Nenhum edital</h3></div></div>
      ) : (
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>{edital.name}</div>
          {ranking.length === 0 ? (
            <p className="text-muted text-sm">Nenhum aluno neste edital.</p>
          ) : (
            <table className="rank-table">
              <thead>
                <tr>
                  <th style={{width:50}}>#</th>
                  <th>Aluno</th>
                  <th>Nível</th>
                  <th>XP</th>
                  <th>Aulas</th>
                  <th>🔥 Streak</th>
                  <th>Progresso</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => (
                  <tr key={r.aluno.id}>
                    <td><div className={`rank-pos ${posClass(i)}`}>{posEmoji(i)||`${i+1}`}</div></td>
                    <td>
                      <div className="fw6">{r.aluno.name}</div>
                      <div className="text-xs text-dim">{r.aluno.email}</div>
                    </td>
                    <td><span className="badge bn">{r.nivel.emoji} {r.nivel.name}</span></td>
                    <td><span style={{fontFamily:"Cabinet Grotesk",fontWeight:900,color:"var(--purple)"}}>{r.xp}</span></td>
                    <td><span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,color:"var(--green)"}}>{r.aulas}</span></td>
                    <td><span style={{fontFamily:"Cabinet Grotesk",fontWeight:700,color:"var(--amber)"}}>{r.streak}</span></td>
                    <td style={{minWidth:120}}>
                      {r.plano ? (
                        <>
                          <div style={{fontSize:11,color:"var(--t3)",marginBottom:4}}>{r.pct}%</div>
                          <PBar pct={r.pct}/>
                        </>
                      ) : <span className="text-dim text-xs">Sem plano</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ROOT
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [tick, setTick] = useState(0);
  const [dbLoaded, setDbLoaded] = useState(false);
  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    storage.load().then(() => {
      setDbLoaded(true);
      // Restore session from localStorage
      try {
        const savedId = localStorage.getItem('estudaai_session');
        if (savedId) {
          const u = storage.get().users.find(x => x.id === savedId);
          if (u) { _session = u; setUser(u); }
        }
      } catch(e) {}
    });
  }, []);

  function handleLogin(u)  {
    try { localStorage.setItem('estudaai_session', u.id); } catch(e) {}
    setUser(u); setPage("dashboard");
  }
  function handleLogout()  {
    try { localStorage.removeItem('estudaai_session'); } catch(e) {}
    authModule.logout(); setUser(null); setPage("dashboard");
  }

  if (!dbLoaded) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"var(--bg)", flexDirection:"column", gap:"16px" }}>
        <div style={{ fontSize:"40px" }}>📚</div>
        <div style={{ color:"var(--green)", fontFamily:"Cabinet Grotesk", fontWeight:900, fontSize:"22px", letterSpacing:"-0.5px" }}>EstudaAI</div>
        <div style={{ color:"var(--t3)", fontSize:"13px" }}>Conectando ao banco de dados...</div>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <LoginPage onLogin={handleLogin} />
    </>
  );

  function renderPage() {
    if (user.role === "admin") {
      if (page==="dashboard") return <AdminDashboard refresh={refresh}/>;
      if (page==="coaches")   return <AdminCoaches   refresh={refresh}/>;
      if (page==="alunos")    return <AdminAlunos    refresh={refresh}/>;
      if (page==="logs")      return <AdminLogs/>;
      if (page==="debug")     return <AdminDebug/>;
    }
    if (user.role === "coach") {
      if (page==="dashboard")      return <CoachDashboard user={user} refresh={refresh}/>;
      if (page==="alunos")         return <CoachAlunos    user={user} refresh={refresh}/>;
      if (page==="editais")        return <CoachEditais   user={user} refresh={refresh}/>;
      if (page==="gerenciar-plano") return <CoachGerenciarPlanos user={user} refresh={refresh}/>;
      if (page==="progresso")      return <CoachProgresso user={user}/>;
      if (page==="conteudo")       return <CoachConteudo user={user} refresh={refresh}/>;
      if (page==="resumos")        return <CoachResumos user={user} refresh={refresh}/>;
      if (page==="simulados")      return <CoachSimulados user={user} refresh={refresh}/>;
      if (page==="ranking")        return <CoachRanking   user={user}/>;
      if (page==="migracao")       return <CoachMigracao  user={user} alunos={usersModule.getAlunos(user.id)} refresh={refresh} setSuccessMessage={()=>{}}/>;
    }
    if (user.role === "aluno") {
      if (page==="dashboard") return <AlunoDashboard user={user} refresh={refresh} setPage={setPage}/>;
      if (page==="plano")     return <AlunoPlano     user={user} refresh={refresh}/>;
      if (page==="rotina")    return <AlunoRotina    user={user} refresh={refresh}/>;
      if (page==="progresso") return <AlunoProgresso user={user}/>;
      if (page==="conteudos") return <AlunoConteudos user={user}/>;
      if (page==="simulados") return <AlunoSimulados user={user} refresh={refresh}/>;
      if (page==="ranking")   return <AlunoRanking   user={user}/>;
    }
  };

  return (
    <Layout
      user={user}
      page={page}
      setPage={setPage}
      onLogout={() => { logModule.add(user.id, "Logout", {}); setUser(null); }}
    >
      {renderPage()}
    </Layout>
  );
}

