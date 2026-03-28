import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="bg-surface text-on-surface antialiased font-body min-h-screen flex flex-col relative w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
