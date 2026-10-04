import React from 'react';
import { Feather, BookOpen, Compass, Settings, Activity } from 'lucide-react';
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
}) => {
  const { currentStyle } = useUIStyle();

  const handleTab = (tab: NavTab) => {
    audioEngine.playThemeSound(currentStyle.id, 'nav');
    onTabChange(tab);
  };

  const navItems = [
    { id: 'home' as NavTab, label: '筆録机', icon: Feather },
    { id: 'my-dreams' as NavTab, label: '夢手記', icon: BookOpen },
    { id: 'gallery' as NavTab, label: '標本帖', icon: Compass },
    { id: 'analytics' as NavTab, label: '深層観測', icon: Activity },
    { id: 'settings' as NavTab, label: '設え', icon: Settings },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t border-x px-2 py-1.5 max-w-xl md:max-w-2xl mx-auto transition-colors"
      style={{
        backgroundColor: currentStyle.colors.navBg,
        borderColor: currentStyle.colors.border,
      }}
    >
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative group ${
                isActive ? 'font-semibold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                color: isActive ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
              }}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
              <span className="text-[10px] mt-1 tracking-tight font-serif">
                {item.label}
              </span>
              {isActive && (
                <div 
                  className="w-3.5 h-0.5 rounded-full mt-0.5 transition-all"
                  style={{ backgroundColor: currentStyle.colors.accent }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


