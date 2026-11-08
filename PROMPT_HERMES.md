# ESPECIFICAÇÃO TÉCNICA E PROMPT DE DESENVOLVIMENTO (HERMES AGENT)

## 1. Visão Geral do Sistema

Desenvolver uma aplicação web full-stack para organização de estudos em concursos públicos. O sistema permite ao estudante cadastrar seus concursos, mapear tópicos de estudo através de colagem de texto com delimitadores, cadastrar e corrigir simulados com visão computacional/IA para gabaritos oficiais, e organizar uma rotina semanal flexível.

## 2. Arquitetura e Tecnologia

### Stack Tecnológica

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Axios/React Query.

* **Backend:** NestJS (TypeScript), TypeORM ou Prisma ORM, Passport.js (JWT).

* **Banco de Dados:** PostgreSQL ou SQLite.

* **Extração de Gabarito Oficial (OCR/IA):** Serviço integrado no NestJS utilizando modelo de IA de Visão (como OpenAI GPT-4o-mini Vision ou Google Gemini API) ou motor OCR flexível para interpretação de tabelas e múltiplos layouts de bancas (Cebraspe, FGV, Vunesp, etc.).

### Diretrizes de Código e Arquitetura (MANDATÓRIO)

* **Design Modular:**

  * No **NestJS**, separar as responsabilidades por módulos (`AuthModule`, `ConcursosModule`, `MateriasModule`, `SimuladosModule`, `CronogramaModule`, `OcrModule`). Cada módulo deve ter `Controller`, `Service` e `Repository` (ou Entity) bem definidos.

  * No **Next.js**, separar em componentes reutilizáveis (`/components/ui`, `/components/concurso`, `/components/simulados`), serviços de API (`/services`), e custom hooks (`/hooks`).

* **Clean Code & SOLID:** Princípio da responsabilidade única em todas as classes e funções, DTOs (Data Transfer Objects) tipados com `class-validator` no backend.

## 3. Requisitos Funcionais Detalhados

### Módulo 0: Autenticação Simples

* Authentication baseada puramente em `username` e `password`.

* Sem exigência de e-mail ou envio de confirmações.

* Autenticação via JSON Web Token (JWT) armazenado em Cookie ou LocalStorage.

### Módulo 1: Gestão de Concursos

* **Cadastro do Concurso:**

  * `nome` (string, obrigatório) - Ex: *TJ-SP Escrevente*

  * `orgao` (string, obrigatório) - Ex: *Tribunal de Justiça*

  * `data_prova` (date, obrigatório)

  * `data_resultado` (date, **opcional**)

* **Seleção de Concurso:**

  * O usuário seleciona um concurso ativo na interface.

  * Toda a navegação posterior nas abas (**Estudo**, **Simulados** e **Cronograma**) fica **estritamente filtrada e escopada** ao concurso selecionado.

### Módulo 2: Aba "Estudo" (Edital & Checklist)

1. **Cadastro de Matérias:** Adicionar matérias dinamicamente vinculadas ao concurso selecionado (ex: *Direito Administrativo*, *Raciocínio Lógico*).

2. **Importação via Texto Bruto (Parser de Tópicos):**

   * O usuário cola um texto contendo todos os tópicos separados por ponto e vírgula `;`.
     *Exemplo:* `Princípios da Administração; Ato Administrativo; Licitações Lei 14.133; Processo Administrativo`

   * O backend ou frontend realiza a sanitização do texto e quebra a string no delimitador `;`.

   * Salva cada item limpo como um tópico de checklist (`TopicoEstudo`).

3. **Acompanhamento de Progresso:**

   * Checkbox para alternar status de concluído/pendente em cada tópico.

   * Barra visual de progresso (porcentagem de tópicos concluídos por matéria e geral do concurso).

### Módulo 3: Aba "Simulados" (Escopada por Concurso)

1. **Cadastro do Simulado:**

   * Exibir **apenas** os simulados pertencentes ao concurso selecionado.

   * Campos: `nome` (ex: *Simulado 01 - FGV*), `ano` (ex: *2026*), e `data_realizacao` (date, obrigatório).

2. **Entrada e Correção de Gabaritos:**

   * **Gabarito Oficial (Imagem):** Upload da imagem do gabarito oficial da banca. O backend envia a imagem para o serviço de visão/IA para identificar automaticamente a estrutura (independente se o layout é em colunas, linhas ou tabelas) e converter em um mapa de respostas estruturado:
     `{"1": "A", "2": "C", "3": "D", ...}`.

   * **Gabarito do Aluno (Texto):** Campo de texto onde o aluno digita suas respostas no formato padronizado linha por linha:

     ```
     1-A
     2-C
     3-B
     4-D
     
     ```

3. **Processamento da Correção:**

   * Comparação linha a linha entre a estrutura extraída da imagem e o texto do aluno.

   * Exibição de:

     * Total de acertos, total de erros e percentual de aproveitamento (%).

     * Relatório detalhado destacando a lista de **questões erradas** (Nº da Questão, Sua Resposta vs. Resposta Correta).

### Módulo 4: Aba "Cronograma"

1. **Grade Semanal:** 7 colunas fixas (Segunda a Domingo).

2. **Linhas Dinâmicas:** Botões para adicionar ou remover linhas de horários/blocos de estudo.

3. **Personalização de Célula:**

   * Edição livre do conteúdo em texto da célula (ex: *09:00 - 11:00 | Leitura de Direito Constitucional*).

   * Seletor de cor de fundo (Color Picker ou paleta de temas) individual para cada célula da grade.

## 4. Entidades do Banco de Dados (Modelos)

```
// Exemplo de referência de entidades para o ORM

model User {
  id        String     @id @default(uuid())
  username  String     @unique
  password  String
  concursos Concurso[]
}

model Concurso {
  id             String           @id @default(uuid())
  userId         String
  user           User             @relation(fields: [userId], references: [id])
  nome           String
  orgao          String
  dataProva      DateTime
  dataResultado  DateTime?        // Opcional
  materias       Materia[]
  simulados      Simulado[]
  cronograma     CronogramaItem[]
  createdAt      DateTime         @default(now())
}

model Materia {
  id         String         @id @default(uuid())
  concursoId String
  concurso   Concurso       @relation(fields: [concursoId], references: [id], onDelete: Cascade)
  nome       String
  topicos    TopicoEstudo[]
}

model TopicoEstudo {
  id        String   @id @default(uuid())
  materiaId String
  materia   Materia  @relation(fields: [materiaId], references: [id], onDelete: Cascade)
  titulo    String
  concluido Boolean  @default(false)
}

model Simulado {
  id              String   @id @default(uuid())
  concursoId      String
  concurso        Concurso @relation(fields: [concursoId], references: [id], onDelete: Cascade)
  nome            String
  ano             Int
  dataRealizacao  DateTime
  gabaritoOficial Json     // Estrutura parsed Ex: {"1": "A", "2": "B"}
  gabaritoAluno   String   // Texto puro Ex: "1-A\n2-B"
  totalAcertos    Int      @default(0)
  totalErros      Int      @default(0)
  createdAt       DateTime @default(now())
}

model CronogramaItem {
  id         String   @id @default(uuid())
  concursoId String
  concurso   Concurso @relation(fields: [concursoId], references: [id], onDelete: Cascade)
  diaSemana  Int      // 0 (Segunda) a 6 (Domingo)
  linhaIndex Int
  conteudo   String
  corFundo   String   @default("#ffffff")
}

```

## 5. Instruções de Execução para o Hermes

1. Crie a estrutura de diretórios separando os projetos: `/frontend` (Next.js) e `/backend` (NestJS).

2. No NestJS, estruture a aplicação em módulos isolados (`auth`, `concursos`, `materias`, `simulados`, `cronograma`, `vision-ocr`).

3. Monte os endpoints REST tipados com DTOs e validações `class-validator`.

4. No Next.js, implemente o layout responsivo com contexto/estado para armazenar o `concursoSelecionado`.

5. Desenvolva o analisador visual de gabaritos no backend aceitando upload de arquivo (`multipart/form-data`) e o leitor do texto `1-A`.

6. Mantenha o código limpo, sem funções gigantescas, e com comentários explicativos nos fluxos principais.