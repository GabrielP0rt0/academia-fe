Projeto: Academia Digital — Frontend (POC)
Stack sugerido: React + Vite + fetch (vanilla) + Chart.js (react-chartjs-2) + Tailwind CSS
Objetivo: Implementar a SPA que consumirá a API Python (FastAPI com JSON files) e entregará as telas mínimas da POC: Dashboard, Alunos, Avaliações (gráficos), Aulas (presença) e Caixa/Financeiro.

1 — Requisitos Gerais

Aplicação SPA em React (Vite).

Comunicação com backend via REST JSON (CORS habilitado no backend).

Suportar ambiente local (dev) e build para produção.

Usar apenas bibliotecas gratuitas/open-source.

Código organizado, componentes reutilizáveis, fácil de entender para equipe da disciplina.

2 — Estrutura de pastas sugerida
frontend/
├─ package.json
├─ index.html
├─ vite.config.js
├─ public/
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ api/                # wrapper de chamadas à API
│  │   └─ index.js
│  ├─ pages/
│  │   ├─ Dashboard.jsx
│  │   ├─ Students.jsx
│  │   ├─ StudentDetail.jsx
│  │   ├─ Evaluations.jsx
│  │   ├─ Classes.jsx
│  │   └─ Finance.jsx
│  ├─ components/
│  │   ├─ Header.jsx
│  │   ├─ Nav.jsx
│  │   ├─ StudentForm.jsx
│  │   ├─ StudentList.jsx
│  │   ├─ EvalForm.jsx
│  │   ├─ EvalChart.jsx
│  │   ├─ ClassForm.jsx
│  │   ├─ AttendanceModal.jsx
│  │   └─ FinanceForm.jsx
│  ├─ hooks/
│  │   └─ useFetch.js
│  ├─ styles/
│  │   └─ index.css      # Tailwind entry
│  └─ utils/
│      └─ formatters.js
└─ README-frontend.md

3 — Dependências recomendadas

react, react-dom

vite (dev)

tailwindcss (opcional, facilita layout rápido)

chart.js + react-chartjs-2 (gráficos)

clsx (opcional para classes condicionais)

react-router-dom (routing entre páginas)

(opcional) react-hot-toast ou notistack para feedbacks

Exemplo minimal no package.json:

"dependencies": {
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "chart.js": "^4",
  "react-chartjs-2": "^5",
  "tailwindcss": "^3"
}

4 — Páginas e responsabilidades
4.1 Dashboard

Resumo rápido: alunos ativos, aulas do dia, total_income_today, total_expense_today, balance.

Cards com links rápidos para registrar avaliação, abrir presença, lançar receita.

Chamadas: GET /dashboard/summary, GET /finance?date=YYYY-MM-DD.

4.2 Alunos (Students)

Lista paginada ou simples dos alunos (GET /students).

Botão "Novo aluno" abre StudentForm.

Ao clicar no aluno => StudentDetail (detalhes + últimas avaliações + histórico de presenças).

4.3 Avaliações (Evaluations)

Selecionar aluno (dropdown ou pela página do aluno).

Form para inserir avaliação (peso, altura, medidas) => POST /evaluations.

Mostrar gráfico de evolução (peso & IMC) usando EvalChart que consome GET /evaluations/student/{id}/chart-data ou GET /evaluations/student/{id} e transforma nos datasets.

4.4 Aulas (Classes) e Presença

Lista de aulas (GET /classes).

Criar aula (POST /classes).

Abrir chamada (AttendanceModal) — selecionar aula e marcar lista de alunos presentes (POST /attendance).

Histórico: GET /attendance/class/{class_id}.

4.5 Financeiro (Finance)

Tela para lançar entrada/saída (POST /finance).

Tela de fechamento do dia: GET /finance?date=YYYY-MM-DD e exibir totais e tabela de entries.

Export CSV/JSON botão (client-side).

5 — Componentes principais (descrição)
Header.jsx

Logo, nome da POC, botão de perfil (placeholder).

Nav.jsx

Links: Dashboard, Alunos, Avaliações, Aulas, Caixa.

StudentList.jsx

Lista com search (por nome) e botão de criar novo.

StudentForm.jsx

Campos: name (required), birthdate (YYYY-MM-DD), phone.

Validação simples (name obrigatório).

Ao submeter → POST /students → feedback (toast) e atualizar lista.

StudentDetail.jsx

Mostra dados do aluno, botão para "Nova Avaliação", lista de avaliações recentes, botão para abrir presença.

EvalForm.jsx

Campos: weight_kg (required), height_m (optional), measurements (optional).

Calcula IMC no front para mostrar antes do envio (opcional).

Submete → POST /evaluations.

EvalChart.jsx

Recebe evaluations[] ou chart-data e renderiza Line Chart para peso e outra série para IMC (duas Y axes se desejar).

Configurações mínimas: labels (dates), datasets (weights, imc).

AttendanceModal.jsx

Recebe class_id, lista de alunos → checkbox para cada aluno → ao submeter envia múltiplos POST (ou um bulk) para /attendance.

FinanceForm.jsx

Campos: type (income/expense), amount (number), category, description.

Validação: amount > 0.

6 — UX / Fluxos de uso (cenários rápidos)

Cadastrar aluno: Nav → Alunos → Novo → preencher → Salvar → voltar com novo aluno na lista.

Registrar avaliação: Alunos → selecionar → Nova avaliação → preencher peso → Salvar → ver gráfico atualizado.

Abrir presença: Aulas → selecionar aula → Abrir chamada → marcar > Salvar → ver histórico.

Fechamento de caixa: Caixa → ver dia atual → totais e listagem → exportar CSV.

Regras de usabilidade:

Mostrar loading states em chamadas de rede.

Mostrar toasts para sucesso/erro.

Formulários com validação mínima e feedback inline.

Botões com textos claros (Ex.: "Salvar avaliação", "Abrir chamada").

7 — Contrato com a API (resumo)

Use o wrapper src/api/index.js com funções:

api.students.list() // GET /students

api.students.create(payload) // POST /students

api.classes.list() // GET /classes

api.classes.create(payload) // POST /classes

api.attendance.create(payload) // POST /attendance (suportar bulk)

api.evaluations.listByStudent(id) // GET /evaluations/student/{id}

api.evaluations.create(payload) // POST /evaluations

api.evaluations.chartData(id) // GET /evaluations/student/{id}/chart-data (opcional)

api.finance.list(date) // GET /finance?date=YYYY-MM-DD

api.finance.create(payload) // POST /finance

api.dashboard.summary(date) // GET /dashboard/summary?date=...

Tratamento de erros:

Se fetch retorna status >= 400 → ler body e exibir mensagem amigável.

Timeout opcional (front) para chamadas lentas.

Ambiente:

Usar variável VITE_API_URL (ex.: http://localhost:8000) no .env para apontar o backend em dev.

8 — Estilo / UI

Usar Tailwind para prototipagem rápida (cores neutras + cor de destaque para ações).

Layout responsivo simples (desktop first).

Tamanho mínimo legível (font-size >= 14px).

Componentes com espaçamento consistente (padding/margins).

9 — Validações & Mensagens

Todos os formulários têm validação mínima no front (required, numeric, ranges).

Mensagens de erro mostradas em toast e em linha.

Ao receber 500 do backend mostrar mensagem genérica: "Erro inesperado — contate o responsável".

10 — Testes manuais e critérios de aceite (Frontend)
Testes básicos

Instalar deps (npm install).

Rodar (npm run dev) e abrir http://localhost:5173 (ou porta Vite).

Verificar conexão com backend (GET /students carregando lista seed).

Criar novo aluno e confirmar presença na lista.

Criar 3 avaliações e confirmar gráfico atualizado.

Criar aula e marcar presença para 2 alunos.

Registrar 3 lançamentos financeiros e verificar totais do dia no Dashboard/Finance.

Testar responsividade em mobile narrow width.

Teste de erro: desligar backend e tentar uma operação – o front deve mostrar erro amigável.

Critérios de Aceite

 Todas as páginas principais estão implementadas e navegáveis.

 Formulários criam registros válidos via API.

 Gráfico de avaliações mostra os pontos esperados.

 Presença pode ser marcada sem erro.

 Caixa mostra totais corretos (conferir com API).

 Comportamento aceitável em telas pequenas.

11 — Testes automatizados (opcional, recomendado)

Unit simples para utils/formatters.js (ex.: função que calcula IMC).

Teste de integração leve com msw (Mock Service Worker) para simular API e checar renderização da lista de alunos e do gráfico. (Opcional para POC.)

12 — Build & Deploy

npm run build gera artefato estático.

Deploy sugerido: Vercel (gratuito para POCs) — conectar repositório e usar variável de ambiente VITE_API_URL apontando para backend deployado.

No deploy, garantir que CORS do backend permita a origem do front.

13 — Dados de seed / mock (para dev)

Fornecer arquivo backend/app/data com seeds (1–3 alunos, 1 aula, alguns finance entries) para que o front inicialmente exiba algo. O front também deve tolerar listas vazias (exibir CTA para criar primeiro aluno).

14 — Observações técnicas e dicas para o cursor

Evitar salvar estados grandes no localStorage; apenas token (se houver).

Preferir chamadas simples (no POC não precisa de state manager como Redux). useState + useEffect + useContext para usuário/global se necessário.

Criar um useFetch customizado que trate JSON errors, loading e re-fetch.

Usar react-router-dom v6 para rotas claras: /, /students, /students/:id, /evaluations, /classes, /finance.

15 — Critérios de entrega (o que entregar ao final)

Repositório com código frontend.

README-frontend com comandos para instalar e rodar.

Variáveis de ambiente documentadas (VITE_API_URL).

Vídeo curto (opcional) demonstrando fluxo: criar aluno → avaliação → ver gráfico → registrar presença → criar lançamentos → ver caixa.

Lista de issues conhecidas / melhorias.