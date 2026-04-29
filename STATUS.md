# Captor — STATUS.md
> Atualizado em: 2026-04-28 | Versão atual: v6.4.3

---

## Versão atual
`v6.4.3` — em produção em https://cafreitas.github.io/captor/

## Stack
- HTML/JS separado em múltiplos arquivos (sem framework)
- Supabase (auth + DB): `https://fllkczocfcbrfsyhxelg.supabase.co`
- AI proxy: `/functions/v1/anthropic-proxy` | Model: `claude-sonnet-4-20250514` | max_tokens: 3000 (R1) / 4000 (R2)
- GitHub Pages: `https://cafreitas.github.io/captor/` | repo: `cafreitas/captor`, branch `main`
- Deploy: `deploy_captor_v2.py` em `~/Downloads/Captor/src/`
- Arquivos: `index.html`, `proposta.html`, `js/globals.js`, `js/init.js`, `js/auth.js`, `js/prospects.js`, `js/generators.js`, `js/utils.js`, `js/validation.js`, `css/app.css`

## Estrutura de arquivos JS
| Arquivo | Responsabilidade |
|---------|-----------------|
| `globals.js` | Variáveis globais, versão, SUPABASE_URL/KEY, PROXY_URL, AppState, ALLOC_CATS, ALLOC_DEFAULT (ranges [min,max]), ASS_LIST, PROF_LIST, TERMS_CONTENT |
| `init.js` | UI init, sliders, autocomplete profissão/assessoria, fillExample, syncFormToSidebar, renderR1Output, showTab, collapseSidebar/expandSidebar, créditos/energy bar, config empresa, Pix/AbacatePay, updateAllocSliders, reviewProposal, autoPublishProposal, startApprovalPolling |
| `auth.js` | Login, logout, enterApp, loadFirmRole |
| `prospects.js` | Lista prospects, openProspectDetail, upsertProspect, renderProspectTable, clearProspectForm, openNewProspectDetail, closeProspectDetail (autosave), syncToggleR1, onToggleR1 |
| `generators.js` | generateR1(), generate() R2, appendAnotacoesBlock(), buildAnotacoesR1HTML(), buildAllocPrompt(), buildR1NotesContext(), getSliderAlloc(), collectR1Notes(), restoreR1Notes(), isValidacaoPreenchida(), validacaoHighlight(), preencheValidacao(), extractFromTranscricao(), maskR1Pat(), autoSaveR1Notes(), getValidacaoData(), logAiUsage(), calcularCustoApi() |
| `utils.js` | showToast, maskPdPat, getRawPat |
| `validation.js` | requiredFieldsFilled(), updateAllButtonStates(), updateR2ButtonState(), onFieldChange(), initButtonStateListeners() |
| `css/app.css` | Design system dark theme |

## Supabase schema relevante
**`prospects`** (colunas confirmadas):
`id`, `assessor_id`, `firm_id`, `nome`, `profissao`, `idade`, `patrimonio_estimado`, `perfil_risco`, `objetivo`, `horizonte`, `status`, `roteiro_r1` (jsonb), `r1_notes` (jsonb), `perfil_inicial` (jsonb), `perfil_validado` (jsonb), `r1_mode`, `email`, `telefone`, `created_at`, `updated_at`

**`company_profiles`**: `id`, `user_id`, `empresa_nome`, `empresa_segmento`, `empresa_anos`, `empresa_aum`, `empresa_clientes`, `empresa_credenciadora`, `empresa_diferenciais`, `empresa_premios`, `produtos`, `produtos_investimento`, `produtos_servicos`, `produtos_premium`, `expertise`, `regras_alocacao` (jsonb), `brand_colors` (array), `owner_tax_id`, `owner_cellphone`, `firm_id`

**`user_credits`**: `user_id`, `saldo`, `total_ganho`, `total_usado`, `auto_recarga`

**`proposals`**: `hash`, `user_id`, `cliente_*`, `alocacao_*`, `analise_ia`, `empresa_snapshot`, `status`, `feedback_rating`, `feedback_texto`

**`ai_usage_logs`**: `user_id`, `action_type`, `proposal_id`, `model`, `tokens_input`, `tokens_output`, `custo_usd`, `timestamp`, `status`
*(tabela existe em produção — usada por logAiUsage() e admin.html)*

## Status das funcionalidades

### ✅ Funcionando
- Login / Auth / Logout
- Créditos / energy bar no header
- Configuração de empresa (modal 4 steps)
- Lista de Prospects (tabela com sort/filter)
- Abrir prospect com dados preenchidos corretamente
- Autosave ao fechar prospect
- Nome do prospect atualizado em tempo real
- generateR1() — roteiro R1 completo com loader visível
- Bloco "Anotações Reunião de Perfil" com 3 abas (Durante / Depois / Transcrição)
- Pré-preenchimento das anotações com dados do formulário pd_*
- Autosave das anotações R1 (debounce 2s)
- Toggle "Preparar Reunião de Perfil" — valida Perfil + Objetivo + Horizonte (obrigatórios), highlight visual em campos faltantes, toast com lista dos campos ausentes
- generate() R2 — prompt completo com anotações R1, alocação atual, animação de steps
- Extração de transcrição com IA
- Restauração do R1 e anotações ao reabrir prospect
- Autocomplete profissão (pd_prof) e assessoria (pd_ass)
- Fluxo proposta 3 fases: "Revisar proposta →" → aguardando aprovação (polling) → auto-publish + link
- Sliders de alocação da proposta: clamp 100%, lock sliders zerados, % dinâmicos, donut atualiza

### ⚠️ A testar / verificar
- Fluxo completo R1 → Anotações → Toggle → R2 → Revisar → Aprovar → Link (end-to-end)
- fillExampleAndOpen() — não testado após refatoração
- Propostas (dashview) — parcialmente funcional

### 🔜 Não implementado
- Pagamentos AbacatePay Pix (estrutura existe, não testado em produção)
- Teams completo (convites, gestor dashboard)
- Notificações (email, in-app)
- LP (landing page)
- Múltiplos perfis SDR
- RLS audit / LGPD

## Decisões técnicas importantes
- **Modelo**: `claude-sonnet-4-20250514` tanto para código quanto no Captor
- **NUNCA usar "rapport"** — usar: conexão, confiança, proximidade, abertura, sintonia
- **SemVer**: features = minor bump, bugfixes = patch bump
- **Sempre confirmar antes de gerar código**
- **Sempre trabalhar do arquivo enviado, nunca de cache**
- **node --check obrigatório antes de qualquer entrega**
- **ALLOC_DEFAULT** usa formato `[min, max]` por categoria
- **Alocação atual (sliders pd_sl_*)** salva em r1_notes, não em upsertProspect
- **globals.js deve estar em v anterior** ao rodar deploy — o script faz o bump automaticamente

## Issues conhecidos (não críticos)
- `admin.html`: `sb` nunca inicializado (createClient ausente) + tabela `user_roles` não existe → admin quebrado
- `init.js` linha 325–327: PROXY_URL/SUPABASE_URL/KEY duplicados (também em globals.js)
- `getSliderAlloc()` duplicado em init.js e generators.js
- `logAiUsage` não chamado em: extração via site (init.js ~566) e extração de transcrição (generators.js)
- `pd_ass`, `pd_gaps`, `pd_ctx` — persistência no banco a confirmar

## Changelog desta sessão (2026-04-28)
- `v6.4.3` — fix sliders alocação proposta: clamp 100%, lock zerados, % dinâmicos (vl bug)
- `v6.4.2` — textos: "Preparar Reunião de Perfil", "Anotações Reunião de Perfil"; validação obrigatória Perfil+Objetivo+Horizonte com highlight visual
- `v6.4.1` — renomear botões R1/R2: "Preparar Reunião de Perfil", "Preparar Proposta"
- `v6.4.0` — fluxo proposta simplificado: CTA único "Revisar proposta →", 3 fases progressivas, auto-publish
- `v6.3.2` — generate() R2 portado; buildAllocPrompt, buildR1NotesContext; ALLOC_DEFAULT corrigido
