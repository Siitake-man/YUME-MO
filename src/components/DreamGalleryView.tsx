import React, { useState } from 'react';
import { DreamRecord } from '../types';
import { Compass, Tag, Search, Filter, BookOpen, Eye, User, Moon, EyeOff, MessageSquareQuote } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { StorybookDecorations, CelestialDecorations } from './Decorations';
import { NativeSponsorCard } from './NativeSponsorCard';
import { NekoMascot } from './DreamMascots';
import { CuteStamp } from './PlayfulAccents';
import { MangaFrameEmblem, MoonCrestAsset, SparkleAsset, StarGemAsset, BookJournalAsset } from './IllustratedAssets';

interface DreamGalleryViewProps {
  dreams: DreamRecord[];
  onSelectDream: (dream: DreamRecord) => void;
  onReactDream: (dreamId: string, reactionType: 'moon' | 'surreal' | 'relatable') => void;
  showSponsor?: boolean;
}

const CATEGORIES = ['すべて', '仕事の夢', '空想・SF', '日常の歪み', '動物と出会う夢', '冒険・逃走'];

export const DreamGalleryView: React.FC<DreamGalleryViewProps> = ({
  dreams,
  onSelectDream,
  onReactDream,
  showSponsor = true,
}) => {
  const { currentStyle } = useUIStyle();
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const publicDreams = dreams.filter((d) => d.isPublic);

  const filteredDreams = publicDreams.filter((dream) => {
    const matchCat =
      selectedCategory === 'すべて' || dream.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.motifs.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="pb-28 max-w-lg mx-auto p-4 space-y-4 animate-in fade-in duration-200">
      {/* Gallery Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div 
            className="w-7 h-7 rounded-sm flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: currentStyle.colors.accentSecondary,
              color: currentStyle.colors.accent,
            }}
          >
            <Compass className="w-4 h-4 text-white" />
          </div>
          <h2 
            className={`${currentStyle.typography.headingFont} text-xl font-bold`}
            style={{ color: currentStyle.colors.accentSecondary }}
          >
            夢の標本図鑑
          </h2>
        </div>
        <p className="text-xs opacity-75 leading-relaxed">
          誰かが今朝、消えゆく直前に捕まえた不思議な世界のコレクション。
        </p>
      </div>

      {/* Dream Neko Specimen Curator Card */}
      <div 
        className="rounded-3xl p-3.5 border shadow-sm relative overflow-hidden flex items-center space-x-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="shrink-0">
          <NekoMascot size="sm" isWalking={true} showSpeech={false} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-handwriting font-bold text-xs text-neutral-800 dark:text-neutral-200">
              夢ねこさんの標本番
            </span>
            <CuteStamp text="収蔵中" color="#EA580C" />
          </div>
          <p className="font-handwriting text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug">
            「みんなの夢の標本が{publicDreams.length}個あつまってるニャ！雲の上で丸くなりながら読ませてもらうニャ〜」
          </p>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="モチーフや言葉で夢を検索..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
            style={{
              backgroundColor: currentStyle.colors.cardBg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setSelectedCategory(cat);
                }}
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border"
                style={{
                  backgroundColor: isSelected ? currentStyle.colors.accentSecondary : currentStyle.colors.cardBg,
                  borderColor: isSelected ? currentStyle.colors.accentSecondary : currentStyle.colors.border,
                  color: isSelected ? '#FFFFFF' : currentStyle.colors.textPrimary,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dream Cards Grid */}
      {filteredDreams.length === 0 ? (
        <div 
          className="rounded-2xl p-8 text-center space-y-2 border"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <Compass className="w-8 h-8 opacity-30 mx-auto" />
          <p className="text-sm font-bold" style={{ color: currentStyle.colors.accentSecondary }}>
            該当する夢が見つかりませんでした
          </p>
          <p className="text-xs opacity-60">
            検索条件を変えるか、自分の夢を「図鑑に公開」してみましょう。
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDreams.map((dream, index) => {
            return (
              <React.Fragment key={dream.id}>
                <div
                  className="rounded-2xl p-4 border shadow-2xs hover:scale-[1.005] transition-all space-y-3 relative overflow-hidden"
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.border,
                  }}
                >
                  {/* Washi decor if washi style */}
                  {currentStyle.id === 'washi' && (
                    <div className="absolute top-0 right-4 scale-75 pointer-events-none">
                      <StorybookDecorations.WashiTape />
                    </div>
                  )}

                  {/* Author and Date Header */}
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <div className="flex items-center space-x-1.5">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border"
                        style={{
                          backgroundColor: currentStyle.colors.accent + '20',
                          borderColor: currentStyle.colors.accent + '40',
                          color: currentStyle.colors.accent,
                        }}
                      >
                        {dream.authorName?.[0] || '標'}
                      </div>
                      <span className="font-medium font-serif">{dream.authorName || '記録者'}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{dream.dateLabel}</span>
                    </div>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                      style={{
                        backgroundColor: currentStyle.colors.bg,
                        borderColor: currentStyle.colors.border,
                      }}
                    >
                      {dream.category}
                    </span>
                  </div>

                  {/* Card Main Title and Summary */}
                  <div
                    onClick={() => {
                      audioEngine.playMechanicalClick('low');
                      onSelectDream(dream);
                    }}
                    className="cursor-pointer group"
                  >
                    <h3 
                      className={`${currentStyle.typography.headingFont} text-base font-bold transition-colors group-hover:opacity-80`}
                      style={{ color: currentStyle.colors.textPrimary }}
                    >
                      {dream.title}
                    </h3>
                    <p className="text-xs opacity-75 mt-1 leading-relaxed line-clamp-2">
                      {dream.summary}
                    </p>
                  </div>

                  {/* Motifs Tags */}
                  <div className="flex flex-wrap gap-1">
                    {dream.motifs.slice(0, 4).map((motif, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: currentStyle.colors.bg,
                          borderColor: currentStyle.colors.border,
                          color: currentStyle.colors.textPrimary,
                        }}
                      >
                        #{motif}
                      </span>
                    ))}
                    {dream.comicStrip && (
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center border"
                        style={{
                          backgroundColor: currentStyle.colors.accent + '20',
                          borderColor: currentStyle.colors.accent + '40',
                          color: currentStyle.colors.accent,
                        }}
                      >
                        <MangaFrameEmblem size={12} className="mr-1" />
                        4コマ有
                      </span>
                    )}
                  </div>

                  {/* Reaction Bar with warm illustrated vector icons */}
                  <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: currentStyle.colors.border }}>
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      {/* Moon / Contemplation */}
                      <button
                        onClick={() => {
                          audioEngine.playMechanicalClick('high');
                          onReactDream(dream.id, 'moon');
                        }}
                        className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-warm"
                        style={{
                          backgroundColor: dream.userReaction === 'moon' ? currentStyle.colors.accentSecondary : currentStyle.colors.bg,
                          borderColor: currentStyle.colors.border,
                          color: dream.userReaction === 'moon' ? '#FFFFFF' : currentStyle.colors.textPrimary,
                        }}
                      >
                        <MoonCrestAsset size={12} className="shrink-0" />
                        <span className="font-serif text-[10px] font-bold tracking-tight">鑑賞</span>
                        <span className="text-[11px] font-mono font-bold">
                          {dream.reactions?.moon || 0}
                        </span>
                      </button>

                      {/* Surreal */}
                      <button
                        onClick={() => {
                          audioEngine.playMechanicalClick('high');
                          onReactDream(dream.id, 'surreal');
                        }}
                        className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-warm"
                        style={{
                          backgroundColor: dream.userReaction === 'surreal' ? currentStyle.colors.accentSecondary : currentStyle.colors.bg,
                          borderColor: currentStyle.colors.border,
                          color: dream.userReaction === 'surreal' ? '#FFFFFF' : currentStyle.colors.textPrimary,
                        }}
                      >
                        <SparkleAsset size={11} className="shrink-0" />
                        <span className="font-serif text-[10px] font-bold tracking-tight">奇観</span>
                        <span className="text-[11px] font-mono font-bold">
                          {dream.reactions?.surreal || 0}
                        </span>
                      </button>

                      {/* Relatable */}
                      <button
                        onClick={() => {
                          audioEngine.playMechanicalClick('high');
                          onReactDream(dream.id, 'relatable');
                        }}
                        className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer font-warm"
                        style={{
                          backgroundColor: dream.userReaction === 'relatable' ? currentStyle.colors.accentSecondary : currentStyle.colors.bg,
                          borderColor: currentStyle.colors.border,
                          color: dream.userReaction === 'relatable' ? '#FFFFFF' : currentStyle.colors.textPrimary,
                        }}
                      >
                        <StarGemAsset size={11} className="shrink-0" />
                        <span className="font-serif text-[10px] font-bold tracking-tight">共鳴</span>
                        <span className="text-[11px] font-mono font-bold">
                          {dream.reactions?.relatable || 0}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        audioEngine.playMechanicalClick('low');
                        onSelectDream(dream);
                      }}
                      className="text-xs font-bold flex items-center space-x-1 cursor-pointer hover:opacity-80"
                      style={{ color: currentStyle.colors.accent }}
                    >
                      <span>詳しく見る</span>
                    </button>
                  </div>
                </div>

                {/* Inject tasteful Native Sponsor card after the first dream */}
                {showSponsor && index === 0 && (
                  <NativeSponsorCard variant="feed" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
