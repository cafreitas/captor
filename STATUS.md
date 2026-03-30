# Captor — STATUS DO PROJETO

> Atualizar este arquivo ao final de cada sessão de trabalho e commitar junto com os demais arquivos.

---

## Versão atual
**v5.2.1** (index.html)

---

## Stack
- **Frontend:** Single-file HTML/JS (sem framework) — `index.html`, `proposta.html`, `lp.html`
- **Auth/DB:** Supabase — `https://fllkczocfcbrfsyhxelg.supabase.co`
- **IA:** Claude via Edge Function `/functions/v1/anthropic-proxy` — model `claude-sonnet-4-20250514`
- **Pagamentos:** AbacatePay (Pix) — Edge Functions: `abacatepay-create`, `abacatepay-check`, `abacatepay-simulate`, `abacatepay-webhook`
- **Hosting:** GitHub Pages — `https://cafreitas.github.io/captor/`
- **Deploy:** `python3 deploy_captor.py`

---

## Últimas entregas

| Versão | O que foi feito |
|--------|----------------|
| v5.2.1 | Fix SyntaxError: aspas tipográficas (`''`) em 4 `onclick` — `dashRowClick`, `dashToggleRow`, `copyDashLink`, `window.open` |
| v5.2   | Dashboard completo: busca, sort, seleção, arquivar, paginação, KPIs clicáveis, coluna de expiração |
| v5.1   | Fix URL da proposta com query params + guard `.map()` |
| v5.0   | Confirmação de e-mail no cadastro + esqueci minha senha |
| v4.8   | Onboarding com perfil demo João Gomes no 1º acesso |
| v4.7   | Fix toast duplicado: para polling ao clicar |
| v4.0   | Integração AbacatePay Pix (3 pacotes, QR code, polling, toast) |

---

## Decisões técnicas recentes
- **SemVer obrigatório:** major.minor.patch — features = minor, bugfixes = patch
- **Validação JS pré-deploy:** extrair blocos `<script>` e rodar `node --check` antes de entregar arquivo
- **Aspas em `onclick`:** sempre usar `\'` (aspas retas escapadas) dentro de strings JS embutidas em HTML

---

## Backlog priorizado

### 🔴 Qualidade / Deploy (novo)
- [ ] `deploy_captor.py`: validação JS via `node --check` antes do push
- [ ] Skill de pré-entrega: Claude roda validação antes de entregar HTML

### 🟡 Marketing
- [ ] GA4 — `index.html`
- [ ] GA4 — `proposta.html` (visitas do cliente)
- [ ] Member-get-member com anti-fraude e crédito por referral

### 🟡 UX
- [ ] Testes em mobile (`index.html` e `proposta.html`)
- [ ] Página 404 amigável para links inválidos
- [ ] E-mail de notificação quando cliente responde

### 🟡 Produto
- [ ] Perfil do assessor via URL
- [ ] Proposta protegida por senha
- [ ] Fluxo de revisão / aprovação melhorado

### 🟡 Pagamentos
- [ ] Auto-recarga de créditos (AbacatePay)
- [ ] Stripe / Mercado Pago (pós-lançamento)

### 🔵 Pós-lançamento
- [ ] Analytics de conversão e insights
- [ ] Múltiplos SDRs por empresa
- [ ] Múltiplas empresas por SDR
- [ ] Página pública do assessor (SEO/GEO)
- [ ] Design system para corretoras populares

### 🔵 Landing page
- [ ] Nome definitivo do produto
- [ ] Value proposition + 3 principais dores
- [ ] Depoimentos reais
- [ ] Tabela de preços
- [ ] Logo e identidade visual

---

## Próximos passos sugeridos
1. Implementar validação JS no `deploy_captor.py`
2. GA4 no `index.html` e `proposta.html`
3. Testes mobile

---

## Como usar este arquivo
No início de cada sessão, Cole no chat:
> "Busque o STATUS.md em https://raw.githubusercontent.com/cafreitas/captor/main/STATUS.md e use como contexto"

Ou deixe o Claude buscar automaticamente via `web_fetch`.
