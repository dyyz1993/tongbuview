import React, { useState } from 'react';
import { ArrowLeft, Zap, Plus, Trash2, Clock, Check, Play, Repeat } from 'lucide-react';
import { ShortcutKey, MacroConfig, MacroAction } from '../types';

interface Props {
  shortcut: ShortcutKey;
  onSave: (config: MacroConfig) => void;
  onClose: () => void;
}

const DEFAULT_MACRO_ACTIONS: MacroAction[] = [
  { id: 'm1', type: 'keydown', key: 'Q', delayMs: 0 },
  { id: 'm2', type: 'keyup', key: 'Q', delayMs: 40 },
  { id: 'm3', type: 'delay', key: '', delayMs: 60 },
  { id: 'm4', type: 'keydown', key: 'E', delayMs: 0 },
  { id: 'm5', type: 'keyup', key: 'E', delayMs: 40 },
  { id: 'm6', type: 'delay', key: '', delayMs: 80 },
  { id: 'm7', type: 'click', key: '鼠标左键', delayMs: 50 },
];

export const MacroEditorModal: React.FC<Props> = ({ shortcut, onSave, onClose }) => {
  const [actions, setActions] = useState<MacroAction[]>(() => {
    return shortcut.macroConfig?.actions || DEFAULT_MACRO_ACTIONS;
  });
  const [loopType, setLoopType] = useState<'once' | 'hold' | 'toggle'>(
    shortcut.macroConfig?.loopType || 'once'
  );
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);

  const totalDuration = actions.reduce((acc, curr) => acc + (curr.delayMs || 0), 0);

  const handleAddAction = (type: 'keydown' | 'click' | 'delay') => {
    const newAction: MacroAction = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      key: type === 'delay' ? '' : 'W',
      delayMs: type === 'delay' ? 50 : 30,
    };
    setActions((prev) => [...prev, newAction]);
  };

  const handleUpdateAction = (id: string, updated: Partial<MacroAction>) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const handleDeleteAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePlayPreview = () => {
    if (isPlayingPreview) return;
    setIsPlayingPreview(true);
    let cumulative = 0;
    actions.forEach((act, idx) => {
      cumulative += Math.max(80, act.delayMs || 80);
      setTimeout(() => {
        setActiveStepIdx(idx);
      }, cumulative);
    });
    setTimeout(() => {
      setIsPlayingPreview(false);
      setActiveStepIdx(null);
    }, cumulative + 200);
  };

  const handleSave = () => {
    onSave({
      actions,
      loopType,
      totalDurationMs: totalDuration,
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
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-base font-bold text-white">宏按键连招序列编辑器</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPreview}
            disabled={isPlayingPreview}
            className="flex items-center gap-1.5 bg-[#25252D] hover:bg-[#31313B] text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 ${isPlayingPreview ? 'text-emerald-400' : ''}`} />
            <span>{isPlayingPreview ? '模拟执行中...' : '测试连招'}</span>
          </button>

          <button
            onClick={handleSave}
            className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>保存宏配置</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary & Loop Mode Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-[#17171C] rounded-xl border border-white/10 shrink-0 my-2">
        <div className="flex items-center gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            动作步骤: <strong className="text-white">{actions.length}</strong> 步
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            总耗时预估: <strong className="text-blue-400 font-mono">{totalDuration} ms</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-white/50 text-[11px] mr-1">触发循环:</span>
          {[
            { id: 'once', label: '单次执行' },
            { id: 'hold', label: '按住循环' },
            { id: 'toggle', label: '开关循环' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setLoopType(mode.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                loopType === mode.id
                  ? 'bg-[#0A84FF] text-white font-semibold'
                  : 'bg-[#222228] text-white/60 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Action Sequence Timeline */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto px-2 py-2 space-y-2">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40 text-xs">
            <span>暂无宏动作步骤，点击下方按钮添加动作</span>
          </div>
        ) : (
          actions.map((act, idx) => {
            const isCurrentPlaying = activeStepIdx === idx;

            return (
              <div
                key={act.id}
                className={`relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isCurrentPlaying
                    ? 'bg-[#0A3D78] border-[#0A84FF] scale-[1.01] shadow-lg shadow-blue-500/20'
                    : 'bg-[#18181E] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Left: Step Index & Action Type */}
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 text-white/80 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {act.type === 'delay' ? (
                    <div className="flex items-center gap-1.5 text-xs text-blue-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>等待延时</span>
                    </div>
                  ) : act.type === 'click' ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>鼠标点击</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <span>{act.type === 'keydown' ? '按下按键' : '抬起按键'}</span>
                    </div>
                  )}
                </div>

                {/* Center: Key Value & Delay Slider */}
                <div className="flex items-center gap-3">
                  {act.type !== 'delay' && (
                    <input
                      type="text"
                      value={act.key}
                      onChange={(e) => handleUpdateAction(act.id, { key: e.target.value.toUpperCase() })}
                      className="w-16 bg-black border border-white/20 rounded-lg px-2 py-1 text-center font-bold text-xs text-white uppercase focus:outline-none focus:border-[#0A84FF]"
                      maxLength={6}
                    />
                  )}

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-white/40 text-[11px]">延时:</span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="10"
                      value={act.delayMs}
                      onChange={(e) =>
                        handleUpdateAction(act.id, { delayMs: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-16 bg-black border border-white/20 rounded-lg px-2 py-1 text-center font-mono text-xs text-blue-400 focus:outline-none focus:border-[#0A84FF]"
                    />
                    <span className="text-white/40 text-[10px]">ms</span>
                  </div>
                </div>

                {/* Right: Delete Action */}
                <button
                  onClick={() => handleDeleteAction(act.id)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="删除此步骤"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Action Addition Toolbar */}
      <div className="w-full pt-2 border-t border-white/10 shrink-0 flex items-center justify-center gap-3">
        <button
          onClick={() => handleAddAction('keydown')}
          className="flex items-center gap-1 bg-[#202028] hover:bg-[#2c2c36] text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ 键盘按键</span>
        </button>

        <button
          onClick={() => handleAddAction('click')}
          className="flex items-center gap-1 bg-[#202028] hover:bg-[#2c2c36] text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>+ 鼠标操作</span>
        </button>

        <button
          onClick={() => handleAddAction('delay')}
          className="flex items-center gap-1 bg-[#202028] hover:bg-[#2c2c36] text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>+ 延时等待</span>
        </button>
      </div>
    </div>
  );
};
