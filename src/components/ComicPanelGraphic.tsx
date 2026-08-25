import React from 'react';
import { ComicPanel } from '../types';
import { MotifIcon } from './MotifIcon';
import { Sparkles, RefreshCw, Wand2, AlertCircle, Loader2, X } from 'lucide-react';

interface ComicPanelGraphicProps {
  panel: ComicPanel;
  styleId: string;
  customStylePrompt?: string;
  dreamTitle?: string;
  isGenerating?: boolean;
  error?: string | null;
  onGenerateImage?: () => void;
  onDismissError?: () => void;
}

export const ComicPanelGraphic: React.FC<ComicPanelGraphicProps> = ({
  panel,
  styleId,
  isGenerating = false,
  error = null,
  onGenerateImage,
  onDismissError,
}) => {
  const { stage, heading, dialogue, motifIcon, panelNumber, imageUrl } = panel;

  // Safe error cleaner
  const getCleanErrorMessage = (errText: string) => {
    if (errText.includes('spending cap') || errText.includes('429') || errText.includes('利用上限')) {
      return 'AI Studioの月間利用上限に達しました。内蔵グラフィックをお楽しみください。';
    }
    if (errText.includes('API_KEY')) {
      return 'APIキーが未設定または無効です。';
    }
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) return getCleanErrorMessage(parsed.error.message);
    } catch {}
    return errText.length > 90 ? errText.slice(0, 90) + '...' : errText;
  };

  return (
    <div className="w-full relative overflow-hidden bg-white border-2 border-black rounded-lg my-1.5 flex flex-col justify-between select-none shadow-[3px_3px_0px_rgba(0,0,0,1)] group aspect-[4/3] sm:aspect-[16/11]">
      
      {/* 1. ACTUAL AI IMAGE (Rendered when generated) */}
      {imageUrl ? (
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src={imageUrl} 
            alt={heading} 
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 ${
              styleId === 'retro_manga' ? 'grayscale contrast-125' : ''
            }`}
          />

          {/* Style specific texture overlays */}
          {styleId === 'retro_manga' && (
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
                backgroundSize: '4px 4px',
              }}
            />
          )}

          {styleId === 'cyber_game' && (
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.7) 50%)',
                backgroundSize: '100% 4px',
              }}
            />
          )}
        </div>
      ) : (
        /* 2. INSTANT STYLIZED ARTWORK (Always present before AI generation) */
        <div className="absolute inset-0 z-0 p-3 flex flex-col justify-between">
          {styleId === 'retro_manga' ? (
            <>
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
                  backgroundSize: '5px 5px',
                }}
              />
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 250" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="200" y2="125" stroke="#000" strokeWidth="1.5" />
                <line x1="400" y1="0" x2="200" y2="125" stroke="#000" strokeWidth="1.5" />
                <line x1="0" y1="250" x2="200" y2="125" stroke="#000" strokeWidth="1.5" />
                <line x1="400" y1="250" x2="200" y2="125" stroke="#000" strokeWidth="1.5" />
              </svg>
            </>
          ) : styleId === 'cyber_game' ? (
            <>
              <div className="absolute inset-0 bg-[#0A0E17]" />
              <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.7) 50%)',
                  backgroundSize: '100% 4px',
                }}
              />
            </>
          ) : styleId === 'storybook' ? (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-amber-100" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-950" />
          )}

          {/* Center Character Motif Artwork */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-white/95 dark:bg-neutral-800 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] transform transition-transform group-hover:scale-105">
              <MotifIcon name={motifIcon} className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-900 dark:text-neutral-100 drop-shadow-xs" />
            </div>
            <p className="mt-1.5 text-[10px] sm:text-[11px] font-mono text-neutral-700 dark:text-neutral-200 bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 max-w-[85%] truncate text-center">
              {panel.description}
            </p>
          </div>
        </div>
      )}

      {/* 3. PERSISTENT TOP BAR (Visible across all states) */}
      <div className="relative z-10 flex items-center justify-between p-2.5">
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-black text-white border-2 border-white flex items-center justify-center font-serif font-black text-xs shadow-sm">
            {stage}
          </div>
          <span className="font-bold text-[11px] sm:text-xs bg-black/85 text-white px-2 py-0.5 rounded-sm border border-white/40 shadow-xs backdrop-blur-xs">
            第{panelNumber}コマ • {heading}
          </span>
        </div>

        {styleId === 'retro_manga' && (
          <span className="font-serif font-black text-base sm:text-lg italic tracking-tighter text-black bg-white/95 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-4deg]">
            {['ドドド…', 'ガーン！', 'ババーン!!', 'ピカーン✨'][(panelNumber - 1) % 4]}
          </span>
        )}

        {styleId === 'cyber_game' && (
          <span className="text-[9px] font-mono text-[#4EF2BB] bg-[#0A0E17]/90 px-2 py-0.5 border border-[#4EF2BB] rounded-xs shadow-xs flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>LV.{panelNumber * 8} SCENE</span>
          </span>
        )}
      </div>

      {/* 4. PERSISTENT DIALOGUE SPEECH BUBBLE (Always legible) */}
      {dialogue && (
        <div className="relative z-10 flex justify-center pb-2 px-2 pointer-events-none">
          <div className="relative bg-white/95 text-black px-3.5 py-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] max-w-[92%] backdrop-blur-xs">
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t-2 border-l-2 border-black rotate-45" />
            <p className="text-xs sm:text-[13px] font-bold leading-snug tracking-wide text-neutral-900 font-sans">
              {dialogue}
            </p>
          </div>
        </div>
      )}

      {/* 5. TOP RIGHT ACTION BUTTON (Single-panel generate/re-generate) */}
      {!isGenerating && onGenerateImage && (
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerateImage();
            }}
            title={imageUrl ? 'このコマをAIで再作画' : 'このコマをGemini AIで作画'}
            className={`px-2 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center space-x-1 text-[10px] font-bold active:scale-95 ${
              imageUrl 
                ? 'bg-white/90 hover:bg-white text-black opacity-0 group-hover:opacity-100 hover:scale-105' 
                : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 hover:scale-105 shadow-md'
            }`}
          >
            {imageUrl ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-700" />
                <span>再作画</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 text-neutral-900" />
                <span>AI作画</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 6. MODERN NON-BLOCKING LOADING OVERLAY (Never hides dialogue or layout!) */}
      {isGenerating && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
          <div className="relative mb-2">
            <div className="w-10 h-10 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="bg-black/85 text-white border border-amber-400/80 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
            <span>第{panelNumber}コマ（{stage}）をAI作画中…</span>
          </div>
          <div className="text-[10px] text-amber-200 font-mono mt-1 drop-shadow-sm">
            Gemini 3.1 Flash-Lite Image
          </div>
        </div>
      )}

      {/* 7. INDIVIDUAL PANEL ERROR FLOATING TOAST (Non-intrusive, dismissible, doesn't hide comic content!) */}
      {error && !isGenerating && (
        <div className="absolute inset-x-2 bottom-2 z-30 bg-neutral-900/95 text-white border-2 border-red-500 rounded-xl p-2.5 shadow-xl flex items-center justify-between gap-2 animate-fade-in backdrop-blur-md">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-amber-300">
                AI作画スキップ（内蔵画風で表示中）
              </div>
              <p className="text-[10px] text-neutral-300 line-clamp-2 leading-tight">
                {getCleanErrorMessage(error)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 shrink-0">
            {onGenerateImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateImage();
                }}
                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-bold rounded-md cursor-pointer flex items-center space-x-1 shadow-sm"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>再試行</span>
              </button>
            )}
            {onDismissError && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismissError();
                }}
                className="p-1 hover:bg-white/20 rounded-md text-neutral-400 hover:text-white cursor-pointer"
                title="閉じる"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
