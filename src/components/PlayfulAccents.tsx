import React from 'react';
import { StarGemAsset } from './IllustratedAssets';

// ============================================================================
// HANDWRITTEN POST-IT NOTE (手書き風ポストイット付箋)
// ============================================================================
interface PostItProps {
  children: React.ReactNode;
  color?: 'yellow' | 'pink' | 'blue' | 'green';
  rotation?: string;
  className?: string;
}

export const HandwrittenPostIt: React.FC<PostItProps> = ({
  children,
  color = 'yellow',
  rotation = 'rotate-[-1.5deg]',
  className = '',
}) => {
  const colorMap = {
    yellow: 'bg-[#FFF9D2] text-[#423C28] border-[#E8DF9D]',
    pink: 'bg-[#FFE8EC] text-[#4A2D35] border-[#F2C2CC]',
    blue: 'bg-[#E5F3FF] text-[#243A52] border-[#BFDEFC]',
    green: 'bg-[#EAF8E6] text-[#2E4828] border-[#C3E8BC]',
  };

  return (
    <div className={`relative p-3 rounded-lg border shadow-[2px_3px_5px_rgba(0,0,0,0.06)] font-handwriting ${colorMap[color]} ${rotation} transition-transform hover:rotate-0 select-none ${className}`}>
      {/* Top Tape Accent */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/70 border border-black/10 backdrop-blur-xs rounded-xs pointer-events-none" />
      {children}
    </div>
  );
};

// ============================================================================
// HANDWRITTEN SKETCH ARROW (手書きスケッチ矢印)
// ============================================================================
export const HandwrittenArrow: React.FC<{ label?: string; direction?: 'down' | 'right' | 'left' | 'curved' }> = ({
  label,
  direction = 'down',
}) => {
  return (
    <div className="inline-flex items-center space-x-1.5 font-handwriting text-neutral-600 dark:text-neutral-400 select-none pointer-events-none">
      {label && <span className="text-xs font-bold">{label}</span>}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
        {direction === 'down' && (
          <path d="M12,3 Q14,12 12,18 M8,14 L12,19 L16,14" />
        )}
        {direction === 'right' && (
          <path d="M3,12 Q12,10 18,12 M14,8 L19,12 L14,16" />
        )}
        {direction === 'curved' && (
          <path d="M4,4 C8,18 16,18 20,8 M16,8 L20,8 L20,12" />
        )}
      </svg>
    </div>
  );
};

// ============================================================================
// CUTE STAMP HANKO (手書き風の可愛い消印スタンプ)
// ============================================================================
export const CuteStamp: React.FC<{ text: string; color?: string; rotation?: string }> = ({
  text,
  color = '#D9534F',
  rotation = 'rotate-[-8deg]',
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center space-x-1 px-2 py-0.5 rounded border-2 border-dashed font-handwriting font-bold text-[11px] select-none ${rotation}`}
      style={{ color, borderColor: color }}
    >
      <StarGemAsset size={11} color={color} />
      <span>{text}</span>
      <StarGemAsset size={11} color={color} />
    </div>
  );
};
