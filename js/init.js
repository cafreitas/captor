/**
 * CAPTOR — Inicialização e Funções Gerais (init.js)
 * Carregado DEPOIS de: globals.js, auth.js, prospects.js, validation.js, utils.js, generators.js
 * 
 * Contém: ~100 funções para UI, autocomplete, sliders, modais, dashboard, helpers gerais
 * Depende de: AppState, sb, supabaseUserId, ALLOC_CATS, ASS_LIST, PROF_LIST, TERMS_CONTENT
 */

// ── AUTOCOMPLETE ASSESSORIA ──
var ASS_LIST = [
  {g:'Sem assessoria',        items:['Não possui assessoria','Investe sozinho / direto']},
  {g:'Bancos',                items:['Gerente de banco (Itaú)','Gerente de banco (Bradesco)','Gerente de banco (Santander)','Gerente de banco (Caixa)','Gerente de banco (BB)','Gerente de banco (Nubank)']},
  {g:'Plataformas e corretoras', items:['XP Investimentos','BTG Pactual','Rico','Clear','Genial','Modal','Órama','Guide','Ágora','Toro','Easynvest / Nuinvest','Inter Invest','C6 Bank Invest','Avenue','Nomad','Mirae Asset']},
  {g:'Outros escritórios XP', items:['Outro escritório XP']},
  {g:'Gestoras e family offices', items:['Family Office próprio','Gestora independente','Multi Family Office']},
  {g:'Outros',                items:['Assessor autônomo (AAI)','Outro']}
];

var acAssIdx = -1;
var acAssVisible = [];

function acAssFilter(){
  var q = acNorm(document.getElementById('fAss').value.trim());
  var drop = document.getElementById('acAssDrop');
  acAssIdx = -1; acAssVisible = [];
  var html = '';
  ASS_LIST.forEach(function(group){
    var matched = q ? group.items.filter(function(item){ return acNorm(item).indexOf(q) >= 0; }) : group.items;
    if(!matched.length) return;
    html += '<div class="ac-group">'+group.g+'</div>';
    matched.forEach(function(item){
      acAssVisible.push(item);
      var display = q ? item.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')', 'gi'), '<mark>$1</mark>') : item;
      html += '<div class="ac-item" onmousedown="acAssSelect(\''+item.replace(/'/g,"\\'")+'\')" >'+display+'</div>';
    });
  });
  drop.innerHTML = html || (q ? '<div class="ac-item" style="color:var(--muted);cursor:default">Nenhuma sugestão — será salvo como digitado</div>' : '');
  drop.classList.toggle('open', true);
}
function acAssSelect(val){ document.getElementById('fAss').value=val; acAssHide(); }
function acAssHide(){ document.getElementById('acAssDrop').classList.remove('open'); acAssIdx=-1; }
function acAssKey(e){
  var items=document.getElementById('acAssDrop').querySelectorAll('.ac-item');
  if(e.key==='ArrowDown'){e.preventDefault();acAssIdx=Math.min(acAssIdx+1,items.length-1);acAssHighlight(items);}
  else if(e.key==='ArrowUp'){e.preventDefault();acAssIdx=Math.max(acAssIdx-1,0);acAssHighlight(items);}
  else if(e.key==='Enter'&&acAssIdx>=0){e.preventDefault();if(acAssVisible[acAssIdx])acAssSelect(acAssVisible[acAssIdx]);}
  else if(e.key==='Escape'){acAssHide();}
}
function acAssHighlight(items){
  items.forEach(function(el,i){el.classList.toggle('sel',i===acAssIdx);});
  if(acAssIdx>=0&&items[acAssIdx])items[acAssIdx].scrollIntoView({block:'nearest'});
}

// ── AUTOCOMPLETE PROFISSÃO ──
var PROF_LIST = [
  // Saúde
  {g:'Saúde',items:['Médico','Médico Clínico Geral','Médico Especialista','Médico Cirurgião','Médico Cardiologista','Médico Ortopedista','Médico Dermatologista','Médico Oftalmologista','Médico Pediatra','Médico Ginecologista','Médico Neurologista','Médico Psiquiatra','Médico Oncologista','Médico Radiologista','Médico Anestesista','Dentista','Ortodontista','Implantodontista','Veterinário','Farmacêutico','Fisioterapeuta','Psicólogo','Psicanalista','Nutricionista','Enfermeiro','Enfermeiro UTI','Fonoaudiólogo','Terapeuta Ocupacional','Biomédico','Biólogo','Médico do Trabalho','Médico Infectologista']},
  // Direito
  {g:'Direito',items:['Advogado','Advogado Sócio','Advogado Tributarista','Advogado Trabalhista','Advogado Empresarial','Advogado Criminalista','Juiz','Desembargador','Ministro','Promotor de Justiça','Defensor Público','Delegado de Polícia','Tabelião / Notário','Registrador']},
  // Finanças e Mercado
  {g:'Finanças e Mercado',items:['Contador','Auditor','Economista','Atuário','Consultor Financeiro','Gestor de Fundos','Analista de Investimentos','Analista Financeiro','Trader','Banqueiro','Gerente de Banco','Planejador Financeiro','Agente Autônomo de Investimentos','Controller','Tesoureiro','CFO / Diretor Financeiro','Assessor de Investimentos']},
  // Engenharia
  {g:'Engenharia',items:['Engenheiro Civil','Engenheiro Mecânico','Engenheiro Elétrico','Engenheiro Eletrônico','Engenheiro Químico','Engenheiro de Produção','Engenheiro Ambiental','Engenheiro Aeronáutico','Engenheiro de Petróleo','Engenheiro de Minas','Engenheiro Naval','Engenheiro Agrônomo','Arquiteto','Urbanista','Geólogo']},
  // Tecnologia
  {g:'Tecnologia',items:['Desenvolvedor de Software','Engenheiro de Software','CTO / CIO','Cientista de Dados','Analista de Dados','Arquiteto de Sistemas','DevOps / SRE','Especialista em Segurança Digital','Product Manager','UX Designer','Fundador de Startup','Empreendedor Digital']},
  // Empresários e Executivos
  {g:'Empresários e Executivos',items:['Empresário','Sócio-Fundador','CEO / Presidente','COO / Diretor de Operações','CMO / Diretor de Marketing','Diretor Comercial','Diretor de RH','Diretor Jurídico','Gerente Geral','Gerente Comercial','Sócio de Escritório','Franqueado','Empreendedor Serial']},
  // Setor Público
  {g:'Setor Público',items:['Servidor Público Federal','Servidor Público Estadual','Servidor Público Municipal','Militar / Oficial das Forças Armadas','Policial Federal','Policial Civil','Policial Militar','Bombeiro','Diplomata','Político','Vereador','Deputado Estadual','Deputado Federal','Senador','Prefeito','Governador']},
  // Agronegócio
  {g:'Agronegócio',items:['Produtor Rural','Fazendeiro','Pecuarista','Agrônomo','Engenheiro Agrônomo','Produtor de Grãos','Produtor de Cana','Cafeicultor','Exportador de Commodities','Gestor Agroindustrial']},
  // Educação
  {g:'Educação',items:['Professor Universitário','Professor de Ensino Médio','Pesquisador','Reitor','Diretor de Escola','Coordenador Pedagógico','Consultor Educacional']},
  // Mercado Imobiliário
  {g:'Mercado Imobiliário',items:['Incorporador Imobiliário','Corretor de Imóveis','Construtor','Empreiteiro','Loteador','Gestor de FII']},
  // Comércio e Indústria
  {g:'Comércio e Indústria',items:['Industrial','Dono de Fábrica','Importador / Exportador','Atacadista','Varejista','Distribuidor','Comerciante']},
  // Mídia e Entretenimento
  {g:'Mídia e Entretenimento',items:['Atleta Profissional','Jogador de Futebol','Piloto de Corrida','Artista','Músico','Ator','Apresentador','Jornalista','Influenciador Digital','Produtor de Conteúdo','Publicitário','Designer Gráfico']},
  // Investidores
  {g:'Investidores e Rentistas',items:['Investidor Profissional','Investidor Anjo','Rentista / Vive de Renda','Family Office','Gestor de Patrimônio','Herdeiro / Sucessão Patrimonial']},
  // Outros
  {g:'Outros',items:['Aposentado','Profissional Liberal','Autônomo','Consultor','Coach / Mentor','Piloto Comercial','Capitão de Navio','Outro']}
];

var acIdx = -1;
var acVisible = [];

function acNorm(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

function acFilter(){
  var q = acNorm(document.getElementById('fProf').value.trim());
  var drop = document.getElementById('acDrop');
  acIdx = -1; acVisible = [];
  var html = '';

  PROF_LIST.forEach(function(group){
    var matched = q ? group.items.filter(function(item){ return acNorm(item).indexOf(q) >= 0; }) : group.items;
    if(!matched.length) return;
    html += '<div class="ac-group">'+group.g+'</div>';
    matched.forEach(function(item){
      acVisible.push(item);
      var display = q ? item.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')', 'gi'), '<mark>$1</mark>') : item;
      html += '<div class="ac-item" onmousedown="acSelect(\''+item.replace(/'/g,"\\'")+'\')" >'+display+'</div>';
    });
  });

  drop.innerHTML = html || (q ? '<div class="ac-item" style="color:var(--muted);cursor:default">Nenhuma sugestão — será salvo como digitado</div>' : '');
  drop.classList.toggle('open', true);
}

function acSelect(val){
  document.getElementById('fProf').value = val;
  acHide();
  onFieldChange();
}

function acHide(){
  document.getElementById('acDrop').classList.remove('open');
  acIdx = -1;
}

function acKey(e){
  var items = document.getElementById('acDrop').querySelectorAll('.ac-item');
  if(e.key === 'ArrowDown'){ e.preventDefault(); acIdx = Math.min(acIdx+1, items.length-1); acHighlight(items); }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); acIdx = Math.max(acIdx-1, 0); acHighlight(items); }
  else if(e.key === 'Enter' && acIdx >= 0){ e.preventDefault(); if(acVisible[acIdx]) acSelect(acVisible[acIdx]); }
  else if(e.key === 'Escape'){ acHide(); }
}

function acHighlight(items){
  items.forEach(function(el,i){ el.classList.toggle('sel', i===acIdx); });
  if(acIdx >= 0 && items[acIdx]) items[acIdx].scrollIntoView({block:'nearest'});
}

// ── TERMOS LEGAIS ──
var TERMS_CONTENT = {
  terms: {
    title: 'Termos de Uso',
    body: '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">1. Aceitação dos Termos</h3>'
      +'<p style="margin-bottom:12px">Ao criar uma conta e utilizar a plataforma Captor, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">2. Descrição do Serviço</h3>'
      +'<p style="margin-bottom:12px">O Captor é uma plataforma de apoio à pré-venda para assessores de investimentos. As recomendações geradas são de caráter informativo e não constituem recomendação de investimento individualizada nos termos da Resolução CVM nº 20/2021.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">3. Uso Permitido</h3>'
      +'<p style="margin-bottom:12px">A plataforma é de uso exclusivo para profissionais de assessoria de investimentos. É vedado o uso para fins ilícitos, a reprodução não autorizada do conteúdo gerado ou o compartilhamento de credenciais de acesso.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">4. Créditos e Pagamentos</h3>'
      +'<p style="margin-bottom:12px">O uso das funcionalidades de IA consome créditos. Créditos adquiridos não são reembolsáveis. Créditos de boas-vindas são concedidos gratuitamente e não possuem valor monetário.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">5. Responsabilidade</h3>'
      +'<p style="margin-bottom:12px">O Captor não se responsabiliza por decisões de investimento tomadas com base no conteúdo gerado pela plataforma. O assessor é integralmente responsável pelas orientações prestadas aos seus clientes.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">6. Modificações</h3>'
      +'<p>Estes termos podem ser atualizados a qualquer momento. O uso continuado da plataforma após mudanças implica aceitação dos novos termos.</p>'
  },
  privacy: {
    title: 'Política de Privacidade',
    body: '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">1. Dados Coletados</h3>'
      +'<p style="margin-bottom:12px">Coletamos: email e senha para autenticação, dados de uso da plataforma (gerações, créditos consumidos), e dados de prospects inseridos pelo assessor para fins de geração de recomendações.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">2. Uso dos Dados</h3>'
      +'<p style="margin-bottom:12px">Os dados são utilizados exclusivamente para: prestação do serviço, melhoria da plataforma, e comunicações relacionadas à conta. Não vendemos dados a terceiros.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">3. Dados de Prospects</h3>'
      +'<p style="margin-bottom:12px">Dados de clientes inseridos na plataforma são de responsabilidade do assessor. Recomendamos não inserir dados sensíveis além do necessário para a geração de recomendações.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">4. Armazenamento</h3>'
      +'<p style="margin-bottom:12px">Dados são armazenados em servidores seguros via Supabase (infraestrutura AWS). Propostas expiram automaticamente após 30 dias.</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">5. Seus Direitos</h3>'
      +'<p style="margin-bottom:12px">Você pode solicitar a exclusão da sua conta e dados a qualquer momento pelo email de suporte. Atendemos às exigências da LGPD (Lei nº 13.709/2018).</p>'
      +'<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">6. Cookies</h3>'
      +'<p>Utilizamos cookies estritamente necessários para autenticação. Não utilizamos cookies de rastreamento ou publicidade.</p>'
  }
};

function openTermsModal(type){
  var c = TERMS_CONTENT[type];
  if(!c) return;
  document.getElementById('termsModalTitle').textContent = c.title;
  document.getElementById('termsModalBody').innerHTML = c.body;
  document.getElementById('termsModal').style.display = 'flex';
}

function closeTermsModal(){
  document.getElementById('termsModal').style.display = 'none';
}

function updateSliders(changed){
  var total = 0;
  ALLOC_CATS.forEach(function(_, i){
    total += parseInt(document.getElementById('asl_'+i).value);
  });

  // Se passou de 100, reduz o slider que acabou de mudar
  if(total > 100){
    var over = total - 100;
    var el = document.getElementById('asl_'+changed);
    el.value = Math.max(0, parseInt(el.value) - over);
    total = 100;
  }

  var remaining = 100 - total;

  // Atualiza valores e trava sliders que não têm espaço
  ALLOC_CATS.forEach(function(_, i){
    var val = parseInt(document.getElementById('asl_'+i).value);
    document.getElementById('asv_'+i).textContent = val + '%';
    var slider = document.getElementById('asl_'+i);
    // Trava se remaining = 0 e este slider está em 0
    slider.disabled = (remaining === 0 && val === 0);
  });

  // Atualiza total
  var totalEl = document.getElementById('allocTotal');
  totalEl.textContent = total + '%';
  totalEl.style.color = total === 100 ? '#a8c23a' : total > 90 ? '#e0b840' : '#a8c23a';
}

function resetSliders(){
  ALLOC_CATS.forEach(function(_, i){
    document.getElementById('asl_'+i).value = 0;
    document.getElementById('asl_'+i).disabled = false;
  });
  document.getElementById('allocTotal').textContent = '0%';
}

function getSliderAlloc(){
  var result={};
  var total=0;
  // Em v5.10, usa sliders da detail view quando está visível
  var pdVisible=document.getElementById('prospectDetailView')&&document.getElementById('prospectDetailView').style.display!=='none';
  var prefix=pdVisible?'pd_sl_':'asl_';
  ALLOC_CATS.forEach(function(cat,i){
    var el=document.getElementById(prefix+i);
    var val=el?parseInt(el.value)||0:0;
    result[cat]=val;
    total+=val;
  });
  return total>0?result:null;
}

// ── STATE ──
var PROXY_URL='https://fllkczocfcbrfsyhxelg.supabase.co/functions/v1/anthropic-proxy';
var SUPABASE_URL='https://fllkczocfcbrfsyhxelg.supabase.co';
var SUPABASE_KEY='sb_publishable_U2pVXIhyNH3s085cUjAmrA_PkeNP4P7';
var sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
var CAPTOR_VERSION='v6.0.6';

var hist=JSON.parse(localStorage.getItem('captor_hist')||'[]');

// ── AUTH HELPERS (moved to js/auth.js) ──

// ── CRÉDITOS ──
var userCredits = null;
var CREDIT_COSTS = {geracao: 0.4, regeneracao: 0.4, extracao_pdf: 0.2};

async function loadCredits(){
  if(!supabaseUserId) return;
  var {data} = await sb.from('user_credits').select('*').eq('user_id', supabaseUserId).maybeSingle();
  if(!data){
    // Usuário sem registro — cria com 10 créditos de boas-vindas
    await sb.from('user_credits').insert({user_id: supabaseUserId, saldo: 10.0, total_ganho: 10.0, total_usado: 0.0});
    await sb.from('credit_logs').insert({user_id: supabaseUserId, acao: 'bonus_cadastro', consumo: 10.0, saldo_apos: 10.0});
    var {data: newData} = await sb.from('user_credits').select('*').eq('user_id', supabaseUserId).maybeSingle();
    data = newData;
  }
  if(data){
    userCredits = data;
    renderEnergyBar(data.saldo);
  }
}

function renderEnergyBar(saldo){
  var max = 10;
  var pct = Math.min(100, Math.max(0, (saldo / max) * 100));
  var color, state;
  if(pct > 50){ color = '#a8c23a'; state = 'ok'; }
  else if(pct > 20){ color = '#e0b840'; state = 'mid'; }
  else { color = '#e05555'; state = 'low'; }

  var fill  = document.getElementById('energyFill');
  var fillM = document.getElementById('energyFillModal');
  var label = document.getElementById('energyLabel');
  var wrap  = document.getElementById('energyWrap');

  // Barra principal
  if(fill){ fill.style.width = pct+'%'; fill.style.background = color; }
  // Número ao lado da barra
  var num = document.getElementById('energyNum');
  if(num){
    num.textContent = saldo <= 0 ? '' : saldo.toFixed(1);
    num.style.color = color;
  }

  // Texto dentro da barra — só quantidade
  if(label){
    if(pct <= 0){
      label.textContent = 'Sem créditos';
      label.style.color = '#fff';
      label.style.mixBlendMode = 'normal';
    } else {
      label.textContent = saldo.toFixed(1);
      label.style.mixBlendMode = 'difference';
      label.style.color = '#fff';
    }
  }

  // Borda colorida no wrap
  if(wrap){
    wrap.classList.remove('energy-state-ok','energy-state-mid','energy-state-low');
    wrap.classList.add('energy-state-'+state);
    wrap.classList.toggle('energy-low', saldo <= 1 && saldo > 0);
  }

  // Banner zero no gerador
  var existing = document.getElementById('zeroCredsBanner');
  if(saldo <= 0){
    if(!existing){
      var banner = document.createElement('div');
      banner.id = 'zeroCredsBanner';
      banner.className = 'zero-credits-banner fadein';
      banner.innerHTML = '⚡ Seus créditos acabaram. Recarregue para continuar gerando recomendações.'
        +'<button onclick="openCreditsModal()" style="background:var(--lime);color:#1a1a1a;border:none;border-radius:6px;padding:5px 12px;font-size:.72rem;font-weight:700;cursor:pointer;white-space:nowrap">Ver créditos</button>';
      var outArea = document.getElementById('outArea');
      if(outArea && outArea.parentNode) outArea.parentNode.insertBefore(banner, outArea);
    }
    document.getElementById('btnGen').disabled = true;
  } else {
    if(existing) existing.remove();
    document.getElementById('btnGen').disabled = false;
  }

  // Modal
  var bigNum = document.getElementById('creditsBigNum');
  var usedLabel = document.getElementById('creditsUsedLabel');
  if(bigNum) bigNum.textContent = saldo.toFixed(1);
  if(usedLabel && userCredits) usedLabel.textContent = userCredits.total_usado.toFixed(1) + ' usados · ' + userCredits.total_ganho.toFixed(1) + ' ganhos';
}

async function debitCredit(acao, clienteNome){
  var custo = CREDIT_COSTS[acao] || 0.4;
  if(!userCredits || userCredits.saldo < custo){
    openCreditsModal();
    throw new Error('Créditos insuficientes. Recarregue para continuar.');
  }
  var novoSaldo = Math.round((userCredits.saldo - custo) * 100) / 100;
  // Atualiza Supabase
  await sb.from('user_credits').update({
    saldo: novoSaldo,
    total_usado: Math.round((userCredits.total_usado + custo) * 100) / 100
  }).eq('user_id', supabaseUserId);
  // Grava log
  var acaoLabels = {geracao:'Geração', regeneracao:'Regeneração', extracao_pdf:'Extração PDF/PPTX'};
  await sb.from('credit_logs').insert({
    user_id: supabaseUserId,
    acao: acao,
    cliente: clienteNome || null,
    consumo: -custo,
    saldo_apos: novoSaldo
  });
  userCredits.saldo = novoSaldo;
  userCredits.total_usado = Math.round((userCredits.total_usado + custo) * 100) / 100;
  renderEnergyBar(novoSaldo);
}

async function openCreditsModal(){
  document.getElementById('creditsModal').style.display = 'flex';
  if(userCredits) renderEnergyBar(userCredits.saldo);
  // Carrega log
  var {data} = await sb.from('credit_logs')
    .select('*').eq('user_id', supabaseUserId)
    .order('created_at', {ascending: false}).limit(30);
  var acaoLabels = {geracao:'Geração',regeneracao:'Regeneração',extracao_pdf:'Extração PDF',bonus_cadastro:'Bônus cadastro',compra:'Compra',compra_pix:'Compra Pix'};
  var tb = document.getElementById('creditsLogBody');
  if(!data || !data.length){
    tb.innerHTML = '<tr><td colspan="5" style="color:var(--dim);text-align:center;padding:16px">Nenhuma transação ainda.</td></tr>';
    return;
  }
  tb.innerHTML = data.map(function(l){
    var dateFmt = new Date(l.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    var isPositive = l.consumo > 0;
    return '<tr>'
      +'<td style="color:var(--muted);font-size:.7rem">'+dateFmt+'</td>'
      +'<td>'+(acaoLabels[l.acao]||l.acao)+'</td>'
      +'<td style="color:var(--muted)">'+(l.cliente||'—')+'</td>'
      +'<td style="text-align:right;font-weight:700;color:'+(isPositive?'var(--lime)':'#f08080')+'">'+(isPositive?'+':'')+l.consumo.toFixed(1)+'</td>'
      +'<td style="text-align:right;color:var(--muted)">'+l.saldo_apos.toFixed(1)+'</td>'
      +'</tr>';
  }).join('');
}

function closeCreditsModal(){
  document.getElementById('creditsModal').style.display = 'none';
}



// ── PERFIL DA EMPRESA ──
var empresaData = null;
var empresaStep = 0;
var uploadedFile = null;
var extractedColors = [];

var ALLOC_PERFIS = ['Conservador','Moderado','Arrojado','Agressivo'];
var ALLOC_DEFAULT = {
  Conservador: [[62,77],[7,17],[2,7],[2,7],[0,5],[0,5],[0,0],[0,5],[0,7]],
  Moderado:    [[25,40],[17,27],[7,12],[14,19],[2,12],[0,4],[0,10],[0,5],[0,8]],
  Arrojado:    [[5,20],[22,32],[5,10],[10,15],[12,22],[5,10],[0,14],[0,5],[0,10]],
  Agressivo:   [[5,20],[22,32],[5,10],[10,15],[12,22],[5,10],[0,14],[0,5],[0,10]]
};

// ── FILE UPLOAD ──
function handleDragOver(e){e.preventDefault();document.getElementById('uploadZone').classList.add('drag');}
function handleDragLeave(e){document.getElementById('uploadZone').classList.remove('drag');}
function handleDrop(e){
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag');
  var files=e.dataTransfer.files;
  if(files.length)processFile(files[0]);
}
function handleFileSelect(e){if(e.target.files.length)processFile(e.target.files[0]);}

function processFile(file){
  var ext=file.name.split('.').pop().toLowerCase();
  if(ext!=='pdf'&&ext!=='pptx'){showToast('Use um arquivo PDF ou PPTX.','error');return;}
  if(file.size>20*1024*1024){showToast('Arquivo muito grande. Máximo 20MB.','error');return;}
  uploadedFile=file;
  var icon=ext==='pdf'?'📄':'📊';
  var sizeMB=(file.size/1024/1024).toFixed(1);
  document.getElementById('fileInfo').style.display='block';
  document.getElementById('fileInfo').innerHTML='<div class="upload-file-info">'
    +'<span class="upload-file-icon">'+icon+'</span>'
    +'<span class="upload-file-name">'+file.name+'</span>'
    +'<span class="upload-file-size">'+sizeMB+' MB</span>'
    +'<button class="upload-file-remove" onclick="removeFile()" title="Remover">✕</button>'
    +'</div>';
  document.getElementById('extractBtn').style.display='flex';
  document.getElementById('extractResult').style.display='none';
}

function removeFile(){
  uploadedFile=null;
  document.getElementById('fileInfo').style.display='none';
  document.getElementById('extractBtn').style.display='none';
  document.getElementById('extractResult').style.display='none';
  document.getElementById('fileInput').value='';
}

// ── STEP 0 TABS ──
function step0Tab(tab){
  var isUpload=tab==='upload';
  document.getElementById('panel0Upload').style.display=isUpload?'':'none';
  document.getElementById('panel0Site').style.display=isUpload?'none':'';
  document.getElementById('tab0Upload').style.background=isUpload?'var(--lime)':'var(--bg3)';
  document.getElementById('tab0Upload').style.color=isUpload?'#1a1a1a':'var(--muted)';
  document.getElementById('tab0Site').style.background=isUpload?'var(--bg3)':'var(--lime)';
  document.getElementById('tab0Site').style.color=isUpload?'var(--muted)':'#1a1a1a';
}

// ── EXTRACT FROM SITE ──
async function extractFromSite(){
  var url=document.getElementById('siteUrl').value.trim();
  if(!url){showToast('Informe a URL do site.','error');return;}
  if(!/^https?:\/\//i.test(url)){url='https://'+url;document.getElementById('siteUrl').value=url;}
  var btn=document.getElementById('siteExtractBtn');
  var res=document.getElementById('siteExtractResult');
  btn.disabled=true;
  btn.innerHTML='<span style="opacity:.7">Acessando site...</span>';
  res.style.display='none';
  try{
    // 1. Fetch HTML via Edge Function
    var scrapeResp=await fetch(SUPABASE_URL+'/functions/v1/scrape-site',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+SUPABASE_KEY},
      body:JSON.stringify({url:url})
    });
    var scrapeData=await scrapeResp.json();
    if(!scrapeResp.ok||scrapeData.error)throw new Error(scrapeData.error||'Site fora do ar. Tente novamente mais tarde.');
    var html=scrapeData.text;
    if(!html||html.trim().length<100)throw new Error('Não foi possível extrair informações deste site. Use o upload de PDF ou preencha manualmente.');

    // 2. Extract via AI
    btn.innerHTML='<span style="opacity:.7">Analisando com IA...</span>';
    var aiResp=await fetch(PROXY_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1400,
        messages:[{
          role:'user',
          content:'Você é um assistente especializado em extrair informações institucionais de sites de empresas de assessoria de investimentos.\n\nAnalise o conteúdo abaixo extraído do site '+url+' e extraia todas as informações disponíveis.\n\nCONTEÚDO DO SITE:\n'+html.substring(0,10000)+'\n\nResponda SOMENTE com JSON válido, sem markdown:\n{"empresa_nome":"","empresa_credenciadora":"","empresa_segmento":"","empresa_anos":"","empresa_aum":"","empresa_clientes":"","empresa_diferenciais":"","empresa_premios":"","assessores_numero":"","assessores_certificacoes":"","redes_sociais":{"linkedin":"","instagram":""},"produtos_investimento":"","produtos_servicos":"","produtos_premium":"","expertise":"","brand_color_hex":""}\n\nRegras:\n- empresa_aum: patrimônio sob custódia (ex: "R$ 12 bilhões")\n- empresa_anos: tempo de mercado (ex: "8 anos")\n- brand_color_hex: cor destaque principal da marca em hex se identificável no texto\n- assessores_numero: número de assessores ou profissionais da equipe\n- assessores_certificacoes: certificações mencionadas (ex: "CEA, CFP, CGA")\n- redes_sociais: URLs de LinkedIn e Instagram se mencionadas\n- produtos_investimento: produtos de investimento mencionados\n- produtos_servicos: outros serviços (câmbio, crédito, seguros etc)\n- produtos_premium: produtos exclusivos (Family Office, Offshore, Wealth Planning, M&A etc)\n- empresa_diferenciais: principais diferenciais em 2-4 frases\n- Deixe "" nos campos não encontrados'
        }]
      })
    });
    if(!aiResp.ok)throw new Error('Erro na API de IA: '+aiResp.status);
    var aiData=await aiResp.json();
    var rawText=aiData.content&&aiData.content[0]&&aiData.content[0].text?aiData.content[0].text:'';
    var clean=rawText.replace(/```json|```/g,'').trim();
    var extracted=JSON.parse(clean);

    // 3. Fill form fields
    var f=function(id,val){var el=document.getElementById(id);if(el&&val)el.value=val;};
    f('eNome',extracted.empresa_nome);
    f('eCred',extracted.empresa_credenciadora);
    f('eSeg',extracted.empresa_segmento);
    f('eAnos',extracted.empresa_anos);
    if(extracted.empresa_aum){var aumEl=document.getElementById('eAum');if(aumEl)aumEl.value=extracted.empresa_aum;}
    f('eClientes',extracted.empresa_clientes);
    f('eDiferenciais',extracted.empresa_diferenciais);
    f('ePremios',extracted.empresa_premios);
    f('eAssessoresNum',extracted.assessores_numero);
    f('eAssessoresCert',extracted.assessores_certificacoes);
    if(extracted.redes_sociais){f('eLinkedin',extracted.redes_sociais.linkedin);f('eInstagram',extracted.redes_sociais.instagram);}
    f('eProdInvest',extracted.produtos_investimento);
    f('eProdServ',extracted.produtos_servicos);
    f('eProdPremium',extracted.produtos_premium);
    f('eExpertise',extracted.expertise);
    if(extracted.brand_color_hex&&extracted.brand_color_hex.match(/^#[0-9a-fA-F]{6}$/)){
      extractedColors=[extracted.brand_color_hex];
    }
    var fieldsFound=Object.keys(extracted).filter(function(k){return k!=='brand_color_hex'&&k!=='redes_sociais'&&extracted[k]&&extracted[k].trim&&extracted[k].trim();});
    res.style.display='block';
    res.innerHTML='<div class="extract-result"><div class="extract-ok">✓ '+fieldsFound.length+' campos extraídos. Revise e complete o que faltar.</div></div>';
    btn.disabled=false;
    btn.innerHTML='Confirmar e revisar campos →';
    btn.onclick=function(){empresaGoToStep(1);};
  }catch(e){
    res.style.display='block';
    res.innerHTML='<div class="extract-result"><div style="color:#f08080;font-size:.78rem">Erro: '+e.message+'</div></div>';
    btn.disabled=false;
    btn.innerHTML='<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10.25 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/></svg> Extrair dados com IA';
    btn.onclick=extractFromSite;
  }
}

// ── FILE TO BASE64 ──
async function fileToBase64(file){
  return new Promise(function(resolve){
    var reader=new FileReader();
    reader.onload=function(e){resolve(e.target.result.split(',')[1]);};
    reader.readAsDataURL(file);
  });
}

// ── EXTRACT TEXT FROM PPTX (XML parsing) ──
async function extractTextFromPPTX(file){
  return new Promise(function(resolve){
    var reader=new FileReader();
    reader.onload=function(e){
      try{
        var bytes=new Uint8Array(e.target.result);
        var raw='';
        for(var i=0;i<bytes.length;i++){
          var c=bytes[i];
          if(c>=32&&c<127)raw+=String.fromCharCode(c);
          else raw+=' ';
        }
        var matches=raw.match(/<a:t[^>]*>([^<]{2,})<\/a:t>/g)||[];
        var text=matches.map(function(m){return m.replace(/<[^>]+>/g,'').trim();})
                        .filter(function(s){return s.length>1;})
                        .join('\n');
        if(text.length<100)text=raw.replace(/[^\x20-\x7E]/g,' ').replace(/\s{3,}/g,' ');
        resolve(text.substring(0,8000));
      }catch(err){resolve('');}
    };
    reader.readAsArrayBuffer(file);
  });
}

// ── MAIN EXTRACTION ──
async function extractFromFile(){
  if(!uploadedFile)return;
  var btn=document.getElementById('extractBtn');
  btn.disabled=true;btn.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:6px"></div>Analisando com IA...';

  // Debitar crédito
  try{ await debitCredit('extracao_pdf', null); }
  catch(e){ alert(e.message); btn.disabled=false; btn.innerHTML='Analisar com IA'; return; }

  try{
    var ext=uploadedFile.name.split('.').pop().toLowerCase();
    var requestBody;

    if(ext==='pdf'){
      // Send PDF directly as document to Claude vision
      var b64=await fileToBase64(uploadedFile);
      requestBody={
        model:'claude-sonnet-4-20250514',
        max_tokens:1400,
        messages:[{
          role:'user',
          content:[
            {type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}},
            {type:'text',text:'Você é um assistente especializado em extrair informações institucionais de apresentações corporativas.\n\nAnalise esta apresentação institucional de uma empresa de assessoria de investimentos e extraia todas as informações disponíveis.\n\nResponda SOMENTE com JSON válido, sem markdown, sem texto antes ou depois:\n{"empresa_nome":"","empresa_credenciadora":"","empresa_segmento":"","empresa_anos":"","empresa_aum":"","empresa_clientes":"","empresa_diferenciais":"","empresa_premios":"","produtos_investimento":"","produtos_servicos":"","produtos_premium":"","expertise":"","brand_color_hex":""}\n\nRegras:\n- empresa_aum: patrimônio sob custódia (ex: "R$ 12 bilhões")\n- empresa_anos: tempo de mercado (ex: "8 anos")\n- brand_color_hex: cor destaque principal da marca em hex (ex: "#8cb800")\n- produtos_investimento: produtos de investimento mencionados\n- produtos_servicos: outros serviços (câmbio, crédito, seguros etc)\n- produtos_premium: produtos exclusivos (Family Office, Offshore, Wealth Planning, M&A etc)\n- empresa_diferenciais: principais diferenciais em 2-4 frases\n- Deixe "" nos campos não encontrados'}
          ]
        }]
      };
    } else {
      // PPTX: extract text and send as text prompt
      var text=await extractTextFromPPTX(uploadedFile);
      if(!text||text.trim().length<50)throw new Error('Não foi possível extrair texto do PPTX. Verifique se o arquivo não está corrompido.');
      requestBody={
        model:'claude-sonnet-4-20250514',
        max_tokens:1400,
        messages:[{
          role:'user',
          content:'Você é um assistente especializado em extrair informações institucionais de apresentações corporativas.\n\nAnalise o conteúdo abaixo extraído de uma apresentação PPTX e extraia as informações disponíveis.\n\nCONTEÚDO:\n'+text.substring(0,6000)+'\n\nResponda SOMENTE com JSON válido, sem markdown:\n{"empresa_nome":"","empresa_credenciadora":"","empresa_segmento":"","empresa_anos":"","empresa_aum":"","empresa_clientes":"","empresa_diferenciais":"","empresa_premios":"","produtos_investimento":"","produtos_servicos":"","produtos_premium":"","expertise":"","brand_color_hex":""}\n\nRegras:\n- empresa_aum: patrimônio sob custódia (ex: "R$ 12 bilhões")\n- empresa_anos: tempo de mercado (ex: "8 anos")\n- brand_color_hex: cor destaque principal da marca em hex se mencionada\n- Deixe "" nos campos não encontrados'
        }]
      };
    }

    var resp=await fetch(PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(requestBody)});
    if(!resp.ok){var err=await resp.json().catch(function(){return{};});throw new Error('API '+resp.status+': '+(err.error&&err.error.message?err.error.message:resp.statusText));}
    var d=await resp.json();
    if(!d || !d.content){ throw new Error('Resposta vazia da IA.'); }
    
    // Log AI usage
    if(d && d.usage){
      await logAiUsage('extrair_empresa',null,'claude-sonnet-4-20250514',d.usage.input_tokens,d.usage.output_tokens,'success');
    }
    
    var raw=d.content.map(function(c){return c.text||'';}).join('');
    var extracted=JSON.parse(raw.replace(/```json|```/g,'').trim());

    // Apply brand color if found
    if(extracted.brand_color_hex&&extracted.brand_color_hex.match(/^#[0-9a-fA-F]{6}$/)){
      extractedColors=[extracted.brand_color_hex];
    }

    // Show extraction result preview
    var fieldsFound=Object.keys(extracted).filter(function(k){return k!=='brand_color_hex'&&extracted[k]&&extracted[k].trim();});
    var previewHtml='<div class="extract-result">'
      +'<div class="extract-result-title">✓ '+fieldsFound.length+' campos identificados</div>';

    var labels={empresa_nome:'Empresa',empresa_credenciadora:'Credenciadora',empresa_segmento:'Segmento',empresa_anos:'Anos no mercado',empresa_aum:'AuM',empresa_clientes:'Nº clientes',empresa_diferenciais:'Diferenciais',empresa_premios:'Prêmios',produtos_investimento:'Produtos',produtos_servicos:'Serviços',produtos_premium:'Premium',expertise:'Expertise'};
    fieldsFound.slice(0,6).forEach(function(k){
      var val=extracted[k];
      if(val.length>80)val=val.substring(0,80)+'…';
      previewHtml+='<div class="extract-item"><span class="extract-item-key">'+labels[k]+'</span><span class="extract-item-val">'+val+'</span></div>';
    });
    if(fieldsFound.length>6)previewHtml+='<div style="font-size:.7rem;color:var(--muted);margin-top:4px">+ '+(fieldsFound.length-6)+' outros campos</div>';

    if(extractedColors.length){
      previewHtml+='<div style="font-size:.7rem;font-weight:700;color:var(--lime);margin-top:10px;text-transform:uppercase;letter-spacing:.08em">Cor da marca identificada</div>';
      previewHtml+='<div class="color-swatches">';
      extractedColors.forEach(function(c){
        previewHtml+='<div class="color-swatch" style="background:'+c+'" title="'+c+'" onclick="toggleBrandColor(\''+c+'\')"></div>';
      });
      previewHtml+='</div><div style="font-size:.67rem;color:var(--dim);margin-top:4px">Clique para aplicar esta cor nos gráficos</div>';
    }
    previewHtml+='</div>';

    document.getElementById('extractResult').innerHTML=previewHtml;
    document.getElementById('extractResult').style.display='block';

    // Pre-fill form fields
    var f=function(id,val){var el=document.getElementById(id);if(el&&val&&val.trim())el.value=val.trim();};
    f('eNome',extracted.empresa_nome);
    f('eCred',extracted.empresa_credenciadora);
    f('eSeg',extracted.empresa_segmento);
    f('eAnos',extracted.empresa_anos);
    if(extracted.empresa_aum){var aumEl=document.getElementById('eAum');if(aumEl)aumEl.value=extracted.empresa_aum;}
    f('eClientes',extracted.empresa_clientes);
    f('eDiferenciais',extracted.empresa_diferenciais);
    f('ePremios',extracted.empresa_premios);
    f('eAssessoresNum',extracted.assessores_numero);
    f('eAssessoresCert',extracted.assessores_certificacoes);
    if(extracted.redes_sociais){f('eLinkedin',extracted.redes_sociais.linkedin);f('eInstagram',extracted.redes_sociais.instagram);}
    f('eProdInvest',extracted.produtos_investimento);
    f('eProdServ',extracted.produtos_servicos);
    f('eProdPremium',extracted.produtos_premium);
    f('eExpertise',extracted.expertise);

    btn.disabled=false;
    btn.innerHTML='Confirmar e revisar campos →';
    btn.onclick=function(){empresaGoToStep(1);};

  }catch(err){
    await logAiUsage('extrair_empresa',null,'claude-sonnet-4-20250514',0,0,'error');
    btn.disabled=false;
    btn.innerHTML='<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10.25 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/></svg> Extrair dados com IA';
    btn.onclick=function(){extractFromFile();};
    document.getElementById('extractResult').innerHTML='<div style="background:rgba(220,50,50,.1);border:1px solid rgba(220,50,50,.25);border-radius:var(--r);padding:10px 12px;font-size:.76rem;color:#f08080;margin-top:12px">⚠ '+err.message+'</div>';
    document.getElementById('extractResult').style.display='block';
  }
}

// ── BRAND COLORS ──
var selectedBrandColors=[];
function toggleBrandColor(hex){
  var idx=selectedBrandColors.indexOf(hex);
  if(idx>=0)selectedBrandColors.splice(idx,1);
  else selectedBrandColors.push(hex);
  // Visual feedback
  document.querySelectorAll('.color-swatch').forEach(function(el){
    var c=el.title;
    el.style.outline=selectedBrandColors.indexOf(c)>=0?'2px solid var(--white)':'none';
    el.style.outlineOffset='2px';
  });
  // Apply to CSS vars if colors selected
  if(selectedBrandColors.length>=1){
    document.documentElement.style.setProperty('--brand1',selectedBrandColors[0]);
  }
  if(selectedBrandColors.length>=2){
    document.documentElement.style.setProperty('--brand2',selectedBrandColors[1]);
  }
}

async function loadEmpresaData(){
  if(!supabaseUserId)return;
  // 1. Tentar perfil próprio
  var {data}=await sb.from('company_profiles').select('*').eq('user_id',supabaseUserId).maybeSingle();
  if(data){
    empresaData=data;
    document.getElementById('bannerPerfil').style.display='none';
    if(data.brand_colors&&data.brand_colors.length){
      selectedBrandColors=data.brand_colors;
      applyBrandColorsToCharts(data.brand_colors);
    }
    return;
  }
  // 2. Sem perfil próprio — buscar perfil da empresa (se for membro)
  if(currentFirmId){
    var {data:firm}=await sb.from('firms').select('owner_user_id').eq('id',currentFirmId).maybeSingle();
    if(firm){
      var {data:firmProfile}=await sb.from('company_profiles').select('*').eq('user_id',firm.owner_user_id).maybeSingle();
      if(firmProfile){
        empresaData=firmProfile;
        document.getElementById('bannerPerfil').style.display='none';
        if(firmProfile.brand_colors&&firmProfile.brand_colors.length){
          selectedBrandColors=firmProfile.brand_colors;
          applyBrandColorsToCharts(firmProfile.brand_colors);
        }
        return;
      }
    }
  }
  // 3. Sem perfil em lugar nenhum — mostrar banner
  document.getElementById('bannerPerfil').style.display='flex';
}

function applyBrandColorsToCharts(colors){
  if(!colors||!colors.length)return;
  // Override donut chart colors with brand palette
  window._brandChartColors=colors;
}

function buildAllocTable(){
  var wrap=document.getElementById('allocTableWrap');
  var html='<table class="alloc-table"><thead><tr><th>Classe de ativo</th>';
  ALLOC_PERFIS.forEach(function(p){html+='<th>'+p+'</th>';});
  html+='</tr></thead><tbody>';
  ALLOC_CATS.forEach(function(cat,i){
    html+='<tr><td style="color:var(--text);font-size:.76rem">'+cat+'</td>';
    ALLOC_PERFIS.forEach(function(p){
      var def=ALLOC_DEFAULT[p][i];
      var val=def[0]+'-'+def[1];
      if(empresaData&&empresaData.regras_alocacao&&empresaData.regras_alocacao[p]&&empresaData.regras_alocacao[p][i]){
        val=empresaData.regras_alocacao[p][i];
      }
      html+='<td><input type="text" value="'+val+'" id="alloc_'+p+'_'+i+'" placeholder="'+val+'"></td>';
    });
    html+='</tr>';
  });
  html+='</tbody></table>';
  wrap.innerHTML=html;
}

function openEmpresaModal(startStep){
  empresaStep=startStep||0;
  uploadedFile=null;
  document.getElementById('fileInfo').style.display='none';
  document.getElementById('extractBtn').style.display='none';
  document.getElementById('extractBtn').innerHTML='<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10.25 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/></svg> Extrair dados com IA';
  document.getElementById('extractBtn').onclick=function(){extractFromFile();};
  document.getElementById('extractResult').style.display='none';
  document.getElementById('fileInput').value='';
  updateEmpresaStep();
  // Pre-fill if already has data
  if(empresaData){
    var f=function(id,val){var el=document.getElementById(id);if(el&&val)el.value=val;};
    f('eNome',empresaData.empresa_nome);
    f('eCred',empresaData.empresa_credenciadora);
    f('eSeg',empresaData.empresa_segmento);
    f('eAnos',empresaData.empresa_anos);
    if(empresaData.empresa_aum){var aumEl=document.getElementById('eAum');if(aumEl){aumEl.value=empresaData.empresa_aum;}}
    f('eClientes',empresaData.empresa_clientes);
    f('eDiferenciais',empresaData.empresa_diferenciais);
    f('ePremios',empresaData.empresa_premios);
    f('eProdInvest',empresaData.produtos_investimento);
    f('eProdServ',empresaData.produtos_servicos);
    f('eProdPremium',empresaData.produtos_premium);
    f('eExpertise',empresaData.expertise);
  }
  if(empresaStep>=3)buildAllocTable();
  document.getElementById('modalEmpresa').style.display='flex';
}

function closeEmpresaModal(){
  document.getElementById('modalEmpresa').style.display='none';
}

var STEP_SUBTITLES={
  0:'Importe sua apresentação para preencher automaticamente',
  1:'Revise os dados da empresa',
  2:'Confirme os produtos e serviços',
  3:'Defina as faixas de alocação por perfil',
  4:'Gerencie sua empresa e assessores'
};

function updateEmpresaStep(){
  var maxStep=currentUserIsManager?4:3;
  var steps=[0,1,2,3,4];
  steps.forEach(function(n){
    var stepEl=document.getElementById('mStep'+n);
    if(stepEl)stepEl.style.display=n===empresaStep?'block':'none';
    var dot=document.getElementById('sdot'+n);
    var lbl=document.getElementById('slbl'+n);
    if(!dot)return;
    dot.className='step-dot'+(n===empresaStep?' active':n<empresaStep?' done':'');
    lbl.className='step-label'+(n===empresaStep?' active':'');
    if(n===0){dot.textContent=n<empresaStep?'✓':'◎';}
    else{dot.textContent=n<empresaStep?'✓':String(n);}
  });
  document.getElementById('mBtnBack').style.display=empresaStep>0?'block':'none';
  document.getElementById('mBtnNext').style.display=empresaStep===0?'none':'block';
  document.getElementById('mBtnNext').textContent=empresaStep===maxStep?'Fechar':'Próximo →';
  document.getElementById('modalSubtitle').textContent=STEP_SUBTITLES[empresaStep]||'';
  // mostrar step da firma só para gestores
  var empresaStepEl=document.getElementById('modalStepEmpresa');
  if(empresaStepEl)empresaStepEl.style.display=currentUserIsManager?'':'none';
}

function empresaGoToStep(n){
  empresaStep=n;
  updateEmpresaStep();
  if(n===4){setTimeout(function(){loadFirmMembers();loadFirmInvites();},50);}
}

function empresaStepBack(){
  if(empresaStep>0){empresaStep--;updateEmpresaStep();}
}

async function empresaStepNext(){
  var maxStep=currentUserIsManager?4:3;
  if(empresaStep===maxStep){
    closeEmpresaModal();
    return;
  }
  if(empresaStep<3){
    empresaStep++;
    updateEmpresaStep();
    if(empresaStep===3)buildAllocTable();
    return;
  }
  if(empresaStep===3){
    // Salvar alocação e avançar para step 4 se gestor, senão fechar
    var btn=document.getElementById('mBtnNext');
    btn.disabled=true;btn.textContent='Salvando...';

  var regras={};
  ALLOC_PERFIS.forEach(function(p){
    regras[p]=ALLOC_CATS.map(function(_,i){
      var el=document.getElementById('alloc_'+p+'_'+i);
      return el?el.value:'';
    });
  });

  var payload={
    user_id:supabaseUserId,
    empresa_nome:document.getElementById('eNome').value.trim(),
    empresa_credenciadora:document.getElementById('eCred').value.trim(),
    empresa_segmento:document.getElementById('eSeg').value.trim(),
    empresa_anos:document.getElementById('eAnos').value.trim(),
    empresa_aum:document.getElementById('eAum').value.trim(),
    empresa_clientes:document.getElementById('eClientes').value.trim(),
    empresa_diferenciais:document.getElementById('eDiferenciais').value.trim(),
    empresa_premios:document.getElementById('ePremios').value.trim(),
    produtos_investimento:document.getElementById('eProdInvest').value.trim(),
    produtos_servicos:document.getElementById('eProdServ').value.trim(),
    produtos_premium:document.getElementById('eProdPremium').value.trim(),
    expertise:document.getElementById('eExpertise').value.trim(),
    regras_alocacao:regras,
    brand_colors:selectedBrandColors,
    updated_at:new Date().toISOString()
  };

  var {error}=await sb.from('company_profiles').upsert(payload,{onConflict:'user_id'});
  if(error){
    showToast('Erro ao salvar: '+error.message,'error');
    btn.disabled=false;btn.textContent='Salvar ✓';
    return;
  }
  empresaData=payload;
  if(selectedBrandColors.length)applyBrandColorsToCharts(selectedBrandColors);
  document.getElementById('bannerPerfil').style.display='none';
  btn.disabled=false;btn.textContent='Salvar ✓';
  if(currentUserIsManager){
    empresaStep=4;
    updateEmpresaStep();
    setTimeout(function(){loadFirmMembers();loadFirmInvites();},50);
  } else {
    closeEmpresaModal();
  }
  } // end if empresaStep===3
}

function buildEmpresaPrompt(){
  if(!empresaData||!empresaData.empresa_nome)return null;
  var e=empresaData;
  var txt='DADOS DA EMPRESA DO ASSESSOR:\n';
  if(e.empresa_nome)txt+='Empresa: '+e.empresa_nome+'\n';
  if(e.empresa_credenciadora)txt+='Credenciadora: '+e.empresa_credenciadora+'\n';
  if(e.empresa_segmento)txt+='Segmento: '+e.empresa_segmento+'\n';
  if(e.empresa_anos)txt+='Tempo de mercado: '+e.empresa_anos+'\n';
  if(e.empresa_aum)txt+='AuM: '+e.empresa_aum+'\n';
  if(e.empresa_clientes)txt+='Clientes: '+e.empresa_clientes+'\n';
  if(e.empresa_diferenciais)txt+='Diferenciais: '+e.empresa_diferenciais+'\n';
  if(e.empresa_premios)txt+='Prêmios: '+e.empresa_premios+'\n';
  if(e.produtos_investimento)txt+='Produtos de investimento: '+e.produtos_investimento+'\n';
  if(e.produtos_servicos)txt+='Serviços: '+e.produtos_servicos+'\n';
  if(e.produtos_premium)txt+='Produtos premium: '+e.produtos_premium+'\n';
  if(e.expertise)txt+='Expertise: '+e.expertise+'\n';
  return txt;
}

function buildAllocPrompt(perfil){
  if(!empresaData||!empresaData.regras_alocacao||!empresaData.regras_alocacao[perfil]){
    // usar defaults
    var def=ALLOC_DEFAULT[perfil]||ALLOC_DEFAULT['Arrojado'];
    return ALLOC_CATS.map(function(l,i){return l+': '+def[i][0]+'% a '+def[i][1]+'%';}).join(', ');
  }
  var regras=empresaData.regras_alocacao[perfil];
  return ALLOC_CATS.map(function(l,i){return l+': '+regras[i];}).join(', ');
}

// ── TABS ──
function showTab(tab,btn){
  document.querySelectorAll('.ntab').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  document.getElementById('genView').style.display='none';
  document.getElementById('prospectDetailView').style.display='none';
  document.getElementById('prospectview').style.display=tab==='prospects'?'block':'none';
  document.getElementById('dashview').style.display=tab==='dash'?'block':'none';
  document.getElementById('teamview').style.display=tab==='team'?'block':'none';
  if(tab==='dash'){updateDash();}
  if(tab==='team'){loadTeamView();}
  if(tab==='prospects'){loadProspects();}
}

// ── SIDEBAR TOGGLE ──
var sidebarVisible = true;

// v5.13.7: collapse/expand agora esconde/mostra o formulário da detail view
var sidebarVisible=true;
function collapseSidebar(){
  var form=document.getElementById('pdFormGrid');
  var actions=document.getElementById('pdActionsBar');
  if(form)form.style.display='none';
  if(actions)actions.style.display='none';
  sidebarVisible=false;
}
function expandSidebar(){
  var form=document.getElementById('pdFormGrid');
  var actions=document.getElementById('pdActionsBar');
  if(form)form.style.display='';
  if(actions)actions.style.display='';
  sidebarVisible=true;
}
function toggleSidebar(){
  if(sidebarVisible){collapseSidebar();}else{expandSidebar();}
}

// ── RENDER OUTPUT ──
function renderOutput(nome,patFmt,data,meta){
  var area=document.getElementById('outArea');
  area.innerHTML='';

  var sdrResumo = (meta.obj ? 'Objetivo: '+meta.obj+'.' : '')
    +(meta.ass && meta.ass !== 'Não possui assessoria' ? ' Assessoria atual: '+meta.ass+'.' : ' Sem assessoria atual.')
    +(meta.gaps ? ' Gaps: '+meta.gaps : '');

  var hdr=document.createElement('div');
  hdr.className='outhead fadein';
  hdr.innerHTML='<div>'
    +'<div class="outtag">Reunião Consultiva</div>'
    +'<div class="outname">'+nome+'</div>'
    +'<div class="outmeta">'+meta.prof+' · '+meta.idade+' anos · '+patFmt+' · Perfil '+meta.perfil+'</div>'
    +'<div class="outsumm" style="font-size:.74rem">'+sdrResumo+'</div>'
    +'</div>'
    +'<button class="printbtn" onclick="prepAndPrint()">🖨 Imprimir</button>';
  area.appendChild(hdr);

  // Roteiro
  var b1=mkBlock('🗺','Roteiro da Reunião',false);
  data.roteiro.forEach(function(r,i){
    b1.body.innerHTML+='<div class="rotitem"><div class="rotnum">'+(i+1)+'</div><div class="rotcont"><strong>'+r.titulo+'</strong><p>'+r.descricao+'</p>'+(r.dica?'<div class="rottip">💡 '+r.dica+'</div>':'')+'<div class="rottime">⏱ '+r.minutos+' min</div></div></div>';
  });
  area.appendChild(b1.el);

  // Argumentos
  var b3=mkBlock('🎯','3 Argumentos Consultivos',false);
  data.argumentos.forEach(function(a,i){
    b3.body.innerHTML+='<div class="argcard"><div class="argtit">'+(i+1)+'. '+a.titulo+'</div><div class="argbody">'+a.corpo+'</div>'+(a.frase_gancho?'<div class="arghook">"'+a.frase_gancho+'"</div>':'')+'</div>';
  });
  area.appendChild(b3.el);

  // Perguntas
  var b2=mkBlock('❓','5 Perguntas de Diagnóstico',false);
  data.perguntas.forEach(function(p,i){
    b2.body.innerHTML+='<div class="pqcard" style="flex-direction:column;gap:6px">'
      +'<div style="display:flex;gap:9px"><div class="pqn" style="flex-shrink:0;margin-top:1px">P'+(i+1)+'</div><div><div class="pqq">"'+p.pergunta+'"</div><div class="pqwhy">→ '+p.motivo+'</div></div></div>'
      +'<textarea class="fta pq-nota" data-idx="'+i+'" placeholder="Anotações sobre a resposta do cliente (opcional)..." style="min-height:44px;font-size:.75rem;margin-top:2px" oninput="checkRegenBtn()"></textarea>'
      +'</div>';
  });
  b2.body.innerHTML+='<div id="regenWrap" style="display:none;margin-top:10px">'
    +'<button class="genbtn" id="btnRegen" onclick="regenerate()" style="background:var(--gold);color:#1a1a1a">'
    +'<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M2 10.5V7h3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +'Regenerar com anotações'
    +'</button>'
    +'</div>';
  area.appendChild(b2.el);

  // Proposta para o cliente — bloco inline editável
  var b4=mkBlock('📋','Proposta para o cliente',false);
  b4.body.innerHTML = buildProposalBlock(data, meta, patFmt);
  area.appendChild(b4.el);

  // Renderiza donut inicial da alocação editável
  if(data.alocacao&&data.alocacao.labels){
    var donutEl = document.getElementById('pi_aloc_donut');
    if(donutEl) renderDonut(donutEl, data.alocacao);
  }

  // Botões de publicação (abaixo do bloco, sem barra separada)
  var pubRow = document.createElement('div');
  pubRow.className = 'proposal-bar fadein';
  pubRow.id = 'proposalBar';
  pubRow.innerHTML = ''
    +'<div class="proposal-bar-info"><strong>Revise e aprove a proposta do cliente antes de publicar.</strong></div>'
    +'<div class="proposal-btns">'
    +'<div style="position:relative;display:inline-block">'
    +'<div class="pub-tip" id="pubTip">👆 Aprove antes</div>'
    +'<button class="pbtn pbtn-publish" id="btnPublish" onclick="publishProposal()" disabled>'
    +'<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13l-3.75 2.75 1.5 4.5L7 10.25 3.25 12.75l1.5-4.5L1 5.5h4.5L7 1z" fill="currentColor"/></svg>'
    +'Publicar Proposta'
    +'</button>'
    +'</div>'
    +'</div>';
  area.appendChild(pubRow);

  // Se já há rascunho salvo, checar status imediatamente
  if(proposalDraftHash){
    (async function(){
      var {data} = await sb.from('proposals').select('status').eq('hash', proposalDraftHash).maybeSingle();
      if(data && data.status === 'aprovado_sdr'){
        proposalApproved = true;
        var pubBtn = document.getElementById('btnPublish');
        if(pubBtn) pubBtn.disabled = false;
        var tip = document.getElementById('pubTip');
        if(tip) tip.style.display = 'none';
        var hint = document.getElementById('approveHint');
        if(hint) hint.innerHTML = '<span style="color:var(--lime);font-weight:700">✅ Proposta aprovada! Clique em Publicar para enviar ao cliente.</span>';
      }
    })();
  }

  area.style.display='block';
}

// ── BLOCK HELPER ──
function mkBlock(icon,title,open){
  var id='b'+Math.random().toString(36).slice(2,7);
  var el=document.createElement('div');
  el.className='block fadein';
  el.innerHTML='<div class="blkhd" onclick="tog(\''+id+'\')"><div class="blkico">'+icon+'</div><div class="blktit">'+title+'</div><span class="blkchev '+(open?'open':'')+'" id="c'+id+'">▼</span></div>'
              +'<div class="blkbody '+(open?'open':'')+'" id="'+id+'"></div>';
  return{el:el,body:el.querySelector('.blkbody')};
}
function tog(id){
  var b=document.getElementById(id);var c=document.getElementById('c'+id);
  if(b)b.classList.toggle('open');if(c)c.classList.toggle('open');
}

// ── PREP E PRINT ──
function prepAndPrint(){
  // Abre todos os blocos fechados
  document.querySelectorAll('.blkbody').forEach(function(b){b.classList.add('open');});
  document.querySelectorAll('.blkchev').forEach(function(c){c.classList.add('open');});
  // Aguarda render dos SVGs antes de imprimir
  setTimeout(function(){window.print();},300);
}

// ── PROPOSTA INLINE ──
var proposalApproved = false;
var proposalDraftHash = null;

function buildProposalBlock(data, meta, patFmt){
  var html = '';
  var allocSlideIdx = -1;

  // Mapeamento rótulo → nome da seção em proposta.html
  var rotuloMap = {
    'Capa': 'Apresentação',
    'Contexto': 'Perfil e Objetivos',
    'Diagnóstico': 'Por que faz sentido',
    'Estratégia Captor': 'Proposta de Alocação',
    'Resultado Projetado': 'Carteira Otimizada',
    'Próximos Passos': 'Como chegamos lá'
  };

  if(data.slides&&data.slides.length){
    data.slides.forEach(function(s,i){
      if((s.rotulo||'').indexOf('Resultado')!==-1) allocSlideIdx = i;
    });

    html += '<div class="prop-inline-section"><div class="prop-inline-label">✏ Edite o texto clicando em cima</div>';
    data.slides.forEach(function(s,i){
      var isAloc = (i === allocSlideIdx);
      var secNome = rotuloMap[s.rotulo] || s.rotulo || ('Slide '+(i+1));
      html += '<div class="prop-inline-item"'+(isAloc?' id="pi_aloc_slide_wrap"':'')+'>'
        +'<div class="prop-inline-sublabel">'+secNome+(isAloc?' <span style="font-size:.62rem;color:var(--lime);margin-left:4px">↕ sincronizado</span>':'')+'</div>'
        +'<input class="fi edit-field" id="pi_sl_titulo_'+i+'" value="'+escHtml(s.titulo||'')+'" placeholder="Título" style="margin-bottom:6px">'
        +'<textarea class="fta edit-field" id="pi_sl_cont_'+i+'" rows="2" style="font-size:.82rem">'+escHtml(s.conteudo||'')+'</textarea>'
        +'</div>';
    });
    html += '</div>';
  }

  // Sliders de alocação editáveis
  if(data.alocacao&&data.alocacao.labels&&data.alocacao.data){
    html += '<div class="prop-inline-section" style="margin-top:14px">'
      +'<div class="prop-inline-label">📊 Edite a alocação sugerida'+(allocSlideIdx>=0?' — "Carteira Otimizada" atualiza automaticamente':'')+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start">'
      +'<div id="pi_aloc_sliders">';
    data.alocacao.labels.forEach(function(lbl,i){
      var val = data.alocacao.data[i]||0;
      html += '<div class="aslider-row">'
        +'<span class="aslider-label" title="'+lbl+'">'+lbl+'</span>'
        +'<div class="aslider-wrap">'
        +'<input type="range" class="aslider" id="pi_aloc_'+i+'" min="0" max="100" value="'+val+'" step="1" oninput="updateAllocSliders('+i+')">'
        +'</div>'
        +'<span class="aslider-val" id="pi_alocv_'+i+'">'+val+'%</span>'
        +'</div>';
    });
    html += '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">'
      +'<span style="font-size:.7rem;color:var(--muted);flex:1">Total</span>'
      +'<span id="pi_aloc_total" style="font-size:.78rem;font-weight:700;color:var(--lime)">100%</span>'
      +'</div>'
      +'</div>'
      +'<div id="pi_aloc_donut" style="width:130px;flex-shrink:0"></div>'
      +'</div>'
      +'</div>';
  }

  // Botões na mesma linha + hint e link sempre visível abaixo
  html += '<div class="prop-inline-approve">'
    +'<div style="display:flex;gap:8px;width:100%">'
    +'<button class="genbtn" id="btnUpdateProposal" onclick="updateProposal()" style="background:var(--gold);color:#1a1a1a;padding:9px 14px;font-size:.78rem;flex:1">'
    +'<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M2 10.5V7h3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +' Atualizar proposta'
    +'</button>'
    +'<button class="pbtn pbtn-approve" id="btnApprove" onclick="saveDraftAndPreview()" style="flex:1">'
    +'<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    +' Salvar e revisar'
    +'</button>'
    +'</div>'
    +'<div id="approveHint" style="margin-top:10px;font-size:.72rem;color:var(--muted);display:none"></div>'
    +'</div>';

  return html;
}

function updateAllocSliders(changedIdx){
  var data = window._lastOutput;
  if(!data||!data.alocacao) return;
  var n = data.alocacao.labels.length;
  var vals = data.alocacao.labels.map(function(_,i){
    return parseInt(document.getElementById('pi_aloc_'+i).value)||0;
  });
  var total = vals.reduce(function(a,b){return a+b;},0);
  var remaining = 100 - total;

  // Trava sliders zerados quando total = 100
  for(var i=0;i<n;i++){
    var sl = document.getElementById('pi_aloc_'+i);
    if(vl) vl.textContent = vals[i]+'%';
  }

  // Atualiza total com cor
  var totalEl = document.getElementById('pi_aloc_total');
  if(totalEl){
    totalEl.textContent = total+'%';
    totalEl.style.color = total===100 ? 'var(--lime)' : '#f08080';
  }

  // Atualiza donut preview
  var donutEl = document.getElementById('pi_aloc_donut');
  if(donutEl && total>0) renderDonut(donutEl, {labels:data.alocacao.labels, data:vals});

  // Sincroniza textarea da "Carteira Otimizada" a cada mudança
  var slides = data.slides||[];
  for(var j=0;j<slides.length;j++){
    if((slides[j].rotulo||'').indexOf('Resultado')!==-1){
      var ta = document.getElementById('pi_sl_cont_'+j);
      if(ta){
        var linhas = data.alocacao.labels.map(function(lbl,k){
          return vals[k]>0 ? lbl+': '+vals[k]+'%' : null;
        }).filter(Boolean).join(' · ');
        var existingText = ta.value.replace(/^Alocação sugerida:[^\n]*\n\n?/,'').trim();
        ta.value = 'Alocação sugerida: '+linhas+(existingText ? '\n\n'+existingText : '');
      }
      break;
    }
  }
}

function escHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function saveDraftAndPreview(){
  var data = window._lastOutput;
  var meta = window._lastMeta;
  if(!data||!meta){ showToast('Gere uma recomendação primeiro.','error'); return; }
  if(!supabaseUserId){ showToast('Você precisa estar logado.','error'); return; }

  var btn = document.getElementById('btnApprove');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></div> Salvando...';

  // Aplicar edições dos slides
  if(data.slides) data.slides.forEach(function(s,i){
    var t=document.getElementById('pi_sl_titulo_'+i);
    var c=document.getElementById('pi_sl_cont_'+i);
    if(t)s.titulo=t.value.trim();
    if(c)s.conteudo=c.value.trim();
  });

  // Aplicar edições da alocação
  if(data.alocacao&&data.alocacao.labels){
    var newAloc = data.alocacao.labels.map(function(_,i){
      return parseInt(document.getElementById('pi_aloc_'+i).value)||0;
    });
    data.alocacao.data = newAloc;
  }

  // Determinar versão e prospect_id
  var versao = 1;
  var prospectIdParaSalvar = AppState.prospects.currentId || null;
  if(prospectIdParaSalvar && !proposalDraftHash){
    // Nova proposta para prospect existente — buscar última versão
    var {data:ultimaVersao} = await sb.from('proposals')
      .select('versao')
      .eq('prospect_id', prospectIdParaSalvar)
      .order('versao', {ascending:false})
      .limit(1)
      .maybeSingle();
    if(ultimaVersao) versao = (ultimaVersao.versao||1) + 1;
  }

  // Salvar rascunho no Supabase com status 'rascunho'
  var hash = proposalDraftHash || generateHash();
  proposalDraftHash = hash;
  var baseUrl = (window.location.origin + window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, ''));
  var previewUrl = baseUrl + '/proposta.html#' + hash;

  var empresaSnap = empresaData ? JSON.parse(JSON.stringify(empresaData)) : null;
  var payload = {
    hash: hash,
    user_id: supabaseUserId,
    prospect_id: prospectIdParaSalvar,
    versao: versao,
    cliente_nome: meta.nome,
    cliente_pat: parseInt(meta.pat),
    cliente_perfil: meta.perfil,
    cliente_prof: meta.prof,
    cliente_idade: parseInt(meta.idade),
    cliente_obj: meta.obj,
    cliente_ass: document.getElementById('fAss').value || '',
    cliente_gaps: document.getElementById('fGaps').value || '',
    cliente_ctx: document.getElementById('fCtx').value || '',
    alocacao_atual: meta.currentAlloc || null,
    alocacao_sugerida: data.alocacao,
    analise_ia: data,
    empresa_snapshot: empresaSnap,
    status: 'rascunho',
    expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString()
  };

  // Upsert pelo hash (permite re-salvar rascunho)
  var {error} = await sb.from('proposals').upsert(payload, {onConflict:'hash'});
  if(error){
    showToast('Erro ao salvar rascunho: '+error.message,'error');
    btn.disabled=false;
    btn.innerHTML='<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Salvar e revisar proposta';
    return;
  }

  // Atualizar UI — mostrar link de prévia e polling de aprovação
  btn.innerHTML = '✓ Salvo';
  // Atualizar status do prospect para r2_iniciada (na primeira versão)
  if(prospectIdParaSalvar && versao === 1){
    await sb.from('prospects').update({status:'r2_iniciada'}).eq('id',prospectIdParaSalvar);
    var p=AppState.prospects.all.find(function(x){return x.id===prospectIdParaSalvar;});
    if(p)p.status='r2_iniciada';
    updateR2ButtonState('r2_iniciada');
  }
  var hint = document.getElementById('approveHint');
  if(hint){
    hint.style.display = 'block';
    hint.innerHTML = 'Abra o link abaixo para revisar e aprovar. O botão Publicar será habilitado após aprovação.'
      +'<br><a href="'+previewUrl+'" target="_blank" style="color:var(--lime);font-weight:700;font-size:.76rem">🔗 Abrir prévia da proposta →</a>';
  }

  // Polling: aguarda aprovação na proposta.html
  startApprovalPolling(hash);
}

function startApprovalPolling(hash){
  function applyApproval(){
    proposalApproved = true;
    var pubBtn = document.getElementById('btnPublish');
    if(pubBtn){
      pubBtn.disabled = false;
      var tip = document.getElementById('pubTip');
      if(tip) tip.style.display = 'none';
      var hint = document.getElementById('approveHint');
      if(hint) hint.innerHTML = '<span style="color:var(--lime);font-weight:700">✅ Proposta aprovada! Clique em Publicar para enviar ao cliente.</span>';
    }
  }
  async function checkStatus(){
    var {data} = await sb.from('proposals').select('status').eq('hash', hash).maybeSingle();
    return data && data.status === 'aprovado_sdr';
  }
  // Verificação imediata (sem esperar 3s)
  checkStatus().then(function(approved){
    if(approved){ applyApproval(); return; }
    // Polling a cada 3s
    var interval = setInterval(async function(){
      var approved = await checkStatus();
      if(approved){
        clearInterval(interval);
        applyApproval();
      }
    }, 3000);
    // Para após 10 minutos
    setTimeout(function(){ clearInterval(interval); }, 600000);
  });
}

function generateHash(){
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var hash = '';
  for(var i = 0; i < 8; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

async function publishProposal(){
  if(!proposalApproved){ showToast('Aprove a proposta antes de publicar.','error'); return; }
  if(!supabaseUserId){ showToast('Você precisa estar logado para publicar.','error'); return; }
  if(!proposalDraftHash){ showToast('Salve o rascunho primeiro.','error'); return; }

  var btn = document.getElementById('btnPublish');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></div> Publicando...';

  var baseUrl = (window.location.origin + window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, ''));
  var proposalUrl = baseUrl + '/proposta.html#' + proposalDraftHash;

  // Atualiza status de rascunho para enviada
  var {error} = await sb.from('proposals').update({status:'enviada'}).eq('hash', proposalDraftHash);
  if(error){
    showToast('Erro ao publicar: '+error.message,'error');
    btn.disabled = false;
    btn.innerHTML = '🔗 Publicar Proposta';
    return;
  }

  btn.innerHTML = '✅ Proposta publicada!';
  var bar = document.getElementById('proposalBar');
  var linkWrap = document.createElement('div');
  linkWrap.className = 'proposal-link-wrap';
  linkWrap.innerHTML = '<span class="proposal-link-url">'+proposalUrl+'</span>'
    +'<button class="proposal-link-copy" onclick="copyProposalLink(\''+proposalUrl+'\')">📋 Copiar link</button>';
  bar.appendChild(linkWrap);
  copyProposalLink(proposalUrl);
}

function copyProposalLink(url){
  navigator.clipboard.writeText(url).then(function(){
    var btns = document.querySelectorAll('.proposal-link-copy');
    btns.forEach(function(b){ b.textContent = '✓ Copiado!'; });
    setTimeout(function(){ btns.forEach(function(b){ b.textContent = '📋 Copiar link'; }); }, 2000);
  });
}

// ── SVG DONUT CHART ──
function renderDonut(container,alloc){
  var defaultColors=['#a8c23a','#7a9a22','#4a6a0a','#c8e050','#ddf070','#e8f590','#5a8a10','#b0d030','#90b820'];
  // Use brand colors if selected, filling remaining with defaults
  var brandColors=window._brandChartColors||[];
  var colors=defaultColors.map(function(d,i){return brandColors[i]||d;});
  var total=alloc.data.reduce(function(a,b){return a+b;},0);
  var cx=110,cy=100,r=72,ri=46;
  var angle=-Math.PI/2;
  var slices='';
  alloc.data.forEach(function(val,i){
    var a=(val/total)*2*Math.PI;
    var x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);
    var x2=cx+r*Math.cos(angle+a),y2=cy+r*Math.sin(angle+a);
    var xi1=cx+ri*Math.cos(angle),yi1=cy+ri*Math.sin(angle);
    var xi2=cx+ri*Math.cos(angle+a),yi2=cy+ri*Math.sin(angle+a);
    var lg=a>Math.PI?1:0;
    slices+='<path d="M'+xi1+' '+yi1+' L'+x1+' '+y1+' A'+r+' '+r+' 0 '+lg+' 1 '+x2+' '+y2+' L'+xi2+' '+yi2+' A'+ri+' '+ri+' 0 '+lg+' 0 '+xi1+' '+yi1+' Z" fill="'+colors[i]+'" opacity="0.9"/>';
    angle+=a;
  });
  // legend
  var legend='';
  alloc.labels.forEach(function(lbl,i){
    var y=200+i*18;
    legend+='<rect x="4" y="'+(y-8)+'" width="10" height="10" rx="2" fill="'+colors[i]+'"/>'
           +'<text x="18" y="'+y+'" fill="#a0a0a0" font-size="10" font-family="system-ui,sans-serif">'+lbl+' ('+alloc.data[i]+'%)</text>';
  });
  // viewBox aumentado para 9 legendas (9 × 18 = 162px de legenda, começa em y=210)
  var legendH = 210 + alloc.labels.length * 18;
  container.innerHTML='<svg viewBox="0 0 220 '+(legendH+10)+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:260px;display:block;margin:0 auto">'
    +slices
    +'<circle cx="'+cx+'" cy="'+cy+'" r="30" fill="#2e2e2e"/>'
    +legend
    +'</svg>';
}

// ── SVG LINE CHART ──
function renderLine(container,pat,perfil){
  var rates={Conservador:.10,Moderado:.13,Arrojado:.16,Agressivo:.19};
  var r=rates[perfil]||.13;
  var rMensal=Math.pow(1+r,1/12)-1;
  var rMensalPct=(rMensal*100).toFixed(2).replace('.',',');
  var anos=[];for(var i=0;i<=10;i++)anos.push(i);
  var comV=anos.map(function(a){return Math.round(pat*Math.pow(1+r,a));});
  var W=300,H=160,padL=54,padB=18,padT=10,padR=10;
  var maxV=Math.max.apply(null,comV);
  var minV=comV[0];
  function px(i){return padL+(i/10)*(W-padL-padR);}
  function py(v){return padT+(H-padT-padB)*(1-(v-minV)/(maxV-minV));}
  var path1='M'+comV.map(function(v,i){return px(i)+' '+py(v);}).join(' L');
  var area1='M'+px(0)+' '+py(comV[0])+' '+comV.map(function(v,i){return 'L'+px(i)+' '+py(v);}).join(' ')+' L'+px(10)+' '+(H-padB)+' L'+padL+' '+(H-padB)+' Z';
  // y labels
  var ylabels='';
  [0,.5,1].forEach(function(f){
    var v=Math.round(minV+f*(maxV-minV));
    var y=py(v);
    var lbl=new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(v);
    ylabels+='<text x="'+(padL-4)+'" y="'+(y+4)+'" text-anchor="end" fill="#666" font-size="9" font-family="system-ui">'+lbl+'</text>'
            +'<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" stroke="#333" stroke-width="0.5"/>';
  });
  // x labels
  var xlabels='';
  [0,2,4,6,8,10].forEach(function(i){
    xlabels+='<text x="'+px(i)+'" y="'+(H-padB+12)+'" text-anchor="middle" fill="#666" font-size="9" font-family="system-ui">'+(i===0?'Hoje':'Ano '+i)+'</text>';
  });
  // ponto final com valor
  var lastX=px(10),lastY=py(comV[10]);
  var lastLbl=new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(comV[10]);
  var endDot='<circle cx="'+lastX+'" cy="'+lastY+'" r="3.5" fill="#a8c23a"/>'
    +'<text x="'+(lastX+6)+'" y="'+(lastY+4)+'" fill="#a8c23a" font-size="9" font-weight="bold" font-family="system-ui">'+lastLbl+'</text>';

  container.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">'
    +'<path d="'+area1+'" fill="rgba(168,194,58,.07)"/>'
    +'<path d="'+path1+'" fill="none" stroke="#a8c23a" stroke-width="2" stroke-linejoin="round"/>'
    +endDot+ylabels+xlabels
    +'</svg>'
    +'<div style="margin-top:8px;font-size:.7rem;color:var(--muted);text-align:center">'
    +'Crescimento mensal estimado: <strong style="color:var(--lime)">+'+rMensalPct+'%</strong> ao mês'
    +'&nbsp;·&nbsp;Taxa anual: <strong style="color:var(--lime)">'+((r*100).toFixed(0))+'%</strong>'
    +'</div>';
}

// ── DASHBOARD ──
var AppState = {
  dash: {
    proposals: [],
    assessorMap: {},
    sortCol: 'created_at',
    sortAsc: false,
    page: 1,
    pageSize: 20,
    selected: {},
    period: 'month',
    dateFrom: null,
    dateTo: null,
    kpiFilter: null
  },
  prospects: {
    all: [],
    currentId: null,
    r1Generated: false,
    viewingAsManager: false,
    sortCol: 'nome',
    sortDir: {nome:'asc',patrimonio:'desc',data:'desc'},
    r1AutoSaveTimer: null
  },
  spreadsheetWizard: {
    step: 1,
    file: null,
    rawData: [],
    columnMapping: {},
    validatedData: [],
    errors: {},
    pageSize: 10,
    currentPage: 1
  }
};

// Retorna {from, to} para o período selecionado
function dashGetPeriodRange(){
  var now = new Date();
  var p = AppState.dash.period;
  if(p === 'today'){
    var s = new Date(now); s.setHours(0,0,0,0);
    var e = new Date(now); e.setHours(23,59,59,999);
    return {from:s, to:e};
  }
  if(p === 'week'){
    var s = new Date(now); s.setDate(now.getDate()-now.getDay()); s.setHours(0,0,0,0);
    var e = new Date(now); e.setHours(23,59,59,999);
    return {from:s, to:e};
  }
  if(p === 'month'){
    var s = new Date(now.getFullYear(), now.getMonth(), 1);
    var e = new Date(now); e.setHours(23,59,59,999);
    return {from:s, to:e};
  }
  if(p === 'custom' && AppState.dash.dateFrom && AppState.dash.dateTo){
    return {from:new Date(AppState.dash.dateFrom+'T00:00:00'), to:new Date(AppState.dash.dateTo+'T23:59:59')};
  }
  return null; // 'all'
}

function dashFilterByPeriod(proposals){
  var range = dashGetPeriodRange();
  if(!range) return proposals;
  return proposals.filter(function(p){
    var d = p.created_at ? new Date(p.created_at) : null;
    return d && d >= range.from && d <= range.to;
  });
}

function dashSetPeriod(period, btn){
  AppState.dash.period = period;
  document.querySelectorAll('.dash-period-btn').forEach(function(b){b.classList.remove('active');});
  if(btn) btn.classList.add('active');
  var customEl = document.getElementById('dashCustomRange');
  if(customEl) customEl.style.display = period === 'custom' ? 'flex' : 'none';
  if(period !== 'custom') dashRefreshKpisAndTable();
}

function dashApplyCustomPeriod(){
  var f = document.getElementById('dashDateFrom').value;
  var t = document.getElementById('dashDateTo').value;
  if(f && t){ AppState.dash.dateFrom=f; AppState.dash.dateTo=t; dashRefreshKpisAndTable(); }
}

// Predicates usados tanto para contar KPIs quanto para filtrar a tabela ao clicar em um KPI.
// Centralizar aqui garante que o número exibido bata com o número de linhas da tabela.
var DASH_KPI_PREDICATES = {
  enviadas: function(p, now){ return p.status !== 'rascunho' && p.status !== 'arquivada'; },
  aceitas:  function(p, now){ return p.status === 'aceita'; },
  aguardando: function(p, now){
    return (p.status === 'enviada' || p.status === 'visualizada')
        && (!p.expires_at || new Date(p.expires_at) >= now);
  },
  expirando: function(p, now){
    var in7 = new Date(now.getTime() + 7*86400000);
    return (p.status === 'enviada' || p.status === 'visualizada')
        && p.expires_at && new Date(p.expires_at) >= now && new Date(p.expires_at) <= in7;
  }
};
var DASH_KPI_LABELS = {
  enviadas: 'Enviadas',
  aceitas: 'Aceitas',
  aguardando: 'Aguardando',
  expirando: 'Expirando (7d)'
};
var DASH_KPI_TO_BOX_ID = {
  enviadas: 'kpiTotal',
  aceitas: 'kpiAceitas',
  aguardando: 'kpiPendentes',
  expirando: 'kpiExpirando'
};

function dashRefreshKpisAndTable(){
  var proposals = AppState.dash.proposals || [];
  var filtered = dashFilterByPeriod(proposals);
  var now = new Date();

  var total     = filtered.filter(function(p){ return DASH_KPI_PREDICATES.enviadas(p, now); }).length;
  var aceitas   = filtered.filter(function(p){ return DASH_KPI_PREDICATES.aceitas(p, now); }).length;
  var pendentes = filtered.filter(function(p){ return DASH_KPI_PREDICATES.aguardando(p, now); }).length;
  var expirando = filtered.filter(function(p){ return DASH_KPI_PREDICATES.expirando(p, now); }).length;
  var taxa = total > 0 ? Math.round(aceitas/total*100) + '%' : '—';

  var respostas = filtered.filter(function(p){ return p.respondido_em && p.created_at; });
  var tempoMedio = '—';
  if(respostas.length){
    var totalDias = respostas.reduce(function(acc,p){
      return acc + (new Date(p.respondido_em)-new Date(p.created_at))/86400000;
    },0);
    var med = Math.round(totalDias/respostas.length);
    if(med > 0) tempoMedio = med === 1 ? '1 dia' : med + ' dias';
  }

  // Taxa de visualização: visualizadas / (enviadas + visualizadas + aceitas + dúvidas)
  var enviadas = filtered.filter(function(p){ return p.status !== 'rascunho' && p.status !== 'arquivada'; });
  var visualizadas = filtered.filter(function(p){ return p.status === 'visualizada' || p.status === 'aceita' || p.status === 'detalhes_solicitados'; }).length;
  var taxaViz = enviadas.length > 0 ? Math.round(visualizadas/enviadas.length*100)+'%' : '—';

  document.getElementById('kTotal').textContent = total || '—';
  document.getElementById('kAceitas').textContent = aceitas || '—';
  document.getElementById('kTaxa').textContent = taxa;
  document.getElementById('kPendentes').textContent = pendentes || '—';
  document.getElementById('kExpirando').textContent = expirando || '—';
  document.getElementById('kTempoResp').textContent = tempoMedio;
  document.getElementById('kTaxaViz').textContent = taxaViz;

  var bestEl = document.getElementById('dashBestAssessor');
  if(bestEl && currentUserIsManager && currentFirmId){
    var assessorMap = AppState.dash.assessorMap || {};
    var byAssessor = {};
    filtered.forEach(function(p){
      if(p.status==='rascunho'||p.status==='arquivada') return;
      if(!byAssessor[p.user_id]) byAssessor[p.user_id]={enviadas:0,aceitas:0};
      byAssessor[p.user_id].enviadas++;
      if(p.status==='aceita') byAssessor[p.user_id].aceitas++;
    });
    var best = null;
    Object.keys(byAssessor).forEach(function(id){
      var d=byAssessor[id];
      var conv=d.enviadas>0?d.aceitas/d.enviadas:0;
      if(!best||conv>best.conv||(conv===best.conv&&d.aceitas>best.aceitas))
        best={id:id,nome:assessorMap[id]||id.substring(0,8),aceitas:d.aceitas,enviadas:d.enviadas,conv:conv};
    });
    if(best && best.aceitas > 0){
      var convPct = Math.round(best.conv*100)+'%';
      bestEl.style.display='block';
      bestEl.innerHTML='🏆 Melhor do período: <strong>'+escHtml(best.nome)+'</strong> · '+best.aceitas+' aceitas · '+convPct+' conversão';
    } else {
      bestEl.style.display='none';
    }
  }

  var sub = document.getElementById('dashSubtitle');
  if(sub) sub.textContent = total + ' proposta' + (total !== 1 ? 's' : '') + ' · atualizado agora';
  dashResetPage();
  renderDashTable();
  dashKpiFilterSyncActiveState();
  dashKpiChipRender();
}

async function updateDash(){
  if(!supabaseUserId) return;
  document.getElementById('dashSubtitle').textContent = 'Carregando...';

  var proposals = [];
  var assessorMap = {};

  if(currentUserIsManager && currentFirmId){
    // PJ: busca membros da empresa
    var {data:members} = await sb.from('firm_members')
      .select('user_id')
      .eq('firm_id', currentFirmId);
    var memberIds = (members||[]).map(function(m){return m.user_id;});
    // Também inclui o próprio manager
    if(memberIds.indexOf(supabaseUserId)<0) memberIds.push(supabaseUserId);
    // Busca nomes separadamente (sem join FK)
    if(memberIds.length){
      var {data:profiles} = await sb.from('company_profiles')
        .select('user_id, empresa_nome')
        .in('user_id', memberIds);
      (profiles||[]).forEach(function(p){
        if(p.empresa_nome) assessorMap[p.user_id] = p.empresa_nome;
      });
    }
    // Fallback para IDs sem perfil
    memberIds.forEach(function(id){
      if(!assessorMap[id]) assessorMap[id] = id.substring(0,8);
    });
    if(empresaData && empresaData.empresa_nome) assessorMap[supabaseUserId] = empresaData.empresa_nome;
    if(memberIds.length){
      var {data:pj} = await sb.from('proposals')
        .select('*')
        .in('user_id', memberIds)
        .order('created_at',{ascending:false});
      proposals = pj || [];
    }
    // Mostra coluna Assessor
    document.querySelectorAll('.assessor-col').forEach(function(el){el.style.display='';});
    document.getElementById('dashRankingWrap').style.display = 'block';
    document.getElementById('dashTitle').textContent = (empresaData&&empresaData.empresa_nome ? empresaData.empresa_nome+' — ' : '') + 'Propostas';
  } else {
    // PF: só as próprias propostas
    var {data:pf} = await sb.from('proposals')
      .select('*').eq('user_id', supabaseUserId).order('created_at',{ascending:false});
    proposals = pf || [];
    document.querySelectorAll('.assessor-col').forEach(function(el){el.style.display='none';});
    document.getElementById('dashRankingWrap').style.display = 'none';
    document.getElementById('dashTitle').textContent = 'Propostas';
  }

  AppState.dash.proposals = proposals;
  AppState.dash.assessorMap = assessorMap;

  dashRefreshKpisAndTable();

  // Ranking PJ
  if(currentUserIsManager && currentFirmId) renderDashRanking(proposals, assessorMap);
}

function renderDashRanking(proposals, assessorMap){
  var list = document.getElementById('dashRankingList');
  if(!list) return;
  // Agrupa por assessor
  var byAssessor = {};
  proposals.forEach(function(p){
    if(p.status==='rascunho'||p.status==='arquivada') return;
    var id = p.user_id;
    if(!byAssessor[id]) byAssessor[id] = {enviadas:0, aceitas:0};
    byAssessor[id].enviadas++;
    if(p.status==='aceita') byAssessor[id].aceitas++;
  });
  var rows = Object.keys(byAssessor).map(function(id){
    var d = byAssessor[id];
    return {id:id, nome:assessorMap[id]||id.substring(0,8), enviadas:d.enviadas, aceitas:d.aceitas,
      conv: d.enviadas>0 ? Math.round(d.aceitas/d.enviadas*100)+'%' : '—'};
  });
  rows.sort(function(a,b){return b.aceitas-a.aceitas;});
  if(!rows.length){
    list.innerHTML='<div style="padding:16px;text-align:center;color:var(--dim);font-size:.78rem">Nenhuma proposta enviada ainda.</div>';
    return;
  }
  list.innerHTML = rows.map(function(r, i){
    var medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return '<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:0;padding:8px 12px;border-bottom:1px solid var(--border2);align-items:center">'
      +'<span style="font-size:.8rem;color:var(--text);font-weight:600">'+(medal?medal+' ':'')+(i+1)+'. '+r.nome+'</span>'
      +'<span style="font-size:.8rem;color:var(--muted);text-align:center;width:90px">'+r.enviadas+'</span>'
      +'<span style="font-size:.8rem;color:var(--lime);font-weight:700;text-align:center;width:80px">'+r.aceitas+'</span>'
      +'<span style="font-size:.8rem;color:var(--muted);text-align:center;width:80px">'+r.conv+'</span>'
      +'</div>';
  }).join('');
}

function dashKpiFilter(type) {
  if(!DASH_KPI_PREDICATES[type]) return;
  var current = AppState.dash.kpiFilter;
  // Toggle: clicar no mesmo KPI já ativo limpa o filtro
  if(current && current.id === type){
    AppState.dash.kpiFilter = null;
  } else {
    AppState.dash.kpiFilter = { id: type, label: DASH_KPI_LABELS[type] };
    // KPI e dropdown de status são filtros mutuamente exclusivos
    var dropdown = document.getElementById('dashFilter');
    if(dropdown) dropdown.value = '';
  }
  dashKpiFilterSyncActiveState();
  dashResetPage();
  renderDashTable();
  dashKpiChipRender();
}

function dashKpiFilterClear() {
  AppState.dash.kpiFilter = null;
  dashKpiFilterSyncActiveState();
  dashResetPage();
  renderDashTable();
  dashKpiChipRender();
}

function dashKpiFilterSyncActiveState() {
  Object.keys(DASH_KPI_TO_BOX_ID).forEach(function(id){
    var el = document.getElementById(DASH_KPI_TO_BOX_ID[id]);
    if(el) el.classList.remove('active');
  });
  var kf = AppState.dash.kpiFilter;
  if(kf){
    var el = document.getElementById(DASH_KPI_TO_BOX_ID[kf.id]);
    if(el) el.classList.add('active');
  }
}

function dashKpiChipRender() {
  var chip = document.getElementById('dashKpiChip');
  var labelEl = document.getElementById('dashKpiChipLabel');
  var countEl = document.getElementById('dashKpiChipCount');
  if(!chip || !labelEl || !countEl) return;
  var kf = AppState.dash.kpiFilter;
  if(!kf){
    chip.style.display = 'none';
    return;
  }
  // Count = predicate aplicado ao conjunto já filtrado por período (mesmo espaço amostral do KPI)
  var filtered = dashFilterByPeriod(AppState.dash.proposals || []);
  var now = new Date();
  var count = filtered.filter(function(p){ return DASH_KPI_PREDICATES[kf.id](p, now); }).length;
  labelEl.textContent = kf.label;
  countEl.textContent = count;
  chip.style.display = 'inline-flex';
}

function dashSort(col) {
  if(AppState.dash.sortCol === col) AppState.dash.sortAsc = !AppState.dash.sortAsc;
  else { AppState.dash.sortCol = col; AppState.dash.sortAsc = true; }
  dashResetPage(); renderDashTable();
}

function dashResetPage() { AppState.dash.page = 1; AppState.dash.selected = {}; dashUpdateArchiveBar(); }

function dashChangePage(dir) {
  AppState.dash.page += dir; AppState.dash.selected = {}; dashUpdateArchiveBar(); renderDashTable();
}

function dashToggleAll(checked) {
  dashGetPageRows().forEach(function(p){ if(checked) AppState.dash.selected[p.hash]=true; else delete AppState.dash.selected[p.hash]; });
  dashUpdateArchiveBar(); renderDashTable();
}

function dashToggleRow(hash) {
  if(AppState.dash.selected[hash]) delete AppState.dash.selected[hash]; else AppState.dash.selected[hash]=true;
  dashUpdateArchiveBar();
  var cb = document.getElementById('dcb-'+hash);
  if(cb) cb.checked = !!AppState.dash.selected[hash];
  var allCb = document.getElementById('dashSelectAll');
  var selCount = Object.keys(AppState.dash.selected).length;
  if(allCb) allCb.checked = selCount > 0 && selCount === dashGetPageRows().length;
}

function dashGetPageRows() {
  var rows = dashGetFilteredSorted();
  var start = (AppState.dash.page-1)*AppState.dash.pageSize;
  return rows.slice(start, start+AppState.dash.pageSize);
}

function dashUpdateArchiveBar() {
  var count = Object.keys(AppState.dash.selected).length;
  var bar = document.getElementById('dashArchiveBar');
  bar.style.display = count > 0 ? 'flex' : 'none';
  document.getElementById('dashArchiveCount').textContent = count + ' proposta' + (count !== 1 ? 's' : '') + ' selecionada' + (count !== 1 ? 's' : '');
}

function dashClearSelection() { AppState.dash.selected = {}; dashUpdateArchiveBar(); renderDashTable(); }

async function dashArchiveSelected() {
  var hashes = Object.keys(AppState.dash.selected);
  if(!hashes.length) return;
  var btn = document.querySelector('.dash-archive-btn');
  btn.disabled = true; btn.textContent = 'Arquivando...';
  for(var i=0; i<hashes.length; i++) {
    await sb.from('proposals').update({status:'arquivada'}).eq('hash', hashes[i]);
  }
  AppState.dash.selected = {}; dashUpdateArchiveBar();
  await updateDash();
  btn.disabled = false; btn.textContent = '📦 Arquivar selecionadas';
}

function dashGetFilteredSorted() {
  var filter = document.getElementById('dashFilter').value;
  var searchEl = document.getElementById('dashSearch');
  var search = searchEl ? searchEl.value.trim().toLowerCase() : '';
  var now = new Date();
  var kf = AppState.dash.kpiFilter;
  // Quando um KPI está ativo, parte do conjunto já filtrado por período — assim a tabela
  // bate exatamente com o número do chip/KPI. Caso contrário, mantém o comportamento
  // histórico (dropdown + busca sobre todas as propostas, sem escopo de período).
  var base = kf ? dashFilterByPeriod(AppState.dash.proposals || []) : (AppState.dash.proposals || []);
  var rows = base.filter(function(p){
    var status = (new Date(p.expires_at) < now && p.status === 'enviada') ? 'expirada' : p.status;
    if(filter && filter !== status) return false;
    if(kf && !DASH_KPI_PREDICATES[kf.id](p, now)) return false;
    if(search && !(p.cliente_nome||'').toLowerCase().includes(search)) return false;
    return true;
  });
  var col = AppState.dash.sortCol;
  rows.sort(function(a,b){
    var va = a[col], vb = b[col];
    if(col === 'cliente_pat' || col === 'feedback_rating'){ va = Number(va)||0; vb = Number(vb)||0; }
    else if(col === 'created_at' || col === 'respondido_em' || col === 'expires_at'){ va = va?new Date(va).getTime():0; vb = vb?new Date(vb).getTime():0; }
    else { va=(va||'').toString().toLowerCase(); vb=(vb||'').toString().toLowerCase(); }
    if(va<vb) return AppState.dash.sortAsc?-1:1;
    if(va>vb) return AppState.dash.sortAsc?1:-1;
    return 0;
  });
  return rows;
}

function renderDashTable(){
  var rows = dashGetFilteredSorted();
  var totalRows = rows.length;
  var totalPages = Math.max(1, Math.ceil(totalRows/AppState.dash.pageSize));
  if(AppState.dash.page > totalPages) AppState.dash.page = totalPages;
  var start = (AppState.dash.page-1)*AppState.dash.pageSize;
  var pageRows = rows.slice(start, start+AppState.dash.pageSize);
  var tb = document.getElementById('dashBody');
  var patFmt = function(v){ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v); };
  var dateFmt = function(d){ return d ? new Date(d).toLocaleDateString('pt-BR') : '—'; };
  var statusLabels = {rascunho:'Rascunho',enviada:'Enviada',visualizada:'Visualizada',aprovado_sdr:'Aprovada SDR',aceita:'Aceita',detalhes_solicitados:'Dúvidas',expirada:'Expirada',arquivada:'Arquivada'};
  var now = new Date();

  ['cliente_nome','cliente_pat','status','created_at','respondido_em','expires_at','feedback_rating'].forEach(function(c){
    var el = document.getElementById('dsort-'+c);
    if(el) el.textContent = AppState.dash.sortCol===c?(AppState.dash.sortAsc?'▲':'▼'):'';
  });

  if(!pageRows.length){
    tb.innerHTML = '<tr><td colspan="11" style="color:var(--dim);text-align:center;padding:24px 0">Nenhuma proposta encontrada.</td></tr>';
    document.getElementById('dashPagination').style.display = 'none';
    var allCb = document.getElementById('dashSelectAll');
    if(allCb) allCb.checked = false;
    return;
  }

  var baseUrl = (window.location.origin + window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, ''));
  var assessorMap = AppState.dash.assessorMap || {};
  var showAssessor = currentUserIsManager && currentFirmId;
  tb.innerHTML = pageRows.map(function(p){
    var isExpired = new Date(p.expires_at) < now;
    var status = isExpired && p.status === 'enviada' ? 'expirada' : p.status;
    var stars = p.feedback_rating ? '★'.repeat(p.feedback_rating)+'☆'.repeat(5-p.feedback_rating) : '—';
    var propUrl = baseUrl + '/proposta.html#' + p.hash;
    var checked = AppState.dash.selected[p.hash] ? 'checked' : '';
    var expStr = '—';
    if(p.expires_at && status !== 'aceita' && status !== 'arquivada'){
      var expDate = new Date(p.expires_at);
      var daysLeft = Math.ceil((expDate-now)/86400000);
      expStr = expDate.toLocaleDateString('pt-BR');
      if(daysLeft<=3 && daysLeft>=0) expStr = '<span class="exp-soon">'+expStr+'</span>';
      else if(daysLeft<0) expStr = '<span style="color:var(--dim)">'+expStr+'</span>';
    }
    var assessorNome = assessorMap[p.user_id] || '';
    return '<tr class="dash-tr" onclick="dashRowClick(event,\''+p.hash+'\',\''+propUrl+'\')">'
      +'<td style="padding:9px 8px" onclick="event.stopPropagation()"><input type="checkbox" class="dash-cb" id="dcb-'+p.hash+'" '+checked+' onchange="dashToggleRow(\''+p.hash+'\')"></td>'
      +'<td style="font-weight:600">'+escHtml(p.cliente_nome||'')+'</td>'
      +(showAssessor?'<td class="assessor-col" style="color:var(--muted);font-size:.75rem">'+escHtml(assessorNome)+'</td>':'<td class="assessor-col" style="display:none"></td>')
      +'<td style="color:var(--muted)">'+patFmt(p.cliente_pat)+'</td>'
      +'<td><span class="badge bmuted">'+escHtml(p.cliente_perfil||'')+'</span></td>'
      +'<td><span class="dash-status ds-'+status+'">'+(statusLabels[status]||status)+'</span></td>'
      +'<td style="color:var(--muted)">'+dateFmt(p.created_at)+'</td>'
      +'<td style="color:var(--muted)">'+dateFmt(p.respondido_em)+'</td>'
      +'<td>'+expStr+'</td>'
      +'<td><span class="dash-stars" title="'+(p.feedback_texto||'')+'">'+stars+'</span></td>'
      +'<td onclick="event.stopPropagation()" style="white-space:nowrap">'
        +'<button class="dash-link" title="Copiar link" onclick="copyDashLink(\''+propUrl+'\')">🔗</button> '
        +'<button class="dash-link" title="Abrir proposta" onclick="window.open(\''+propUrl+'\',\'_blank\')">👁</button>'
      +'</td>'
      +'</tr>';
  }).join('');

  var pag = document.getElementById('dashPagination');
  pag.style.display = totalPages > 1 ? 'flex' : 'none';
  document.getElementById('AppState.dash.pageInfo').textContent = 'Página '+AppState.dash.page+' de '+totalPages+' ('+totalRows+' proposta'+(totalRows!==1?'s':'')+')';
  document.getElementById('dashPrevBtn').disabled = AppState.dash.page <= 1;
  document.getElementById('dashNextBtn').disabled = AppState.dash.page >= totalPages;

  var allCb = document.getElementById('dashSelectAll');
  if(allCb) allCb.checked = pageRows.length > 0 && pageRows.every(function(p){ return AppState.dash.selected[p.hash]; });
}

function dashRowClick(e, hash, url) {
  if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
  window.open(url, '_blank');
}

function copyDashLink(url){
  navigator.clipboard.writeText(url).then(function(){ pixShowToast('🔗 Link copiado!'); });
}

// ── REDEFINIR SENHA ──

// ── ONBOARDING ──
function initOnboarding() {
  var key = 'captor_onboarding_shown';
  if (localStorage.getItem(key)) return;
  // Preenche campos com perfil fake do João Gomes
  document.getElementById('fNome').value = 'João Gomes';
  document.getElementById('fPat').value = 'R$ 45.000.000';
  document.getElementById('fProf').value = 'Artista';
  document.getElementById('fIdade').value = '27';
  document.getElementById('fPerfil').value = 'Arrojado';
  document.getElementById('fObj').value = 'Crescimento patrimonial acelerado';
  document.getElementById('fAss').value = 'Não possui assessoria';
  document.getElementById('fCtx').value = 'Cantor em ascensão com renda concentrada em shows e direitos autorais. Patrimônio recente, sem estrutura de investimentos. Preocupado em transformar o sucesso atual em segurança financeira de longo prazo.';
  document.getElementById('fGaps').value = 'Não tem mais tempo para gerenciar seu patrimônio. Quer guardar 50% dos ganhos para uma aposentadoria tranquila.';
  // Alocação atual: Pós Fixado 30%, Inflação 30%, Prefixado 20%, FII 20%
  var onbAlloc = {0:30, 1:30, 2:20, 5:20};
  for(var i=0;i<9;i++){
    var el = document.getElementById('asl_'+i);
    if(el){ el.value = onbAlloc[i]||0; el.disabled = false; }
  }
  updateSliders(-1);
  // Mostra banner
  document.getElementById('bannerOnboarding').style.display = 'flex';
  // Marca como exibido
  localStorage.setItem(key, '1');
}

function onboardingGenerate() {
  document.getElementById('bannerOnboarding').style.display = 'none';
  // Scroll para o botão e dispara geração
  document.getElementById('btnGen').scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(function(){ generate(); }, 300);
}

function onboardingClear() {
  document.getElementById('bannerOnboarding').style.display = 'none';
  document.getElementById('fNome').value = '';
  document.getElementById('fPat').value = '';
  document.getElementById('fProf').value = '';
  document.getElementById('fIdade').value = '';
  document.getElementById('fPerfil').value = '';
  document.getElementById('fObj').value = '';
  document.getElementById('fAss').value = '';
  document.getElementById('fCtx').value = '';
  document.getElementById('fGaps').value = '';
  resetSliders();
}

function fillExample() {
  var EXEMPLOS = [
    // ── Só campos obrigatórios ──────────────────────────────────────────
    {nome:'Carlos Mendes',pat:'R$ 280.000',prof:'Servidor público',idade:'41',perfil:'Conservador',obj:'Aposentadoria / Independência financeira',ass:'',horizonte:'',gaps:'',ctx:'',alloc:{}},
    {nome:'Aline Rocha',pat:'R$ 1.200.000',prof:'Médica',idade:'38',perfil:'Moderado',obj:'Renda passiva',ass:'',horizonte:'',gaps:'',ctx:'',alloc:{}},
    {nome:'Bruno Teixeira',pat:'R$ 5.500.000',prof:'Empresário',idade:'52',perfil:'Arrojado',obj:'Crescimento patrimonial acelerado',ass:'',horizonte:'',gaps:'',ctx:'',alloc:{}},
    {nome:'Fernanda Lima',pat:'R$ 180.000',prof:'Professora',idade:'34',perfil:'Conservador',obj:'Compra de imóvel / bem',ass:'',horizonte:'',gaps:'',ctx:'',alloc:{}},

    // ── Todos os campos ─────────────────────────────────────────────────
    {nome:'João Gomes',pat:'R$ 45.000.000',prof:'Artista',idade:'27',perfil:'Arrojado',obj:'Crescimento patrimonial acelerado',ass:'Não possui assessoria',horizonte:'Mais de 10 anos',gaps:'Patrimônio concentrado em conta corrente. Sem estrutura de investimentos.',ctx:'Cantor em ascensão com renda concentrada em shows e direitos autorais. Preocupado em transformar o sucesso atual em segurança de longo prazo.',alloc:{0:30,1:30,2:20,5:20}},
    {nome:'Regina Castilho',pat:'R$ 3.800.000',prof:'Advogada',idade:'49',perfil:'Moderado',obj:'Sucessão patrimonial / família',ass:'XP Investimentos',horizonte:'5 a 10 anos',gaps:'Carteira 100% renda fixa. Sem planejamento sucessório.',ctx:'Sócia de escritório de advocacia. Dois filhos. Quer estruturar holding familiar.',alloc:{0:60,1:20,2:10,3:10}},
    {nome:'Thiago Andrade',pat:'R$ 920.000',prof:'Engenheiro',idade:'36',perfil:'Arrojado',obj:'Crescimento patrimonial acelerado',ass:'BTG Pactual',horizonte:'Mais de 10 anos',gaps:'Concentrado em ações de única empresa (employer stock).',ctx:'CLT em multinacional. Recebeu opções de ações no IPO da empresa. Quer diversificar.',alloc:{0:10,4:60,5:15,6:15}},
    {nome:'Márcia Fonseca',pat:'R$ 12.000.000',prof:'Médica',idade:'58',perfil:'Moderado',obj:'Renda passiva',ass:'Itaú Private',horizonte:'3 a 5 anos',gaps:'Alta exposição a imóveis físicos (70% do patrimônio). Baixa liquidez.',ctx:'Cardiologista. Planejando reduzir carga de trabalho em 3 anos. Quer renda mensal de R$ 50k.',alloc:{0:40,1:20,2:10,3:15,5:15}},

    // ── Edge cases ──────────────────────────────────────────────────────
    // Jovem rico — patrimônio alto, idade baixa
    {nome:'Lucas Drummond',pat:'R$ 8.000.000',prof:'Influenciador digital',idade:'22',perfil:'Agressivo',obj:'Crescimento patrimonial acelerado',ass:'Não possui assessoria',horizonte:'Mais de 10 anos',gaps:'Nunca investiu. Tudo em conta corrente e imóvel. Sem noção de risco.',ctx:'Recebeu R$ 8M de venda de startup. Primeira experiência com patrimônio relevante.',alloc:{}},
    // Aposentado conservador — patrimônio médio, horizonte curto
    {nome:'José Almeida',pat:'R$ 650.000',prof:'Aposentado',idade:'68',perfil:'Conservador',obj:'Renda passiva',ass:'Bradesco',horizonte:'Até 2 anos',gaps:'CDB banco com rendimento abaixo do CDI. Sem diversificação.',ctx:'Aposentado há 3 anos. Depende dos investimentos para complementar a aposentadoria do INSS.',alloc:{0:80,1:20}},
    // Patrimônio baixo — início de jornada
    {nome:'Camila Souza',pat:'R$ 35.000',prof:'Designer',idade:'28',perfil:'Moderado',obj:'Crescimento patrimonial acelerado',ass:'Não possui assessoria',horizonte:'5 a 10 anos',gaps:'',ctx:'Começou a guardar dinheiro recentemente. Quer entender onde investir.',alloc:{}},
    // Patrimônio altíssimo — family office
    {nome:'Eduardo Saraiva',pat:'R$ 180.000.000',prof:'Empresário',idade:'61',perfil:'Moderado',obj:'Proteção e preservação',ass:'Family Office próprio',horizonte:'Mais de 10 anos',gaps:'Gestão fragmentada entre múltiplos bancos sem visão consolidada.',ctx:'Fundador de grupo industrial. Planejamento de saída e sucessão para os filhos.',alloc:{0:20,1:15,2:5,3:20,4:10,5:10,6:10,7:5,8:5}},
    // Internacional — offshore
    {nome:'Patricia Nunes',pat:'R$ 4.500.000',prof:'Executiva',idade:'44',perfil:'Arrojado',obj:'Investimentos internacionais / Offshore',ass:'XP Investimentos',horizonte:'Mais de 10 anos',gaps:'Zero exposição internacional. Alta concentração em Brasil.',ctx:'CFO de multinacional. Recebe parte do bônus em dólar. Quer proteção cambial.',alloc:{0:30,1:10,4:20,6:10,7:15,8:15}},
    // Profissão incomum
    {nome:'Rafael Matos',pat:'R$ 2.100.000',prof:'Jogador de futebol',idade:'31',perfil:'Arrojado',obj:'Proteção e preservação',ass:'Não possui assessoria',horizonte:'3 a 5 anos',gaps:'Renda irregular e com prazo definido. Sem reserva para pós-carreira.',ctx:'Atacante em clube da série A. Contrato até 2027. Sabe que precisa preservar capital para a aposentadoria.',alloc:{}},
    // Médico pessoa jurídica
    {nome:'Dra. Ana Paula Vieira',pat:'R$ 1.800.000',prof:'Médica',idade:'42',perfil:'Moderado',obj:'Crescimento patrimonial acelerado',ass:'Rico / XP',horizonte:'5 a 10 anos',gaps:'Investimentos misturados PF e PJ. Alta exposição a fundos do banco de relacionamento.',ctx:'Dermatologista com clínica própria. Fatura R$ 80k/mês via PJ. Quer estruturar separação patrimonial.',alloc:{0:35,1:20,2:10,3:20,4:15}},
  ];

  var ex = EXEMPLOS[Math.floor(Math.random() * EXEMPLOS.length)];

  // Limpar erros e highlights anteriores
  ['fNome','fPat','fProf','fIdade','fPerfil','fObj'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.style.borderColor='';el.classList.remove('field-error');}
  });
  var errEl=document.getElementById('r2ValidationError');
  if(errEl)errEl.style.display='none';
  var r1Err=document.getElementById('r1ValidationError');
  if(r1Err)r1Err.style.display='none';

  document.getElementById('fNome').value = ex.nome;
  document.getElementById('fPat').value  = ex.pat;
  document.getElementById('fProf').value = ex.prof;
  document.getElementById('fIdade').value= ex.idade;
  document.getElementById('fPerfil').value= ex.perfil;
  document.getElementById('fObj').value  = ex.obj;
  document.getElementById('fAss').value  = ex.ass||'';
  document.getElementById('fHorizonte').value = ex.horizonte||'';
  document.getElementById('fGaps').value = ex.gaps||'';
  document.getElementById('fCtx').value  = ex.ctx||'';
  // Preenche também campos pd_* da detail view
  function spd(id,val){var el=document.getElementById(id);if(el)el.value=val||'';}
  spd('pd_nome',ex.nome);spd('pd_pat',ex.pat);spd('pd_prof',ex.prof);
  spd('pd_idade',ex.idade);spd('pd_perfil',ex.perfil);spd('pd_obj',ex.obj);
  spd('pd_ass',ex.ass||'');spd('pd_horizonte',ex.horizonte||'');
  spd('pd_gaps',ex.gaps||'');spd('pd_ctx',ex.ctx||'');
  resetSliders();
  resetPdSliders();
  if(ex.alloc && Object.keys(ex.alloc).length){
    for(var i=0;i<9;i++){
      var el=document.getElementById('asl_'+i);
      if(el){el.value=ex.alloc[i]||0;el.disabled=false;}
      var pdSl=document.getElementById('pd_sl_'+i);
      var pdVl=document.getElementById('pd_sl_'+i+'_v');
      if(pdSl){pdSl.value=ex.alloc[i]||0;if(pdVl)pdVl.textContent=(ex.alloc[i]||0)+'%';}
    }
    updateSliders(-1);
    updatePdAllocTotal();
  }
  onFieldChange();
}

async function updateProposal() {
  var data = window._lastOutput;
  var meta = window._lastMeta;
  if(!data||!meta){showToast('Gere uma análise primeiro.','error');return;}

  var btn = document.getElementById('btnUpdateProposal');
  btn.disabled = true;
  btn.textContent = 'Atualizando...';

  try { await debitCredit('regeneracao', meta.nome); }
  catch(e) { alert(e.message); btn.disabled=false; btn.textContent='🔄 Atualizar proposta'; return; }

  // Coleta edições do SDR
  var slidesEditados = [];
  if(data.slides) data.slides.forEach(function(s,i){
    var t = document.getElementById('pi_sl_titulo_'+i);
    var c = document.getElementById('pi_sl_cont_'+i);
    slidesEditados.push((s.rotulo||'Slide '+(i+1))+': '+(t?t.value.trim():s.titulo)+' — '+(c?c.value.trim():s.conteudo));
  });

  var alocEditada = [];
  if(data.alocacao&&data.alocacao.labels){
    data.alocacao.labels.forEach(function(lbl,i){
      var sl = document.getElementById('pi_aloc_'+i);
      var val = sl ? parseInt(sl.value)||0 : data.alocacao.data[i];
      if(val>0) alocEditada.push(lbl+': '+val+'%');
    });
  }

  var nome=meta.nome, pat=meta.pat, prof=meta.prof, idade=meta.idade, perfil=meta.perfil, obj=meta.obj;
  var patFmt=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(pat);

  var prompt='Você é assessor sênior da Captor Investimentos. Atualize a proposta para '+nome+' ('+prof+', '+idade+' anos, patrimônio '+patFmt+', perfil '+perfil+', objetivo: '+obj+').\n\n'
    +'O assessor fez as seguintes edições nos slides:\n'+slidesEditados.join('\n')+'\n\n'
    +(alocEditada.length ? 'Alocação ajustada pelo assessor:\n'+alocEditada.join(' · ')+'\n\n' : '')
    +'Com base nessas edições, gere uma proposta atualizada e coerente. Mantenha o roteiro e as perguntas, atualize argumentos e slides para refletir as mudanças.\n'
    +'IMPORTANTE: títulos dos slides em sentence case. Nunca use maiúsculas.\n'
    +'IMPORTANTE: nunca use a palavra "rapport" em nenhum texto gerado. Substitua por: conexão, confiança, proximidade, abertura ou sintonia.\n\n'
    +'Responda SOMENTE JSON válido, sem markdown:\n'
    +'{"resumoPerfil":"...","roteiro":[{"titulo":"...","descricao":"...","dica":"...","minutos":5}],"perguntas":[{"pergunta":"...","motivo":"..."}],"argumentos":[{"titulo":"...","corpo":"...","frase_gancho":"..."}],"slides":[{"numero":1,"rotulo":"Capa","titulo":"...","conteudo":"...","visual":"..."}],"alocacao":{"labels":["Pós Fixado","Inflação","Prefixado","Multimercados","Renda Variável BR","FII","Alternativos","RF Global","RV Global"],"data":[70,10,5,5,2,0,0,3,5]}}\n\n'
    +'Gere exatamente: 6 etapas, 5 perguntas, 3 argumentos, 6 slides. Use a alocação ajustada pelo assessor no campo alocacao.data.';

  try {
    var resp=await fetch(PROXY_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,messages:[{role:'user',content:prompt}]})
    });
    if(!resp.ok){var err=await resp.json().catch(function(){return{};});throw new Error('API '+resp.status+': '+(err.error&&err.error.message?err.error.message:resp.statusText));}
    var d=await resp.json();
    if(d && d.usage) await logAiUsage('atualizar_proposta',null,'claude-sonnet-4-20250514',d.usage.input_tokens,d.usage.output_tokens,'success');
    if(!d||!d.content) throw new Error('Resposta vazia da IA. Tente novamente.');
    var raw=d.content.map(function(c){return c.text||'';}).join('');
    var parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());
    renderOutput(nome,patFmt,parsed,meta);
  } catch(e) {
    showToast('Erro ao atualizar: '+e.message,'error');
    btn.disabled=false;
    btn.textContent='🔄 Atualizar proposta';
  }
}
// Edge Functions chamadas via sb.functions.invoke() — sem URL manual necessária

var pixState = {
  pacote: 0, creditos: 0,
  paymentId: null, brCode: null,
  docType: 'cpf',
  pollInterval: null, timerInterval: null,
  expiresAt: null
};

function pixSelectPackage(valor, creditos) {
  pixState.pacote = valor;
  pixState.creditos = creditos;

  // Badge
  document.getElementById('pixBadge').textContent = '⚡ ' + creditos + ' créditos por R$ ' + valor;

  // Oculta saldo/pacotes/log — mostra pixFlow
  document.getElementById('creditsModalHeader').style.display = 'none';
  document.getElementById('creditsMainBody').style.display = 'none';
  document.getElementById('pixFlow').style.display = 'block';

  // Verifica se já tem tax_id e cellphone salvos
  if (empresaData && empresaData.owner_tax_id && empresaData.owner_cellphone) {
    pixShowQr();
  } else {
    // Pré-preenche se tiver parcial
    if (empresaData && empresaData.owner_tax_id) {
      var raw = empresaData.owner_tax_id.replace(/\D/g,'');
      if (raw.length === 14) {
        pixSetDocType('cnpj');
        document.getElementById('pixDocInput').value = pixFmtCnpj(raw);
      } else {
        document.getElementById('pixDocInput').value = pixFmtCpf(raw);
      }
    }
    if (empresaData && empresaData.owner_cellphone) {
      document.getElementById('pixPhoneInput').value = pixFmtPhone(empresaData.owner_cellphone);
    }
    document.getElementById('pixStepDoc').style.display = 'block';
    document.getElementById('pixStepQr').style.display = 'none';
  }
}

function pixCloseFlow() {
  pixStopPolling();
  document.getElementById('pixFlow').style.display = 'none';
  document.getElementById('creditsModalHeader').style.display = '';
  document.getElementById('creditsMainBody').style.display = '';
  // Reset steps
  document.getElementById('pixStepDoc').style.display = 'block';
  document.getElementById('pixStepQr').style.display = 'none';
  document.getElementById('pixDocError').style.display = 'none';
  document.getElementById('pixStatusMsg').style.display = 'none';
  document.getElementById('pixDocInput').value = '';
  document.getElementById('pixPhoneInput').value = '';
}

function pixSetDocType(type) {
  pixState.docType = type;
  document.getElementById('pixDocCpf').classList.toggle('active', type === 'cpf');
  document.getElementById('pixDocCnpj').classList.toggle('active', type === 'cnpj');
  document.getElementById('pixDocLabel').textContent = type === 'cpf' ? 'CPF' : 'CNPJ';
  document.getElementById('pixDocInput').placeholder = type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';
  document.getElementById('pixDocInput').maxLength = type === 'cpf' ? 14 : 18;
  document.getElementById('pixDocInput').value = '';
}

function pixMaskDoc(el) {
  var raw = el.value.replace(/\D/g,'');
  if (pixState.docType === 'cpf') {
    raw = raw.slice(0,11);
    el.value = pixFmtCpf(raw);
  } else {
    raw = raw.slice(0,14);
    el.value = pixFmtCnpj(raw);
  }
}

function pixFmtCpf(r) {
  if (r.length <= 3) return r;
  if (r.length <= 6) return r.slice(0,3)+'.'+r.slice(3);
  if (r.length <= 9) return r.slice(0,3)+'.'+r.slice(3,6)+'.'+r.slice(6);
  return r.slice(0,3)+'.'+r.slice(3,6)+'.'+r.slice(6,9)+'-'+r.slice(9);
}

function pixFmtCnpj(r) {
  if (r.length <= 2) return r;
  if (r.length <= 5) return r.slice(0,2)+'.'+r.slice(2);
  if (r.length <= 8) return r.slice(0,2)+'.'+r.slice(2,5)+'.'+r.slice(5);
  if (r.length <= 12) return r.slice(0,2)+'.'+r.slice(2,5)+'.'+r.slice(5,8)+'/'+r.slice(8);
  return r.slice(0,2)+'.'+r.slice(2,5)+'.'+r.slice(5,8)+'/'+r.slice(8,12)+'-'+r.slice(12);
}

function pixMaskPhone(el) {
  var raw = el.value.replace(/\D/g,'').slice(0,11);
  el.value = pixFmtPhone(raw);
}

function pixFmtPhone(r) {
  r = r.replace(/\D/g,'').slice(0,11);
  if (r.length <= 2) return r.length ? '('+r : r;
  if (r.length <= 7) return '('+r.slice(0,2)+') '+r.slice(2);
  return '('+r.slice(0,2)+') '+r.slice(2,7)+'-'+r.slice(7);
}

async function pixSubmitDoc() {
  var rawDoc   = document.getElementById('pixDocInput').value.replace(/\D/g,'');
  var rawPhone = document.getElementById('pixPhoneInput').value.replace(/\D/g,'');
  var errEl = document.getElementById('pixDocError');
  errEl.style.display = 'none';

  if (pixState.docType === 'cpf' && rawDoc.length !== 11) {
    errEl.textContent = 'CPF inválido — deve ter 11 dígitos.'; errEl.style.display = 'block'; return;
  }
  if (pixState.docType === 'cnpj' && rawDoc.length !== 14) {
    errEl.textContent = 'CNPJ inválido — deve ter 14 dígitos.'; errEl.style.display = 'block'; return;
  }
  if (rawPhone.length < 10) {
    errEl.textContent = 'Celular inválido — deve ter DDD + número.'; errEl.style.display = 'block'; return;
  }

  // Salva no empresaData local e no Supabase
  if (!empresaData) empresaData = {};
  empresaData.owner_tax_id    = rawDoc;
  empresaData.owner_cellphone = rawPhone;
  await sb.from('company_profiles').upsert({
    user_id: supabaseUserId,
    owner_tax_id: rawDoc,
    owner_cellphone: rawPhone
  }, {onConflict:'user_id'});

  pixShowQr();
}

async function pixShowQr() {
  document.getElementById('pixStepDoc').style.display = 'none';
  document.getElementById('pixStepQr').style.display = 'block';
  document.getElementById('pixQrImg').src = '';
  document.getElementById('pixQrImg').style.display = 'none';
  document.getElementById('pixQrSpinner').style.display = 'flex';
  document.getElementById('pixTimerWrap').style.display = 'none';
  document.getElementById('pixCopyField').value = '';
  document.getElementById('pixStatusMsg').style.display = 'none';

  var btn = document.getElementById('pixDocBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando...'; }

  try {
    // Pega email da sessão
    var sessionInfo = await sb.auth.getUser();
    var userEmail = sessionInfo.data.user ? sessionInfo.data.user.email : '';
    var userNome  = (empresaData && empresaData.empresa_nome) ? empresaData.empresa_nome : (user || 'Usuário Captor');

    var { data, error: fnErr } = await sb.functions.invoke('abacatepay-create', {
      body: {
        user_id:   supabaseUserId,
        pacote:    pixState.pacote,
        tax_id:    empresaData.owner_tax_id    || null,
        cellphone: empresaData.owner_cellphone || null,
        nome:      userNome,
        email:     userEmail
      }
    });

    if (fnErr || !data || !data.payment_id) {
      throw new Error((data && data.error) || (fnErr && fnErr.message) || 'Erro ao gerar QR Code.');
    }

    pixState.paymentId = data.payment_id;
    pixState.brCode    = data.brCode;
    pixState.expiresAt = new Date(data.expiresAt);
    pixState.devMode   = data.devMode || false;

    document.getElementById('pixQrSpinner').style.display = 'none';
    document.getElementById('pixQrImg').src = data.brCodeBase64;
    document.getElementById('pixQrImg').style.display = 'block';
    document.getElementById('pixTimerWrap').style.display = 'block';
    document.getElementById('pixCopyField').value = data.brCode;
    if (data.devMode) {
      document.getElementById('pixCheckBtn').textContent = 'Já paguei — verificar agora (SIMULADO)';
      document.getElementById('pixCheckBtn').style.borderColor = 'var(--gold)';
      document.getElementById('pixCheckBtn').style.color = 'var(--gold)';
    }

    pixStartTimer();
    pixStartPolling();

  } catch(e) {
    document.getElementById('pixStepDoc').style.display = 'block';
    document.getElementById('pixStepQr').style.display = 'none';
    document.getElementById('pixDocError').textContent = e.message;
    document.getElementById('pixDocError').style.display = 'block';
    if (btn) { btn.disabled = false; btn.textContent = 'Gerar QR Code →'; }
  }
}

function pixStartTimer() {
  if (pixState.timerInterval) clearInterval(pixState.timerInterval);
  pixState.timerInterval = setInterval(function() {
    var now = new Date();
    var diff = Math.max(0, Math.floor((pixState.expiresAt - now) / 1000));
    var m = Math.floor(diff / 60).toString().padStart(2,'0');
    var s = (diff % 60).toString().padStart(2,'0');
    document.getElementById('pixTimerLabel').textContent = m + ':' + s;
    if (diff <= 0) {
      clearInterval(pixState.timerInterval);
      pixStopPolling();
      var msg = document.getElementById('pixStatusMsg');
      msg.innerHTML = '<div style="font-size:.78rem;color:#f08080;text-align:center;padding:8px">QR Code expirado. <button onclick="pixShowQr()" style="background:transparent;border:none;color:var(--lime);cursor:pointer;font-size:.78rem;font-weight:700">Gerar novo →</button></div>';
      msg.style.display = 'block';
    }
  }, 1000);
}

function pixStartPolling() {
  if (pixState.pollInterval) clearInterval(pixState.pollInterval);
  pixState.pollInterval = setInterval(pixCheckStatus, 3000);
}

function pixStopPolling() {
  if (pixState.pollInterval) { clearInterval(pixState.pollInterval); pixState.pollInterval = null; }
  if (pixState.timerInterval) { clearInterval(pixState.timerInterval); pixState.timerInterval = null; }
}

async function pixCheckNow() {
  // Para o polling imediatamente para evitar chamadas duplicadas
  pixStopPolling();

  var btn = document.getElementById('pixCheckBtn');
  var msg = document.getElementById('pixStatusMsg');

  btn.disabled = true;

  if (pixState.devMode) {
    btn.textContent = '⏳ Simulando pagamento...';
    msg.innerHTML = '<div style="font-size:.74rem;color:var(--muted);text-align:center">Enviando simulação para AbacatePay...</div>';
    msg.style.display = 'block';

    var { error: simErr } = await sb.functions.invoke('abacatepay-simulate', {
      body: { payment_id: pixState.paymentId }
    });

    if (simErr) {
      msg.innerHTML = '<div style="font-size:.74rem;color:#f08080;text-align:center">Erro ao simular: ' + simErr.message + '</div>';
      btn.disabled = false;
      btn.textContent = 'Já paguei — verificar agora (SIMULADO)';
      return;
    }

    btn.textContent = '⏳ Verificando...';
    msg.innerHTML = '<div style="font-size:.74rem;color:var(--muted);text-align:center">Simulação enviada, verificando status...</div>';
    // Aguarda 1.5s para AbacatePay processar
    await new Promise(function(r){ setTimeout(r, 1500); });
  } else {
    btn.textContent = '⏳ Verificando...';
  }

  await pixCheckStatus();
}

async function pixCheckStatus() {
  if (!pixState.paymentId) return;
  try {
    var { data, error: fnErr } = await sb.functions.invoke('abacatepay-check', {
      body: {
        payment_id: pixState.paymentId,
        user_id:    supabaseUserId,
        creditos:   pixState.creditos
      }
    });

    var msg = document.getElementById('pixStatusMsg');
    var btn = document.getElementById('pixCheckBtn');

    if (fnErr) {
      console.error('abacatepay-check error:', fnErr);
      if (msg) { msg.innerHTML = '<div style="font-size:.74rem;color:#f08080;text-align:center">Erro: ' + fnErr.message + '</div>'; msg.style.display='block'; }
      if (btn) { btn.disabled = false; btn.textContent = pixState.devMode ? 'Já paguei — verificar agora (SIMULADO)' : 'Já paguei — verificar agora'; }
      return;
    }

    if (data && data.status === 'PAID') {
      pixStopPolling();
      if (msg) msg.style.display = 'none';
      await loadCredits();
      pixCloseFlow();
      closeCreditsModal();
      pixShowToast('✅ ' + pixState.creditos + ' créditos adicionados!');
    } else {
      if (btn) {
        btn.disabled = false;
        btn.textContent = pixState.devMode ? 'Já paguei — verificar agora (SIMULADO)' : 'Já paguei — verificar agora';
      }
      if (msg && data && data.error) {
        msg.innerHTML = '<div style="font-size:.74rem;color:#f08080;text-align:center">' + data.error + '</div>';
        msg.style.display = 'block';
      } else if (msg) {
        msg.style.display = 'none';
      }
    }
  } catch(e) {
    console.error('pixCheckStatus exception:', e);
    var btn = document.getElementById('pixCheckBtn');
    var msg = document.getElementById('pixStatusMsg');
    if (btn) { btn.disabled = false; btn.textContent = pixState.devMode ? 'Já paguei — verificar agora (SIMULADO)' : 'Já paguei — verificar agora'; }
    if (msg) { msg.innerHTML = '<div style="font-size:.74rem;color:#f08080;text-align:center">Erro inesperado. Tente novamente.</div>'; msg.style.display='block'; }
  }
}

function pixCopyCode() {
  var code = document.getElementById('pixCopyField').value;
  if (!code) return;
  navigator.clipboard.writeText(code).then(function() {
    var btn = document.getElementById('pixCopyBtn');
    btn.textContent = '✓ Copiado!';
    setTimeout(function(){ btn.textContent = '📋 Copiar'; }, 2000);
  });
}

async function pixSimulatePayment() {
  if (!pixState.paymentId) return;
  var btn = document.getElementById('pixSimulateBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Simulando...';

  var { data, error } = await sb.functions.invoke('abacatepay-simulate', {
    body: { payment_id: pixState.paymentId }
  });

  if (error || (data && data.error)) {
    btn.disabled = false;
  }

  // Aguarda o polling detectar
  btn.textContent = '⏳ Aguardando confirmação...';
}

function pixShowToast(msg) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--lime);border-radius:var(--rl);padding:12px 22px;font-size:.84rem;font-weight:700;color:var(--lime);z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:fadein .3s ease';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity .4s'; setTimeout(function(){ toast.remove(); }, 400); }, 3500);
}

// ── CAPTOR TEAMS ──────────────────────────────────────────────────────────────
var currentUserIsManager = false;
var currentFirmId = null;
var empresaSlugCheckTimer = null;

function empresaToSlug(name){
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-|-$/g,'');
}

async function checkEmpresaSlug(){
  var nome=document.getElementById('lEmpresaNome').value.trim();
  var statusEl=document.getElementById('lEmpresaStatus');
  if(!nome){statusEl.textContent='';return;}
  clearTimeout(empresaSlugCheckTimer);
  statusEl.style.color='var(--dim)';
  statusEl.textContent='Verificando...';
  empresaSlugCheckTimer=setTimeout(async function(){
    var slug=empresaToSlug(nome);
    var {data}=await sb.from('firms').select('id').eq('slug',slug).maybeSingle();
    if(data){
      statusEl.style.color='#f08080';
      statusEl.textContent='✗ Já existe uma empresa com esse nome.';
    } else {
      statusEl.style.color='var(--lime)';
      statusEl.textContent='✓ Nome disponível.';
    }
  }, 500);
}

async function loadFirmRole(){
  if(!supabaseUserId)return;
  // criar empresa pendente (signup PJ que precisou confirmar email)
  var pendingEmpresa=localStorage.getItem('captor_pending_empresa');
  if(pendingEmpresa){
    localStorage.removeItem('captor_pending_empresa');
    var slugP=empresaToSlug(pendingEmpresa);
    var {data:existingP}=await sb.from('firms').select('id').eq('slug',slugP).maybeSingle();
    if(!existingP){
      var {data:newFirm}=await sb.from('firms').insert({
        name:pendingEmpresa, slug:slugP, owner_user_id:supabaseUserId
      }).select().maybeSingle();
      if(newFirm){
        await sb.from('firm_members').insert({
          firm_id:newFirm.id, user_id:supabaseUserId,
          role:'manager', credit_limit_monthly:0, joined_at:new Date().toISOString()
        });
        // Atualiza firm_id no company_profiles
        await sb.from('company_profiles').update({firm_id:newFirm.id}).eq('user_id',supabaseUserId);
      }
    }
  }
  // checar se é gestor (owner de alguma empresa)
  var {data:firm}=await sb.from('firms').select('id,name').eq('owner_user_id',supabaseUserId).maybeSingle();
  if(firm){
    currentUserIsManager=true;
    currentFirmId=firm.id;
    // Garante firm_id no company_profiles (corrige contas antigas)
    await sb.from('company_profiles').update({firm_id:firm.id}).eq('user_id',supabaseUserId).is('firm_id',null);
    // mostrar tab Equipe
    var tabEl=document.getElementById('tabEquipe');
    if(tabEl)tabEl.style.display='';
    // abrir modal de configuração automaticamente na primeira vez
    var seenConfig=localStorage.getItem('captor_mgr_cfg_'+supabaseUserId);
    if(!seenConfig){
      localStorage.setItem('captor_mgr_cfg_'+supabaseUserId,'1');
      setTimeout(function(){openEmpresaModal();},800);
    }
  } else {
    // checar se é membro de empresa
    var {data:member}=await sb.from('firm_members').select('firm_id,role').eq('user_id',supabaseUserId).maybeSingle();
    if(member){currentFirmId=member.firm_id;}
  }
}

async function loadTeamView(){
  if(!currentUserIsManager||!currentFirmId)return;
  // Seção 0 — resumo empresa
  if(empresaData){
    var nomeEl=document.getElementById('teamEmpresaNome');
    if(nomeEl&&empresaData.empresa_nome)nomeEl.textContent=empresaData.empresa_nome;
    // Header "Logado como" — destaca o gestor
    var loggedBlock=document.getElementById('teamLoggedManager');
    var loggedNome=document.getElementById('teamLoggedNome');
    var loggedInicial=document.getElementById('teamLoggedInicial');
    if(loggedBlock&&currentUserIsManager){
      var nm=empresaData.empresa_nome||'Gestor';
      loggedBlock.style.display='flex';
      if(loggedNome)loggedNome.textContent=nm;
      if(loggedInicial)loggedInicial.textContent=nm.charAt(0).toUpperCase();
    }
  }
  await loadTeamMembers();
  await loadTeamInvites();
}

// Controla tabs Assessores/Convites
function switchTeamTab(tab){
  var tA=document.getElementById('teamTabAssessores');
  var tC=document.getElementById('teamTabConvites');
  var pA=document.getElementById('teamPaneAssessores');
  var pC=document.getElementById('teamPaneConvites');
  if(!tA||!tC||!pA||!pC)return;
  if(tab==='convites'){
    tA.style.borderBottomColor='transparent';tA.style.color='var(--dim)';
    tC.style.borderBottomColor='var(--lime)';tC.style.color='var(--text)';
    pA.style.display='none';pC.style.display='block';
  }else{
    tA.style.borderBottomColor='var(--lime)';tA.style.color='var(--text)';
    tC.style.borderBottomColor='transparent';tC.style.color='var(--dim)';
    pA.style.display='block';pC.style.display='none';
  }
}

async function loadTeamMembers(){
  var listEl=document.getElementById('teamMembersList');
  if(!listEl)return;
  var {data,error}=await sb.from('firm_members')
    .select('user_id,role,credit_limit_monthly,joined_at')
    .eq('firm_id',currentFirmId)
    .not('joined_at','is',null);
  // Filtra fora gestores — mostra só assessores
  var assessores=(data||[]).filter(function(m){return m.role!=='manager';});
  var countEl=document.getElementById('teamAssessoresCount');
  if(countEl)countEl.textContent=assessores.length||'';
  if(error||!assessores.length){
    listEl.innerHTML='<div style="padding:16px;text-align:center;color:var(--dim);font-size:.78rem">Nenhum assessor vinculado ainda.</div>';
    return;
  }
  // Busca nomes separadamente (sem join FK)
  var userIds=assessores.map(function(m){return m.user_id;});
  var {data:profiles}=await sb.from('company_profiles').select('user_id,empresa_nome').in('user_id',userIds);
  var nomeMap={};
  (profiles||[]).forEach(function(p){if(p.empresa_nome)nomeMap[p.user_id]=p.empresa_nome;});
  // Buscar propostas por user
  var {data:props}=await sb.from('proposals').select('user_id').in('user_id',userIds);
  var propCount={};
  (props||[]).forEach(function(p){propCount[p.user_id]=(propCount[p.user_id]||0)+1;});
  listEl.innerHTML=assessores.map(function(m){
    var nome=nomeMap[m.user_id]||m.user_id.slice(0,8)+'...';
    var inicial=nome.charAt(0).toUpperCase();
    var nProps=propCount[m.user_id]||0;
    return '<div style="display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:0;padding:8px 12px;border-bottom:1px solid var(--border2)">'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<div style="width:28px;height:28px;border-radius:50%;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:var(--lime)">'+inicial+'</div>'
      +'<div><div style="font-size:.78rem;color:var(--text);font-weight:600">'+nome+'</div>'
      +'<div style="font-size:.68rem;color:var(--dim)">Assessor</div></div>'
      +'</div>'
      +'<div style="width:110px;text-align:center;font-size:.78rem;color:var(--muted)">'+nProps+' proposta'+(nProps!==1?'s':'')+'</div>'
      +'<div style="width:130px;display:flex;align-items:center;justify-content:center;gap:5px">'
      +'<input type="number" min="0" step="1" value="'+m.credit_limit_monthly+'" onchange="updateMemberLimit(\''+m.user_id+'\',this.value)" style="width:55px;padding:4px 6px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--f);font-size:.75rem;text-align:center"><span style="font-size:.68rem;color:var(--dim)">cr</span>'
      +'</div>'
      +'</div>';
  }).join('');
}

async function loadTeamInvites(){
  var listEl=document.getElementById('teamInvitesList');
  if(!listEl)return;
  var {data,error}=await sb.from('invites')
    .select('id,token,expires_at,created_at')
    .eq('firm_id',currentFirmId)
    .is('used_at',null)
    .order('created_at',{ascending:false});
  var countEl=document.getElementById('teamConvitesCount');
  if(countEl)countEl.textContent=(data&&data.length)?data.length:'';
  if(error||!data||!data.length){
    listEl.innerHTML='<div style="padding:12px 0;text-align:center;color:var(--dim);font-size:.78rem">Nenhum convite pendente.</div>';
    return;
  }
  listEl.innerHTML=data.map(function(inv){
    var exp=new Date(inv.expires_at);
    var diffH=Math.round((exp-new Date())/3600000);
    var expLabel=diffH>24?Math.round(diffH/24)+'d':diffH+'h';
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border2)">'
      +'<div style="flex:1;font-size:.72rem;color:var(--muted);font-family:monospace">'+inv.token.slice(0,20)+'...</div>'
      +'<div style="font-size:.7rem;color:var(--dim);white-space:nowrap">expira em '+expLabel+'</div>'
      +'<button onclick="revokeInvite(\''+inv.id+'\')" style="padding:3px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;color:var(--dim);font-size:.7rem;cursor:pointer;font-family:var(--f)">Revogar</button>'
      +'</div>';
  }).join('');
}

async function loadFirmMembers(){
  var listEl=document.getElementById('firmMembersList');
  if(!listEl)return;
  var {data,error}=await sb.from('firm_members')
    .select('user_id,role,credit_limit_monthly,joined_at')
    .eq('firm_id',currentFirmId)
    .not('joined_at','is',null);
  if(error||!data||!data.length){
    listEl.innerHTML='<div style="font-size:.78rem;color:var(--dim);padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center">Nenhum assessor vinculado ainda.</div>';
    return;
  }
  var userIds=data.map(function(m){return m.user_id;});
  var {data:props}=await sb.from('proposals').select('user_id').in('user_id',userIds);
  var propCount={};
  (props||[]).forEach(function(p){propCount[p.user_id]=(propCount[p.user_id]||0)+1;});
  listEl.innerHTML=data.map(function(m){
    var label=m.user_id===supabaseUserId?' (você)':'';
    var nome=m.user_id.slice(0,8)+'...';
    var nProps=propCount[m.user_id]||0;
    var isGestor=m.role==='manager';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg2);border-radius:var(--r);border:1px solid var(--border)">'
      +'<div style="width:28px;height:28px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:'+(isGestor?'var(--gold)':'var(--lime)')+'">'+m.role.charAt(0).toUpperCase()+'</div>'
      +'<div style="flex:1"><div style="font-size:.78rem;color:var(--text);font-weight:600">'+nome+label+'</div>'
      +'<div style="font-size:.68rem;color:var(--dim)">'+(isGestor?'Gestor':'Assessor')+' · '+nProps+' proposta'+(nProps!==1?'s':'')+'</div></div>'
      +(!isGestor?'<input type="number" min="0" step="1" value="'+m.credit_limit_monthly+'" onchange="updateMemberLimit(\''+m.user_id+'\',this.value)" style="width:52px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:var(--f);font-size:.75rem;text-align:center"><span style="font-size:.68rem;color:var(--dim)">cr</span>':'')
      +'</div>';
  }).join('');
}

async function loadFirmInvites(){
  var listEl=document.getElementById('firmInvitesList');
  if(!listEl)return;
  var {data,error}=await sb.from('invites')
    .select('id,token,expires_at,created_at')
    .eq('firm_id',currentFirmId)
    .is('used_at',null)
    .order('created_at',{ascending:false});
  if(error||!data||!data.length){
    listEl.innerHTML='<div style="font-size:.78rem;color:var(--dim);padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center">Nenhum convite pendente</div>';
    return;
  }
  listEl.innerHTML=data.map(function(inv){
    var exp=new Date(inv.expires_at);
    var diffH=Math.round((exp-new Date())/3600000);
    var expLabel=diffH>24?Math.round(diffH/24)+'d':diffH+'h';
    return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg2);border-radius:var(--r);border:1px solid var(--border)">'
      +'<div style="flex:1;font-size:.72rem;color:var(--muted);font-family:monospace">'+inv.token.slice(0,20)+'...</div>'
      +'<div style="font-size:.7rem;color:var(--dim);white-space:nowrap">expira em '+expLabel+'</div>'
      +'<button onclick="revokeInvite(\''+inv.id+'\')" style="padding:3px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;color:var(--dim);font-size:.7rem;cursor:pointer;font-family:var(--f)">Revogar</button>'
      +'</div>';
  }).join('');
}

async function generateInviteLink(ctx){
  if(!currentFirmId)return;
  var isModal=ctx==='modal';
  var btnId=isModal?'modalBtnGenInvite':'btnGenInvite';
  var fieldId=isModal?'modalInviteLinkField':'inviteLinkField';
  var btn=document.getElementById(btnId);
  btn.disabled=true;btn.textContent='Gerando...';
  var {data,error}=await sb.from('invites').insert({firm_id:currentFirmId,role:'advisor'}).select().maybeSingle();
  btn.disabled=false;btn.textContent=isModal?'Gerar link':'+ Gerar link';
  if(error||!data){showToast('Erro ao gerar convite.','error');return;}
  var link=window.location.origin+window.location.pathname+'?invite='+data.token;
  var field=document.getElementById(fieldId);
  if(field)field.value=link;
  if(!isModal){
    document.getElementById('teamInviteLink').style.display='block';
    loadTeamInvites();
  } else {
    var copyBtn=document.getElementById('modalBtnCopyInvite');
    if(copyBtn)copyBtn.style.display='inline-block';
    loadFirmInvites();
  }
}

function copyInviteLink(ctx){
  var isModal=ctx==='modal';
  var field=document.getElementById(isModal?'modalInviteLinkField':'inviteLinkField');
  var btn=document.getElementById(isModal?'modalBtnCopyInvite':'btnCopyInvite');
  if(field){field.select();document.execCommand('copy');}
  if(btn){btn.textContent='Copiado ✓';setTimeout(function(){btn.textContent='Copiar';},2000);}
}

async function revokeInvite(inviteId){
  showConfirmModal('Revogar convite','Tem certeza? O assessor não poderá mais usar este link.',async function(){
    await sb.from('invites').update({used_at:new Date().toISOString()}).eq('id',inviteId);
    loadTeamInvites();
  });
}

async function updateMemberLimit(userId,val){
  var limit=parseInt(val)||0;
  await sb.from('firm_members').update({credit_limit_monthly:limit}).eq('firm_id',currentFirmId).eq('user_id',userId);
}

// ── PROSPECTS ─────────────────────────────────────────────────────────────────
// ⬇ Moved to js/prospects.js


// ── MODAL NOVO PROSPECT ───────────────────────────────────────────────────────
function openNewProspectModal(){
  document.getElementById('pmNome').value='';
  document.getElementById('pmEmail').value='';
  document.getElementById('pmTelefone').value='';
  document.getElementById('pmProf').value='';
  document.getElementById('pmIdade').value='';
  document.getElementById('pmPat').value='';
  document.getElementById('pmPerfil').value='';
  document.getElementById('pmObj').value='';
  document.getElementById('pmHorizonte').value='';
  document.getElementById('pmError').style.display='none';
  document.getElementById('prospectModal').style.display='flex';
}

function closeProspectModal(){
  document.getElementById('prospectModal').style.display='none';
}

function maskPmPat(el){
  var v=el.value.replace(/\D/g,'');
  if(!v){el.value='';return;}
  el.value=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(parseInt(v));
}

async function saveProspect(){
  var nome=document.getElementById('pmNome').value.trim();
  if(!nome){
    var e=document.getElementById('pmError');
    e.textContent='Nome é obrigatório.';e.style.display='block';return;
  }
  var btn=document.getElementById('pmSaveBtn');
  btn.disabled=true;btn.textContent='Salvando...';
  var patRaw=document.getElementById('pmPat').value.replace(/\D/g,'');
  var payload={
    assessor_id:supabaseUserId,
    firm_id:currentFirmId||null,
    nome:nome,
    email:document.getElementById('pmEmail').value.trim()||null,
    telefone:document.getElementById('pmTelefone').value.trim()||null,
    profissao:document.getElementById('pmProf').value.trim()||null,
    idade:parseInt(document.getElementById('pmIdade').value)||null,
    patrimonio_estimado:patRaw?parseInt(patRaw):null,
    perfil_risco:document.getElementById('pmPerfil').value||null,
    objetivo:document.getElementById('pmObj').value||null,
    horizonte:document.getElementById('pmHorizonte').value||null,
    status:'prospect_criado'
  };
  var {data,error}=await sb.from('prospects').insert(payload).select().maybeSingle();
  btn.disabled=false;btn.textContent='Salvar prospect';
  if(error){
    var e=document.getElementById('pmError');
    e.textContent='Erro ao salvar: '+error.message;e.style.display='block';return;
  }
  AppState.prospects.all.unshift(data);
  closeProspectModal();
  loadProspectsSelector();
  openProspectDetail(data.id);
}

// ── TRANSFERÊNCIA DE PROSPECT ────────────────────────────────────────────────

var _firmMembersCache = null;

async function getFirmMembers(){
  if(_firmMembersCache)return _firmMembersCache;
  if(!currentFirmId)return[];
  var {data}=await sb.from('firm_members')
    .select('user_id,role')
    .eq('firm_id',currentFirmId)
    .not('joined_at','is',null);
  var members=data||[];
  // Busca nomes separadamente
  if(members.length){
    var ids=members.map(function(m){return m.user_id;});
    var {data:profiles}=await sb.from('company_profiles').select('user_id,empresa_nome').in('user_id',ids);
    var nomeMap={};
    (profiles||[]).forEach(function(p){if(p.empresa_nome)nomeMap[p.user_id]=p.empresa_nome;});
    members=members.map(function(m){
      return Object.assign({},m,{company_profiles:{empresa_nome:nomeMap[m.user_id]||null}});
    });
  }
  _firmMembersCache=members;
  return _firmMembersCache;
}

async function openTransferModal(){
  var id=AppState.prospects.currentId;
  if(!id)return;
  var p=AppState.prospects.all.find(function(x){return x.id===id;});
  if(!p)return;
  // Popula select de assessores (exceto o atual)
  var members=await getFirmMembers();
  var sel=document.getElementById('transferSelect');
  sel.innerHTML='<option value="">Selecione o assessor...</option>';
  members.forEach(function(m){
    if(m.user_id===p.assessor_id)return; // exclui o atual
    var nome=m.company_profiles&&m.company_profiles.empresa_nome
      ?m.company_profiles.empresa_nome
      :m.user_id.substring(0,8);
    var opt=document.createElement('option');
    opt.value=m.user_id;
    opt.textContent=nome+(m.role==='manager'?' (gestor)':'');
    sel.appendChild(opt);
  });
  document.getElementById('transferMotivo').value='';
  document.getElementById('transferError').style.display='none';
  document.getElementById('transferModal').style.display='flex';
}

function closeTransferModal(){
  document.getElementById('transferModal').style.display='none';
}

async function confirmTransfer(){
  var toUserId=document.getElementById('transferSelect').value;
  var motivo=document.getElementById('transferMotivo').value.trim();
  var errEl=document.getElementById('transferError');
  if(!toUserId){errEl.textContent='Selecione o assessor de destino.';errEl.style.display='block';return;}
  var id=AppState.prospects.currentId;
  if(!id)return;
  var p=AppState.prospects.all.find(function(x){return x.id===id;});
  if(!p)return;
  var btn=document.getElementById('transferBtn');
  btn.disabled=true;btn.textContent='Transferindo...';
  // Atualiza assessor_id no prospect
  var {error}=await sb.from('prospects').update({assessor_id:toUserId}).eq('id',id);
  if(error){errEl.textContent='Erro: '+error.message;errEl.style.display='block';btn.disabled=false;btn.textContent='Confirmar transferência';return;}
  // Registra no log
  await sb.from('transfer_logs').insert({
    prospect_id:id,
    from_user_id:p.assessor_id,
    to_user_id:toUserId,
    transferred_by:supabaseUserId,
    motivo:motivo||null
  });
  // Atualiza cache
  p.assessor_id=toUserId;
  closeTransferModal();
  showToast('Prospect transferido com sucesso.','success');
  // Recarrega histórico e barra
  var members=await getFirmMembers();
  var m=members.find(function(x){return x.user_id===toUserId;});
  var novoNome=m&&m.company_profiles&&m.company_profiles.empresa_nome?m.company_profiles.empresa_nome:toUserId.substring(0,8);
  document.getElementById('pdManagerAssessorNome').textContent='Responsável: '+novoNome;
  loadTransferHistory(id);
  btn.disabled=false;btn.textContent='Confirmar transferência';
}

async function loadTransferHistory(prospectId){
  var body=document.getElementById('pdHistoricoBody');
  if(!body)return;
  body.innerHTML='<div style="padding:10px 16px;font-size:.75rem;color:var(--dim)">Carregando...</div>';
  var {data,error}=await sb.from('transfer_logs')
    .select('*').eq('prospect_id',prospectId).order('created_at',{ascending:false});
  if(error||!data||!data.length){
    body.innerHTML='<div style="padding:10px 16px;font-size:.75rem;color:var(--dim)">Nenhuma transferência registrada.</div>';
    return;
  }
  var members=await getFirmMembers();
  function getNome(uid){
    var m=members.find(function(x){return x.user_id===uid;});
    return m&&m.company_profiles&&m.company_profiles.empresa_nome?m.company_profiles.empresa_nome:uid.substring(0,8);
  }
  body.innerHTML='<div style="padding:4px 16px 8px">'+data.map(function(t){
    var dt=new Date(t.created_at).toLocaleDateString('pt-BR');
    return '<div class="pd-history-item">'
      +'<span class="pd-history-arrow">↔</span>'
      +'<div><div>'+getNome(t.from_user_id)+' → '+getNome(t.to_user_id)+'</div>'
      +'<div class="pd-history-meta">'+dt+(t.motivo?' · '+t.motivo:'')+(t.transferred_by?' · por '+getNome(t.transferred_by):'')+'</div>'
      +'</div>'
      +'</div>';
  }).join('')+'</div>';
}

var _confirmCallback=null;
function showConfirmModal(title,msg,onConfirm,okLabel){
  document.getElementById('cmTitle').textContent=title||'Confirmar';
  document.getElementById('cmMsg').textContent=msg||'';
  document.getElementById('cmOkBtn').textContent=okLabel||'Confirmar';
  _confirmCallback=onConfirm||null;
  document.getElementById('captorConfirmModal').style.display='flex';
}
function captorConfirmOk(){
  document.getElementById('captorConfirmModal').style.display='none';
  if(_confirmCallback)_confirmCallback();
  _confirmCallback=null;
}
function captorConfirmCancel(){
  document.getElementById('captorConfirmModal').style.display='none';
  _confirmCallback=null;
}

// ── FIM CAPTOR TEAMS ──────────────────────────────────────────────────────────
