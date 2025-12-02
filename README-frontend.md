# Academia Digital - Frontend

Sistema de gestão para academia desenvolvido em React + Vite.

## 📋 Requisitos

- Node.js 18+ e npm/yarn instalados
- Backend rodando em `http://localhost:8000` (verifique o arquivo `.env`)

## 🚀 Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (se ainda não existir):

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Executar em modo desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 4. Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

### 5. Preview do build de produção

```bash
npm run preview
```

## 🔐 Autenticação

Para fazer login, use as credenciais configuradas no backend. Por padrão (POC):
- Email: `admin@academia.com`
- Senha: `admin123`

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── api/              # Wrapper de chamadas à API
│   ├── components/       # Componentes reutilizáveis
│   ├── context/          # Context API para estado global
│   ├── hooks/            # Hooks customizados
│   ├── pages/            # Páginas da aplicação
│   ├── styles/           # Estilos globais (Tailwind)
│   ├── utils/            # Funções utilitárias
│   ├── App.jsx           # Componente principal e rotas
│   └── main.jsx          # Ponto de entrada
├── public/               # Arquivos estáticos
├── index.html            # HTML base
├── package.json          # Dependências e scripts
├── vite.config.js        # Configuração do Vite
├── tailwind.config.js    # Configuração do Tailwind
└── .env                  # Variáveis de ambiente
```

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Tailwind CSS** - Estilização
- **Chart.js + react-chartjs-2** - Gráficos
- **React Hook Form** - Gerenciamento de formulários
- **React Toastify** - Notificações

## 📄 Páginas Principais

- **Dashboard** (`/`) - Resumo geral com métricas e ações rápidas
- **Alunos** (`/students`) - Lista e cadastro de alunos
- **Detalhes do Aluno** (`/students/:id`) - Informações completas do aluno
- **Avaliações** (`/evaluations`) - Registro e gráficos de evolução
- **Aulas** (`/classes`) - Gerenciamento de aulas e presença
- **Caixa** (`/finance`) - Lançamentos financeiros e fechamento de caixa

## 🔧 Funcionalidades

### Dashboard
- Visualização de métricas do dia (alunos ativos, aulas, receitas/despesas)
- Links rápidos para ações comuns
- Filtro por data

### Alunos
- Lista paginada com busca por nome
- Cadastro de novos alunos
- Visualização de detalhes e histórico

### Avaliações
- Registro de avaliações físicas (peso, altura, medidas)
- Gráfico de evolução (peso e IMC)
- Cálculo automático de IMC

### Aulas
- Criação de aulas
- Registro de presença em lote (bulk)
- Histórico de presenças

### Financeiro
- Lançamento de entradas e saídas
- Fechamento de caixa por dia
- Exportação de dados (CSV/JSON)

## 🎨 Paleta de Cores

- **Primária**: Laranja avermelhado (#FF6B35)
- **Secundária**: Cinza (#6B7280)
- **Background**: Branco e cinza claro (#F3F4F6)

## ⚠️ Tratamento de Erros

- Página 404 para rotas não encontradas
- Página 500 para erros do servidor
- ErrorBoundary para capturar erros React
- Mensagens de erro amigáveis via toast

## 📝 Notas de Desenvolvimento

- O projeto utiliza Context API para gerenciamento de estado global (cache de alunos e aulas)
- Todas as requisições passam pelo wrapper da API em `src/api/index.js`
- Formulários utilizam React Hook Form para validação
- Loading states são exibidos durante requisições
- Toast notifications para feedback de ações

## 🐛 Troubleshooting

### Erro de conexão com backend
- Verifique se o backend está rodando em `http://localhost:8000`
- Confirme a variável `VITE_API_URL` no arquivo `.env`
- Verifique se o CORS está habilitado no backend

### Erro ao fazer login
- Verifique as credenciais no backend
- Confirme que o endpoint `/api/auth/login` está funcionando

### Gráfico não aparece
- Certifique-se de que há pelo menos uma avaliação registrada para o aluno
- Verifique o console do navegador para erros

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação do backend em `http://localhost:8000/docs`
2. Verifique os logs do console do navegador
3. Teste os endpoints diretamente usando a documentação Swagger

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025

