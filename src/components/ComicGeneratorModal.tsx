import React, { useState, useEffect } from 'react';
import { ComicStrip, ComicPanel, DreamRecord } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { ComicPanelGraphic } from './ComicPanelGraphic';
import { 
  X, Sparkles, Download, RefreshCw, Copy, Check, BookOpen, Film, 
  Gamepad2, Palette, AlertCircle, Coins, Info, Wand2, CheckCircle2,
  Brush, ChevronRight, Loader2
} from 'lucide-react';

interface ComicGeneratorModalProps {
  isOpen: boolean;
  dream: DreamRecord;
  onClose: () => void;
  onSaveComic: (comic: ComicStrip) => void;
}

const PRESET_STYLES = [
  { id: 'retro_manga', label: '昭和レトロ漫画', icon: BookOpen, desc: '白黒スクリーントーン・劇画タッチ' },
  { id: 'storybook', label: '水彩絵本', icon: Brush, desc: 'やわらかな水彩・パステルカラー' },
  { id: 'cyber_game', label: '8-Bit ドット絵', icon: Gamepad2, desc: 'レトロRPG・ピクセルアート' },
  { id: 'cinema_poster', label: 'シネマポスター', icon: Film, desc: '35mmフィルム・映画風ライティング' },
  { id: 'custom', label: '✏️ 自由記述テイスト', icon: Palette, desc: 'お好みの画風・アニメ風を自由に指定' },
];

const SUGGESTED_TAGS = [
  'ジブリ風の優しい水彩アニメーション',
  '浮世絵版画・大正ロマン',
  '90年代サイバーパンク・ネオン',
  '水墨画・モノクロ山水',
  'ダリ風シュールレアリスム',
  '新海誠風の光と色彩',
  'クレイアニメ・人形劇',
  'ダークファンタジー油絵',
];

export const ComicGeneratorModal: React.FC<ComicGeneratorModalProps> = ({
  isOpen,
  dream,
  onClose,
  onSaveComic,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(dream.comicStrip?.style || 'retro_manga');
  const [customStyleText, setCustomStyleText] = useState<string>(dream.comicStrip?.customStylePrompt || '');
  const [comicData, setComicData] = useState<ComicStrip | null>(dream.comicStrip || null);
  const [isGeneratingStructure, setIsGeneratingStructure] = useState<boolean>(false);
  const [isGeneratingAllImages, setIsGeneratingAllImages] = useState<boolean>(false);
  const [activeGeneratingPanel, setActiveGeneratingPanel] = useState<number | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; stageName: string } | null>(null);
  const [panelErrors, setPanelErrors] = useState<Record<number, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<string | null>(null);
  const [showCostDetails, setShowCostDetails] = useState<boolean>(false);

  const [showSpendingCapAlert, setShowSpendingCapAlert] = useState<boolean>(false);

  // Generate or re-generate comic story structure (4 panels text)
  const handleGenerateStructure = async (styleKey = selectedStyle, customText = customStyleText) => {
    setIsGeneratingStructure(true);
    setGlobalError(null);
    setPanelErrors({});
    if (styleKey === 'cyber_game') {
      audioEngine.play8BitJingle();
    } else {
      audioEngine.playMechanicalClick('high');
    }

    try {
      const response = await fetch('/api/generate-comic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dream.title,
          summary: dream.summary,
          rawTranscription: dream.rawTranscription,
          style: styleKey,
          customStylePrompt: styleKey === 'custom' ? customText : undefined,
        }),
      });

      if (!response.ok) throw new Error('4コマ構成の生成に失敗しました');

      const data: ComicStrip = await response.json();
      setComicData(data);
      onSaveComic(data);
    } catch (err: any) {
      console.error('Error generating comic structure:', err);
      // High-craft fallback tailored to dream content
      const resolvedLabel = styleKey === 'custom' && customText ? `カスタム: ${customText}` : (PRESET_STYLES.find(s => s.id === styleKey)?.label || '昭和レトロ漫画');
      const fallbackComic: ComicStrip = {
        id: `comic-${Date.now()}`,
        title: dream.title,
        style: styleKey as any,
        styleLabel: resolvedLabel,
        customStylePrompt: customText,
        generatedAt: new Date().toISOString(),
        punchline: '「目が覚めた瞬間、少しだけ現実の輪郭が遠かった。」',
        panels: [
          {
            panelNumber: 1,
            stage: '起',
            heading: '目覚め前の境界線',
            description: dream.summary.slice(0, 45) || 'いつもの日常が静かに歪み、別の時空へ接続する。',
            dialogue: '「……あれ？ ここ、いつもの場所じゃないような？」',
            motifIcon: 'Moon',
            colorTone: '#252D4B',
          },
          {
            panelNumber: 2,
            stage: '承',
            heading: '常識のすり替わり',
            description: '見慣れた登場人物が不思議な存在になり、真顔で話しかけてくる。',
            dialogue: '「この書類、ちゅ〜る味のインクで捺印してね。」',
            motifIcon: 'Cat',
            colorTone: '#D2725E',
          },
          {
            panelNumber: 3,
            stage: '転',
            heading: '重力のサヨナラ',
            description: '空間がふわりと広がり、全員が星空へ浮遊し始める。',
            dialogue: '「うわああ！ キーボード置いてきちゃったー！！」',
            motifIcon: 'Zap',
            colorTone: '#BDB1D5',
          },
          {
            panelNumber: 4,
            stage: '結',
            heading: '定刻のサイレン',
            description: '激しいアラーム音とともに、いつもの天井が視界に戻る。',
            dialogue: '（……夢の続き、どこかに保存できないかな）',
            motifIcon: 'Sun',
            colorTone: '#B3C0AA',
          },
        ],
      };
      setComicData(fallbackComic);
      onSaveComic(fallbackComic);
    } finally {
      setIsGeneratingStructure(false);
    }
  };

  // Generate real AI image for a single panel
  const handleGenerateSinglePanelImage = async (panelNumber: number) => {
    if (!comicData) return;
    const panel = comicData.panels.find(p => p.panelNumber === panelNumber);
    if (!panel) return;

    setActiveGeneratingPanel(panelNumber);
    setPanelErrors(prev => {
      const next = { ...prev };
      delete next[panelNumber];
      return next;
    });
    setGlobalError(null);
    audioEngine.playMechanicalClick('high');

    try {
      const response = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: panel.heading,
          description: panel.description,
          style: selectedStyle,
          customStyle: selectedStyle === 'custom' ? customStyleText : undefined,
          dreamTitle: comicData.title,
          aspectRatio: '1:1',
        }),
      });

      const data = await response.json();
      if (response.status === 429 || data.isSpendingCap || String(data.error || '').includes('利用上限') || String(data.error || '').includes('spending cap')) {
        setShowSpendingCapAlert(true);
      }

      if (data.imageUrl) {
        const updatedPanels = comicData.panels.map(p => 
          p.panelNumber === panelNumber ? { ...p, imageUrl: data.imageUrl } : p
        );
        const count = updatedPanels.filter(p => !!p.imageUrl).length;
        const updatedComic: ComicStrip = { 
          ...comicData, 
          panels: updatedPanels,
          costInfo: {
            totalUsd: +(count * 0.03).toFixed(3),
            totalJpy: Math.round(count * 4.5),
            generatedCount: count,
          }
        };
        setComicData(updatedComic);
        onSaveComic(updatedComic);
        audioEngine.play8BitJingle();
      } else {
        throw new Error(data.error || '画像データの取得に失敗しました');
      }
    } catch (err: any) {
      console.error(`Error generating panel ${panelNumber}:`, err);
      const errMsg = err?.message || '作画エラー';
      setPanelErrors(prev => ({ ...prev, [panelNumber]: errMsg }));
      if (errMsg.includes('利用上限') || errMsg.includes('spending cap') || errMsg.includes('429')) {
        setShowSpendingCapAlert(true);
      }
    } finally {
      setActiveGeneratingPanel(null);
    }
  };

  // Progressive Batch Generation: Generate all 4 panel images in sequence
  // Updates state live as each image arrives so the user sees real-time progress!
  const handleGenerateAllPanelImagesProgressive = async () => {
    if (!comicData || isGeneratingAllImages) return;
    setIsGeneratingAllImages(true);
    setGlobalError(null);
    setPanelErrors({});
    audioEngine.play8BitJingle();

    let currentComic = { ...comicData };
    let hadSpendingCap = false;

    for (let i = 0; i < currentComic.panels.length; i++) {
      const panel = currentComic.panels[i];
      setBatchProgress({
        current: i + 1,
        total: currentComic.panels.length,
        stageName: `${panel.stage}（第${panel.panelNumber}コマ）`
      });
      setActiveGeneratingPanel(panel.panelNumber);

      try {
        const response = await fetch('/api/generate-ai-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            heading: panel.heading,
            description: panel.description,
            style: selectedStyle,
            customStyle: selectedStyle === 'custom' ? customStyleText : undefined,
            dreamTitle: currentComic.title,
            aspectRatio: '1:1',
          }),
        });

        const data = await response.json();
        if (response.status === 429 || data.isSpendingCap || String(data.error || '').includes('利用上限') || String(data.error || '').includes('spending cap')) {
          hadSpendingCap = true;
          setShowSpendingCapAlert(true);
        }

        if (data.imageUrl) {
          const updatedPanels = currentComic.panels.map(p => 
            p.panelNumber === panel.panelNumber ? { ...p, imageUrl: data.imageUrl } : p
          );
          const count = updatedPanels.filter(p => !!p.imageUrl).length;
          currentComic = {
            ...currentComic,
            panels: updatedPanels,
            costInfo: {
              totalUsd: +(count * 0.03).toFixed(3),
              totalJpy: Math.round(count * 4.5),
              generatedCount: count,
            }
          };
          setComicData(currentComic);
          onSaveComic(currentComic);
        } else {
          setPanelErrors(prev => ({ ...prev, [panel.panelNumber]: data.error || '作画失敗' }));
        }
      } catch (err: any) {
        console.error(`Error in progressive batch panel ${panel.panelNumber}:`, err);
        const errMsg = err?.message || '通信エラー';
        setPanelErrors(prev => ({ ...prev, [panel.panelNumber]: errMsg }));
        if (errMsg.includes('利用上限') || errMsg.includes('spending cap') || errMsg.includes('429')) {
          hadSpendingCap = true;
          setShowSpendingCapAlert(true);
        }
      }
    }

    setActiveGeneratingPanel(null);
    setBatchProgress(null);
    setIsGeneratingAllImages(false);

    if (hadSpendingCap) {
      setShowSpendingCapAlert(true);
    } else {
      setShowShareToast('4コマの作画が完了しました！✨');
      setTimeout(() => setShowShareToast(null), 3500);
    }
  };

  // Initial structure generation on modal open if no comic exists
  useEffect(() => {
    if (isOpen && !comicData) {
      handleGenerateStructure(selectedStyle, customStyleText);
    }
  }, [isOpen]);

  // X (Twitter) Share Intent helper
  const handleShareToTwitter = () => {
    if (!comicData) return;
    audioEngine.playMechanicalClick('high');

    const shareText = `今朝の夢をAIで4コマ漫画化しました！📖✨

『${comicData.title}』
【${comicData.styleLabel}】
${comicData.punchline}

#夢のあと #AI夢日記 #4コマ漫画`;

    // 1. Copy to clipboard
    navigator.clipboard.writeText(shareText);

    // 2. Open Twitter web intent
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');

    setShowShareToast('𝕏の投稿画面を開きました！保存した4コマ画像を添付してポストしよう✨');
    setTimeout(() => setShowShareToast(null), 4500);
  };

  const handleCopyShareText = () => {
    audioEngine.playMechanicalClick('high');
    const text = `『${comicData?.title || dream.title}』
【${comicData?.styleLabel || '4コマ漫画'}】
${comicData?.punchline || ''}

#夢のあと #AI夢日記 #4コマ漫画`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Real HTML5 Canvas Image Generator (Authentic Japanese 4-Koma Manga Layout: 840 x 2320)
  const handleDownloadImage = async () => {
    if (!comicData) return;
    setIsDownloading(true);
    audioEngine.playMechanicalClick('high');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // Professional 4-Koma Manga Resolution (High DPI)
      const width = 840;
      const height = 2320;
      canvas.width = width;
      canvas.height = height;

      // 1. Paper Background
      const isCyber = selectedStyle === 'cyber_game';
      ctx.fillStyle = isCyber ? '#0A0E17' : '#FAF8F5';
      ctx.fillRect(0, 0, width, height);

      // Subtle halftone screentone background for manga style
      if (selectedStyle === 'retro_manga') {
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let x = 0; x < width; x += 10) {
          for (let y = 0; y < height; y += 10) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. Outer Solid Manga Borders
      ctx.lineWidth = 6;
      ctx.strokeStyle = isCyber ? '#4EF2BB' : '#000000';
      ctx.strokeRect(24, 24, width - 48, height - 48);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isCyber ? '#1F2E44' : '#CCCCCC';
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // 3. Top Title Banner
      ctx.fillStyle = isCyber ? '#162032' : '#FFFFFF';
      ctx.fillRect(50, 48, width - 100, 115);
      ctx.lineWidth = 4;
      ctx.strokeStyle = isCyber ? '#4EF2BB' : '#000000';
      ctx.strokeRect(50, 48, width - 100, 115);

      // App Label Top Plaque
      ctx.fillStyle = isCyber ? '#4EF2BB' : '#000000';
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('夢のあと ４コマ劇場　— YUME NO ATO MANGA —', width / 2, 74);

      // Main Title
      ctx.fillStyle = isCyber ? '#FFFFFF' : '#000000';
      ctx.font = 'bold 32px serif';
      ctx.fillText(comicData.title, width / 2, 118);

      // Style & Meta
      ctx.font = '13px monospace';
      ctx.fillStyle = isCyber ? '#4EF2BB' : '#666666';
      ctx.fillText(`【 ${comicData.styleLabel} 】  シュール度: ${dream.parameters.surrealism}%  •  ${dream.dateLabel}`, width / 2, 147);

      // 4. Pre-load panel images safely
      const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
        comicData.panels.map(p => {
          if (!p.imageUrl) return Promise.resolve(null);
          return new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = p.imageUrl!;
          });
        })
      );

      // 5. Draw 4 Classic Manga Panels
      const panelYStart = 185;
      const panelWidth = width - 100; // 740px
      const panelHeight = 445;
      const panelGap = 26;
      const sfxList = ['ドドド…', 'ガーン！', 'ババーン!!', 'ピカーン✨'];

      comicData.panels.forEach((p, idx) => {
        const py = panelYStart + idx * (panelHeight + panelGap);
        const panelImg = loadedImages[idx];

        // Panel Box Outline
        ctx.fillStyle = isCyber ? '#121824' : '#FFFFFF';
        ctx.fillRect(50, py, panelWidth, panelHeight);
        ctx.lineWidth = 4;
        ctx.strokeStyle = isCyber ? '#4EF2BB' : '#000000';
        ctx.strokeRect(50, py, panelWidth, panelHeight);

        // Draw Image or Fallback Graphic
        if (panelImg) {
          ctx.save();
          // Clip to panel
          ctx.beginPath();
          ctx.rect(52, py + 2, panelWidth - 4, panelHeight - 4);
          ctx.clip();

          // Fill entire panel with image (cover mode)
          const imgAspect = panelImg.width / panelImg.height;
          const targetAspect = panelWidth / panelHeight;
          let drawW = panelWidth;
          let drawH = panelHeight;
          let drawX = 50;
          let drawY = py;

          if (imgAspect > targetAspect) {
            drawW = panelHeight * imgAspect;
            drawX = 50 - (drawW - panelWidth) / 2;
          } else {
            drawH = panelWidth / imgAspect;
            drawY = py - (drawH - panelHeight) / 2;
          }

          ctx.drawImage(panelImg, drawX, drawY, drawW, drawH);

          if (selectedStyle === 'retro_manga') {
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(50, py, panelWidth, panelHeight);
          }
          ctx.restore();
        } else {
          // Fallback stylized canvas art
          ctx.fillStyle = isCyber ? '#162032' : '#F5F2EB';
          ctx.fillRect(52, py + 2, panelWidth - 4, panelHeight - 4);

          ctx.fillStyle = isCyber ? '#4EF2BB' : '#999999';
          ctx.font = 'bold 20px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`[ 第${p.panelNumber}コマ: ${p.heading} ]`, width / 2, py + panelHeight / 2 - 15);
          ctx.font = '14px sans-serif';
          ctx.fillText(p.description.slice(0, 35), width / 2, py + panelHeight / 2 + 15);
        }

        // Stage Circle Badge (Top-Left of Panel)
        ctx.fillStyle = isCyber ? '#0A0E17' : '#000000';
        ctx.beginPath();
        ctx.arc(88, py + 38, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.stage, 88, py + 45);

        // Heading label tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(118, py + 20, 260, 36);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(118, py + 20, 260, 36);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`第${p.panelNumber}コマ • ${p.heading}`, 130, py + 44);

        // Manga Sound Effect (Top-Right)
        ctx.fillStyle = isCyber ? '#4EF2BB' : '#000000';
        ctx.font = '900 italic 24px serif';
        ctx.textAlign = 'right';
        ctx.save();
        ctx.translate(width - 70, py + 42);
        ctx.rotate(-0.08);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fillRect(-120, -22, 130, 36);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(-120, -22, 130, 36);
        ctx.fillStyle = '#000000';
        ctx.fillText(sfxList[(p.panelNumber - 1) % 4], 0, 4);
        ctx.restore();

        // Dialogue Speech Bubble
        if (p.dialogue) {
          const bubbleW = panelWidth - 60;
          const bubbleH = 62;
          const bubbleX = 80;
          const bubbleY = py + panelHeight - bubbleH - 18;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.beginPath();
          ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#000000';
          ctx.stroke();

          // Bubble Tail
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.beginPath();
          ctx.moveTo(bubbleX + 40, bubbleY);
          ctx.lineTo(bubbleX + 55, bubbleY - 10);
          ctx.lineTo(bubbleX + 60, bubbleY);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.dialogue, width / 2, bubbleY + 38);
        }
      });

      // 6. Bottom Punchline & Footer Area
      const footerY = panelYStart + 4 * (panelHeight + panelGap);
      ctx.fillStyle = isCyber ? '#162032' : '#FFFFFF';
      ctx.fillRect(50, footerY, panelWidth, 80);
      ctx.lineWidth = 3;
      ctx.strokeStyle = isCyber ? '#4EF2BB' : '#000000';
      ctx.strokeRect(50, footerY, panelWidth, 80);

      // Punchline Text
      ctx.fillStyle = isCyber ? '#4EF2BB' : '#A84432';
      ctx.font = 'bold italic 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(comicData.punchline, width / 2, footerY + 48);

      // Footer credits
      ctx.fillStyle = isCyber ? '#8B9BB4' : '#666666';
      ctx.font = '12px monospace';
      ctx.fillText('夢のあと - YUME NO ATO  |  朝の余白を作品にするAI夢採集アプリ', width / 2, height - 36);

      // Export as PNG
      const link = document.createElement('a');
      link.download = `yumenoto_4koma_${dream.id || Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setShowShareToast('本格4コマ画像を保存しました！𝕏に添付して共有しましょう✨');
      setTimeout(() => setShowShareToast(null), 3500);
    } catch (err) {
      console.error('Error generating canvas:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  // Calculated generated images count and estimated costs
  const generatedImagesCount = comicData?.panels.filter(p => !!p.imageUrl).length || 0;
  const costUsd = +(generatedImagesCount * 0.03).toFixed(2);
  const costJpy = Math.round(generatedImagesCount * 4.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] dark:bg-[#12161F] border-2 border-black dark:border-[#3A4659] rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white dark:bg-[#1A202C] border-b-2 border-black dark:border-[#3A4659] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-black text-base sm:text-lg text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
                <span>4コマ漫画スタジオ</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700">
                  Gemini AI 作画
                </span>
              </h2>
            </div>
          </div>

          {/* Right Action Controls: Cost Badge & Close */}
          <div className="flex items-center space-x-2">
            {/* Cost Badge */}
            <div className="relative">
              <button
                onClick={() => setShowCostDetails(!showCostDetails)}
                className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="画像生成コストの内訳を表示"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>約{costJpy}円 (${costUsd})</span>
                <Info className="w-3 h-3 opacity-60" />
              </button>

              {/* Cost Details Tooltip / Popover */}
              {showCostDetails && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-[#1A202C] border-2 border-black dark:border-neutral-700 rounded-xl shadow-xl z-50 text-xs text-neutral-800 dark:text-neutral-200">
                  <div className="font-bold border-b pb-1.5 mb-2 flex items-center justify-between">
                    <span>💡 作画APIコスト概算</span>
                    <button 
                      onClick={() => setShowCostDetails(false)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">使用モデル:</span>
                      <span className="font-bold">Gemini 3.1 Flash-Lite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">1コマ単価:</span>
                      <span>$0.03 / 約4.5円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">作画完了コマ数:</span>
                      <span className="font-bold text-amber-600">{generatedImagesCount} / 4 コマ</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t font-bold text-amber-700 dark:text-amber-400">
                      <span>現在の推定合計:</span>
                      <span>約 {costJpy} 円 (${costUsd})</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-neutral-500">
                    ※ 課金APIキーで生成された実際の概算費用です。
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Style Selection & Custom Style Toolbar */}
        <div className="px-4 sm:px-6 py-3 bg-[#F4EFE6] dark:bg-[#161C26] border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center space-x-1.5">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>画風スタイルを選択 / 指定:</span>
            </span>

            {/* 一括AI作画 Button with dynamic progress */}
            <button
              onClick={handleGenerateAllPanelImagesProgressive}
              disabled={isGeneratingAllImages || isGeneratingStructure || !comicData}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center space-x-1.5 transition-transform"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGeneratingAllImages ? 'animate-spin' : ''}`} />
              <span>
                {isGeneratingAllImages && batchProgress 
                  ? `${batchProgress.stageName} 作画中 (${batchProgress.current}/${batchProgress.total})` 
                  : '✨ 全コマ一括AI作画'}
              </span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5">
            {PRESET_STYLES.map(style => {
              const Icon = style.icon;
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    setSelectedStyle(style.id);
                    if (style.id !== 'custom') {
                      handleGenerateStructure(style.id, customStyleText);
                    }
                  }}
                  className={`px-2.5 py-2 rounded-xl border-2 text-left transition-all flex items-center space-x-2 cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#1E2638] border-black dark:border-amber-400 shadow-[3px_3px_0px_#000] scale-[1.02]'
                      : 'bg-white/60 dark:bg-white/5 border-neutral-300 dark:border-neutral-700 hover:bg-white/90 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500'}`} />
                  <div className="truncate">
                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {style.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Style Input Box */}
          {selectedStyle === 'custom' && (
            <div className="mt-3 p-3 bg-white dark:bg-[#1A202C] border-2 border-black dark:border-amber-400/80 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] animate-fade-in">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                ✏️ 自由記述テイスト（お好みの画風・アニメ風・作家風などを指定）:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customStyleText}
                  onChange={(e) => setCustomStyleText(e.target.value)}
                  placeholder="例: ジブリ風の優しい水彩アニメーション、90年代サイバーパンク、浮世絵版画..."
                  className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleGenerateStructure('custom', customStyleText);
                    }
                  }}
                />
                <button
                  onClick={() => handleGenerateStructure('custom', customStyleText)}
                  disabled={!customStyleText.trim() || isGeneratingStructure}
                  className="px-4 py-1.5 bg-black dark:bg-amber-500 hover:bg-neutral-800 text-white font-bold text-xs rounded-lg border border-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  このテイストで構成
                </button>
              </div>

              {/* Quick Tags Suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-neutral-500 self-center">クイック入力:</span>
                {SUGGESTED_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setCustomStyleText(tag);
                      handleGenerateStructure('custom', tag);
                    }}
                    className="px-2 py-0.5 text-[10px] bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-neutral-700 dark:text-neutral-300 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Batch Progress Banner */}
        {isGeneratingAllImages && batchProgress && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI作画進行中: {batchProgress.stageName} を描画しています ({batchProgress.current} / {batchProgress.total} コマ)</span>
            </div>
            <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
              {Math.round((batchProgress.current / batchProgress.total) * 100)}%
            </span>
          </div>
        )}

        {/* Share Toast Banner */}
        {showShareToast && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-bounce">
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{showShareToast}</span>
            </span>
            <button onClick={() => setShowShareToast(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* Spending Cap Exceeded Notice Banner */}
        {showSpendingCapAlert && (
          <div className="mx-4 mt-3 p-3 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 shadow-md animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-start space-x-2.5">
              <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900 dark:text-amber-300">
                  Google AI Studioの月間利用上限（Spending Cap）に達しています
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                  現在、内蔵の高品質グラフィック（ドット絵・レトロ漫画・水彩風）で4コマ漫画を表示しています。作品の閲覧・セリフ演出・PNG画像保存・𝕏ポストは制限なくそのままご利用いただけます。
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
              <a
                href="https://ai.studio/spend"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] rounded-lg shadow-sm cursor-pointer whitespace-nowrap"
              >
                上限設定を確認 ↗
              </a>
              <button
                onClick={() => setShowSpendingCapAlert(false)}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                title="閉じる"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Global error banner */}
        {globalError && (
          <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button 
              onClick={() => setGlobalError(null)}
              className="text-red-500 hover:text-red-700 text-xs font-bold ml-2 cursor-pointer"
            >
              閉じる
            </button>
          </div>
        )}

        {/* Main 4-Koma Manga Stage (Vertical Column Layout) */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF8F5] dark:bg-[#0E121A]">
          {isGeneratingStructure ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
              <p className="font-serif font-bold text-neutral-700 dark:text-neutral-300 text-sm animate-pulse">
                夢の記憶を起承転結の4コマ漫画に構成中……
              </p>
            </div>
          ) : comicData ? (
            <div className="max-w-xl mx-auto bg-white dark:bg-[#141A24] border-4 border-black dark:border-[#3A4659] rounded-xl p-4 sm:p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
              
              {/* Authentic Manga Title Plaque */}
              <div className="border-4 border-black dark:border-[#3A4659] p-3 text-center mb-4 bg-[#FAF7F2] dark:bg-[#1A2230] shadow-[3px_3px_0px_#000]">
                <div className="text-[10px] font-mono tracking-widest text-neutral-600 dark:text-neutral-400 uppercase font-black">
                  — 夢のあと ４コマ劇場 —
                </div>
                <h1 className="font-serif font-black text-xl sm:text-2xl text-neutral-900 dark:text-white mt-0.5">
                  {comicData.title}
                </h1>
                <div className="text-[11px] font-mono text-amber-800 dark:text-amber-300 mt-1 flex items-center justify-center space-x-2">
                  <span>【 {comicData.styleLabel} 】</span>
                  <span>•</span>
                  <span>シュール度: {dream.parameters.surrealism}%</span>
                  <span>•</span>
                  <span>{dream.dateLabel}</span>
                </div>
              </div>

              {/* 4 Comic Panels in Strict Vertical Flow */}
              <div className="space-y-4">
                {comicData.panels.map((panel) => (
                  <div key={panel.panelNumber} className="relative">
                    <ComicPanelGraphic
                      panel={panel}
                      styleId={selectedStyle}
                      customStylePrompt={customStyleText}
                      dreamTitle={comicData.title}
                      isGenerating={activeGeneratingPanel === panel.panelNumber}
                      error={panelErrors[panel.panelNumber] || null}
                      onGenerateImage={() => handleGenerateSinglePanelImage(panel.panelNumber)}
                      onDismissError={() => {
                        setPanelErrors(prev => {
                          const next = { ...prev };
                          delete next[panel.panelNumber];
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Punchline Footer Box */}
              <div className="mt-4 p-3.5 bg-[#FAF7F2] dark:bg-[#1A2230] border-2 border-black dark:border-[#3A4659] rounded-lg text-center shadow-[3px_3px_0px_#000]">
                <span className="text-[11px] font-mono font-bold text-neutral-500 block mb-1">
                  【 結のツッコミ / 余韻 】
                </span>
                <p className="font-serif font-black text-sm sm:text-base text-amber-900 dark:text-amber-300 italic">
                  {comicData.punchline}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions: X (Twitter) Direct Share, High-Res PNG Download, Copy Text */}
        <div className="p-4 bg-white dark:bg-[#1A202C] border-t-2 border-black dark:border-[#3A4659] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleGenerateStructure(selectedStyle, customStyleText)}
              disabled={isGeneratingStructure || isGeneratingAllImages}
              className="px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingStructure ? 'animate-spin' : ''}`} />
              <span>シナリオ再構成</span>
            </button>

            <button
              onClick={handleCopyShareText}
              className="px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 flex items-center space-x-1.5 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'コピー完了' : '本文コピー'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Direct X (Twitter) Share Button */}
            <button
              onClick={handleShareToTwitter}
              disabled={!comicData}
              className="px-4 py-2.5 bg-black hover:bg-neutral-900 text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2 transition-transform"
              title="X（Twitter）にポストする"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>𝕏 でポストする</span>
            </button>

            {/* High-Res PNG Manga Download Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading || !comicData}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2 transition-transform"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? '原稿出力中…' : '4コマ画像(PNG)保存'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
