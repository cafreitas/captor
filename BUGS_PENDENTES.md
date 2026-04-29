# Captor — BUGS PENDENTES
> Atualizado em: 2026-04-28 | Versão: v6.4.3

---

## Status geral
Sessão de 2026-04-28 focou em UX do fluxo de proposta e validação de anotações.
Bugs críticos de refatoração (v6.2.x) já resolvidos. Itens abaixo são pendências abertas.

---

## BUG A — fillExampleAndOpen() pode ter regressão
**Arquivo**: `js/init.js`
**Status**: Não testado após refatoração
**Efeito esperado**: Botão "Experimente com um exemplo" abre prospectDetailView com dados de exemplo
**Verificar**: Se `fillExample()` preenche corretamente os campos `pd_*`

---

## BUG B — pd_ass, pd_gaps, pd_ctx não persistem no banco
**Arquivo**: `js/prospects.js` → `upsertProspect()`
**Status**: Comportamento a confirmar — pode ser intencional
**Ação**: Confirmar se esses campos devem ser persistidos em `prospects`

---

## BUG C — Fluxo completo R1 → R2 não testado end-to-end
**Status**: Implementado mas não testado em produção
**Testar**:
1. Abrir prospect → preencher form → Gerar R1
2. Anotações aparecem com pré-preenchimento?
3. Toggle "Preparar Reunião de Perfil" → valida Perfil + Objetivo + Horizonte?
4. Campos faltantes ficam com borda vermelha?
5. Botão "Preparar Proposta" aparece após toggle?
6. Gerar R2 → loader com steps → proposta renderizada?
7. Sliders alocação: clamp 100%, % dinâmicos, donut atualiza?
8. "Revisar proposta →" → abre nova aba → polling → auto-publish → link?
9. Reabrir prospect → R1 + anotações restauradas?

---

## BUG D — Autocomplete de assessoria (pd_ass) sem dropdown no HTML
**Arquivo**: `index.html`
**Status**: `acAssDrop` pode não existir próximo ao campo `pd_ass`
**Verificar**: Se `id="acAssDrop"` está no HTML estático

---

## BUG E — admin.html quebrado
**Arquivo**: `admin.html`
**Status**: `sb` nunca inicializado (sem `createClient`); tabela `user_roles` não existe no schema
**Impacto**: Dashboard de custos IA inacessível
**Ação**: Inicializar `sb`, criar tabela `user_roles` ou reformular autenticação admin

---

## BUG F — logAiUsage não chamado em 2 chamadas de IA
**Arquivo**: `js/init.js` (extração via site ~566), `js/generators.js` (extração transcrição ~566)
**Status**: Custo real subestimado no admin
**Ação**: Adicionar `logAiUsage('extrair_site', ...)` e `logAiUsage('extrair_transcricao', ...)`

---

## Não é bug — comportamento intencional
- Alocação atual (sliders pd_sl_*) não persiste em upsertProspect — salva em r1_notes
- globals.js deve estar na versão ANTERIOR ao rodar deploy (script faz o bump)
