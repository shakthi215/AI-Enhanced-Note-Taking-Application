import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return toast.error('Please fill in all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      toast.success('Account created! Welcome to AI Notes');
      navigate('/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? errs[0].msg : err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div style={styles.page}>
      <div style={{ ...styles.orb, width: 500, height: 500, background: 'rgba(139,92,246,0.08)', top: -150, left: '30%' }} />
      <div style={{ ...styles.orb, width: 300, height: 300, background: 'rgba(6,182,212,0.06)', bottom: 0, right: 0 }} />

      <div style={styles.container}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}><Brain size={24} color="#fff" /></div>
          <span style={styles.logoText}>AI Notes</span>
        </div>

        <div style={styles.formCard}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={styles.formTitle}>Create your account</h2>
            <p style={styles.formSub}>Start building your AI-powered second brain</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Alex Johnson" value={form.name} onChange={set('name')} autoFocus />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>

            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1, position: 'relative' }}>
                <label className="form-label">Password</label>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw((prev) => !prev)} style={styles.eyeBtn}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>

            {form.password && (
              <div style={styles.strengthWrap}>
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.strengthBar,
                      background: form.password.length >= index * 3 ? (form.password.length >= 10 ? '#10b981' : '#f59e0b') : 'rgba(125, 138, 164, 0.2)'
                    }}
                  />
                ))}
                <span style={styles.strengthLabel}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    gap: 32
  },
  orb: { position: 'fixed', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' },
  container: {
    width: '100%',
    maxWidth: 560,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
    position: 'relative',
    zIndex: 1
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(139,92,246,0.4)'
  },
  logoText: { fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' },
  formCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: 'clamp(24px, 4vw, 40px)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: 'var(--shadow)'
  },
  formTitle: { fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' },
  formSub: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  eyeBtn: {
    position: 'absolute', right: 14, bottom: 13,
    background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex'
  },
  strengthWrap: { display: 'flex', alignItems: 'center', gap: 6, marginTop: -8 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2, transition: 'background 0.3s' },
  strengthLabel: { fontSize: 11, color: 'var(--text-secondary)', marginLeft: 4, minWidth: 50 },
  switchText: { fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' },
  link: { color: '#a78bfa', fontWeight: 500 }
};
