import { useStore } from '../store/useStore';
import { GLOSSARY } from '../types';
import { X, BookOpen, ExternalLink } from 'lucide-react';

export function GlossaryModal() {
  const { showGlossary, toggleGlossary } = useStore();

  if (!showGlossary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 w-full max-w-2xl max-h-[80vh] overflow-auto animate-scale-in">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-bia-glass pb-4">
          <h2 className="text-xl font-semibold text-bia-text-primary flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-bia-primary" /> BIA Glossary
          </h2>
          <button onClick={toggleGlossary} className="p-2 hover:bg-bia-glass-hover rounded-lg">
            <X className="w-5 h-5 text-bia-text-secondary" />
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(GLOSSARY).map(([key, { term, definition, isoRef }]) => (
            <div key={key} className="p-4 rounded-bia-md bg-black/20 border border-bia-border">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-bia-primary font-mono font-semibold">{key}</span>
                  <h4 className="text-bia-text-primary font-medium mt-1">{term}</h4>
                </div>
              </div>
              <p className="text-bia-text-secondary text-sm mt-2">{definition}</p>
              <p className="text-bia-text-tertiary text-xs mt-2 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {isoRef}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-bia-md bg-bia-primary/10 border border-bia-primary/30">
          <h4 className="text-bia-primary font-medium">About ISO 22301:2019</h4>
          <p className="text-sm text-bia-text-secondary mt-2">
            ISO 22301:2019 specifies requirements for setting up and managing an effective Business Continuity Management System (BCMS). 
            It is designed to protect against, reduce the likelihood of, and ensure recovery from disruptive incidents.
          </p>
        </div>
      </div>
    </div>
  );
}
