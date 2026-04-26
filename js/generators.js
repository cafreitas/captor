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
