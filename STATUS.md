# Captor — STATUS.md
> Atualizado em: 2026-04-28 | Versão atual: v6.1.9

---

## Versão atual
`v6.1.9` — em produção em https://cafreitas.github.io/captor/

## Stack
- Single-file HTML/JS (sem framework), separado em múltiplos arquivos JS/CSS
- Supabase (auth + DB): `https://fllkczocfcbrfsyhxelg.supabase.co`
- AI proxy: `/functions/v1/anthropic-proxy` | Model: `claude-sonnet-4-20250514` | max_tokens: 3000 (R1) / 4000 (R2)
- GitHub Pages: `https://cafreitas.github.io/captor/` | repo: `cafreitas/captor`, branch `main`
- Deploy: `deploy_captor_v2.py` em `~/Downloads/Captor/src/`
- Arquivos: `index.html`, `proposta.html`, `js/globals.js`, `js/init.js`, `js/auth.js`, `js/prospects.js`, `js/generators.js`, `js/utils.js`, `js/validation.js`, `css/app.css`

## Estrutura de arquivos JS
| Arquivo | Responsabilidade |
|---------|-----------------|
| `globals.js` | Variáveis globais, versão, SUPABASE_URL/KEY, PROXY_URL, AppState, ALLOC_CATS |
| `init.js` | UI init, sliders, autocomplete profissão/assessoria, fillExample, syncFormToSidebar, renderR1Output, showTab, collapseSidebar/expandSidebar |
| `auth.js` | Login, logout, enterApp, loadFirmRole |
| `prospects.js` | Lista prospects, openProspectDetail, upsertProspect, renderProspectTable, clearProspectForm, openNewProspectDetail |
| `generators.js` | generateR1(), buildEmpresaPrompt(), logAiUsage() |
| `utils.js` | showToast, maskPdPat, getRawPat |
| `validation.js` | requiredFieldsFilled(), updateAllButtonStates(), initButtonStateListeners() |
| `css/app.css` | Design system dark theme |

## Supabase schema relevante
**`prospects`** (colunas confirmadas):
`id`, `assessor_id`, `firm_id`, `nome`, `profissao`, `idade`, `patrimonio_estimado`, `perfil_risco`, `objetivo`, `horizonte`, `status`, `roteiro_r1` (jsonb), `perfil_inicial` (jsonb), `r1_notes` (jsonb), `email`, `telefone`, `created_at`, `updated_at`

**`company_profiles`**: `id`, `user_id`, `empresa_nome`, `empresa_segmento`, `empresa_anos`, `empresa_aum`, `empresa_clientes`, `empresa_credenciadora`, `empresa_diferenciais`, `empresa_premios`, `produtos`, `produtos_investimento`, `produtos_servicos`, `produtos_premium`, `expertise`, `regras_alocacao` (jsonb), `brand_colors` (array), `owner_tax_id`, `owner_cellphone`, `firm_id`

**`user_credits`**: `user_id`, `saldo`, `total_ganho`, `total_usado`, `auto_recarga`

**`credit_logs`**: `user_id`, `acao`, `cliente`, `consumo`, `saldo_apos`

**`proposals`**: `hash`, `user_id`, `cliente_*`, `alocacao_*`, `analise_ia`, `empresa_snapshot`, `status`, `feedback_rating`, `feedback_texto`

## Status das funcionalidades

### ✅ Funcionando
- Login / Auth / Logout
- Créditos / energy bar no header
- Configuração de empresa (modal 4 steps)
- Lista de Prospects (tabela com sort/filter)
- Abrir prospect → prospectDetailView
- `generateR1()` — geração de roteiro R1
- `collapseSidebar()` após gerar R1 (resultado em largura total)
- Salvar `roteiro_r1` no Supabase após geração
- Buscar dados frescos ao abrir prospect (cache atualizado)
- Coluna PERFIL na tabela exibe `perfil_risco`
- upsertProspect salva campos: nome, profissao, idade, patrimonio_estimado, perfil_risco, objetivo, horizonte

### ❌ Bugs pendentes (ver BUGS_PENDENTES.md)
1. `clearProspectForm()` — limpa campos `f*` em vez de `pd_*`
2. `openNewProspectDetail()` — deveria abrir modal de método; limpeza incorreta
3. `fillExample()` / `fillExampleAndOpen()` — preenchem `f*` em vez de `pd_*`
4. Autocomplete profissão (`acSelect`) — preenche `fProf` em vez de `pd_prof`
5. Autocomplete assessoria (`acAssSelect`) — preenche `fAss` em vez de `pd_ass`
6. `openProspectDetail()` — não renderiza R1 existente ao reabrir prospect
7. `openProspectDetail()` — não mostra `confirmR1Wrap` quando R1 existe
8. `generateR1()` — não mostra `confirmR1Wrap` após gerar
9. `initSliders()` — TypeError null em alguns contextos (possivelmente cache)
10. `horizonte` — pode não estar persistindo corretamente (investigar)
11. Alocação atual dos sliders — NÃO é salva em upsertProspect (comportamento intencional do original — é salva em r1_notes)

### 🔜 Não implementado ainda
- `restoreR1Notes()` ao abrir prospect com r1_notes
- Modal `prospectMethodModal` (manual / planilha / API)
- Anotações R1 (bloco completo com abas Durante/Depois/Transcrição)
- Geração R2 (generate()) via prospectDetailView
- Propostas (dashview) — parcialmente funcional
- Pagamentos AbacatePay Pix
- Teams completo (convites, gestor dashboard)

## Decisões técnicas importantes
- **Modelo para código**: `claude-sonnet-4-20250514` (decidido em 2026-04-28, não Haiku)
- **Modelo no Captor**: `claude-sonnet-4-20250514` para generateR1() e generate()
- **NUNCA usar a palavra "rapport"** — usar: conexão, confiança, proximidade, abertura, sintonia
- **SemVer**: features = minor bump, bugfixes = patch bump
- **Sempre confirmar com Carlos antes de gerar qualquer código**
- **Sempre trabalhar do arquivo enviado, nunca de cache local**
- **node --check obrigatório antes de qualquer entrega**
- **Alocação atual (sliders pd_*)** não é persistida em upsertProspect — salva em r1_notes via anotações R1
- **Campos pd_ass, pd_gaps, pd_ctx** não são persistidos no banco — são contextuais da sessão (comportamento intencional do original)

## Changelog recente
- `v6.1.9` — buscar dados frescos ao abrir prospect, corrigir coluna PERFIL (perfil_risco)
- `v6.1.8` — upsertProspect com res.error check, remover assessor_id do UPDATE
- `v6.1.7` — collapseSidebar após R1, expandSidebar ao abrir, upsertProspect payload completo
- `v6.1.6` — mostrar outArea após renderR1Output
- `v6.1.5` — corrigir IDs em validation.js (requiredFieldsFilled)
- `v6.1.4` — remover Authorization header do fetch, mover upsertProspect para try/catch
- `v6.1.3` — corrigir fCtx/fGaps para pd_ctx/pd_gaps
- `v6.1.2` — ocultar prospectview ao abrir prospectDetailView
- `v6.1.1` — corrigir IDs fNome→pd_nome etc em generateR1 e getRawPat
- `v6.1.0` — implementação inicial de generateR1()

## Próximo deploy planejado
**v6.2.0** — Reescrita completa dos arquivos problemáticos baseada no código antigo (index-old.html), corrigindo todos os bugs pendentes de uma vez.

Arquivos a reescrever:
1. `js/prospects.js` — openProspectDetail, clearProspectForm, openNewProspectDetail, upsertProspect, renderProspectTable, fillExampleAndOpen
2. `js/generators.js` — generateR1 completo com confirmR1Wrap
3. `js/validation.js` — IDs corretos, listeners corretos
4. `js/init.js` — autocompletes, fillExample, syncFormToSidebar

Referência: `index-old.html` (v6.0.6) no repositório.
