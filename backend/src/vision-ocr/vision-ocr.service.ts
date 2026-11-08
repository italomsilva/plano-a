import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

export interface ParseGabaritoResult {
  success: boolean;
  gabarito: Record<string, string>;
  totalQuestoes: number;
  provider: string;
  rawText?: string;
  message?: string;
}

@Injectable()
export class VisionOcrService {
  private readonly logger = new Logger(VisionOcrService.name);

  async parseImage(fileBuffer: Buffer, mimeType: string): Promise<ParseGabaritoResult> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Tentar Google Gemini Vision se chave fornecida
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        this.logger.log('Processando gabarito via Google Gemini Vision API...');
        const result = await this.parseWithGemini(fileBuffer, mimeType, geminiKey);
        if (result && Object.keys(result).length > 0) {
          return {
            success: true,
            gabarito: result,
            totalQuestoes: Object.keys(result).length,
            provider: 'Google Gemini Vision',
          };
        }
      } catch (err) {
        this.logger.warn(`Falha na extração com Gemini Vision: ${err.message}. Tentando fallback...`);
      }
    }

    // 2. Tentar OpenAI GPT-4o-mini Vision se chave fornecida
    if (openaiKey && openaiKey.trim() !== '') {
      try {
        this.logger.log('Processando gabarito via OpenAI Vision API...');
        const result = await this.parseWithOpenAI(fileBuffer, mimeType, openaiKey);
        if (result && Object.keys(result).length > 0) {
          return {
            success: true,
            gabarito: result,
            totalQuestoes: Object.keys(result).length,
            provider: 'OpenAI GPT-4o-mini',
          };
        }
      } catch (err) {
        this.logger.warn(`Falha na extração com OpenAI Vision: ${err.message}. Tentando fallback...`);
      }
    }

    // 3. Fallback para OCR Local via Tesseract.js
    try {
      this.logger.log('Processando gabarito via OCR local (Tesseract.js)...');
      const ocrResult = await Tesseract.recognize(fileBuffer, 'por+eng');
      const text = ocrResult?.data?.text || '';
      const parsed = this.parseTextToGabarito(text);

      return {
        success: Object.keys(parsed).length > 0,
        gabarito: parsed,
        totalQuestoes: Object.keys(parsed).length,
        provider: 'Tesseract OCR Local',
        rawText: text,
        message:
          Object.keys(parsed).length === 0
            ? 'Não foi possível detectar respostas na imagem. Verifique a nitidez ou configure GEMINI_API_KEY no arquivo .env.'
            : undefined,
      };
    } catch (ocrErr) {
      this.logger.error(`Falha no OCR local: ${ocrErr.message}`);
      return {
        success: false,
        gabarito: {},
        totalQuestoes: 0,
        provider: 'None',
        message: 'Erro no processamento da imagem do gabarito: ' + ocrErr.message,
      };
    }
  }

  /**
   * Extração via Google Gemini API
   */
  private async parseWithGemini(
    buffer: Buffer,
    mimeType: string,
    apiKey: string,
  ): Promise<Record<string, string>> {
    const base64Data = buffer.toString('base64');
    const prompt = `Você é um especialista em transcrição de gabaritos oficiais de concursos públicos (bancas FGV, Cebraspe, Vunesp, Cesgranrio, FCC, etc.).
Analise a imagem da tabela/folha de gabarito e extraia TODAS as questões e suas respectivas respostas/letras.
Retorne EXCLUSIVAMENTE um objeto JSON no formato {"1": "A", "2": "C", ...}.
Não adicione formatação markdown ou explicações além do JSON estrito.
Se houver questão anulada, marque como "X". Letras em maiúsculas (A, B, C, D, E ou C/E para certo/errado).`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errText}`);
    }

    const data: any = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Resposta vazia do Gemini API');
    }

    return this.cleanAndParseJson(candidateText);
  }

  /**
   * Extração via OpenAI GPT-4o-mini Vision
   */
  private async parseWithOpenAI(
    buffer: Buffer,
    mimeType: string,
    apiKey: string,
  ): Promise<Record<string, string>> {
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia o gabarito oficial desta imagem de concurso. Retorne um JSON com a chave "gabarito" contendo {"1": "A", "2": "B", ...}. Questões anuladas com "X".',
              },
              {
                type: 'image_url',
                image_url: { url: dataUri },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errText}`);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return this.cleanAndParseJson(content);
  }

  /**
   * Parser inteligente de texto para gabarito chave-valor
   * Suporta formatos:
   * 1-A, 1 - A, 1: A, 1. A, Questão 1: A, 01 A, tabelas OCR
   */
  public parseTextToGabarito(text: string): Record<string, string> {
    const map: Record<string, string> = {};
    if (!text) return map;

    const lines = text.split(/\r?\n/);

    // Expressão regular ampla para capturar pares número-resposta
    const regexPares = /(?:quest[ãa]o\s*)?(\d{1,3})\s*[-:.)\s=]+\s*([A-Ea-eXxVvFf]|CERTO|ERRADO)/gi;

    for (const line of lines) {
      let match;
      while ((match = regexPares.exec(line)) !== null) {
        const num = parseInt(match[1], 10);
        let resp = match[2].toUpperCase().trim();
        if (resp === 'CERTO') resp = 'C';
        if (resp === 'ERRADO') resp = 'E';
        if (num > 0 && num <= 200) {
          map[num.toString()] = resp;
        }
      }
    }

    // Se o regex linha a linha pegou menos que o esperado, tenta buscar blocos de coluna
    if (Object.keys(map).length < 5) {
      const tokenRegex = /(\d{1,3})\s*([A-Ea-eXx])/g;
      let m;
      while ((m = tokenRegex.exec(text)) !== null) {
        const n = parseInt(m[1], 10);
        const r = m[2].toUpperCase();
        if (n > 0 && n <= 200 && !map[n.toString()]) {
          map[n.toString()] = r;
        }
      }
    }

    return map;
  }

  private cleanAndParseJson(raw: string): Record<string, string> {
    try {
      const cleaned = raw
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.gabarito && typeof parsed.gabarito === 'object') {
        return parsed.gabarito;
      }
      return parsed;
    } catch {
      return this.parseTextToGabarito(raw);
    }
  }
}
