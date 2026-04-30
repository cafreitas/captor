/**
 * CAPTOR — Módulo Unificado de Sliders de Alocação (alloc-sliders.js)
 * Carregado ANTES de init.js
 *
 * Uso:
 *   var inst = initAllocSliders(cfg);
 *
 * cfg:
 *   prefix      {string}   — prefixo dos IDs dos inputs  (ex: 'asl_', 'pd_sl_')
 *   containerId {string}   — id do elemento container
 *   totalElId   {string}   — id do elemento que exibe o total
 *   labels      {string[]} — array de rótulos das categorias
 *   compact     {boolean}  — layout compacto (pd_sl_*) vs padrão (asl_*)
 *   onChange    {function} — callback chamado após cada update (opcional)
 *
 * IDs gerados:
 *   range input : prefix + i          (ex: 'asl_0', 'pd_sl_0')
 *   value label : prefix + i + '_v'   (ex: 'asl_0_v', 'pd_sl_0_v')
 *
 * Retorna: { update(changedIdx), reset(), getValues(), setValues(arr) }
 */

function initAllocSliders(cfg) {
  var prefix      = cfg.prefix;
  var container   = document.getElementById(cfg.containerId);
  var labels      = cfg.labels;
  var totalElId   = cfg.totalElId;
  var compact     = cfg.compact || false;
  var onChange    = cfg.onChange || function(){};
  var n           = labels.length;

  if (!container) return null;

  // ── Renderização ──────────────────────────────────────────────────────────
  container.innerHTML = '';

  for (var i = 0; i < n; i++) {
    (function(idx) {
      var row = document.createElement('div');

      if (compact) {
        row.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:5px';
      } else {
        row.className = 'aslider-row';
      }

      // Label
      var lbl = document.createElement('span');
      lbl.title = labels[idx];
      lbl.textContent = labels[idx];
      if (compact) {
        lbl.style.cssText = 'font-size:.68rem;color:var(--muted);width:108px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      } else {
        lbl.className = 'aslider-label';
      }

      // Wrapper do range (padrão usa .aslider-wrap; compact usa flex:1)
      var wrap = document.createElement('div');
      if (compact) {
        wrap.style.flex = '1';
      } else {
        wrap.className = 'aslider-wrap';
      }

      // Range input
      var sl = document.createElement('input');
      sl.type = 'range';
      sl.min = 0; sl.max = 100; sl.value = 0; sl.step = 1;
      sl.className = 'aslider';
      sl.id = prefix + idx;
      if (compact) sl.style.flex = '1';
      sl.oninput = (function(i2){ return function(){ update(i2); onChange(); }; })(idx);

      // Value label
      var val = document.createElement('span');
      val.id = prefix + idx + '_v';
      val.textContent = '0%';
      if (compact) {
        val.style.cssText = 'font-size:.7rem;font-weight:700;color:var(--lime);width:30px;text-align:right;flex-shrink:0';
      } else {
        val.className = 'aslider-val';
      }

      wrap.appendChild(sl);
      row.appendChild(lbl);
      row.appendChild(wrap);
      row.appendChild(val);
      container.appendChild(row);
    })(i);
  }

  // ── update(changedIdx) ────────────────────────────────────────────────────
  // changedIdx >= 0 : aplica clamp no slider que mudou
  // changedIdx = -1 : recalcula totais sem clamp (ex: sync externo)
  function update(changedIdx) {
    var vals = [];
    var total = 0;

    for (var i = 0; i < n; i++) {
      var el = document.getElementById(prefix + i);
      vals.push(el ? parseInt(el.value) || 0 : 0);
      total += vals[i];
    }

    // Clamp: se passou de 100, reduz o slider que mudou
    if (changedIdx >= 0 && total > 100) {
      var over = total - 100;
      var changed = document.getElementById(prefix + changedIdx);
      if (changed) {
        changed.value = Math.max(0, vals[changedIdx] - over);
        vals[changedIdx] = parseInt(changed.value);
        total = 100;
      }
    }

    var remaining = 100 - total;

    // Atualiza labels e trava sliders zerados quando total = 100
    for (var i = 0; i < n; i++) {
      var sl = document.getElementById(prefix + i);
      var vl = document.getElementById(prefix + i + '_v');
      if (vl) vl.textContent = vals[i] + '%';
      if (sl) sl.disabled = (remaining === 0 && vals[i] === 0);
    }

    // Atualiza total com cor
    var totalEl = document.getElementById(totalElId);
    if (totalEl) {
      totalEl.textContent = total + '%';
      totalEl.style.color = total === 100
        ? 'var(--lime)'
        : total > 100
          ? '#f87171'
          : 'var(--gold)';
    }

    return vals;
  }

  // ── reset() ───────────────────────────────────────────────────────────────
  function reset() {
    for (var i = 0; i < n; i++) {
      var sl = document.getElementById(prefix + i);
      var vl = document.getElementById(prefix + i + '_v');
      if (sl) { sl.value = 0; sl.disabled = false; }
      if (vl) vl.textContent = '0%';
    }
    var totalEl = document.getElementById(totalElId);
    if (totalEl) {
      totalEl.textContent = '0%';
      totalEl.style.color = 'var(--lime)';
    }
  }

  // ── getValues() ───────────────────────────────────────────────────────────
  function getValues() {
    var vals = [];
    for (var i = 0; i < n; i++) {
      var el = document.getElementById(prefix + i);
      vals.push(el ? parseInt(el.value) || 0 : 0);
    }
    return vals;
  }

  // ── setValues(arr) ────────────────────────────────────────────────────────
  // Define valores externos e recalcula (sem clamp)
  function setValues(arr) {
    for (var i = 0; i < n; i++) {
      var sl = document.getElementById(prefix + i);
      if (sl) { sl.value = arr[i] || 0; sl.disabled = false; }
    }
    update(-1);
  }

  return { update: update, reset: reset, getValues: getValues, setValues: setValues };
}

// ── CHANGELOG ────────────────────────────────────────────────────────────────
// v6.7.0 — Bug M: módulo criado. Substitui initPdSliders()/updatePdAllocTotal()/
//           resetPdSliders() e initSliders()/updateSliders()/resetSliders() em init.js.
//           Comportamento idêntico para ambos os prefixos (pd_sl_* e asl_*):
//           clamp 100%, trava sliders zerados, total com cor dinâmica.
