import React from 'react';
import { AppIconRenderer } from '../data/presetApps';

export const BrandShowcaseFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#0D0D0F] border-t border-white/10 px-6 py-8 text-white select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left: Design Notes & Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-white">iPhone 竖屏</span>
            <p className="text-xs text-white/50 leading-relaxed">
              应用图标作为属性入口，默认显示为「四宫格」，点击即可进入选择应用面板。
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-white">选择应用</span>
            <p className="text-xs text-white/50 leading-relaxed">
              从应用列表中直接点击选择，选择后自动无缝返回编辑器，无需二次确认。
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-white">iPhone 横屏</span>
            <p className="text-xs text-white/50 leading-relaxed">
              应用图标与其他属性单行并排紧凑排布，最大程度释放中央画布的操作视野。
            </p>
          </div>
        </div>

        {/* Right: Icon states & Drel Motto */}
        <div className="flex items-center gap-8 pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0">
          {/* Icon states */}
          <div className="flex items-center gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <AppIconRenderer type="all" size={36} />
              <span className="text-[10px] text-white/40">默认 (全部应用)</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <AppIconRenderer type="codex" size={36} />
              <span className="text-[10px] text-white/40">已选 (Codex)</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <AppIconRenderer type="chrome" size={36} />
              <span className="text-[10px] text-white/40">已选 (Chrome)</span>
            </div>
          </div>

          {/* Drel Brand Wordmark & Philosophy */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight text-white/95">Drel</h2>
            <div className="flex flex-col text-xs text-white/60 leading-tight mt-1 font-sans">
              <span>更紧凑</span>
              <span>更专注</span>
              <span>更好用</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
