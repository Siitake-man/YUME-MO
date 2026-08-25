import React from 'react';
import { 
  Sparkles, Cat, Coffee, Moon, Sun, Ship, Wind, Clock, Compass, Zap,
  Cloud, Feather, BookOpen, Music, Film, Eye, Flame, MapPin, Smile,
  LucideIcon
} from 'lucide-react';

interface MotifIconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Cat,
  Coffee,
  Moon,
  Sun,
  Ship,
  Wind,
  Clock,
  Compass,
  Zap,
  Cloud,
  Feather,
  BookOpen,
  Music,
  Film,
  Eye,
  Flame,
  MapPin,
  Smile,
};

export const MotifIcon: React.FC<MotifIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Try exact match or fuzzy match
  const IconComponent = iconMap[name] || 
    Object.entries(iconMap).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] ||
    Sparkles;

  return <IconComponent className={className} size={size} />;
};
