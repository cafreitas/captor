# 🚀 Captor v6.0.7 — Guia para Próxima Sessão

**Data:** 26 de abril de 2026  
**Última release:** v6.0.7  
**Status:** ✅ Pronta para produção

---

## 📋 Resumo do que foi feito em v6.0.7

### Problemas resolvidos
1. **Refatoração de código incompleta** — funções perdidas durante separação em módulos
2. **Versão desincronizada** — v6.0.6 hardcoded em 4 lugares
3. **Tabela sem estilos** — prospects table rendendo sem CSS/hover
4. **Toggle R1 quebrado** — `syncToggleR1()` e `onToggleR1()` faltando
5. **Slider de detalhe quebrado** — `initPdSliders()` e funções relacionadas faltando
6. **Botão "Novo prospect" não funcionava** — `fillExampleAndOpen()` ausente

### Arquivos modificados
- **index.html** — Versão dinâmica em 3 elementos (header, footer login, footer main)
- **globals.js** — Atualizado para v6.0.7
- **init.js** — Adicionadas: `initSliders`, `initPdSliders`, `updatePdAllocTotal`, `resetPdSliders`, `syncFormToSidebar`
- **prospects.js** — Adicionadas: `syncToggleR1`, `onToggleR1`, `renderProspectTable` (com estilos), `fillExampleAndOpen`, `markPerdidoUser`

### Commits
```
5ba9198 - chore: v6.0.7 - dynamic version display + all slider functions
3626adc - fix: restore prospect table styling and missing functions
```

---

## 🔧 Como continuar amanhã

### 1. Comece carregando o contexto
Na próxima sessão, você pode fazer upload deste arquivo para que eu tenha contexto imediatamente:
- Este arquivo (PRÓXIMA_SESSÃO.md)
- ARCHITECTURE_UPDATED.md (veja abaixo)
- STATUS.md do GitHub (se houve mudanças)

### 2. Estrutura do projeto (não mudou)
```
~/Downloads/Captor/src/
├── index.html           (1168 linhas — UI core)
├── favicon.ico
├── proposta.html
│
├── css/
│   └── app.css          (556 linhas — design system)
│
├── js/
│   ├── globals.js       (18 KB — variáveis globais + v6.0.7)
│   ├── auth.js          (350 linhas — autenticação)
│   ├── prospects.js     (410 linhas — CRUD prospects + R1 toggle + table)
│   ├── generators.js    (332 linhas — geração de propostas)
│   ├── utils.js         (81 linhas — helpers)
│   ├── validation.js    (? linhas — validações)
│   └── init.js          (3100+ linhas — funções gerais + sliders)
```

### 3. Git workflow (padrão)
```bash
cd ~/Downloads/Captor/src

# 1. Criar branch
git checkout -b fix/ou-feature/nome

# 2. Editar arquivos
# ...

# 3. Testar no navegador
# Cmd+Shift+R para hard refresh

# 4. Validar JS
node --check js/arquivo.js

# 5. Commit + push
git add arquivo.js
git commit -m "type: descrição"
git push origin nome-branch

# 6. GitHub: criar PR → review → merge

# 7. Tag se release
git tag -a vX.X.X -m "descrição"
git push origin vX.X.Z
```

### 4. Versioning
- **SemVer obrigatório:** patch (bugfix), minor (feature), major (breaking)
- **Antes de commitar:** atualizar `CAPTOR_VERSION` em `globals.js`
- **Versão aparece em 3 lugares:** header badge + footer login + footer main (automático via init.js IIFE)

---

## ⚠️ Bugs conhecidos que ficaram no backlog

1. **[MEDIUM] Versão hardcoded em `<title>`**
   - `<title>Captor — Pré-vendas eficiente e inteligente</title>`
   - Deveria ser dinâmico também
   - Fix: `document.title = 'Captor — ' + CAPTOR_VERSION`

2. **[MEDIUM] Duplicação de `supabase.createClient()`**
   - `admin.html` e `proposta.html` também têm `var sb=...`
   - Deveria carregar de globals.js
   - Status: Identificado, não urgente (funciona mesmo duplicado)

3. **[LOW] Erro no console ao fazer login**
   - `Cannot read properties of null (reading 'style')` — auth.js:89
   - Possível timing issue com DOM
   - Não bloqueia funcionalidade
   - Fix: Adicionar null checks em `enterApp()`

---

## 🎯 Próximas features no backlog

(Veja STATUS.md no GitHub para lista completa)

**Alta prioridade:**
- Transactional emails (proposta enviada, aceita, expira)
- Dashboard de créditos por assessor
- Dark mode (já tem CSS, só ativar toggle)

**Média prioridade:**
- Mobile testing e responsiveness
- Notificações in-app
- Preview link de proposta
- Exportar CSV de prospects

**Baixa prioridade:**
- Landing page em `lp.html`
- Analytics (GA4)
- Design system para corretoras (auto-adjust cores)

---

## 📚 Documentação do projeto

**Arquivos principais:**
- `ARCHITECTURE_UPDATED.md` — Detalhes técnicos (functions, fluxos, DB)
- `STATUS.md` — Backlog organizado (veja no GitHub)
- `README.md` — Overview do projeto

**Ao comitar:**
- Atualizar CHANGELOG em STATUS.md se necessário
- Rodar `node --check` em todos os arquivos JS antes de commitar
- Testar no navegador com F12 console aberto

---

## 🔐 Variáveis de ambiente (já configuradas)

```javascript
// Em globals.js
var SUPABASE_URL = 'https://fllkczocfcbrfsyhxelg.supabase.co';
var SUPABASE_KEY = 'sb_publishable_U2pVXIhyNH3s085cUjAmrA_...';
var ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
var PROXY_URL = '/functions/v1/anthropic-proxy';
var CAPTOR_VERSION = 'v6.0.7';  // ← Atualizar aqui em cada release
```

---

## 📞 Contato rápido com histórico

Se algo quebrar:
1. Procure no arquivo de transcrição da sessão anterior
2. Use `grep -r "function_name"` para localizar código
3. Procure no Git history: `git log --all -S "pattern"`
4. Valide sintaxe: `node --check arquivo.js`

---

## ✅ Checklist antes de commitar qualquer coisa

- [ ] Sintaxe validada com `node --check`
- [ ] Testado no navegador (F12 console)
- [ ] Sem console errors
- [ ] Versão atualizada em `globals.js` (se release)
- [ ] Commit message descritivo: `type: descrição`
- [ ] Push para branch com nome padrão: `fix/...` ou `feature/...`

---

**Próxima sessão:** Começa por aqui! 🚀
