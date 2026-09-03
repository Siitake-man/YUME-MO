import React, { useState } from 'react';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { Coffee, Moon, Sparkles, ExternalLink, ShieldCheck, Heart, Gift, Info } from 'lucide-react';
import { StorybookDecorations, CelestialDecorations, GlassSpecimenDecorations, RetroCassetteDecorations } from './Decorations';
import { CloseCrossAsset } from './IllustratedAssets';

interface NativeSponsorCardProps {
  variant?: 'feed' | 'banner' | 'comic-footer';
  className?: string;
}

interface SponsorItem {
  id: string;
  brand: string;
  title: string;
  description: string;
  tag: string;
  badge: string;
  promoCode?: string;
  urlLabel: string;
  category: 'coffee' | 'sleep' | 'audio';
}

const SAMPLE_SPONSORS: SponsorItem[] = [
  {
    id: 'sponsor-1',
    brand: '月影珈琲焙煎所',
    title: '目覚めの頭をほどく、深煎りブレンド標本',
    description: '夢の余韻を残したまま、静かな朝を迎えるためのドリップバッグ。',
    tag: '朝の協賛標本',
    badge: '夢のあと限定 15%OFF',
    promoCode: 'YUMENOTO15',
    urlLabel: '珈琲標本を見る',
    category: 'coffee',
  },
  {
    id: 'sponsor-2',
    brand: 'SLEEP LABORATORY',
    title: '無重力のような眠りを導く、深層快眠枕',
    description: '良い夢と心地よい目覚めを研究する睡眠科学ブランド。',
    tag: '睡眠科学スポンサー',
    badge: '30日間お試し保証',
    promoCode: 'DEEPDREAM',
    urlLabel: '睡眠実験室へ',
    category: 'sleep',
  },
];

export const NativeSponsorCard: React.FC<NativeSponsorCardProps> = ({
  variant = 'feed',
  className = '',
}) => {
  const { currentStyle } = useUIStyle();
  const [sponsorIndex, setSponsorIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const sponsor = SAMPLE_SPONSORS[sponsorIndex % SAMPLE_SPONSORS.length];

  const handleOpenSponsor = () => {
    audioEngine.playMechanicalClick('high');
    setShowModal(true);
  };

  const handleCopyCode = () => {
    if (sponsor.promoCode) {
      navigator.clipboard?.writeText(sponsor.promoCode);
      audioEngine.playMechanicalClick('high');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (variant === 'comic-footer') {
    return (
      <div 
        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${className}`}
        style={{
          backgroundColor: currentStyle.colors.bg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]"
            style={{
              backgroundColor: currentStyle.colors.accent + '20',
              color: currentStyle.colors.accent,
            }}
          >
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] px-1 rounded font-mono opacity-60 border" style={{ borderColor: currentStyle.colors.border }}>
                SPONSOR
              </span>
              <span className="font-bold text-[11px]" style={{ color: currentStyle.colors.textPrimary }}>
                {sponsor.brand}
              </span>
            </div>
            <p className="text-[10px] opacity-70 line-clamp-1">
              {sponsor.title}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenSponsor}
          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer hover:opacity-80 shrink-0"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
            color: currentStyle.colors.accent,
          }}
        >
          特典を見る
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl p-4 border shadow-2xs transition-all relative overflow-hidden space-y-2.5 ${className}`}
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.accent + '40',
        }}
      >
        {/* Style specific subtle accent */}
        {currentStyle.id === 'washi' && (
          <div className="absolute top-0 right-4 scale-75 pointer-events-none">
            <StorybookDecorations.WashiTape />
          </div>
        )}
        {currentStyle.id === 'midnight' && (
          <div className="absolute top-1 right-1 pointer-events-none scale-75">
            <CelestialDecorations.TarotCorner position="top-right" />
          </div>
        )}

        {/* Sponsor Header Tag */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <span 
              className="text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded font-mono border"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.accent,
              }}
            >
              {sponsor.tag}
            </span>
            <span className="text-[11px] opacity-75 font-medium">
              {sponsor.brand}
            </span>
          </div>

          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: currentStyle.colors.accentSecondary + '15',
              color: currentStyle.colors.accentSecondary,
            }}
          >
            {sponsor.badge}
          </span>
        </div>

        {/* Main Body */}
        <div 
          onClick={handleOpenSponsor}
          className="cursor-pointer group space-y-1"
        >
          <h4 
            className={`${currentStyle.typography.headingFont} text-sm font-bold transition-colors group-hover:opacity-80 flex items-center justify-between`}
            style={{ color: currentStyle.colors.textPrimary }}
          >
            <span>{sponsor.title}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80 transition-opacity ml-1 shrink-0" />
          </h4>
          <p className="text-xs opacity-75 leading-relaxed">
            {sponsor.description}
          </p>
        </div>

        {/* Footer info explaining the non-intrusive ad philosophy */}
        <div className="pt-2 border-t flex items-center justify-between text-[10px] opacity-60" style={{ borderColor: currentStyle.colors.border }}>
          <span className="flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1" style={{ color: currentStyle.colors.accent }} />
            無料AI生成を支える朝の協賛枠
          </span>
          <button
            onClick={handleOpenSponsor}
            className="font-bold underline cursor-pointer hover:opacity-100"
            style={{ color: currentStyle.colors.accent }}
          >
            詳細・クーポン
          </button>
        </div>
      </div>

      {/* Sponsor Details & Promo Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div 
            className="w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 relative"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentStyle.colors.border }}>
              <div className="flex items-center space-x-1.5">
                <Gift className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
                <span className="font-bold text-sm">朝の読者限定特典</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer"
                title="閉じる"
              >
                <CloseCrossAsset size={13} />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {sponsor.tag}
              </span>
              <h3 className={`${currentStyle.typography.headingFont} text-base font-bold`}>
                {sponsor.brand}
              </h3>
              <p className="text-xs opacity-80 leading-relaxed">
                {sponsor.description}
              </p>
            </div>

            {/* Promo Code Box */}
            {sponsor.promoCode && (
              <div 
                className="p-3.5 rounded-2xl border text-center space-y-2"
                style={{
                  backgroundColor: currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                }}
              >
                <span className="text-[10px] opacity-70 block font-medium">読者専用クーポンコード</span>
                <div className="font-mono font-bold text-base tracking-widest" style={{ color: currentStyle.colors.accent }}>
                  {sponsor.promoCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border"
                  style={{
                    backgroundColor: copied ? '#10B981' : currentStyle.colors.accentSecondary,
                    color: '#FFFFFF',
                    borderColor: 'transparent',
                  }}
                >
                  {copied ? 'コードをコピーしました！' : 'クーポンをコピーする'}
                </button>
              </div>
            )}

            {/* Free AI offset notice */}
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] opacity-70 leading-relaxed space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <Info className="w-3 h-3" />
                <span>広告表示と料金相殺について</span>
              </div>
              <p>
                本アプリでは世界観を壊さない厳選スポンサー枠により、無料プランでの毎朝のAI夢解析（Gemini）費用を全額相殺しています。
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl border text-xs font-bold transition-opacity cursor-pointer"
              style={{
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
};
