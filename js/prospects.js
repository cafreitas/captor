/**
 * CAPTOR — Módulo de Prospects (prospects.js)
 * Responsável por: Gerenciar, filtrar, listar e editar prospects
 * 
 * Dependências externas:
 * - sb (Supabase client)
 * - supabaseUserId (do módulo de auth)
 * - AppState (variável global)
 * - prospectStatusLabels (definido abaixo)
 */

// ── STATUS LABELS ──
var prospectStatusLabels = {
  prospect_criado:  'Criado',
  r1_iniciada:      'R1 Iniciada',
  r1_concluida:     'R1 Concluída',
  resumo_enviado:   'Resumo Enviado',
  r1_aprovada:      'R1 Aprovada',
  r2_iniciada:      'R2 Iniciada',
  negocio_fechado:  'Negócio Fechado',
  perdido_user:     'Perdido',
  perdido_auto:     'Perdido (auto)'
};

// ── CARREGAR SELETOR DE PROSPECTS ──
async function loadProspectsSelector() {
  if (!supabaseUserId) return;
  
  var { data } = await sb.from('prospects')
    .select('id,nome,status,perfil_risco,patrimonio_estimado,objetivo,profissao,idade,horizonte,email,telefone,r1_notes')
    .eq('assessor_id', supabaseUserId)
    .not('status', 'in', '(perdido_user,perdido_auto)')
    .order('created_at', { ascending: false });
    
  AppState.prospects.all = data || [];
  
  var sel = document.getElementById('fProspectSel');
  if (!sel) return;
  
  sel.innerHTML = '<option value="">— Novo prospect —</option>';
  AppState.prospects.all.forEach(function(p) {
    var opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nome || '(sem nome)';
    sel.appendChild(opt);
  });
  
  AppState.prospects.currentId = null;
  clearProspectForm();
}

// ── SELECIONAR PROSPECT ──
function onProspectSelect() {
  var id = document.getElementById('fProspectSel').value;
  if (!id) { clearProspectForm(); return; }
  
  var p = AppState.prospects.all.find(function(x) { return x.id === id; });
  if (!p) return;
  
  AppState.prospects.currentId = id;
  
  // Preencher formulário
  document.getElementById('fNome').value = p.nome || '';
  
  if (p.patrimonio_estimado && p.patrimonio_estimado > 0) {
    var fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.patrimonio_estimado);
    document.getElementById('fPat').value = fmt;
  } else {
    document.getElementById('fPat').value = '';
  }
  
  document.getElementById('fProf').value = p.profissao || '';
  document.getElementById('fIdade').value = p.idade || '';
  document.getElementById('fPerfil').value = p.perfil_risco || '';
  document.getElementById('fObj').value = p.objetivo || '';
  document.getElementById('fHorizonte').value = p.horizonte || '';
  
  var st = document.getElementById('fProspectStatus');
  if (st && p.status) {
    st.innerHTML = '<span class="ds ps-' + p.status + '" style="font-size:.68rem;padding:2px 8px;border-radius:20px">' + prospectStatusLabels[p.status] + '</span>';
  }
  
  updateR2ButtonState(p.status);
  syncToggleR1(p.status);
  
  // Mostrar toggle se prospect passou de R1
  var showToggle = ['r1_concluida', 'resumo_enviado', 'r1_aprovada', 'r2_iniciada', 'negocio_fechado'];
  if (p.roteiro_r1 || showToggle.indexOf(p.status) >= 0) {
    document.getElementById('confirmR1Wrap').style.display = 'flex';
  }
  
  // Buscar r1_notes fresco do banco
  (async function() {
    var { data: fresh } = await sb.from('prospects')
      .select('r1_notes,patrimonio_estimado')
      .eq('id', id)
      .maybeSingle();
    if (fresh) {
      p.r1_notes = fresh.r1_notes;
      var patAtual = getRawPat();
      if (!patAtual || patAtual === 0) {
        var patConfirmado = fresh.r1_notes && (
          (fresh.r1_notes.durante && fresh.r1_notes.durante.patrimonio_confirmado) ||
          fresh.r1_notes.patrimonio_confirmado
        );
        if (patConfirmado) {
          var patNum = parseInt(String(patConfirmado).replace(/\D/g, ''));
          if (patNum > 0) {
            document.getElementById('fPat').value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(patNum);
          }
        } else if (fresh.patrimonio_estimado && fresh.patrimonio_estimado > 0) {
          document.getElementById('fPat').value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(fresh.patrimonio_estimado);
        }
      }
    }
  })();
}

// ── LIMPAR FORMULÁRIO DE PROSPECT ──
function clearProspectForm() {
  AppState.prospects.currentId = null;
  AppState.prospects.r1Generated = false;
  ['pd_nome','pd_pat','pd_prof','pd_idade','pd_perfil','pd_obj',
   'pd_horizonte','pd_ass','pd_gaps','pd_ctx'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var pdStatus = document.getElementById('pdStatusBadge');
  if (pdStatus) pdStatus.innerHTML = '';
  var confirmWrap = document.getElementById('confirmR1Wrap');
  if (confirmWrap) confirmWrap.style.display = 'none';
  syncToggleR1(null);
  updateR2ButtonState(null);
  resetPdSliders();
  updateAllButtonStates(null);
}

// ── CARREGAR LISTA DE PROSPECTS ──
async function loadProspects() {
  var { data } = await fetchProspects();
  if (!data || !data.length) {
    document.getElementById('prospectview').innerHTML = '<div class="empty"><div class="emicon">📋</div><div class="emtit">Nenhum prospect</div><div class="emdesc">Crie seu primeiro prospect para começar.</div></div>';
    return;
  }
  
  AppState.prospects.all = data;
  renderProspectTable(data);
}

// ── BUSCAR PROSPECTS ──
async function fetchProspects() {
  if (!supabaseUserId) return { data: [] };
  
  var query = sb.from('prospects')
    .select('*')
    .eq('assessor_id', supabaseUserId)
    .not('status', 'in', '(perdido_user,perdido_auto)');
  
  var { data, error } = await query.order(AppState.prospects.sortCol, { ascending: AppState.prospects.sortDir[AppState.prospects.sortCol] === 'asc' });
  
  if (error) console.error('Erro ao buscar prospects:', error);
  return { data: data || [] };
}

// ── RENDERIZAR TABELA DE PROSPECTS ──
function renderProspectTable(rows) {
  var tbody = document.getElementById('prospectTableBody');
  if (!tbody) return;
  
  if (!rows || !rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="padding:32px;text-align:center">' +
      '<div style="color:var(--dim);font-size:.85rem;margin-bottom:12px">Nenhum prospect ainda.</div>' +
      '<button onclick="fillExampleAndOpen()" style="padding:7px 16px;background:var(--lime);color:#1a1a1a;border:none;border-radius:var(--r);font-family:var(--f);font-size:.78rem;font-weight:700;cursor:pointer">Experimente com um exemplo</button>' +
      '</td></tr>';
    return;
  }
  
  var UNPROCESSED = ['prospect_criado', 'r1_iniciada'];
  var sorted = rows.slice().sort(function(a, b) {
    var aUp = UNPROCESSED.indexOf(a.status) >= 0 ? 0 : 1;
    var bUp = UNPROCESSED.indexOf(b.status) >= 0 ? 0 : 1;
    return aUp - bUp;
  });
  
  tbody.innerHTML = sorted.map(function(p) {
    var patFmt = p.patrimonio_estimado
      ? new Intl.NumberFormat('pt-BR', {notation: 'compact', maximumFractionDigits: 1}).format(p.patrimonio_estimado)
      : '—';
    var dt = new Date(p.created_at).toLocaleDateString('pt-BR');
    var st = prospectStatusLabels[p.status] || p.status;
    var isNew = UNPROCESSED.indexOf(p.status) >= 0;
    
    return '<tr class="dash-tr" onclick="openProspectDetail(\'' + escHtml(p.id) + '\')" style="border-bottom:1px solid var(--border2);cursor:pointer' + (isNew ? ';background:rgba(168,194,58,.025)' : '') + '">' +
      '<td style="padding:9px 12px;color:var(--text);font-weight:600">' + (isNew ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--lime);margin-right:7px;vertical-align:middle;flex-shrink:0"></span>' : '') + escHtml(p.nome || '(sem nome)') + '</td>' +
      '<td style="padding:9px 12px;color:var(--muted)">' + escHtml(p.perfil_risco || '—') + '</td>' +
      '<td style="padding:9px 12px;color:var(--muted)">' + patFmt + '</td>' +
      '<td style="padding:9px 12px"><span class="ds ps-' + p.status + '" style="font-size:.65rem;padding:2px 8px;border-radius:4px;white-space:nowrap">' + st + '</span></td>' +
      '<td style="padding:9px 12px;color:var(--dim)">' + dt + '</td>' +
      '<td style="padding:9px 12px" onclick="event.stopPropagation()">' +
      (p.status !== 'perdido_user' && p.status !== 'perdido_auto' && p.status !== 'negocio_fechado'
        ? '<button onclick="markPerdidoUser(\'' + escHtml(p.id) + '\')" class="dash-link" style="color:var(--status-lost-user);border-color:rgba(239,68,68,.3)">Perdido</button>'
        : '') +
      '</td></tr>';
  }).join('');
}

// ── CARREGAR PROSPECT NA SIDEBAR ──
function loadProspectIntoSidebar(id) {
  var p = AppState.prospects.all.find(function(x) { return x.id === id; });
  if (p) {
    document.getElementById('fProspectSel').value = id;
    onProspectSelect();
  }
}

// ── BUSCAR PROSPECT POR NOME (AUTOCOMPLETE) ──
function onProspectNomeSearch(val) {
  var searchVal = val.toLowerCase();
  var results = AppState.prospects.all.filter(function(p) {
    return (p.nome || '').toLowerCase().indexOf(searchVal) >= 0;
  });
  
  var ac = document.getElementById('prospectNomeAC');
  if (!ac) return;
  
  if (!searchVal) {
    ac.style.display = 'none';
    return;
  }
  
  ac.innerHTML = results.slice(0, 5).map(function(p) {
    return '<div class="ac-item" onclick="selectProspectNomeSearch(\'' + escHtml(p.id) + '\')">' + escHtml(p.nome) + '</div>';
  }).join('');
  ac.style.display = results.length > 0 ? 'block' : 'none';
}

// ── SELECIONAR PROSPECT DO AUTOCOMPLETE ──
function selectProspectNomeSearch(id) {
  document.getElementById('fProspectSel').value = id;
  onProspectSelect();
  var ac = document.getElementById('prospectNomeAC');
  if (ac) ac.style.display = 'none';
}

// ── APLICAR FILTROS ──
function applyProspectFilters() {
  var nome = document.getElementById('filterProspectNome')?.value.toLowerCase() || '';
  var status = document.getElementById('filterProspectStatus')?.value || '';
  var profissao = document.getElementById('filterProspectProfissao')?.value || '';
  
  var filtered = AppState.prospects.all.filter(function(p) {
    return (
      (nome === '' || (p.nome || '').toLowerCase().indexOf(nome) >= 0) &&
      (status === '' || p.status === status) &&
      (profissao === '' || (p.profissao || '').indexOf(profissao) >= 0)
    );
  });
  
  renderProspectTable(filtered);
}

// ── WRAPPER PARA FILTROS ──
function filterProspects() {
  applyProspectFilters();
}

// ── ABRIR DETALHE DO PROSPECT ──
async function openProspectDetail(id) {
  if (!id || id === 'new') {
    openNewProspectDetail();
    return;
  }
  
  // Sempre buscar dados frescos do banco (garante campos atualizados após upsert)
  var { data: fresh } = await sb.from('prospects').select('*').eq('id', id).maybeSingle();
  if (fresh) {
    var idx = AppState.prospects.all.findIndex(function(x) { return x.id === id; });
    if (idx >= 0) Object.assign(AppState.prospects.all[idx], fresh);
    else AppState.prospects.all.unshift(fresh);
  }
  var prospect = fresh || AppState.prospects.all.find(function(p) { return p.id === id; });
  
  if (!prospect) {
    console.error('Prospect não encontrado');
    return;
  }
  
  AppState.prospects.currentId = id;
  
  // Preencher view detalhado
  document.getElementById('prospectview').style.display = 'none';
  document.getElementById('prospectDetailView').style.display = 'block';
  expandSidebar();
  document.getElementById('outArea').style.display = 'none';
  document.getElementById('emptyState').style.display = 'flex';
  
  // Helper para preencher campos pd_*
  function spd(fieldId, value) {
    var el = document.getElementById(fieldId);
    if (el) el.value = value || '';
  }
  
  // Preencher nome no display
  var pdNomeDisp = document.getElementById('pdNomeDisplay');
  if (pdNomeDisp) pdNomeDisp.textContent = prospect.nome || '(sem nome)';
  
  // Preencher formulário com dados disponíveis
  spd('pd_nome', prospect.nome);
  
  // Patrimônio: formatar se disponível
  if (prospect.patrimonio_estimado && prospect.patrimonio_estimado > 0) {
    var fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(prospect.patrimonio_estimado);
    spd('pd_pat', fmt);
  }
  
  spd('pd_prof', prospect.profissao);
  spd('pd_idade', prospect.idade);
  spd('pd_perfil', prospect.perfil_risco);
  spd('pd_obj', prospect.objetivo);
  spd('pd_horizonte', prospect.horizonte);
  
  // Status badge
  var pdStatus = document.getElementById('pdStatusBadge');
  if (pdStatus && prospect.status) {
    pdStatus.innerHTML = '<span class="ds ps-' + prospect.status + '" style="font-size:.68rem;padding:2px 8px;border-radius:4px">' + (prospectStatusLabels[prospect.status] || prospect.status) + '</span>';
  }
  
  // Sincronizar toggle R1 com status
  syncToggleR1(prospect.status);
  
  // Sincronizar botões R2
  updateR2ButtonState(prospect.status);
  
  // Se há dados de alocação em r1_notes, carregar nos sliders
  if (prospect.r1_notes && prospect.r1_notes.alocacao) {
    var alloc = prospect.r1_notes.alocacao;
    for (var i = 0; i < 9; i++) {
      var pdSl = document.getElementById('pd_sl_' + i);
      if (pdSl) pdSl.value = alloc[i] || 0;
      var pdVal = document.getElementById('pd_sl_' + i + '_v');
      if (pdVal) pdVal.textContent = (alloc[i] || 0) + '%';
    }
    updatePdAllocTotal();
  } else {
    // Resetar sliders se não há alocação
    for (var i = 0; i < 9; i++) {
      var pdSl = document.getElementById('pd_sl_' + i);
      if (pdSl) pdSl.value = 0;
      var pdVal = document.getElementById('pd_sl_' + i + '_v');
      if (pdVal) pdVal.textContent = '0%';
    }
    updatePdAllocTotal();
  }
  
  // Bug 7: mostrar confirmR1Wrap quando R1 existe ou status avançado
  var r1StatusList = ['r1_concluida','resumo_enviado','r1_aprovada','r2_iniciada','negocio_fechado'];
  var confirmWrap = document.getElementById('confirmR1Wrap');
  if (confirmWrap) {
    confirmWrap.style.display = (prospect.roteiro_r1 || r1StatusList.indexOf(prospect.status) >= 0) ? 'flex' : 'none';
  }

  // Bug 6: renderizar R1 existente ao reabrir prospect
  if (prospect.roteiro_r1) {
    var patFmtR1 = prospect.patrimonio_estimado
      ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(prospect.patrimonio_estimado)
      : 'patrimônio a confirmar';
    document.getElementById('emptyState').style.display = 'none';
    AppState.prospects.r1Generated = true;
    renderR1Output(prospect.nome, patFmtR1, prospect.roteiro_r1);
    appendAnotacoesBlock(
      (prospect.roteiro_r1.perguntas || []),
      prospect.r1_notes || null
    );
    document.getElementById('outArea').style.display = 'block';
    collapseSidebar();
  }

  // Bug 10: garantir que SELECT pd_horizonte reflita o valor salvo
  var hEl = document.getElementById('pd_horizonte');
  if (hEl && prospect.horizonte) {
    hEl.value = prospect.horizonte;
    // Se o valor não corresponde a nenhuma option, mantém vazio
    if (hEl.value !== prospect.horizonte) hEl.value = '';
  }

  // Sincronizar estado de botões
  syncFormToSidebar();
  updateAllButtonStates(prospect.status);
}

// ── FECHAR DETALHE DO PROSPECT ──
async function closeProspectDetail() {
  // Salvar dados se há nome preenchido
  var nomeEl = document.getElementById('pd_nome');
  var nome = nomeEl ? nomeEl.value.trim() : '';
  if (nome) {
    try { await upsertProspect(null); } catch(e) { console.warn('closeProspectDetail save:', e); }
  }
  document.getElementById('prospectDetailView').style.display = 'none';
  document.getElementById('prospectview').style.display = 'block';
  // Recarregar lista para refletir mudanças (nome, status, perfil)
  await loadProspects();
}

// ── ABRIR NOVO PROSPECT — abre modal de método ──
function openNewProspectDetail() {
  document.getElementById('prospectMethodModal').style.display = 'flex';
}

function closeProspectMethodModal() {
  document.getElementById('prospectMethodModal').style.display = 'none';
}

function openProspectMethodManual() {
  closeProspectMethodModal();
  AppState.prospects.currentId = null;
  clearProspectForm();
  document.getElementById('prospectview').style.display = 'none';
  document.getElementById('prospectDetailView').style.display = 'block';
  document.getElementById('outArea').style.display = 'none';
  document.getElementById('outArea').innerHTML = '';
  document.getElementById('emptyState').style.display = 'flex';
  var pdName = document.getElementById('pdNomeDisplay');
  if (pdName) pdName.textContent = 'Novo prospect';
  expandSidebar();
  updateAllButtonStates(null);
}

function openProspectMethodAPI() {
  showToast('Integração via API em breve.', 'info');
}

// ── HELPER: ESCAPAR HTML ──
function syncToggleR1(status){
  var toggle=document.getElementById('toggleR1');
  var track=document.getElementById('toggleR1Track');
  var thumb=document.getElementById('toggleR1Thumb');
  if(!toggle)return;
  var on=status&&['r1_concluida','resumo_enviado','r1_aprovada','r2_iniciada','negocio_fechado'].indexOf(status)>=0;
  toggle.checked=on;
  track.style.background=on?'var(--lime)':'#444';
  thumb.style.transform=on?'translateX(18px)':'translateX(0)';
  var tb=document.getElementById('toggleR1b');
  var tbT=document.getElementById('toggleR1bTrack');
  var tbTh=document.getElementById('toggleR1bThumb');
  if(tb){tb.checked=on;if(tbT)tbT.style.background=on?'var(--lime)':'#444';if(tbTh)tbTh.style.transform=on?'translateX(18px)':'translateX(0)';}
  var r2w=document.getElementById('btnR2BottomWrap');
  if(r2w)r2w.style.display=on?'block':'none';
  updateAllButtonStates(status);
}

async function onToggleR1(checked){
  var track=document.getElementById('toggleR1Track');
  var thumb=document.getElementById('toggleR1Thumb');
  var tb=document.getElementById('toggleR1b');
  var tbT=document.getElementById('toggleR1bTrack');
  var tbTh=document.getElementById('toggleR1bThumb');
  function syncBottom(on){
    if(tb){tb.checked=on;if(tbT)tbT.style.background=on?'var(--lime)':'#444';if(tbTh)tbTh.style.transform=on?'translateX(18px)':'translateX(0)';}
    var r2w=document.getElementById('btnR2BottomWrap');
    if(r2w)r2w.style.display=on?'block':'none';
  }
  if(checked){
    if(!isValidacaoPreenchida()){
      showToast('Preencha Perfil e Objetivo nas Anotações R1 antes de confirmar.','error');
      document.getElementById('toggleR1').checked=false;
      track.style.background='#444';
      thumb.style.transform='translateX(0)';
      syncBottom(false);
      var bv=document.getElementById('validacaoBloco');
      if(bv){
        var bvBody=bv.querySelector('.blkbody');
        if(bvBody&&!bvBody.classList.contains('open')){var bvHd=bv.querySelector('.blkhd');if(bvHd)bvHd.click();}
        bv.scrollIntoView({behavior:'smooth',block:'start'});
      }
      return;
    }
    track.style.background='var(--lime)';
    thumb.style.transform='translateX(18px)';
    syncBottom(true);
    if(!AppState.prospects.currentId){
      showToast('Salve o prospect antes de confirmar a R1.','error');
      document.getElementById('toggleR1').checked=false;
      track.style.background='#444';
      thumb.style.transform='translateX(0)';
      syncBottom(false);
      return;
    }
    var activeTab=document.querySelector('.r1tab-btn.active');
    var mode=activeTab?activeTab.dataset.tab:'depois';
    var notes=collectR1Notes();
    var {error}=await sb.from('prospects').update({
      status:'r1_concluida',
      r1_mode:mode,
      r1_notes:notes
    }).eq('id',AppState.prospects.currentId);
    if(error){
      showToast('Erro ao confirmar R1: '+error.message,'error');
      document.getElementById('toggleR1').checked=false;
      track.style.background='#444';
      thumb.style.transform='translateX(0)';
      syncBottom(false);
      return;
    }
    syncBottom(true);
    var opt=document.querySelector('#fProspectSel option[value="'+AppState.prospects.currentId+'"]');
    if(opt)opt.textContent=opt.textContent.replace(/·.*$/,'· R1 Concluída');
    var st=document.getElementById('fProspectStatus');
    if(st)st.innerHTML='<span class="ds ps-r1_concluida" style="font-size:.68rem;padding:2px 8px;border-radius:20px">R1 Concluída</span>';
    var badge=document.getElementById('pdStatusBadge');
    if(badge)badge.innerHTML='<span class="ds ps-r1_concluida" style="font-size:.68rem;padding:2px 8px;border-radius:4px">R1 Concluída</span>';
    var p=AppState.prospects.all.find(function(x){return x.id===AppState.prospects.currentId;});
    if(p){p.status='r1_concluida';p.r1_notes=notes;}
    updateR2ButtonState('r1_concluida');
  } else {
    track.style.background='#444';
    thumb.style.transform='translateX(0)';
    syncBottom(false);
    var p=AppState.prospects.currentId?AppState.prospects.all.find(function(x){return x.id===AppState.prospects.currentId;}):null;
    updateAllButtonStates(p?p.status:null);
  }
}

function fillExampleAndOpen(){
  fillExample();
  AppState.prospects.currentId=null;
  document.getElementById('prospectview').style.display='none';
  document.getElementById('prospectDetailView').style.display='block';
  document.getElementById('pdFormGrid').style.display='grid';
  document.getElementById('pdNomeDisplay').textContent=document.getElementById('pd_nome').value||'Prospect de Exemplo';
  document.getElementById('pdStatusBadge').innerHTML='<span class="ds ps-prospect_criado" style="font-size:.68rem;padding:2px 8px;border-radius:4px">Exemplo</span>';
  document.getElementById('pdMetaExtra').textContent='';
  document.getElementById('confirmR1Wrap').style.display='none';
  document.getElementById('emptyState').style.display='flex';
  document.getElementById('outArea').style.display='none';
  document.getElementById('outArea').innerHTML='';
  syncToggleR1(null);
  updateAllButtonStates(null);
}

async function markPerdidoUser(id){
  showConfirmModal('Marcar como perdido','Este prospect será marcado como perdido. Você pode reverter isso manualmente.',async function(){
    await sb.from('prospects').update({status:'perdido_user'}).eq('id',id);
    var p=AppState.prospects.all.find(function(x){return x.id===id;});
    if(p)p.status='perdido_user';
    loadProspects();
  },'Marcar como perdido');
}

function escHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── EXTRAIR VALOR NUMÉRICO DE PATRIMÔNIO ──
function getRawPat() {
  var patStr = document.getElementById('pd_pat').value || '';
  if (!patStr) return null;
  var nums = String(patStr).replace(/\D/g, '');
  return nums ? parseInt(nums) : null;
}

// ── SALVAR/ATUALIZAR PROSPECT COM STATUS ──
async function upsertProspect(status) {
  if (!supabaseUserId) return;
  var nome = document.getElementById('pd_nome').value.trim();
  if (!nome) return;
  var pat = getRawPat();
  var campos = {
    nome: nome,
    profissao: document.getElementById('pd_prof').value || null,
    idade: parseInt(document.getElementById('pd_idade').value) || null,
    patrimonio_estimado: pat ? parseInt(String(pat).replace(/\D/g,'')) || null : null,
    perfil_risco: document.getElementById('pd_perfil').value || null,
    objetivo: document.getElementById('pd_obj').value || null,
    horizonte: document.getElementById('pd_horizonte').value || null,
    updated_at: new Date().toISOString()
  };
  if (AppState.prospects.currentId) {
    var updatePayload = Object.assign({}, campos);
    if (status) updatePayload.status = status;
    var res = await sb.from('prospects').update(updatePayload).eq('id', AppState.prospects.currentId);
    if (res.error) console.error('upsertProspect (update) erro:', res.error);
  } else {
    var insertPayload = Object.assign({}, campos, {
      assessor_id: supabaseUserId,
      firm_id: typeof currentFirmId !== 'undefined' ? currentFirmId || null : null,
      status: status || 'prospect_criado'
    });
    var res2 = await sb.from('prospects').insert([insertPayload]).select().maybeSingle();
    if (res2.error) { console.error('upsertProspect (insert) erro:', res2.error); return; }
    if (res2.data) {
      AppState.prospects.currentId = res2.data.id;
      AppState.prospects.all.unshift(res2.data);
    }
  }
}
