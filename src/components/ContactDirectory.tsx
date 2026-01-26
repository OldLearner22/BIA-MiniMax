import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Plus, Search, User } from "lucide-react";

export function ContactDirectory() {
  const { bcPeople, fetchBCPeople } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchBCPeople(); }, []);

  const filtered = bcPeople.filter(p =>
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Contact Directory</h2>
          <p className="text-slate-400">BC team contact information</p>
        </div>
      </div>
      <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <div key={p.id} className="glass-panel p-6 border border-white/10">
            <div className="flex items-start gap-3 mb-3">
              <User className="w-8 h-8 text-blue-400 mt-1" />
              <div>
                <h3 className="font-bold text-slate-100">{p.first_name} {p.last_name}</h3>
                <p className="text-sm text-slate-400">{p.job_title}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-300">
              {p.email && <p>Email: {p.email}</p>}
              {p.phone && <p>Phone: {p.phone}</p>}
              {p.department && <p>Dept: {p.department}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactDirectory;
