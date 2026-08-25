import React from 'react';
import { useUIStyle, UI_STYLES, UIStyleId } from '../context/UIStyleContext';
import { Palette, Check, Sparkles, X, Radio } from 'lucide-react';
import { StorybookDecorations, CelestialDecorations, GlassSpecimenDecorations, RetroCassetteDecorations } from './Decorations';

interface UIStyleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UIStyleSelectorModal: React.FC<UIStyleSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentStyle, setStyle } = useUIStyle();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border transition-all max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: currentStyle.colors.border }}>
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: currentStyle.colors.accent + '20',
                color: currentStyle.colors.accent,
              }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">デザイン性・装飾スタイルの検討（4方向）</h3>
              <p className="text-xs opacity-70">色だけでなく、装飾アセット・造形・世界観が大きく変化します</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Cards with rich visual decor preview */}
        <div className="mt-4 space-y-3.5">
          {(Object.keys(UI_STYLES) as UIStyleId[]).map((key) => {
            const style = UI_STYLES[key];
            const isSelected = currentStyle.id === style.id;

            return (
              <div
                key={style.id}
                onClick={() => setStyle(style.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-offset-1 shadow-lg'
                    : 'opacity-85 hover:opacity-100 hover:border-current/40'
                }`}
                style={{
                  backgroundColor: style.colors.cardBg,
                  borderColor: isSelected ? style.colors.accent : style.colors.border,
                  color: style.colors.textPrimary,
                }}
              >
                {/* Visual Asset Decor Snippet */}
                {style.id === 'washi' && (
                  <div className="absolute top-0 right-8 -mt-1.5 pointer-events-none">
                    <StorybookDecorations.WashiTape />
                  </div>
                )}
                {style.id === 'midnight' && (
                  <div className="absolute top-1 right-1 pointer-events-none">
                    <CelestialDecorations.TarotCorner position="top-right" />
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm sm:text-base">{style.name}</span>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: style.colors.accent + '25',
                          borderColor: style.colors.accent + '50',
                          color: style.colors.accent,
                        }}
                      >
                        {style.badge}
                      </span>
                    </div>

                    <p className="text-xs opacity-80 leading-relaxed pt-0.5">
                      {style.subtitle}
                    </p>

                    <div className="flex items-center space-x-1.5 pt-1 text-[11px] font-medium" style={{ color: style.colors.accent }}>
                      <Sparkles className="w-3 h-3" />
                      <span>装飾特徴: {style.artStyle}</span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-xs ml-2"
                      style={{
                        backgroundColor: style.colors.accent,
                        color: style.colors.recordBtnText || '#fff',
                      }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <button className="text-xs px-2.5 py-1 rounded-lg border ml-2 opacity-70 hover:opacity-100 whitespace-nowrap">
                      適用
                    </button>
                  )}
                </div>

                {/* Specific Visual Decor Sample Preview inside card */}
                <div 
                  className="mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between"
                  style={{
                    backgroundColor: style.colors.bg,
                    borderColor: style.colors.border,
                  }}
                >
                  {style.id === 'washi' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <StorybookDecorations.DreamBottleSketch />
                        <div>
                          <div className="text-[11px] font-serif font-bold">手帳コラージュ装飾</div>
                          <div className="text-[10px] opacity-70">朱肉印・挿絵・和紙テープ</div>
                        </div>
                      </div>
                      <StorybookDecorations.StampHanko text="夢採集" />
                    </div>
                  )}

                  {style.id === 'midnight' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <CelestialDecorations.MoonPhaseIcon />
                        <div>
                          <div className="text-[11px] font-serif font-bold" style={{ color: '#E5C378' }}>占星術・金箔オーナメント</div>
                          <div className="text-[10px] opacity-70">天球儀リング・タロット枠</div>
                        </div>
                      </div>
                      <span className="font-serif text-xs" style={{ color: '#E5C378' }}>✦ ☽ ✦</span>
                    </div>
                  )}

                  {style.id === 'vintage' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4" style={{ color: '#4EF2BB' }} />
                        <div>
                          <div className="text-[11px] font-mono font-bold" style={{ color: '#4EF2BB' }}>REC TAPE & VU METER</div>
                          <div className="text-[10px] opacity-70 font-mono">カセット回転・物理ボタン</div>
                        </div>
                      </div>
                      <RetroCassetteDecorations.VUMeterDial />
                    </div>
                  )}

                  {style.id === 'pastel' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <GlassSpecimenDecorations.FloatingOrb />
                        <div>
                          <div className="text-[11px] font-bold text-indigo-600">フローティングガラス</div>
                          <div className="text-[10px] opacity-70">3Dオーブ・すりガラス標本タグ</div>
                        </div>
                      </div>
                      <GlassSpecimenDecorations.SpecimenLabel id="SPEC-01" name="記憶標本" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t text-center" style={{ borderColor: currentStyle.colors.border }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            style={{
              backgroundColor: currentStyle.colors.accent,
              color: currentStyle.colors.recordBtnText || '#ffffff',
            }}
          >
            このスタイルでアプリを試す
          </button>
        </div>
      </div>
    </div>
  );
};
