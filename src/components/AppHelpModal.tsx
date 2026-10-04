import React, { useState } from 'react';
import { 
  X, HelpCircle, BookOpen, Mic, Sparkles, Image as ImageIcon, 
  Shield, Volume2, Bell, ChevronDown, ChevronRight, Search, 
  ExternalLink, CheckCircle2, MessageCircle, AlertCircle
} from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { BakuMascot, HitsujiMascot, TsukisamaMascot } from './DreamMascots';
import { SparkleAsset, MoonCrestAsset } from './IllustratedAssets';

interface AppHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

type HelpCategory = 'all' | 'basics' | 'voice' | 'comic' | 'privacy';

interface FAQItem {
  id: string;
  category: 'basics' | 'voice' | 'comic' | 'privacy';
  question: string;
  answer: string;
  badge?: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'voice-morning',
    category: 'voice',
    question: '寝起きのぼそぼそ声やかすれ声でも正確に聞き取れますか？',
    answer: 'はい！本アプリには「声紋プロファイル機能」と「寝起きかすれ声ブースト」が備わっており、朝起きたての低音や掠れ声をWeb Audio APIのハイパスフィルターで的確に増幅します。設定画面または録音画面の「声紋チューニング」からご自身の声質を簡単に測定・学習できます。',
    badge: 'おすすめ',
  },
  {
    id: 'voice-repeat',
    category: 'voice',
    question: '文字起こしで同じ言葉が何度も繰り返されることはありませんか？',
    answer: 'Android Chrome等のブラウザ音声認識で発生しやすい連続リピートバグを防止するため、スライディングウィンドウ方式の「リアルタイム重複除去アルゴリズム」および「Gemini声紋補正」を搭載しています。重複フレーズは自動的に1回に整理されます。',
  },
  {
    id: 'voice-dictionary',
    category: 'voice',
    question: '夢に出てくる友達の名前や固有名詞を登録できますか？',
    answer: '可能です！声紋プロファイル内の「よく登場する人物・固有名詞辞書」にご友人のお名前（例:「しおちゃん」等）や固有の地名などを登録しておくと、似た発音の一般的な単語（「塩」など）への誤変換を未然に防ぎます。',
    badge: '便利',
  },
  {
    id: 'comic-generate',
    category: 'comic',
    question: '4コマ漫画はどのように作られますか？画像生成もできますか？',
    answer: '話した夢の断片から、AIが「起・承・転・結」のストーリー構成を自動作成します。さらに昭和レトロ漫画、水彩絵本、8-Bitドット絵、35mmシネマ映画などの画風で各コマのAIイラストをワンタップで生成することも可能です。',
  },
  {
    id: 'privacy-cloud',
    category: 'privacy',
    question: '記録した夢の内容が外部に勝手に公開されることはありますか？',
    answer: '一切ありません。すべての夢の記録は初期設定で「完全非公開」として端末内に安全に保存されます。ご自身が詳細画面で明示的に「SNSシェア」または「公開」を選択しない限り、他の誰かに見られることはありません。',
    badge: '安心',
  },
  {
    id: 'alarm-flow',
    category: 'basics',
    question: '起床アラームから夢記録への流れはどうやって使うのですか？',
    answer: '設定画面でアラーム時刻をセットしておくと、朝のアラーム停止と同時に自動的に「夢の録音画面」が起動します。覚醒して30秒で消えてしまう夢の記憶を、目を開けた直後にすぐ話すだけで残すことができます。ヘッダーの「朝テスト」ボタンでいつでも体験できます。',
  },
  {
    id: 'ui-styles',
    category: 'basics',
    question: 'UIのデザインや雰囲気を変更できますか？',
    answer: 'ヘッダーの「パレット」ボタンまたは設定から「活版夢草紙（和風絵本）」「ミッドナイト（宇宙・深海）」「ガラス標本（近代研究所）」「レトロカセット（80年代シティポップ）」の4つの世界観をいつでも即座に切り替えてお楽しみいただけます。',
  },
];

export const AppHelpModal: React.FC<AppHelpModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  const { currentStyle } = useUIStyle();
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFAQIds, setOpenFAQIds] = useState<string[]>(['voice-morning']);

  if (!isOpen) return null;

  const toggleFAQ = (id: string) => {
    setOpenFAQIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = FAQ_LIST.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0 relative"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: currentStyle.colors.accent + '25',
                color: currentStyle.colors.accent,
              }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`${currentStyle.typography.headingFont} text-base font-bold flex items-center space-x-1.5`}>
                <span>夢のあと ガイド & ヘルプ</span>
                <SparkleAsset size={14} />
              </h2>
              <p className="text-[11px] opacity-70">
                アプリの使い方、声紋録音のコツ、よくある質問
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
            style={{
              borderColor: currentStyle.colors.border,
              backgroundColor: currentStyle.colors.cardBg,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Tour Banner */}
          <div
            className="rounded-2xl p-4 border text-left flex items-center justify-between relative overflow-hidden shadow-xs"
            style={{
              background: currentStyle.colors.heroGradient,
              borderColor: currentStyle.colors.border,
              color: '#FFFFFF',
            }}
          >
            <div className="space-y-1 z-10 max-w-[260px]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                初めての方へ
              </span>
              <h3 className={`${currentStyle.typography.headingFont} text-sm font-bold pt-0.5`}>
                5ステップ利用ツアーを見る
              </h3>
              <p className="text-[11px] opacity-85 leading-tight">
                起きてから4コマ漫画ができるまでの流れを画面付きで体験
              </p>
            </div>

            <div className="z-10 flex flex-col items-end space-y-2">
              <button
                onClick={() => {
                  onClose();
                  if (onStartTour) onStartTour();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95 flex items-center space-x-1"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: currentStyle.colors.accentSecondary,
                }}
              >
                <span>ツアーを開始</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute -right-4 -bottom-6 opacity-25 pointer-events-none">
              <TsukisamaMascot size="lg" />
            </div>
          </div>

          {/* Quick Feature Pillars */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="p-3 rounded-xl border text-center space-y-1 shadow-2xs"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <Mic className="w-4 h-4 mx-auto" style={{ color: currentStyle.colors.accent }} />
              <div className="text-[11px] font-bold">寝起き声紋録音</div>
              <div className="text-[9px] opacity-70 leading-tight">かすれ声ブースト＆重複除去</div>
            </div>

            <div
              className="p-3 rounded-xl border text-center space-y-1 shadow-2xs"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <ImageIcon className="w-4 h-4 mx-auto" style={{ color: currentStyle.colors.accentSecondary }} />
              <div className="text-[11px] font-bold">AI 4コマ漫画</div>
              <div className="text-[9px] opacity-70 leading-tight">起承転結＆昭和・絵本画風</div>
            </div>

            <div
              className="p-3 rounded-xl border text-center space-y-1 shadow-2xs"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <Shield className="w-4 h-4 mx-auto" style={{ color: '#10B981' }} />
              <div className="text-[11px] font-bold">完全プライベート</div>
              <div className="text-[9px] opacity-70 leading-tight">端末内完結で外部流出ゼロ</div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="知りたいことを検索（声紋、4コマ、プライバシー…）"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'all', label: 'すべて' },
              { key: 'voice', label: '音声・声紋' },
              { key: 'comic', label: '4コマ漫画・AI' },
              { key: 'basics', label: '基本・アラーム' },
              { key: 'privacy', label: 'プライバシー' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key as HelpCategory)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-bold transition-all cursor-pointer border ${
                  selectedCategory === cat.key ? 'shadow-2xs' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat.key
                      ? currentStyle.colors.accentSecondary
                      : currentStyle.colors.bg,
                  color:
                    selectedCategory === cat.key ? '#FFFFFF' : currentStyle.colors.textPrimary,
                  borderColor: currentStyle.colors.border,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-2">
            {filteredFAQs.length === 0 ? (
              <div className="p-6 text-center text-xs opacity-60">
                該当するヘルプ項目が見つかりませんでした。
              </div>
            ) : (
              filteredFAQs.map((faq) => {
                const isOpen = openFAQIds.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl border overflow-hidden transition-all shadow-2xs"
                    style={{
                      backgroundColor: currentStyle.colors.bg,
                      borderColor: currentStyle.colors.border,
                    }}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full p-3 text-left text-xs font-bold flex items-center justify-between cursor-pointer space-x-2"
                    >
                      <div className="flex items-center space-x-2">
                        {faq.badge && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                            style={{
                              backgroundColor: currentStyle.colors.accent + '25',
                              color: currentStyle.colors.accent,
                            }}
                          >
                            {faq.badge}
                          </span>
                        )}
                        <span>{faq.question}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        style={{ color: currentStyle.colors.accent }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="px-3 pb-3 pt-1 text-[11px] leading-relaxed opacity-85 border-t"
                        style={{ borderColor: currentStyle.colors.border }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Mascot Tip */}
          <div
            className="p-3 rounded-2xl border flex items-center space-x-3 text-xs"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <BakuMascot size="sm" isWalking={false} showSpeech={false} />
            <div className="leading-tight">
              <span className="font-bold block">バクくんより：</span>
              <span className="opacity-80 text-[11px]">
                「夢はまとまっていなくてOK！『なんか猫が飛んでた』の一言だけでも、僕たちが立派な作品にするよ♪」
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-between shrink-0"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <button
            onClick={() => {
              onClose();
              if (onStartTour) onStartTour();
            }}
            className="text-xs font-bold flex items-center space-x-1 cursor-pointer opacity-80 hover:opacity-100"
            style={{ color: currentStyle.colors.accent }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ツアーを起動</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            style={{
              backgroundColor: currentStyle.colors.accentSecondary,
              color: '#FFFFFF',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
