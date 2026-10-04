import React from 'react';
import { Palette } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const { currentStyle, openStyleSelector } = useUIStyle();

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-start transition-colors duration-300"
      style={{
        backgroundColor: currentStyle.id === 'midnight' ? '#080B10' : currentStyle.id === 'vintage' ? '#0F1217' : '#F2ECE4',
      }}
    >
      {/* Refined Desktop App Shell Container */}
      <div
        className="w-full max-w-xl md:max-w-2xl min-h-screen flex flex-col shadow-xl transition-all duration-300 relative border-x"
        style={{
          backgroundColor: currentStyle.colors.bg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* The Main App Viewport */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

