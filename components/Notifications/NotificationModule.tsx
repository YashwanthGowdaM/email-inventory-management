
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import { notificationService } from '../../services/notificationService';
import { AppGroup } from '../../types';
import { Icon } from '../Shared/Icon';
import { RichTextEditor } from '../Shared/RichTextEditor';

export const NotificationModule: React.FC = () => {
  const [groups, setGroups] = useState<AppGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [toField, setToField] = useState('');
  const [ccField, setCcField] = useState('');
  const [subject, setSubject] = useState(localStorage.getItem('draft_subject') || '');
  const [body, setBody] = useState(localStorage.getItem('draft_body') || '');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    setGroups(db.getGroups());
  }, []);

  // Sync draft to local storage
  useEffect(() => {
    localStorage.setItem('draft_subject', subject);
  }, [subject]);

  useEffect(() => {
    localStorage.setItem('draft_body', body);
  }, [body]);

  // Resolve To/CC whenever selection changes
  useEffect(() => {
    let toEmails: string[] = [];
    let ccEmails: string[] = [];

    const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
    
    selectedGroups.forEach(group => {
      toEmails.push(...group.leadPocEmails, ...group.teamMemberEmails, ...group.groupDlEmails);
      ccEmails.push(...group.dependentGroupDlEmails, ...group.additionalGroupDlEmails);
    });

    // Deduplicate and join with semicolon
    const uniqueTo = Array.from(new Set(toEmails)).join(';');
    const uniqueCc = Array.from(new Set(ccEmails)).join(';');

    setToField(uniqueTo);
    setCcField(uniqueCc);
  }, [selectedGroupIds, groups]);

  const handleSelectAll = () => {
    if (selectedGroupIds.length === groups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(groups.map(g => g.id));
    }
  };

  const toggleGroup = (id: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the subject and body?')) {
      setSubject('');
      setBody('');
      setStatus(null);
    }
  };

  const handleSend = async () => {
    if (!toField && !ccField) {
      setStatus({ type: 'error', message: 'At least one recipient (To or CC) is required.' });
      return;
    }
    if (!subject.trim()) {
      setStatus({ type: 'error', message: 'Email subject is required.' });
      return;
    }

    setIsSending(true);
    setStatus(null);
    
    try {
      await notificationService.send({
        to: toField,
        cc: ccField,
        subject,
        body,
        selectedGroupIds
      });
      setStatus({ type: 'success', message: 'Notification sent successfully!' });
      // We do NOT clear subject/body on success as per requirement to persist until reset
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Send Notification</h1>
          <p className="text-slate-500">Dispatch alerts to resolved distribution lists from your inventory.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <Icon name="RefreshCw" size={18} />
            Reset Content
          </button>
          <button 
            disabled={isSending}
            onClick={handleSend}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {isSending ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Send" size={18} />}
            {isSending ? 'Sending...' : 'Send Now'}
          </button>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          <Icon name={status.type === 'success' ? 'CheckCircle' : 'AlertTriangle'} size={20} />
          <span className="font-medium">{status.message}</span>
          <button onClick={() => setStatus(null)} className="ml-auto p-1 hover:bg-black/5 rounded-md">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Icon name="Users" size={18} className="text-indigo-500" />
                Select App Groups
              </h2>
              <button 
                onClick={handleSelectAll}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase"
              >
                {selectedGroupIds.length === groups.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {groups.map(group => (
                <label key={group.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedGroupIds.includes(group.id) ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                    checked={selectedGroupIds.includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${selectedGroupIds.includes(group.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{group.appGroupName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {(group.leadPocEmails.length + group.teamMemberEmails.length + group.groupDlEmails.length)} To • {(group.dependentGroupDlEmails.length + group.additionalGroupDlEmails.length)} Cc
                    </p>
                  </div>
                </label>
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-slate-400 italic py-4 text-center">No inventory found.</p>
              )}
            </div>
          </section>

          <section className="bg-slate-100 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Icon name="Mail" size={18} className="text-indigo-500" />
              Recipients Resolution
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">To (Deduplicated)</label>
                <textarea 
                  value={toField}
                  onChange={(e) => setToField(e.target.value)}
                  placeholder="Lead POCs, Team, Group DLs..."
                  className="w-full h-24 p-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Cc (Deduplicated)</label>
                <textarea 
                  value={ccField}
                  onChange={(e) => setCcField(e.target.value)}
                  placeholder="Dependent DLs, Additional DLs..."
                  className="w-full h-24 p-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none shadow-inner"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter notification subject line"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Body</label>
              <RichTextEditor value={body} onChange={setBody} />
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-400">
                <Icon name="Info" size={14} className="inline mr-1 mb-0.5" />
                Content persists automatically until Reset is clicked.
              </p>
              <div className="flex gap-4">
                <button 
                  disabled={isSending}
                  onClick={handleSend}
                  className="px-10 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 transform active:scale-95 disabled:opacity-50"
                >
                  {isSending ? <Icon name="Loader2" size={20} className="animate-spin" /> : <Icon name="Send" size={20} />}
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
