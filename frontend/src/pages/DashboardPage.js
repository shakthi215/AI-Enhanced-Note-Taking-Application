import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, FileText, Zap, Star, TrendingUp, Clock, Tag, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getInsights()
      .then((res) => setData(res.data.insights))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingGrid}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="skeleton" style={{ height: index < 4 ? 100 : 300, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]}</p>
          <h1 style={styles.title}>Your Intelligence Dashboard</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/notes')}>
          <Plus size={16} /> New Note
        </button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Total Notes', value: overview.totalNotes || 0, icon: <FileText size={18} />, color: '#8b5cf6' },
          { label: 'Words Written', value: (overview.totalWords || 0).toLocaleString(), icon: <TrendingUp size={18} />, color: '#06b6d4' },
          { label: 'AI Enhanced', value: overview.enhancedNotes || 0, icon: <Zap size={18} />, color: '#10b981' },
          { label: 'Pinned Notes', value: overview.pinnedNotes || 0, icon: <Star size={18} />, color: '#f59e0b' }
        ].map((stat, index) => (
          <div key={index} className="card" style={{ ...styles.statCard, animationDelay: `${index * 0.1}s` }}>
            <div style={{ ...styles.statIcon, background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.chartsRow}>
        <div className="card" style={{ flex: 1.5, minWidth: 280 }}>
          <div className="section-header">
            <h3 className="section-title">Weekly Activity</h3>
            <span style={styles.badge}>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.weeklyActivity || []}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }}
                cursor={{ fill: 'rgba(139,92,246,0.05)' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>By Category</h3>
          {data?.categories?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.categories} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {data.categories.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.legend}>
                {data.categories.slice(0, 4).map((category, index) => (
                  <div key={index} style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: COLORS[index % COLORS.length] }} />
                    <span style={styles.legendLabel}>{category.name}</span>
                    <span style={styles.legendCount}>{category.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 30 }}>
              <p>No data yet</p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.chartsRow}>
        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <div className="section-header">
            <h3 className="section-title">Recent Notes</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notes')}>View all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data?.recentNotes?.length > 0 ? data.recentNotes.map((note, index) => (
              <div key={index} style={styles.recentNote} onClick={() => navigate('/notes')}>
                <div style={styles.recentNoteTitle}>{note.title}</div>
                <div style={styles.recentNoteMeta}>
                  <span style={styles.recentCategory}>{note.category}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />{note.wordCount} words
                  </span>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: 20 }}>
                <FileText size={32} />
                <p>No notes yet. Create your first!</p>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>Popular Tags</h3>
          <div style={styles.tagsCloud}>
            {data?.topTags?.length > 0 ? data.topTags.map((tag, index) => (
              <div key={index} className="tag" style={{ fontSize: 13, padding: '5px 12px' }}>
                <Tag size={11} /> {tag.name}
                <span style={styles.tagCount}>{tag.count}</span>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: 20 }}>
                <Tag size={32} />
                <p>No tags yet</p>
              </div>
            )}
          </div>

          <div style={styles.divider} />
          <div style={styles.insightRow}>
            <Brain size={16} color="#8b5cf6" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Avg note: <strong style={{ color: 'var(--text-primary)' }}>{overview.avgWordsPerNote || 0} words</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto', width: '100%', animation: 'fadeIn 0.4s ease' },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' },
  greeting: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 },
  title: { fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 },
  statCard: { display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.4s ease both' },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  chartsRow: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  badge: { fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' },
  legend: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 13, color: 'var(--text-secondary)', flex: 1 },
  legendCount: { fontSize: 12, color: 'var(--text-muted)' },
  recentNote: {
    padding: '12px 14px',
    borderRadius: 10,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  recentNoteTitle: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  recentNoteMeta: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' },
  recentCategory: { background: 'rgba(139,92,246,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 10, fontSize: 11 },
  tagsCloud: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tagCount: { marginLeft: 4, opacity: 0.6 },
  divider: { height: 1, background: 'var(--border)', margin: '16px 0' },
  insightRow: { display: 'flex', alignItems: 'center', gap: 10 }
};
