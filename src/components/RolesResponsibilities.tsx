import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Plus, Search, Shield, Edit2, Trash2 } from "lucide-react";

export function RolesResponsibilities() {
  const { bcRoles, fetchBCRoles } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => { fetchBCRoles(); }, []);

  const filtered = bcRoles.filter(r =>
    (filterType === "all" || r.role_type === filterType) &&
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCriticalityColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500/10 text-red-400",
      high: "bg-orange-500/10 text-orange-400",
      medium: "bg-blue-500/10 text-blue-400",
      low: "bg-green-500/10 text-green-400",
    };
    return colors[level] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Roles & Responsibilities</h2>
          <p className="text-slate-400">Define BC team roles and responsibilities</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100">
          <option value="all">All Types</option>
          <option value="executive">Executive</option>
          <option value="strategic">Strategic</option>
          <option value="operational">Operational</option>
          <option value="support">Support</option>
          <option value="specialist">Specialist</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(role => (
          <div key={role.id} className="glass-panel p-6 border border-white/10 hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-slate-100">{role.name}</h3>
                </div>
                <span className={"inline-block text-xs px-2 py-1 rounded " + getCriticalityColor(role.criticality_level)}>
                  {role.criticality_level.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <Edit2 className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-200" />
                <Trash2 className="w-4 h-4 text-red-400 cursor-pointer hover:text-red-300" />
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-3 line-clamp-2">{role.description}</p>
            {role.key_responsibilities && role.key_responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Responsibilities</h4>
                <ul className="text-xs text-slate-400 space-y-0.5">
                  {role.key_responsibilities.slice(0, 2).map((r: string, i: number) => (
                    <li key={i} className="line-clamp-1">• {r}</li>
                  ))}
                  {role.key_responsibilities.length > 2 && <li className="text-blue-400">+{role.key_responsibilities.length - 2} more</li>}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RolesResponsibilities;
