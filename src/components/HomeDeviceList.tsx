import React, { useState } from 'react';
import { RemoteDevice } from '../types';
import {
  Monitor,
  Laptop,
  Server,
  Gamepad2,
  Tv,
  Zap,
  SlidersHorizontal,
  Search,
  Plus,
  RotateCw,
  X,
  Wifi,
} from 'lucide-react';

interface Props {
  devices: RemoteDevice[];
  onConnectDevice: (device: RemoteDevice) => void;
  onEditDeviceLayout: (device: RemoteDevice) => void;
  onAddDevice?: (newDevice: Partial<RemoteDevice>) => void;
  viewportMode?: 'portrait' | 'landscape' | 'foldable' | 'tablet' | 'fullscreen';
}

export const HomeDeviceList: React.FC<Props> = ({
  devices,
  onConnectDevice,
  onEditDeviceLayout,
  onAddDevice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New device form state
  const [newName, setNewName] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newHostType, setNewHostType] = useState<RemoteDevice['hostType']>('windows');

  const filteredDevices = devices.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.ip.includes(q) ||
      (d.activeGameOrApp && d.activeGameOrApp.toLowerCase().includes(q))
    );
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (onAddDevice) {
      onAddDevice({
        name: newName.trim(),
        ip: newIp.trim() || '192.168.1.100',
        hostType: newHostType,
        status: 'online',
        ping: 6,
        fps: 60,
        bitrate: '50 Mbps',
        resolution: '2560x1440',
        gpu: 'RTX 4080 Super',
        thumbnail:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        activeGameOrApp: '桌面待机',
      });
    }
    setNewName('');
    setNewIp('');
    setIsAddModalOpen(false);
  };

  const getHostIcon = (type: RemoteDevice['hostType']) => {
    switch (type) {
      case 'windows':
        return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'mac':
        return <Laptop className="w-4 h-4 text-zinc-300" />;
      case 'linux':
        return <Server className="w-4 h-4 text-amber-400" />;
      case 'console':
        return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Tv className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0A0A0E] text-white flex flex-col overflow-hidden select-none">
      {/* 1. Minimal Header */}
      <header className="h-13 px-4 sm:px-6 bg-[#101016]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">远程主机</h1>
            <p className="text-[10px] text-white/40 leading-none">
              共 {devices.length} 台设备
            </p>
          </div>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative hidden xs:block">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索主机/游戏..."
              className="w-32 sm:w-44 bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-2.5 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white transition-colors cursor-pointer ${
              isRefreshing ? 'animate-spin text-blue-400' : ''
            }`}
            title="刷新主机状态"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">添加</span>
          </button>
        </div>
      </header>

      {/* 2. Device Cards Grid (Clean, Responsive, Fast) */}
      <main className="flex-1 w-full p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Monitor className="w-12 h-12 text-white/20 mb-3" />
              <p className="text-sm text-white/60">未找到匹配的主机设备</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-blue-400 hover:underline cursor-pointer"
              >
                清除搜索条件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="group relative bg-[#13131A] hover:bg-[#181822] border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg flex flex-col"
                >
                  {/* Poster / Thumbnail Header */}
                  <div className="relative h-36 w-full bg-black/60 overflow-hidden">
                    <img
                      src={device.thumbnail}
                      alt={device.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-[#13131A]/30 to-black/50" />

                    {/* Top badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{device.ping}ms · {device.fps}FPS</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                      {getHostIcon(device.hostType)}
                    </div>

                    {/* Active Game Banner */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-white drop-shadow truncate max-w-[200px]">
                        {device.activeGameOrApp || '桌面待机'}
                      </span>
                      <span className="text-[10px] text-white/60 font-mono">
                        {device.resolution.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Card Body & Actions */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-sm text-white truncate">{device.name}</h2>
                        <span className="text-[10px] text-white/40 font-mono">{device.ip}</span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5 font-mono">
                        {device.gpu}
                      </p>
                    </div>

                    {/* Minimal Two Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                      {/* Button 1: Connect / Stream (进入一级操控) */}
                      <button
                        onClick={() => onConnectDevice(device)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                        title="进入全屏串流操控"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>连接</span>
                      </button>

                      {/* Button 2: Edit Layout (进入二级编辑) */}
                      <button
                        onClick={() => onEditDeviceLayout(device)}
                        className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-95 cursor-pointer"
                        title="配置按键与布局"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>编辑</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 3. Minimal Add Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#15151D] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white">添加主机</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">设备名称</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如: 游戏台式机"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">局域网 IP</label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="例如: 192.168.1.100"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">系统类型</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['windows', 'mac', 'linux', 'console'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewHostType(t)}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer ${
                        newHostType === t
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
