# 📐 Captor — Arquitetura Técnica v6.0.7

**Última atualização:** 26 de abril de 2026  
**Versão:** v6.0.7

---

## 🏗️ Estrutura de pastas

```
~/Downloads/Captor/src/
├── index.html           (1168 linhas)
├── proposta.html        (404 linhas)
├── lp.html              (em desenvolvimento)
├── admin.html           (272 linhas)
├── favicon.ico
│
├── css/
│   └── app.css          (557 linhas — design system + componentes)
│
├── js/
│   ├── globals.js       (~800 linhas — variáveis globais, CAPTOR_VERSION, etc)
│   ├── auth.js          (97 linhas — autenticação Supabase + UI)
│   ├── prospects.js     (410+ linhas — CRUD, R1 toggle, table rendering)
│   ├── generators.js    (332 linhas — geração de propostas com IA)
│   ├── utils.js         (81 linhas — helpers (escHtml, formatters, etc))
│   ├── validation.js    (validações de formulário)
│   └── init.js          (3100+ linhas — funções UI, sliders, modals)
│
└── .git/                (Git workflow)
```

---

## 🔄 Fluxo de dados

```
Login (auth.js)
    ↓
AppState inicializa (globals.js)
    ↓
loadProspects() carrega dados (prospects.js)
    ↓
renderProspectTable() renderiza lista (prospects.js)
    ↓
openProspectDetail(id) abre detalhe (prospects.js)
    ↓
R1 toggle sincroniza estado (syncToggleR1 + onToggleR1)
    ↓
Sliders atualizam alocação (initPdSliders + updatePdAllocTotal)
    ↓
Gera proposta com IA (generators.js)
    ↓
Salva em Supabase (proposals table)
```

---

## 📦 Globals.js — Variáveis globais

```javascript
var CAPTOR_VERSION = 'v6.0.7';  // ← SEMPRE ATUALIZAR

var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

var AppState = {
  user: {
    id: null,
    email: null,
    company_id: null,
    credits: 10,
  },
  prospects: {
    all: [],          // array completo
    filtered: [],     // após filters/search
    currentId: null,
    sortCol: 'data',
    sortDir: {nome: 'asc', patrimonio: 'desc', data: 'desc'}
  },
  proposals: {
    list: [],
    current: null
  }
};

var prospectStatusLabels = {
  'prospect_criado': 'Criado',
  'r1_iniciada': 'R1 Iniciada',
  'r1_concluida': 'R1 Concluída',
  // ... (12 status totais)
};
```

---

## 🔐 Auth.js — Autenticação

**Funções principais:**

```javascript
function switchTab(tab)
  // Alterna entre Login / Signup / Manager
  // Gerencia UI (colors, visibility)

function enterApp()
  // Chamada após login bem-sucedido
  // Oculta #login, mostra #app
  // Atualiza nome do usuário (unEl, avEl)
  // Calls: loadProspects()

async function signupUser()
  // Cria novo user em auth.users
  // Calls: createDefaultCompany()

async function loginUser()
  // Autentica com email/senha
  // Calls: enterApp()
```

**⚠️ Bug conhecido:** Erro de timing em `enterApp()` linha 89. Fix pendente: adicionar null checks.

---

## 👥 Prospects.js — CRUD de prospects

**Estrutura de um prospect (Supabase):**

```javascript
{
  id: uuid,
  user_id: uuid,
  nome: "João Silva",
  email: "joao@example.com",
  telefone: "(11) 99999-9999",
  profissao: "Empresário",
  idade: 45,
  patrimonio_estimado: 2500000,  // em centavos
  perfil_risco: "Moderado",
  objetivo_principal: "Diversificação",
  horizonte_tempo: "10+ anos",
  status: "r1_iniciada",  // 12 status possíveis
  created_at: "2026-04-26T...",
  updated_at: "2026-04-26T..."
}
```

**Funções principais:**

```javascript
async function loadProspects()
  // Fetch all prospects from Supabase
  // Sorts by status (UNPROCESSED first)
  // Calls: renderProspectTable()

function renderProspectTable(rows)
  // Renderiza tbody com estilos completos
  // Inline styles: borders, hover, colors
  // Mostra ponto verde para novos (UNPROCESSED)
  // onclick: openProspectDetail(id)

function openProspectDetail(id)
  // Carrega prospect para prospectDetailView
  // Inicializa sliders (initPdSliders)
  // Sincroniza toggle R1 (syncToggleR1)

function syncToggleR1(status)
  // Sincroniza estado do toggle com status
  // Se r1_concluida → checked = true
  // Else → checked = false

function onToggleR1(checked)
  // Event handler do toggle
  // Atualiza AppState + Supabase
  // Calls: updateAllButtonStates()

async function markPerdidoUser(id)
  // Marca prospect como "perdido_user"
  // Com confirmação modal
  // Calls: loadProspects()

function fillExampleAndOpen()
  // Preenche formulário com dados de exemplo
  // Abre prospectDetailView em modo "Exemplo"
  // Útil para demo/UX
```

---

## 🎨 Init.js — UI, sliders, modals

**Principais funções (v6.0.7):**

```javascript
function initSliders()
  // Inicializa sliders de alocação (9 asset classes)
  // range type inputs
  // Calls: onSliderChange()

function initPdSliders()
  // Inicializa sliders do prospectDetailView
  // Différente de initSliders (contexto de detalhe)
  // Calls: onPdSliderChange()

function updatePdAllocTotal()
  // Recalcula total de alocação
  // Valida se soma = 100%
  // Mostra warning se ≠ 100%

function resetPdSliders()
  // Reseta todos sliders para 0 (ou padrão)
  // Calls: updatePdAllocTotal()

function syncFormToSidebar()
  // Sincroniza valores do formulário pro sidebar
  // Atualiza sumário visual
  // Chamada ao abrir/atualizar prospect

// ... mais 50+ funções de modal/UI control
```

**IIFE no final (auto-executa):**
```javascript
(function(){
  // Atualiza versão dinamicamente em 3 elementos
  var v = CAPTOR_VERSION;
  var el1 = document.getElementById('hverEl');
  var el2 = document.getElementById('footerLoginVersion');
  var el3 = document.getElementById('footerMainVersion');
  if(el1) el1.textContent = v;
  if(el2) el2.textContent = v;
  if(el3) el3.textContent = v;
})();
```

---

## 🤖 Generators.js — Geração de propostas

**Fluxo:**

```
User clica "Gerar proposta"
  ↓
Valida formulário
  ↓
Calls generateProposalWithAI()
  ↓
Envia dados + prompt para Edge Function
  ↓
Claude Sonnet gera análise + alocação
  ↓
Salva em proposals table
  ↓
Renderiza resultado em prospectDetailView
```

**Modelo:** Claude Sonnet 4 (claude-sonnet-4-20250514)
**Max tokens:** 4000 (geração)
**Custo:** ~0.38 BRL por proposta
**Créditos:** 0.4 credits por geração

---

## 💾 Banco de dados (Supabase)

**Principais tabelas:**

### prospects
- Campos: id, user_id, nome, email, ..., status, created_at, updated_at
- Primary key: id
- Foreign key: user_id → auth.users

### proposals
- Campos: hash, user_id, cliente_nome, ..., alocacao_renda_fixa, ..., analise_ia, status, feedback_rating
- Primary key: hash (uuid)

### company_profiles
- Campos: user_id, empresa_nome, empresa_segmento, brand_colors[], produtos[], regras_alocacao (jsonb), etc
- Primary key: user_id

### user_credits
- Campos: user_id, saldo, total_ganho, total_usado, auto_recarga
- Primary key: user_id

---

## 🎯 Design system (CSS variables)

```css
:root {
  --bg:#1e1e1e;
  --lime:#a8c23a;
  --border:#404040;
  --text:#f0f0f0;
  --r:8px;
  --f: system-ui, sans-serif;
}
```

**Cores de status:**
- Criado: #c0c0c0 (cinza)
- R1 Iniciada: #fbbf24 (amarelo)
- R1 Concluída: #86efac (verde)
- R2: #60a5fa (azul)
- Perdido: #f87171 (vermelho)

---

## 🔄 Workflow de desenvolvimento

**Setup local:**
```bash
cd ~/Downloads/Captor/src
git status
```

**Criar feature:**
```bash
git checkout -b feature/nome-descritivo
# editar arquivos
# testar
node --check js/arquivo.js  # validar
git add arquivo.js
git commit -m "feat: descrição"
git push origin feature/nome-descritivo
# GitHub: create PR → merge
```

**Release:**
```bash
# 1. Atualizar globals.js
CAPTOR_VERSION = 'vX.X.X'

# 2. Commit e tag
git add globals.js
git commit -m "chore: bump version to vX.X.X"
git tag -a vX.X.X -m "release notes"
git push origin main vX.X.X
```

---

## 📋 Checklist de release

- [ ] Versão atualizada em `globals.js`
- [ ] Sintaxe validada com `node --check`
- [ ] Testado no navegador (console limpo)
- [ ] Commit message segue padrão (feat/fix/chore)
- [ ] PR mergeada em main
- [ ] Tag criada e pushada
- [ ] GitHub Pages atualizado (~5-10 min delay)

---

## 🚀 Deployment

**Hospedagem:** GitHub Pages  
**URL:** https://cafreitas.github.io/captor/  
**Branch:** main  
**Arquivos:** index.html, proposta.html, favicon.ico, css/app.css, js/*

**Deploy automático:** Push para main → GitHub Actions → pages rebuilt em ~2 min

---

## 🐛 Bugs conhecidos (v6.0.7)

| Severidade | Descrição | Workaround | Fix |
|-----------|-----------|-----------|-----|
| MEDIUM | Versão hardcoded em `<title>` | N/A | Update init.js IIFE |
| MEDIUM | Duplicação de `sb` em admin.html | Funciona mesmo assim | Remover de admin.html |
| LOW | Erro ao fazer login (null style) | Recarregar página | Add null checks em auth.js |

---

## 📚 Referências

- **GitHub repo:** https://github.com/cafreitas/captor
- **Supabase dashboard:** https://app.supabase.com
- **Anthropic API docs:** https://docs.anthropic.com
- **Claude Sonnet specs:** claude-sonnet-4-20250514

---

**Próxima sessão:** Comece pelos bugs ou continue com features do backlog.
