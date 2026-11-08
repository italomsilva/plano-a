# Plano A - Sistema de Organização de Estudos para Concursos Públicos

Aplicação web full-stack de alto desempenho para planejamento, acompanhamento de editais, correção inteligente de simulados com visão computacional/IA e cronograma semanal flexível para concurseiros. Desenvolvida sob a especificação do **Hermes Agent**.

---

## 🚀 Arquitetura & Stack Tecnológica

### Backend (NestJS + TypeScript)
- **Framework:** NestJS modular com arquitetura SOLID (`AuthModule`, `ConcursosModule`, `MateriasModule`, `SimuladosModule`, `CronogramaModule`, `VisionOcrModule`).
- **ORM & Banco de Dados:** Prisma ORM com PostgreSQL (campos JSON nativos em JSONB).
- **Autenticação:** Passport.js com JSON Web Token (JWT) e criptografia Bcrypt.
- **Validação:** DTOs com `class-validator` e `class-transformer`.
- **Motor de Visão / OCR:**
  - Suporte nativo a **Google Gemini Vision API** (`GEMINI_API_KEY`)
  - Suporte a **OpenAI GPT-4o-mini Vision** (`OPENAI_API_KEY`)
  - Fallback local automático com **Tesseract.js** e parser regex multi-layout para bancas examinadoras (FGV, Cebraspe, Vunesp, etc.).

### Frontend (Next.js 14 + React + Tailwind CSS)
- **Framework:** Next.js 14 com App Router (`src/app`).
- **Estilização:** Tailwind CSS responsivo, paleta moderna e componentes estilizados.
- **Ícones:** Lucide React.
- **Cliente HTTP:** Axios com interceptors de autenticação JWT e tratamento global de 401.
- **Efeitos e UX:** Canvas-confetti para comemoração de simulados e checklist, navegação escopada por concurso ativo.

---

## 📁 Estrutura do Projeto

```text
plano-a/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Modelos User, Concurso, Materia, TopicoEstudo, Simulado, CronogramaItem
│   ├── src/
│   │   ├── auth/                 # Módulo 0: Autenticação simples (username/password + JWT)
│   │   ├── concursos/            # Módulo 1: Gestão e estatísticas de concursos
│   │   ├── materias/             # Módulo 2: Aba Estudo, importador com delimitador ";" e checklist
│   │   ├── simulados/            # Módulo 3: Aba Simulados, gabarito oficial e correção
│   │   ├── cronograma/           # Módulo 4: Grade semanal de 7 colunas e personalização de cores
│   │   ├── vision-ocr/           # Serviço de Visão/IA e OCR local para gabaritos
│   │   ├── prisma/               # Serviço de conexão do banco
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Tela de login
│   │   │   ├── register/         # Tela de cadastro instantâneo
│   │   │   ├── concursos/        # Listagem e criação de concursos
│   │   │   └── concurso/[id]/    # Painel escopado ao concurso selecionado
│   │   │       ├── page.tsx      # Visão Geral (médias, contagem regressiva)
│   │   │       ├── estudo/       # Aba Estudo & Edital
│   │   │       ├── simulados/    # Aba Simulados & Gabarito IA
│   │   │       └── cronograma/   # Aba Cronograma Semanal
│   │   ├── components/
│   │   │   ├── ui/               # Button, Input, Modal, ProgressBar, Badge
│   │   │   ├── layout/           # Navbar, ConcursoTabs
│   │   │   ├── concurso/         # ConcursoCard, ConcursoModal
│   │   │   ├── estudo/           # MateriaCard, ImportTopicosModal, TopicoItem
│   │   │   ├── simulados/        # SimuladoCard, SimuladoModal, ResultadoSimuladoModal
│   │   │   └── cronograma/       # GradeSemanal com seletor de cores
│   │   ├── context/              # AuthContext e ConcursoContext
│   │   ├── services/             # Instância configurada do Axios
│   │   └── types/                # Interfaces TypeScript compartilhadas
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## ⚡ Como Executar o Projeto

### Método 1: Inicialização Rápida (1 Clique no Windows)
- **Iniciar:** Dê dois cliques em `start.bat` (ou execute `.\start.ps1` no PowerShell).
- **Parar:** Dê dois cliques em `stop.bat` (ou execute `.\stop.ps1` no PowerShell).

### Método 2: Manual via Terminal

#### Iniciar o Backend (NestJS)
```bash
cd backend
npm run start:dev
```
O servidor da API iniciará em: `http://localhost:3001/api`

#### Iniciar o Frontend (Next.js)
Em outro terminal:
```bash
cd frontend
npm run dev
```
A aplicação web estará acessível em: `http://localhost:3000`

---

## 🔑 Configuração de IA para Gabaritos (Opcional)

No arquivo `backend/.env`:
```env
PORT=3001
JWT_SECRET=sua_chave_secreta_jwt
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/plano_a?schema=public"

# Opcional: Adicione sua chave Google Gemini para reconhecimento ultra-preciso de fotos de gabarito:
GEMINI_API_KEY=sua_chave_gemini_aqui

# Ou chave OpenAI:
# OPENAI_API_KEY=sua_chave_openai_aqui
```
*Observação: Caso nenhuma chave seja inserida, o sistema utiliza automaticamente o motor de OCR local com reconhecimento heurístico de padrões.*

---

## 🛠️ Funcionalidades Principais

1. **Autenticação Direta:** Cadastro ágil apenas com usuário e senha, sem validação burocrática por e-mail.
2. **Navegação Escopada:** Ao selecionar um concurso, todas as abas (Estudo, Simulados e Cronograma) filtram dinamicamente apenas os dados pertinentes àquele concurso.
3. **Importação Rápida de Editais:** Permite colar texto de editais com tópicos delimitados por ponto e vírgula (ex: `Princípios da Administração; Ato Administrativo; Licitações Lei 14.133`) gerando os itens de checklist instantaneamente.
4. **Correção de Simulados por Imagem:** Upload da foto da folha de respostas oficial da banca examinadora com extração e correção questão por questão contra as respostas digitadas pelo aluno.
5. **Cronograma Semanal 7 Dias:** Grade interativa com blocos dinâmicos e seletor de cores para organização visual da rotina de estudos.

