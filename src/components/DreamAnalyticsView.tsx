import React from 'react';
import { DreamRecord } from '../types';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { 
  Activity, BarChart3, TrendingUp, Calendar, Award, Brain, Zap, Clock, Tag, Sparkles
} from 'lucide-react';
import { StorybookDecorations } from './Decorations';
import { UsagiMascot } from './DreamMascots';
import { HandwrittenPostIt, CuteStamp } from './PlayfulAccents';
import { SparkleAsset } from './IllustratedAssets';

interface DreamAnalyticsViewProps {
  dreams: DreamRecord[];
  onSelectDream: (dream: DreamRecord) => void;
}

export const DreamAnalyticsView: React.FC<DreamAnalyticsViewProps> = ({
  dreams,
  onSelectDream,
}) => {
  const { currentStyle } = useUIStyle();

  // Metrics computation
  const totalDreams = dreams.length;
  const avgSurrealism = Math.round(
    dreams.reduce((acc, d) => acc + (d.parameters.surrealism || 70), 0) / (totalDreams || 1)
  );
  const avgWorkFactor = Math.round(
    dreams.reduce((acc, d) => acc + (d.parameters.workFactor || 30), 0) / (totalDreams || 1)
  );
  const avgFloatiness = Math.round(
    dreams.reduce((acc, d) => acc + (d.parameters.floatiness || d.parameters.floatingSense || 50), 0) / (totalDreams || 1)
  );
  const avgLogicBreak = Math.round(
    dreams.reduce((acc, d) => acc + (d.parameters.logicBreak || 80), 0) / (totalDreams || 1)
  );

  // Motif frequency map
  const motifCounts: { [key: string]: number } = {};
  dreams.forEach((d) => {
    d.motifs.forEach((m) => {
      motifCounts[m] = (motifCounts[m] || 0) + 1;
    });
  });
  const sortedMotifs = Object.entries(motifCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Category breakdown
  const categoryCounts: { [key: string]: number } = {};
  dreams.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  return (
    <div className="pb-28 max-w-lg mx-auto p-4 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div 
            className="w-7 h-7 rounded-sm flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: currentStyle.colors.accentSecondary,
              color: currentStyle.colors.accent,
            }}
          >
            <Activity className="w-4 h-4 text-white" />
          </div>
          <h2 
            className={`${currentStyle.typography.headingFont} text-xl font-bold`}
            style={{ color: currentStyle.colors.accentSecondary }}
          >
            無意識の深層カルテ
          </h2>
        </div>
        <p className="text-xs opacity-75 leading-relaxed">
          目覚めの記録から抽出された、あなたの深層心理と睡眠リズムの統計。
        </p>
      </div>

      {/* Usagi Dream Investigator Greeting Card */}
      <div 
        className="rounded-3xl p-3.5 border shadow-sm relative overflow-hidden flex items-center space-x-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="shrink-0">
          <UsagiMascot size="sm" isWalking={true} showSpeech={false} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-handwriting font-bold text-xs text-neutral-800 dark:text-neutral-200">
              星耳うさぎの夢分析レポート
            </span>
            <CuteStamp text="解析済" color="#8B5CF6" />
          </div>
          <p className="font-handwriting text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug">
            「最近は『{sortedMotifs[0]?.[0] || '空'}』の出現率が高めピョン！シュール度{avgSurrealism}%で創造力が豊かに冴えわたっているよ！」
          </p>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Record Streak */}
        <div 
          className="rounded-2xl p-3.5 border space-y-1 shadow-2xs relative overflow-hidden"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>連続記録日数</span>
            <Calendar className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
          </div>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-2xl font-black font-mono" style={{ color: currentStyle.colors.accentSecondary }}>
              {Math.min(totalDreams, 7)}
            </span>
            <span className="text-xs font-serif font-bold">日連続</span>
          </div>
          <p className="text-[10px] opacity-60">朝起きてすぐ声で捕獲</p>
        </div>

        {/* Metric 2: Avg Surrealism */}
        <div 
          className="rounded-2xl p-3.5 border space-y-1 shadow-2xs relative overflow-hidden"
          style={{
            backgroundColor: currentStyle.colors.cardBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>平均シュール度</span>
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
          </div>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-2xl font-black font-mono" style={{ color: currentStyle.colors.accent }}>
              {avgSurrealism}
            </span>
            <span className="text-xs font-mono font-bold">%</span>
          </div>
          <p className="text-[10px] opacity-60">非日常・空想強度の指数</p>
        </div>
      </div>

      {/* Deep Component Breakdown Radar / Bars */}
      <div 
        className="rounded-2xl p-4 border space-y-3.5 shadow-2xs relative overflow-hidden"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold flex items-center space-x-1.5" style={{ color: currentStyle.colors.textPrimary }}>
            <Brain className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
            <span>夢の成分バランス平均</span>
          </h3>
          <span className="text-[10px] opacity-60 font-mono">全{totalDreams}件 集計</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="opacity-80">シュール・非日常度</span>
              <span className="font-mono font-bold">{avgSurrealism}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${avgSurrealism}%`, backgroundColor: currentStyle.colors.accent }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="opacity-80">ロジック崩壊・不条理指数</span>
              <span className="font-mono font-bold">{avgLogicBreak}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${avgLogicBreak}%`, backgroundColor: currentStyle.colors.accentSecondary }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="opacity-80">浮遊感・精神の飛翔性</span>
              <span className="font-mono font-bold">{avgFloatiness}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
              <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${avgFloatiness}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="opacity-80">現実タスク・職場ストレス残滓</span>
              <span className="font-mono font-bold">{avgWorkFactor}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
              <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${avgWorkFactor}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recurring Motifs Ranking */}
      <div 
        className="rounded-2xl p-4 border space-y-3 shadow-2xs"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold flex items-center space-x-1.5" style={{ color: currentStyle.colors.textPrimary }}>
            <Tag className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
            <span>頻出モチーフ・無意識の出現率</span>
          </h3>
          <span className="text-[10px] opacity-60 font-mono">ランキング</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {sortedMotifs.map(([motif, count], idx) => (
            <div 
              key={motif}
              className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-mono font-bold">
                  {idx + 1}
                </span>
                <span className="font-bold">#{motif}</span>
              </div>
              <span className="font-mono text-[11px] opacity-75 font-bold">
                {count}回
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dream Category Ratio */}
      <div 
        className="rounded-2xl p-4 border space-y-3 shadow-2xs"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <h3 className="text-xs font-bold flex items-center space-x-1.5" style={{ color: currentStyle.colors.textPrimary }}>
          <BarChart3 className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
          <span>夢のカテゴリ分布</span>
        </h3>

        <div className="space-y-2">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const pct = Math.round((count / (totalDreams || 1)) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{cat}</span>
                  <span className="font-mono opacity-80">{count}編 ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${pct}%`, 
                      backgroundColor: currentStyle.colors.accentSecondary 
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Psychologist / Dream Analyst Reflection Note */}
      <div 
        className="rounded-2xl p-4 text-white shadow-md relative overflow-hidden space-y-2"
        style={{
          background: currentStyle.colors.heroGradient,
          border: `1px solid ${currentStyle.colors.border}`,
        }}
      >
        <div className="flex items-center space-x-1.5 text-xs font-bold" style={{ color: currentStyle.colors.accent }}>
          <Sparkles className="w-4 h-4" />
          <span>今週の深層心理インサイト</span>
        </div>
        <p className="text-xs leading-relaxed opacity-90 font-serif">
          「最近の夢では『{sortedMotifs[0]?.[0] || '日常'}』や『{sortedMotifs[1]?.[0] || '空想'}』のモチーフが多く、現実の秩序をほどいてリセットしようとする無意識の創造的な働きが見られます。朝の音声捕獲を続けることで、より鮮やかなインスピレーションが記録されます。」
        </p>
      </div>
    </div>
  );
};
