import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Brain, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.orb, width: 600, height: 600, background: 'rgba(139,92,246,0.08)', top: -200, right: -100 }} />
      <div style={{ ...styles.orb, width: 400, height: 400, background: 'rgba(6,182,212,0.06)', bottom: -100, left: -100 }} />

      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}><Brain size={28} color="#fff" /></div>
            <span style={styles.logoText}>AI Notes</span>
          </div>
          <h1 style={styles.headline}>Think smarter,<br /><span style={styles.gradient}>not harder.</span></h1>
          <p style={styles.subtext}>Your AI companion that understands, organizes, and enhances your thinking.</p>
          <div style={styles.features}>
            {[
              { icon: <Zap size={16} />, text: 'AI-powered note enhancement' },
              { icon: <Brain size={16} />, text: 'Semantic search and insights' },
              { icon: <Sparkles size={16} />, text: 'Auto-tagging and categorization' }
            ].map((feature, index) => (
              <div key={index} style={styles.featureItem}>
                <span style={styles.featureIcon}>{feature.icon}</span>
                <span style={styles.featureText}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.formPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to your second brain</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  style={{ paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPw((prev) => !prev)} style={styles.eyeBtn}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <p style={styles.switchText}>
              Don't have an account? <Link to="/register" style={styles.link}>Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--auth-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden'
  },
  orb: {
    position: 'fixed',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none'
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: 960,
    gap: 48,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap'
  },
  leftPanel: {
    flex: '1 1 320px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(139,92,246,0.4)'
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  headline: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 'clamp(38px, 7vw, 48px)',
    fontWeight: 800,
    lineHeight: 1.1,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em'
  },
  gradient: {
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtext: {
    fontSize: 16,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: 380
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#a78bfa',
    flexShrink: 0
  },
  featureText: { fontSize: 14, color: 'var(--text-secondary)' },
  formPanel: { width: 'min(100%, 400px)', flex: '1 1 320px' },
  formCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: 'clamp(24px, 4vw, 40px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: 'var(--shadow)'
  },
  formTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  formSub: { fontSize: 14, color: 'var(--text-secondary)', marginTop: -16 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    bottom: 13,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex'
  },
  switchText: { fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' },
  link: { color: '#a78bfa', fontWeight: 500 }
};
