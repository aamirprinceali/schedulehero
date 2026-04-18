'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { CANCELLATION_REASONS, CancellationReason } from '@/lib/types';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'default' | 'danger';
  // Optional date field
  showDateField?: boolean;
  dateLabel?: string;
  dateRequired?: boolean;
  // Optional reason select
  showReasonField?: boolean;
  reasonLabel?: string;
  // Optional start date (for scheduling)
  showStartDate?: boolean;
  startDateLabel?: string;
  onConfirm: (data: { date?: string; reason?: CancellationReason; startDate?: string }) => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'default',
  showDateField,
  dateLabel = 'End Date',
  dateRequired = false,
  showReasonField,
  reasonLabel = 'Reason',
  showStartDate,
  startDateLabel = 'Start Date',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState<CancellationReason | ''>('');
  const [startDate, setStartDate] = useState('');

  const canConfirm = (
    (!showDateField || !dateRequired || date) &&
    (!showReasonField || reason) &&
    (!showStartDate || startDate)
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: variant === 'danger' ? '#FEE2E2' : '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={16} color={variant === 'danger' ? '#DC2626' : '#F97316'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
              {title}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>
              {message}
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }}>
            <X size={16} />
          </button>
        </div>

        {(showStartDate || showDateField || showReasonField) && (
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {showStartDate && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  {startDateLabel} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="input"
                  style={{ fontSize: 13 }}
                />
              </div>
            )}
            {showDateField && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  {dateLabel} {dateRequired && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input"
                  style={{ fontSize: 13 }}
                />
              </div>
            )}
            {showReasonField && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  {reasonLabel} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as CancellationReason)}
                  className="input"
                  style={{ fontSize: 13 }}
                >
                  <option value="">Select a reason…</option>
                  {CANCELLATION_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '12px 22px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => onConfirm({ date: date || undefined, reason: reason || undefined, startDate: startDate || undefined })}
            disabled={!canConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
