import React, { useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { AppProfile } from '../types';
import { AppIconRenderer } from '../data/presetApps';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apps: AppProfile[];
  selectedAppId: string;
  onSelectApp: (app: AppProfile) => void;
  onAddCustomApp: (newApp: AppProfile) => void;
}

export const AppSelectorSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  apps,
  selectedAppId,
  onSelectApp,
  onAddCustomApp,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState('#0A84FF');

  if (!isOpen) return null;

  const handleSelect = (app: AppProfile) => {
    onSelectApp(app);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newApp: AppProfile = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      iconType: 'custom',
      color: customColor,
      description: '自定义应用快捷键',
    };
    onAddCustomApp(newApp);
    onSelectApp(newApp);
    setCustomName('');
    setShowAddModal(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up sheet container */}
      <div className="relative w-full max-h-[85%] bg-[#1C1C1E]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[28px] p-5 pb-8 shadow-2xl flex flex-col text-white animate-in slide-in-from-bottom duration-250">
        {/* Top grab bar */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-3" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-[17px] font-semibold tracking-tight text-white">选择应用</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apps List */}
        <div className="flex flex-col divide-y divide-white/[0.07] overflow-y-auto max-h-[380px] my-1">
          {apps.map((app) => {
            const isSelected = app.id === selectedAppId;
            return (
              <button
                key={app.id}
                onClick={() => handleSelect(app)}
                className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <AppIconRenderer type={app.iconType} size={36} />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-white group-hover:text-blue-400 transition-colors">
                      {app.name}
                    </span>
                    {app.description && (
                      <span className="text-[11px] text-white/40">{app.description}</span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="text-[#0A84FF] pr-2">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Custom Add Item */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3.5 py-3 px-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer text-white/80 hover:text-white"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-dashed border-white/30 flex items-center justify-center text-white/70">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-medium">自定义...</span>
          </button>
        </div>

        {/* Explanation text as in original mockup */}
        <div className="pt-2 text-center text-xs text-white/45">
          从列表中选择，选择后自动返回，无需额外确认
        </div>
      </div>

      {/* Add Custom App Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustom}
            className="w-full max-w-xs bg-[#242426] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-white"
          >
            <h4 className="text-base font-semibold">添加自定义应用</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/70">应用名称</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="例如: Figma, Xcode, Notion"
                className="w-full bg-[#1A1A1C] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/70">主题配色</label>
              <div className="flex items-center gap-2">
                {['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#64D2FF'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      customColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white rounded-lg"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!customName.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-[#0A84FF] disabled:opacity-50 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                添加并选用
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
