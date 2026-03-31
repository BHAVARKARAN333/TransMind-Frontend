import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/app/dashboard' },
    { name: 'Upload', icon: 'cloud_upload', path: '/app/upload' },
    { name: 'Source Validator', icon: 'spellcheck', path: '/app/source-validator' },
    { name: 'Translation Editor', icon: 'translate', path: '/app/editor' },
    { name: 'Similarity Engine', icon: 'hub', path: '/app/similarity' },
    { name: 'Glossary', icon: 'menu_book', path: '/app/glossary' },
    { name: 'Analytics', icon: 'insights', path: '/app/analytics' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-[60] sidebar-glass flex flex-col py-6 font-['Inter'] antialiased text-sm font-medium tracking-tight">
      {/* Logo */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">TransMind</h1>
            <p className="text-blue-300/40 text-[9px] uppercase tracking-[0.2em] font-semibold">AI Studio</p>
          </div>
        </div>
      </div>

      {/* Nav Label */}
      <p className="px-6 text-[9px] uppercase tracking-[0.2em] text-blue-200/20 font-bold mb-3">Navigation</p>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `nav-glow ripple px-4 py-2.5 flex items-center gap-3 rounded-xl text-[13px] ${
                isActive
                  ? 'active text-white font-semibold'
                  : 'text-blue-100/50 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span 
                  className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-blue-300/40'}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-3 space-y-0.5 pt-4 border-t border-white/5 mx-3 mb-4">
        <a href="#" className="nav-glow text-blue-100/40 hover:text-white px-4 py-2.5 flex items-center gap-3 rounded-xl text-[13px]">
          <span className="material-symbols-outlined text-[20px] text-blue-300/30">settings</span>
          <span>Settings</span>
        </a>
      </div>

      {/* User Profile Component */}
      <div className="mx-5 p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 group relative">
        <div className="flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" className="w-9 h-9 rounded-full border border-white/20" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold border border-blue-500/30">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-white truncate w-full">
              {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'User')}
            </h4>
            <p className="text-[9px] text-blue-200/50 truncate w-full">{currentUser?.email || 'Premium Plan'}</p>
          </div>
        </div>
        
        {/* Hover Logout Overlay */}
        <button 
          onClick={handleLogout}
          className="absolute inset-0 bg-red-500/90 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-white text-[18px]">logout</span>
          <span className="text-white font-bold text-xs">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
