import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Brain, Bot, Save, SunMoon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function SettingsPage() {
  const { user, updateUser, setTheme } = useAuth();
  const [prefs, setPrefs] = useState({
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'en',
    aiTone: user?.preferences?.aiTone || 'professional'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updatePreferences(prefs);
      updateUser({ preferences: prefs });
      setTheme(prefs.theme);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.sub}>Customize your AI Notes experience</p>
      </div>

      <div style={styles.sections}>
        <section className="card">
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}><User size={18} color="#8b5cf6" /></div>
            <div>
              <h3 style={styles.sectionTitle}>Profile</h3>
              <p style={styles.sectionDesc}>Your account information</p>
            </div>
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.profileName}>{user?.name}</div>
              <div style={styles.profileEmail}>{user?.email}</div>
            </div>
          </div>
        </section>

        <section className="card">
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}><SunMoon size={18} color="#8b5cf6" /></div>
            <div>
              <h3 style={styles.sectionTitle}>Appearance</h3>
              <p style={styles.sectionDesc}>Light is the default, but you can switch anytime</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select
              className="form-input"
              value={prefs.theme}
              onChange={(e) => setPrefs((prev) => ({ ...prev, theme: e.target.value }))}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </section>

        <section className="card">
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}><Bot size={18} color="#06b6d4" /></div>
            <div>
              <h3 style={styles.sectionTitle}>AI Preferences</h3>
              <p style={styles.sectionDesc}>How AI assists you</p>
            </div>
          </div>
          <div style={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">AI Writing Tone</label>
              <select
                className="form-input"
                value={prefs.aiTone}
                onChange={(e) => setPrefs((prev) => ({ ...prev, aiTone: e.target.value }))}
              >
                <option value="professional">Professional - formal and precise</option>
                <option value="casual">Casual - friendly and relaxed</option>
                <option value="concise">Concise - brief and to the point</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                className="form-input"
                value={prefs.language}
                onChange={(e) => setPrefs((prev) => ({ ...prev, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}><Brain size={18} color="#10b981" /></div>
            <div>
              <h3 style={styles.sectionTitle}>About AI Notes</h3>
              <p style={styles.sectionDesc}>Powered by Claude AI</p>
            </div>
          </div>
          <div style={styles.aboutGrid}>
            {[
              { label: 'AI Model', value: 'Claude (Anthropic)' },
              { label: 'Features', value: 'Enhancement, Summarization, Chat, Flashcards' },
              { label: 'Database', value: 'MongoDB Atlas' },
              { label: 'Version', value: '1.0.0' }
            ].map((item, index) => (
              <div key={index} style={styles.aboutItem}>
                <span style={styles.aboutLabel}>{item.label}</span>
                <span style={styles.aboutValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} /> Saving...</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 'clamp(20px, 4vw, 40px)', maxWidth: 720, margin: '0 auto', width: '100%', animation: 'fadeIn 0.3s ease' },
  header: { marginBottom: 36 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' },
  sub: { fontSize: 15, color: 'var(--text-secondary)', marginTop: 6 },
  sections: { display: 'flex', flexDirection: 'column', gap: 20 },
  sectionHeader: { display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 },
  sectionIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: 'rgba(139,92,246,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  sectionTitle: { fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  sectionDesc: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  profileInfo: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  avatar: {
    width: 52, height: 52, borderRadius: 14,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0
  },
  profileName: { fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' },
  profileEmail: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 },
  formGrid: { display: 'flex', flexDirection: 'column', gap: 18 },
  aboutGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  aboutItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 12, flexWrap: 'wrap'
  },
  aboutLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  aboutValue: { fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }
};
