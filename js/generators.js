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
  
  // Mostrar loader
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('outArea').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  var ldlabelEl = document.querySelector('.ldlabel');
  if (ldlabelEl) ldlabelEl.textContent = 'Gerando roteiro R1...';
  document.getElementById('btnGenR1').disabled = true;
  
  // Salvar prospect com status r1_iniciada
  await upsertProspect('r1_iniciada');
  
  // Snapshot do perfil
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
    var resp = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY},
      body: JSON.stringify({model: 'claude-sonnet-4-20250514', max_tokens: 3000, messages: [{role: 'user', content: prompt}]})
    });
    var rd = await resp.json();
    if (rd && rd.usage) await logAiUsage('gerar_r1', null, 'claude-sonnet-4-20250514', rd.usage.input_tokens, rd.usage.output_tokens, 'success');
    var txt = (rd.content && rd.content[0] && rd.content[0].text) || '';
    var clean = txt.replace(/```json|```/g, '').trim();
    var r1data = JSON.parse(clean);
    renderR1Output(nome, patFmt, r1data);
    AppState.prospects.r1Generated = true;
    
    // Salvar roteiro no prospect
    if (AppState.prospects.currentId) {
      await sb.from('prospects').update({roteiro_r1: r1data}).eq('id', AppState.prospects.currentId);
    }
    
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
