/**
 * CAPTOR — Variáveis Globais e Constantes (globals.js)
 * Carregado ANTES de todos os módulos
 * Responsável por: Definir estado global, credenciais, constantes
 */

// ────────────────────────────────────────────────────────────────
// SUPABASE CONFIGURATION
// ────────────────────────────────────────────────────────────────
var PROXY_URL = 'https://fllkczocfcbrfsyhxelg.supabase.co/functions/v1/anthropic-proxy';
var SUPABASE_URL = 'https://fllkczocfcbrfsyhxelg.supabase.co';
var SUPABASE_KEY = 'sb_publishable_U2pVXIhyNH3s085cUjAmrA_PkeNP4P7';

// Initialize Supabase client (after CDN loads)
var sb = null;
if (typeof supabase !== 'undefined') {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ────────────────────────────────────────────────────────────────
// APP METADATA
// ────────────────────────────────────────────────────────────────
var CAPTOR_VERSION = 'v6.3.1';

// ────────────────────────────────────────────────────────────────
// AUTH STATE
// ────────────────────────────────────────────────────────────────
var supabaseUserId = null;
var user = null;
var currentUserIsManager = false;
var pendingInviteToken = null;

// ────────────────────────────────────────────────────────────────
// LOCALSTORAGE HISTORY
// ────────────────────────────────────────────────────────────────
var hist = JSON.parse(localStorage.getItem('captor_hist') || '[]');

// ────────────────────────────────────────────────────────────────
// CREDITS & BILLING
// ────────────────────────────────────────────────────────────────
var userCredits = null;
var CREDIT_COSTS = {
  geracao: 0.4,
  regeneracao: 0.4,
  extracao_pdf: 0.2
};

// ────────────────────────────────────────────────────────────────
// COMPANY PROFILE (modal state during edit)
// ────────────────────────────────────────────────────────────────
var empresaData = null;
var empresaStep = 0;
var uploadedFile = null;
var extractedColors = [];

// ────────────────────────────────────────────────────────────────
// ALLOCATION PROFILES & DEFAULTS
// ────────────────────────────────────────────────────────────────
var ALLOC_PERFIS = ['Conservador', 'Moderado', 'Arrojado', 'Agressivo'];

var ALLOC_DEFAULT = {
  Conservador: {
    'Renda Fixa': 60,
    'Ações': 20,
    'Fundos Imobiliários': 10,
    'Criptomoedas': 0,
    'Ouro': 5,
    'Commodities': 5,
    'Tesouro': 0,
    'Seguros': 0,
    'Estruturados': 0
  },
  Moderado: {
    'Renda Fixa': 40,
    'Ações': 35,
    'Fundos Imobiliários': 10,
    'Criptomoedas': 0,
    'Ouro': 5,
    'Commodities': 5,
    'Tesouro': 5,
    'Seguros': 0,
    'Estruturados': 0
  },
  Arrojado: {
    'Renda Fixa': 20,
    'Ações': 55,
    'Fundos Imobiliários': 10,
    'Criptomoedas': 5,
    'Ouro': 3,
    'Commodities': 5,
    'Tesouro': 2,
    'Seguros': 0,
    'Estruturados': 0
  },
  Agressivo: {
    'Renda Fixa': 10,
    'Ações': 65,
    'Fundos Imobiliários': 10,
    'Criptomoedas': 10,
    'Ouro': 2,
    'Commodities': 3,
    'Tesouro': 0,
    'Seguros': 0,
    'Estruturados': 0
  }
};

var ALLOC_CATS = [
  'Renda Fixa',
  'Ações',
  'Fundos Imobiliários',
  'Criptomoedas',
  'Ouro',
  'Commodities',
  'Tesouro',
  'Seguros',
  'Estruturados'
];

// ────────────────────────────────────────────────────────────────
// UI STATE
// ────────────────────────────────────────────────────────────────
var sidebarVisible = true;
var selectedBrandColors = [];
var proposalApproved = false;
var proposalDraftHash = null;

// ────────────────────────────────────────────────────────────────
// DASHBOARD STATE
// ────────────────────────────────────────────────────────────────
var DASH_KPI_PREDICATES = {
  enviadas: function(p) {
    return p.status !== 'prospect_criado' && p.status !== 'r1_iniciada';
  },
  aceitas: function(p) {
    return p.feedback_rating === 'positivo';
  },
  aguardando: function(p) {
    return p.status !== 'prospect_criado' && p.status !== 'r1_iniciada'
      && p.feedback_rating !== 'positivo'
      && p.status !== 'negocio_fechado'
      && p.status !== 'perdido_user'
      && p.status !== 'perdido_auto';
  },
  expirando7d: function(p) {
    if (!p.created_at) return false;
    var created = new Date(p.created_at);
    var now = new Date();
    var daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return daysOld >= 24 && daysOld < 31; // Proposta tem 30 dias
  }
};

var DASH_KPI_LABELS = {
  enviadas: 'Enviadas',
  aceitas: 'Aceitas',
  aguardando: 'Aguardando',
  expirando7d: 'Expirando 7d'
};

var DASH_PERIOD_LABELS = {
  today: 'Hoje',
  week: 'Esta semana',
  month: 'Este mês',
  all: 'Todos',
  custom: 'Período customizado'
};

// ────────────────────────────────────────────────────────────────
// PROSPECT & DASHBOARD CENTRAL STATE
// ────────────────────────────────────────────────────────────────
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
    kpiFilter: null,
    pageInfo: ''
  },
  prospects: {
    all: [],
    currentId: null,
    r1Generated: false,
    viewingAsManager: false,
    sortCol: 'nome',
    sortDir: {
      nome: 'asc',
      patrimonio: 'desc',
      data: 'desc'
    },
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

// ────────────────────────────────────────────────────────────────
// AUTOCOMPLETE DATA: ASSESSORIA
// ────────────────────────────────────────────────────────────────
var ASS_LIST = [
  { g: 'Sem assessoria', items: ['Não possui assessoria', 'Investe sozinho / direto'] },
  { g: 'Bancos', items: ['Gerente de banco (Itaú)', 'Gerente de banco (Bradesco)', 'Gerente de banco (Santander)', 'Gerente de banco (Caixa)', 'Gerente de banco (BB)', 'Gerente de banco (Nubank)'] },
  { g: 'Plataformas e corretoras', items: ['XP Investimentos', 'BTG Pactual', 'Rico', 'Clear', 'Genial', 'Modal', 'Órama', 'Guide', 'Ágora', 'Toro', 'Easynvest / Nuinvest', 'Inter Invest', 'C6 Bank Invest', 'Avenue', 'Nomad', 'Mirae Asset'] },
  { g: 'Outros escritórios XP', items: ['Outro escritório XP'] },
  { g: 'Gestoras e family offices', items: ['Family Office próprio', 'Gestora independente', 'Multi Family Office'] },
  { g: 'Outros', items: ['Assessor autônomo (AAI)', 'Outro'] }
];

var acAssIdx = -1;
var acAssVisible = [];

// ────────────────────────────────────────────────────────────────
// AUTOCOMPLETE DATA: PROFISSÃO
// ────────────────────────────────────────────────────────────────
var PROF_LIST = [
  { g: 'Saúde', items: ['Médico', 'Médico Clínico Geral', 'Médico Especialista', 'Médico Cirurgião', 'Médico Cardiologista', 'Médico Ortopedista', 'Médico Dermatologista', 'Médico Oftalmologista', 'Médico Pediatra', 'Médico Ginecologista', 'Médico Neurologista', 'Médico Psiquiatra', 'Médico Oncologista', 'Médico Radiologista', 'Médico Anestesista', 'Dentista', 'Ortodontista', 'Implantodontista', 'Veterinário', 'Farmacêutico', 'Fisioterapeuta', 'Psicólogo', 'Psicanalista', 'Nutricionista', 'Enfermeiro', 'Enfermeiro UTI', 'Fonoaudiólogo', 'Terapeuta Ocupacional', 'Biomédico', 'Biólogo', 'Médico do Trabalho', 'Médico Infectologista'] },
  { g: 'Direito', items: ['Advogado', 'Advogado Sócio', 'Advogado Tributarista', 'Advogado Trabalhista', 'Advogado Empresarial', 'Advogado Criminalista', 'Juiz', 'Desembargador', 'Ministro', 'Promotor de Justiça', 'Defensor Público', 'Delegado de Polícia', 'Tabelião / Notário', 'Registrador'] },
  { g: 'Finanças e Mercado', items: ['Contador', 'Auditor', 'Economista', 'Atuário', 'Consultor Financeiro', 'Gestor de Fundos', 'Analista de Investimentos', 'Analista Financeiro', 'Trader', 'Banqueiro', 'Gerente de Banco', 'Planejador Financeiro', 'Agente Autônomo de Investimentos', 'Controller', 'Tesoureiro', 'CFO / Diretor Financeiro', 'Assessor de Investimentos'] },
  { g: 'Engenharia', items: ['Engenheiro Civil', 'Engenheiro Mecânico', 'Engenheiro Elétrico', 'Engenheiro Eletrônico', 'Engenheiro Químico', 'Engenheiro de Produção', 'Engenheiro Ambiental', 'Engenheiro Aeronáutico', 'Engenheiro de Petróleo', 'Engenheiro de Minas', 'Engenheiro Naval', 'Engenheiro Agrônomo', 'Arquiteto', 'Urbanista', 'Geólogo'] },
  { g: 'Tecnologia', items: ['Desenvolvedor de Software', 'Engenheiro de Software', 'CTO / CIO', 'Cientista de Dados', 'Analista de Dados', 'Arquiteto de Sistemas', 'DevOps / SRE', 'Especialista em Segurança Digital', 'Product Manager', 'UX Designer', 'Fundador de Startup', 'Empreendedor Digital'] },
  { g: 'Empresários e Executivos', items: ['Empresário', 'Sócio-Fundador', 'CEO / Presidente', 'COO / Diretor de Operações', 'CMO / Diretor de Marketing', 'Diretor Comercial', 'Diretor de RH', 'Diretor Jurídico', 'Gerente Geral', 'Gerente Comercial', 'Sócio de Escritório', 'Franqueado', 'Empreendedor Serial'] },
  { g: 'Setor Público', items: ['Servidor Público Federal', 'Servidor Público Estadual', 'Servidor Público Municipal', 'Militar / Oficial das Forças Armadas', 'Policial Federal', 'Policial Civil', 'Policial Militar', 'Bombeiro', 'Diplomata', 'Político', 'Vereador', 'Deputado Estadual', 'Deputado Federal', 'Senador', 'Prefeito', 'Governador'] },
  { g: 'Agronegócio', items: ['Produtor Rural', 'Fazendeiro', 'Pecuarista', 'Agrônomo', 'Engenheiro Agrônomo', 'Produtor de Grãos', 'Produtor de Cana', 'Cafeicultor', 'Exportador de Commodities', 'Gestor Agroindustrial'] },
  { g: 'Educação', items: ['Professor Universitário', 'Professor de Ensino Médio', 'Pesquisador', 'Reitor', 'Diretor de Escola', 'Coordenador Pedagógico', 'Consultor Educacional'] },
  { g: 'Mercado Imobiliário', items: ['Incorporador Imobiliário', 'Corretor de Imóveis', 'Construtor', 'Empreiteiro', 'Loteador', 'Gestor de FII'] },
  { g: 'Comércio e Indústria', items: ['Industrial', 'Dono de Fábrica', 'Importador / Exportador', 'Atacadista', 'Varejista', 'Distribuidor', 'Comerciante'] },
  { g: 'Mídia e Entretenimento', items: ['Atleta Profissional', 'Jogador de Futebol', 'Piloto de Corrida', 'Artista', 'Músico', 'Ator', 'Apresentador', 'Jornalista', 'Influenciador Digital', 'Produtor de Conteúdo', 'Publicitário', 'Designer Gráfico'] },
  { g: 'Investidores e Rentistas', items: ['Investidor Profissional', 'Investidor Anjo', 'Rentista / Vive de Renda', 'Family Office', 'Gestor de Patrimônio', 'Herdeiro / Sucessão Patrimonial'] },
  { g: 'Outros', items: ['Aposentado', 'Profissional Liberal', 'Autônomo', 'Consultor', 'Coach / Mentor', 'Piloto Comercial', 'Capitão de Navio', 'Outro'] }
];

var acIdx = -1;
var acVisible = [];

// ────────────────────────────────────────────────────────────────
// LEGAL TERMS & PRIVACY
// ────────────────────────────────────────────────────────────────
var TERMS_CONTENT = {
  terms: {
    title: 'Termos de Uso',
    body: '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">1. Aceitação dos Termos</h3>'
      + '<p style="margin-bottom:12px">Ao criar uma conta e utilizar a plataforma Captor, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">2. Descrição do Serviço</h3>'
      + '<p style="margin-bottom:12px">O Captor é uma plataforma de apoio à pré-venda para assessores de investimentos. As recomendações geradas são de caráter informativo e não constituem recomendação de investimento individualizada nos termos da Resolução CVM nº 20/2021.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">3. Uso Permitido</h3>'
      + '<p style="margin-bottom:12px">A plataforma é de uso exclusivo para profissionais de assessoria de investimentos. É vedado o uso para fins ilícitos, a reprodução não autorizada do conteúdo gerado ou o compartilhamento de credenciais de acesso.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">4. Créditos e Pagamentos</h3>'
      + '<p style="margin-bottom:12px">O uso das funcionalidades de IA consome créditos. Créditos adquiridos não são reembolsáveis. Créditos de boas-vindas são concedidos gratuitamente e não possuem valor monetário.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">5. Responsabilidade</h3>'
      + '<p style="margin-bottom:12px">O Captor não se responsabiliza por decisões de investimento tomadas com base no conteúdo gerado pela plataforma. O assessor é integralmente responsável pelas orientações prestadas aos seus clientes.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">6. Modificações</h3>'
      + '<p>Estes termos podem ser atualizados a qualquer momento. O uso continuado da plataforma após mudanças implica aceitação dos novos termos.</p>'
  },
  privacy: {
    title: 'Política de Privacidade',
    body: '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">1. Dados Coletados</h3>'
      + '<p style="margin-bottom:12px">Coletamos: email e senha para autenticação, dados de uso da plataforma (gerações, créditos consumidos), e dados de prospects inseridos pelo assessor para fins de geração de recomendações.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">2. Uso dos Dados</h3>'
      + '<p style="margin-bottom:12px">Os dados são utilizados exclusivamente para: prestação do serviço, melhoria da plataforma, e comunicações relacionadas à conta. Não vendemos dados a terceiros.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">3. Dados de Prospects</h3>'
      + '<p style="margin-bottom:12px">Dados de clientes inseridos na plataforma são de responsabilidade do assessor. Recomendamos não inserir dados sensíveis além do necessário para a geração de recomendações.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">4. Armazenamento</h3>'
      + '<p style="margin-bottom:12px">Dados são armazenados em servidores seguros via Supabase (infraestrutura AWS). Propostas expiram automaticamente após 30 dias.</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">5. Seus Direitos</h3>'
      + '<p style="margin-bottom:12px">Você pode solicitar a exclusão da sua conta e dados a qualquer momento pelo email de suporte. Atendemos às exigências da LGPD (Lei nº 13.709/2018).</p>'
      + '<h3 style="color:var(--white);margin-bottom:8px;font-size:.86rem">6. Cookies</h3>'
      + '<p>Utilizamos cookies estritamente necessários para autenticação. Não utilizamos cookies de rastreamento ou publicidade.</p>'
  }
};
