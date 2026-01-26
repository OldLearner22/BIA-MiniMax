import TemplateLibrary from "./TemplateLibrary";

export default function TemplateLibraryView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Procedure Templates</h1>
        <p className="text-slate-400">Browse and manage procedure templates.</p>
      </div>
      <TemplateLibrary onSelectTemplate={() => undefined} />
    </div>
  );
}
