import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Security & model constants
const MODEL_TEXT = 'gemini-3.8-flash';
const MODEL_IMAGE = 'gemini-3.1-flash-lite-image';
const MAX_TEXT_INPUT_LENGTH = 15000;
const MAX_PANELS_BATCH_LIMIT = 10;

app.use(express.json({ limit: '10mb' }));

// Input sanitizer helper to prevent DoS & injection
function sanitizeTextInput(text: unknown, maxLen = MAX_TEXT_INPUT_LENGTH): string {
  if (typeof text !== 'string') return '';
  return text.slice(0, maxLen).trim();
}

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback generator when API Key is not set or rate-limited
function generateFallbackAnalysis(rawText: string) {
  const words = rawText.split(/[、。\s\n]+/).filter(Boolean);
  const titleKeywords = words.slice(0, 3).join('と') || '不思議な朝の記憶';
  const hasCat = /猫|ねこ|ネコ|にゃ/.test(rawText);
  const hasWork = /会社|仕事|上司|部下|オフィス|同僚|学校|授業|先生/.test(rawText);
  const hasFly = /飛|空|浮|落ち|宇宙|雲/.test(rawText);

  return {
    title: `${titleKeywords || '名前のない世界'}の余白`,
    summary: rawText.length > 50 ? `${rawText.slice(0, 50)}...という不思議な夢。` : rawText,
    category: hasWork ? '仕事の夢' : hasCat ? '動物と出会う夢' : hasFly ? '空想・SF' : '日常の歪み',
    characters: words.filter(w => /猫|人|犬|部長|友達|私|自分/.test(w)).slice(0, 3),
    places: ['寝起きの狭間', '不思議な場所'],
    motifs: words.slice(0, 5),
    mood: ['シュール', '静寂', '目覚めの余韻'],
    parameters: {
      surrealism: Math.floor(Math.random() * 30) + 70,
      workFactor: hasWork ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20),
      catFactor: hasCat ? Math.floor(Math.random() * 30) + 70 : 0,
      floatiness: hasFly ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 30,
      logicBreak: Math.floor(Math.random() * 25) + 75,
      vividness: Math.floor(Math.random() * 30) + 65,
    },
    shareCopy: `今日の夢：${rawText.slice(0, 40)}... #夢のあと`,
    directorNote: '朝起きたての脳が上映した、世界で唯一の短編映画。',
    punchline: '（目が覚めたとき、少しだけ現実が遠かった）'
  };
}

// POST /api/analyze-dream
app.post('/api/analyze-dream', async (req, res) => {
  try {
    const rawTranscription = sanitizeTextInput(req.body?.rawTranscription);
    if (!rawTranscription) {
      res.status(400).json({ error: 'rawTranscription is required and must not be empty' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return realistic simulated analysis based on input
      const fallback = generateFallbackAnalysis(rawTranscription);
      res.json(fallback);
      return;
    }

    const prompt = `あなたは「夢のあと」というアプリの専属AIストーリーテラーです。
ユーザーが起床直後に話した断片的な夢の音声書き起こしをもとに、夢のタイトル・要約・カテゴリ・パラメータ・SNS用コピーをJSON形式で整理してください。

【厳守事項】
- 医療・心理診断やトラウマの断定は絶対に避けてください。あくまで「遊び・エンタメ・作品化」としての整理です。
- 事実を勝手に追加しすぎず、寝起き特有の少し不思議でユーモラスな空気感を大切にしてください。
- タイトルは魅力的で詩的、または少しシュールな日本語（20文字以内）にしてください。

夢の記録テキスト：
"""
${rawTranscription}
"""
`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: '夢のタイトル' },
            summary: { type: Type.STRING, description: '夢の1〜2行の要約' },
            category: { type: Type.STRING, description: 'カテゴリ（例：仕事の夢、空想・SF、日常の歪み、冒険、懐古など）' },
            characters: { type: Type.ARRAY, items: { type: Type.STRING }, description: '登場人物・存在' },
            places: { type: Type.ARRAY, items: { type: Type.STRING }, description: '場所・空間' },
            motifs: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'モチーフ・アイテムキーワード' },
            mood: { type: Type.ARRAY, items: { type: Type.STRING }, description: '雰囲気のタグ' },
            parameters: {
              type: Type.OBJECT,
              properties: {
                surrealism: { type: Type.INTEGER, description: 'シュール度 0-100' },
                workFactor: { type: Type.INTEGER, description: '職場・タスク成分 0-100' },
                catFactor: { type: Type.INTEGER, description: '猫・動物成分 0-100' },
                floatiness: { type: Type.INTEGER, description: '浮遊感・浮力 0-100' },
                logicBreak: { type: Type.INTEGER, description: 'ロジック崩壊度 0-100' },
                vividness: { type: Type.INTEGER, description: '色彩・鮮明度 0-100' },
              },
              required: ['surrealism', 'workFactor', 'catFactor', 'floatiness', 'logicBreak', 'vividness']
            },
            shareCopy: { type: Type.STRING, description: 'SNS投稿用の文章（#夢のあと 付き）' },
            directorNote: { type: Type.STRING, description: '映画風のショートキャッチコピー' },
            punchline: { type: Type.STRING, description: '起床後の心のツッコミ' }
          },
          required: ['title', 'summary', 'category', 'characters', 'places', 'motifs', 'mood', 'parameters', 'shareCopy']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      res.json(data);
    } else {
      res.json(generateFallbackAnalysis(rawTranscription));
    }
  } catch (error) {
    console.error('Error analyzing dream:', error);
    // Return gracefully with fallback
    const fallback = generateFallbackAnalysis(req.body.rawTranscription || '');
    res.json(fallback);
  }
});

// Helper for server-side deduplication of repeated phrases
function cleanAndDeduplicateServerTranscript(raw: string, keywords: string[] = []): string {
  if (!raw) return '';
  let text = raw.trim();

  // Normalize spaces
  text = text.replace(/[\t ]+/g, ' ');

  // Detect repeating sequences of length 4 to 120 chars
  const maxChunkLen = Math.min(120, Math.floor(text.length / 2));
  for (let len = maxChunkLen; len >= 4; len--) {
    let i = 0;
    while (i <= text.length - len * 2) {
      const chunk = text.slice(i, i + len);
      if (/^[、。\s\n！？!?・…]+$/.test(chunk)) {
        i++;
        continue;
      }
      let repeats = 1;
      while (
        i + (repeats + 1) * len <= text.length &&
        text.slice(i + repeats * len, i + (repeats + 1) * len) === chunk
      ) {
        repeats++;
      }
      if (repeats > 1) {
        text = text.slice(0, i + len) + text.slice(i + repeats * len);
      } else {
        i++;
      }
    }
  }

  // Clause level deduplication
  const segments = text.split(/([、。\n\s]+)/);
  const cleaned: string[] = [];
  let lastText = '';
  for (const s of segments) {
    if (/^[、。\n\s]+$/.test(s)) {
      cleaned.push(s);
    } else {
      const trimmed = s.trim();
      if (trimmed.length >= 3 && trimmed === lastText) {
        if (cleaned.length > 0 && /^[、。\s]+$/.test(cleaned[cleaned.length - 1])) {
          cleaned.pop();
        }
        continue;
      }
      lastText = trimmed;
      cleaned.push(s);
    }
  }
  text = cleaned.join('');

  // Keyword dictionary phonetic tuning
  for (const kw of keywords) {
    const cleanKw = kw.trim();
    if (!cleanKw || cleanKw.length < 2) continue;
    if (cleanKw === 'しおちゃん') {
      text = text.replace(/塩ちゃん|シオちゃん|潮ちゃん|しおチャン/g, 'しおちゃん');
    }
  }

  text = text.replace(/[、。]{2,}/g, '。');
  return text.trim();
}

// POST /api/transcribe-voice (AI Voiceprint Tuning & Speech De-duplication)
app.post('/api/transcribe-voice', async (req, res) => {
  try {
    const rawDraft = sanitizeTextInput(req.body?.rawDraft);
    const audioData = typeof req.body?.audioData === 'string' ? req.body.audioData : undefined;
    const voiceprintProfile = req.body?.voiceprintProfile;
    
    // Sanitize keywords array safely
    const rawKeywords = Array.isArray(voiceprintProfile?.frequentKeywords) ? voiceprintProfile.frequentKeywords : [];
    const keywords: string[] = rawKeywords
      .filter((k: unknown): k is string => typeof k === 'string')
      .map((k: string) => sanitizeTextInput(k, 50))
      .filter(Boolean)
      .slice(0, 30);

    const pitchCategory = ['low', 'mid', 'high'].includes(voiceprintProfile?.pitchCategory) 
      ? voiceprintProfile.pitchCategory 
      : 'mid';
    const isMorningBoost = voiceprintProfile?.morningVoiceBoost ?? true;

    // Fast rule-based clean first
    const ruleCleaned = cleanAndDeduplicateServerTranscript(rawDraft, keywords);

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        transcribedText: ruleCleaned,
        method: 'local_voiceprint_rules',
        deduplicated: ruleCleaned !== rawDraft,
      });
      return;
    }

    const keywordHint = keywords.length > 0
      ? `\n【ユーザー登録の重要人物・固有名詞辞書】: ${keywords.join(', ')} (音の似た語彙はこれらに寄せて正確に表記)`
      : '';

    const parts: any[] = [];

    // If base64 audio data provided
    if (audioData && typeof audioData === 'string' && audioData.includes('base64,')) {
      const mimeMatch = audioData.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
      const base64Data = audioData.split('base64,')[1];
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const promptText = `あなたは起床直後の「夢の記録」音声の専門AI文字起こし・声紋補正エンジンです。
ユーザーは寝起きの状態で夢を語っており、寝起き特有のかすれ声・ぼそぼそ声、およびブラウザ音声認識の連続反復リピート不具合が発生しています。

【ユーザーの声紋・声質プロファイル】
- 声質トーン: ${pitchCategory === 'low' ? '落ち着いた低音（寝起き・ハスキー）' : pitchCategory === 'high' ? '高音（明瞭）' : '自然な中音域'}
- 寝起きかすれ声ブースト: ${isMorningBoost ? '有効' : '無効'}${keywordHint}

【厳守指示】
1. 音声または下書きテキストを分析し、自然で正確な日本語の文章として整理してください。
2. 同一フレーズや文が連続して何度も繰り返されているリピートバグ（例：「水族館に行って新しいを見る水族館に行って新しいを見る」「いい夢を見ましたいい夢を見ました」）は【完全に1回だけに整理・排除】してください。
3. ユーザー辞書にある言葉（例:「しおちゃん」等）は誤認（塩ちゃん、潮など）を正しく修正してください。
4. 説明や前置き、解説は一切書かず、補正後の日本語テキストのみを出力してください。

${rawDraft ? `【下書きテキスト】:\n"""\n${rawDraft}\n"""` : ''}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts,
      },
    });

    const output = response.text ? response.text.trim() : ruleCleaned;
    const finalCleaned = cleanAndDeduplicateServerTranscript(output, keywords);

    res.json({
      transcribedText: finalCleaned,
      method: 'gemini_voiceprint_ai',
      deduplicated: true,
    });
  } catch (error) {
    console.error('Error in transcribe-voice:', error);
    const keywords = req.body?.voiceprintProfile?.frequentKeywords || [];
    const fallback = cleanAndDeduplicateServerTranscript(req.body?.rawDraft || '', keywords);
    res.json({
      transcribedText: fallback,
      method: 'fallback_rules',
    });
  }
});

// POST /api/generate-comic
app.post('/api/generate-comic', async (req, res) => {
  try {
    const title = sanitizeTextInput(req.body?.title, 100);
    const summary = sanitizeTextInput(req.body?.summary, 1000);
    const rawTranscription = sanitizeTextInput(req.body?.rawTranscription);
    const style = sanitizeTextInput(req.body?.style, 50) || 'retro_manga';
    const customStylePrompt = sanitizeTextInput(req.body?.customStylePrompt, 200);

    const styleLabels: Record<string, string> = {
      retro_manga: '昭和レトロ漫画（1970〜80年代の少年漫画・劇画風）',
      storybook: '水彩絵本（温かみのある童話絵本風）',
      cyber_game: '8-Bit ドットRPG（懐かしいピクセルアートゲーム風）',
      movie_poster: '35mm シネマ（単館系映画スチル風）',
      custom: customStylePrompt ? `自由記述（${customStylePrompt}）` : '自由記述テイスト',
    };

    const resolvedStyleLabel = customStylePrompt ? `カスタム: ${customStylePrompt}` : (styleLabels[style] || '昭和レトロ漫画');

    const ai = getGeminiClient();
    if (!ai) {
      // Return high quality structured fallback comic
      res.json({
        id: `comic-${Date.now()}`,
        title: title || '消えゆく夢のスケッチ',
        style,
        styleLabel: resolvedStyleLabel,
        customStylePrompt,
        generatedAt: new Date().toISOString(),
        punchline: '「目が覚めたら、枕元にはいつもの現実があった。」',
        panels: [
          {
            panelNumber: 1,
            stage: '起',
            heading: 'はじまりの場面',
            description: summary || rawTranscription.slice(0, 40),
            dialogue: '「ここは…どこだろう？」',
            motifIcon: 'Sparkles',
            colorTone: '#252D4B',
          },
          {
            panelNumber: 2,
            stage: '承',
            heading: '奇妙な展開',
            description: '突然、予期せぬ出来事や不思議な存在が現れる。',
            dialogue: '「えっ、どうしてこうなるの！？」',
            motifIcon: 'Zap',
            colorTone: '#D2725E',
          },
          {
            panelNumber: 3,
            stage: '転',
            heading: 'クライマックス',
            description: '常識が完全に崩壊し、夢ならではの飛躍が起こる。',
            dialogue: '「もう何がなんだか分からない！」',
            motifIcon: 'Compass',
            colorTone: '#BDB1D5',
          },
          {
            panelNumber: 4,
            stage: '結',
            heading: '目覚めと余韻',
            description: '目覚ましのアラームが鳴り、静かな朝が訪れる。',
            dialogue: '（不思議と心地いい朝だった）',
            motifIcon: 'Sun',
            colorTone: '#B3C0AA',
          },
        ],
        moviePoster: {
          catchphrase: `${title || '夢の記憶'} —— 消える前の、朝一番のスペクタクル。`,
          directorNote: '朝の脳内シアター特別上映',
          genreTag: 'シュールレアリスム・モーニング',
          cast: ['自分', '夢の住人たち'],
          releaseSeason: '今朝 起床ロードショー',
        },
      });
      return;
    }

    const prompt = `あなたは夢を4コマ漫画作品に変換するプロの漫画作家・シナリオライターAIです。
以下の夢の情報をもとに、起承転結の4コマ漫画シナリオと映画ポスター風情報を生成してください。

画風スタイル：${resolvedStyleLabel}
${customStylePrompt ? `ユーザー指定の特別テイスト：${customStylePrompt}` : ''}
夢のタイトル：${title}
要約：${summary}
元の記録：${rawTranscription}

【4コマ構成の原則】
1. 起：夢の舞台・初期状況を提示
2. 承：夢の中の人物や事件の発生
3. 転：ありえない展開・常識の崩壊（シュールな笑い・衝撃）
4. 結：夢らしいオチ、または起床後のツッコミ・余韻
`;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: '4コマのタイトル' },
            punchline: { type: Type.STRING, description: 'オチの一言ツッコミ' },
            panels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  panelNumber: { type: Type.INTEGER },
                  stage: { type: Type.STRING, description: '起, 承, 転, 結 のいずれか' },
                  heading: { type: Type.STRING, description: 'コマの見出し' },
                  description: { type: Type.STRING, description: '場面の情景描写' },
                  dialogue: { type: Type.STRING, description: 'コマ内の短いセリフまたは心の声' },
                  motifIcon: { type: Type.STRING, description: '象徴アイコン名 (Sparkles, Cat, Coffee, Moon, Sun, Ship, Wind, Clock, Compass, Zap)' },
                  colorTone: { type: Type.STRING, description: 'カラーコード (#252D4B, #D2725E, #BDB1D5, #B3C0AA など)' },
                },
                required: ['panelNumber', 'stage', 'heading', 'description', 'dialogue', 'motifIcon', 'colorTone']
              }
            },
            moviePoster: {
              type: Type.OBJECT,
              properties: {
                catchphrase: { type: Type.STRING, description: 'ポスター用キャッチコピー' },
                directorNote: { type: Type.STRING, description: '配給・監督クレジット' },
                genreTag: { type: Type.STRING, description: 'ジャンル表記' },
                cast: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'キャスト' },
                releaseSeason: { type: Type.STRING, description: '公開情報' },
              },
              required: ['catchphrase', 'directorNote', 'genreTag', 'cast', 'releaseSeason']
            }
          },
          required: ['title', 'punchline', 'panels', 'moviePoster']
        }
      }
    });

    if (response.text) {
      const generated = JSON.parse(response.text);
      res.json({
        id: `comic-${Date.now()}`,
        title: generated.title || title,
        style,
        styleLabel: styleLabels[style] || '絵本風',
        generatedAt: new Date().toISOString(),
        punchline: generated.punchline,
        panels: generated.panels,
        moviePoster: generated.moviePoster,
      });
    } else {
      res.status(500).json({ error: 'Failed to generate comic strip' });
    }
  } catch (error) {
    console.error('Error generating comic:', error);
    res.status(500).json({ error: 'Internal server error during comic generation' });
  }
});

// Helper: build prompt for image generation based on style and scene
function buildImagePrompt(sceneDescription: string, heading: string, style: string, dreamTitle?: string, customStyle?: string): string {
  const context = `Scene: ${heading} - ${sceneDescription}. (Context: ${dreamTitle || 'Dream memory'})`;

  if (customStyle && customStyle.trim().length > 0) {
    return `Artistic illustration/manga masterpiece in the following custom style: "${customStyle.trim()}". High quality artwork depicting: ${context}, clean expressive visual composition, no speech bubbles or text labels.`;
  }

  switch (style) {
    case 'retro_manga':
      return `Classic 1970s-1980s Japanese shonen manga comic art style, monochrome black and white ink, screentone halftone texture, dynamic expressive comic panel composition, dramatic linework, vintage manga illustration of: ${context}, high contrast ink, no speech bubbles.`;
    case 'storybook':
      return `Gentle whimsical watercolor fairy tale picture book illustration, soft pastel colors, textured handmade paper, warm cozy lighting, dreamy atmospheric art of: ${context}, artistic storybook illustration.`;
    case 'cyber_game':
      return `Detailed 16-bit retro pixel art aesthetic, nostalgic Japanese classic RPG adventure screenshot, vibrant pixel sprites and scenery depicting: ${context}, pixelated masterpiece.`;
    case 'movie_poster':
    case 'cinema':
      return `Cinematic movie still, 35mm film photography, cinematic lighting, moody atmospheric depth of field, poetic surreal cinema composition of: ${context}, masterpiece 4k cinematography.`;
    default:
      return `Artistic dreamlike surreal illustration, poetic mood, aesthetic lighting, beautiful visual art depicting: ${context}.`;
  }
}

function formatGeminiError(error: any): string {
  const errMsg = String(error?.message || error || '');
  
  if (errMsg.includes('exceeded its monthly spending cap') || errMsg.includes('spending cap') || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'Google AI Studioの月間利用上限（Monthly Spending Cap）に達しました。AI Studio（https://ai.studio/spend）にて上限をご確認・変更いただけます。現在は内蔵グラフィックでお楽しみいただけます。';
  }
  if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('invalid api key')) {
    return 'APIキーが無効または未設定です。設定から有効なGEMINI_API_KEYをご確認ください。';
  }
  if (errMsg.includes('Quota exceeded') || errMsg.includes('rate limit')) {
    return 'APIのリクエスト制限に達しました。少し時間を置いてから再試行してください。';
  }
  
  // Try to parse json error if any
  try {
    const parsed = JSON.parse(errMsg);
    if (parsed?.error?.message) {
      return formatGeminiError(parsed.error.message);
    }
  } catch {}

  return errMsg.length > 120 ? errMsg.slice(0, 120) + '...' : errMsg;
}

// POST /api/generate-ai-image (Generate single image for comic panel or dream key visual)
app.post('/api/generate-ai-image', async (req, res) => {
  try {
    const rawPrompt = sanitizeTextInput(req.body?.prompt, 1000);
    const heading = sanitizeTextInput(req.body?.heading, 100);
    const description = sanitizeTextInput(req.body?.description, 500);
    const style = sanitizeTextInput(req.body?.style, 50) || 'storybook';
    const customStyle = sanitizeTextInput(req.body?.customStyle, 200);
    const dreamTitle = sanitizeTextInput(req.body?.dreamTitle, 100);
    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const aspectRatio = validRatios.includes(req.body?.aspectRatio) ? req.body.aspectRatio : '1:1';

    const finalPrompt = rawPrompt || buildImagePrompt(description, heading, style, dreamTitle, customStyle);

    const ai = getGeminiClient();
    if (!ai) {
      console.warn('API key not configured for image generation');
      res.status(503).json({ 
        error: 'APIキーが設定されていません。SettingsからGEMINI_API_KEYをご確認ください。',
        promptUsed: finalPrompt 
      });
      return;
    }

    console.log('Generating image for prompt:', finalPrompt);

    // Call Gemini Image Generation model
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
        },
      },
    });

    let imageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (imageUrl) {
      console.log('Successfully generated image!');
      res.json({ 
        imageUrl, 
        promptUsed: finalPrompt,
        costEstimate: {
          usd: 0.03,
          jpy: 4.5,
          model: MODEL_IMAGE
        }
      });
    } else {
      console.warn('No image data found in response parts:', JSON.stringify(response.candidates?.[0]?.content));
      res.status(500).json({ error: '画像データの取得に失敗しました。', promptUsed: finalPrompt });
    }
  } catch (error: any) {
    console.error('Error generating image:', error);
    const friendlyMessage = formatGeminiError(error);
    const isSpendingCap = String(error?.message || '').includes('spending cap') || String(error?.message || '').includes('429');
    res.status(isSpendingCap ? 429 : 500).json({ 
      error: friendlyMessage,
      isSpendingCap,
    });
  }
});

// POST /api/generate-all-panel-images (Generate all panels images in parallel with safe limit)
app.post('/api/generate-all-panel-images', async (req, res) => {
  try {
    const rawPanels = req.body?.panels;
    if (!rawPanels || !Array.isArray(rawPanels)) {
      res.status(400).json({ error: 'panels array is required' });
      return;
    }
    const panels = rawPanels.slice(0, MAX_PANELS_BATCH_LIMIT);
    const style = sanitizeTextInput(req.body?.style, 50) || 'storybook';
    const customStyle = sanitizeTextInput(req.body?.customStyle, 200);
    const dreamTitle = sanitizeTextInput(req.body?.dreamTitle, 100);

    const ai = getGeminiClient();
    if (!ai) {
      console.warn('API key not configured');
      res.status(503).json({ error: 'APIキーが設定されていません。' });
      return;
    }

    console.log(`Starting parallel image generation for ${panels.length} panels, style: ${style}, custom: ${customStyle}`);

    // Process panels safely in parallel
    const imagePromises = panels.map(async (panel: any) => {
      const panelDesc = sanitizeTextInput(panel.description, 500);
      const panelHeading = sanitizeTextInput(panel.heading, 100);
      const prompt = buildImagePrompt(panelDesc, panelHeading, style, dreamTitle, customStyle);
      try {
        const response = await ai.models.generateContent({
          model: MODEL_IMAGE,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: { aspectRatio: '1:1' },
          },
        });

        let imageUrl: string | null = null;
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        return {
          panelNumber: panel.panelNumber,
          imageUrl,
          promptUsed: prompt,
        };
      } catch (err: any) {
        console.error(`Error generating panel ${panel.panelNumber}:`, err);
        return {
          panelNumber: panel.panelNumber,
          imageUrl: null,
          error: err?.message,
        };
      }
    });

    const results = await Promise.all(imagePromises);
    const successCount = results.filter(r => r.imageUrl).length;
    res.json({ 
      results,
      costEstimate: {
        totalUsd: +(successCount * 0.03).toFixed(3),
        totalJpy: Math.round(successCount * 4.5),
        generatedCount: successCount,
        unitPriceUsd: 0.03,
        unitPriceJpy: 4.5,
        model: MODEL_IMAGE
      }
    });
  } catch (error: any) {
    console.error('Error in batch image generation:', error);
    res.status(500).json({ error: error?.message || '一括生成中にエラーが発生しました' });
  }
});

// Start Express with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
