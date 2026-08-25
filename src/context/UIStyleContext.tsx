import React, { createContext, useContext, useState, useEffect } from 'react';

export type UIStyleId = 'washi' | 'midnight' | 'vintage' | 'pastel';

export interface UIStyleConfig {
  id: UIStyleId;
  name: string;
  subtitle: string;
  badge: string;
  artStyle: string; // Design direction
  themeClass: string;
  colors: {
    bg: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentSecondary: string;
    border: string;
    navBg: string;
    heroGradient: string;
    recordBtnBg: string;
    recordBtnText: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    buttonRadius: string;
    cardRadius: string;
  };
}

export const UI_STYLES: Record<UIStyleId, UIStyleConfig> = {
  washi: {
    id: 'washi',
    name: '1. 活版手帖・和紙コラージュ',
    subtitle: '越前和紙、朱肉の角印、羽ペン挿絵。自然な陰影と余白を持つ手帖装丁。',
    badge: '和紙手帖・活版',
    artStyle: '和紙テクスチャ・朱肉角印・手書き万年筆・活版余白',
    themeClass: 'theme-washi',
    colors: {
      bg: '#FAF7F2',
      cardBg: '#FFFFFF',
      textPrimary: '#262320',
      textSecondary: '#635D54',
      accent: '#A84432',
      accentSecondary: '#2A3A4D',
      border: '#E6DFD3',
      navBg: 'rgba(250, 247, 242, 0.96)',
      heroGradient: 'linear-gradient(180deg, #2A3A4D 0%, #1D2937 100%)',
      recordBtnBg: '#A84432',
      recordBtnText: '#FFFFFF',
    },
    typography: {
      headingFont: 'font-mincho',
      bodyFont: 'font-sans',
      buttonRadius: 'rounded-2xl',
      cardRadius: 'rounded-3xl',
    },
  },
  midnight: {
    id: 'midnight',
    name: '2. 星辰天球・タロット占星術',
    subtitle: '漆黒の星空に刻まれた真鍮の天球儀、月相インジケーター、幾何学タロット装飾。',
    badge: '星辰・タロット',
    artStyle: '真鍮アストロラーベ・月相ホイール・タロット細密幾何学',
    themeClass: 'theme-midnight',
    colors: {
      bg: '#0C1017',
      cardBg: '#141B28',
      textPrimary: '#EAEFF8',
      textSecondary: '#8B9BB4',
      accent: '#C8A962',
      accentSecondary: '#8F7EA6',
      border: '#232E42',
      navBg: 'rgba(12, 16, 23, 0.96)',
      heroGradient: 'linear-gradient(145deg, #1A2438 0%, #0C1017 100%)',
      recordBtnBg: '#C8A962',
      recordBtnText: '#0C1017',
    },
    typography: {
      headingFont: 'font-mincho',
      bodyFont: 'font-sans',
      buttonRadius: 'rounded-2xl',
      cardRadius: 'rounded-2xl',
    },
  },
  vintage: {
    id: 'vintage',
    name: '3. 昭和電波カセットレコーダー',
    subtitle: '80年代アナログ録音機材。回転する磁気テープ、針式VUメーター、物理キースイッチ。',
    badge: '磁気テープ・80s機材',
    artStyle: 'カセットリール回転・VUメーター・スタジオ赤色RECスイッチ・物理クリック',
    themeClass: 'theme-vintage',
    colors: {
      bg: '#15181F',
      cardBg: '#202530',
      textPrimary: '#E2E7EE',
      textSecondary: '#8D9AA8',
      accent: '#D97706',
      accentSecondary: '#DC2626',
      border: '#2E3747',
      navBg: 'rgba(21, 24, 31, 0.96)',
      heroGradient: 'linear-gradient(180deg, #1C232E 0%, #12161E 100%)',
      recordBtnBg: '#DC2626',
      recordBtnText: '#FFFFFF',
    },
    typography: {
      headingFont: 'font-mono',
      bodyFont: 'font-mono',
      buttonRadius: 'rounded-lg',
      cardRadius: 'rounded-xl',
    },
  },
  pastel: {
    id: 'pastel',
    name: '4. 記憶標本・博物誌アーカイブ',
    subtitle: '朝の記憶を静謐な標本ガラス小瓶に採集。博物館カルテ番号と幾何学グリッド装丁。',
    badge: '博物誌・記憶標本',
    artStyle: 'ガラス標本小瓶・アーカイブ管理印・幾何学グリッド標本タグ',
    themeClass: 'theme-pastel',
    colors: {
      bg: '#F4F6F8',
      cardBg: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      accent: '#0D9488',
      accentSecondary: '#4F46E5',
      border: '#E2E8F0',
      navBg: 'rgba(244, 246, 248, 0.96)',
      heroGradient: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
      recordBtnBg: '#0D9488',
      recordBtnText: '#FFFFFF',
    },
    typography: {
      headingFont: 'font-sans',
      bodyFont: 'font-sans',
      buttonRadius: 'rounded-2xl',
      cardRadius: 'rounded-2xl',
    },
  },
};

interface UIStyleContextType {
  currentStyle: UIStyleConfig;
  setStyle: (id: UIStyleId) => void;
  isStyleSelectorOpen: boolean;
  openStyleSelector: () => void;
  closeStyleSelector: () => void;
}

const UIStyleContext = createContext<UIStyleContextType>({
  currentStyle: UI_STYLES.washi,
  setStyle: () => {},
  isStyleSelectorOpen: false,
  openStyleSelector: () => {},
  closeStyleSelector: () => {},
});

export const UIStyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [styleId, setStyleId] = useState<UIStyleId>(() => {
    const saved = localStorage.getItem('yumenoto_ui_style');
    return (saved as UIStyleId) || 'washi';
  });

  const [isStyleSelectorOpen, setIsStyleSelectorOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('yumenoto_ui_style', styleId);
  }, [styleId]);

  const currentStyle = UI_STYLES[styleId] || UI_STYLES.washi;

  return (
    <UIStyleContext.Provider
      value={{
        currentStyle,
        setStyle: (id: UIStyleId) => setStyleId(id),
        isStyleSelectorOpen,
        openStyleSelector: () => setIsStyleSelectorOpen(true),
        closeStyleSelector: () => setIsStyleSelectorOpen(false),
      }}
    >
      {children}
    </UIStyleContext.Provider>
  );
};

export const useUIStyle = () => useContext(UIStyleContext);
