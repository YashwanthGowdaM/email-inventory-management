
import { AppGroup } from '../types';

const STORAGE_KEY = 'notifyhub_app_groups';

export const db = {
  getGroups: (): AppGroup[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveGroups: (groups: AppGroup[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  },

  createGroup: async (group: Omit<AppGroup, 'id' | 'createdAt'>): Promise<AppGroup> => {
    const groups = db.getGroups();
    
    // Check uniqueness
    if (groups.some(g => g.appGroupName.toLowerCase() === group.appGroupName.toLowerCase())) {
      throw new Error(`App Group Name "${group.appGroupName}" already exists.`);
    }

    const newGroup: AppGroup = {
      ...group,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };

    groups.push(newGroup);
    db.saveGroups(groups);
    return newGroup;
  },

  updateGroup: async (id: string, updates: Partial<AppGroup>): Promise<AppGroup> => {
    const groups = db.getGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Group not found');

    // Check uniqueness if name is changing
    if (updates.appGroupName && updates.appGroupName !== groups[index].appGroupName) {
      if (groups.some(g => g.appGroupName.toLowerCase() === updates.appGroupName?.toLowerCase())) {
        throw new Error(`App Group Name "${updates.appGroupName}" already exists.`);
      }
    }

    const updatedGroup = { ...groups[index], ...updates };
    groups[index] = updatedGroup;
    db.saveGroups(groups);
    return updatedGroup;
  },

  deleteGroup: async (id: string): Promise<void> => {
    const groups = db.getGroups();
    const filtered = groups.filter(g => g.id !== id);
    db.saveGroups(filtered);
  }
};
