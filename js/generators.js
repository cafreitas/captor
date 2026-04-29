/**
 * CAPTOR — Módulo de Geradores IA (generators.js)
 * Responsável por: Logar uso de API e calcular custos
 * 
 * Dependências externas:
 * - sb (Supabase client)
 * - supabaseUserId (do módulo de auth)
 */

// ── CALCULAR CUSTO DE API ──
function calcularCustoApi(model, tokens_in, tokens_out) {
  var pricing = {
    'claude-sonnet-4-20250514': {in: 3, out: 15},
    'claude-opus-4-6': {in: 15, out: 75},
    'claude-haiku-4-5': {in: 0.80, out: 4}
  };
  var p = pricing[model] || pricing['claude-sonnet-4-20250514'];
  return (tokens_in * p.in / 1000000) + (tokens_out * p.out / 1000000);
}

// ── LOGAR USO DE API ──
async function logAiUsage(action_type, proposal_id, model_used, tokens_input, tokens_output, status) {
  if (!supabaseUserId) return;
  try {
    var custo = calcularCustoApi(model_used, tokens_input, tokens_output);
    await sb.from('ai_usage_logs').insert({
      user_id: supabaseUserId,
      action_type: action_type,
      proposal_id: proposal_id || null,
      model: model_used,
      tokens_input: tokens_input,
      tokens_output: tokens_output,
      custo_usd: custo,
      timestamp: new Date().toISOString(),
      status: status || 'success'
    });
  } catch (e) {
    console.error('logAiUsage erro:', e);
  }
}

// ── CONSTRUIR CONTEXTO DA EMPRESA PARA PROMPT ──
function buildEmpresaPrompt() {
  if (!empresaData || !empresaData.empresa_nome) return null;
  var e = empresaData;
  var txt = 'DADOS DA EMPRESA DO ASSESSOR:\n';
  if (e.empresa_nome) txt += 'Empresa: ' + e.empresa_nome + '\n';
  if (e.empresa_credenciadora) txt += 'Credenciadora: ' + e.empresa_credenciadora + '\n';
  if (e.empresa_segmento) txt += 'Segmento: ' + e.empresa_segmento + '\n';
  if (e.empresa_anos) txt += 'Tempo de mercado: ' + e.empresa_anos + '\n';
  if (e.empresa_aum) txt += 'AuM: ' + e.empresa_aum + '\n';
  if (e.empresa_clientes) txt += 'Clientes: ' + e.empresa_clientes + '\n';
  if (e.empresa_diferenciais) txt += 'Diferenciais: ' + e.empresa_diferenciais + '\n';
  if (e.empresa_premios) txt += 'Prêmios: ' + e.empresa_premios + '\n';
  if (e.produtos_investimento) txt += 'Produtos de investimento: ' + e.produtos_investimento + '\n';
  if (e.produtos_servicos) txt += 'Serviços: ' + e.produtos_servicos + '\n';
  if (e.produtos_premium) txt += 'Produtos premium: ' + e.produtos_premium + '\n';
  if (e.expertise) txt += 'Expertise: ' + e.expertise + '\n';
  return txt;
}

// ── GERAR ROTEIRO R1 (DIAGNÓSTICO) ──
async function generateR1() {
  var nome = document.getElementById('pd_nome').value.trim();
  var pat = getRawPat();
  var prof = document.getElementById('pd_prof').value.trim();
  var idade = document.getElementById('pd_idade').value;
  var perfil = document.getElementById('pd_perfil').value;
  var obj = document.getElementById('pd_obj').value;
  var horizonte = document.getElementById('pd_horizonte').value;
  
  // Validação
  if (!nome || !prof || !idade || !perfil || !obj) {
    var missing = [];
    if (!nome) missing.push('Nome');
    if (!prof) missing.push('Profissão');
    if (!idade) missing.push('Idade');
    if (!perfil) missing.push('Perfil de risco');
    if (!obj) missing.push('Objetivo');
    showToast('Preencha: ' + missing.join(', ') + '.', 'error');
    return;
  }
  
  var patFmt = pat
    ? new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0}).format(parseInt(String(pat).replace(/\D/g, '')))
    : 'patrimônio a confirmar';
  
  // Mostrar loader — colapsar sidebar para que fique visível
  collapseSidebar();
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('outArea').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  var ldlabelEl = document.querySelector('.ldlabel');
  if (ldlabelEl) ldlabelEl.textContent = 'Gerando roteiro R1...';
  document.getElementById('btnGenR1').disabled = true;
  
  var ctx = document.getElementById('pd_ctx').value.trim();
  var gaps = document.getElementById('pd_gaps').value.trim();
  var empresaCtx = buildEmpresaPrompt() || '';

  var prompt = 'Você é um especialista em vendas consultivas de investimentos.\n\n'
    + 'REGRA DE COMUNICAÇÃO: nunca use a palavra "rapport" em nenhum texto gerado. Substitua por: conexão, confiança, proximidade, abertura ou sintonia.\n\n'
    + 'REGRA DE HONESTIDADE: nas dicas de abertura e encerramento, nunca sugira que o assessor afirme algo sobre si mesmo que pode não ser verdade (ex: "diga que trabalha com artistas"). Em vez disso, sugira perguntas ou formas de buscar conexões genuínas com o cliente (ex: "pergunte se ele conhece outros profissionais da área que também investem").\n\n'
    + empresaCtx + '\n'
    + 'PROSPECT:\n'
    + 'Nome: ' + nome + ' | Profissão: ' + prof + ' | Idade: ' + idade + ' anos | Patrimônio estimado: ' + patFmt
    + (perfil ? ' | Perfil declarado: ' + perfil : '') + ' | Objetivo: ' + obj
    + (horizonte ? ' | Horizonte: ' + horizonte : '') + '\n'
    + (ctx ? 'Contexto: ' + ctx + '\n' : '')
    + (gaps ? 'Problemas/gaps identificados: ' + gaps + '\n' : '') + '\n'
    + 'INSTRUÇÃO CRÍTICA: se o contexto ou gaps mencionarem tópicos específicos (ex: separação patrimonial, offshore, empresa, sucessão, divórcio, venda de empresa), inclua obrigatoriamente ao menos uma pergunta de aprofundamento sobre cada um. Esses são sinais que o assessor já identificou como relevantes — ignorá-los seria desperdiçar informação valiosa para a R2.\n\n'
    + 'Gere um roteiro estruturado para a REUNIÃO DE DIAGNÓSTICO (R1) com este prospect. '
    + 'O objetivo da R1 é ouvir e entender — não vender. O assessor deve falar menos de 30% do tempo.\n\n'
    + 'Responda SOMENTE em JSON válido, sem texto fora do JSON:\n'
    + '{"abertura":{"objetivo":"...","dica":"..."},'
    + '"perguntas":[{"categoria":"...","pergunta":"...","motivo":"...","followup":"..."}],'
    + '"sinais_alerta":["..."],'
    + '"encerramento":{"objetivo":"...","proximo_passo":"..."}}\n\n'
    + 'Gere 6 a 8 perguntas em categorias como: Situação atual, Objetivos, Experiência com investimentos, '
    + 'Tolerância a risco, Preocupações / objeções, Horizonte e liquidez. '
    + 'As perguntas devem ser abertas, naturais e adaptadas ao perfil deste prospect específico.\n\n'
    + 'INSTRUÇÃO PARA sinais_alerta: gere 3 a 4 sinais específicos para ESTE prospect — comportamentos ou respostas durante a reunião que indicam risco de não fechamento ou complicação na R2. '
    + 'Baseie-se no contexto, profissão, patrimônio e objetivo informados. '
    + 'Exemplos do que NÃO fazer: "cliente pode ter resistência a mudanças" (genérico demais). '
    + 'Exemplos do que fazer: "se mencionar que o contador gerencia os investimentos da PJ, há risco de interferência de terceiro na decisão" (específico ao contexto desta médica com PJ).';
  
  try {
    await upsertProspect('r1_iniciada');
    if (AppState.prospects.currentId) {
      var perfilInicial = {
        nome: document.getElementById('pd_nome').value.trim(),
        pat: document.getElementById('pd_pat').value,
        prof: document.getElementById('pd_prof').value,
        idade: document.getElementById('pd_idade').value,
        perfil: document.getElementById('pd_perfil').value,
        obj: document.getElementById('pd_obj').value,
        horizonte: document.getElementById('pd_horizonte').value,
        ass: document.getElementById('pd_ass').value,
        gaps: document.getElementById('pd_gaps').value.trim(),
        ctx: document.getElementById('pd_ctx').value.trim()
      };
      sb.from('prospects').update({perfil_inicial: perfilInicial}).eq('id', AppState.prospects.currentId).then(function(){});
    }
    var resp = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({model: 'claude-sonnet-4-20250514', max_tokens: 3000, messages: [{role: 'user', content: prompt}]})
    });
    if (!resp.ok) {
      var errData = await resp.json().catch(function(){return{};});
      throw new Error('HTTP ' + resp.status + ': ' + (errData.error && errData.error.message ? errData.error.message : resp.statusText));
    }
    var rd = await resp.json();
    if (rd && rd.usage) await logAiUsage('gerar_r1', null, 'claude-sonnet-4-20250514', rd.usage.input_tokens, rd.usage.output_tokens, 'success');
    var txt = (rd.content && rd.content[0] && rd.content[0].text) || '';
    var clean = txt.replace(/```json|```/g, '').trim();
    var r1data = JSON.parse(clean);
    renderR1Output(nome, patFmt, r1data);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('outArea').style.display = 'block';
    collapseSidebar();
    AppState.prospects.r1Generated = true;

    // Bug 8: mostrar confirmR1Wrap após geração
    var confirmWrap = document.getElementById('confirmR1Wrap');
    if (confirmWrap) confirmWrap.style.display = 'flex';
    var p = AppState.prospects.currentId
      ? AppState.prospects.all.find(function(x){ return x.id === AppState.prospects.currentId; })
      : null;
    syncToggleR1(p ? p.status : null);
    
    // Salvar roteiro no prospect
    if (AppState.prospects.currentId) {
      await sb.from('prospects').update({roteiro_r1: r1data}).eq('id', AppState.prospects.currentId);
    }
    
    // Bloco Anotações R1
    appendAnotacoesBlock(r1data.perguntas, null);
    preencheValidacao();

    // Scroll para resultado
    setTimeout(function(){
      var out = document.getElementById('outArea');
      if (out) out.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 150);
  } catch (e) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    showToast('Erro ao gerar Roteiro R1: ' + e.message, 'error');
  } finally {
    document.getElementById('btnGenR1').disabled = false;
    document.getElementById('loadingState').style.display = 'none';
  }
}

// ────────────────────────────────────────────────────────────────
// BLOCO ANOTAÇÕES R1
// ────────────────────────────────────────────────────────────────

function appendAnotacoesBlock(perguntas, r1Notes) {
  var area = document.getElementById('outArea');
  if (!area) return;

  // Remove bloco anterior se existir
  var old = document.getElementById('validacaoBloco');
  if (old) old.remove();
  var oldBottom = document.getElementById('toggleR1BottomWrap');
  if (oldBottom) oldBottom.remove();

  // Bloco Anotações
  var bAnot = mkBlock('📝', 'Anotações R1', false);
  bAnot.el.id = 'validacaoBloco';
  bAnot.body.innerHTML = buildAnotacoesR1HTML(perguntas || []);
  area.appendChild(bAnot.el);

  // Restaurar notas salvas se existirem
  if (r1Notes) {
    setTimeout(function() { restoreR1Notes(r1Notes); }, 80);
  }

  // Autosave ao digitar
  setTimeout(function() {
    bAnot.body.querySelectorAll('input,textarea,select').forEach(function(el) {
      el.addEventListener('change', debounceAutoSaveR1);
      el.addEventListener('input', debounceAutoSaveR1);
    });
    // Abas
    bAnot.body.querySelectorAll('.r1tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tab = btn.dataset.tab;
        bAnot.body.querySelectorAll('.r1tab-btn').forEach(function(b) {
          var isActive = b.dataset.tab === tab;
          b.classList.toggle('active', isActive);
          b.style.background = isActive ? 'var(--lime)' : 'transparent';
          b.style.color = isActive ? '#1a1a1a' : 'var(--muted)';
        });
        bAnot.body.querySelectorAll('.r1tab-panel').forEach(function(p) {
          p.style.display = p.dataset.panel === tab ? 'block' : 'none';
        });
      });
    });
  }, 100);

  // Toggle R1 finalizada + botão R2 — rodapé
  var toggleBottom = document.createElement('div');
  toggleBottom.id = 'toggleR1BottomWrap';
  toggleBottom.style.cssText = 'margin-top:8px';
  toggleBottom.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px">'
    + '<label style="position:relative;display:inline-block;width:40px;height:22px;cursor:pointer;flex-shrink:0">'
    + '<input type="checkbox" id="toggleR1b" onchange="onToggleR1(this.checked)" style="opacity:0;width:0;height:0;position:absolute">'
    + '<span id="toggleR1bTrack" style="position:absolute;top:0;left:0;right:0;bottom:0;background:#444;border-radius:22px;transition:background .2s"></span>'
    + '<span id="toggleR1bThumb" style="position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>'
    + '</label>'
    + '<span style="font-size:.84rem;font-weight:600;color:var(--muted)">Prepara Reunião de Perfil</span>'
    + '</div>'
    + '<div id="btnR2BottomWrap" style="display:none;margin-top:10px">'
    + '<button class="genbtn" id="btnR2Bottom" onclick="generate()">'
    + '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10.25 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/></svg>'
    + ' Preparar Proposta'
    + '</button>'
    + '</div>';
  area.appendChild(toggleBottom);

  // Sincronizar estado dos toggles com o prospect atual
  var p = AppState.prospects.currentId
    ? AppState.prospects.all.find(function(x) { return x.id === AppState.prospects.currentId; })
    : null;
  syncToggleR1(p ? p.status : null);
}

function buildAnotacoesR1HTML(perguntas) {
  var tabBtnStyle = 'padding:5px 14px;border:none;border-radius:6px;font-family:var(--f);font-size:.74rem;font-weight:600;cursor:pointer;transition:all .15s;background:transparent;color:var(--muted)';
  var tabBtnActiveStyle = 'background:var(--lime);color:#1a1a1a';
  var lbl = 'font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--lime);margin-bottom:4px;display:block';
  var allocLabels = ['Pós Fixado','Inflação','Prefixado','Multimercados','Renda Variável BR','FII','Alternativos','RF Global','RV Global'];

  // ── Aba Durante ──
  var duranteHTML = '<div data-panel="durante" class="r1tab-panel" style="padding:12px 0">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">'
    + '<div><span style="' + lbl + '">Perfil confirmado</span>'
    + '<select class="fsel" id="r1_perfil_confirmado" style="font-size:.8rem;padding:6px 8px">'
    + '<option value="">Selecione...</option>'
    + ['Conservador','Moderado','Arrojado','Agressivo'].map(function(p) { return '<option>' + p + '</option>'; }).join('')
    + '</select></div>'
    + '<div><span style="' + lbl + '">Sofisticação</span>'
    + '<select class="fsel" id="r1_sofisticacao" style="font-size:.8rem;padding:6px 8px">'
    + '<option value="">Selecione...</option>'
    + ['Iniciante','Intermediário','Avançado','Especialista'].map(function(s) { return '<option>' + s + '</option>'; }).join('')
    + '</select></div>'
    + '<div><span style="' + lbl + '">Assessoria atual</span>'
    + '<input class="fi" id="r1_ass" placeholder="Ex: XP, BTG..." style="font-size:.8rem;padding:6px 8px"></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 80px;gap:8px;margin-bottom:8px">'
    + '<div><span style="' + lbl + '">Patrimônio</span>'
    + '<input class="fi" id="r1_pat_confirmado" placeholder="Ex: 850k, 1,2M" oninput="maskR1Pat(this)" style="font-size:.8rem;padding:6px 8px"></div>'
    + '<div><span style="' + lbl + '">Profissão</span>'
    + '<input class="fi" id="r1_prof" placeholder="Ex: Empresário" style="font-size:.8rem;padding:6px 8px"></div>'
    + '<div><span style="' + lbl + '">Idade</span>'
    + '<input class="fi" id="r1_idade" type="number" placeholder="45" min="18" max="90" style="font-size:.8rem;padding:6px 8px"></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
    + '<div><span style="' + lbl + '">Objetivo</span>'
    + '<select class="fsel" id="r1_obj" style="font-size:.8rem;padding:6px 8px">'
    + '<option value="">Selecione...</option>'
    + ['Aposentadoria / Independência financeira','Sucessão patrimonial / família','Compra de imóvel / bem','Crescimento patrimonial acelerado','Proteção e preservação','Renda passiva','Investimentos internacionais / Offshore'].map(function(o) { return '<option>' + o + '</option>'; }).join('')
    + '</select></div>'
    + '<div><span style="' + lbl + '">Horizonte</span>'
    + '<select class="fsel" id="r1_horizonte" style="font-size:.8rem;padding:6px 8px">'
    + '<option value="">Selecione...</option>'
    + ['Até 2 anos','3 a 5 anos','5 a 10 anos','Mais de 10 anos'].map(function(h) { return '<option>' + h + '</option>'; }).join('')
    + '</select></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:10px">'
    + '<div><span style="' + lbl + '">Objeções levantadas</span>'
    + ['Liquidez','Taxas','Risco','Timing','Já tem assessor','Outros'].map(function(o) {
      return '<label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:.78rem;color:var(--muted);cursor:pointer">'
        + '<input type="checkbox" class="r1-cb" name="r1_objecao" value="' + o + '"> ' + o + '</label>';
    }).join('') + '</div>'
    + '<div><span style="' + lbl + '">Produtos que já possui</span>'
    + ['CDB/RDB','Tesouro Direto','Ações','FIIs','Fundos','Previdência','Câmbio/Offshore','Outros'].map(function(p) {
      return '<label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:.78rem;color:var(--muted);cursor:pointer">'
        + '<input type="checkbox" class="r1-cb" name="r1_produto" value="' + p + '"> ' + p + '</label>';
    }).join('') + '</div>'
    + '</div>'
    + '<div style="margin-bottom:10px"><span style="' + lbl + '">Alocação atual do cliente</span>'
    + allocLabels.map(function(lb, i) {
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
        + '<span style="font-size:.68rem;color:var(--muted);width:118px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + lb + '</span>'
        + '<input type="range" class="aslider" id="r1_sl_' + i + '" min="0" max="100" value="0" style="flex:1" oninput="document.getElementById(\'r1_sl_' + i + '_v\').textContent=this.value+\'%\'">'
        + '<span id="r1_sl_' + i + '_v" style="font-size:.7rem;font-weight:700;color:var(--lime);width:30px;text-align:right;flex-shrink:0">0%</span>'
        + '</div>';
    }).join('')
    + '</div>'
    + '<div style="margin-bottom:6px"><span style="' + lbl + '">Gaps / problemas confirmados</span>'
    + '<textarea class="fta" id="r1_gaps" style="min-height:44px;font-size:.8rem" placeholder="Ex: carteira 100% CDB, sem proteção cambial..."></textarea></div>'
    + '<div><span style="' + lbl + '">Contexto / observações</span>'
    + '<textarea class="fta" id="r1_ctx" style="min-height:44px;font-size:.8rem" placeholder="Ex: tem empresa, preocupado com câmbio..."></textarea></div>'
    + '</div>';

  // ── Aba Depois ──
  var depoisHTML = '<div data-panel="depois" class="r1tab-panel" style="padding:14px 0;display:none">'
    + (perguntas.length
      ? perguntas.map(function(q, i) {
          return '<div class="fg"><label class="fl" style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted)">'
            + '<strong style="color:var(--text)">' + escHtml(q.pergunta) + '</strong></label>'
            + '<textarea class="fta" id="r1_resp_' + i + '" placeholder="O que o cliente respondeu..." style="min-height:48px"></textarea></div>';
        }).join('')
      : '')
    + '<div class="fg"><label class="fl">Objeções identificadas</label>'
    + '<textarea class="fta" id="r1_objecoes_texto" placeholder="Ex: preocupado com liquidez, acha que taxa é alta..."></textarea></div>'
    + '<div class="fg"><label class="fl">Observações gerais</label>'
    + '<textarea class="fta" id="r1_obs_gerais" placeholder="Impressões, contexto, próximos passos acordados..."></textarea></div>'
    + '</div>';

  // ── Aba Transcrição ──
  var transcricaoHTML = '<div data-panel="transcricao" class="r1tab-panel" style="padding:14px 0;display:none">'
    + '<div class="fg"><label class="fl">Cole a transcrição da reunião</label>'
    + '<textarea class="fta" id="r1_transcricao" placeholder="Cole aqui o texto da transcrição (Fireflies, Otter, Zoom, etc.)..." style="min-height:120px"></textarea></div>'
    + '<button onclick="extractFromTranscricao()" id="btnExtractTranscricao" style="width:100%;padding:9px;background:var(--bg3);border:1px solid var(--lime);border-radius:var(--r);color:var(--lime);font-family:var(--f);font-size:.78rem;font-weight:700;cursor:pointer">'
    + '✨ Extrair anotações com IA</button>'
    + '<div id="extractTranscricaoStatus" style="font-size:.72rem;color:var(--dim);margin-top:6px;min-height:16px"></div>'
    + '</div>';

  return '<div style="margin-bottom:12px;display:flex;gap:4px;background:var(--bg3);border-radius:var(--r);padding:3px;width:fit-content">'
    + '<button class="r1tab-btn active" data-tab="durante" style="' + tabBtnStyle + ';' + tabBtnActiveStyle + '">Durante</button>'
    + '<button class="r1tab-btn" data-tab="depois" style="' + tabBtnStyle + '">Depois</button>'
    + '<button class="r1tab-btn" data-tab="transcricao" style="' + tabBtnStyle + '">Transcrição</button>'
    + '</div>'
    + duranteHTML + depoisHTML + transcricaoHTML
    + '<div id="r1AutoSaveStatus" style="font-size:.68rem;color:var(--dim);margin-top:8px;min-height:14px;text-align:right"></div>';
}

function maskR1Pat(el) {
  var v = el.value.replace(/\D/g, '');
  if (!v) { el.value = ''; return; }
  el.value = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0}).format(parseInt(v));
}

function preencheValidacao() {
  // Pré-preenche campos da aba Durante com dados do formulário pd_*
  var m = {
    r1_prof: 'pd_prof',
    r1_idade: 'pd_idade',
    r1_perfil_confirmado: 'pd_perfil',
    r1_obj: 'pd_obj',
    r1_horizonte: 'pd_horizonte',
    r1_ass: 'pd_ass',
    r1_gaps: 'pd_gaps',
    r1_ctx: 'pd_ctx'
  };
  Object.keys(m).forEach(function(dstId) {
    var src = document.getElementById(m[dstId]);
    var dst = document.getElementById(dstId);
    if (src && dst && !dst.value) dst.value = src.value;
  });
  // Patrimônio
  var patSrc = document.getElementById('pd_pat');
  var patDst = document.getElementById('r1_pat_confirmado');
  if (patSrc && patDst && !patDst.value) patDst.value = patSrc.value;
}

function isValidacaoPreenchida() {
  var perf = document.getElementById('r1_perfil_confirmado');
  var obj = document.getElementById('r1_obj');
  if (!perf) return true; // bloco não existe — não bloquear
  return !!(perf.value && obj && obj.value);
}

function collectR1Notes() {
  var activeTab = document.querySelector('.r1tab-btn.active');
  var modoUtilizado = activeTab ? activeTab.dataset.tab : 'durante';

  function gv(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  var objecoes = [];
  document.querySelectorAll('input[name="r1_objecao"]:checked').forEach(function(el) { objecoes.push(el.value); });
  var produtos = [];
  document.querySelectorAll('input[name="r1_produto"]:checked').forEach(function(el) { produtos.push(el.value); });

  var alloc_atual = {};
  for (var i = 0; i < 9; i++) {
    var sl = document.getElementById('r1_sl_' + i);
    if (sl && parseInt(sl.value)) alloc_atual[i] = parseInt(sl.value);
  }

  var respostas = [];
  document.querySelectorAll('[id^="r1_resp_"]').forEach(function(el) {
    respostas.push({idx: el.id.replace('r1_resp_', ''), resposta: el.value.trim() || null});
  });

  return {
    modo_utilizado: modoUtilizado,
    durante: {
      perfil_confirmado: gv('r1_perfil_confirmado'),
      sofisticacao: gv('r1_sofisticacao'),
      patrimonio_confirmado: gv('r1_pat_confirmado'),
      prof: gv('r1_prof'),
      idade: gv('r1_idade'),
      obj: gv('r1_obj'),
      horizonte: gv('r1_horizonte'),
      ass: gv('r1_ass'),
      gaps: gv('r1_gaps'),
      ctx: gv('r1_ctx'),
      objecoes: objecoes,
      produtos_atuais: produtos,
      alloc_atual: alloc_atual
    },
    depois: {
      respostas_perguntas: respostas,
      objecoes_texto: gv('r1_objecoes_texto'),
      obs_gerais: gv('r1_obs_gerais')
    },
    transcricao: gv('r1_transcricao')
  };
}

function restoreR1Notes(notes) {
  if (!notes) return;
  var d = notes.durante || {};
  function sv(id, val) { var el = document.getElementById(id); if (el && val !== null && val !== undefined) el.value = val; }
  sv('r1_perfil_confirmado', d.perfil_confirmado);
  sv('r1_sofisticacao', d.sofisticacao);
  sv('r1_pat_confirmado', d.patrimonio_confirmado);
  sv('r1_prof', d.prof);
  sv('r1_idade', d.idade);
  sv('r1_obj', d.obj);
  sv('r1_horizonte', d.horizonte);
  sv('r1_ass', d.ass);
  sv('r1_gaps', d.gaps);
  sv('r1_ctx', d.ctx);
  if (d.objecoes) d.objecoes.forEach(function(o) {
    document.querySelectorAll('input[name="r1_objecao"]').forEach(function(el) { if (el.value === o) el.checked = true; });
  });
  if (d.produtos_atuais) d.produtos_atuais.forEach(function(p) {
    document.querySelectorAll('input[name="r1_produto"]').forEach(function(el) { if (el.value === p) el.checked = true; });
  });
  if (d.alloc_atual) Object.keys(d.alloc_atual).forEach(function(i) {
    var sl = document.getElementById('r1_sl_' + i);
    var vl = document.getElementById('r1_sl_' + i + '_v');
    if (sl) { sl.value = d.alloc_atual[i]; if (vl) vl.textContent = d.alloc_atual[i] + '%'; }
  });
  var dp = notes.depois || {};
  sv('r1_obs_gerais', dp.obs_gerais);
  sv('r1_objecoes_texto', dp.objecoes_texto);
  if (dp.respostas_perguntas) dp.respostas_perguntas.forEach(function(r) { sv('r1_resp_' + r.idx, r.resposta); });
  if (notes.transcricao) sv('r1_transcricao', notes.transcricao);
}

function debounceAutoSaveR1() {
  clearTimeout(AppState.prospects.r1AutoSaveTimer);
  var st = document.getElementById('r1AutoSaveStatus');
  if (st) st.textContent = 'Digitando...';
  AppState.prospects.r1AutoSaveTimer = setTimeout(autoSaveR1Notes, 2000);
}

async function autoSaveR1Notes() {
  if (!AppState.prospects.currentId) return;
  var notes = collectR1Notes();
  var st = document.getElementById('r1AutoSaveStatus');
  await sb.from('prospects').update({r1_notes: notes}).eq('id', AppState.prospects.currentId);
  if (st) st.textContent = '✓ Salvo automaticamente';
  setTimeout(function() { if (st) st.textContent = ''; }, 3000);
}

function getValidacaoData() {
  var perfilEl = document.getElementById('r1_perfil_confirmado');
  if (!perfilEl) {
    // Fallback para campos pd_* se bloco não existe
    return {
      nome: (document.getElementById('pd_nome') || {}).value || '',
      pat: getRawPat(),
      prof: (document.getElementById('pd_prof') || {}).value || '',
      idade: (document.getElementById('pd_idade') || {}).value || '',
      perfil: (document.getElementById('pd_perfil') || {}).value || '',
      obj: (document.getElementById('pd_obj') || {}).value || '',
      horizonte: (document.getElementById('pd_horizonte') || {}).value || '',
      ass: (document.getElementById('pd_ass') || {}).value || '',
      gaps: ((document.getElementById('pd_gaps') || {}).value || '').trim(),
      ctx: ((document.getElementById('pd_ctx') || {}).value || '').trim()
    };
  }
  function gv(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  return {
    nome: (document.getElementById('pd_nome') || {}).value || '',
    pat: (function() { var el = document.getElementById('r1_pat_confirmado'); return el && el.value ? el.value.replace(/\D/g,'') : getRawPat(); })(),
    prof: gv('r1_prof') || gv('pd_prof'),
    idade: gv('r1_idade') || gv('pd_idade'),
    perfil: gv('r1_perfil_confirmado') || gv('pd_perfil'),
    obj: gv('r1_obj') || gv('pd_obj'),
    horizonte: gv('r1_horizonte') || gv('pd_horizonte'),
    ass: gv('r1_ass'),
    gaps: (gv('r1_gaps') || '').trim(),
    ctx: (gv('r1_ctx') || '').trim()
  };
}

async function extractFromTranscricao() {
  var btn = document.getElementById('btnExtractTranscricao');
  var statusEl = document.getElementById('extractTranscricaoStatus');
  var transcEl = document.getElementById('r1_transcricao');
  if (!transcEl || !transcEl.value.trim()) {
    showToast('Cole a transcrição antes de extrair.', 'error');
    return;
  }
  btn.disabled = true;
  btn.textContent = '⏳ Extraindo...';
  if (statusEl) statusEl.textContent = 'Processando transcrição com IA...';
  try {
    var prompt = 'Você é um especialista em assessoria de investimentos. Analise a transcrição abaixo de uma reunião de diagnóstico (R1) entre um assessor e um cliente prospect.\n\n'
      + 'Extraia as seguintes informações e responda APENAS com JSON válido neste formato:\n'
      + '{\n'
      + '  "perfil_confirmado": "Conservador|Moderado|Arrojado|Agressivo ou null",\n'
      + '  "sofisticacao": "Iniciante|Intermediário|Avançado|Especialista ou null",\n'
      + '  "patrimonio": "valor em texto ou null",\n'
      + '  "prof": "profissão ou null",\n'
      + '  "idade": "número ou null",\n'
      + '  "obj": "objetivo principal ou null",\n'
      + '  "horizonte": "Até 2 anos|3 a 5 anos|5 a 10 anos|Mais de 10 anos ou null",\n'
      + '  "objecoes": ["lista de objeções mencionadas"],\n'
      + '  "gaps": "problemas ou lacunas identificados ou null",\n'
      + '  "ctx": "contexto relevante ou null",\n'
      + '  "obs_gerais": "observações gerais da reunião ou null"\n'
      + '}\n\n'
      + 'TRANSCRIÇÃO:\n' + transcEl.value.trim();
    var resp = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({model: 'claude-sonnet-4-20250514', max_tokens: 1400, messages: [{role:'user', content: prompt}]})
    });
    var rd = await resp.json();
    var txt = (rd.content && rd.content[0] && rd.content[0].text) || '';
    var clean = txt.replace(/```json|```/g, '').trim();
    var ex = JSON.parse(clean);
    // Preencher campos extraídos (sem sobrescrever se já preenchido)
    function sf(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; }
    sf('r1_perfil_confirmado', ex.perfil_confirmado);
    sf('r1_sofisticacao', ex.sofisticacao);
    sf('r1_pat_confirmado', ex.patrimonio);
    sf('r1_prof', ex.prof);
    sf('r1_idade', ex.idade);
    sf('r1_obj', ex.obj);
    sf('r1_horizonte', ex.horizonte);
    sf('r1_gaps', ex.gaps);
    sf('r1_ctx', ex.ctx);
    sf('r1_obs_gerais', ex.obs_gerais);
    if (ex.objecoes && ex.objecoes.length) {
      ex.objecoes.forEach(function(o) {
        document.querySelectorAll('input[name="r1_objecao"]').forEach(function(el) { if (el.value === o) el.checked = true; });
      });
    }
    if (statusEl) statusEl.textContent = '✓ Anotações extraídas com sucesso';
    setTimeout(function() { if (statusEl) statusEl.textContent = ''; }, 4000);
    debounceAutoSaveR1();
  } catch(e) {
    if (statusEl) statusEl.textContent = '✗ Erro ao extrair: ' + e.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✨ Extrair anotações com IA';
  }
}

// ────────────────────────────────────────────────────────────────
// GERAR PROPOSTA R2
// ────────────────────────────────────────────────────────────────

function getSliderAlloc() {
  var result = {};
  var total = 0;
  var pdVisible = document.getElementById('prospectDetailView') &&
    document.getElementById('prospectDetailView').style.display !== 'none';
  var prefix = pdVisible ? 'pd_sl_' : 'asl_';
  ALLOC_CATS.forEach(function(cat, i) {
    var el = document.getElementById(prefix + i);
    var val = el ? parseInt(el.value) || 0 : 0;
    result[cat] = val;
    total += val;
  });
  return total > 0 ? result : null;
}

function buildAllocPrompt(perfil) {
  if (!empresaData || !empresaData.regras_alocacao || !empresaData.regras_alocacao[perfil]) {
    var def = ALLOC_DEFAULT[perfil] || ALLOC_DEFAULT['Arrojado'];
    return ALLOC_CATS.map(function(l, i) {
      return l + ': ' + def[i][0] + '% a ' + def[i][1] + '%';
    }).join(', ');
  }
  var regras = empresaData.regras_alocacao[perfil];
  return ALLOC_CATS.map(function(l, i) { return l + ': ' + regras[i]; }).join(', ');
}

function buildR1NotesContext(notes) {
  if (!notes || !Object.keys(notes).length) return '';
  var txt = 'ANOTAÇÕES DA REUNIÃO R1 (modo: ' + (notes.modo_utilizado || 'não registrado') + '):\n';
  var d = notes.durante || notes;
  var dp = notes.depois || notes;
  if (d.perfil_confirmado) txt += 'Perfil confirmado na reunião: ' + d.perfil_confirmado + '\n';
  if (d.sofisticacao) txt += 'Nível de sofisticação financeira: ' + d.sofisticacao + ' — INSTRUÇÃO: adapte a linguagem da proposta a este nível. Iniciante: evite jargões, use analogias simples. Intermediário: use termos técnicos com breve explicação. Avançado/Especialista: linguagem técnica direta, sem simplificações.\n';
  if (d.patrimonio_confirmado) txt += 'Patrimônio confirmado: ' + d.patrimonio_confirmado + '\n';
  if (d.prof) txt += 'Profissão confirmada: ' + d.prof + '\n';
  if (d.idade) txt += 'Idade confirmada: ' + d.idade + ' anos\n';
  if (d.obj) txt += 'Objetivo confirmado: ' + d.obj + '\n';
  if (d.horizonte) txt += 'Horizonte confirmado: ' + d.horizonte + '\n';
  if (d.ass) txt += 'Assessoria atual confirmada: ' + d.ass + '\n';
  if (d.produtos_atuais && d.produtos_atuais.length) txt += 'Produtos que já possui: ' + d.produtos_atuais.join(', ') + '\n';
  if (d.objecoes && d.objecoes.length) txt += 'Objeções levantadas: ' + d.objecoes.join(', ') + '\n';
  if (d.alloc_atual && Object.keys(d.alloc_atual).length) {
    var allocLabels = ['Pós Fixado','Inflação','Prefixado','Multimercados','Renda Variável BR','FII','Alternativos','RF Global','RV Global'];
    txt += 'Alocação atual confirmada: ' + Object.keys(d.alloc_atual).map(function(i) { return allocLabels[i] + ': ' + d.alloc_atual[i] + '%'; }).join(', ') + '\n';
  }
  if (d.gaps) txt += 'Gaps / problemas confirmados: ' + d.gaps + '\n';
  if (d.ctx) txt += 'Contexto da reunião: ' + d.ctx + '\n';
  if (dp.objecoes_texto) txt += 'Detalhe das objeções: ' + dp.objecoes_texto + '\n';
  if (dp.obs_gerais) txt += 'Resumo da reunião: ' + dp.obs_gerais + '\n';
  var respostas = dp.respostas_perguntas || notes.respostas_perguntas || [];
  var respostasValidas = respostas.filter(function(r) { return r.resposta; });
  if (respostasValidas.length) {
    txt += 'Respostas do cliente:\n';
    respostasValidas.forEach(function(r) { txt += '  - ' + r.resposta + '\n'; });
  }
  return txt + '\n';
}

async function generate() {
  var vd = getValidacaoData();
  var nome = vd.nome, pat = vd.pat, prof = vd.prof, idade = vd.idade;
  var perfil = vd.perfil, obj = vd.obj, ass = vd.ass, gaps = vd.gaps, ctx = vd.ctx;

  // Alocação atual: preferir sliders das Anotações R1, senão sidebar
  var currentAlloc = (function() {
    var r1sl = document.getElementById('r1_sl_0');
    if (r1sl) {
      var a = {};
      for (var i = 0; i < 9; i++) {
        var s = document.getElementById('r1_sl_' + i);
        if (s && parseInt(s.value)) a[i] = parseInt(s.value);
      }
      return Object.keys(a).length ? a : getSliderAlloc();
    }
    return getSliderAlloc();
  })();

  // Validação
  if (!nome || !pat || !prof || !idade || !perfil || !obj) {
    var missing = [];
    var fields = [
      {id:'r1_prof', val:prof, label:'Profissão'},
      {id:'r1_pat_confirmado', val:pat, label:'Patrimônio'},
      {id:'r1_idade', val:idade, label:'Idade'},
      {id:'r1_perfil_confirmado', val:perfil, label:'Perfil de risco'},
      {id:'r1_obj', val:obj, label:'Objetivo'}
    ];
    fields.forEach(function(f) {
      var el = document.getElementById(f.id);
      if (!f.val) {
        missing.push(f.label);
        if (el) { el.style.borderColor = '#e05555'; el.classList.add('field-error'); }
      } else {
        if (el) { el.style.borderColor = ''; el.classList.remove('field-error'); }
      }
    });
    showToast('Preencha nas Anotações R1: ' + missing.join(', ') + '.', 'error');
    var bv = document.getElementById('validacaoBloco');
    if (bv) {
      var bvBody = bv.querySelector('.blkbody');
      if (bvBody && !bvBody.classList.contains('open')) { var bvHd = bv.querySelector('.blkhd'); if (bvHd) bvHd.click(); }
      bv.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    return;
  }

  // Limpar erros
  ['r1_prof','r1_pat_confirmado','r1_idade','r1_perfil_confirmado','r1_obj'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.borderColor = ''; el.classList.remove('field-error'); }
  });

  // Loader
  collapseSidebar();
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('outArea').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  var ldlabelEl = document.querySelector('.ldlabel');
  if (ldlabelEl) ldlabelEl.textContent = 'Gerando proposta R2...';
  var stepTexts = ['Analisando diagnóstico R1','Construindo proposta personalizada','Montando slides','Calculando alocação ideal'];
  ['ss1','ss2','ss3','ss4'].forEach(function(id, i) {
    var el = document.getElementById(id);
    if (el) { var dot = el.querySelector('.lddot'); el.innerHTML = ''; if (dot) el.appendChild(dot); el.appendChild(document.createTextNode(stepTexts[i])); }
  });
  var btnGen = document.getElementById('btnGen');
  if (btnGen) btnGen.disabled = true;
  proposalApproved = false;
  proposalDraftHash = null;

  // Debitar crédito
  try { await debitCredit('geracao', nome); }
  catch(e) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    if (btnGen) btnGen.disabled = false;
    showToast(e.message, 'error');
    return;
  }

  // Animação de steps
  var ids = ['ss1','ss2','ss3','ss4'];
  ids.forEach(function(id) { var el = document.getElementById(id); if (el) el.className = 'ldstep'; });
  var si = 0;
  var iv = setInterval(function() {
    if (si > 0) { var prev = document.getElementById(ids[si-1]); if (prev) prev.className = 'ldstep done'; }
    if (si < ids.length) { var cur = document.getElementById(ids[si]); if (cur) cur.className = 'ldstep active'; si++; }
    else clearInterval(iv);
  }, 950);

  var patFmt = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0}).format(pat);
  var currentAllocStr = '';
  if (currentAlloc) {
    currentAllocStr = Object.keys(currentAlloc).map(function(k) {
      return k + ': ' + currentAlloc[k] + '%';
    }).filter(function(s) { return s.indexOf(': 0%') === -1; }).join(', ');
  }

  var empresaPrompt = buildEmpresaPrompt();
  var nomeEmpresa = (empresaData && empresaData.empresa_nome) ? empresaData.empresa_nome : 'Captor Investimentos';
  var allocRuleStr = buildAllocPrompt(perfil);

  // Buscar r1_notes frescos do banco
  var r1NotesCtx = '';
  if (AppState.prospects.currentId) {
    try {
      var freshRes = await sb.from('prospects').select('r1_notes').eq('id', AppState.prospects.currentId).maybeSingle();
      if (freshRes.data && freshRes.data.r1_notes) {
        var prospectAtual = AppState.prospects.all.find(function(x) { return x.id === AppState.prospects.currentId; });
        if (prospectAtual) prospectAtual.r1_notes = freshRes.data.r1_notes;
        r1NotesCtx = buildR1NotesContext(freshRes.data.r1_notes);
      }
    } catch(e) { console.warn('generate: erro ao buscar r1_notes', e); }
  }

  var prompt = (empresaPrompt
    ? 'Você é assessor sênior da ' + nomeEmpresa + '. ' + empresaPrompt
    : 'Você é assessor sênior da Captor Investimentos (XP credenciada, +R$12bi custódia, +15mil clientes, Nº1 NPS 2024). Portfólio completo: investimentos, renda variável, crédito, câmbio, seguros, wealth planning, offshore, Captor Family Office, M&A.'
  ) + '\n\n'
    + 'MÉTODO DE ATENDIMENTO:\n'
    + 'Esta assessoria usa o método R1/R2. A R1 (reunião de diagnóstico) já foi realizada. Agora é a R2 — reunião de apresentação da proposta. '
    + 'Na R2 o assessor apresenta a alocação recomendada e explica por que ela faz sentido para o perfil e momento de vida deste cliente. '
    + 'O cliente pode precisar de mais de uma R2 antes de fechar — não há pressão para fechamento imediato.\n\n'
    + (r1NotesCtx ? 'O QUE FOI APRENDIDO NA R1 (use para personalizar a apresentação):\n' + r1NotesCtx : '')
    + 'CLIENTE:\n'
    + 'Nome: ' + nome + ' | Patrimônio: ' + patFmt + ' | Profissão: ' + prof + ' | Idade: ' + idade + ' anos | Perfil: ' + perfil + ' | Objetivo: ' + obj + ' | Assessoria atual: ' + (ass || 'não informado') + ' | Contexto: ' + (ctx || 'nenhum') + '\n'
    + 'Problemas CONFIRMADOS na gestão atual: ' + (gaps || 'nenhum informado') + '\n'
    + (currentAllocStr ? 'Alocação ATUAL do cliente: ' + currentAllocStr + '\n' : '')
    + '\nESTRUTURA DO ROTEIRO R2 — gere exatamente 6 etapas nesta ordem:\n'
    + '1. Abertura: retome o diagnóstico da R1 ("na nossa conversa você me contou que...") para mostrar que você ouviu e lembrou\n'
    + '2. Apresentação da alocação: explique cada classe de ativo presente na carteira sugerida\n'
    + '3. Por que faz sentido para você: conecte cada decisão de alocação ao perfil de risco, objetivo e momento de vida deste cliente específico\n'
    + '4. Projeção patrimonial: mostre o potencial desta carteira no horizonte de tempo declarado\n'
    + '5. Espaço para dúvidas: aborde proativamente as objeções levantadas na R1' + (r1NotesCtx ? ' (listadas acima)' : '') + ', com argumentos preparados\n'
    + '6. Encerramento: sem pressão — deixe claro que o cliente pode levar o tempo que precisar e que você está disponível para uma próxima R2 se necessário\n\n'
    + 'REGRA CRÍTICA SOBRE GAPS E ARGUMENTOS: '
    + (gaps
      ? 'Use APENAS os problemas confirmados acima como base para argumentos e diagnóstico. Não invente outros gaps além dos listados.'
      : 'Não há problemas confirmados. NUNCA afirme que existem gaps ou problemas na gestão atual do cliente. Nos argumentos, use linguagem de INVESTIGAÇÃO ("vale entender se...", "dependendo do que encontrarmos..."). Foque nos benefícios da empresa, não em críticas à situação atual.'
    ) + '\n\n'
    + 'REGRA DE ALOCAÇÃO OFICIAL para perfil ' + perfil + ': ' + allocRuleStr + '\n'
    + (currentAllocStr
      ? 'O cliente JÁ TEM a alocação informada acima. Sua sugestão deve mostrar a REALOCAÇÃO necessária. No campo "alocacao" do JSON, coloque a alocação SUGERIDA (destino), não a atual. Nos argumentos e slides, mencione as principais mudanças propostas e por que fazem sentido.\n'
      : 'Para o campo "alocacao", escolha percentuais DENTRO das faixas acima. Os percentuais devem somar exatamente 100%.\n'
    )
    + 'Use os mesmos 9 labels de classes de ativos.\n'
    + 'IMPORTANTE: títulos dos slides em sentence case. Nunca use maiúsculas no título.\n'
    + 'IMPORTANTE: nunca use a palavra "rapport". Substitua por: conexão, confiança, proximidade, abertura ou sintonia.\n'
    + 'IMPORTANTE: os percentuais nos textos DEVEM ser EXATAMENTE os mesmos do campo alocacao.data.\n\n'
    + 'Responda SOMENTE JSON válido, sem markdown, sem texto antes ou depois:\n'
    + '{"resumoPerfil":"2-3 frases dirigidas ao cliente na 2ª pessoa (\'Você é...\'), tom consultivo e humano","roteiro":[{"titulo":"...","descricao":"...","dica":"...","minutos":5}],"perguntas":[{"pergunta":"...","motivo":"..."}],"argumentos":[{"titulo":"...","corpo":"texto na 2ª pessoa dirigido ao cliente (\'Você se beneficia de...\')","frase_gancho":"..."}],"slides":[{"numero":1,"rotulo":"Capa","titulo":"Crescimento patrimonial para [nome]","conteudo":"...","visual":"..."},{"numero":4,"rotulo":"Estratégia Captor","titulo":"Nossa proposta diferenciada","conteudo":"...","visual":"..."},{"numero":5,"rotulo":"Resultado Projetado","titulo":"Carteira otimizada","conteudo":"...","visual":"..."}],"alocacao":{"labels":["Pós Fixado","Inflação","Prefixado","Multimercados","Renda Variável BR","FII","Alternativos","RF Global","RV Global"],"data":[70,10,5,5,2,0,0,3,5]}}\n\n'
    + 'Gere: 6 etapas no roteiro, 3 perguntas de verificação de alinhamento, 3 argumentos, 6 slides (Capa / Contexto do cliente / Por que esta alocação / Estratégia Captor / Resultado Projetado / Próximos Passos). Seja específico para este cliente.';

  try {
    var resp = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{role:'user', content: prompt}]})
    });
    if (!resp.ok) {
      var err = await resp.json().catch(function(){return{};});
      throw new Error('HTTP ' + resp.status + ': ' + (err.error && err.error.message ? err.error.message : resp.statusText));
    }
    var d = await resp.json();
    if (d && d.usage) await logAiUsage('gerar_r2', null, 'claude-sonnet-4-20250514', d.usage.input_tokens, d.usage.output_tokens, 'success');
    if (!d || !d.content) throw new Error('Resposta vazia da IA.');
    var raw = d.content.map(function(c){return c.text||'';}).join('');
    var parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());

    clearInterval(iv);
    ids.forEach(function(id){ var el = document.getElementById(id); if(el) el.className = 'ldstep done'; });

    // Salvar perfil_validado
    if (AppState.prospects.currentId) {
      var pv = {nome:nome, pat:pat, prof:prof, idade:idade, perfil:perfil, obj:obj, horizonte:vd.horizonte, ass:ass, gaps:gaps, ctx:ctx};
      sb.from('prospects').update({perfil_validado: pv, status: 'r2_iniciada'}).eq('id', AppState.prospects.currentId).then(function(){});
      var px = AppState.prospects.all.find(function(x){return x.id === AppState.prospects.currentId;});
      if (px) px.status = 'r2_iniciada';
    }

    setTimeout(function() {
      document.getElementById('loadingState').style.display = 'none';
      window._lastMeta = {nome:nome, pat:pat, perfil:perfil, prof:prof, obj:obj, idade:idade, currentAlloc:currentAlloc};
      window._lastOutput = parsed;
      renderOutput(nome, patFmt, parsed, window._lastMeta);
      document.getElementById('outArea').style.display = 'block';
      if (btnGen) btnGen.disabled = false;
      var out = document.getElementById('outArea');
      if (out) setTimeout(function(){ out.scrollIntoView({behavior:'smooth', block:'start'}); }, 100);
    }, 300);

  } catch(e) {
    clearInterval(iv);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    if (btnGen) btnGen.disabled = false;
    showToast('Erro ao gerar proposta R2: ' + e.message, 'error');
  }
}
