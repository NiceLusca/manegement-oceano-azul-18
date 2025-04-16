
import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const predefinedColors = [
  // Blues
  '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
  // Greens
  '#166534', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0',
  // Reds
  '#991B1B', '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
  // Yellows
  '#854D0E', '#EAB308', '#FACC15', '#FDE047', '#FEF08A',
  // Purples
  '#6B21A8', '#9333EA', '#A855F7', '#C084FC', '#D8B4FE',
  // Pinks
  '#9D174D', '#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8',
  // Oranges
  '#9A3412', '#EA580C', '#F97316', '#FB923C', '#FDBA74',
  // Teals
  '#115E59', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4',
  // Grays
  '#1F2937', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB',
];

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputColor, setInputColor] = useState(color);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value);
    onChange(e.target.value);
  };

  const handlePredefinedColorClick = (colorValue: string) => {
    setInputColor(colorValue);
    onChange(colorValue);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md border cursor-pointer"
              style={{ backgroundColor: color }}
              aria-label="Pick a color"
            />
            <Input
              value={inputColor}
              onChange={handleColorChange}
              className="flex-1 w-24"
              placeholder="#000000"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((predefinedColor) => (
              <button
                key={predefinedColor}
                className="w-8 h-8 rounded-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                style={{ backgroundColor: predefinedColor }}
                onClick={() => handlePredefinedColorClick(predefinedColor)}
                aria-label={`Select color ${predefinedColor}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
