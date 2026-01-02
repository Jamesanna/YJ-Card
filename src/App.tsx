
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Button, Input, Select, Card, Modal, DraggableList
} from './components/Shared';
import { useStore } from './services/store';
import { Role, User, ViewMode, Staff, CardRecord, Project, Vest, Announcement } from './types';
import * as XLSX from 'xlsx';
import {
  Settings,
  RefreshCcw,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Plus,
  PencilLine,
  Trash2,
  Save,
  Archive,
  Calendar,
  Copy,
  CheckCircle2,
  Search,
  UserCheck,
  ChevronDown,
  Download,
  Upload,
  AlertTriangle,
  Database,
  FileSpreadsheet,
  Activity,
  Palette,
  ChevronUp,
  Shirt,
  MessageSquare,
  UserCircle,
  Eye,
  EyeOff,
  Lock,
  Maximize2,
  Home,
  BarChart3,
  ListTodo,
  TrendingUp,
  Clock,
  Loader2,
  Sparkles,
  Link2,
  Cpu,
  LayoutGrid,
  List,
  Square,
  History
} from 'lucide-react';

const SYSTEM_VERSION = "1.5.2";
const LAST_UPDATE_CODE = "20260102143000";

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const PASTEL_COLORS = [
  'bg-blue-50 border-blue-200 shadow-blue-50/50',
  'bg-emerald-50 border-emerald-200 shadow-emerald-50/50',
  'bg-amber-50 border-amber-200 shadow-amber-50/50',
  'bg-rose-50 border-rose-200 shadow-rose-50/50',
  'bg-purple-50 border-purple-200 shadow-purple-50/50',
  'bg-indigo-50 border-indigo-200 shadow-indigo-50/50',
  'bg-orange-50 border-orange-200 shadow-orange-50/50',
  'bg-cyan-50 border-cyan-200 shadow-cyan-50/50'
];

const OFFICE_THEME_COLORS = [
  ['#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646'],
  ['#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1de', '#e5e0ec', '#dbeef3', '#fdeada'],
  ['#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5'],
  ['#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a1c7', '#93cddd', '#fac08f'],
  ['#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#31859b', '#e36c09'],
  ['#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#205867', '#974806'],
];

const STANDARD_COLORS = ['#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'];

const getPastelClass = (index: number) => PASTEL_COLORS[index % PASTEL_COLORS.length];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
};

const isThisWeek = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const first = now.getDate() - now.getDay();
  const last = first + 6;
  const firstDay = new Date(now.setDate(first));
  const lastDay = new Date(now.setDate(last));
  firstDay.setHours(0, 0, 0, 0);
  lastDay.setHours(23, 59, 59, 999);
  return d >= firstDay && d <= lastDay;
};

const isThisMonth = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const isThisYear = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.getFullYear() === new Date().getFullYear();
};

const VestIcon: React.FC<{ color: string, size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ color, size = 'md' }) => {
  const iconSizes = { sm: 20, md: 48, lg: 24, xl: 64 };
  const containerClasses = {
    sm: 'p-0.5',
    md: 'p-2 bg-white/40 rounded-2xl border border-white/20 shadow-inner',
    lg: 'p-1.5 bg-white rounded-lg shadow-sm border border-slate-100',
    xl: 'p-4 bg-white rounded-[1.75rem] shadow-lg border-2 border-white'
  };
  return (
    <div className={`flex items-center justify-center shrink-0 ${containerClasses[size]}`}>
      <Shirt size={iconSizes[size]} fill={color || '#cbd5e1'} stroke={color === '#ffffff' ? '#94a3b8' : 'currentColor'} strokeWidth={1.5} className="drop-shadow-sm transition-transform" />
    </div>
  );
};

const CardRecordContent: React.FC<{
  r: CardRecord,
  getVestColor: (v: string) => string,
  isZoomed?: boolean,
  isManageMode?: boolean,
  onToggleCheckIn?: (name: string) => void
}> = ({ r, getVestColor, isZoomed = false, isManageMode = false, onToggleCheckIn }) => (
  <div className={`flex flex-col gap-4 ${isZoomed ? 'items-center text-center' : ''}`}>
    <div className={`flex items-center w-full ${isZoomed ? 'flex-col gap-4' : 'justify-between'}`}>
      <div className={`flex flex-col ${isZoomed ? 'items-center' : ''}`}>
        <span className={`std-label text-slate-500 uppercase tracking-widest ${isZoomed ? 'text-xs mb-1' : 'text-[10px]'}`}>靠卡單號</span>
        <span className={`std-label text-red-600 font-black tracking-tight leading-none ${isZoomed ? 'text-5xl' : 'text-2xl'}`}>{r.orderId}</span>
      </div>
      <div className={`flex flex-col ${isZoomed ? 'items-center' : ''}`}>
        <span className={`std-label text-slate-500 uppercase tracking-widest ${isZoomed ? 'text-xs mb-1' : 'text-[10px]'}`}>靠卡廠區</span>
        <span className={`std-label text-blue-600 font-black tracking-tight leading-none ${isZoomed ? 'text-5xl' : 'text-2xl'}`}>{r.factory}</span>
      </div>
    </div>
    <div className={`bg-blue-50/60 rounded-[1.5rem] border border-blue-100 shadow-inner flex items-center justify-center w-full ${isZoomed ? 'py-6 px-4 gap-4 flex-row' : 'p-3 flex-col gap-0'}`}>
      <span className={`std-label text-slate-600 ${isZoomed ? 'text-2xl font-bold' : 'text-[10px]'}`}>{formatDate(r.date)}</span>
      <span className={`std-label text-black font-black leading-tight ${isZoomed ? 'text-4xl' : 'text-2xl'}`}>{r.time}</span>
    </div>
    <div className={`space-y-2 w-full flex flex-col ${isZoomed ? 'items-center' : ''}`}>
      <div className="std-label text-slate-500 uppercase tracking-widest text-[10px]">穿著背心樣式</div>
      <div className="flex items-center gap-3">
        <VestIcon color={getVestColor(r.vest)} size={isZoomed ? 'lg' : 'sm'} />
        <span className={`bg-white border border-slate-200 text-black px-4 py-1.5 rounded-xl std-label shadow-sm w-fit font-bold ${isZoomed ? 'text-2xl' : 'text-base'}`}>{r.vest}</span>
      </div>
    </div>
    <div className="h-px bg-slate-200/40 w-full"></div>
    <div className={`space-y-6 w-full flex flex-col ${isZoomed ? 'items-center' : ''}`}>
      <div className={`flex flex-col ${isZoomed ? 'items-center' : ''}`}>
        <div className="std-label text-slate-500 uppercase mb-2 tracking-wider text-[10px]">開卡人員</div>
        <div className={`flex flex-wrap gap-2 ${isZoomed ? 'justify-center' : ''}`}>
          {r.openers.map(name => <span key={name} className={`bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-100 std-label shadow-sm font-black ${isZoomed ? 'text-xl' : ''}`}>{name}</span>)}
        </div>
      </div>
      <div className={`flex flex-col ${isZoomed ? 'items-center' : ''}`}>
        <div className="std-label text-slate-500 uppercase mb-2 tracking-wider text-[10px]">靠卡支援名單 (打勾代表已出席)</div>
        <div className={`flex flex-wrap gap-2 ${isZoomed ? 'justify-center' : ''}`}>
          {r.supporters.map(name => {
            const isChecked = r.checkedInSupporters?.includes(name);
            return (
              <button
                key={name}
                disabled={!isManageMode}
                onClick={(e) => { e.stopPropagation(); onToggleCheckIn?.(name); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all std-label shadow-sm font-black ring-2 ${isChecked ? 'bg-blue-600 text-white border-blue-500 ring-blue-100' : 'bg-white text-slate-400 border-slate-200 ring-transparent'} ${isManageMode ? 'hover:scale-105 active:scale-95' : 'cursor-default'} ${isZoomed ? 'text-xl px-5 py-3' : ''}`}
              >
                {isChecked ? <CheckCircle2 size={isZoomed ? 20 : 14} /> : isManageMode ? <Square size={14} /> : null}
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && <label className="std-label text-black">{label}</label>}
      <div className="relative">
        <input {...props} type={show ? 'text' : 'password'} className={`w-full border border-slate-200 bg-white text-black placeholder:text-slate-500 rounded-lg pl-3 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all std-content ${className}`} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </div>
  );
};

const ToggleViewMode = ({ mode, onChange }: { mode: ViewMode, onChange: (m: ViewMode) => void }) => (
  <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-slate-200">
    <button
      type="button"
      onClick={() => onChange('card')}
      className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center ${mode === 'card' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-1 ring-blue-400' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
      title="卡片視圖"
    >
      <LayoutGrid size={22} />
    </button>
    <button
      type="button"
      onClick={() => onChange('list')}
      className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center ${mode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-1 ring-blue-400' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
      title="列表視圖"
    >
      <List size={22} />
    </button>
  </div>
);

const StatsBox = ({ label, value, icon: Icon, colorClass = "text-blue-600", bgClass = "bg-blue-50" }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1 group hover:border-blue-200 transition-all">
    <div className={`${bgClass} ${colorClass} p-1.5 rounded-lg mb-1`}><Icon size={16} /></div>
    <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-black ${colorClass}`}>{value}</span>
      <span className="text-[10px] text-slate-400 font-bold">次</span>
    </div>
  </div>
);

const AnnouncementBanner: React.FC<{ announcements: Announcement[] }> = ({ announcements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMarquee, setIsMarquee] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const activeAnno = announcements[currentIndex];

  useEffect(() => {
    if (!activeAnno) return;
    let transitionTimer: ReturnType<typeof setTimeout>;
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const isOverflowing = textRef.current.offsetWidth > containerRef.current.offsetWidth;
        setIsMarquee(isOverflowing);
        const duration = isOverflowing ? Math.max(8000, textRef.current.offsetWidth * 20) : 5000;
        transitionTimer = setTimeout(() => setCurrentIndex((prev) => (prev + 1) % announcements.length), duration);
      }
    };
    const initialCheck = setTimeout(checkOverflow, 100);
    return () => { clearTimeout(initialCheck); if (transitionTimer) clearTimeout(transitionTimer); };
  }, [currentIndex, announcements, activeAnno]);

  if (!activeAnno) return null;
  return (
    <div className="bg-blue-700 text-white shadow-lg relative overflow-hidden h-14 flex items-center justify-center border-b border-blue-800">
      <div ref={containerRef} className="relative w-full max-w-4xl px-8 flex items-center justify-center overflow-hidden h-full group">
        <div key={currentIndex} className="animate-flip-clock w-full text-center">
          <span ref={textRef} className={`inline-block whitespace-nowrap std-label text-lg md:text-xl font-bold ${isMarquee ? 'animate-marquee' : ''}`}>{activeAnno.content}</span>
        </div>
      </div>
    </div>
  );
};

const Frontend: React.FC<{ store: any, currentUser: User | null, setAuthView: (v: any) => void, onLogout: () => void }> = ({ store, currentUser, setAuthView, onLogout }) => {
  const { records, announcements, vests } = store;
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [weekOffset, setWeekOffset] = useState(0);
  const [zoomCard, setZoomCard] = useState<CardRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomCard(null); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSoftRefresh = async () => {
    setIsRefreshing(true);
    await store.checkDbConnection();
    setIsRefreshing(false);
  };

  const getVestColor = (vestName: string) => vests.find((v: any) => v.companyName === vestName)?.color || '#cbd5e1';
  const onlineAnnos = announcements.filter((a: Announcement) => a.isOnline);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const weekDays = useMemo(() => {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (weekOffset * 6));
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return {
        dateObj: d,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayName: WEEK_DAYS[d.getDay()]
      };
    });
  }, [weekOffset, today]);

  const visibleRecords = records.filter((r: CardRecord) => !r.isArchived);
  const filteredRecords = visibleRecords.filter((r: CardRecord) => r.date === todayStr);

  const handleGoToBackend = () => {
    if (currentUser?.role === Role.GUEST) setAuthView('back_login'); else setAuthView('back_app');
  };

  const renderCard = (r: CardRecord, idx: number) => (
    <Card key={r.id} className={`p-6 hover:-translate-y-1 transition-all border-l-4 border-l-blue-500 ${getPastelClass(idx)} shadow-lg cursor-pointer active:scale-95 rounded-[2rem]`} onClick={() => setZoomCard(r)}>
      <CardRecordContent r={r} getVestColor={getVestColor} />
      <div className="mt-4 flex justify-end text-slate-300"><Maximize2 size={16} /></div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <header className="bg-blue-600 text-white sticky top-0 z-30 shadow-lg px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">羿</div>
          <div className="flex flex-col">
            <h1 className="std-label text-lg leading-none">羿鈞科技支援靠卡系統</h1>
            <span className="text-[10px] opacity-70 font-bold mt-1">Ver.{SYSTEM_VERSION}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={handleSoftRefresh} className={`p-2 hover:bg-white/10 rounded-xl transition-all ${isRefreshing ? 'animate-spin' : ''}`} title="軟重新整理"><RefreshCcw size={22} /></button>
          <button onClick={handleGoToBackend} className="nav-tooltip" data-tooltip="管理後台"><Settings size={22} /></button>
          <button onClick={onLogout} className="nav-tooltip bg-rose-500 p-2 rounded-xl" data-tooltip="登出"><LogOut size={20} /></button>
        </div>
      </header>
      {onlineAnnos.length > 0 && <AnnouncementBanner announcements={onlineAnnos} />}
      <div className="p-4 max-w-6xl mx-auto pb-20">
        <div className="flex flex-col items-center mb-8 gap-6 pt-4">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
            <button onClick={() => setActiveTab('today')} className={`px-8 py-2.5 rounded-xl transition-all std-label ${activeTab === 'today' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-black'}`}>本日工單</button>
            <button onClick={() => { setActiveTab('week'); setWeekOffset(0); }} className={`px-8 py-2.5 rounded-xl transition-all std-label ${activeTab === 'week' ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'text-black'}`}>本週工單</button>
          </div>
        </div>
        <div className="animate-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'today' ? (
            <>
              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm text-center"><div className="text-2xl text-black std-label">本日無靠卡排程行程</div></div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className={viewMode === 'card' ? "flex flex-wrap justify-center gap-6 w-full" : "hidden md:hidden flex-wrap justify-center gap-6 w-full"}>
                    {filteredRecords.map((r: CardRecord, idx: number) => <div key={r.id} className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] max-w-sm">{renderCard(r, idx)}</div>)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-12">
              <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
                <Button variant="secondary" onClick={() => setWeekOffset(prev => prev - 1)}>上一段</Button>
                <span className="std-label text-xl text-blue-600">本週靠卡行事曆</span>
                <Button variant="secondary" onClick={() => setWeekOffset(prev => prev + 1)}>下一段</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {weekDays.map((day, idx) => {
                  const dayRecords = visibleRecords.filter((r: CardRecord) => r.date === day.dateStr);
                  const isToday = day.dateStr === todayStr;
                  return (
                    <div key={day.dateStr} className="space-y-4">
                      <div className={`p-4 rounded-2xl flex items-center justify-between border-b-4 ${isToday ? 'bg-blue-600 text-white border-blue-800 shadow-lg' : 'bg-white text-black border-slate-200 shadow-sm'}`}>
                        <div className="flex flex-col"><span className="std-label text-lg">{formatDate(day.dateStr)}</span><span className="std-content">星期{day.dayName}</span></div>
                        {isToday && <span className="bg-white text-blue-600 px-3 py-1 rounded-full std-label animate-pulse uppercase">當日</span>}
                      </div>
                      <div className="space-y-6">
                        {dayRecords.map((r: CardRecord, rIdx: number) => renderCard(r, idx + rIdx))}
                        {dayRecords.length === 0 && <div className="bg-white/40 p-10 rounded-3xl border border-dashed border-slate-200 text-center std-label text-black italic">本日暫無排程</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {zoomCard && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300 backdrop-blur-md">
          <button onClick={() => setZoomCard(null)} className="absolute top-4 right-4 p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-all active:scale-90 border-2 border-white/20 z-[110]"><X size={20} strokeWidth={3} /></button>
          <div className={`w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 border-[6px] border-blue-600 flex flex-col overflow-y-auto max-h-[95vh] custom-scrollbar ${getPastelClass(records.indexOf(zoomCard))}`}><CardRecordContent r={zoomCard} getVestColor={getVestColor} isZoomed={true} /><div className="mt-12 pt-8 border-t-2 border-dashed border-slate-300 flex flex-col items-center gap-2"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">羿</div><span className="std-label text-slate-500 text-lg font-bold">羿鈞支援靠卡系統</span></div><span className="text-[10px] text-slate-400 tracking-[0.5em] uppercase font-bold">Digital Support Management System</span></div></div>
        </div>
      )}
    </div>
  );
};

const Backend: React.FC<{ user: User, store: any, onLogout: () => void, setAuthView: (view: any) => void }> = ({ user, store, onLogout, setAuthView }) => {
  const [activeTab, setActiveTab] = useState<'scheduling' | 'maintenance' | 'system'>('scheduling');
  const [subTab, setSubTab] = useState<string>('project');
  const [schedulingSubTab, setSchedulingSubTab] = useState<'current' | 'history'>('current');
  const [historyYearView, setHistoryYearView] = useState<'currentYear' | 'pastYears'>('currentYear');
  const [systemSubTab, setSystemSubTab] = useState<'anno' | 'account' | 'info'>('anno');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [maintenanceViewMode, setMaintenanceViewMode] = useState<ViewMode>('card');
  const [systemViewMode, setSystemViewMode] = useState<ViewMode>('card');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'archive_confirm' | 'maintenance_confirm' | 'change_front_pwd' | null>(null);
  const [maintenanceAction, setMaintenanceAction] = useState<'clear' | 'demo' | 'export' | 'import' | null>(null);
  const [sysopCheck, setSysopCheck] = useState({ username: '', password: '' });
  const [newFrontPwd, setNewFrontPwd] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tempStaffList, setStaffList] = useState<Staff[]>([]);
  const [historyRange, setHistoryRange] = useState({ start: '', end: '' });
  const [searchStaff, setSearchStaff] = useState<string>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formOrderId, setFormOrderId] = useState('');
  const [formFactory, setFormFactory] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formVest, setFormVest] = useState('');
  const [formOpeners, setFormOpeners] = useState<string[]>([]);
  const [formSupporters, setFormSupporters] = useState<string[]>([]);
  const [formName, setFormName] = useState('');
  const [formIsSup, setFormIsSup] = useState(false);
  const [formNote, setFormNote] = useState('');
  const [formColor, setFormColor] = useState('#4f81bd');
  const [formContent, setFormContent] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<Role>(Role.ADMIN);
  const [formPwd, setFormPwd] = useState('');

  useEffect(() => { setStaffList([...store.staff].sort((a: Staff, b: Staff) => a.order - b.order)); }, [store.staff]);

  const handleSoftRefresh = async () => {
    setIsRefreshing(true);
    await store.checkDbConnection();
    setIsRefreshing(false);
  };

  const getVestColor = (vestName: string) => store.vests.find((v: any) => v.companyName === vestName)?.color || '#cbd5e1';

  const handleOpenModal = (mode: any, item?: any) => {
    setModalMode(mode);
    const i = item || {};
    setEditingItem(i);

    if (activeTab === 'scheduling') {
      setFormOrderId(i.orderId || '');
      setFormFactory(i.factory || '');
      setFormDate(i.date || new Date().toISOString().split('T')[0]);
      setFormTime(i.time || '08:00');
      setFormVest(i.vest || '');
      setFormOpeners(i.openers || []);
      setFormSupporters(i.supporters || []);
    } else if (activeTab === 'maintenance') {
      if (subTab === 'project') {
        setFormOrderId(i.orderId || '');
        setFormFactory(i.factory || '');
        setFormDate(i.date || new Date().toISOString().split('T')[0]);
        setFormTime(i.time || '08:00');
        setFormVest(i.vest || (store.vests[0]?.companyName || ''));
      } else if (subTab === 'staff') {
        setFormName(i.name || '');
        setFormIsSup(i.isSupervisor || false);
        setFormNote(i.note || '');
      } else if (subTab === 'vest') {
        setFormName(i.companyName || '');
        setFormColor(i.color || '#4f81bd');
      }
    } else if (activeTab === 'system') {
      if (systemSubTab === 'anno') {
        setFormContent(i.content || '');
      } else if (systemSubTab === 'account') {
        setFormUsername(i.username || '');
        setFormName(i.name || '');
        setFormPwd(i.password || '');
        setFormRole(i.role || Role.ADMIN);
      }
    }
  };

  const handleSave = () => {
    if (activeTab === 'scheduling') {
      const data = { orderId: formOrderId, factory: formFactory, date: formDate, time: formTime, vest: formVest, openers: formOpeners, supporters: formSupporters };
      if (modalMode === 'edit') store.updateRecord(editingItem.id, data);
      else store.addRecord(data);
    } else if (activeTab === 'maintenance') {
      if (subTab === 'project') {
        const data = { orderId: formOrderId, factory: formFactory, date: formDate, time: formTime, vest: formVest };
        if (modalMode === 'edit') store.updateProject(editingItem.id, data);
        else store.addProject(data);
      } else if (subTab === 'staff') {
        const data = { name: formName, isSupervisor: formIsSup, note: formNote };
        if (modalMode === 'edit') store.updateStaff(editingItem.id, data);
        else store.addStaff(data);
      } else if (subTab === 'vest') {
        if (modalMode === 'edit') store.updateVest(editingItem.id, formName, formColor);
        else store.addVest(formName, formColor);
      }
    } else if (activeTab === 'system') {
      if (systemSubTab === 'anno') {
        if (modalMode === 'edit') store.updateAnnouncement(editingItem.id, formContent);
        else store.addAnnouncement(formContent);
      } else if (systemSubTab === 'account') {
        const data = { username: formUsername, name: formName, password: formPwd, role: formRole };
        if (modalMode === 'edit') store.updateUser(editingItem.id, data);
        else store.addUser(data);
      }
    }
    setModalMode(null);
  };

  const menuItems = [
    { id: 'scheduling', label: 'A.靠卡管理', icon: LayoutDashboard },
    { id: 'maintenance', label: 'B.專案、人員管理', icon: Users },
    { id: 'system', label: 'C.系統管理', icon: ShieldCheck }
  ];

  const activeMenuClasses: Record<string, string> = { scheduling: 'bg-blue-600 text-white shadow-xl', maintenance: 'bg-emerald-600 text-white shadow-xl', system: 'bg-rose-600 text-white shadow-xl' };

  const handleTabChange = (id: any) => {
    setActiveTab(id); setIsMobileMenuOpen(false);
    if (id === 'maintenance') setSubTab('project'); if (id === 'system') setSystemSubTab('anno'); if (id === 'scheduling') setSchedulingSubTab('current');
  };

  const currentRecords = store.records.filter((r: CardRecord) => !r.isArchived);

  const archivedRecords = useMemo(() => store.records.filter((r: CardRecord) => r.isArchived), [store.records]);
  const currentYear = new Date().getFullYear();

  // 根據二級標籤篩選歷史紀錄
  const recordsToShowInHistory = useMemo(() => {
    let filtered = archivedRecords.filter((r: CardRecord) => {
      const year = new Date(r.date).getFullYear();
      if (historyYearView === 'currentYear') return year === currentYear;
      return year !== currentYear;
    });

    if (historyRange.start) filtered = filtered.filter((r: CardRecord) => r.date >= historyRange.start);
    if (historyRange.end) filtered = filtered.filter((r: CardRecord) => r.date <= historyRange.end);
    if (searchStaff) filtered = filtered.filter((r: CardRecord) => r.openers.includes(searchStaff) || r.supporters.includes(searchStaff));

    return filtered;
  }, [archivedRecords, historyYearView, historyRange, searchStaff, currentYear]);

  // 統計修正：僅計算「已勾選靠卡」的人員次數，且根據標籤頁鎖定年度
  const statsScopeRecords = useMemo(() => {
    return archivedRecords.filter((r: CardRecord) => {
      const year = new Date(r.date).getFullYear();
      if (historyYearView === 'currentYear') return year === currentYear;
      return year !== currentYear;
    });
  }, [archivedRecords, historyYearView, currentYear]);

  const globalStats = useMemo(() => ({
    week: statsScopeRecords.filter(r => isThisWeek(r.date)).reduce((acc, r) => acc + (r.checkedInSupporters?.length || 0), 0),
    month: statsScopeRecords.filter(r => isThisMonth(r.date)).reduce((acc, r) => acc + (r.checkedInSupporters?.length || 0), 0),
    year: statsScopeRecords.reduce((acc, r) => acc + (r.checkedInSupporters?.length || 0), 0),
    total: statsScopeRecords.reduce((acc, r) => acc + (r.checkedInSupporters?.length || 0), 0)
  }), [statsScopeRecords]);

  const staffStats = useMemo(() => {
    if (!searchStaff) return null;
    const personal = statsScopeRecords.filter(r => r.checkedInSupporters?.includes(searchStaff));
    return {
      name: searchStaff,
      week: personal.filter(r => isThisWeek(r.date)).length,
      month: personal.filter(r => isThisMonth(r.date)).length,
      year: personal.length,
      total: personal.length
    };
  }, [statsScopeRecords, searchStaff]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const exportSheets = [{ name: '人員名單', data: store.staff }, { name: '廠商背心', data: store.vests }, { name: '案場資料', data: store.projects }, { name: '靠卡紀錄', data: store.records }, { name: '系統公告', data: store.announcements }, { name: '管理帳號', data: store.users }, { name: '系統設定', data: [store.systemConfig] }];
    exportSheets.forEach(s => { const ws = XLSX.utils.json_to_sheet(s.data); XLSX.utils.book_append_sheet(wb, ws, s.name); });
    XLSX.writeFile(wb, `羿鈞科技系統稽核備份_${new Date().toISOString().split('T')[0]}.xlsx`);
    alert('系統資料備份匯出成功！');
  };

  const renderScheduling = () => {
    const recordsToShow = schedulingSubTab === 'current' ? currentRecords : recordsToShowInHistory;
    return (
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-slate-100 pb-px overflow-x-auto custom-scrollbar">
          {['current', 'history'].map(id => (
            <button key={id} onClick={() => setSchedulingSubTab(id as any)} className={`pb-3 px-6 relative transition-all whitespace-nowrap rounded-t-2xl std-label ${schedulingSubTab === id ? `bg-blue-100 text-blue-700` : 'text-black hover:text-blue-600'}`}>
              {id === 'current' ? '靠卡資訊 (當週)' : '歷史資料'}
              {schedulingSubTab === id && <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-blue-600"></div>}
            </button>
          ))}
        </div>

        {schedulingSubTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 二級年度切換頁籤 */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit shadow-inner">
              <button onClick={() => { setHistoryYearView('currentYear'); setHistoryRange({ start: '', end: '' }); }} className={`px-5 py-2 rounded-xl std-label text-sm transition-all flex items-center gap-2 ${historyYearView === 'currentYear' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-blue-500'}`}><Calendar size={14} /> 本年度稽核 ({currentYear})</button>
              <button onClick={() => { setHistoryYearView('pastYears'); setHistoryRange({ start: '', end: '' }); }} className={`px-5 py-2 rounded-xl std-label text-sm transition-all flex items-center gap-2 ${historyYearView === 'pastYears' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-blue-500'}`}><History size={14} /> 過往年度查詢</button>
            </div>

            <div className="bg-slate-100/50 p-6 rounded-[2.5rem] border border-slate-200/60 shadow-inner">
              <div className="flex items-center gap-2 mb-4 px-2">
                <Activity size={18} className="text-blue-600" />
                <span className="std-label text-slate-600 uppercase tracking-widest text-[10px]">系統全局歷史統計 - {historyYearView === 'currentYear' ? `當前年度 (${currentYear})` : '非本年度累計'} (僅計算已靠卡)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsBox label="週靠卡人次" value={globalStats.week} icon={Calendar} />
                <StatsBox label="月靠卡人次" value={globalStats.month} icon={BarChart3} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
                <StatsBox label="年度總人次" value={globalStats.year} icon={TrendingUp} colorClass="text-purple-600" bgClass="bg-purple-50" />
                <StatsBox label="資料範圍累計" value={globalStats.total} icon={ListTodo} colorClass="text-rose-600" bgClass="bg-rose-50" />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
              <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 text-blue-600">
                  <Search size={20} />
                  <span className="std-label">出席稽核與年度人員篩選</span>
                  {(searchStaff || historyRange.start || historyRange.end) && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] std-label uppercase animate-pulse">已套用篩選</span>}
                </div>
                <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} size={20} />
              </button>
              {isFilterExpanded && (
                <div className="p-6 pt-0 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mt-4">
                    <div className="space-y-2">
                      <label className="std-label text-slate-500 uppercase text-[10px]">人員統計搜尋 (鎖定{historyYearView === 'currentYear' ? '本年度' : '過往年度'})</label>
                      <div className="relative">
                        <UserCheck size={14} className="absolute left-3 top-3 text-slate-400" />
                        <select value={searchStaff} onChange={e => setSearchStaff(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none std-content">
                          <option value="">所有人員</option>
                          {store.staff.map((s: Staff) => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2"><label className="std-label text-slate-500 uppercase text-[10px]">開始日期</label><div className="relative"><Calendar size={14} className="absolute left-3 top-3 text-slate-400" /><input type="date" value={historyRange.start} onChange={e => setHistoryRange(prev => ({ ...prev, start: e.target.value }))} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
                    <div className="space-y-2"><label className="std-label text-slate-500 uppercase text-[10px]">結束日期</label><div className="relative"><Calendar size={14} className="absolute left-3 top-3 text-slate-400" /><input type="date" value={historyRange.end} onChange={e => setHistoryRange(prev => ({ ...prev, end: e.target.value }))} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div></div>
                    <button onClick={() => { setHistoryRange({ start: '', end: '' }); setSearchStaff(''); }} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all std-label">重設篩選</button>
                  </div>
                </div>
              )}
            </div>

            {staffStats && (
              <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl text-white animate-in zoom-in duration-300">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30 shrink-0">
                    <UserCircle size={48} className="text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black mb-1">{staffStats.name} - {historyYearView === 'currentYear' ? '本年度統計' : '過往歷史統計'}</h4>
                    <p className="text-blue-100 std-content uppercase tracking-widest text-[10px] font-bold opacity-80">個人實際出席人次計算 (僅包含已靠卡標記)</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
                    {[
                      { l: '範圍內週計', v: staffStats.week },
                      { l: '範圍內月計', v: staffStats.month },
                      { l: '範圍內年計', v: staffStats.year },
                      { l: '該範圍總計', v: staffStats.total },
                    ].map(item => (
                      <div key={item.l} className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] font-bold opacity-70 mb-1">{item.l}</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-black">{item.v}</span>
                          <span className="text-[10px] font-bold opacity-60">次</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <h3 className="std-label text-2xl text-black tracking-tight">{schedulingSubTab === 'current' ? '當週靠卡資訊作業' : historyYearView === 'currentYear' ? `歷史稽核：${currentYear} 本年度` : '過往年度存檔查詢'}</h3>
          <div className="flex items-center gap-4">
            <div className="hidden md:block"><ToggleViewMode mode={viewMode} onChange={setViewMode} /></div>
            {schedulingSubTab === 'current' && <button onClick={() => handleOpenModal('add')} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all nav-tooltip" data-tooltip="新增靠卡排程"><Plus size={24} /></button>}
          </div>
        </div>

        <div className={viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 md:hidden gap-6"}>
          {recordsToShow.map((r: CardRecord, idx: number) => (
            <Card key={r.id} className={`${getPastelClass(idx)} border-l-4 border-l-blue-600 rounded-[2rem] relative`} actions={
              <div className="flex gap-1">
                {schedulingSubTab === 'current' ? (
                  <>
                    <button onClick={() => handleOpenModal('add', r)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all nav-tooltip" data-tooltip="複製此排程"><Copy size={18} /></button>
                    <button onClick={() => handleOpenModal('archive_confirm', r)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all nav-tooltip" data-tooltip="封存此資料"><Archive size={18} /></button>
                    <button onClick={() => handleOpenModal('edit', r)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all nav-tooltip" data-tooltip="編輯此排程"><PencilLine size={18} /></button>
                    <button onClick={() => store.deleteRecord(r.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all nav-tooltip" data-tooltip="刪除此排程"><Trash2 size={18} /></button>
                  </>
                ) : <span className="text-[10px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full std-label uppercase font-black">{new Date(r.date).getFullYear()} 封存</span>}
              </div>
            }><CardRecordContent r={r} getVestColor={getVestColor} isManageMode={schedulingSubTab === 'current'} onToggleCheckIn={(name) => store.toggleCheckIn(r.id, name)} /></Card>
          ))}
          {recordsToShow.length === 0 && <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 std-label">此年度範圍暫無歷史資料紀錄</div>}
        </div>
        <div className={viewMode === 'list' ? "hidden md:block" : "hidden"}>
          <Card className="p-0 border-none shadow-xl overflow-x-auto bg-white w-full rounded-[2rem]">
            <table className="w-full text-left text-black min-w-[800px]">
              <thead className="bg-slate-50 text-black border-b border-slate-200 uppercase tracking-widest std-label">
                <tr><th className="p-5">靠卡單號</th><th className="p-5">年度</th><th className="p-5">日期</th><th className="p-5">時間</th><th className="p-5">廠區</th><th className="p-5">背心</th><th className="p-5">人員名單 (勾選標記出席)</th><th className="p-5">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 std-content">
                {recordsToShow.map((r: CardRecord) => (
                  <tr key={r.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-5 std-label text-red-600">{r.orderId}</td><td className="p-5"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">{new Date(r.date).getFullYear()}</span></td><td className="p-5">{r.date}</td><td className="p-5 font-bold">{r.time}</td><td className="p-5">{r.factory}</td><td className="p-5"><div className="flex items-center gap-3"><VestIcon color={getVestColor(r.vest)} size="sm" /><span className="bg-white border border-slate-200 text-black px-3 py-1 rounded-lg shadow-sm">{r.vest}</span></div></td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {r.supporters.map(name => {
                          const isChecked = r.checkedInSupporters?.includes(name);
                          return (
                            <button
                              key={name}
                              disabled={schedulingSubTab !== 'current'}
                              onClick={() => store.toggleCheckIn(r.id, name)}
                              className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] std-label transition-all ${isChecked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'} ${schedulingSubTab === 'current' ? 'hover:bg-blue-50 hover:text-blue-600' : ''}`}
                            >
                              {isChecked ? <CheckCircle2 size={10} /> : schedulingSubTab === 'current' ? <Square size={10} /> : null}
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-5"><div className="flex gap-2">{schedulingSubTab === 'current' ? (<><button onClick={() => handleOpenModal('add', r)} className="text-indigo-600 hover:text-indigo-700"><Copy size={18} /></button><button onClick={() => handleOpenModal('archive_confirm', r)} className="text-amber-600 hover:text-amber-700"><Archive size={18} /></button><button onClick={() => handleOpenModal('edit', r)} className="text-blue-600 hover:text-blue-700"><PencilLine size={18} /></button><button onClick={() => store.deleteRecord(r.id)} className="text-red-600 hover:text-red-700"><Trash2 size={18} /></button></>) : <span className="text-[10px] text-slate-400 italic">唯讀存檔</span>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    );
  };

  const renderMaintenance = () => {
    const activeProjects = store.projects.filter((p: Project) => !p.isArchived);
    return (
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-slate-100 pb-px overflow-x-auto custom-scrollbar">
          {['project', 'staff', 'vest'].map(id => (<button key={id} onClick={() => setSubTab(id)} className={`pb-3 px-6 relative transition-all whitespace-nowrap rounded-t-2xl std-label ${subTab === id ? `bg-blue-100 text-blue-700` : 'text-black hover:text-blue-600'}`}>{id === 'project' ? '專案管理' : id === 'staff' ? '靠卡人員管理' : '背心管理'}{subTab === id && <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-blue-600"></div>}</button>))}
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h3 className="std-label text-2xl text-black tracking-tight uppercase">{subTab === 'project' ? '專案資料維護' : subTab === 'staff' ? '靠卡人員維護' : '背心廠商維護'}</h3>
          <div className="flex gap-4 items-center">
            <div className="hidden md:block"><ToggleViewMode mode={maintenanceViewMode} onChange={setMaintenanceViewMode} /></div>
            {subTab === 'staff' && <button onClick={() => store.updateStaffOrder(tempStaffList)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 shadow-sm transition-all nav-tooltip" data-tooltip="儲存排列順序"><Save size={24} /></button>}
            <button onClick={() => handleOpenModal('add')} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all nav-tooltip" data-tooltip="新增資料項"><Plus size={24} /></button>
          </div>
        </div>
        <div className={maintenanceViewMode === 'card' ? "block" : "md:hidden"}>
          {subTab === 'staff' ? (
            <DraggableList<Staff> items={tempStaffList} onReorder={setStaffList} keyExtractor={(s) => s.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" renderItem={(s, idx) => (
              <Card className={`${getPastelClass(idx)} border-l-4 border-l-emerald-600 rounded-[2rem]`} actions={
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal('edit', s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all nav-tooltip" data-tooltip="編輯人員資訊"><PencilLine size={18} /></button>
                  <button onClick={() => store.deleteStaff(s.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all nav-tooltip" data-tooltip="刪除此人員"><Trash2 size={18} /></button>
                </div>
              }><div className="flex items-center gap-2 mb-4"><div className="std-label text-2xl text-black tracking-tight">{s.name}</div></div><div className="space-y-4 mb-5 flex-1">{s.note && <div className="std-content text-black font-bold italic bg-white/50 p-3 rounded-2xl border border-white/50 shadow-inner">{s.note}</div>}</div><div className="mt-auto pt-4 border-t border-white/50 flex items-center justify-between"><span className={`std-label uppercase ${s.isSupervisor ? 'text-red-600' : 'text-black'}`}>{s.isSupervisor ? '具備開卡資格' : '一般靠卡支援'}</span></div></Card>
            )} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subTab === 'project' && activeProjects.map((p: Project, idx: number) => (
                <Card key={p.id} className={`${getPastelClass(idx)} border-l-4 border-l-blue-600 rounded-[2rem]`} actions={<div className="flex gap-1"><button onClick={() => handleOpenModal('edit', p)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all nav-tooltip" data-tooltip="編輯案場資訊"><PencilLine size={18} /></button><button onClick={() => store.deleteProject(p.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all nav-tooltip" data-tooltip="刪除此專案"><Trash2 size={18} /></button></div>}><div className="flex flex-col mb-2"><span className="std-label text-black uppercase text-[10px]">靠卡單號</span><span className="std-label text-2xl text-red-600 leading-none">{p.orderId}</span></div><div className="flex flex-col mb-4"><span className="std-label text-black uppercase text-[10px]">作業靠卡廠區</span><div className="std-label text-2xl text-black leading-tight">{p.factory}</div></div><div className="mb-5"><span className="std-label text-black block uppercase text-[10px] mb-2">預設穿著背心</span><div className="flex items-center gap-3">
                  <VestIcon color={getVestColor(p.vest)} size="sm" />
                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl std-label border border-amber-200 w-fit">{p.vest}</div></div></div><div className="bg-white/60 p-4 rounded-2xl border border-white/50 flex items-center justify-between shadow-inner"><span className="uppercase flex items-center gap-2 font-bold text-black">{p.date} {p.time}</span></div></Card>
              ))}
              {subTab === 'vest' && store.vests.map((v: Vest, idx: number) => (
                <Card key={v.id} className={`${getPastelClass(idx)} border-l-4 border-l-amber-600 p-6 rounded-[2rem]`} actions={<div className="flex gap-1"><button onClick={() => handleOpenModal('edit', v)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all nav-tooltip" data-tooltip="編輯背心廠商"><PencilLine size={18} /></button><button onClick={() => store.deleteVest(v.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all nav-tooltip" data-tooltip="刪除此廠商"><Trash2 size={18} /></button></div>}><div className="flex items-center gap-8"><VestIcon color={v.color} size="md" /><div><div className="std-label text-2xl text-black leading-tight">{v.companyName}</div></div></div></Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-100 pb-px overflow-x-auto custom-scrollbar">
        {['anno', 'account', 'info'].map(tab => (<button key={tab} onClick={() => setSystemSubTab(tab as any)} className={`pb-3 px-6 relative transition-all whitespace-nowrap rounded-t-2xl std-label ${systemSubTab === tab ? `bg-blue-100 text-blue-700` : 'text-black hover:text-blue-600'}`}>{tab === 'anno' ? '公告管理' : tab === 'account' ? '系統帳號' : '系統資訊'}{systemSubTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-blue-600"></div>}</button>))}
      </div>
      <div className="animate-in fade-in duration-300">
        {systemSubTab === 'anno' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"><h3 className="std-label text-2xl text-black">系統公告管理</h3><div className="flex gap-4 items-center"><div className="hidden md:block"><ToggleViewMode mode={systemViewMode} onChange={setSystemViewMode} /></div><button onClick={() => handleOpenModal('add')} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"><Plus size={24} /></button></div></div>
            <div className={systemViewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 md:hidden gap-6"}>
              {store.announcements.map((a: Announcement, idx: number) => (<Card key={a.id} className={`${getPastelClass(idx)} border-l-4 border-l-blue-600 rounded-[2rem]`} actions={<div className="flex gap-1"><button onClick={() => handleOpenModal('edit', a)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><PencilLine size={18} /></button><button onClick={() => store.deleteAnnouncement(a.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={18} /></button></div>}><div className="flex items-center gap-3 mb-4"><div className="bg-white/60 p-2 rounded-2xl shadow-sm border border-white/50"><MessageSquare size={24} className="text-blue-600" /></div><div className="flex flex-col"><span className="std-label text-black truncate max-w-[200px]">{a.content}</span><span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{a.createdAt.split('T')[0]}</span></div></div><div className="pt-4 border-t border-white/50 flex items-center justify-between"><div className="flex bg-slate-200 rounded-full p-1 border border-slate-300 scale-90 origin-left"><button onClick={() => !a.isOnline && store.toggleAnnouncement(a.id)} className={`px-4 py-1 rounded-full text-[10px] std-label transition-all ${a.isOnline ? 'bg-green-600 text-white shadow-sm' : 'text-black hover:text-black'}`}>上線</button><button onClick={() => a.isOnline && store.toggleAnnouncement(a.id)} className={`px-4 py-1 rounded-full text-[10px] std-label transition-all ${!a.isOnline ? 'bg-slate-600 text-white shadow-sm' : 'text-black hover:text-black'}`}>離線</button></div><span className={`std-label text-[10px] uppercase ${a.isOnline ? 'text-green-600 animate-pulse' : 'text-slate-400'}`}>{a.isOnline ? '刊登中' : '已關閉'}</span></div></Card>))}
            </div>
          </div>
        ) : systemSubTab === 'account' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"><h3 className="std-label text-2xl text-black">帳號安全管理</h3><div className="flex gap-4 items-center"><div className="hidden md:block"><ToggleViewMode mode={systemViewMode} onChange={setSystemViewMode} /></div><button onClick={() => handleOpenModal('add')} className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"><Plus size={24} /></button></div></div>
            <Card className="bg-blue-50 border-2 border-blue-200 shadow-md p-6 mb-8 rounded-[2rem]" title={<div className="flex items-center gap-2 text-blue-800"><Lock size={18} /> 安全控制：前台密碼變更</div>}><div className="flex flex-col md:flex-row gap-6 items-end"><div className="flex-1 space-y-4"><p className="std-content text-blue-700">此功能將變更一般同仁進入前台系統時所需的共用密碼。變更動作需要最高權限 (SYSOP) 的二次驗證。</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><PasswordInput label="設定新前台密碼" value={newFrontPwd} onChange={e => setNewFrontPwd(e.target.value)} placeholder="請輸入新密碼" /></div></div><Button variant="primary" className="h-12 px-10 bg-blue-700 hover:bg-blue-800" onClick={() => handleOpenModal('change_front_pwd')}>立即更新密碼</Button></div></Card>
            <div className={systemViewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 md:hidden gap-6"}>
              {store.users.map((u: User, idx: number) => (<Card key={u.id} className={`${getPastelClass(idx)} border-l-4 ${u.role === Role.SYSOP ? 'border-l-rose-600' : 'border-l-blue-600'} rounded-[2rem]`} actions={<div className="flex gap-1"><button onClick={() => handleOpenModal('edit', u)} disabled={u.role === Role.SYSOP && user.role !== Role.SYSOP} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-30"><PencilLine size={18} /></button><button onClick={() => store.deleteUser(u.id)} disabled={u.role === Role.SYSOP || u.id === user.id} className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-30"><Trash2 size={18} /></button></div>}><div className="flex items-center gap-4 mb-4"><div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-inner border border-white/50"><UserCircle size={32} className={u.role === Role.SYSOP ? 'text-rose-600' : 'text-blue-600'} /></div><div className="flex flex-col overflow-hidden"><span className="std-label text-black truncate">{u.name}</span><span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest truncate">{u.username}</span></div></div><div className="pt-4 border-t border-white/50 flex items-center justify-between"><span className={`px-3 py-1 rounded-full text-[10px] std-label uppercase shadow-sm border ${u.role === Role.SYSOP ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>{u.role === Role.SYSOP ? '最高權限' : '一般管理'}</span></div></Card>))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h3 className="std-label text-2xl text-black uppercase flex items-center gap-3"><Activity className="text-blue-600" size={28} />系統整合資訊與維護</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-xl border-blue-100 bg-white rounded-[2rem] overflow-hidden" title={<div className="flex items-center gap-2 text-black std-label text-lg"><ShieldCheck size={20} className="text-blue-600" />系統運作控制台</div>}>
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner mb-2">
                  <div className={`p-6 rounded-full shadow-2xl border-4 border-white mb-6 ${store.systemStatus.dbConnection === 'connected' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    <Database size={48} className={store.systemStatus.dbConnection === 'connected' ? 'animate-pulse' : 'animate-bounce'} />
                  </div>
                  <div className="text-center mb-6">
                    <div className={`text-2xl std-label mb-2 ${store.systemStatus.dbConnection === 'connected' ? 'text-green-600' : 'text-red-600'}`}>模擬實體庫：{store.systemStatus.dbConnection === 'connected' ? '運作正常' : '連線異常'}</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleSoftRefresh} className="px-10 py-3 rounded-2xl bg-white border-slate-200 hover:border-blue-300">
                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} /> 重新測試連線
                  </Button>
                </div>
              </Card>
              <Card className="shadow-xl border-blue-100 bg-white rounded-[2rem] overflow-hidden" title={<div className="flex items-center gap-2 text-black std-label text-lg"><Cpu size={20} className="text-indigo-600" /> 系統建置資訊</div>}>
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner space-y-6 mb-2">
                  <div className="text-center space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Current Core Version</span>
                    <div className="text-4xl font-black text-slate-800 tracking-tighter">Ver.{SYSTEM_VERSION}</div>
                  </div>
                  <div className="w-full h-px bg-slate-200/50"></div>
                  <div className="text-center space-y-2 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Last Code Update</span>
                    <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-mono text-lg shadow-lg shadow-indigo-200 tracking-wider">
                      {LAST_UPDATE_CODE}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold italic mt-2">系統已由 GitHub 進行版本控管</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-black">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">羿</div>
            <div className="flex flex-col">
              <span className="std-label text-slate-100 text-sm font-bold leading-none">管理後台</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1 font-bold">Ver.{SYSTEM_VERSION}</span>
            </div>
          </div>
          <nav className="flex-1 space-y-2">{menuItems.map(item => (<button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all std-label ${activeTab === item.id ? activeMenuClasses[item.id] : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><item.icon size={20} />{item.label}</button>))}</nav><div className="mt-auto space-y-4 pt-6 border-t border-slate-800"><button onClick={() => setAuthView('front_app')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all std-label text-sm"><Home size={18} /> 返回前台系統</button><button onClick={handleSoftRefresh} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all std-label text-sm"><RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} /> 軟重新整理</button><div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3 border border-slate-800"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 shadow-sm"><UserCircle size={24} className="text-slate-400" /></div><div className="flex flex-col overflow-hidden"><span className="std-label text-slate-200 text-xs truncate">{user.name}</span><button onClick={onLogout} className="text-[10px] text-rose-400 font-bold hover:underline text-left">登出管理員</button></div></div></div></div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar relative">
        <header className="flex md:hidden items-center mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all mr-4">{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button><div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">羿</div><span className="std-label text-black">管理後台</span></div></header>
        {activeTab === 'scheduling' && renderScheduling()}
        {activeTab === 'maintenance' && renderMaintenance()}
        {activeTab === 'system' && renderSystem()}
      </main>
      <Modal isOpen={modalMode !== null} onClose={() => setModalMode(null)} title={modalMode === 'add' ? '新增資料' : modalMode === 'edit' ? '編輯資料' : modalMode === 'archive_confirm' ? '確認封存' : modalMode === 'change_front_pwd' ? '前台密碼變更驗證' : '系統維護確認'}>
        <div className="space-y-6">
          {modalMode === 'archive_confirm' && (<div className="space-y-4"><p className="std-content">確定要將工單 <span className="text-red-600 font-bold">{editingItem?.orderId}</span> 移至歷史資料嗎？這將連動隱藏其對應的專案卡片。</p><div className="flex gap-2"><Button className="flex-1" onClick={() => { store.archiveRecord(editingItem.id); setModalMode(null); }}>確認封存</Button><Button variant="secondary" className="flex-1" onClick={() => setModalMode(null)}>取消</Button></div></div>)}
          {modalMode === 'maintenance_confirm' && (<div className="space-y-4"><p className="std-content">您即將執行：<span className="text-rose-600 font-bold">{maintenanceAction === 'clear' ? '清除所有資料' : maintenanceAction === 'demo' ? '系統初始化' : maintenanceAction === 'export' ? '匯出備份' : '匯入備份'}</span>。此動作不可復原，請確認？</p><div className="flex gap-2"><Button variant="danger" className="flex-1" onClick={() => { if (maintenanceAction === 'clear') store.clearAllData(); if (maintenanceAction === 'demo') store.importDemoData(); if (maintenanceAction === 'export') handleExportExcel(); if (maintenanceAction === 'import') importFileRef.current?.click(); setModalMode(null); }}>確認執行</Button><Button variant="secondary" className="flex-1" onClick={() => setModalMode(null)}>取消</Button></div></div>)}
          {modalMode === 'change_front_pwd' && (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const authUser = store.verifyBackCredentials(sysopCheck.username, sysopCheck.password);
              if (authUser && authUser.role === Role.SYSOP) {
                store.updateFrontPassword(newFrontPwd);
                alert('前台密碼已更新！');
                setModalMode(null);
                setNewFrontPwd('');
              } else alert('管理員驗證失敗，請確認 SYSOP 帳密。');
            }}>
              <p className="std-content text-sm text-slate-500">為了安全起見，請輸入最高管理員 (SYSOP) 的憑證：</p>
              <Input label="管理員帳號" value={sysopCheck.username} onChange={e => setSysopCheck(p => ({ ...p, username: e.target.value }))} />
              <PasswordInput label="管理員密碼" value={sysopCheck.password} onChange={e => setSysopCheck(p => ({ ...p, password: e.target.value }))} />
              <Button type="submit" className="w-full">驗證並更新</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setModalMode(null)}>取消</Button>
            </form>
          )}

          {(modalMode === 'add' || modalMode === 'edit') && (
            <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'scheduling' && (
                <>
                  <Select label="選擇專案 (資料連動)" value={store.projects.find((p: Project) => p.orderId === formOrderId)?.id || ''} options={[{ value: '', label: '請選擇 Module B 定義的專案' }, ...store.projects.filter((p: Project) => !p.isArchived).map((p: Project) => ({ value: p.id, label: `${p.orderId} - ${p.factory}` }))]} onChange={e => {
                    const p = store.projects.find((pj: Project) => pj.id === e.target.value);
                    if (p) { setFormOrderId(p.orderId); setFormFactory(p.factory); setFormVest(p.vest); }
                    else { setFormOrderId(''); setFormFactory(''); setFormVest(''); }
                  }} />
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-1"><Link2 size={16} /><span className="std-label text-[10px] uppercase tracking-wider">自動連動資訊 (不可修改)</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold">靠卡單號</span><span className="std-label text-red-600">{formOrderId || '-'}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-bold">靠卡廠區</span><span className="std-label text-blue-600">{formFactory || '-'}</span></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold">預設背心樣式</span>
                      <div className="flex items-center gap-2 mt-1">
                        {formVest && <VestIcon color={getVestColor(formVest)} size="sm" />}
                        <span className="std-label">{formVest || '-'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4"><Input label="靠卡日期" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} /><Input label="靠卡時間" type="time" value={formTime} onChange={e => setFormTime(e.target.value)} /></div>
                  <div className="space-y-2">
                    <label className="std-label block">開卡人員 (可多選)</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {store.staff.filter((s: Staff) => s.isSupervisor).map((s: Staff) => (
                        <button key={s.id} onClick={() => setFormOpeners(prev => prev.includes(s.name) ? prev.filter(n => n !== s.name) : [...prev, s.name])} className={`px-3 py-1.5 rounded-lg text-xs std-label transition-all ${formOpeners.includes(s.name) ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-red-300'}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="std-label block">靠卡支援人員 (可多選)</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {store.staff.map((s: Staff) => (
                        <button key={s.id} onClick={() => setFormSupporters(prev => prev.includes(s.name) ? prev.filter(n => n !== s.name) : [...prev, s.name])} className={`px-3 py-1.5 rounded-lg text-xs std-label transition-all ${formSupporters.includes(s.name) ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-red-300'}`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 h-12 rounded-xl" onClick={handleSave} disabled={activeTab === 'scheduling' && !formOrderId}>儲存資料</Button>
                <Button variant="secondary" className="flex-1 h-12 rounded-xl" onClick={() => setModalMode(null)}>取消</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const App: React.FC = () => {
  const store = useStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'front_login' | 'back_login' | 'front_app' | 'back_app'>('front_login');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('YIJUN_SESSION');
    if (savedSession) {
      try {
        const { user, view, remember } = JSON.parse(savedSession);
        if (remember) {
          setCurrentUser(user);
          setAuthView(view);
          setRememberMe(true);
        }
      } catch (e) { console.error("Session recovery failed"); }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (rememberMe && currentUser) {
        localStorage.setItem('YIJUN_SESSION', JSON.stringify({ user: currentUser, view: authView, remember: true }));
      } else {
        localStorage.removeItem('YIJUN_SESSION');
      }
    }
  }, [currentUser, authView, rememberMe, isInitialized]);

  const handleFrontLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.verifyFrontPassword(password)) {
      setCurrentUser({ id: 'g1', username: 'guest', role: Role.GUEST, name: '工作同仁' });
      setAuthView('front_app');
    } else {
      if (store.users.length === 0) alert('偵測到系統尚未初始化，請點擊右下角初始化按鈕。');
      else alert('密碼錯誤，請確認前台入口密碼。');
    }
  };

  const handleBackLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = store.verifyBackCredentials(username, password);
    if (user) {
      setCurrentUser(user);
      setAuthView('back_app');
    } else {
      alert('憑證錯誤，請確認管理帳號與密碼。');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthView('front_login');
    setPassword('');
    setUsername('');
    setRememberMe(false);
    localStorage.removeItem('YIJUN_SESSION');
  };

  if (!isInitialized) return null;

  if (authView === 'front_app') return <Frontend store={store} currentUser={currentUser} setAuthView={setAuthView} onLogout={logout} />;
  if (authView === 'back_app' && currentUser && currentUser.role !== Role.GUEST) return <Backend user={currentUser} store={store} onLogout={logout} setAuthView={setAuthView} />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden relative">
        {store.users.length === 0 && (
          <button onClick={() => { if (confirm('確定要初始化系統資料庫嗎？')) store.importDemoData(); }} className="absolute bottom-4 right-4 p-3 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-all shadow-sm flex items-center gap-2 std-label text-[10px] z-10">
            <Sparkles size={14} /> 系統初次使用？點此初始化
          </button>
        )}
        <div className="flex text-center bg-slate-50 border-b std-label">
          <button onClick={() => setAuthView('front_login')} className={`flex-1 py-6 transition-colors ${authView === 'front_login' ? 'bg-white text-blue-600' : 'text-slate-400'}`}>前台系統</button>
          <button onClick={() => setAuthView('back_login')} className={`flex-1 py-6 transition-colors ${authView === 'back_login' ? 'bg-white text-blue-600' : 'text-slate-400'}`}>後台管理</button>
        </div>
        <div className="p-10 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-blue-800">羿鈞科技支援靠卡系統</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Ver.{SYSTEM_VERSION}</p>
            <p className="std-content text-slate-500 mt-2">{authView === 'front_login' ? '工作同仁登入驗證' : '系統後台管理登入'}</p>
          </div>
          {authView === 'front_login' ? (
            <form onSubmit={handleFrontLogin} className="space-y-6">
              <PasswordInput label="前台進入密碼" value={password} onChange={e => setPassword(e.target.value)} placeholder="請輸入前台密碼" />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember_front" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="remember_front" className="std-content text-sm text-slate-600 cursor-pointer">保持登入狀態</label>
              </div>
              <Button type="submit" className="w-full py-5 rounded-3xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 font-bold">驗證並進入系統</Button>
            </form>
          ) : (
            <form onSubmit={handleBackLogin} className="space-y-6">
              <Input label="管理帳號" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
              <PasswordInput label="管理密碼" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember_back" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="remember_back" className="std-content text-sm text-slate-600 cursor-pointer">保持登入狀態</label>
              </div>
              <Button type="submit" className="w-full py-5 rounded-3xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 font-bold">登入管理後台</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
