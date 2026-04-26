/**
 * CAPTOR — Módulo de Geradores IA (generators.js)
 * Responsável por: Gerar propostas, R1, R2 e logar uso de API
 * 
 * Dependências externas:
 * - sb (Supabase client)
 * - supabaseUserId (do módulo de auth)
 * - getValidacaoData(), getSliderAlloc() (funções de validação)
 * - debitCredit() (do módulo de créditos)
 */

// ── CALCULAR CUSTO DE API ──
function calcularCustoApi(model,tokens_in,tokens_out){
  var pricing={'claude-sonnet-4-20250514':{in:3,out:15},'claude-opus-4-6':{in:15,out:75},'claude-haiku-4-5':{in:0.80,out:4}};
  var p=pricing[model]||pricing['claude-sonnet-4-20250514'];
  return(tokens_in*p.in/1000000)+(tokens_out*p.out/1000000);
}

// ── LOGAR USO DE API ──
async function logAiUsage(action_type,proposal_id,model_used,tokens_input,tokens_output,status){
  if(!supabaseUserId)return;
  try{
    var custo=calcularCustoApi(model_used,tokens_input,tokens_output);
    await sb.from('ai_usage_logs').insert({user_id:supabaseUserId,action_type:action_type,proposal_id:proposal_id||null,model:model_used,tokens_input:tokens_input,tokens_output:tokens_output,custo_usd:custo,timestamp:new Date().toISOString(),status:status||'success'});
  }catch(e){
    console.error('logAiUsage erro:',e);
  }
}

// ── GENERATE (RESTO ABAIXO) ──
// [Conteúdo da função generate() será inserido aqui]
// [Conteúdo de REGENERAR COM ANOTAÇÕES será inserido aqui]

  var p=pricing[model]||pricing['claude-sonnet-4-20250514'];
  return(tokens_in*p.in/1000000)+(tokens_out*p.out/1000000);
}
async function logAiUsage(action_type,proposal_id,model_used,tokens_input,tokens_output,status){
  if(!supabaseUserId)return;
  try{
    var custo=calcularCustoApi(model_used,tokens_input,tokens_output);
    await sb.from('ai_usage_logs').insert({user_id:supabaseUserId,action_type:action_type,proposal_id:proposal_id||null,model:model_used,tokens_input:tokens_input,tokens_output:tokens_output,custo_usd:custo,timestamp:new Date().toISOString(),status:status||'success'});
  }catch(e){
    console.error('logAiUsage erro:',e);
  }
}

// ── GENERATE ──
async function generate(){
  var vd=getValidacaoData();
  var nome=vd.nome;
  var pat=vd.pat;
  var prof=vd.prof;
  var idade=vd.idade;
  var perfil=vd.perfil;
  var obj=vd.obj;
  var ass=vd.ass;
  var gaps=vd.gaps;
  var ctx=vd.ctx;
  // Usa sliders da Anotações R1 se disponíveis (alocação confirmada na reunião), senão sidebar
  var currentAlloc=(function(){
    var r1sl=document.getElementById('r1_sl_0');
    if(r1sl){
      var a={};
      for(var i=0;i<9;i++){var s=document.getElementById('r1_sl_'+i);if(s&&parseInt(s.value))a[i]=parseInt(s.value);}
      return Object.keys(a).length?a:getSliderAlloc();
    }
    return getSliderAlloc();
  })();
  if(!nome||!pat||!prof||!idade||!perfil||!obj){
    var inVal=!!document.getElementById('r1_perfil_confirmado');
    var fields=[
      {id:inVal?'r1_prof':'fProf',val:prof,label:'Profissão'},
      {id:inVal?'r1_pat_confirmado':'fPat',val:pat,label:'Patrimônio'},
      {id:inVal?'r1_idade':'fIdade',val:idade,label:'Idade'},
      {id:inVal?'r1_perfil_confirmado':'fPerfil',val:perfil,label:'Perfil de risco'},
      {id:inVal?'r1_obj':'fObj',val:obj,label:'Objetivo'}
    ];
    var missing=[];
    fields.forEach(function(f){
      var el=document.getElementById(f.id);
      if(!f.val){
        missing.push(f.label);
        if(el){el.style.borderColor='#e05555';el.classList.add('field-error');}
      } else {
        if(el){el.style.borderColor='';el.classList.remove('field-error');}
      }
    });
    var r2ErrEl=document.getElementById('r2ValidationError');
    if(!r2ErrEl){
      r2ErrEl=document.createElement('div');
      r2ErrEl.id='r2ValidationError';
      r2ErrEl.className='captor-inline-error';
      document.getElementById('btnGen').parentNode.appendChild(r2ErrEl);
    }
    r2ErrEl.textContent='Preencha nas Anotações R1: '+missing.join(', ')+'.';
    r2ErrEl.style.display='block';
    if(inVal){
      var bv=document.getElementById('validacaoBloco');
      if(bv){
        var bvBody=bv.querySelector('.blkbody');
        if(bvBody&&!bvBody.classList.contains('open')){var bvHd=bv.querySelector('.blkhd');if(bvHd)bvHd.click();}
        bv.scrollIntoView({behavior:'smooth',block:'start'});
      }
    } else {expandSidebar();}
    return;
  }
  // Limpa highlights e erros inline
  ['r1_prof','r1_pat_confirmado','r1_idade','r1_perfil_confirmado','r1_obj','fNome','fPat','fProf','fIdade','fPerfil','fObj'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.style.borderColor='';el.classList.remove('field-error');}
  });
  var r2ErrEl=document.getElementById('r2ValidationError');
  if(r2ErrEl)r2ErrEl.style.display='none';
  document.getElementById('emptyState').style.display='none';
  document.getElementById('outArea').style.display='none';
  collapseSidebar();
  document.getElementById('loadingState').style.display='flex';
  var ldlabelEl=document.querySelector('.ldlabel');
  if(ldlabelEl)ldlabelEl.textContent='Gerando proposta R2...';
  var stepTexts=['Analisando diagnóstico R1','Construindo proposta personalizada','Montando slides','Calculando alocação ideal'];
  ['ss1','ss2','ss3','ss4'].forEach(function(id,i){
    var el=document.getElementById(id);
    if(el){var dot=el.querySelector('.lddot');el.innerHTML='';if(dot)el.appendChild(dot);el.appendChild(document.createTextNode(stepTexts[i]));}
  });
  document.getElementById('btnGen').disabled=true;
  proposalApproved = false;
  proposalDraftHash = null;
  var pdView=document.getElementById('prospectDetailView');
  if(pdView&&pdView.style.display!=='none')pdView.scrollIntoView({behavior:'smooth',block:'start'});

  // Debitar crédito antes de chamar a IA
  try{ await debitCredit('geracao', nome); }
  catch(e){
    document.getElementById('loadingState').style.display='none';
    document.getElementById('emptyState').style.display='flex';
    document.getElementById('btnGen').disabled=false;
    showToast(e.message,'error');
    return;
  }

  var ids=['ss1','ss2','ss3','ss4'];
  ids.forEach(function(id){document.getElementById(id).className='ldstep';});
  var si=0;
  var iv=setInterval(function(){
    if(si>0)document.getElementById(ids[si-1]).className='ldstep done';
    if(si<ids.length){document.getElementById(ids[si]).className='ldstep active';si++;}
    else clearInterval(iv);
  },950);

  var patFmt=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(pat);

  var currentAllocStr = '';
  if(currentAlloc){
    currentAllocStr = Object.keys(currentAlloc).map(function(k){
      return k+': '+currentAlloc[k]+'%';
    }).filter(function(s){return s.indexOf(': 0%')===-1;}).join(', ');
  }

  var empresaPrompt=buildEmpresaPrompt();
  var nomeEmpresa=(empresaData&&empresaData.empresa_nome)?empresaData.empresa_nome:'Captor Investimentos';
  var allocRuleStr=buildAllocPrompt(perfil);
  // Buscar r1_notes fresco do banco para garantir dados atualizados
  var r1NotesCtx='';
  if(AppState.prospects.currentId){
    var {data:freshProspect}=await sb.from('prospects')
      .select('r1_notes')
      .eq('id',AppState.prospects.currentId)
      .maybeSingle();
    if(freshProspect&&freshProspect.r1_notes){
      // Atualizar cache local
      var prospectAtual=AppState.prospects.all.find(function(x){return x.id===AppState.prospects.currentId;});
      if(prospectAtual)prospectAtual.r1_notes=freshProspect.r1_notes;
      r1NotesCtx=buildR1NotesContext(freshProspect.r1_notes);
    }
  }

  var prompt=(empresaPrompt
    ? 'Você é assessor sênior da '+nomeEmpresa+'. '+empresaPrompt
    : 'Você é assessor sênior da Captor Investimentos (XP credenciada, +R$12bi custódia, +15mil clientes, Nº1 NPS 2024). Portfólio completo: investimentos, renda variável, crédito, câmbio, seguros, wealth planning, offshore, Captor Family Office, M&A.'
  )+'\n\n'
    +'MÉTODO DE ATENDIMENTO:\n'
    +'Esta assessoria usa o método R1/R2. A R1 (reunião de diagnóstico) já foi realizada. Agora é a R2 — reunião de apresentação da proposta. '
    +'Na R2 o assessor apresenta a alocação recomendada e explica por que ela faz sentido para o perfil e momento de vida deste cliente. '
    +'O cliente pode precisar de mais de uma R2 antes de fechar — não há pressão para fechamento imediato.\n\n'
    +(r1NotesCtx
      ? 'O QUE FOI APRENDIDO NA R1 (use para personalizar a apresentação):\n'+r1NotesCtx
      : ''
    )
    +'CLIENTE:\n'
    +'Nome: '+nome+' | Patrimônio: '+patFmt+' | Profissão: '+prof+' | Idade: '+idade+' anos | Perfil: '+perfil+' | Objetivo: '+obj+' | Assessoria atual: '+(ass||'não informado')+' | Contexto: '+(ctx||'nenhum')+'\n'
    +'Problemas CONFIRMADOS na gestão atual: '+(gaps||'nenhum informado')+'\n'
    +(currentAllocStr ? 'Alocação ATUAL do cliente: '+currentAllocStr+'\n' : '')
    +'\nESTRUTURA DO ROTEIRO R2 — gere exatamente 6 etapas nesta ordem:\n'
    +'1. Abertura: retome o diagnóstico da R1 ("na nossa conversa você me contou que...") para mostrar que você ouviu e lembrou\n'
    +'2. Apresentação da alocação: explique cada classe de ativo presente na carteira sugerida\n'
    +'3. Por que faz sentido para você: conecte cada decisão de alocação ao perfil de risco, objetivo e momento de vida deste cliente específico\n'
    +'4. Projeção patrimonial: mostre o potencial desta carteira no horizonte de tempo declarado\n'
    +'5. Espaço para dúvidas: aborde proativamente as objeções levantadas na R1'+(r1NotesCtx?' (listadas acima)':'')+', com argumentos preparados\n'
    +'6. Encerramento: sem pressão — deixe claro que o cliente pode levar o tempo que precisar e que você está disponível para uma próxima R2 se necessário\n\n'
    +'REGRA CRÍTICA SOBRE GAPS E ARGUMENTOS: '
    +(gaps
      ? 'Use APENAS os problemas confirmados acima como base para argumentos e diagnóstico. Não invente outros gaps além dos listados.'
      : 'Não há problemas confirmados. NUNCA afirme que existem gaps ou problemas na gestão atual do cliente. Nos argumentos, use linguagem de INVESTIGAÇÃO ("vale entender se...", "dependendo do que encontrarmos..."). Foque nos benefícios da Captor, não em críticas à situação atual.'
    )+'\n\n'
    +'REGRA DE ALOCAÇÃO OFICIAL CAPTOR para perfil '+perfil+': '+allocRuleStr+'\n'
    +(currentAllocStr
      ? 'O cliente JÁ TEM a alocação informada acima. Sua sugestão deve mostrar a REALOCAÇÃO necessária. No campo "alocacao" do JSON, coloque a alocação SUGERIDA (destino), não a atual. Nos argumentos e slides, mencione as principais mudanças propostas e por que fazem sentido.\n'
      : 'Para o campo "alocacao", escolha percentuais DENTRO das faixas acima. Os percentuais devem somar exatamente 100%.\n'
    )
    +'Use os mesmos 9 labels de classes de ativos.\n'
    +'IMPORTANTE: títulos dos slides em sentence case. Nunca use maiúsculas no título.\n'
    +'IMPORTANTE: nunca use a palavra "rapport". Substitua por: conexão, confiança, proximidade, abertura ou sintonia.\n'
    +'IMPORTANTE: os percentuais nos textos DEVEM ser EXATAMENTE os mesmos do campo alocacao.data.\n\n'
    +'Responda SOMENTE JSON válido, sem markdown, sem texto antes ou depois:\n'
    +'{"resumoPerfil":"2-3 frases dirigidas ao cliente na 2ª pessoa (\'Você é...\'), tom consultivo e humano","roteiro":[{"titulo":"...","descricao":"...","dica":"...","minutos":5}],"perguntas":[{"pergunta":"...","motivo":"..."}],"argumentos":[{"titulo":"...","corpo":"texto na 2ª pessoa dirigido ao cliente (\'Você se beneficia de...\')","frase_gancho":"..."}],"slides":[{"numero":1,"rotulo":"Capa","titulo":"Crescimento patrimonial para [nome]","conteudo":"...","visual":"..."},{"numero":4,"rotulo":"Estratégia Captor","titulo":"Nossa proposta diferenciada","conteudo":"...","visual":"..."},{"numero":5,"rotulo":"Resultado Projetado","titulo":"Carteira otimizada","conteudo":"...","visual":"..."}],"alocacao":{"labels":["Pós Fixado","Inflação","Prefixado","Multimercados","Renda Variável BR","FII","Alternativos","RF Global","RV Global"],"data":[70,10,5,5,2,0,0,3,5]}}\n\n'
    +'Gere: 6 etapas no roteiro (estrutura acima), 3 perguntas de verificação de alinhamento (não de diagnóstico — checar se o cliente entendeu e se algo mudou), 3 argumentos, 6 slides (Capa / Contexto do cliente / Por que esta alocação / Estratégia Captor / Resultado Projetado / Próximos Passos). Seja específico para este cliente.';

  try{
    var resp=await fetch(PROXY_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,messages:[{role:'user',content:prompt}]})
    });
    if(!resp.ok){
      var err=await resp.json().catch(function(){return{};});
      var msg=(err.error&&err.error.message?err.error.message:resp.statusText);
      throw new Error('HTTP '+resp.status+': '+msg);
    }
    var d=await resp.json();
    if(d && d.usage) await logAiUsage('gerar_r1',null,'claude-sonnet-4-20250514',d.usage.input_tokens,d.usage.output_tokens,'success');
    if(!d || !d.content){
      throw new Error('Resposta vazia da IA. Verifique os créditos do proxy Anthropic e tente novamente.');
    }
    var raw=d.content.map(function(c){return c.text||'';}).join('');
    var parsed;
    try{
      parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());
    }catch(parseErr){
      throw new Error('Resposta da IA não é JSON válido. Trecho: '+raw.substring(0,200));
    }

    clearInterval(iv);
    ids.forEach(function(id){document.getElementById(id).className='ldstep done';});

    hist.unshift({nome:nome,pat:parseInt(pat),perfil:perfil,prof:prof,analista:user,data:new Date().toLocaleDateString('pt-BR'),status:'Pendente'});
    localStorage.setItem('captor_hist',JSON.stringify(hist.slice(0,50)));

    // Salvar perfil_validado no prospect
    if(AppState.prospects.currentId){
      var pv={nome:nome,pat:pat,prof:prof,idade:idade,perfil:perfil,obj:obj,horizonte:vd.horizonte,ass:ass,gaps:gaps,ctx:ctx};
      sb.from('prospects').update({perfil_validado:pv}).eq('id',AppState.prospects.currentId).then(function(){});
    }

    setTimeout(function(){
      document.getElementById('loadingState').style.display='none';
      window._lastMeta={nome:nome,pat:pat,perfil:perfil,prof:prof,obj:obj,idade:idade,currentAlloc:currentAlloc};
      window._lastOutput=parsed;
      renderOutput(nome,patFmt,parsed,window._lastMeta);
      document.getElementById('btnGen').disabled=false;
      var out=document.getElementById('outArea');
      if(out)setTimeout(function(){out.scrollIntoView({behavior:'smooth',block:'start'});},100);
    },300);
  }catch(e){
    clearInterval(iv);
    document.getElementById('loadingState').style.display='none';
    document.getElementById('emptyState').style.display='flex';
    document.getElementById('btnGen').disabled=false;
    showToast('Erro ao chamar a IA. Verifique sua conexão e tente novamente.','error');
  }
}

// ── REGENERAR COM ANOTAÇÕES ──
function checkRegenBtn(){
  var notas=Array.prototype.slice.call(document.querySelectorAll('.pq-nota'));
  var temNota=false;
  notas.forEach(function(n){if(n.value.trim())temNota=true;});
  var wrap=document.getElementById('regenWrap');
  if(wrap)wrap.style.display=temNota?'block':'none';
}

async function regenerate(){
  var notas=Array.prototype.slice.call(document.querySelectorAll('.pq-nota'));
  var notasTexto=[];
  notas.forEach(function(n,i){if(n.value.trim())notasTexto.push('P'+(i+1)+': '+n.value.trim());});
  if(!notasTexto.length)return;

  var meta=window._lastMeta;
  if(!meta){showToast('Gere uma análise primeiro.','error');return;}

  document.getElementById('btnRegen').disabled=true;
  document.getElementById('btnRegen').textContent='Regenerando...';

  // Debitar crédito
  try{ await debitCredit('regeneracao', meta.nome); }
  catch(e){ alert(e.message); document.getElementById('btnRegen').disabled=false; document.getElementById('btnRegen').textContent='Regenerar com anotações'; return; }

  var nome=meta.nome,pat=meta.pat,prof=meta.prof,idade=meta.idade,perfil=meta.perfil,obj=meta.obj;
  var patFmt=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(pat);

  var prompt='Você é assessor sênior da Captor Investimentos. Refine o roteiro consultivo para '+nome+' ('+prof+', '+idade+' anos, patrimônio '+patFmt+', perfil '+perfil+', objetivo: '+obj+') com base nas respostas coletadas nas perguntas de diagnóstico:\n\n'
    +notasTexto.join('\n')
    +'\n\nUsando essas informações concretas do cliente, regenere perguntas de diagnóstico mais aprofundadas, argumentos consultivos mais personalizados e slides mais relevantes.\n'
    +'IMPORTANTE: títulos dos slides em sentence case. Nunca use maiúsculas no título.\n'
    +'IMPORTANTE: nunca use a palavra "rapport" em nenhum texto gerado. Substitua por: conexão, confiança, proximidade, abertura ou sintonia.\n'
    +'IMPORTANTE: os percentuais citados nos textos DEVEM ser EXATAMENTE os mesmos definidos no campo alocacao.data. Nunca mencione percentuais que não estejam nesse campo.\n\n'
    +'Responda SOMENTE JSON válido, sem markdown:\n'
    +'{"resumoPerfil":"2-3 frases atualizadas","roteiro":[{"titulo":"...","descricao":"...","dica":"...","minutos":5}],"perguntas":[{"pergunta":"...","motivo":"..."}],"argumentos":[{"titulo":"...","corpo":"...","frase_gancho":"..."}],"slides":[{"numero":1,"rotulo":"Capa","titulo":"Crescimento patrimonial para [nome]","conteudo":"...","visual":"..."},{"numero":5,"rotulo":"Resultado Projetado","titulo":"Carteira otimizada","conteudo":"...","visual":"..."}],"alocacao":{"labels":["Pós Fixado","Inflação","Prefixado","Multimercados","Renda Variável BR","FII","Alternativos","RF Global","RV Global"],"data":[70,10,5,5,2,0,0,3,5]}}\n\n'
    +'Gere exatamente: 6 etapas, 5 perguntas, 3 argumentos, 6 slides. Seja específico para o que o cliente revelou.';

  try{
    var resp=await fetch(PROXY_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:4000,messages:[{role:'user',content:prompt}]})
    });
    if(!resp.ok){var err=await resp.json().catch(function(){return{};});throw new Error('API '+resp.status+': '+(err.error&&err.error.message?err.error.message:resp.statusText));}
    var d=await resp.json();
    if(d && d.usage) await logAiUsage('regen_r1',null,'claude-sonnet-4-20250514',d.usage.input_tokens,d.usage.output_tokens,'success');
    if(!d || !d.content){
      throw new Error('Resposta vazia da IA. Tente novamente.');
    }
    var raw=d.content.map(function(c){return c.text||'';}).join('');
    var parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());
    renderOutput(nome,patFmt,parsed,meta);
  }catch(e){
    showToast('Erro ao regenerar: '+e.message,'error');
  }finally{
    var btn=document.getElementById('btnRegen');
    if(btn){btn.disabled=false;btn.innerHTML='<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M2 10.5V7h3.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> Regenerar com anotações';}
  }
}

