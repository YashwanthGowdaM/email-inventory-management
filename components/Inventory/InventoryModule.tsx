
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import { AppGroup } from '../../types';
import { Icon } from '../Shared/Icon';
import { EmailChips } from '../Shared/EmailChips';

export const InventoryModule: React.FC = () => {
  const [groups, setGroups] = useState<AppGroup[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AppGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Form State
  const [formData, setFormData] = useState<Omit<AppGroup, 'id' | 'createdAt'>>({
    appGroupName: '',
    leadPocEmails: [],
    teamMemberEmails: [],
    groupDlEmails: [],
    dependentGroupDlEmails: [],
    additionalGroupDlEmails: [],
  });

  useEffect(() => {
    setGroups(db.getGroups());
  }, []);

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase();
    return groups.filter(g => 
      g.appGroupName.toLowerCase().includes(q) ||
      g.leadPocEmails.some(e => e.toLowerCase().includes(q)) ||
      g.teamMemberEmails.some(e => e.toLowerCase().includes(q)) ||
      g.groupDlEmails.some(e => e.toLowerCase().includes(q)) ||
      g.dependentGroupDlEmails.some(e => e.toLowerCase().includes(q)) ||
      g.additionalGroupDlEmails.some(e => e.toLowerCase().includes(q))
    );
  }, [groups, search]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
  };

  const handleOpenModal = (group?: AppGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        appGroupName: group.appGroupName,
        leadPocEmails: group.leadPocEmails,
        teamMemberEmails: group.teamMemberEmails,
        groupDlEmails: group.groupDlEmails,
        dependentGroupDlEmails: group.dependentGroupDlEmails,
        additionalGroupDlEmails: group.additionalGroupDlEmails,
      });
    } else {
      setEditingGroup(null);
      setFormData({
        appGroupName: '',
        leadPocEmails: [],
        teamMemberEmails: [],
        groupDlEmails: [],
        dependentGroupDlEmails: [],
        additionalGroupDlEmails: [],
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appGroupName.trim()) {
      setError('App Group Name is required');
      return;
    }

    try {
      if (editingGroup) {
        await db.updateGroup(editingGroup.id, formData);
      } else {
        await db.createGroup(formData);
      }
      setGroups(db.getGroups());
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      await db.deleteGroup(id);
      setGroups(db.getGroups());
    }
  };

  const handleCopyVisible = () => {
    const allEmails = filteredGroups.flatMap(g => [
      ...g.leadPocEmails,
      ...g.teamMemberEmails,
      ...g.groupDlEmails,
      ...g.dependentGroupDlEmails,
      ...g.additionalGroupDlEmails
    ]);
    const uniqueEmails = Array.from(new Set(allEmails)).join(';');
    navigator.clipboard.writeText(uniqueEmails);
    showToast("All visible email IDs copied!");
  };

  const handleCopyGroupEmails = (group: AppGroup) => {
    const groupEmails = [
      ...group.leadPocEmails,
      ...group.teamMemberEmails,
      ...group.groupDlEmails,
      ...group.dependentGroupDlEmails,
      ...group.additionalGroupDlEmails
    ];
    const uniqueEmails = Array.from(new Set(groupEmails)).join(';');
    navigator.clipboard.writeText(uniqueEmails);
    showToast(`${group.appGroupName} email IDs copied!`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Email Inventory</h1>
          <p className="text-slate-500">Manage application groups and their respective distribution lists.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyVisible}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
          >
            <Icon name="Copy" size={18} />
            Copy All Visible
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            <Icon name="Plus" size={18} />
            Add App Group
          </button>
        </div>
      </div>

      <div className="relative">
        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Global search by group name or any email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? filteredGroups.map(group => (
          <div key={group.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800 truncate pr-2">{group.appGroupName}</h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopyGroupEmails(group)} 
                  title="Copy group email IDs"
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Icon name="Copy" size={16} />
                </button>
                <button 
                  onClick={() => handleOpenModal(group)} 
                  title="Edit group"
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Icon name="Edit2" size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(group.id)} 
                  title="Delete group"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Lead / POCs</span>
                <div className="flex flex-wrap gap-1">
                  {group.leadPocEmails.length > 0 ? group.leadPocEmails.map(e => (
                    <span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{e}</span>
                  )) : <span className="text-slate-300 italic">None</span>}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Group DLs</span>
                <div className="flex flex-wrap gap-1">
                  {group.groupDlEmails.length > 0 ? group.groupDlEmails.map(e => (
                    <span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{e}</span>
                  )) : <span className="text-slate-300 italic">None</span>}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <Icon name="FolderOpen" size={48} className="mb-4 text-slate-200" />
            <p className="text-lg font-medium">No app groups found</p>
            <p className="text-sm">Try adjusting your search or add a new group.</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <Icon name="Check" size={18} className="text-emerald-400" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingGroup ? 'Edit App Group' : 'New App Group'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                <Icon name="X" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                  <Icon name="AlertCircle" size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">App Group Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.appGroupName}
                  onChange={(e) => setFormData({...formData, appGroupName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter unique application group name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmailChips 
                  label="Lead / POC Emails" 
                  emails={formData.leadPocEmails} 
                  onChange={(emails) => setFormData({...formData, leadPocEmails: emails})} 
                  placeholder="Add email..."
                />
                <EmailChips 
                  label="Team Member Emails" 
                  emails={formData.teamMemberEmails} 
                  onChange={(emails) => setFormData({...formData, teamMemberEmails: emails})} 
                  placeholder="Add email..."
                />
                <EmailChips 
                  label="Group DLs" 
                  emails={formData.groupDlEmails} 
                  onChange={(emails) => setFormData({...formData, groupDlEmails: emails})} 
                  placeholder="Add email..."
                />
                <EmailChips 
                  label="Dependent Group DLs" 
                  emails={formData.dependentGroupDlEmails} 
                  onChange={(emails) => setFormData({...formData, dependentGroupDlEmails: emails})} 
                  placeholder="Add email..."
                />
                <EmailChips 
                  label="Additional Group DLs" 
                  emails={formData.additionalGroupDlEmails} 
                  onChange={(emails) => setFormData({...formData, additionalGroupDlEmails: emails})} 
                  placeholder="Add email..."
                  className="md:col-span-2"
                />
              </div>
            </form>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200"
              >
                {editingGroup ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
