import React, { useState, useEffect, useRef, useCallback } from 'react';
import DeckEditor from './deck.jsx';
import { T, sysFont, glassPanel, ctrlBase } from './ui.jsx';
import { FilePlus, Trash2, Pencil, Check, FolderOpen, ChevronLeft, Presentation } from 'lucide-react';
import { deleteDeckRemote } from './supabase.js';

const INDEX_KEY = 'deck_editor_index';
const LS_PREFIX = 'deck_editor_';
const LEGACY_KEY = 'deck_editor_v3';

const loadIndex = () => { try { const r = localStorage.getItem(INDEX_KEY); if (r) return JSON.parse(r); } catch {} return null; };
const saveIndex = (idx) => { try { localStorage.setItem(INDEX_KEY, JSON.stringify(idx)); } catch {} };
const deleteDeckLocal = (id) => { try { localStorage.removeItem(LS_PREFIX + id); } catch {} };

function migrateIfNeeded() {
  if (loadIndex()) return null;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const deck = JSON.parse(legacy);
      const id = 'default';
      const index = [{ id, title: deck.title || 'Untitled', updatedAt: new Date().toISOString() }];
      saveIndex(index);
      localStorage.setItem(LS_PREFIX + id, legacy);
      localStorage.removeItem(LEGACY_KEY);
      return index;
    }
  } catch {}
  return null;
}

function generateId() {
  return `pres_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [index, setIndex] = useState(() => {
    const migrated = migrateIfNeeded();
    if (migrated) return migrated;
    return loadIndex() || [];
  });
  const [activeId, setActiveId] = useState(() => index.length > 0 ? index[0].id : null);
  const [showManager, setShowManager] = useState(!activeId);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const renameRef = useRef(null);

  useEffect(() => { saveIndex(index); }, [index]);
  useEffect(() => {
    if (renamingId && renameRef.current) renameRef.current.focus();
  }, [renamingId]);

  const createPresentation = useCallback(() => {
    const id = generateId();
    const title = 'Untitled Presentation';
    const entry = { id, title, updatedAt: new Date().toISOString() };
    setIndex(prev => [entry, ...prev]);
    setActiveId(id);
    setShowManager(false);
  }, []);

  const deletePresentation = useCallback((id) => {
    if (!confirm('Delete this presentation? This cannot be undone.')) return;
    setIndex(prev => prev.filter(p => p.id !== id));
    deleteDeckLocal(id);
    deleteDeckRemote(id);
    if (activeId === id) {
      const remaining = index.filter(p => p.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) setShowManager(true);
    }
  }, [activeId, index]);

  const startRename = useCallback((entry) => {
    setRenamingId(entry.id);
    setRenameVal(entry.title);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    setIndex(prev => prev.map(p => p.id === renamingId ? { ...p, title: renameVal || 'Untitled' } : p));
    setRenamingId(null);
  }, [renamingId, renameVal]);

  const onTitleChange = useCallback((title) => {
    setIndex(prev => prev.map(p => p.id === activeId ? { ...p, title, updatedAt: new Date().toISOString() } : p));
  }, [activeId]);

  if (showManager || !activeId) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#f8f8f8',
        fontFamily: sysFont, display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 32px', borderBottom: '1px solid #e5e5e5',
          display: 'flex', alignItems: 'center', gap: 16, background: '#fff',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Presentation size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              Presentations
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {index.length} presentation{index.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={createPresentation} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', border: 'none', borderRadius: 8,
            background: '#1a1a1a', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 150ms ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
          >
            <FilePlus size={16} /> New Presentation
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {index.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '60vh', gap: 16, color: '#999',
            }}>
              <FolderOpen size={48} strokeWidth={1.2} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>No presentations yet</div>
              <button onClick={createPresentation} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8,
                background: '#fff', color: '#1a1a1a', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}>
                <FilePlus size={16} /> Create your first presentation
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {index.map(entry => (
                <div key={entry.id} style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5',
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 150ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#ccc'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
                >
                  {/* Thumbnail area */}
                  <div
                    onClick={() => { setActiveId(entry.id); setShowManager(false); }}
                    style={{
                      height: 160, background: '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderBottom: '1px solid #e5e5e5',
                    }}
                  >
                    <Presentation size={40} color="#ccc" strokeWidth={1} />
                  </div>
                  {/* Info */}
                  <div style={{ padding: '14px 16px' }}>
                    {renamingId === entry.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input ref={renameRef} value={renameVal}
                          onChange={e => setRenameVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                          onClick={e => e.stopPropagation()}
                          style={{
                            flex: 1, fontSize: 14, fontWeight: 600, border: '1px solid #4a90d9',
                            borderRadius: 4, padding: '4px 8px', outline: 'none', fontFamily: 'inherit',
                          }}
                        />
                        <button onClick={(e) => { e.stopPropagation(); commitRename(); }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#4a90d9' }}>
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6,
                                     whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {entry.title || 'Untitled'}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: '#999' }}>
                        {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={(e) => { e.stopPropagation(); startRename(entry); }}
                          title="Rename"
                          style={{ width: 28, height: 28, border: 'none', borderRadius: 6,
                                   background: 'transparent', cursor: 'pointer', display: 'flex',
                                   alignItems: 'center', justifyContent: 'center', color: '#999' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deletePresentation(entry.id); }}
                          title="Delete"
                          style={{ width: 28, height: 28, border: 'none', borderRadius: 6,
                                   background: 'transparent', cursor: 'pointer', display: 'flex',
                                   alignItems: 'center', justifyContent: 'center', color: '#999' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#999'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Back to presentations button */}
      <button onClick={() => setShowManager(true)} title="All presentations" style={{
        position: 'fixed', top: 10, left: 10, zIndex: 9999,
        width: 30, height: 30, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#666', transition: 'all 150ms ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#1a1a1a'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = '#666'; }}
      >
        <ChevronLeft size={16} />
      </button>
      <DeckEditor key={activeId} presentationId={activeId} onTitleChange={onTitleChange} />
    </div>
  );
}
