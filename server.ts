import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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
    const { rawTranscription } = req.body;
    if (!rawTranscription || typeof rawTranscription !== 'string') {
      res.status(400).json({ error: 'rawTranscription is required' });
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
      model: 'gemini-3.7-flash',
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

// POST /api/generate-comic
app.post('/api/generate-comic', async (req, res) => {
  try {
    const { title, summary, rawTranscription, style = 'retro_manga', customStylePrompt = '' } = req.body;

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
      model: 'gemini-3.7-flash',
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
    const { prompt: rawPrompt, heading = '', description = '', style = 'storybook', customStyle = '', dreamTitle = '', aspectRatio = '1:1' } = req.body;

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

    // Call Gemini Image Generation model (gemini-3.1-flash-lite-image)
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
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
          model: 'gemini-3.1-flash-lite-image'
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

// POST /api/generate-all-panel-images (Generate all 4 panels images in parallel)
app.post('/api/generate-all-panel-images', async (req, res) => {
  try {
    const { panels, style = 'storybook', customStyle = '', dreamTitle = '' } = req.body;
    if (!panels || !Array.isArray(panels)) {
      res.status(400).json({ error: 'panels array is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.warn('API key not configured');
      res.status(503).json({ error: 'APIキーが設定されていません。' });
      return;
    }

    console.log(`Starting parallel image generation for ${panels.length} panels, style: ${style}, custom: ${customStyle}`);

    // Process all panels in parallel
    const imagePromises = panels.map(async (panel: any) => {
      const prompt = buildImagePrompt(panel.description || '', panel.heading || '', style, dreamTitle, customStyle);
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
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
        model: 'gemini-3.1-flash-lite-image'
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
