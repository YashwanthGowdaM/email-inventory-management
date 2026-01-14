
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
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
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
    showToast("email id's copied");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Email Inventory</h1>
          <p className="text-slate-500">Manage application groups and their respective distribution lists.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Note: Global "Copy All Visible" removed per requirement "copy option is not for globally" */}
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
        <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by group name or specific email address..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? filteredGroups.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative">
            <div className="flex justify-between items-start mb-5">
              <h3 className="font-bold text-lg text-slate-800 truncate pr-2 group-hover:text-indigo-600 transition-colors">{group.appGroupName}</h3>
              <div className="flex gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopyGroupEmails(group)} 
                  title="Copy group email IDs"
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Icon name="Copy" size={18} />
                </button>
                <button 
                  onClick={() => handleOpenModal(group)} 
                  title="Edit group"
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                >
                  <Icon name="Edit3" size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(group.id)} 
                  title="Delete group"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Icon name="Trash2" size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Main Recipients (To)</span>
                <div className="flex flex-wrap gap-1.5">
                  {[...group.leadPocEmails, ...group.teamMemberEmails, ...group.groupDlEmails].slice(0, 3).map(e => (
                    <span key={e} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs border border-slate-100">{e}</span>
                  ))}
                  {([...group.leadPocEmails, ...group.teamMemberEmails, ...group.groupDlEmails].length > 3) && (
                    <span className="text-xs text-slate-400 font-medium py-1">+{([...group.leadPocEmails, ...group.teamMemberEmails, ...group.groupDlEmails].length - 3)} more</span>
                  )}
                  {([...group.leadPocEmails, ...group.teamMemberEmails, ...group.groupDlEmails].length === 0) && (
                    <span className="text-slate-300 italic text-xs">No active DLs</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Carbon Copy (Cc)</span>
                <div className="flex flex-wrap gap-1.5">
                  {[...group.dependentGroupDlEmails, ...group.additionalGroupDlEmails].slice(0, 2).map(e => (
                    <span key={e} className="px-2.5 py-1 bg-indigo-50/50 text-indigo-600 rounded-lg text-xs border border-indigo-100/50">{e}</span>
                  ))}
                  {([...group.dependentGroupDlEmails, ...group.additionalGroupDlEmails].length > 2) && (
                    <span className="text-xs text-indigo-400 font-medium py-1">+{([...group.dependentGroupDlEmails, ...group.additionalGroupDlEmails].length - 2)} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="SearchX" size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-600">No results found</p>
            <p className="text-sm">We couldn't find any groups matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <div className="bg-emerald-500 rounded-full p-1">
              <Icon name="Check" size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingGroup ? 'Edit Group' : 'New Group'}</h2>
                <p className="text-sm text-slate-500">Configure application specific distribution lists.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm border border-slate-100">
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in shake duration-300">
                  <Icon name="AlertCircle" size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Application Group Name</label>
                <input 
                  type="text" 
                  value={formData.appGroupName}
                  onChange={(e) => setFormData({...formData, appGroupName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold"
                  placeholder="e.g. CORE-BANKING-SVC"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EmailChips 
                  label="Lead / POC Emails" 
                  emails={formData.leadPocEmails} 
                  onChange={(emails) => setFormData({...formData, leadPocEmails: emails})} 
                  placeholder="name@org.com"
                />
                <EmailChips 
                  label="Team Member Emails" 
                  emails={formData.teamMemberEmails} 
                  onChange={(emails) => setFormData({...formData, teamMemberEmails: emails})} 
                  placeholder="name@org.com"
                />
                <EmailChips 
                  label="Group DLs" 
                  emails={formData.groupDlEmails} 
                  onChange={(emails) => setFormData({...formData, groupDlEmails: emails})} 
                  placeholder="dl-group@org.com"
                />
                <EmailChips 
                  label="Dependent Group DLs" 
                  emails={formData.dependentGroupDlEmails} 
                  onChange={(emails) => setFormData({...formData, dependentGroupDlEmails: emails})} 
                  placeholder="dl-dep@org.com"
                />
                <EmailChips 
                  label="Additional Group DLs" 
                  emails={formData.additionalGroupDlEmails} 
                  onChange={(emails) => setFormData({...formData, additionalGroupDlEmails: emails})} 
                  placeholder="dl-external@org.com"
                  className="md:col-span-2"
                />
              </div>
            </form>

            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3.5 text-slate-600 font-bold hover:bg-slate-200 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-10 py-3.5 bg-slate-900 text-white font-black hover:bg-black rounded-2xl transition-all shadow-xl shadow-slate-200"
              >
                {editingGroup ? 'Update Inventory' : 'Save to Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
