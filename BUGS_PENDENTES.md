# Captor — BUGS PENDENTES v6.2.0
> Gerado em: 2026-04-28 | Base: análise de index-old.html vs código atual

---

## Contexto
Todos os bugs abaixo são consequência da refatoração do monolito `index-old.html` para arquivos JS separados. Os IDs dos campos mudaram (`fNome` → `pd_nome` etc.) mas muitas funções não foram atualizadas.

**Referência canônica**: `index-old.html` no repositório (v6.0.6).

---

## BUG 1 — `clearProspectForm()` não limpa campos `pd_*`
**Arquivo**: `js/prospects.js`
**Causa**: Limpa `fNome`, `fPat`... (IDs antigos) em vez de `pd_nome`, `pd_pat`...
**Efeito**: Ao criar novo prospect, campos do formulário não são limpos
**Correção**: Substituir todos os `f*` por `pd_*` e adicionar limpeza de estado:
```javascript
function clearProspectForm() {
  AppState.prospects.currentId = null;
  AppState.prospects.r1Generated = false;
  ['pd_nome','pd_pat','pd_prof','pd_idade','pd_perfil','pd_obj',
   'pd_horizonte','pd_ass','pd_gaps','pd_ctx'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('confirmR1Wrap').style.display = 'none';
  syncToggleR1(null);
  updateR2ButtonState(null);
  resetPdSliders();
}
```

---

## BUG 2 — `openNewProspectDetail()` não abre modal e não limpa corretamente
**Arquivo**: `js/prospects.js`
**Causa**: Vai direto para o form sem abrir modal `prospectMethodModal`. Limpa campos `f*` em vez de `pd_*`
**Efeito**: Botão "+ Novo prospect" não funciona corretamente
**Correção**: Seguir o padrão do original — abrir modal, e `openProspectMethodManual()` faz a limpeza dos campos `pd_*`:
```javascript
function openNewProspectDetail() {
  document.getElementById('prospectMethodModal').style.display = 'flex';
}
function openProspectMethodManual() {
  // fechar modal, limpar pd_*, mostrar detail view
  // ver implementação completa em index-old.html linhas 6229-6258
}
```
**Obs**: Modal `prospectMethodModal` precisa existir no HTML (verificar se foi incluído)

---

## BUG 3 — `fillExample()` / `fillExampleAndOpen()` preenchem `f*` em vez de `pd_*`
**Arquivo**: `js/init.js`
**Causa**: `fillExample()` (linhas 2138-2146 de init.js atual) e código de limpeza (2169-2177) usam IDs antigos
**Efeito**: Botão "USAR EXEMPLO" não preenche o formulário visible
**Correção**: Trocar todos os `getElementById('fNome')` etc. por `getElementById('pd_nome')` etc. dentro de `fillExample()` e `fillExampleAndOpen()`

---

## BUG 4 — Autocomplete profissão preenche `fProf` em vez de `pd_prof`
**Arquivo**: `js/init.js`
**Causa**: `acSelect(val)` (linha ~113) faz `document.getElementById('fProf').value = val`
**Efeito**: Ao selecionar sugestão de profissão no autocomplete, `pd_prof` não é preenchido
**Correção**:
```javascript
function acSelect(val) {
  document.getElementById('pd_prof').value = val;
  acHide();
  syncFormToSidebar();
  onFieldChange();
}
```

---

## BUG 5 — Autocomplete assessoria preenche `fAss` em vez de `pd_ass`
**Arquivo**: `js/init.js`
**Causa**: `acAssSelect(val)` faz `document.getElementById('fAss').value = val`
**Efeito**: Ao selecionar sugestão de assessoria, `pd_ass` não é preenchido
**Correção**:
```javascript
function acAssSelect(val) {
  document.getElementById('pd_ass').value = val;
  acAssHide();
  syncFormToSidebar();
  onFieldChange();
}
```
E `acAssFilter()` deve ler de `pd_ass` em vez de `fAss`.

---

## BUG 6 — R1 existente não é renderizado ao reabrir prospect
**Arquivo**: `js/prospects.js`
**Causa**: `openProspectDetail()` não verifica se prospect tem `roteiro_r1` e não chama `renderR1Output()`
**Efeito**: Ao reabrir um prospect que já teve R1 gerado, o resultado não aparece — apenas o formulário vazio
**Correção**: Adicionar ao final de `openProspectDetail()`, após popular o form:
```javascript
if (prospect.roteiro_r1) {
  var patFmt = prospect.patrimonio_estimado
    ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(prospect.patrimonio_estimado)
    : 'patrimônio a confirmar';
  document.getElementById('emptyState').style.display = 'none';
  AppState.prospects.r1Generated = true;
  renderR1Output(prospect.nome, patFmt, prospect.roteiro_r1);
}
```

---

## BUG 7 — `confirmR1Wrap` não aparece quando R1 existe
**Arquivo**: `js/prospects.js`
**Causa**: `openProspectDetail()` não seta `confirmR1Wrap.style.display`
**Efeito**: Toggle "R1 finalizada" nunca aparece
**Correção**: Adicionar em `openProspectDetail()`:
```javascript
var showToggle = ['r1_concluida','resumo_enviado','r1_aprovada','r2_iniciada','negocio_fechado'];
document.getElementById('confirmR1Wrap').style.display =
  (prospect.roteiro_r1 || showToggle.indexOf(prospect.status) >= 0) ? 'flex' : 'none';
```

---

## BUG 8 — `generateR1()` não mostra `confirmR1Wrap` após gerar
**Arquivo**: `js/generators.js`
**Causa**: Após renderizar o R1, não atualiza visibilidade do `confirmR1Wrap`
**Efeito**: Toggle "R1 finalizada" não aparece após geração
**Correção**: Após `renderR1Output()` em `generateR1()`:
```javascript
document.getElementById('confirmR1Wrap').style.display = 'flex';
var p = AppState.prospects.currentId
  ? AppState.prospects.all.find(function(x){return x.id===AppState.prospects.currentId;})
  : null;
syncToggleR1(p ? p.status : null);
```

---

## BUG 9 — `initSliders()` TypeError em alguns contextos
**Arquivo**: `js/init.js`
**Causa**: `getElementById('allocSliders')` retorna null em alguns contextos
**Efeito**: Erro no console, sliders da genView não inicializados
**Correção**: Adicionar guard:
```javascript
function initSliders() {
  var wrap = document.getElementById('allocSliders');
  if (!wrap) return; // guard
  wrap.innerHTML = '';
  // ...resto igual
}
```

---

## BUG 10 — `horizonte` pode não estar persistindo
**Arquivo**: `js/prospects.js`
**Status**: A investigar — o campo está no payload de `upsertProspect()` mas Carlos reportou que não persiste em alguns casos
**Possível causa**: SELECT `pd_horizonte` com valor não correspondendo a nenhuma option ao popular
**Investigar**: Verificar se `spd('pd_horizonte', prospect.horizonte)` seta corretamente o SELECT

---

## Não é bug — comportamento intencional

### Alocação atual (sliders `pd_*`) não persiste
Os sliders de alocação atual (`pd_sl_0` a `pd_sl_8`) **não são salvos em `upsertProspect()`** — esse é o comportamento do código original. A alocação é salva em `r1_notes` (jsonb) quando o assessor preenche as anotações durante/após a reunião R1.

### Campos `pd_ass`, `pd_gaps`, `pd_ctx` não persistem
Esses campos são contextuais da sessão. Em `populatePdForm()` no original, sempre são setados como `''` ao carregar um prospect. Não são colunas da tabela `prospects`.

---

## Plano de correção — v6.2.0

**Abordagem**: Reescrever os arquivos problemáticos baseado fielmente em `index-old.html`, não fazer patches pontuais.

**Ordem de trabalho**:
1. `js/validation.js` — mais simples, IDs corretos (já feito parcialmente)
2. `js/prospects.js` — maior impacto, bugs 1-2-6-7-10
3. `js/generators.js` — bug 8
4. `js/init.js` — bugs 3-4-5-9

**Referências no index-old.html**:
- `populatePdForm()`: linha 6043
- `openProspectDetail()`: linha 6063
- `openProspectMethodManual()`: linha 6229
- `fillExampleAndOpen()`: linha 6203
- `upsertProspect()`: linha 5775
- `generateR1()`: linha 5075
- `renderR1Output()`: linha 5204
- `clearProspectForm()`: linha 5053
- `requiredFieldsFilled()`: linha 4926
- `acSelect()`: linha 1618
- `acAssSelect()`: linha 1546
- `initSliders()`: linha 1714
