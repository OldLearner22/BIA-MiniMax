interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="glass-panel p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-bia-text-primary">
          {title}
        </h2>
        <span className="text-xs uppercase tracking-widest text-bia-text-tertiary">
          Coming Soon
        </span>
      </div>
      <p className="text-bia-text-secondary">
        {description ||
          "This module is part of the planned roadmap and will be available in a future update."}
      </p>
    </div>
  );
}
