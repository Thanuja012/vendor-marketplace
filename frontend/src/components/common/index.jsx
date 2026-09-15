export function Spinner({ size = 'md' }) {
  return <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />;
}

export function LoadingCenter() {
  return <div className="loading-center"><Spinner /></div>;
}

export function SkeletonCard() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
      <div style={{ padding: '1rem' }}>
        <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '20px', width: '50%' }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  const range = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) range.push(i);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
      {range[0] > 1 && <><button className="page-btn" onClick={() => onPageChange(1)}>1</button>{range[0] > 2 && <span style={{ padding: '0 4px' }}>…</span>}</>}
      {range.map((p) => (
        <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {range[range.length - 1] < pages && <><span style={{ padding: '0 4px' }}>…</span><button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button></>}
      <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === pages}>›</button>
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>{title}</h3></div>
        <div className="modal-body"><p>{message}</p></div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
