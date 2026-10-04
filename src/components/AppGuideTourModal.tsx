import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Mic, Bell, Image as ImageIcon, 
  Palette, Shield, Check, Compass, Play, BookOpen, ArrowRight
} from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { BakuMascot, HitsujiMascot, TsukisamaMascot } from './DreamMascots';
import { SparkleAsset, MoonCrestAsset } from './IllustratedAssets';

interface AppGuideTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTour: () => void;
  onOpenRecordModal?: () => void;
  onSimulateAlarm?: () => void;
}

interface TourStep {
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  accentIcon: React.ReactNode;
  previewGraphic: React.ReactNode;
  actionButton?: {
    label: string;
    icon: React.ReactNode;
    action: () => void;
  };
}

export const AppGuideTourModal: React.FC<AppGuideTourModalProps> = ({
  isOpen,
  onClose,
  onCompleteTour,
  onOpenRecordModal,
  onSimulateAlarm,
}) => {
  const { currentStyle } = useUIStyle();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      stepNumber: 1,
      badge: 'STEP 1 / 5',
      title: '朝のアラームと目覚めの30秒',
      subtitle: '「夢は目覚めて30秒で消えてしまう」',
      description: '設定した朝のアラームを止めると、自動で夢記録モードがオープン。起きたてで頭がぼんやりしていても、ボタンひとつで記録をスタートできます。',
      tip: 'ヘッダーの「朝テスト」ボタンから、いつでもアラーム動作を試せます。',
      accentIcon: <Bell className="w-5 h-5 text-amber-500" />,
      previewGraphic: (
        <div className="relative w-full h-36 rounded-2xl flex flex-col items-center justify-center overflow-hidden border border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-orange-500/5">
          <div className="absolute top-2 left-3 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
            07:00 AM • ALARM
          </div>
          <div className="flex items-center space-x-3">
            <Bell className="w-10 h-10 text-amber-500 animate-bounce" />
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                おはようございます！
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                いま見ていた夢、覚えていますか？
              </div>
            </div>
          </div>
          <div className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
            アラーム停止 ➜ 録音へ直行
          </div>
        </div>
      ),
      actionButton: onSimulateAlarm
        ? {
            label: 'アラームを体験してみる',
            icon: <Bell className="w-3.5 h-3.5" />,
            action: () => {
              onClose();
              onSimulateAlarm();
            },
          }
        : undefined,
    },
    {
      stepNumber: 2,
      badge: 'STEP 2 / 5',
      title: '起きたての声をそのまま録音',
      subtitle: '声紋プロファイル & 重複除去エンジン',
      description: '寝起きのぼそぼそ声・掠れ声でも「声紋ブースト」でしっかり認識。また、ブラウザ音声認識で発生しがちな「同じ言葉が連続して繰り返されるバグ」を完全自動除去します。',
      tip: '「しおちゃん」などの友人名や固有名詞辞書を登録しておくと誤認識を防げます。',
      accentIcon: <Mic className="w-5 h-5 text-indigo-500" />,
      previewGraphic: (
        <div className="relative w-full h-36 rounded-2xl flex flex-col items-center justify-center overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
              寝起き声紋キャリブレーション
            </span>
          </div>
          <div className="bg-white/80 dark:bg-neutral-800/80 rounded-xl p-2 text-[11px] max-w-xs shadow-2xs border border-indigo-200 dark:border-neutral-700">
            「しおちゃんと水族館に行って新しい魚を見る…」
          </div>
          <div className="flex items-center space-x-2 mt-2 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            <span>✓ 重複ループ完全排除</span>
            <span>•</span>
            <span>✓ かすれ声ブーストON</span>
          </div>
        </div>
      ),
      actionButton: onOpenRecordModal
        ? {
            label: '音声を吹き込んでみる',
            icon: <Mic className="w-3.5 h-3.5" />,
            action: () => {
              onClose();
              onOpenRecordModal();
            },
          }
        : undefined,
    },
    {
      stepNumber: 3,
      badge: 'STEP 3 / 5',
      title: 'AIが4コマ漫画 & カルテ化',
      subtitle: '起承転結ストーリー & AIイラスト生成',
      description: '話した断片的な夢をもとに、AIがユーモラスな4コマ漫画シナリオと映画風ポスターを自動構成。さらに昭和レトロ漫画や水彩絵本などのAIイラストをコマごとに生成できます。',
      tip: 'シュール度、職場タスク度、猫成分などのユニークなパラメータも算出されます。',
      accentIcon: <ImageIcon className="w-5 h-5 text-rose-500" />,
      previewGraphic: (
        <div className="relative w-full h-36 rounded-2xl flex items-center justify-center overflow-hidden border border-rose-500/20 bg-gradient-to-b from-rose-500/10 to-pink-500/5 px-3">
          <div className="grid grid-cols-4 gap-1.5 w-full max-w-xs">
            {['起: 部屋', '承: 巨大猫', '転: 浮遊', '結: 目覚め'].map((panel, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-neutral-800 rounded-lg p-1.5 border border-rose-200 dark:border-neutral-700 text-center shadow-2xs space-y-1"
              >
                <div className="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                  {panel.split(':')[0]}
                </div>
                <div className="w-full aspect-square rounded bg-rose-50 dark:bg-neutral-700 flex items-center justify-center text-[10px]">
                  {idx === 0 ? '🏠' : idx === 1 ? '🐱' : idx === 2 ? '☕' : '⏰'}
                </div>
                <div className="text-[8px] truncate opacity-70">
                  {panel.split(':')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      stepNumber: 4,
      badge: 'STEP 4 / 5',
      title: '秘密の夢図鑑 & 安全な保存',
      subtitle: '完全プライベート＆いつでも見返せる図鑑',
      description: '記録した夢は初期状態で完全非公開。あなただけの秘密の夢日記として安全に蓄積され、キーワード検索や感情分析・シュール度ランキングでいつでも振り返ることができます。',
      tip: 'もちろん、気に入った夢は4コマ画像やテキストでSNSにシェアすることもできます。',
      accentIcon: <Shield className="w-5 h-5 text-emerald-500" />,
      previewGraphic: (
        <div className="relative w-full h-36 rounded-2xl flex flex-col items-center justify-center overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-teal-500/5 px-4 text-center">
          <div className="flex items-center space-x-2 mb-1.5">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
              端末内セキュアローカル保存
            </span>
          </div>
          <div className="text-[11px] opacity-80 max-w-xs leading-relaxed">
            誰にも見られない安心のプライベート日記。外部サーバーへ個人情報が流出することはありません。
          </div>
          <div className="mt-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-2xs">
            <Check className="w-3 h-3 mr-1" />
            プライバシー保護 100%
          </div>
        </div>
      ),
    },
    {
      stepNumber: 5,
      badge: 'STEP 5 / 5',
      title: '4つの世界観デザイン切り替え',
      subtitle: '気分に合わせて着替える夢の世界',
      description: '「活版夢草紙（和風絵本）」「ミッドナイト（宇宙・深海）」「ガラス標本（近代研究所）」「レトロカセット（80sシティポップ）」の4つの洗練されたUIをいつでもワンタップで切り替え可能です。',
      tip: 'ヘッダーの「パレット」アイコンから即座にデザインをプレビューできます。',
      accentIcon: <Palette className="w-5 h-5 text-purple-500" />,
      previewGraphic: (
        <div className="relative w-full h-36 rounded-2xl flex items-center justify-center overflow-hidden border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-indigo-500/5 px-2">
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            {[
              { label: '活版夢草紙', color: '#6A2E2E' },
              { label: 'ミッドナイト', color: '#1B2430' },
              { label: 'ガラス標本', color: '#2B4842' },
              { label: 'レトロカセット', color: '#2D3250' },
            ].map((style, i) => (
              <div
                key={i}
                className="p-2 rounded-xl text-white text-center shadow-xs text-xs font-bold flex items-center justify-center space-x-1"
                style={{ backgroundColor: style.color }}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="text-[10px]">{style.label}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onCompleteTour();
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-colors max-h-[95vh]"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Top Header */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center space-x-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: currentStyle.colors.accent + '25',
                color: currentStyle.colors.accent,
              }}
            >
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold font-mono">夢のあと 利用ツアー</span>
              <span className="text-[10px] opacity-60 ml-2 font-mono">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onCompleteTour();
              onClose();
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer opacity-70 hover:opacity-100"
            style={{
              borderColor: currentStyle.colors.border,
              backgroundColor: currentStyle.colors.cardBg,
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Content Area */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Step Badge & Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: currentStyle.colors.accent + '20',
                  color: currentStyle.colors.accent,
                }}
              >
                {currentStep.badge}
              </span>
              <div className="flex items-center space-x-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStepIndex
                        ? 'w-5'
                        : 'w-1.5 opacity-30'
                    }`}
                    style={{
                      backgroundColor:
                        i === currentStepIndex
                          ? currentStyle.colors.accent
                          : currentStyle.colors.textPrimary,
                    }}
                  />
                ))}
              </div>
            </div>

            <h3
              className={`${currentStyle.typography.headingFont} text-lg font-bold pt-1`}
              style={{ color: currentStyle.colors.accentSecondary }}
            >
              {currentStep.title}
            </h3>
            <p className="text-xs font-medium opacity-75">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Graphic Preview Box */}
          <div>{currentStep.previewGraphic}</div>

          {/* Description */}
          <p className="text-xs leading-relaxed opacity-90">
            {currentStep.description}
          </p>

          {/* Tip Box */}
          <div
            className="p-3 rounded-xl border text-[11px] leading-relaxed flex items-start space-x-2"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: currentStyle.colors.accent }} />
            <span>
              <strong className="font-bold">Point:</strong> {currentStep.tip}
            </span>
          </div>

          {/* Step Action Button if available */}
          {currentStep.actionButton && (
            <button
              onClick={currentStep.actionButton.action}
              className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.accent + '15',
                borderColor: currentStyle.colors.accent + '40',
                color: currentStyle.colors.textPrimary,
              }}
            >
              {currentStep.actionButton.icon}
              <span>{currentStep.actionButton.label}</span>
            </button>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div
          className="p-4 border-t flex items-center justify-between shrink-0"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          {currentStepIndex > 0 ? (
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1 cursor-pointer transition-opacity hover:opacity-100 opacity-80"
              style={{
                borderColor: currentStyle.colors.border,
                backgroundColor: currentStyle.colors.cardBg,
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>前へ</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onCompleteTour();
                onClose();
              }}
              className="text-xs opacity-60 hover:opacity-90 font-medium cursor-pointer"
            >
              スキップ
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
            style={{
              backgroundColor: currentStyle.colors.accentSecondary,
              color: '#FFFFFF',
            }}
          >
            <span>{isLastStep ? 'ツアー完了！アプリを使う' : '次へ'}</span>
            {isLastStep ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
