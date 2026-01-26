import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Plus, Search, Award, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export function TrainingRecords() {
  const { bcTrainingRecords, fetchTrainingRecords } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchTrainingRecords(); }, []);

  const filtered = bcTrainingRecords.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    r.training_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    completed: bcTrainingRecords.filter(r => r.status === "completed").length,
    inProgress: bcTrainingRecords.filter(r => r.status === "in_progress").length,
    expired: bcTrainingRecords.filter(r => r.status === "expired").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Training Records</h2>
          <p className="text-slate-400">Track certifications and training</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-slate-100">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-slate-100">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-slate-400 text-sm">Expired</p>
              <p className="text-2xl font-bold text-slate-100">{stats.expired}</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-slate-100">{bcTrainingRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="glass-panel border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400">Training</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400">Provider</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400">Completed</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-6 py-3 text-slate-200">{r.training_title}</td>
                  <td className="px-6 py-3 text-slate-400">{r.provider || "N/A"}</td>
                  <td className="px-6 py-3 text-slate-400">{new Date(r.completion_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: r.status === "completed" ? "rgba(34,197,94,0.1)" : r.status === "in_progress" ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)", color: r.status === "completed" ? "#22c55e" : r.status === "in_progress" ? "#3b82f6" : "#ef4444"}}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TrainingRecords;
