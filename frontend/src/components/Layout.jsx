import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  User, 
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (isAdmin) {
    menuItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <CheckSquare size={32} />
            <span>TaskMaster</span>
          </div>
          <button 
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">
                <span className={`badge badge-${user?.role === 'admin' ? 'danger' : user?.role === 'premium' ? 'warning' : 'primary'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="top-bar-content">
            <h1>TaskMaster</h1>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>

      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
