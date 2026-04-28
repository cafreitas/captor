// ── BUG #1 FIX: Restaurar funções de validação removidas na refatoração ──

/**
 * Verifica se todos os campos obrigatórios estão preenchidos
 * Usado por updateAllButtonStates() para habilitar/desabilitar botões
 */
function requiredFieldsFilled(){
  var nome = (document.getElementById('pd_nome')||{}).value||'';
  var prof = (document.getElementById('pd_prof')||{}).value||'';
  var idade = (document.getElementById('pd_idade')||{}).value||'';
  var perfil = (document.getElementById('pd_perfil')||{}).value||'';
  var obj = (document.getElementById('pd_obj')||{}).value||'';
  return !!(nome.trim() && prof.trim() && idade && perfil && obj);
}

/**
 * Atualiza estado de todos os botões (R1 e R2) baseado em:
 * - Se campos obrigatórios estão preenchidos
 * - Status atual do prospect
 * - Toggle R1 (se já foi finalizada)
 */
function updateAllButtonStates(status){
  var btnR1 = document.getElementById('btnGenR1');
  var btnR2 = document.getElementById('btnGen');
  var r1Tip = document.getElementById('btnGenR1Tip');
  var r2Tip = document.getElementById('btnGenR2Tip');
  var wrapR1 = document.getElementById('btnGenR1Wrap');
  var wrapR2 = document.getElementById('btnGenWrap');

  function setBtn(btn, wrap, tip, enabled, tipMsg){
    if(!btn) return;
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.45';
    if(wrap){
      wrap.onmouseenter = enabled ? null : function(){
        if(tip){
          tip.textContent = tipMsg;
          tip.style.display = 'block';
        }
      };
      wrap.onmouseleave = function(){
        if(tip) tip.style.display = 'none';
      };
    }
    if(tip) tip.style.display = 'none';
  }

  var filled = requiredFieldsFilled();
  var r2Visible = (status === 'r1_concluida' || status === 'resumo_enviado' || status === 'r1_aprovada' || status === 'r2_iniciada' || status === 'negocio_fechado');

  // R2: só aparece quando status permite
  if(btnR2) btnR2.style.display = r2Visible ? '' : 'none';
  if(wrapR2) wrapR2.style.display = r2Visible ? '' : 'none';

  // Sem prospect — R1 habilitada se campos preenchidos, R2 oculta
  if(!AppState.prospects.currentId){
    setBtn(btnR1, wrapR1, r1Tip, filled, 'Preencha os campos obrigatórios');
    return;
  }

  // Status terminal — tudo bloqueado
  if(status === 'negocio_fechado' || status === 'perdido_user' || status === 'perdido_auto'){
    setBtn(btnR1, wrapR1, r1Tip, false, 'Prospect finalizado');
    setBtn(btnR2, wrapR2, r2Tip, false, 'Prospect finalizado');
    return;
  }

  var toggleOn = document.getElementById('toggleR1') && document.getElementById('toggleR1').checked;

  // R1: habilitada se campos preenchidos e toggle OFF
  setBtn(btnR1, wrapR1, r1Tip, filled && !toggleOn, toggleOn ? 'R1 já finalizada' : 'Preencha os campos obrigatórios');

  // R2: habilitada se campos preenchidos e status permite
  var r2Allowed = filled && r2Visible;
  setBtn(btnR2, wrapR2, r2Tip, r2Allowed, 'Preencha os campos obrigatórios');
}

/**
 * Alias para compatibilidade
 */
function updateR2ButtonState(status){
  updateAllButtonStates(status);
}

/**
 * Atualizar estado dos botões quando campos mudam
 * Chamada por syncFormToSidebar() e outros handlers
 */
function onFieldChange(){
  var p=AppState.prospects.currentId?AppState.prospects.all.find(function(x){return x.id===AppState.prospects.currentId;}):null;
  updateAllButtonStates(p?p.status:null);
}

/**
 * Chamar updateAllButtonStates() quando campos mudam
 */
function initButtonStateListeners(){
  var fields = ['pd_nome', 'pd_pat', 'pd_prof', 'pd_idade', 'pd_perfil', 'pd_obj'];
  
  fields.forEach(function(fieldId){
    var el = document.getElementById(fieldId);
    if(el){
      el.addEventListener('input', function(){
        // Atualizar estado com status atual (ou null se sem prospect)
        var status = null;
        if(AppState.prospects.currentId){
          var prospect = AppState.prospects.all.find(function(p){
            return p.id === AppState.prospects.currentId;
          });
          status = prospect ? prospect.status : null;
        }
        updateAllButtonStates(status);
      });
    }
  });
  
  // Validar na página carregada
  setTimeout(function(){
    updateAllButtonStates(null);
  }, 500);
}

// Inicializar listeners quando página carrega
document.addEventListener('DOMContentLoaded', initButtonStateListeners);
