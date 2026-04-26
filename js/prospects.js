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
  document.getElementById('fProspectSel').value = '';
  document.getElementById('fNome').value = '';
  document.getElementById('fPat').value = '';
  document.getElementById('fProf').value = '';
  document.getElementById('fIdade').value = '';
  document.getElementById('fPerfil').value = '';
  document.getElementById('fObj').value = '';
  document.getElementById('fHorizonte').value = '';
  document.getElementById('fAss').value = '';
  document.getElementById('fGaps').value = '';
  document.getElementById('fCtx').value = '';
  document.getElementById('fProspectStatus').innerHTML = '';
  document.getElementById('confirmR1Wrap').style.display = 'none';
  syncToggleR1(null);
  updateR2ButtonState(null);
  resetSliders();
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
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">Nenhum prospect encontrado</td></tr>';
    return;
  }
  
  tbody.innerHTML = rows.map(function(p) {
    var statusClass = 'ps-' + (p.status || 'prospect_criado');
    var patrimonio = p.patrimonio_estimado ? 'R$ ' + (p.patrimonio_estimado / 1000).toFixed(0) + 'k' : '—';
    var dataCriacao = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '—';
    
    return '<tr style="cursor:pointer" onclick="loadProspectIntoSidebar(\'' + escHtml(p.id) + '\')">' +
      '<td><strong>' + escHtml(p.nome || '(sem nome)') + '</strong></td>' +
      '<td>' + escHtml(p.profissao || '—') + '</td>' +
      '<td>' + patrimonio + '</td>' +
      '<td><span class="ds ' + statusClass + '">' + (prospectStatusLabels[p.status] || p.status) + '</span></td>' +
      '<td>' + dataCriacao + '</td>' +
      '</tr>';
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
  
  var prospect = AppState.prospects.all.find(function(p) { return p.id === id; });
  if (!prospect) {
    var { data } = await sb.from('prospects').select('*').eq('id', id).maybeSingle();
    prospect = data;
  }
  
  if (!prospect) {
    console.error('Prospect não encontrado');
    return;
  }
  
  AppState.prospects.currentId = id;
  
  // Preencher view detalhado
  document.getElementById('prospectDetailView').style.display = 'block';
  var pdName = document.getElementById('pdName');
  if (pdName) pdName.textContent = prospect.nome || '(sem nome)';
  
  // ... (mais preenchimentos aqui)
}

// ── FECHAR DETALHE DO PROSPECT ──
function closeProspectDetail() {
  document.getElementById('prospectDetailView').style.display = 'none';
}

// ── ABRIR NOVO PROSPECT ──
function openNewProspectDetail() {
  AppState.prospects.currentId = null;
  clearProspectForm();
  document.getElementById('prospectDetailView').style.display = 'block';
}

// ── HELPER: ESCAPAR HTML ──
function escHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
