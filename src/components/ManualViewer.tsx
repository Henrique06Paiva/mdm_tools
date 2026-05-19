import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface ManualViewerProps {
  title: string;
  content: React.ReactNode;
}

export const ManualViewer: React.FC<ManualViewerProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="panel" style={{ marginBottom: '24px', border: '1px solid var(--border)', backgroundColor: 'var(--bg2)' }}>
      <div 
        className="panel-head" 
        style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
          <BookOpen size={18} />
          <span style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-sans)' }}>Manual de Uso: {title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} color="var(--text3)" /> : <ChevronDown size={18} color="var(--text3)" />}
      </div>
      {isOpen && (
        <div className="panel-body" style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text2)', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
          {content}
        </div>
      )}
    </div>
  );
};
