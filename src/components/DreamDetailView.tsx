import React, { useState } from 'react';
import { DreamRecord, ComicStrip } from '../types';
import { 
  ArrowLeft, Sparkles, Share2, Eye, EyeOff, Tag, Clock, Calendar, 
  Activity, BookOpen, Film, Heart, Trash2, Edit3, MessageCircle, Moon, User
} from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { StorybookDecorations } from './Decorations';
import { BakuMascot } from './DreamMascots';
import { HandwrittenPostIt, CuteStamp } from './PlayfulAccents';
import { SpeechBubbleTaleAsset, SparkleAsset, MangaFrameEmblem, MoonCrestAsset } from './IllustratedAssets';

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

  return (
    <div className="pb-24 max-w-lg mx-auto animate-in fade-in duration-200">
      {/* Top Bar */}
      <div 
        className="sticky top-0 z-30 backdrop-blur-md px-4 py-3 border-b flex items-center justify-between transition-colors"
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
          className="flex items-center space-x-1.5 text-xs font-bold py-1 px-2 rounded-lg transition-colors cursor-pointer hover:opacity-80"
          style={{ color: currentStyle.colors.textPrimary }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>一覧へ戻る</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Public / Private Status Toggle */}
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onTogglePublic(dream.id);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer"
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
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 hover:text-red-500 transition-all cursor-pointer"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirm Alert */}
      {showDeleteConfirm && (
        <div className="mx-4 mt-3 p-3.5 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300 animate-in fade-in">
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
      <div className="p-4 space-y-4">
        {/* Title Header Card */}
        <div 
          className="rounded-2xl p-5 border shadow-2xs space-y-3 transition-colors relative overflow-hidden"
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

          <div className="flex items-center justify-between text-xs font-mono opacity-70">
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" style={{ color: currentStyle.colors.accent }} />
                {dream.dateLabel}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" style={{ color: currentStyle.colors.accent }} />
                {dream.timeLabel} 起床
              </span>
            </div>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium border"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              {dream.category}
            </span>
          </div>

          <h1 
            className={`${currentStyle.typography.headingFont} text-xl sm:text-2xl font-bold leading-tight`}
            style={{ color: currentStyle.colors.textPrimary }}
          >
            {dream.title}
          </h1>

          <p 
            className="text-sm leading-relaxed p-3.5 rounded-xl border"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          >
            {dream.summary}
          </p>

          {/* Baku Mascot's Taste Review Post-it */}
          <HandwrittenPostIt color="blue" rotation="rotate-[-1deg]" className="my-1">
            <div className="flex items-start space-x-2.5">
              <div className="shrink-0 -mt-1">
                <BakuMascot size={44} showSpeech={false} />
              </div>
              <div className="text-xs leading-relaxed">
                <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
                  <span>バクくんの夢ソムリエ講評</span>
                  <CuteStamp text="美味" color="#4F46E5" />
                </div>
                <div className="text-indigo-900/90 mt-0.5">
                  「今日の夢はシュール度{dream.parameters.surrealism}%！『{dream.motifs[0] || '情景'}』の余韻がとても香ばしくてごちそうさまでした♪」
                </div>
              </div>
            </div>
          </HandwrittenPostIt>

          {/* Motifs and Characters */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {dream.motifs.map((motif, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full border flex items-center space-x-1"
                style={{
                  backgroundColor: currentStyle.colors.bg,
                  borderColor: currentStyle.colors.border,
                  color: currentStyle.colors.textPrimary,
                }}
              >
                <Tag className="w-3 h-3" style={{ color: currentStyle.colors.accent }} />
                <span>{motif}</span>
              </span>
            ))}
            {dream.characters.map((char, idx) => (
              <span
                key={`c-${idx}`}
                className="text-xs px-2.5 py-1 rounded-full border flex items-center space-x-1"
                style={{
                  backgroundColor: currentStyle.colors.accentSecondary + '20',
                  borderColor: currentStyle.colors.accentSecondary + '40',
                }}
              >
                <User className="w-3 h-3" style={{ color: currentStyle.colors.accent }} />
                <span>{char}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Button: Transform to 4-Panel Comic / Poster */}
        <div 
          className="rounded-2xl p-5 text-white shadow-md relative overflow-hidden"
          style={{
            background: currentStyle.colors.heroGradient,
            border: `1px solid ${currentStyle.colors.border}`,
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: currentStyle.colors.accent }}>
                <Sparkles className="w-4 h-4" />
                <span>夢のエンタメ作品化スタジオ</span>
              </div>
              <h3 className={`${currentStyle.typography.headingFont} text-base font-bold text-white`}>
                {dream.comicStrip ? '4コマ漫画を閲覧・画像出力' : 'この夢を4コマにして保存・共有する'}
              </h3>
              <p className="text-xs opacity-85 leading-relaxed">
                昭和レトロ漫画、水彩絵本、8-Bitゲーム、35mmシネマ風にAIが変換します。
              </p>
            </div>

            <button
              id="open-comic-generator-btn"
              onClick={() => {
                audioEngine.playMechanicalClick('high');
                onOpenComicStudio(dream);
              }}
              className="font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: currentStyle.colors.recordBtnBg,
                color: currentStyle.colors.recordBtnText,
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>{dream.comicStrip ? '作品スタジオを開く' : '4コマを作成する'}</span>
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
                  4コマ作品（{dream.comicStrip.styleLabel}）
                </span>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  onOpenComicStudio(dream);
                }}
                className="text-xs underline font-medium cursor-pointer"
                style={{ color: currentStyle.colors.accent }}
              >
                作画スタジオで編集・保存
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
                    <span className="truncate ml-1 text-[11px]">{p.heading}</span>
                  </div>
                  {p.imageUrl ? (
                    <div className="w-full h-16 rounded-lg overflow-hidden my-1 bg-black/10">
                      <img src={p.imageUrl} alt={p.heading} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-75 line-clamp-2 leading-tight my-1">
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
              <p className={`${currentStyle.typography.headingFont} text-xs italic text-center pt-1 opacity-90`}>
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
            <h3 className="text-xs font-bold flex items-center space-x-1.5" style={{ color: currentStyle.colors.textPrimary }}>
              <Activity className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
              <span>夢の成分パラメータ</span>
            </h3>
            <span className="text-[10px] opacity-50 font-mono">AI解析</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">シュール度（非日常感）</span>
                <span className="font-mono font-bold">{dream.parameters.surrealism} %</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full rounded-full" style={{ width: `${dream.parameters.surrealism}%`, backgroundColor: currentStyle.colors.accent }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">職場・現実タスク成分</span>
                <span className="font-mono font-bold">{dream.parameters.workFactor} %</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full rounded-full" style={{ width: `${dream.parameters.workFactor}%`, backgroundColor: currentStyle.colors.accentSecondary }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">動物・生物成分</span>
                <span className="font-mono font-bold">{dream.parameters.catFactor} %</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${dream.parameters.catFactor}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="opacity-80">浮遊・飛翔感</span>
                <span className="font-mono font-bold">{dream.parameters.floatiness || dream.parameters.floatingSense || 50} %</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
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
      </div>
    </div>
  );
};
