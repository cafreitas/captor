# 🤖 Claude.md — Instruções de trabalho com Captor

**Para:** Claude (assistente)  
**Projeto:** Captor (pré-vendas, investimento)  
**Versão atual:** v6.0.7  
**Atualizado:** 26 de abril de 2026

---

## 📏 Regra #1: SEMPRE CONFIRMAR ANTES DE EXECUTAR

**Global rule:** Em toda interação, **apresentar o plano e aguardar aprovação explícita** antes de:
- Escrever código
- Editar arquivos
- Executar comandos
- Fazer qualquer mudança

**Não há exceção.** Nem mesmo para tarefas aparentemente simples.

---

## 💬 Comunicação com Carlos

- **Direto e técnico** — sem rodapés, explicações mínimas
- **Listas numeradas** — quando apresentar opções (Carlos escolhe pelo número)
- **Decisões rápidas** — batching de items relacionados, revisar plano antes de codificar
- **Evitar:** "rapport", substituir por "conexão/confiança/sintonia"

---

## 🔧 Padrões de desenvolvimento

### SemVer obrigatório
- `patch` (bugfix): vX.X.Z
- `minor` (feature): vX.Y.0
- `major` (breaking): vX.0.0

### Versioning workflow
1. Atualizar `globals.js`: `var CAPTOR_VERSION = 'vX.X.Z'`
2. Commit: `chore: bump version to vX.X.Z`
3. Changelog atualizado (em STATUS.md)
4. Tag: `git tag -a vX.X.Z -m "descrição"`
5. Push: `git push origin vX.X.Z main`

### Validação obrigatória
```bash
node --check js/arquivo.js
```
Rodar **antes de qualquer PR/push** em arquivos JS.

### Quotes em event handlers
- ✅ CORRETO: `onclick="openProspectDetail(\'id\')"` (usar `\'`)
- ❌ ERRADO: `onclick="openProspectDetail('id')"` (nunca typographic quotes)

---

## 🎨 Design system (reference)

**Dark theme:**
- Background: `#1e1e1e`, `#272727`, `#2e2e2e`
- Border: `#404040`, `#4a4a4a`
- Text: `#f0f0f0` (normal), `#a0a0a0` (muted)
- Accent (lime): `#a8c23a` (primary), `#c0d85a` (hover)
- Gold: `#e0b840`

**Tokens:**
- Radius: `--r: 8px`, `--rl: 14px`
- Font: `system-ui` (no custom fonts)

**9 asset classes:** Renda Fixa, Ações, Fundos Imobiliários, Criptomoedas, Ouro, Commodities, Fundos Estruturados, ETFs, Previdência

**4 perfis:** Conservador, Moderado, Arrojado, Agressivo

---

## 📁 Estrutura de arquivos — Nunca confundir

| Arquivo | Linhas | Responsabilidade |
|---------|--------|------------------|
| `index.html` | 1168 | UI core (login, app, modals, header) |
| `globals.js` | ~800 | Variáveis globais, AppState, CAPTOR_VERSION |
| `auth.js` | 97 | Autenticação, UI login/signup |
| `prospects.js` | 410+ | CRUD prospects, table, R1 toggle |
| `generators.js` | 332 | IA para propostas (Edge Function) |
| `init.js` | 3100+ | Sliders, modals, inicialização |
| `utils.js` | 81 | Helpers (`escHtml`, formatters) |
| `app.css` | 557 | Design system + componentes |

**⚠️ DOM ID discipline is critical**
- Múltiplas views compartilham IDs similares
- Mismatches causam silent loading failures
- Use `view` tool para validar IDs antes de editar

---

## 🔄 Workflow padrão

### Para bugfix:
```bash
git checkout -b fix/descrição
# editar + validar + testar
node --check js/arquivo.js
git add arquivo.js
git commit -m "fix: descrição"
git push origin fix/descrição
# GitHub: PR → review → merge (squash merge preferível)
```

### Para feature:
```bash
git checkout -b feature/descrição
# idem
git commit -m "feat: descrição"
```

### Para release:
```bash
# 1. Atualizar globals.js
git add globals.js
git commit -m "chore: bump version to vX.X.Z"
git tag -a vX.X.Z -m "..."
git push origin main vX.X.Z
```

---

## 🎯 Funções críticas — Nunca quebrar

**Em prospects.js:**
- `loadProspects()` — carrega dados
- `renderProspectTable()` — renderiza lista
- `openProspectDetail(id)` — abre detalhe
- `syncToggleR1(status)` — sincroniza toggle
- `onToggleR1(checked)` — event handler do toggle

**Em init.js:**
- `initSliders()` — inicializa sliders de alocação
- `initPdSliders()` — inicializa sliders de detalhe
- `updatePdAllocTotal()` — recalcula alocação
- `syncFormToSidebar()` — sincroniza valores

**Em auth.js:**
- `enterApp()` — prepara app após login
- `switchTab(tab)` — alterna aba login/signup

---

## 🔐 Credenciais (em globals.js)

```javascript
var SUPABASE_URL = 'https://fllkczocfcbrfsyhxelg.supabase.co';
var SUPABASE_KEY = 'sb_publishable_U2pVXIhyNH3s085cUjAmrA_...';
var ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
var PROXY_URL = '/functions/v1/anthropic-proxy';
```

**Nunca commit credenciais diretas.** Estão já em globals.js (públicas).

---

## 💰 Credits system (reference)

- **1 credit = R$1.00**
- **Geração proposta:** −0.4 credits
- **Regeneração:** −0.4 credits
- **PDF extraction:** −0.2 credits
- **Publishing:** grátis
- **Free on signup:** 10 credits
- **Packages:** R$10=8cr, R$25=20cr, R$50=40cr

**API cost:** ~87% da receita a R$1.00/cr

---

## 🚀 Deployment

**Plataforma:** GitHub Pages  
**URL:** https://cafreitas.github.io/captor/  
**Trigger:** Push para `main` → GitHub Actions → rebuild em ~2 min  
**Cache:** ~5-10 min no navegador (cmd+shift+R para hard refresh)

---

## 🐛 Debugging workflow

**Console errors:**
```javascript
// Abrir F12 → Console
// Procurar "Cannot read properties of null"
// → Elemento não existe ou carregou tarde
```

**Função não encontrada:**
```bash
grep -r "function_name" ~/Downloads/Captor/src/
grep -r "function_name" ~/Downloads/Captor/src/index-old.html
```

**Git history:**
```bash
git log --all -S "pattern"
git show commit_hash
```

---

## 📋 Checklist antes de push

- [ ] Sintaxe validada com `node --check`
- [ ] Testado no navegador (F12 console vazio)
- [ ] Sem console.errors
- [ ] Versão atualizada em globals.js (se release)
- [ ] Commit message descritivo
- [ ] Branch naming: `fix/...` ou `feature/...`
- [ ] PR criada no GitHub (se necessário)

---

## 🎓 Lições aprendidas (importantes)

1. **Central state functions must own all logic**
   - `updateAllButtonStates()` é autoridade sobre estado de botões
   - Callers nunca devem re-enable UI unconditionally
   - Caso contrário = regressão garantida

2. **Dynamic ID construction is fragile**
   - Usar maps explícitos em vez de templates
   - Ex: `triPat` vs `triPatrimonio` bug descoberto em v6.0.7

3. **Race conditions in modals**
   - Às vezes precisa small timeout (`setTimeout(() => {...}, 100)`)
   - Investigar root cause em DOM state, não aplicar patch cego

4. **Render functions precisam de todos estilos inline**
   - Se `renderProspectTable()` não tem borders, a tabela fica feia
   - Procurar em `index-old.html` pelo padrão original

5. **Test in browser immediately**
   - Não confie em análise visual do código
   - Abrir DevTools, clicar, validar

---

## 📞 Stack técnico (reference)

| Componente | Tecnologia | Observação |
|-----------|-----------|-----------|
| Frontend | HTML5 + JS vanilla | Sem frameworks (propositalmente) |
| Styling | CSS3 (custom properties) | Dark theme, zero deps externas |
| Backend/Auth | Supabase | PostgreSQL + Auth |
| AI | Claude Sonnet 4 | Via Edge Function proxy |
| Payments | AbacatePay Pix | Webhooks + polling |
| Hosting | GitHub Pages | Deploy automático |
| Versionamento | Git + SemVer | Tags na main |

---

## 🎯 Próximos passos

1. **Hoje (v6.0.7):** ✅ Pronta
2. **Amanhã:** Começar por bugs do backlog ou features
3. **Carregue ao iniciar sessão:**
   - Este arquivo (CLAUDE.md)
   - ARCHITECTURE.md
   - PRÓXIMA_SESSÃO.md
   - Transcript da sessão anterior (se houver)

---

**Good luck! 🚀**
