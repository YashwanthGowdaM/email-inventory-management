
import React, { useState } from 'react';
import { InventoryModule } from './components/Inventory/InventoryModule';
import { NotificationModule } from './components/Notifications/NotificationModule';
import { Icon } from './components/Shared/Icon';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('inventory');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Icon name="Zap" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">NotifyHub</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Enterprise Registry</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setCurrentView('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all group ${currentView === 'inventory' ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icon name="Database" size={20} className={currentView === 'inventory' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            Email Inventory
          </button>
          <button 
            onClick={() => setCurrentView('notification')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all group ${currentView === 'notification' ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icon name="Send" size={20} className={currentView === 'notification' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            Send Notification
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Access</p>
            <div className="flex items-center gap-3">
              <img src="https://picsum.photos/40/40" alt="Avatar" className="w-8 h-8 rounded-full" />
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">Senior Engineer</p>
                <p className="text-[10px] text-slate-400 truncate">eng-ops@org.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {currentView === 'inventory' ? (
            <InventoryModule />
          ) : (
            <NotificationModule />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
