/**
 * CAPTOR — Módulo de Utilidades (utils.js)
 * Responsável por: Máscaras, validações, formatação, UI helpers
 */

// ── VALIDAÇÃO E LIMPEZA ──
function clearFieldError(el){
  if(!el)return;
  el.classList.remove('field-error');
  var err=el.parentNode.querySelector('.captor-inline-error');
  if(err)err.style.display='none';
}

// ── MÁSCARAS ──
function maskPat(el){
  var v=el.value.replace(/\D/g,'');
  el.value=v?'R$ '+new Intl.NumberFormat('pt-BR').format(parseInt(v)):'';
}

function maskAum(el){
  var v=el.value.replace(/\D/g,'');
  el.value=v?new Intl.NumberFormat('pt-BR').format(parseInt(v)):'';
}

function getRawPat(){
  var pat=document.getElementById('fPat')?.value||'';
  return parseInt(pat.replace(/\D/g,''))||0;
}

// ── ESCAPAR HTML ──
function escHtml(s){
  if(!s)return'';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ── TOASTS ──
function pixShowToast(msg) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e1e1e;border:1px solid var(--lime);border-radius:12px;padding:12px 22px;font-size:.84rem;font-weight:700;color:var(--lime);z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:fadein .3s ease;white-space:nowrap';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity .4s'; setTimeout(function(){ toast.remove(); }, 400); }, 4000);
}

function showToast(msg,tipo){
  var el=document.createElement('div');
  el.className='toast';
  el.textContent=msg;
  if(tipo==='error')el.style.borderColor='#f87171';
  document.body.appendChild(el);
  setTimeout(function(){el.remove();},3000);
}

// ── ERROS INLINE ──
function showInlineError(containerId,msg){
  var el=document.getElementById(containerId);
  if(!el)return;
  var err=el.querySelector('.captor-inline-error');
  if(!err){err=document.createElement('div');err.className='captor-inline-error';el.appendChild(err);}
  err.textContent=msg;
  err.style.display='block';
}

function clearInlineError(containerId){
  var el=document.getElementById(containerId);
  if(!el)return;
  var err=el.querySelector('.captor-inline-error');
  if(err)err.style.display='none';
}

// ── MODAIS ──
function showConfirmModal(title,msg,onConfirm,okLabel){
  var modal=document.getElementById('captorConfirmModal');
  if(!modal)return;
  modal.querySelector('.cm-title').textContent=title;
  modal.querySelector('.cm-msg').textContent=msg;
  modal.querySelector('.cm-ok').onclick=function(){onConfirm();modal.style.display='none';};
  modal.querySelector('.cm-cancel').onclick=function(){modal.style.display='none';};
  if(okLabel)modal.querySelector('.cm-ok').textContent=okLabel;
  modal.style.display='flex';
}
