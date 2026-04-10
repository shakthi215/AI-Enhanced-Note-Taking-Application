import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, FileText, Settings, LogOut, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/notes', icon: <FileText size={18} />, label: 'My Notes' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings' }
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 300);
  };

  const handleNavigate = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar-shell ${isOpen ? 'open' : ''}`} style={styles.sidebar}>
        <button className="sidebar-close btn btn-ghost btn-icon" onClick={onClose} aria-label="Close menu">
          <X size={16} />
        </button>

        <div style={styles.logo}>
          <div style={styles.logoIcon}><Brain size={20} color="#fff" /></div>
          <span style={styles.logoText}>AI Notes</span>
        </div>

        <div style={styles.divider} />

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavigate}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.bottom}>
          <div style={styles.divider} />

          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={styles.themeBtn}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn} disabled={loggingOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    zIndex: 100
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 8px 4px',
    marginBottom: 4
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(139,92,246,0.35)',
    flexShrink: 0
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 17,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '10px 0'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    paddingTop: 4
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
    textDecoration: 'none'
  },
  navItemActive: {
    background: 'rgba(139,92,246,0.12)',
    color: 'var(--accent-bright)',
    borderLeft: '2px solid var(--accent)'
  },
  navIcon: { display: 'flex', alignItems: 'center' },
  navLabel: { flex: 1 },
  bottom: { display: 'flex', flexDirection: 'column', gap: 8 },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    borderRadius: 10,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%'
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    borderRadius: 10,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%'
  }
};
