import React, { useState, useRef, useEffect } from 'react';
import { DreamRecord } from '../types';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { 
  Share2, Copy, Check, Download, ExternalLink, Image as ImageIcon, 
  Sparkles, BookOpen, Clock, Calendar, Activity, Tag, ShieldCheck, Heart
} from 'lucide-react';
import { BakuMascot } from './DreamMascots';
import { CuteStamp } from './PlayfulAccents';
import { MoonCrestAsset, SparkleAsset, CloseCrossAsset, MangaFrameEmblem } from './IllustratedAssets';

interface DreamShareModalProps {
  isOpen: boolean;
  dream: DreamRecord;
  onClose: () => void;
}

type ShareFormat = 'card' | 'comic';

export const DreamShareModal: React.FC<DreamShareModalProps> = ({
  isOpen,
  dream,
  onClose,
}) => {
  const { currentStyle } = useUIStyle();
  const [selectedFormat, setSelectedFormat] = useState<ShareFormat>(
    dream.comicStrip ? 'comic' : 'card'
  );
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const hasComic = !!dream.comicStrip;

  // Render canvas when modal opens or format changes
  useEffect(() => {
    if (!isOpen) {
      setToastMessage(null);
      setCopiedText(false);
      return;
    }
    renderShareCanvas(selectedFormat);
  }, [isOpen, selectedFormat, dream]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  /**
   * HTML5 Canvasで高精細なシェア画像をレンダリング
   */
  const renderShareCanvas = async (format: ShareFormat) => {
    setIsGeneratingCanvas(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (format === 'comic' && dream.comicStrip) {
        // ==========================================
        // 4コマ漫画シェア画像 (Vertical 4-Panel)
        // ==========================================
        const width = 840;
        const height = 1460;
        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = '#FBF8F2';
        ctx.fillRect(0, 0, width, height);

        // Outer border
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 8;
        ctx.strokeRect(16, 16, width - 32, height - 32);

        // Header banner
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(24, 24, width - 48, 120);

        // Header Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px "Zen Maru Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`『${dream.comicStrip.title || dream.title}』`, width / 2, 80);

        // Subhead
        ctx.fillStyle = '#D1D5DB';
        ctx.font = '18px "Zen Maru Gothic", sans-serif';
        ctx.fillText(`【${dream.comicStrip.styleLabel}】朝の夢をAIで4コマ作品化`, width / 2, 118);

        // Panels
        const panelWidth = width - 80; // 760
        const panelHeight = 250;
        const startY = 170;
        const gap = 20;

        for (let idx = 0; idx < dream.comicStrip.panels.length; idx++) {
          const p = dream.comicStrip.panels[idx];
          const py = startY + idx * (panelHeight + gap);

          // Panel border & fill
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(40, py, panelWidth, panelHeight);
          ctx.strokeStyle = '#1F2937';
          ctx.lineWidth = 4;
          ctx.strokeRect(40, py, panelWidth, panelHeight);

          // Stage Badge (起・承・転・結)
          ctx.fillStyle = '#A84432';
          ctx.fillRect(40, py, 46, 46);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 22px "Zen Maru Gothic", serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.stage, 63, py + 32);

          // Heading
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 24px "Zen Maru Gothic", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(p.heading, 100, py + 34);

          // Image if exists
          let imgDrawn = false;
          if (p.imageUrl) {
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              await new Promise((resolve) => {
                img.onload = () => {
                  try {
                    ctx.drawImage(img, 52, py + 52, 280, 182);
                    ctx.strokeStyle = '#1F2937';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(52, py + 52, 280, 182);
                    imgDrawn = true;
                  } catch (e) {
                    // ignore
                  }
                  resolve(true);
                };
                img.onerror = () => resolve(false);
                img.src = p.imageUrl!;
              });
            } catch (e) {
              // fallback
            }
          }

          const textStartX = imgDrawn ? 350 : 60;
          const textMaxWidth = imgDrawn ? panelWidth - 370 : panelWidth - 40;

          // Description
          ctx.fillStyle = '#4B5563';
          ctx.font = '18px "Zen Maru Gothic", sans-serif';
          ctx.textAlign = 'left';
          const words = p.description.slice(0, 70);
          ctx.fillText(words, textStartX, py + (imgDrawn ? 80 : 80), textMaxWidth);

          // Dialogue Balloon Box
          ctx.fillStyle = '#FEF3C7';
          ctx.beginPath();
          ctx.roundRect(textStartX, py + (imgDrawn ? 130 : 130), textMaxWidth, 75, 12);
          ctx.fill();
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#92400E';
          ctx.font = 'bold 18px "Zen Maru Gothic", sans-serif';
          ctx.fillText(`「${p.dialogue}」`, textStartX + 16, py + (imgDrawn ? 175 : 175), textMaxWidth - 32);
        }

        // Punchline & Footer
        const footerY = startY + 4 * (panelHeight + gap) + 15;
        if (dream.comicStrip.punchline) {
          ctx.fillStyle = '#1F2937';
          ctx.font = 'italic bold 22px "Zen Maru Gothic", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`オチ：${dream.comicStrip.punchline}`, width / 2, footerY);
        }

        // App Branding Footer
        ctx.fillStyle = '#6B7280';
        ctx.font = '16px "Zen Maru Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ユメノト (Yumenoto) - AI寝起き夢記録・4コマ漫画スタジオ', width / 2, height - 36);

      } else {
        // ==========================================
        // 夢カードシェア画像 (1:1 Square Card for Social Media)
        // ==========================================
        const width = 1080;
        const height = 1080;
        canvas.width = width;
        canvas.height = height;

        // Elegant Card Background
        ctx.fillStyle = '#FAF7F2';
        ctx.fillRect(0, 0, width, height);

        // Subtle Inner Decorative Frame
        ctx.strokeStyle = '#2A3A4D';
        ctx.lineWidth = 6;
        ctx.strokeRect(36, 36, width - 72, height - 72);

        ctx.strokeStyle = '#C8A962';
        ctx.lineWidth = 2;
        ctx.strokeRect(48, 48, width - 96, height - 96);

        // Header App Brand
        ctx.fillStyle = '#A84432';
        ctx.font = 'bold 26px "Zen Maru Gothic", serif';
        ctx.textAlign = 'left';
        ctx.fillText('✦ ユメノト 夢記録箋 ✦', 76, 96);

        ctx.fillStyle = '#635D54';
        ctx.font = '20px "Zen Maru Gothic", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${dream.dateLabel} ${dream.timeLabel} 起床`, width - 76, 96);

        // Divider
        ctx.strokeStyle = '#E6DFD3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(76, 120);
        ctx.lineTo(width - 76, 120);
        ctx.stroke();

        // Category Pill
        ctx.fillStyle = '#2A3A4D';
        ctx.beginPath();
        ctx.roundRect(76, 150, 160, 44, 22);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px "Zen Maru Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dream.category || '不思議な日常', 156, 180);

        // Dream Title
        ctx.fillStyle = '#262320';
        ctx.font = 'bold 44px "Zen Maru Gothic", serif';
        ctx.textAlign = 'left';
        ctx.fillText(dream.title, 76, 260, width - 152);

        // Summary Box
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E6DFD3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(76, 300, width - 152, 220, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#374151';
        ctx.font = '26px "Zen Maru Gothic", sans-serif';
        ctx.textAlign = 'left';
        
        // Wrap summary text
        const summary = dream.summary;
        const lineMax = 32;
        const line1 = summary.slice(0, lineMax);
        const line2 = summary.slice(lineMax, lineMax * 2);
        const line3 = summary.slice(lineMax * 2, lineMax * 3);
        ctx.fillText(line1, 108, 360);
        if (line2) ctx.fillText(line2, 108, 410);
        if (line3) ctx.fillText(line3, 108, 460);

        // AI Parameters Grid
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E6DFD3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(76, 550, width - 152, 260, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#A84432';
        ctx.font = 'bold 22px "Zen Maru Gothic", sans-serif';
        ctx.fillText('夢の成分解析パラメータ', 108, 600);

        // Param bars
        const params = [
          { label: 'シュール度 (非日常感)', val: dream.parameters.surrealism, color: '#A84432' },
          { label: '職場・現実成分', val: dream.parameters.workFactor, color: '#2A3A4D' },
          { label: '動物・生物成分', val: dream.parameters.catFactor, color: '#059669' },
          { label: '浮遊・飛翔感', val: dream.parameters.floatiness || 50, color: '#0284C7' },
        ];

        params.forEach((param, idx) => {
          const py = 640 + idx * 40;
          ctx.fillStyle = '#4B5563';
          ctx.font = 'bold 18px "Zen Maru Gothic", sans-serif';
          ctx.fillText(param.label, 108, py);

          // Bar bg
          ctx.fillStyle = '#E5E7EB';
          ctx.beginPath();
          ctx.roundRect(380, py - 16, 450, 18, 9);
          ctx.fill();

          // Bar fg
          ctx.fillStyle = param.color;
          ctx.beginPath();
          ctx.roundRect(380, py - 16, (450 * param.val) / 100, 18, 9);
          ctx.fill();

          // Text value
          ctx.fillStyle = param.color;
          ctx.font = 'bold 18px monospace';
          ctx.fillText(`${param.val}%`, 850, py);
        });

        // Motifs Tags
        const motifText = dream.motifs.map(m => `#${m}`).join('  ');
        ctx.fillStyle = '#4F46E5';
        ctx.font = 'bold 22px "Zen Maru Gothic", sans-serif';
        ctx.fillText(motifText, 76, 860, width - 152);

        // Review Stamp
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(width - 260, 890, 180, 70, 12);
        ctx.stroke();
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 24px "Zen Maru Gothic", serif';
        ctx.textAlign = 'center';
        ctx.fillText('夢ソムリエ鑑賞済', width - 170, 934);

        // Footer Brand
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '20px "Zen Maru Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ユメノト - 目覚めの言葉をAIで作品にする夢日記アプリ', width / 2, height - 60);
      }

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewDataUrl(dataUrl);
      canvasRef.current = canvas;
    } catch (err) {
      console.error('Error rendering share canvas:', err);
    } finally {
      setIsGeneratingCanvas(false);
    }
  };

  /**
   * クリップボードへ画像をコピー（画像コピー機能）
   */
  const handleCopyImageToClipboard = async () => {
    if (!canvasRef.current) return;
    setIsCopyingImage(true);
    audioEngine.playMechanicalClick('high');

    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('ClipboardItem API not supported');
      }

      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          showToast('画像生成に失敗しました');
          setIsCopyingImage(false);
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('画像をクリップボードにコピーしました！SNSやチャットに貼り付けできます');
          audioEngine.playCelestialCrystal();
        } catch (err) {
          console.warn('Clipboard write failed, fallback to download:', err);
          handleDownloadImage();
          showToast('クリップボード直接貼り付けが許可されていないため画像を保存しました');
        } finally {
          setIsCopyingImage(false);
        }
      }, 'image/png');
    } catch (err) {
      console.warn('Clipboard API error:', err);
      handleDownloadImage();
      showToast('端末に画像を保存しました！');
      setIsCopyingImage(false);
    }
  };

  /**
   * 画像を端末へダウンロード保存
   */
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    audioEngine.playMechanicalClick('low');

    const link = document.createElement('a');
    link.download = `yumenoto_${selectedFormat}_${dream.dateLabel}_${dream.title.slice(0, 10)}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast('画像を保存しました！');
  };

  /**
   * テキストをクリップボードにコピー
   */
  const handleCopyText = async () => {
    audioEngine.playMechanicalClick('high');
    const motifs = dream.motifs.map(m => `#${m}`).join(' ');
    const textToCopy = `今朝の夢日記『${dream.title}』
シュール度: ${dream.parameters.surrealism}%
「${dream.summary}」

${motifs} #ユメノト #AI夢日記`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedText(true);
      showToast('テキストをクリップボードにコピーしました！');
      setTimeout(() => setCopiedText(false), 3000);
    } catch (e) {
      showToast('コピーに失敗しました');
    }
  };

  /**
   * X (Twitter) へ投稿画面を開く
   */
  const handleShareToTwitter = () => {
    audioEngine.playMechanicalClick('high');
    const motifs = dream.motifs.map(m => `#${m}`).join(' ');
    const shareText = `今朝の夢をAIで作品化しました！
『${dream.title}』
シュール度: ${dream.parameters.surrealism}%
「${dream.summary}」

${motifs} #ユメノト #AI夢日記`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    showToast('𝕏の投稿画面を開きました！コピーした画像を添付してポストしよう');
  };

  /**
   * Web Share API (モバイル端末ネイティブ共有)
   */
  const handleNativeShare = async () => {
    if (!canvasRef.current || !navigator.share) return;
    audioEngine.playMechanicalClick('high');

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const file = new File([blob], `yumenoto_${dream.title}.png`, { type: 'image/png' });
        await navigator.share({
          title: `夢日記『${dream.title}』`,
          text: `今朝の夢を記録しました：${dream.summary} #ユメノト`,
          files: [file],
        });
      } catch (e) {
        // User cancelled or not supported
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: currentStyle.colors.border }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: currentStyle.colors.accent + '20',
                color: currentStyle.colors.accent,
              }}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`${currentStyle.typography.headingFont} font-bold text-sm leading-none`}>
                夢の共有 & クリップボード保存
              </h3>
              <p className="text-[11px] opacity-70 mt-0.5">
                画像やテキストをSNSやチャットにワンタップで共有
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              onClose();
            }}
            className="p-1.5 rounded-full opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            title="閉じる"
          >
            <CloseCrossAsset size={14} />
          </button>
        </div>

        {/* Format Selector Tabs (Card vs 4-Panel Comic) */}
        {hasComic && (
          <div className="p-3 bg-black/5 dark:bg-white/5 border-b flex items-center space-x-2" style={{ borderColor: currentStyle.colors.border }}>
            <button
              onClick={() => {
                audioEngine.playMechanicalClick('high');
                setSelectedFormat('comic');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                selectedFormat === 'comic' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: selectedFormat === 'comic' ? currentStyle.colors.accent : 'transparent',
                color: selectedFormat === 'comic' ? '#FFFFFF' : currentStyle.colors.textPrimary,
              }}
            >
              <MangaFrameEmblem size={14} />
              <span>4コマ作品画像</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playMechanicalClick('high');
                setSelectedFormat('card');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                selectedFormat === 'card' ? 'shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: selectedFormat === 'card' ? currentStyle.colors.accent : 'transparent',
                color: selectedFormat === 'card' ? '#FFFFFF' : currentStyle.colors.textPrimary,
              }}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>夢サマリーカード画像</span>
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Visual Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold opacity-80">
              <span>生成画像プレビュー</span>
              <span className="text-[10px] font-mono opacity-60">
                {selectedFormat === 'comic' ? '4コマ縦長レイアウト' : '正方形カード (1080x1080)'}
              </span>
            </div>

            <div 
              className="relative w-full rounded-2xl border overflow-hidden flex items-center justify-center p-2 bg-neutral-900/5 dark:bg-neutral-950 min-h-[220px]"
              style={{ borderColor: currentStyle.colors.border }}
            >
              {isGeneratingCanvas ? (
                <div className="flex flex-col items-center space-x-2 text-xs opacity-70 p-6">
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mb-2" />
                  <span>画像を生成中…</span>
                </div>
              ) : previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Share Preview"
                  className="max-h-[260px] w-auto object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-xs opacity-50">プレビューを読み込めませんでした</div>
              )}
            </div>
          </div>

          {/* Primary Action 1: Copy Image to Clipboard */}
          <div className="space-y-2">
            <button
              id="copy-image-to-clipboard-btn"
              disabled={isCopyingImage || !previewDataUrl}
              onClick={handleCopyImageToClipboard}
              className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
              style={{
                backgroundColor: currentStyle.colors.recordBtnBg,
                color: currentStyle.colors.recordBtnText,
              }}
            >
              {isCopyingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>画像をクリップボードにコピー中…</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>クリップボードに画像をコピー</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center opacity-70 leading-relaxed">
              コピー後、X・LINE・Discordなどの入力欄でそのまま貼り付け（Ctrl+V / 貼付）が可能です。
            </p>
          </div>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Share to X (Twitter) */}
            <button
              onClick={handleShareToTwitter}
              className="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <span className="font-bold text-sm">𝕏</span>
              <span>𝕏 (Twitter) で投稿</span>
            </button>

            {/* Download Image */}
            <button
              onClick={handleDownloadImage}
              className="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>画像ファイル保存</span>
            </button>
          </div>

          {/* Additional Actions */}
          <div className="pt-2 border-t space-y-2" style={{ borderColor: currentStyle.colors.border }}>
            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="w-full py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <span className="flex items-center space-x-1.5">
                <Copy className="w-3 h-3 opacity-70" />
                <span>夢のテキストとハッシュタグをコピー</span>
              </span>
              {copiedText ? (
                <span className="text-[11px] text-green-600 font-bold flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  コピー完了
                </span>
              ) : (
                <span className="text-[10px] opacity-60 font-mono">文面のみ</span>
              )}
            </button>

            {/* Mobile Native Share if supported */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: currentStyle.colors.accent + '15',
                  borderColor: currentStyle.colors.accent + '30',
                  color: currentStyle.colors.textPrimary,
                }}
              >
                <Share2 className="w-3 h-3" style={{ color: currentStyle.colors.accent }} />
                <span>端末の共有メニューを開く（AirDrop / LINE等）</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-4 mb-3 p-3 bg-black/90 text-white rounded-xl text-xs font-medium flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-1.5">
              <SparkleAsset size={13} />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="opacity-70 hover:opacity-100 cursor-pointer p-0.5"
            >
              <CloseCrossAsset size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
