import React, { useState } from 'react';
import { DreamRecord, ComicStrip } from '../types';
import { 
  ArrowLeft, Sparkles, Share2, Eye, EyeOff, Tag, Clock, Calendar, 
  Activity, BookOpen, Film, Heart, Trash2, Edit3, MessageCircle, Moon, User
} from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { StorybookDecorations } from './Decorations';
import { SpeechBubbleTaleAsset, SparkleAsset, MangaFrameEmblem, MoonCrestAsset } from './IllustratedAssets';
import { DreamShareModal } from './DreamShareModal';

interface DreamDetailViewProps {
  dream: DreamRecord;
  onBack: () => void;
  onOpenComicStudio: (dream: DreamRecord) => void;
  onTogglePublic: (dreamId: string) => void;
  onDeleteDream: (dreamId: string) => void;
}

export const DreamDetailView: React.FC<DreamDetailViewProps> = ({
  dream,
  onBack,
  onOpenComicStudio,
  onTogglePublic,
  onDeleteDream,
}) => {
  const { currentStyle } = useUIStyle();
  const [showRawTranscription, setShowRawTranscription] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  return (
    <div className="pb-24 w-full max-w-xl md:max-w-2xl mx-auto animate-in fade-in duration-200">
      {/* Top Bar */}
      <div 
        className="sticky top-0 z-30 backdrop-blur-md px-5 py-3.5 border-b flex items-center justify-between transition-colors"
        style={{
          backgroundColor: currentStyle.colors.navBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <button
          onClick={() => {
            audioEngine.playMechanicalClick('low');
            onBack();
          }}
          className="flex items-center space-x-1.5 text-xs font-medium py-1 px-2 rounded-lg transition-colors cursor-pointer hover:opacity-80"
          style={{ color: currentStyle.colors.textPrimary }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>一覧へ戻る</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Share Button */}
          <button
            id="dream-detail-top-share-btn"
            onClick={() => {
              audioEngine.playThemeSound(currentStyle.id, 'action');
              setIsShareModalOpen(true);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-xs transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: currentStyle.colors.accent,
              borderColor: currentStyle.colors.accent,
              color: currentStyle.colors.recordBtnText || '#FFFFFF',
            }}
            title="SNSやクリップボードで共有"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>共有</span>
          </button>

          {/* Public / Private Status Toggle */}
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onTogglePublic(dream.id);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer"
            style={{
              backgroundColor: dream.isPublic ? currentStyle.colors.accent + '20' : currentStyle.colors.cardBg,
              borderColor: dream.isPublic ? currentStyle.colors.accent : currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          >
            {dream.isPublic ? (
              <>
                <Eye className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
                <span>図鑑に公開中</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 opacity-60" />
                <span className="opacity-75">非公開</span>
              </>
            )}
          </button>

          {/* Delete action */}
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              setShowDeleteConfirm(true);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 hover:text-red-500 transition-all cursor-pointer"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirm Alert */}
      {showDeleteConfirm && (
        <div className="mx-5 mt-3 p-3.5 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300 animate-in fade-in">
          <span>この夢の記録を削除しますか？</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2.5 py-1 bg-white/10 rounded-lg text-xs cursor-pointer"
            >
              やめる
            </button>
            <button
              onClick={() => onDeleteDream(dream.id)}
              className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              削除する
            </button>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="p-5 space-y-5">
        {/* Title Header Card */}
        <div 
          className="rounded-2xl p-5 border shadow-xs space-y-3 transition-colors relative overflow-hidden"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          {currentStyle.id === 'washi' && (
            <div className="absolute top-0 right-4 scale-75 pointer-events-none">
              <StorybookDecorations.WashiTape />
            </div>
          )}

          {/* Zero-Pill Metadata Header */}
          <div className="flex items-center gap-2 text-xs opacity-65 flex-wrap">
            <span className="font-medium">{dream.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dream.dateLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dream.timeLabel} 起床</span>
          </div>

          <h1 
            className={`${currentStyle.typography.headingFont} text-2xl font-bold leading-snug`}
            style={{ color: currentStyle.colors.textPrimary }}
          >
            {dream.title}
          </h1>

          <p 
            className="text-sm leading-relaxed p-4 rounded-xl border opacity-90"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          >
            {dream.summary}
          </p>

          {/* Curatorial Reflection */}
          <div 
            className="p-3.5 rounded-xl border flex items-start space-x-3 transition-colors text-xs"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: currentStyle.colors.accent }} />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-serif font-medium text-[11px] block opacity-75">
                夢の余白と無意識の観測
              </span>
              <p className="opacity-80">
                シュール度 {dream.parameters.surrealism}% · 「{dream.motifs[0] || '情景'}」の余韻が強く残る朝の記憶標本です。
              </p>
            </div>
          </div>

          {/* Motifs and Characters */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs opacity-75">
            {dream.motifs.map((motif, idx) => (
              <span key={idx} className="font-mono">
                #{motif}
              </span>
            ))}
            {dream.characters && dream.characters.length > 0 && (
              <>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span className="opacity-60">登場人物: {dream.characters.join(', ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button: Transform to 4-Panel Comic / Specimen Scroll */}
        <div 
          className="rounded-2xl p-5 text-white shadow-md relative overflow-hidden"
          style={{
            background: currentStyle.colors.heroGradient,
            border: `1px solid ${currentStyle.colors.border}`,
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-serif" style={{ color: currentStyle.colors.accent }}>
                <StorybookDecorations.FeatherPenIcon className="w-4 h-4 text-current" />
                <span className="tracking-wide">四段絵巻 · 活版挿絵帖</span>
              </div>
              <h3 className={`${currentStyle.typography.headingFont} text-base font-bold text-white`}>
                {dream.comicStrip ? '四段絵巻を閲覧・画像出力' : 'この夢の情景を四段絵巻に仕立てる'}
              </h3>
              <p className="text-xs opacity-85 leading-relaxed font-serif">
                朝の無意識を、活版木版画・水彩画・レトロ劇画の四段挿絵として結晶化します。
              </p>
            </div>

            <button
              id="open-comic-generator-btn"
              onClick={() => {
                audioEngine.playMechanicalClick('high');
                onOpenComicStudio(dream);
              }}
              className="font-serif font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: currentStyle.colors.recordBtnBg,
                color: currentStyle.colors.recordBtnText,
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>{dream.comicStrip ? '絵巻を開く' : '四段絵巻を編む'}</span>
            </button>
          </div>
        </div>

        {/* Existing Comic Strip Preview */}
        {dream.comicStrip && (
          <div 
            className="rounded-2xl p-4 border space-y-3"
            style={{
              backgroundColor: currentStyle.colors.cardBg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
                <span className={`${currentStyle.typography.headingFont} font-bold text-sm`} style={{ color: currentStyle.colors.textPrimary }}>
                  四段絵巻（{dream.comicStrip.styleLabel}）
                </span>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  onOpenComicStudio(dream);
                }}
                className="text-xs underline font-serif font-medium cursor-pointer"
                style={{ color: currentStyle.colors.accent }}
              >
                絵巻スタジオで調整
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {dream.comicStrip.panels.map((p, i) => (
                <div 
                  key={i} 
                  className="p-2.5 rounded-xl border text-xs overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: currentStyle.colors.bg,
                    borderColor: currentStyle.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between font-bold mb-1" style={{ color: currentStyle.colors.textPrimary }}>
                    <span 
                      className="text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-serif"
                      style={{
                        backgroundColor: currentStyle.colors.accentSecondary,
                        color: '#ffffff',
                      }}
                    >
                      {p.stage}
                    </span>
                    <span className="truncate ml-1 text-[11px] font-serif">{p.heading}</span>
                  </div>
                  {p.imageUrl ? (
                    <div className="w-full h-16 rounded-lg overflow-hidden my-1 bg-black/10">
                      <img src={p.imageUrl} alt={p.heading} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-75 line-clamp-2 leading-tight my-1 font-serif">
                      {p.description}
                    </p>
                  )}
                  <p className="text-[9px] font-mono opacity-70 truncate flex items-center">
                    <SpeechBubbleTaleAsset size={11} className="mr-1 inline-block shrink-0" />
                    <span>{p.dialogue}</span>
                  </p>
                </div>
              ))}
            </div>

            {dream.comicStrip.punchline && (
              <p className={`${currentStyle.typography.headingFont} text-xs italic text-center pt-1 opacity-90 font-serif`}>
                {dream.comicStrip.punchline}
              </p>
            )}
          </div>
        )}

        {/* Dream Parameters Bar Charts */}
        <div 
          className="rounded-2xl p-4 border space-y-3"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-serif font-bold flex items-center space-x-1.5" style={{ color: currentStyle.colors.textPrimary }}>
              <Activity className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
              <span>心象の深度観測</span>
            </h3>
            <span className="text-[10px] opacity-50 font-serif">余韻指数</span>
          </div>

          <div className="space-y-2.5 text-xs font-serif">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">非日常の歪み（シュール度）</span>
                <span className="font-mono font-bold tabular-nums">{dream.parameters.surrealism} %</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full rounded-full" style={{ width: `${dream.parameters.surrealism}%`, backgroundColor: currentStyle.colors.accent }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">現実の残像（日常・学業）</span>
                <span className="font-mono font-bold tabular-nums">{dream.parameters.workFactor} %</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full rounded-full" style={{ width: `${dream.parameters.workFactor}%`, backgroundColor: currentStyle.colors.accentSecondary }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">生き物の気配</span>
                <span className="font-mono font-bold tabular-nums">{dream.parameters.catFactor} %</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${dream.parameters.catFactor}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">浮遊・無重力感</span>
                <span className="font-mono font-bold tabular-nums">{dream.parameters.floatiness || dream.parameters.floatingSense || 50} %</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${dream.parameters.floatiness || dream.parameters.floatingSense || 50}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Original Transcription Dropdown */}
        <div 
          className="rounded-2xl p-4 border space-y-2"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              setShowRawTranscription(!showRawTranscription);
            }}
            className="w-full flex items-center justify-between text-xs font-bold transition-opacity cursor-pointer hover:opacity-80"
            style={{ color: currentStyle.colors.textPrimary }}
          >
            <span className="flex items-center space-x-1.5">
              <MessageCircle className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
              <span>起床直後の音声文字起こし原本</span>
            </span>
            <span className="text-[11px] opacity-70">
              {showRawTranscription ? '閉じる ▲' : '見る ▼'}
            </span>
          </button>

          {showRawTranscription && (
            <div 
              className="mt-2 p-3 rounded-xl border text-xs leading-relaxed font-mono animate-in fade-in"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textSecondary,
              }}
            >
              {dream.rawTranscription ? (
                <p>"{dream.rawTranscription}"</p>
              ) : (
                <p className="italic opacity-60">音声原本は保存されていません。</p>
              )}
            </div>
          )}
        </div>

        {/* Share Callout Banner */}
        <div 
          className="rounded-2xl p-4 border flex items-center justify-between shadow-2xs transition-colors"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: currentStyle.colors.accent + '20',
                color: currentStyle.colors.accent,
              }}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">この夢をSNSでシェア</span>
              <span className="text-[10px] opacity-70">
                {dream.comicStrip ? '4コマ画像や夢カードを画像コピー・𝕏投稿' : '正方形カード画像を画像コピー・𝕏投稿'}
              </span>
            </div>
          </div>

          <button
            id="dream-detail-bottom-share-btn"
            onClick={() => {
              audioEngine.playThemeSound(currentStyle.id, 'action');
              setIsShareModalOpen(true);
            }}
            className="py-2 px-3.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1 cursor-pointer active:scale-95 hover:opacity-90 shrink-0"
            style={{
              backgroundColor: currentStyle.colors.accent,
              color: currentStyle.colors.recordBtnText || '#FFFFFF',
            }}
          >
            <Share2 className="w-3.5 h-3.5 mr-0.5" />
            <span>共有する</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <DreamShareModal
        isOpen={isShareModalOpen}
        dream={dream}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
