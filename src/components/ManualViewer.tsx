import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ManualViewerProps {
  title: string;
  content: React.ReactNode;
}

export const ManualViewer: React.FC<ManualViewerProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-10 pt-4 border-t border-border/40">
      <Card className="bg-card/40 border-border/40 shadow-none transition-all duration-200">
        <button 
          type="button"
          className="w-full flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle size={15} className="text-primary/70 shrink-0" />
            <span className="font-medium text-xs">Instruções & Ajuda: {title}</span>
          </div>
          <div className="text-muted-foreground/60 transition-transform duration-200">
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </button>
        {isOpen && (
          <CardContent className="px-5 py-4 border-t border-border/30 bg-muted/10 text-xs leading-relaxed text-muted-foreground animate-in slide-in-from-top-1 fade-in duration-150">
            <div className="space-y-2.5 text-xs">
              {content}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
