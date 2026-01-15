import { useState, ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children || <HelpCircle className="w-4 h-4 text-bia-text-tertiary hover:text-bia-primary transition-colors" />}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bia-glass backdrop-blur-lg border border-bia-border rounded-bia-sm shadow-lg text-sm text-bia-text-primary max-w-xs whitespace-normal animate-fade-in">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bia-border" />
        </div>
      )}
    </div>
  );
}

export function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-bia-text-secondary">{label}</span>
      <Tooltip content={tooltip} />
    </div>
  );
}
