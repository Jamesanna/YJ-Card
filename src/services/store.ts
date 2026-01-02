
import { useState, useCallback, useEffect } from 'react';
import { CardRecord, Project, Staff, Announcement, SystemStatus, Vest, User, Role, SystemConfig } from '../types';

const STORAGE_KEY = 'YIJUN_SYSTEM_DATA';

const BOOTSTRAP_CRED = {
  S_U: 'c3lzb3A=',      // 'sysop'
  S_P: 'QWRtaW5AMTIz',  // 'Admin@123'
  F_P: 'QDI0NjY0OTQx'   // '@24664941'
};

const decodeBase64 = (str: string) => {
  try { return atob(str); } catch (e) { return ''; }
};

// 輔助生成日期字串
const getDateStr = (year: number, month: number, day: number) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// =========================================================
// 模擬範例資料集 (基因庫)
// =========================================================

const INITIAL_STAFF: Staff[] = [
  { id: 's01', name: '王小明', isSupervisor: true, note: '工程部經理', order: 1 },
  { id: 's02', name: '李大華', isSupervisor: false, note: '資深技術員', order: 2 },
  { id: 's03', name: '陳美麗', isSupervisor: true, note: '工安主任', order: 3 },
  { id: 's04', name: '張志豪', isSupervisor: false, note: '支援一組', order: 4 },
  { id: 's05', name: '林志玲', isSupervisor: true, note: '專案負責人', order: 5 },
  { id: 's06', name: '趙又廷', isSupervisor: false, note: '支援一組', order: 6 },
  { id: 's07', name: '郭雪芙', isSupervisor: false, note: '支援二組', order: 7 },
  { id: 's08', name: '柯震東', isSupervisor: true, note: '領班', order: 8 },
  { id: 's09', name: '許光漢', isSupervisor: false, note: '技術員', order: 9 },
  { id: 's10', name: '桂綸鎂', isSupervisor: false, note: '資深支援', order: 10 },
  { id: 's11', name: '周杰倫', isSupervisor: true, note: '北部區域主管', order: 11 },
  { id: 's12', name: '蔡依林', isSupervisor: false, note: '技術支援', order: 12 },
  { id: 's13', name: '蕭敬騰', isSupervisor: false, note: '機動人員', order: 13 },
  { id: 's14', name: '楊丞琳', isSupervisor: true, note: '廠區維護組長', order: 14 },
  { id: 's15', name: '羅志祥', isSupervisor: false, note: '機動人員', order: 15 },
  { id: 's16', name: '潘瑋柏', isSupervisor: false, note: '支援三組', order: 16 },
  { id: 's17', name: '曾國城', isSupervisor: true, note: '行政總監', order: 17 },
  { id: 's18', name: '徐乃麟', isSupervisor: false, note: '支援三組', order: 18 },
  { id: 's19', name: '吳宗憲', isSupervisor: false, note: '資深工友', order: 19 },
  { id: 's20', name: '陶晶瑩', isSupervisor: false, note: '行政支援', order: 20 },
];

const sups = INITIAL_STAFF.filter(s => s.isSupervisor).map(s => s.name);
const normals = INITIAL_STAFF.filter(s => !s.isSupervisor).map(s => s.name);

const INITIAL_PROJECTS: Project[] = Array.from({ length: 20 }, (_, i) => ({
  id: `p${i + 1}`,
  orderId: `PJ-2026-${String(i + 1).padStart(3, '0')}`,
  factory: i < 10 ? `K18-${i + 1}F 廠區` : `P3-廠外資產-${i - 9}區`,
  date: i < 10 ? getDateStr(2026, 1, i + 2) : getDateStr(2025, 12, (i % 28) + 1),
  time: `${String(8 + (i % 8)).padStart(2, '0')}:30`,
  vest: i % 3 === 0 ? '羿鈞' : i % 3 === 1 ? '長頂' : '帆宣',
  isArchived: i >= 10
}));

const INITIAL_RECORDS: CardRecord[] = Array.from({ length: 20 }, (_, i) => {
  const opener = sups[i % sups.length];
  const supporters = [];
  for (let j = 0; j < 5; j++) {
    supporters.push(normals[(i + j) % normals.length]);
  }

  // 模擬歷史資料大部分都已勾選已靠卡
  const checkedIn = i >= 10 ? supporters.slice(0, 4) : []; 

  return {
    id: `r${i + 1}`,
    orderId: INITIAL_PROJECTS[i].orderId,
    factory: INITIAL_PROJECTS[i].factory,
    openers: [opener],
    supporters: supporters,
    checkedInSupporters: checkedIn,
    vest: INITIAL_PROJECTS[i].vest,
    date: INITIAL_PROJECTS[i].date,
    time: INITIAL_PROJECTS[i].time,
    isArchived: i >= 10
  };
});

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', content: '✨ 歡迎使用羿鈞科技靠卡管理系統 Ver.1.5.1，新的一年請多指教！', isOnline: true, createdAt: new Date().toISOString() },
  { id: 'a2', content: '⚠️ 安全宣導：進入 P3 廠區施工之同仁，請務必攜帶雙證件並穿著反光背心。', isOnline: true, createdAt: new Date().toISOString() },
  { id: 'a3', content: '📢 系統更新：靠卡管理現已支援「已靠卡稽核」功能，未勾選者不計入績效統計。', isOnline: true, createdAt: new Date().toISOString() },
  { id: 'a4', content: '💡 操作提醒：管理員可在後台靠卡資訊中，直接勾選人員名單進行「到場確認」。', isOnline: true, createdAt: new Date().toISOString() },
  { id: 'a5', content: '🚧 本週六 (1/3) 凌晨 02:00 將進行資料庫維護，屆時前台系統將暫停服務。', isOnline: true, createdAt: new Date().toISOString() },
];

const INITIAL_VESTS: Vest[] = [
  { id: 'v1', companyName: '羿鈞', color: '#3b82f6' },
  { id: 'v2', companyName: '長頂', color: '#ef4444' },
  { id: 'v3', companyName: '帆宣', color: '#10b981' },
  { id: 'v4', companyName: '恆康', color: '#f59e0b' },
  { id: 'v5', companyName: '加旺', color: '#8b5cf6' },
];

export const useStore = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ frontPortalPassword: '' });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [vests, setVests] = useState<Vest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [records, setRecords] = useState<CardRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ dbConnection: 'connected', lastSync: new Date().toISOString() });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setUsers(data.users || []);
      setSystemConfig(data.systemConfig || { frontPortalPassword: '' });
      setStaff(data.staff || []);
      setVests(data.vests || []);
      setProjects(data.projects || []);
      setRecords(data.records || []);
      setAnnouncements(data.announcements || []);
    } else {
      bootstrapSystem();
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const dataToSave = { users, systemConfig, staff, vests, projects, records, announcements };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [users, systemConfig, staff, vests, projects, records, announcements, isLoaded]);

  const bootstrapSystem = () => {
    const defaultUser: User = {
      id: 'u-admin',
      username: decodeBase64(BOOTSTRAP_CRED.S_U),
      password: decodeBase64(BOOTSTRAP_CRED.S_P),
      role: Role.SYSOP,
      name: '系統管理員'
    };
    setUsers([defaultUser]);
    setSystemConfig({ frontPortalPassword: decodeBase64(BOOTSTRAP_CRED.F_P) });
    setStaff(INITIAL_STAFF);
    setVests(INITIAL_VESTS);
    setProjects(INITIAL_PROJECTS);
    setRecords(INITIAL_RECORDS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
  };

  const verifyFrontPassword = (pwd: string) => pwd === systemConfig.frontPortalPassword && pwd !== "";
  const verifyBackCredentials = (username: string, password: string): User | null => {
    if (!username || !password) return null;
    return users.find(u => u.username === username && u.password === password) || null;
  };

  const updateFrontPassword = (newPwd: string) => setSystemConfig(p => ({ ...p, frontPortalPassword: newPwd }));
  const addUser = (d: Omit<User, 'id'>) => setUsers([...users, { ...d, id: Math.random().toString(36).substr(2, 9) }]);
  const updateUser = (id: string, d: Partial<User>) => setUsers(users.map(u => u.id === id ? { ...u, ...d } : u));
  const deleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));
  
  const updateStaffOrder = useCallback((newOrder: Staff[]) => setStaff(newOrder.map((s, idx) => ({ ...s, order: idx + 1 }))), []);
  const addStaff = (d: Omit<Staff, 'id' | 'order'>) => setStaff([...staff, { ...d, id: Math.random().toString(36).substr(2, 9), order: staff.length + 1 }]);
  const updateStaff = (id: string, d: Partial<Staff>) => setStaff(staff.map(s => s.id === id ? { ...s, ...d } : s));
  const deleteStaff = (id: string) => setStaff(staff.filter(s => s.id !== id));

  const addVest = (n: string, c: string) => setVests([...vests, { id: Math.random().toString(36).substr(2, 9), companyName: n, color: c }]);
  const updateVest = (id: string, n: string, c: string) => setVests(vests.map(v => v.id === id ? { ...v, companyName: n, color: c } : v));
  const deleteVest = (id: string) => setVests(vests.filter(v => v.id !== id));

  const addProject = (p: Omit<Project, 'id'>) => setProjects([...projects, { ...p, id: Math.random().toString(36).substr(2, 9), isArchived: false }]);
  const updateProject = (id: string, d: Partial<Project>) => setProjects(projects.map(p => p.id === id ? { ...p, ...d } : p));
  const deleteProject = (id: string) => setProjects(projects.filter(p => p.id !== id));

  const addRecord = (r: Omit<CardRecord, 'id' | 'checkedInSupporters'>) => setRecords([...records, { ...r, checkedInSupporters: [], id: Math.random().toString(36).substr(2, 9), isArchived: false }]);
  const updateRecord = (id: string, d: Partial<CardRecord>) => setRecords(records.map(r => r.id === id ? { ...r, ...d } : r));
  const deleteRecord = (id: string) => setRecords(records.filter(r => r.id !== id));
  
  const archiveRecord = (id: string) => {
    const recordToArchive = records.find(r => r.id === id);
    if (!recordToArchive) return;
    setRecords(prev => prev.map(r => r.id === id ? { ...r, isArchived: true } : r));
    setProjects(prev => prev.map(p => p.orderId === recordToArchive.orderId ? { ...p, isArchived: true } : p));
  };

  const toggleCheckIn = (recordId: string, name: string) => {
      setRecords(prev => prev.map(r => {
          if (r.id !== recordId) return r;
          const alreadyIn = r.checkedInSupporters.includes(name);
          return {
              ...r,
              checkedInSupporters: alreadyIn 
                ? r.checkedInSupporters.filter(n => n !== name)
                : [...r.checkedInSupporters, name]
          };
      }));
  };

  const addAnnouncement = (c: string) => setAnnouncements([{ id: Math.random().toString(36).substr(2, 9), content: c, isOnline: true, createdAt: new Date().toISOString() }, ...announcements]);
  const updateAnnouncement = (id: string, c: string) => setAnnouncements(announcements.map(a => a.id === id ? { ...a, content: c } : a));
  const deleteAnnouncement = (id: string) => setAnnouncements(announcements.filter(a => a.id !== id));
  const toggleAnnouncement = (id: string) => setAnnouncements(announcements.map(a => a.id === id ? { ...a, isOnline: !a.isOnline } : a));
  
  const checkDbConnection = async () => {
    setSystemStatus(prev => ({ ...prev, dbConnection: 'connecting' }));
    await new Promise(r => setTimeout(r, 600));
    setSystemStatus({ dbConnection: 'connected', lastSync: new Date().toISOString() });
  };

  const clearAllData = () => {
    setStaff([]); setVests([]); setProjects([]); setRecords([]); setAnnouncements([]); setUsers([]);
    setSystemConfig({ frontPortalPassword: '' });
  };

  const importData = (fullState: any) => {
    if (fullState.staff) setStaff(fullState.staff);
    if (fullState.vests) setVests(fullState.vests);
    if (fullState.projects) setProjects(fullState.projects);
    if (fullState.records) setRecords(fullState.records.map((r:any) => ({...r, checkedInSupporters: r.checkedInSupporters || []})));
    if (fullState.announcements) setAnnouncements(fullState.announcements);
    if (fullState.users) setUsers(fullState.users);
    if (fullState.systemConfig) setSystemConfig(fullState.systemConfig);
  };

  return {
    isLoaded, users, systemConfig, staff, vests, projects, records, announcements, systemStatus,
    verifyFrontPassword, updateFrontPassword, verifyBackCredentials, addUser, updateUser, deleteUser,
    updateStaffOrder, addStaff, updateStaff, deleteStaff,
    addVest, updateVest, deleteVest,
    addProject, updateProject, deleteProject,
    addRecord, updateRecord, deleteRecord, archiveRecord, toggleCheckIn,
    addAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement, checkDbConnection,
    clearAllData, importDemoData: bootstrapSystem, importData
  };
};
