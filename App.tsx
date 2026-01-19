
import React from 'react';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Side Navigation */}
      <nav className="w-full md:w-64 bg-[#080808] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-bolt text-xs text-white"></i>
            </div>
            <span className="font-bold tracking-tight text-lg">AGENT<span className="text-emerald-500">BEATS</span></span>
          </div>
        </div>
        
        <div className="flex-grow p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Navigation</div>
          <NavItem icon="fa-chart-pie" label="Dashboard" active />
          <NavItem icon="fa-microchip" label="Quantum Modules" />
          <NavItem icon="fa-leaf" label="Green Metrics" />
          <NavItem icon="fa-language" label="Multilingual Bench" />
          
          <div className="pt-8 px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Infrastructure</div>
          <NavItem icon="fa-network-wired" label="QL-Graph Prov" />
          <NavItem icon="fa-shield-halved" label="Error Correction" />
          <NavItem icon="fa-database" label="Dataset Explorer" />
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 overflow-hidden">
               <img src="https://picsum.photos/100/100" alt="Avatar" />
            </div>
            <div>
              <p className="text-xs font-bold">Research_Node</p>
              <p className="text-[10px] text-emerald-500 font-mono">ID: GA-X7</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto bg-[#0a0a0a]">
        <Dashboard />
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <button className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
    active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
  }`}>
    <i className={`fa-solid ${icon} w-5 text-center`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

export default App;
