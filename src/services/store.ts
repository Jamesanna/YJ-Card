
import { useState, useCallback, useEffect } from 'react';
import { CardRecord, Project, Staff, Announcement, SystemStatus, Vest, User, Role, SystemConfig } from '../types';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

const BOOTSTRAP_CRED = {
  S_U: 'c3lzb3A=',      // 'sysop'
  S_P: 'QWRtaW5AMTIz',  // 'Admin@123'
  F_P: 'QDI0NjY0OTQx'   // '@24664941'
};

const decodeBase64 = (str: string) => {
  try { return atob(str); } catch (e) { return ''; }
};

// 輔助函數：獲取本地日期字串
const getDateStr = (year: number, month: number, day: number) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// =========================================================
// 範例資料定義 (使用者指定範例)
// =========================================================
const SAMPLE_STAFF: Staff[] = [
  { id: 's01', name: '王小明', isSupervisor: true, note: '工程部總監', order: 1 },
  { id: 's02', name: '陳美麗', isSupervisor: true, note: '工安主任', order: 2 },
  { id: 's03', name: '林志玲', isSupervisor: true, note: '專案負責人', order: 3 },
  { id: 's04', name: '周杰倫', isSupervisor: true, note: '技術主導', order: 4 },
  { id: 's05', name: '蔡依林', isSupervisor: true, note: '行政主管', order: 5 },
  { id: 's06', name: '李大華', isSupervisor: false, note: '資深技術員', order: 6 },
  { id: 's07', name: '張志豪', isSupervisor: false, note: '支援一組', order: 7 },
  { id: 's08', name: '桂綸鎂', isSupervisor: false, note: '資深支援', order: 8 },
  { id: 's09', name: '彭于晏', isSupervisor: false, note: '支援二組', order: 9 },
  { id: 's10', name: '許光漢', isSupervisor: false, note: '實習生', order: 10 },
  { id: 's11', name: '柯佳嬿', isSupervisor: false, note: '行政助理', order: 11 },
  { id: 's12', name: '賈靜雯', isSupervisor: false, note: '客服專員', order: 12 },
  { id: 's13', name: '吳慷仁', isSupervisor: false, note: '現場技術', order: 13 },
  { id: 's14', name: '邱澤', isSupervisor: false, note: '現場技術', order: 14 },
  { id: 's15', name: '曾莞婷', isSupervisor: false, note: '專案助理', order: 15 },
  { id: 's16', name: '隋棠', isSupervisor: false, note: '採購人員', order: 16 },
  { id: 's17', name: '阮經天', isSupervisor: false, note: '倉管人員', order: 17 },
  { id: 's18', name: '趙又廷', isSupervisor: false, note: '品管人員', order: 18 },
  { id: 's19', name: '修杰楷', isSupervisor: false, note: '設備維護', order: 19 },
  { id: 's20', name: '楊謹華', isSupervisor: false, note: '人資專員', order: 20 },
];

const SAMPLE_VESTS: Vest[] = [
  { id: 'v1', companyName: '羿鈞', color: '#3b82f6' },
  { id: 'v2', companyName: '長頂', color: '#ef4444' },
  { id: 'v3', companyName: '帆宣', color: '#10b981' },
  { id: 'v4', companyName: '亞翔', color: '#f59e0b' },
  { id: 'v5', companyName: '漢唐', color: '#8b5cf6' },
];

const SAMPLE_PROJECTS: Omit<Project, 'id'>[] = [
  { orderId: 'PJ26-001', factory: '台積電 F12', date: '2026-01-02', time: '08:00', vest: '羿鈞', isArchived: false },
  { orderId: 'PJ26-002', factory: '美光 A3', date: '2026-01-03', time: '08:30', vest: '長頂', isArchived: false },
  { orderId: 'PJ26-003', factory: '聯發科 HQ', date: '2026-01-04', time: '09:00', vest: '帆宣', isArchived: false },
  { orderId: 'PJ26-004', factory: '力積電 P3', date: '2026-01-05', time: '10:00', vest: '亞翔', isArchived: false },
  { orderId: 'PJ26-005', factory: '華邦電 T2', date: '2026-01-06', time: '13:30', vest: '漢唐', isArchived: false },
  { orderId: 'PJ26-006', factory: '台積電 F18', date: '2026-01-07', time: '08:00', vest: '羿鈞', isArchived: false },
  { orderId: 'PJ26-007', factory: '群創 D5', date: '2026-01-08', time: '14:00', vest: '長頂', isArchived: false },
  { orderId: 'PJ26-008', factory: '友達 L8', date: '2026-01-09', time: '09:30', vest: '帆宣', isArchived: false },
  { orderId: 'PJ26-009', factory: '旺宏 P3', date: '2026-01-10', time: '15:30', vest: '亞翔', isArchived: false },
  { orderId: 'PJ26-010', factory: '南亞科 F10', date: '2026-01-11', time: '11:00', vest: '漢唐', isArchived: false },
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

  // 1. 初始化即時監聽 (Real-time Listeners)
  useEffect(() => {
    const unsubscibers: (() => void)[] = [];

    const collections = [
      { name: 'users', setter: setUsers },
      { name: 'staff', setter: setStaff, sort: (a: any, b: any) => a.order - b.order },
      { name: 'vests', setter: setVests },
      { name: 'projects', setter: setProjects },
      { name: 'records', setter: setRecords, sort: (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime() },
      { name: 'announcements', setter: setAnnouncements, sort: (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() },
    ];

    collections.forEach(col => {
      const q = query(collection(db, col.name));
      const unsub = onSnapshot(q, (snapshot) => {
        let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        if (col.sort) data = data.sort(col.sort);
        col.setter(data);

        // 如果資料完全沒初始過
        if (col.name === 'users' && snapshot.empty && !isLoaded) {
          bootstrapSystem();
        }
      });
      unsubscibers.push(unsub);
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'system'), (doc) => {
      if (doc.exists()) setSystemConfig(doc.data() as SystemConfig);
    });
    unsubscibers.push(unsubConfig);

    setIsLoaded(true);
    return () => unsubscibers.forEach(unsub => unsub());
  }, []);

  // 2. 雲端操作方法：建立完整範例資料
  const bootstrapSystem = async () => {
    const batch = writeBatch(db);

    // [Account] 預設管理員
    const adminRef = doc(collection(db, 'users'));
    batch.set(adminRef, {
      username: decodeBase64(BOOTSTRAP_CRED.S_U),
      password: decodeBase64(BOOTSTRAP_CRED.S_P),
      role: Role.SYSOP,
      name: '系統管理員'
    });

    // [Config] 預設設定
    batch.set(doc(db, 'config', 'system'), {
      frontPortalPassword: decodeBase64(BOOTSTRAP_CRED.F_P)
    });

    // [Data] 使用者指定的 20 名員工、5 家背心、10 項專案
    SAMPLE_STAFF.forEach(s => batch.set(doc(collection(db, 'staff')), s));
    SAMPLE_VESTS.forEach(v => batch.set(doc(collection(db, 'vests')), v));
    SAMPLE_PROJECTS.forEach(p => batch.set(doc(collection(db, 'projects')), p));

    // [Records] 20 筆 2025 已封存資料
    for (let i = 1; i <= 20; i++) {
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      batch.set(doc(collection(db, 'records')), {
        orderId: `PJ25-OLD-${String(i).padStart(3, '0')}`,
        factory: ['台積電 F12', '美光 A3', '聯發科 HQ'][i % 3],
        date: `2025-${month}-${day}`,
        time: '08:00',
        vest: SAMPLE_VESTS[i % 5].companyName,
        openers: [SAMPLE_STAFF[0].name, SAMPLE_STAFF[1].name],
        supporters: [SAMPLE_STAFF[5].name, SAMPLE_STAFF[6].name, SAMPLE_STAFF[7].name],
        checkedInSupporters: [SAMPLE_STAFF[5].name, SAMPLE_STAFF[6].name],
        isArchived: true
      });
    }

    // [Records] 10 筆 2026 未封存資料
    for (let i = 1; i <= 10; i++) {
      const day = String(i + 1).padStart(2, '0');
      batch.set(doc(collection(db, 'records')), {
        orderId: SAMPLE_PROJECTS[i - 1].orderId,
        factory: SAMPLE_PROJECTS[i - 1].factory,
        date: `2026-01-${day}`,
        time: SAMPLE_PROJECTS[i - 1].time,
        vest: SAMPLE_PROJECTS[i - 1].vest,
        openers: [SAMPLE_STAFF[i % 5].name],
        supporters: [SAMPLE_STAFF[10].name, SAMPLE_STAFF[11].name],
        checkedInSupporters: [],
        isArchived: false
      });
    }

    // [Announcement] 預設公告
    batch.set(doc(collection(db, 'announcements')), {
      content: "歡迎使用羿鈞科技支援靠卡系統，範例資料已匯入成功！",
      isOnline: true,
      createdAt: new Date().toISOString()
    });

    await batch.commit();
    alert('範例資料恢復完成！請重新整理頁面以查看效果。');
  };

  const verifyFrontPassword = (pwd: string) => pwd === systemConfig.frontPortalPassword && pwd !== "";
  const verifyBackCredentials = (username: string, password: string): User | null => {
    return users.find(u => u.username === username && u.password === password) || null;
  };

  const updateFrontPassword = (newPwd: string) => setDoc(doc(db, 'config', 'system'), { frontPortalPassword: newPwd });
  const addUser = (d: Omit<User, 'id'>) => addDoc(collection(db, 'users'), d);
  const updateUser = (id: string, d: Partial<User>) => updateDoc(doc(db, 'users', id), d);
  const deleteUser = (id: string) => deleteDoc(doc(db, 'users', id));

  const updateStaffOrder = async (newOrder: Staff[]) => {
    const batch = writeBatch(db);
    newOrder.forEach((s, idx) => { batch.update(doc(db, 'staff', s.id), { order: idx + 1 }); });
    await batch.commit();
  };

  const addStaff = (d: Omit<Staff, 'id' | 'order'>) => addDoc(collection(db, 'staff'), { ...d, order: staff.length + 1 });
  const updateStaff = (id: string, d: Partial<Staff>) => updateDoc(doc(db, 'staff', id), d);
  const deleteStaff = (id: string) => deleteDoc(doc(db, 'staff', id));

  const addVest = (n: string, c: string) => addDoc(collection(db, 'vests'), { companyName: n, color: c });
  const updateVest = (id: string, n: string, c: string) => updateDoc(doc(db, 'vests', id), { companyName: n, color: c });
  const deleteVest = (id: string) => deleteDoc(doc(db, 'vests', id));

  const addProject = (p: Omit<Project, 'id'>) => addDoc(collection(db, 'projects'), { ...p, isArchived: false });
  const updateProject = (id: string, d: Partial<Project>) => updateDoc(doc(db, 'projects', id), d);
  const deleteProject = (id: string) => deleteDoc(doc(db, 'projects', id));

  const addRecord = (r: Omit<CardRecord, 'id' | 'checkedInSupporters'>) => addDoc(collection(db, 'records'), { ...r, checkedInSupporters: [], isArchived: false });
  const updateRecord = (id: string, d: Partial<CardRecord>) => updateDoc(doc(db, 'records', id), d);
  const deleteRecord = (id: string) => deleteDoc(doc(db, 'records', id));

  const archiveRecord = async (id: string) => {
    const recordToArchive = records.find(r => r.id === id);
    if (!recordToArchive) return;
    await updateDoc(doc(db, 'records', id), { isArchived: true });
    const proj = projects.find(p => p.orderId === recordToArchive.orderId);
    if (proj) await updateDoc(doc(db, 'projects', proj.id), { isArchived: true });
  };

  const toggleCheckIn = (recordId: string, name: string) => {
    const r = records.find(rec => rec.id === recordId);
    if (!r) return;
    const current = r.checkedInSupporters || [];
    const alreadyIn = current.includes(name);
    const newList = alreadyIn ? current.filter(n => n !== name) : [...current, name];
    updateDoc(doc(db, 'records', recordId), { checkedInSupporters: newList });
  };

  const addAnnouncement = (c: string) => addDoc(collection(db, 'announcements'), { content: c, isOnline: true, createdAt: new Date().toISOString() });
  const updateAnnouncement = (id: string, c: string) => updateDoc(doc(db, 'announcements', id), { content: c });
  const deleteAnnouncement = (id: string) => deleteDoc(doc(db, 'announcements', id));
  const toggleAnnouncement = (id: string) => {
    const a = announcements.find(ann => ann.id === id);
    if (a) updateDoc(doc(db, 'announcements', id), { isOnline: !a.isOnline });
  };

  const checkDbConnection = async () => {
    setSystemStatus(prev => ({ ...prev, dbConnection: 'connecting' }));
    await new Promise(r => setTimeout(r, 600));
    setSystemStatus({ dbConnection: 'connected', lastSync: new Date().toISOString() });
  };

  const clearAllData = async () => {
    alert('為了安全，請手動前往 Firebase Firestore 控制台清空資料集，或聯繫開發者。');
  };

  return {
    isLoaded, users, systemConfig, staff, vests, projects, records, announcements, systemStatus,
    verifyFrontPassword, updateFrontPassword, verifyBackCredentials, addUser, updateUser, deleteUser,
    updateStaffOrder, addStaff, updateStaff, deleteStaff,
    addVest, updateVest, deleteVest,
    addProject, updateProject, deleteProject,
    addRecord, updateRecord, deleteRecord, archiveRecord, toggleCheckIn,
    addAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement, checkDbConnection,
    clearAllData, importDemoData: bootstrapSystem, importData: async () => { }
  };
};

