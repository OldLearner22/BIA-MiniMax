import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Search, Target } from "lucide-react";

export function CompetencyMatrix() {
  const { bcCompetencies, fetchCompetencies, bcPersonCompetencies, fetchPersonCompetencies, bcPeople, fetchBCPeople } = useStore();
  const [viewMode, setViewMode] = useState("matrix");

  useEffect(() => {
    fetchCompetencies();
    fetchPersonCompetencies();
    fetchBCPeople();
  }, []);

  const getProficiencyColor = (level: number) => {
    const colors = [
      "bg-red-500/10 text-red-400",
      "bg-orange-500/10 text-orange-400",
      "bg-yellow-500/10 text-yellow-400",
      "bg-blue-500/10 text-blue-400",
      "bg-green-500/10 text-green-400",
    ];
    return colors[level - 1] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Competency Matrix</h2>
          <p className="text-slate-400">Track competencies and proficiency levels</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("matrix")}
            className={"px-4 py-2 rounded-lg transition-colors " + (viewMode === "matrix" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
          >
            Matrix View
          </button>
          <button
            onClick={() => setViewMode("gaps")}
            className={"px-4 py-2 rounded-lg transition-colors " + (viewMode === "gaps" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}
          >
            Skill Gaps
          </button>
        </div>
      </div>

      {viewMode === "matrix" ? (
        <div className="space-y-6">
          <div className="glass-panel p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Proficiency Levels</h3>
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3, 4, 5].map(level => (
                <div key={level} className="flex items-center gap-2">
                  <div className={"w-8 h-8 rounded flex items-center justify-center text-sm font-bold " + getProficiencyColor(level)}>
                    {level}
                  </div>
                  <span className="text-xs text-slate-400">
                    {["Beginner", "Basic", "Intermediate", "Advanced", "Expert"][level - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel border border-white/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 text-left sticky left-0 bg-slate-950">Person</th>
                  {bcCompetencies.map(c => (
                    <th key={c.id} className="px-4 py-3 text-xs font-semibold text-slate-400 min-w-[120px] text-center">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bcPeople.map(person => (
                  <tr key={person.id} className="hover:bg-white/5">
                    <td className="px-6 py-3 text-slate-200 sticky left-0 bg-slate-950">
                      {person.first_name} {person.last_name}
                    </td>
                    {bcCompetencies.map(c => {
                      const assessment = bcPersonCompetencies.find(
                        pc => pc.person_id === person.id && pc.competency_id === c.id
                      );
                      return (
                        <td key={c.id} className="px-4 py-3 text-center">
                          {assessment ? (
                            <div className={"w-10 h-10 rounded flex items-center justify-center text-sm font-bold " + getProficiencyColor(assessment.proficiency_level)}>
                              {assessment.proficiency_level}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded border-2 border-dashed border-slate-600 text-slate-500 flex items-center justify-center">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 border border-white/10">
          <p className="text-slate-400">Skill gaps analysis coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default CompetencyMatrix;
