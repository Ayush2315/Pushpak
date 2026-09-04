import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function ErrorState({ message, onRetry }) {
  const { t } = useLanguage();
  return (
    <div className="error-state-card">
      <div className="error-state-icon">
        <AlertTriangle size={36} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
        {t('common.error')}
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        {message || 'Could not connect to the backend service. Ensure FastAPI is running on port 8000.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>{t('common.retry')}</span>
          </span>
        </button>
      )}
    </div>
  );
}
