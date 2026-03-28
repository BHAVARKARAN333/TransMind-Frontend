import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/' },
    { name: 'Upload', icon: 'upload_file', path: '/upload' },
    { name: 'Source Validator', icon: 'spellcheck', path: '/source-validator' },
    { name: 'Translation Editor', icon: 'edit', path: '/editor' },
    { name: 'Similarity Engine', icon: 'troubleshoot', path: '/similarity' },
    { name: 'Glossary', icon: 'menu_book', path: '/glossary' },
    { name: 'Analytics', icon: 'leaderboard', path: '/analytics' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-[60] bg-[#1e3a5f] flex flex-col py-6 shadow-xl font-['Inter'] antialiased text-sm font-medium tracking-tight">
      <div className="px-6 mb-10">
        <h1 className="text-xl font-bold tracking-tighter text-white">TransMind AI</h1>
        <p className="text-blue-200/60 text-[10px] uppercase tracking-widest mt-1">Clinical Precision</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `mx-2 my-1 px-4 py-2 transition-all flex items-center gap-3 rounded-lg ${
                isActive
                  ? 'bg-[#1a56db] text-white scale-[0.98]'
                  : 'text-blue-100/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span 
                  className={`material-symbols-outlined text-lg ${isActive ? 'text-white' : ''}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-2 space-y-1 pt-4 border-t border-white/10 mx-4">
        <a href="#" className="text-blue-100/70 hover:text-white my-1 px-4 py-2 transition-colors flex items-center gap-3 hover:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined text-lg">settings</span>
          <span>Settings</span>
        </a>
        <a href="#" className="text-blue-100/70 hover:text-white my-1 px-4 py-2 transition-colors flex items-center gap-3 hover:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Help Center</span>
        </a>
        <a href="#" className="text-blue-100/70 hover:text-white my-1 px-4 py-2 transition-colors flex items-center gap-3 hover:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Log Out</span>
        </a>
      </div>
    </aside>
  );
}
