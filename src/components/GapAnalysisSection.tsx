import React from "react";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Minus } from "lucide-react";

interface GapData {
    dimension: string;
    currentLevel: number;
    targetLevel: number;
    currentScore: number;
    gapPercentage: number;
    status: "on-track" | "at-risk" | "complete";
}

interface GapAnalysisSectionProps {
    gaps: GapData[];
    onDimensionClick?: (dimension: string) => void;
}

export default function GapAnalysisSection({ gaps, onDimensionClick }: GapAnalysisSectionProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "complete":
                return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case "on-track":
                return <TrendingUp className="w-5 h-5 text-yellow-400" />;
            case "at-risk":
                return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default:
                return <Minus className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "complete":
                return "text-green-400 bg-green-400/10";
            case "on-track":
                return "text-yellow-400 bg-yellow-400/10";
            case "at-risk":
                return "text-red-400 bg-red-400/10";
            default:
                return "text-gray-400 bg-gray-400/10";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "complete":
                return "Complete";
            case "on-track":
                return "On Track";
            case "at-risk":
                return "At Risk";
            default:
                return "Unknown";
        }
    };

    const getGapBarColor = (status: string) => {
        switch (status) {
            case "complete":
                return "bg-green-500";
            case "on-track":
                return "bg-yellow-500";
            case "at-risk":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    if (!gaps || gaps.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Maturity Gap Analysis</h3>
                <p className="text-gray-400 text-sm">
                    No gap analysis data available. Set dimension targets to see your progress.
                </p>
            </div>
        );
    }

    // Sort by gap percentage (largest gaps first)
    const sortedGaps = [...gaps].sort((a, b) => b.gapPercentage - a.gapPercentage);

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Maturity Gap Analysis</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Track progress toward your maturity targets
                    </p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-400">Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-400">On Track</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-400">At Risk</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                                Dimension
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                Current
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                Target
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                                Progress
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                Gap
                            </th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedGaps.map((gap) => {
                            const progress = Math.max(0, 100 - gap.gapPercentage);
                            return (
                                <tr
                                    key={gap.dimension}
                                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                                    onClick={() => onDimensionClick?.(gap.dimension)}
                                >
                                    <td className="py-4 px-4">
                                        <div className="font-medium text-white">{gap.dimension}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {gap.currentScore}% complete
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white font-semibold">
                                            {gap.currentLevel}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-semibold border border-blue-600/50">
                                            {gap.targetLevel}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full ${getGapBarColor(gap.status)} transition-all duration-500`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-400 w-12 text-right">
                                                {progress}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {gap.gapPercentage > 0 ? (
                                                <TrendingDown className="w-4 h-4 text-red-400" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                            )}
                                            <span
                                                className={`font-semibold ${gap.gapPercentage > 0 ? "text-red-400" : "text-green-400"
                                                    }`}
                                            >
                                                {gap.gapPercentage > 0 ? "-" : ""}
                                                {Math.abs(gap.gapPercentage)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center">
                                            <div
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(gap.status)}`}
                                            >
                                                {getStatusIcon(gap.status)}
                                                <span className="text-sm font-medium">{getStatusLabel(gap.status)}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                        {sortedGaps.filter((g) => g.status === "complete").length}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Complete</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                        {sortedGaps.filter((g) => g.status === "on-track").length}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">On Track</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                        {sortedGaps.filter((g) => g.status === "at-risk").length}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">At Risk</div>
                </div>
            </div>
        </div>
    );
}
