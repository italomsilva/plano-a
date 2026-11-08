import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando banco de dados com dados de demonstração...');

  // 1. Criar usuário de demonstração
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { username: 'concurseiro' },
    update: {},
    create: {
      username: 'concurseiro',
      password: hashedPassword,
    },
  });

  console.log(`👤 Usuário criado/verificado: ${user.username} (senha: 123456)`);

  // 2. Concurso Exemplo: TJ-SP Escrevente
  const existingConcurso = await prisma.concurso.findFirst({
    where: { userId: user.id, nome: 'TJ-SP - Escrevente Técnico Judiciário' },
  });

  if (!existingConcurso) {
    const dataProva = new Date();
    dataProva.setDate(dataProva.getDate() + 45); // Prova daqui a 45 dias

    const dataResultado = new Date();
    dataResultado.setDate(dataResultado.getDate() + 90);

    const concurso = await prisma.concurso.create({
      data: {
        userId: user.id,
        nome: 'TJ-SP - Escrevente Técnico Judiciário',
        orgao: 'Tribunal de Justiça do Estado de São Paulo',
        dataProva,
        dataResultado,
      },
    });

    console.log(`🏛️ Concurso criado: ${concurso.nome}`);

    // 3. Matérias e Tópicos do Edital
    const materiasData = [
      {
        nome: 'Direito Constitucional',
        topicos: [
          { titulo: 'Dos Direitos e Deveres Individuais e Coletivos (Art. 5º CF)', concluido: true, ordem: 1 },
          { titulo: 'Da Nacionalidade e Direitos Políticos (Arts. 12 a 16)', concluido: true, ordem: 2 },
          { titulo: 'Do Poder Judiciário: Disposições Gerais (Arts. 92 a 126)', concluido: false, ordem: 3 },
          { titulo: 'Das Funções Essenciais à Justiça (Arts. 127 a 135)', concluido: false, ordem: 4 },
        ],
      },
      {
        nome: 'Direito Administrativo',
        topicos: [
          { titulo: 'Princípios Expressos e Implícitos da Administração Pública', concluido: true, ordem: 1 },
          { titulo: 'Ato Administrativo: Requisitos, Atributos e Espécies', concluido: false, ordem: 2 },
          { titulo: 'Poderes Administrativos: Vinculado, Discricionário, Hierárquico e Disciplinar', concluido: false, ordem: 3 },
          { titulo: 'Improbidade Administrativa (Lei 8.429/92 atualizada pela Lei 14.230/21)', concluido: false, ordem: 4 },
        ],
      },
      {
        nome: 'Língua Portuguesa',
        topicos: [
          { titulo: 'Interpretação e Compreensão de Textos Literários e Não Literários', concluido: true, ordem: 1 },
          { titulo: 'Ortografia Oficial e Acentuação Gráfica', concluido: true, ordem: 2 },
          { titulo: 'Concordância Nominal e Verbal', concluido: false, ordem: 3 },
          { titulo: 'Regência Verbal e Emprego do Sinal Indicativo de Crase', concluido: false, ordem: 4 },
          { titulo: 'Pontuação: Vírgula, Ponto e Vírgula e Dois Pontos', concluido: false, ordem: 5 },
        ],
      },
      {
        nome: 'Raciocínio Lógico-Matemático',
        topicos: [
          { titulo: 'Estruturas Lógicas e Proposições Simples e Compostas', concluido: true, ordem: 1 },
          { titulo: 'Tabelas-Verdade: Conjunção, Disjunção, Condicional e Bicondicional', concluido: true, ordem: 2 },
          { titulo: 'Equivalências Lógicas e Leis de De Morgan', concluido: false, ordem: 3 },
          { titulo: 'Diagramas Lógicos e Quantificadores Todo, Algum e Nenhum', concluido: false, ordem: 4 },
        ],
      },
    ];

    for (const m of materiasData) {
      await prisma.materia.create({
        data: {
          concursoId: concurso.id,
          nome: m.nome,
          topicos: {
            create: m.topicos,
          },
        },
      });
    }
    console.log(`📚 4 Matérias com tópicos de edital inseridas com sucesso.`);

    // 4. Simulado Exemplo Corrigido
    const gabaritoOficial = {
      "1": "A", "2": "C", "3": "B", "4": "D", "5": "E",
      "6": "B", "7": "A", "8": "C", "9": "D", "10": "A"
    };
    const gabaritoAluno = "1-A\n2-C\n3-B\n4-D\n5-C\n6-B\n7-A\n8-C\n9-E\n10-A"; // Errou 5 e 9

    const relatorio = {
      totalQuestoes: 10,
      totalAcertos: 8,
      totalErros: 2,
      totalEmBranco: 0,
      totalAnuladas: 0,
      notaPercentual: 80.0,
      questoesErradas: [
        { numero: 5, respostaAluno: "C", respostaCorreta: "E" },
        { numero: 9, respostaAluno: "E", respostaCorreta: "D" },
      ],
      questoesCorretas: [
        { numero: 1, respostaAluno: "A" },
        { numero: 2, respostaAluno: "C" },
        { numero: 3, respostaAluno: "B" },
        { numero: 4, respostaAluno: "D" },
        { numero: 6, respostaAluno: "B" },
        { numero: 7, respostaAluno: "A" },
        { numero: 8, respostaAluno: "C" },
        { numero: 10, respostaAluno: "A" },
      ],
      questoesAnuladas: [],
      detalhes: [
        { numero: 1, respostaOficial: "A", respostaAluno: "A", status: "CORRETO" },
        { numero: 2, respostaOficial: "C", respostaAluno: "C", status: "CORRETO" },
        { numero: 3, respostaOficial: "B", respostaAluno: "B", status: "CORRETO" },
        { numero: 4, respostaOficial: "D", respostaAluno: "D", status: "CORRETO" },
        { numero: 5, respostaOficial: "E", respostaAluno: "C", status: "ERRADO" },
        { numero: 6, respostaOficial: "B", respostaAluno: "B", status: "CORRETO" },
        { numero: 7, respostaOficial: "A", respostaAluno: "A", status: "CORRETO" },
        { numero: 8, respostaOficial: "C", respostaAluno: "C", status: "CORRETO" },
        { numero: 9, respostaOficial: "D", respostaAluno: "E", status: "ERRADO" },
        { numero: 10, respostaOficial: "A", respostaAluno: "A", status: "CORRETO" },
      ]
    };

    await prisma.simulado.create({
      data: {
        concursoId: concurso.id,
        nome: 'Simulado Diagnóstico 01 - Banca Vunesp',
        ano: 2026,
        dataRealizacao: new Date(),
        gabaritoOficial: JSON.stringify(gabaritoOficial),
        gabaritoAluno,
        totalAcertos: 8,
        totalErros: 2,
        totalQuestoes: 10,
        notaPercentual: 80.0,
        detalhesJson: JSON.stringify(relatorio),
      },
    });
    console.log(`📝 Simulado modelo criado.`);

    // 5. Cronograma Semanal Exemplo
    const cronogramaItems = [
      { diaSemana: 0, linhaIndex: 0, conteudo: '08:00 - 10:00 | Direito Constitucional', corFundo: '#eff6ff' },
      { diaSemana: 0, linhaIndex: 1, conteudo: '10:30 - 12:00 | Língua Portuguesa (Gramática)', corFundo: '#f0fdf4' },
      { diaSemana: 1, linhaIndex: 0, conteudo: '08:00 - 10:00 | Direito Administrativo', corFundo: '#faf5ff' },
      { diaSemana: 1, linhaIndex: 1, conteudo: '10:30 - 12:00 | Questões Inéditas Vunesp', corFundo: '#eef2ff' },
      { diaSemana: 2, linhaIndex: 0, conteudo: '08:00 - 10:00 | Raciocínio Lógico (Tabelas-Verdade)', corFundo: '#fefce8' },
      { diaSemana: 2, linhaIndex: 1, conteudo: '10:30 - 12:00 | Revisão Flashcards Anki', corFundo: '#eff6ff' },
      { diaSemana: 3, linhaIndex: 0, conteudo: '08:00 - 10:00 | Direito Constitucional (Art. 5º)', corFundo: '#eff6ff' },
      { diaSemana: 3, linhaIndex: 1, conteudo: '10:30 - 12:00 | Redação & Produção Textual', corFundo: '#f0fdf4' },
      { diaSemana: 4, linhaIndex: 0, conteudo: '08:00 - 10:00 | Direito Administrativo (Atos)', corFundo: '#faf5ff' },
      { diaSemana: 4, linhaIndex: 1, conteudo: '10:30 - 12:00 | Resolução de 50 Questões', corFundo: '#fff1f2' },
      { diaSemana: 5, linhaIndex: 0, conteudo: '08:30 - 13:00 | SIMULADO COMPLETO', corFundo: '#fff1f2' },
      { diaSemana: 5, linhaIndex: 1, conteudo: '14:30 - 17:00 | Análise de Erros e Gabarito IA', corFundo: '#fefce8' },
      { diaSemana: 6, linhaIndex: 0, conteudo: '09:00 - 11:30 | Revisão Semanal de Erros', corFundo: '#f8fafc' },
      { diaSemana: 6, linhaIndex: 1, conteudo: '14:00 - 22:00 | Descanso / Lazer', corFundo: '#ffffff' },
    ];

    await prisma.cronogramaItem.createMany({
      data: cronogramaItems.map((item) => ({
        concursoId: concurso.id,
        ...item,
      })),
    });
    console.log(`📅 Grade semanal completa inserida.`);
  }

  console.log('✨ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

