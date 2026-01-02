
export enum Role {
  GUEST = 'guest',
  ADMIN = 'admin',
  SYSOP = 'sysop'
}

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  password?: string;
}

export interface CardRecord {
  id: string;
  orderId: string;
  factory: string;
  openers: string[]; 
  supporters: string[];
  checkedInSupporters: string[]; // 新增：已確認靠卡的人員名單
  date: string;
  time: string;
  vest: string; 
  isArchived?: boolean; 
}

export interface Project {
  id: string;
  orderId: string;
  factory: string;
  date: string;
  time: string;
  vest: string; 
  isArchived?: boolean; 
}

export interface Staff {
  id: string;
  name: string;
  isSupervisor: boolean; 
  note?: string;
  order: number;
}

export interface Vest {
  id: string;
  companyName: string;
  color: string;
}

export interface Announcement {
  id: string;
  content: string;
  isOnline: boolean;
  createdAt: string;
}

export type ViewMode = 'card' | 'list';

export interface SystemStatus {
  dbConnection: 'connected' | 'disconnected' | 'connecting';
  lastSync: string;
}

export interface SystemConfig {
  frontPortalPassword: string;
}
