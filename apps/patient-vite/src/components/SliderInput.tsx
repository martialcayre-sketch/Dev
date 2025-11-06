import { useState } from 'react';

interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  colorScheme:
    | 'fatigue'
    | 'douleurs'
    | 'digestion'
    | 'surpoids'
    | 'insomnie'
    | 'moral'
    | 'mobilite';
  description?: string;
  minLabel?: string;
  maxLabel?: string;
}

// Palette de couleurs zen/premium/brain pour chaque symptôme
const COLOR_SCHEMES = {
  fatigue: {
    gradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20',
    track: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
    thumb: 'bg-gradient-to-br from-amber-400 to-orange-500',
    glow: 'shadow-lg shadow-orange-500/30',
    text: 'text-orange-400',
  },
  douleurs: {
    gradient: 'from-rose-500/20 via-pink-500/20 to-fuchsia-500/20',
    track: 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500',
    thumb: 'bg-gradient-to-br from-rose-400 to-pink-500',
    glow: 'shadow-lg shadow-pink-500/30',
    text: 'text-pink-400',
  },
  digestion: {
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    track: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500',
    thumb: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    glow: 'shadow-lg shadow-teal-500/30',
    text: 'text-teal-400',
  },
  surpoids: {
    gradient: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20',
    track: 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500',
    thumb: 'bg-gradient-to-br from-violet-400 to-purple-500',
    glow: 'shadow-lg shadow-purple-500/30',
    text: 'text-purple-400',
  },
  insomnie: {
    gradient: 'from-blue-500/20 via-indigo-500/20 to-violet-500/20',
    track: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500',
    thumb: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    glow: 'shadow-lg shadow-indigo-500/30',
    text: 'text-indigo-400',
  },
  moral: {
    gradient: 'from-cyan-500/20 via-sky-500/20 to-blue-500/20',
    track: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500',
    thumb: 'bg-gradient-to-br from-cyan-400 to-sky-500',
    glow: 'shadow-lg shadow-sky-500/30',
    text: 'text-sky-400',
  },
  mobilite: {
    gradient: 'from-lime-500/20 via-green-500/20 to-emerald-500/20',
    track: 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500',
    thumb: 'bg-gradient-to-br from-lime-400 to-green-500',
    glow: 'shadow-lg shadow-green-500/30',
    text: 'text-green-400',
  },
};

export function SliderInput({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  colorScheme,
  description,
  minLabel,
  maxLabel,
}: SliderInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const colors = COLOR_SCHEMES[colorScheme];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Label avec valeur actuelle */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-white/90">
          {label}
        </label>
        <div
          className={`flex items-center justify-center min-w-[3rem] h-8 rounded-lg bg-slate-800/50 border border-white/10 ${
            isDragging ? colors.glow : ''
          } transition-all duration-300`}
        >
          <span className={`text-lg font-bold ${colors.text} transition-all duration-300`}>
            {value}
          </span>
        </div>
      </div>

      {/* Description */}
      {description && <p className="text-xs text-white/50 italic leading-relaxed">{description}</p>}

      {/* Container du slider */}
      <div className="relative">
        {/* Background gradient (décoratif) */}
        <div
          className={`absolute inset-0 h-3 rounded-full ${colors.gradient} blur-sm opacity-50 transition-opacity duration-300 ${
            isDragging ? 'opacity-100' : ''
          }`}
        />

        {/* Track (rail) */}
        <div className="relative h-3 bg-slate-800/80 rounded-full border border-white/5">
          {/* Progress fill avec gradient */}
          <div
            className={`absolute top-0 left-0 h-full ${colors.track} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percentage}%` }}
          />

          {/* Marques de graduation */}
          <div className="absolute inset-0 flex justify-between items-center px-1">
            {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((mark) => (
              <div
                key={mark}
                className="w-px h-2 bg-white/20"
                style={{
                  opacity: mark % 2 === 0 ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Input range (invisible mais fonctionnel) */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer z-10"
        />

        {/* Thumb (curseur) personnalisé */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out"
          style={{ left: `calc(${percentage}% - 1rem)` }}
        >
          <div
            className={`w-8 h-8 rounded-full ${colors.thumb} ${
              isDragging ? `${colors.glow} scale-125` : 'scale-100'
            } transition-all duration-300 flex items-center justify-center border-2 border-white/20`}
          >
            <div className="w-2 h-2 bg-white/80 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels min/max */}
      <div className="flex justify-between text-xs text-white/50 gap-4">
        <span className="text-left flex-1">
          {min} = {minLabel || 'Aucun problème'}
        </span>
        <span className="text-right flex-1">
          {max} = {maxLabel || 'Maximum'}
        </span>
      </div>
    </div>
  );
}
