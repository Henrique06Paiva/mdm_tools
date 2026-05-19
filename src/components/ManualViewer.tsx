import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ManualViewerProps {
  title: string;
  content: React.ReactNode;
}

export const ManualViewer: React.FC<ManualViewerProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-6 bg-muted/20 border-border/60 shadow-sm transition-all duration-300">
      <div 
        className="flex justify-between items-center px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 text-foreground">
          <BookOpen size={18} className="text-primary" />
          <span className="font-semibold text-sm">Manual de Uso: {title}</span>
        </div>
        <div className="text-muted-foreground transition-transform duration-300">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      {isOpen && (
        <CardContent className="px-6 py-5 border-t border-border/40 bg-background/50 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="space-y-3">
            {content}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
