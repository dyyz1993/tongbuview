import React, { useState } from 'react';
import { ArrowLeft, Compass, Check, Sliders, Zap } from 'lucide-react';
import { ShortcutKey, WheelFolderConfig, WheelSlot } from '../types';

interface Props {
  shortcut: ShortcutKey;
  onSave: (config: WheelFolderConfig) => void;
  onClose: () => void;
}

const DEFAULT_SLOTS: WheelSlot[] = [
  { id: 's1', index: 0, label: 'Q', key: 'Q', name: '技能 1' },
  { id: 's2', index: 1, label: 'W', key: 'W', name: '技能 2' },
  { id: 's3', index: 2, label: 'E', key: 'E', name: '技能 3' },
  { id: 's4', index: 3, label: 'R', key: 'R', name: '终极技' },
];

export const WheelFolderModal: React.FC<Props> = ({ shortcut, onSave, onClose }) => {
  const [slots, setSlots] = useState<WheelSlot[]>(() => {
    const existing = shortcut.wheelConfig?.slots;
    if (existing && existing.length >= 3) {
      return existing.slice(0, 8);
    }
    return DEFAULT_SLOTS;
  });
  const [radius, setRadius] = useState<number>(shortcut.wheelConfig?.radius || 80);
  const [deadzone, setDeadzone] = useState<number>(shortcut.wheelConfig?.deadzone || 20);
  const [triggerMode, setTriggerMode] = useState<'slide' | 'release'>(
    shortcut.wheelConfig?.triggerMode || 'slide'
  );
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const handleSlotKeyChange = (index: number, newKey: string) => {
    setSlots((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, key: newKey.toUpperCase(), label: newKey.toUpperCase() } : s
      )
    );
  };

  const handleSave = () => {
    onSave({
      slots,
      radius,
      deadzone,
      triggerMode,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0F0F12] text-white flex flex-col justify-between p-2 sm:p-4 overflow-hidden select-none animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="w-full flex items-center justify-between px-2 py-1.5 shrink-0 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1F1F24] hover:bg-[#2C2C33] flex items-center justify-center text-white/90 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#0A84FF]" />
            <span className="text-base font-bold text-white">轮盘功能夹设置</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>保存配置</span>
        </button>
      </div>

      {/* 2. Main Body: Left Visual Radial Wheel, Right Properties */}
      <div className="flex-1 w-full min-h-0 flex flex-col md:flex-row items-center gap-4 py-3 overflow-y-auto">
        {/* Visual Interactive Donut Wheel */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-4">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-white/10 bg-[#16161C] flex items-center justify-center shadow-2xl">
            {/* Center Deadzone Circle */}
            <div
              style={{ width: `${deadzone * 2.5}px`, height: `${deadzone * 2.5}px` }}
              className="rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-[11px] text-blue-300 font-medium z-10 pointer-events-none"
            >
              死区
            </div>

            {/* 8 Radial Slots */}
            {slots.map((s, idx) => {
              const angle = (idx * 360) / slots.length - 90; // Top is first
              const rad = (angle * Math.PI) / 180;
              const dist = radius * 1.15; // px from center
              const x = Math.cos(rad) * dist;
              const y = Math.sin(rad) * dist;

              const isSelected = activeSlotIndex === idx;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSlotIndex(idx)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all shadow-lg cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A84FF] text-white ring-2 ring-white scale-110 z-20'
                      : 'bg-[#25252C] hover:bg-[#32323B] text-white border border-white/15'
                  }`}
                  title={`槽位 ${idx + 1}: ${s.name}`}
                >
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-white/40 mt-3">
            点击外圈槽位可配置对应映射按键，滑动轮盘即可向对应方向触发按键
          </span>
        </div>

        {/* Right Settings Configuration Panel */}
        <div className="w-full md:w-80 bg-[#18181E] border border-white/10 rounded-2xl p-4 space-y-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">轮盘参数调节</span>
          </div>

          {/* Trigger Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-white/60">触发机制</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTriggerMode('slide')}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  triggerMode === 'slide'
                    ? 'bg-[#0A84FF] border-blue-400 text-white font-semibold'
                    : 'bg-[#222228] border-white/10 text-white/70'
                }`}
              >
                滑动即触发
              </button>
              <button
                onClick={() => setTriggerMode('release')}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  triggerMode === 'release'
                    ? 'bg-[#0A84FF] border-blue-400 text-white font-semibold'
                    : 'bg-[#222228] border-white/10 text-white/70'
                }`}
              >
                松开时触发
              </button>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span>轮盘生效半径</span>
              <span className="font-mono text-blue-400">{radius} px</span>
            </div>
            <input
              type="range"
              min="50"
              max="110"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-[#0A84FF] h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Deadzone Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span>中央死区大小</span>
              <span className="font-mono text-blue-400">{deadzone} px</span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              value={deadzone}
              onChange={(e) => setDeadzone(Number(e.target.value))}
              className="w-full accent-[#0A84FF] h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slot Key Binding Editor */}
          {activeSlotIndex !== null && (
            <div className="p-3 bg-[#202027] border border-blue-500/30 rounded-xl space-y-2 animate-in fade-in">
              <span className="text-[11px] text-blue-300 font-semibold block">
                配置槽位 {activeSlotIndex + 1} ({slots[activeSlotIndex].name})
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={slots[activeSlotIndex].key}
                  onChange={(e) => handleSlotKeyChange(activeSlotIndex, e.target.value)}
                  placeholder="按键"
                  className="w-16 bg-black border border-white/20 rounded-lg px-2 py-1 text-center font-bold text-xs text-white uppercase focus:outline-none focus:border-[#0A84FF]"
                />
                <span className="text-[11px] text-white/50">输入对应键位 (如 Q / 1 / F)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
