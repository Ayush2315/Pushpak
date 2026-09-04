import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export default function LoadingState({ message }) {
  const { t } = useLanguage();
  return (
    <div className="loading-skeleton-container card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid var(--border-subtle)',
          borderTopColor: 'var(--gov-navy)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          {message || t('common.loading')}
        </span>
      </div>
      <div className="skeleton-bar" style={{ height: '32px', width: '60%' }} />
      <div className="skeleton-bar" style={{ height: '140px', width: '100%' }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
