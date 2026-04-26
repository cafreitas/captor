/**
 * CAPTOR — Módulo de Autenticação (auth.js)
 * Responsável por: Login, Signup, Logout, Reset Password, Sessões
 * 
 * Dependências externas:
 * - sb (Supabase client)
 * - initSliders(), loadCredits(), updateDash(), loadFirmRole(), loadEmpresaData()
 * - loadProspectsSelector(), initOnboarding(), showTab()
 * - empresaToSlug()
 * - currentUserIsManager (variável global)
 */

// ── VARIÁVEIS GLOBAIS ──
var authMode = 'login'; // 'login', 'signup', ou 'manager'
var supabaseUserId = null;
var user = null;
var pendingInviteToken = null;

// ── TROCAR ABA (Login / Signup / Manager) ──
function switchAuthTab(mode) {
  authMode = mode;
  var isLogin = mode === 'login';
  var isManager = mode === 'manager';
  var isSignup = mode === 'signup';
  
  // Atualizar tabs
  document.getElementById('tabLogin').style.background = isLogin ? 'var(--lime)' : 'transparent';
  document.getElementById('tabLogin').style.color = isLogin ? '#1a1a1a' : 'var(--muted)';
  document.getElementById('tabSignup').style.background = isSignup ? 'var(--lime)' : 'transparent';
  document.getElementById('tabSignup').style.color = isSignup ? '#1a1a1a' : 'var(--muted)';
  document.getElementById('tabManager').style.background = isManager ? 'var(--lime)' : 'transparent';
  document.getElementById('tabManager').style.color = isManager ? '#1a1a1a' : 'var(--muted)';
  
  // Mostrar/ocultar campos
  document.getElementById('lPassConfirmWrap').style.display = isLogin ? 'none' : 'block';
  document.getElementById('lPass').autocomplete = isLogin ? 'current-password' : 'new-password';
  document.getElementById('lPass').name = isLogin ? 'password' : 'new-password';
  document.getElementById('lForgotWrap').style.display = isLogin ? 'block' : 'none';
  document.getElementById('lTermsWrap').style.display = isLogin ? 'none' : 'block';
  document.getElementById('lEmpresaWrap').style.display = isManager ? 'block' : 'none';
  document.getElementById('lEmpresaStatus').textContent = '';
  
  // Atualizar labels e botões
  document.getElementById('lBtn').textContent = isLogin ? 'Entrar' : isManager ? 'Criar Conta Empresarial' : 'Criar conta';
  document.getElementById('lTitle').textContent = isLogin ? 'Acesso à plataforma' : isManager ? 'Conta Empresarial' : 'Criar conta';
  document.getElementById('lSub').textContent = isLogin ? 'Entre com seu email para acessar a plataforma' : isManager ? 'Crie sua conta de gestor e cadastre sua empresa' : 'Preencha seus dados para começar';
  
  // Limpar mensagens
  document.getElementById('lError').style.display = 'none';
  document.getElementById('lSuccess').style.display = 'none';
}

// ── MOSTRAR/OCULTAR MENSAGENS ──
function showAuthError(msg) {
  var el = document.getElementById('lError');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('lSuccess').style.display = 'none';
}

function showAuthSuccess(msg) {
  var el = document.getElementById('lSuccess');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('lError').style.display = 'none';
}

// ── TOAST (mensagem temporária) ──
function showLoginToast(msg) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e1e1e;border:1px solid var(--lime);border-radius:12px;padding:12px 22px;font-size:.84rem;font-weight:700;color:var(--lime);z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:fadein .3s ease;white-space:nowrap';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .4s';
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

// ── ENTRAR NO APP (após login bem-sucedido) ──
async function enterApp(session) {
  var email = session.user.email;
  supabaseUserId = session.user.id;
  user = email.split('@')[0].replace(/\./g, ' ');
  user = user.charAt(0).toUpperCase() + user.slice(1);
  
  // Mostrar app, ocultar login
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  
  // Atualizar UI com nome do usuário
  document.getElementById('unEl').textContent = user;
  document.getElementById('avEl').textContent = user.charAt(0).toUpperCase();
  
  // Inicializar componentes
  initSliders();
  initPdSliders();
  loadCredits();
  updateDash();
  await loadFirmRole();
  await loadEmpresaData();
  loadProspectsSelector();
  initOnboarding();
  
  // Ocultar botão "Novo prospect" para gestores
  if (currentUserIsManager) {
    var btn = document.getElementById('btnNovoProspect');
    if (btn) btn.style.display = 'none';
  }
  
  // Ir para aba Prospects
  var prospectsBtn = document.querySelector('.ntab[onclick*="prospects"]');
  if (prospectsBtn) showTab('prospects', prospectsBtn);
}

// ── LOGIN / SIGNUP ──
async function doAuth() {
  var email = document.getElementById('lEmail').value.trim();
  var pass = document.getElementById('lPass').value;
  
  if (!email || !pass) {
    showAuthError('Preencha email e senha.');
    return;
  }
  
  document.getElementById('lBtn').disabled = true;
  document.getElementById('lBtn').textContent = 'Aguarde...';
  
  try {
    if (authMode === 'login') {
      // LOGIN
      var { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      
      // Se havia convite pendente, aceitar após login
      if (pendingInviteToken) {
        await sb.rpc('accept_invite', { p_token: pendingInviteToken });
        pendingInviteToken = null;
      }
      
      enterApp(data.session);
      
    } else if (authMode === 'signup' || authMode === 'manager') {
      // SIGNUP / MANAGER
      var confirmPass = document.getElementById('lPassConfirm').value;
      if (pass !== confirmPass) {
        showAuthError('As senhas não coincidem.');
        return;
      }
      if (pass.length < 6) {
        showAuthError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (!document.getElementById('lTermsCheck').checked) {
        showAuthError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
        return;
      }
      
      if (authMode === 'manager') {
        var empresaNome = document.getElementById('lEmpresaNome').value.trim();
        if (!empresaNome) {
          showAuthError('Informe o nome da empresa.');
          return;
        }
        var slug = empresaToSlug(empresaNome);
        var { data: existing } = await sb.from('firms').select('id').eq('slug', slug).maybeSingle();
        if (existing) {
          showAuthError('Já existe uma empresa com esse nome. Tente outro.');
          return;
        }
        // Guardar nome para criar empresa após sessão ativa
        localStorage.setItem('captor_pending_empresa', empresaNome);
      }
      
      var { data, error } = await sb.auth.signUp({ email, password: pass });
      if (error) throw error;
      
      // Aceitar convite pendente se havia
      if (pendingInviteToken && data.session) {
        await sb.rpc('accept_invite', { p_token: pendingInviteToken });
        pendingInviteToken = null;
      }
      
      if (data.session) {
        enterApp(data.session);
      } else {
        showAuthSuccess('Conta criada! Verifique seu email para confirmar o cadastro.');
      }
    }
  } catch (e) {
    var msg = e.message || 'Erro desconhecido';
    if (msg.includes('Invalid login')) msg = 'Email ou senha incorretos.';
    if (msg.includes('already registered')) msg = 'Este email já possui uma conta. Faça login.';
    if (msg.includes('Email not confirmed')) msg = 'Confirme seu email antes de entrar.';
    showAuthError(msg);
  } finally {
    document.getElementById('lBtn').disabled = false;
    document.getElementById('lBtn').textContent = authMode === 'login' ? 'Entrar' : authMode === 'manager' ? 'Criar Conta Empresarial' : 'Criar conta';
  }
}

// ── LOGOUT ──
function confirmLogout() {
  var nome = document.getElementById('unEl').textContent || '';
  var msg = nome ? 'Olá, ' + nome + '! Deseja realmente sair da plataforma?' : 'Deseja realmente sair da plataforma?';
  if (confirm(msg)) doLogout();
}

async function doLogout() {
  await sb.auth.signOut();
  supabaseUserId = null;
  user = null;
  
  document.getElementById('app').style.display = 'none';
  document.getElementById('login').style.display = 'flex';
  document.getElementById('lEmail').value = '';
  document.getElementById('lPass').value = '';
  document.getElementById('lError').style.display = 'none';
  document.getElementById('lSuccess').style.display = 'none';
}

// ── REDEFINIR SENHA ──
function openResetPassword() {
  document.getElementById('resetModal').style.display = 'flex';
}

async function doResetPassword() {
  var pass = document.getElementById('resetPass').value;
  var confirm = document.getElementById('resetPassConfirm').value;
  var errEl = document.getElementById('resetError');
  errEl.style.display = 'none';
  
  if (pass.length < 6) {
    errEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
    errEl.style.display = 'block';
    return;
  }
  if (pass !== confirm) {
    errEl.textContent = 'As senhas não coincidem.';
    errEl.style.display = 'block';
    return;
  }
  
  var btn = document.getElementById('resetBtn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  
  var { error } = await sb.auth.updateUser({ password: pass });
  
  btn.disabled = false;
  btn.textContent = 'Salvar nova senha';
  
  if (error) {
    errEl.textContent = 'Erro: ' + error.message;
    errEl.style.display = 'block';
  } else {
    document.getElementById('resetModal').style.display = 'none';
    showLoginToast('✅ Senha redefinida! Faça login com a nova senha.');
    await sb.auth.signOut();
  }
}

// ── ESQUECI MINHA SENHA ──
async function openForgotPassword() {
  var email = document.getElementById('lEmail').value.trim();
  
  if (!email) {
    var input = prompt('Digite seu email para receber o link de redefinição de senha:');
    if (!input) return;
    email = input.trim();
  }
  if (!email) return;
  
  var btn = document.querySelector('[onclick="openForgotPassword()"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
  }
  
  var { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://cafreitas.github.io/captor/?reset=1'
  });
  
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Esqueci minha senha';
  }
  
  if (error) {
    showAuthError('Erro ao enviar email: ' + error.message);
  } else {
    showAuthSuccess('📬 Email enviado! Verifique sua caixa de entrada para redefinir a senha.');
  }
}

// ── INICIALIZAÇÃO ──

// Verificar sessão existente ao carregar
(async function() {
  var { data } = await sb.auth.getSession();
  if (data.session) enterApp(data.session);
})();

// Adicionar listener para Enter na senha (login)
document.addEventListener('DOMContentLoaded', function() {
  var lPass = document.getElementById('lPass');
  if (lPass) lPass.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doAuth();
  });
  
  // Detectar parâmetros de URL
  var params = new URLSearchParams(window.location.search);
  if (params.get('signup') === '1') {
    switchAuthTab('signup');
  }
  if (params.get('confirmed') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    setTimeout(function() {
      showLoginToast('✅ Email confirmado! Faça login para entrar.');
    }, 400);
  }
  if (params.get('reset') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    openResetPassword();
  }
  
  // Detectar convite na URL
  var inviteToken = params.get('invite');
  if (inviteToken) {
    pendingInviteToken = inviteToken;
    window.history.replaceState({}, '', window.location.pathname);
    (async function() {
      // Buscar nome da firma pelo token para exibir no banner
      var { data } = await sb.from('invites')
        .select('firm_id, firms(name)')
        .eq('token', inviteToken)
        .is('used_at', null)
        .maybeSingle();
      var banner = document.getElementById('inviteBanner');
      var bannerText = document.getElementById('inviteBannerText');
      if (data && data.firms) {
        bannerText.textContent = 'Você foi convidado para a empresa ' + data.firms.name + '. Faça login ou crie sua conta para aceitar.';
      } else {
        bannerText.textContent = 'Convite detectado. Faça login ou crie sua conta para aceitar.';
      }
      banner.style.display = 'flex';
    })();
  }
});
