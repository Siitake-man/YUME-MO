import React from 'react';
import { Mic, BookOpen, Compass, Settings, Activity } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';

export type NavTab = 'home' | 'my-dreams' | 'gallery' | 'analytics' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenRecord: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenRecord,
}) => {
  const { currentStyle } = useUIStyle();

  const handleTab = (tab: NavTab) => {
    audioEngine.playMechanicalClick('high');
    onTabChange(tab);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t px-2 py-1.5 max-w-lg mx-auto transition-colors"
      style={{
        backgroundColor: currentStyle.colors.navBg,
        borderColor: currentStyle.colors.border,
      }}
    >
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          id="nav-tab-home"
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' ? 'font-bold' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'home' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
          }}
        >
          <div 
            className="p-1 rounded-lg"
            style={{
              backgroundColor: activeTab === 'home' ? currentStyle.colors.accent + '20' : 'transparent',
            }}
          >
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">ホーム</span>
        </button>

        {/* My Dreams */}
        <button
          id="nav-tab-my-dreams"
          onClick={() => handleTab('my-dreams')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'my-dreams' ? 'font-bold' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'my-dreams' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
          }}
        >
          <div 
            className="p-1 rounded-lg"
            style={{
              backgroundColor: activeTab === 'my-dreams' ? currentStyle.colors.accent + '20' : 'transparent',
            }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">夢日記</span>
        </button>

        {/* Central Floating Record Action Button */}
        <button
          id="nav-floating-record-btn"
          onClick={() => {
            audioEngine.playMechanicalClick('high');
            onOpenRecord();
          }}
          className="relative -top-4 flex flex-col items-center group cursor-pointer"
          title="夢を声で記録する"
        >
          <div 
            className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-3 transform group-hover:scale-105 group-active:scale-95 transition-all"
            style={{
              backgroundColor: currentStyle.colors.recordBtnBg,
              borderColor: currentStyle.colors.bg,
              color: currentStyle.colors.recordBtnText,
            }}
          >
            <Mic className="w-5 h-5" />
          </div>
          <span 
            className="text-[9px] font-bold -mt-1 px-1.5 py-0.2 rounded shadow-2xs"
            style={{
              backgroundColor: currentStyle.colors.cardBg,
              color: currentStyle.colors.textPrimary,
              border: `1px solid ${currentStyle.colors.border}`,
            }}
          >
            採集
          </span>
        </button>

        {/* Gallery / 図鑑 */}
        <button
          id="nav-tab-gallery"
          onClick={() => handleTab('gallery')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'gallery' ? 'font-bold' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'gallery' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
          }}
        >
          <div 
            className="p-1 rounded-lg"
            style={{
              backgroundColor: activeTab === 'gallery' ? currentStyle.colors.accent + '20' : 'transparent',
            }}
          >
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">標本図鑑</span>
        </button>

        {/* Analytics / 分析 */}
        <button
          id="nav-tab-analytics"
          onClick={() => handleTab('analytics')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'font-bold' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'analytics' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
          }}
        >
          <div 
            className="p-1 rounded-lg"
            style={{
              backgroundColor: activeTab === 'analytics' ? currentStyle.colors.accent + '20' : 'transparent',
            }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">深層分析</span>
        </button>

        {/* Settings */}
        <button
          id="nav-tab-settings"
          onClick={() => handleTab('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'settings' ? 'font-bold' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            color: activeTab === 'settings' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
          }}
        >
          <div 
            className="p-1 rounded-lg"
            style={{
              backgroundColor: activeTab === 'settings' ? currentStyle.colors.accent + '20' : 'transparent',
            }}
          >
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">設定</span>
        </button>
      </div>
    </nav>
  );
};
