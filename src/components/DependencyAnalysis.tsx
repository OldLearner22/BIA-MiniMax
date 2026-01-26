import React, { useEffect, useRef, useState, useMemo } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import "cytoscape-dagre";
import "cytoscape-klay";
import "cytoscape-cola";
import { useStore } from "../store/useStore";
import { Dependency, ResourceDependency, DependencyType } from "../types";
import { AlertTriangle, TrendingUp, Network, Target, Zap } from "lucide-react";

const DEP_TYPE_COLORS: Record<DependencyType, string> = {
  technical: "#3B82F6", // Blue
  operational: "#F97316", // Orange
  resource: "#10B981", // Green
};

const CRITICALITY_COLORS = {
  1: "#10B981", // Green - Low criticality
  2: "#84CC16", // Light green
  3: "#FBBF24", // Yellow - Medium
  4: "#F97316", // Orange - High
  5: "#EF4444", // Red - Critical
};

interface AnalysisResult {
  betweennessCentrality: Record<string, number>;
  closenessCentrality: Record<string, number>;
  degreeCentrality: Record<string, number>;
  criticalPaths: Array<{
    path: string[];
    criticality: number;
    length: number;
  }>;
  spofNodes: Array<{
    id: string;
    name: string;
    centrality: number;
    type: "process" | "resource";
  }>;
  networkStats: {
    nodes: number;
    edges: number;
    density: number;
    avgDegree: number;
  };
}

export function DependencyAnalysis() {
  const {
    processes,
    dependencies,
    businessResources,
    resourceDependencies,
    settings,
  } = useStore();
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedLayout, setSelectedLayout] = useState("dagre");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [selectedAnalysis, setSelectedAnalysis] = useState<
    "centrality" | "criticality" | "paths"
  >("centrality");
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Convert dependencies to Cytoscape elements
  const elements = useMemo(() => {
    const nodes: cytoscape.ElementDefinition[] = [];
    const edges: cytoscape.ElementDefinition[] = [];

    // Add process nodes
    processes.forEach((process) => {
      nodes.push({
        data: {
          id: `process-${process.id}`,
          label: process.name,
          type: "process",
          criticality: process.criticality,
          department: process.department,
          nodeType: "process",
        },
      });
    });

    // Add resource nodes
    businessResources.forEach((resource) => {
      nodes.push({
        data: {
          id: `resource-${resource.id}`,
          label: resource.name,
          type: "resource",
          resourceType: resource.type,
          criticality:
            resource.redundancy === "none"
              ? 5
              : resource.redundancy === "partial"
                ? 3
                : 1,
          nodeType: "resource",
        },
      });
    });

    // Add process dependencies
    dependencies.forEach((dep) => {
      edges.push({
        data: {
          id: `dep-${dep.id}`,
          source: `process-${dep.sourceProcessId}`,
          target: `process-${dep.targetProcessId}`,
          type: dep.type,
          criticality: dep.criticality,
          description: dep.description,
          edgeType: "process",
        },
      });
    });

    // Add resource dependencies
    resourceDependencies.forEach((dep) => {
      edges.push({
        data: {
          id: `resdep-${dep.id}`,
          source: `resource-${dep.sourceResourceId}`,
          target: `resource-${dep.targetResourceId}`,
          type: dep.type,
          criticality: dep.isBlocking ? 5 : 3,
          description: dep.description,
          edgeType: "resource",
        },
      });
    });

    return [...nodes, ...edges];
  }, [processes, dependencies, businessResources, resourceDependencies]);

  // Cytoscape layout configurations
  const layoutConfigs = {
    dagre: {
      name: "dagre",
      rankDir: "TB",
      nodeSep: 50,
      edgeSep: 10,
      rankSep: 50,
    },
    breadthfirst: {
      name: "breadthfirst",
      directed: true,
      spacingFactor: 1.5,
    },
    circle: {
      name: "circle",
    },
    concentric: {
      name: "concentric",
      minNodeSpacing: 50,
      levelWidth: () => 1,
    },
  };

  // Style configuration
  const stylesheet: any[] = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "font-size": "12px",
        "font-weight": "bold",
        "text-wrap": "wrap",
        "text-max-width": "80px",
        "background-color": (ele: cytoscape.NodeSingular) => {
          if (selectedAnalysis === "criticality") {
            return (
              CRITICALITY_COLORS[
                ele.data("criticality") as keyof typeof CRITICALITY_COLORS
              ] || "#6B7280"
            );
          }
          return ele.data("nodeType") === "process" ? "#3B82F6" : "#10B981";
        },
        "border-width": "2px",
        "border-color": "#FFFFFF",
        width: (ele: cytoscape.NodeSingular) => {
          if (selectedAnalysis === "centrality" && analysisResult) {
            const centrality =
              analysisResult.betweennessCentrality[ele.id()] || 0;
            return 30 + centrality * 50; // Scale node size by centrality
          }
          return ele.data("nodeType") === "process" ? "60px" : "50px";
        },
        height: (ele: cytoscape.NodeSingular) => {
          if (selectedAnalysis === "centrality" && analysisResult) {
            const centrality =
              analysisResult.betweennessCentrality[ele.id()] || 0;
            return 30 + centrality * 50;
          }
          return ele.data("nodeType") === "process" ? "60px" : "50px";
        },
      },
    },
    {
      selector: "edge",
      style: {
        width: (ele: cytoscape.EdgeSingular) => {
          return Math.max(2, ele.data("criticality") || 1);
        },
        "line-color": (ele: cytoscape.EdgeSingular) => {
          return (
            DEP_TYPE_COLORS[ele.data("type") as DependencyType] || "#6B7280"
          );
        },
        "target-arrow-color": (ele: cytoscape.EdgeSingular) => {
          return (
            DEP_TYPE_COLORS[ele.data("type") as DependencyType] || "#6B7280"
          );
        },
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        label: (ele: cytoscape.EdgeSingular) => {
          return selectedAnalysis === "criticality"
            ? ele.data("criticality").toString()
            : "";
        },
        "font-size": "10px",
        "text-background-color": "#FFFFFF",
        "text-background-opacity": 0.8,
      },
    },
    {
      selector: "node.highlight",
      style: {
        "border-width": "4px",
        "border-color": "#EF4444",
        "background-color": "#FEE2E2",
      },
    },
    {
      selector: "edge.highlight",
      style: {
        width: "4px",
        "line-color": "#EF4444",
      },
    },
  ];

  // Perform network analysis
  const performAnalysis = () => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Calculate centrality measures (simplified for now)
    const centralityScores: Record<string, number> = {};
    cy.nodes().forEach((node) => {
      const degree = node.degree(false); // undirected degree
      centralityScores[node.id()] = degree;
    });

    // Find critical paths (simplified - longest paths by criticality)
    const criticalPaths = findCriticalPaths(cy);

    // Identify single points of failure (high degree centrality)
    const spofNodes = Object.entries(centralityScores)
      .filter(([, centrality]) => centrality > 2) // Threshold for SPOF
      .map(([nodeId, centrality]) => {
        const node = cy.getElementById(nodeId);
        return {
          id: nodeId,
          name: node.data("label"),
          centrality,
          type: node.data("nodeType") as "process" | "resource",
        };
      })
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 10); // Top 10

    // Network statistics
    const networkStats = {
      nodes: cy.nodes().length,
      edges: cy.edges().length,
      density:
        (2 * cy.edges().length) /
          (cy.nodes().length * (cy.nodes().length - 1)) || 0,
      avgDegree: (2 * cy.edges().length) / cy.nodes().length || 0,
    };

    setAnalysisResult({
      betweennessCentrality: centralityScores,
      closenessCentrality: centralityScores,
      degreeCentrality: centralityScores,
      criticalPaths,
      spofNodes,
      networkStats,
    });

    setShowAnalysis(true);
  };

  // Find critical paths (simplified implementation)
  const findCriticalPaths = (cy: cytoscape.Core) => {
    const paths: Array<{
      path: string[];
      criticality: number;
      length: number;
    }> = [];

    // For each node, find paths to other nodes
    cy.nodes().forEach((source) => {
      cy.nodes().forEach((target) => {
        if (source.id() !== target.id()) {
          try {
            const path = cy.elements().aStar({
              root: source,
              goal: target,
              directed: true,
              weight: (edge) => 6 - (edge.data("criticality") || 1), // Invert so higher criticality = lower weight
            });

            if (path.found && path.path) {
              const pathNodes = path.path.nodes().map((n) => n.data("label"));
              const totalCriticality = path.path
                .edges()
                .reduce(
                  (sum, edge) => sum + (edge.data("criticality") || 1),
                  0,
                );

              paths.push({
                path: pathNodes,
                criticality: totalCriticality,
                length: pathNodes.length,
              });
            }
          } catch (e) {
            // Skip invalid paths
          }
        }
      });
    });

    return paths.sort((a, b) => b.criticality - a.criticality).slice(0, 20); // Top 20 critical paths
  };

  const highlightNode = (nodeId: string) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // Clear previous highlights
    cy.elements().removeClass("highlight");

    // Highlight selected node and its connections
    const node = cy.getElementById(nodeId);
    if (node) {
      node.addClass("highlight");
      node.connectedEdges().addClass("highlight");
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">
            Dependency Network Analysis
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Advanced algorithmic analysis of dependency networks using
            Cytoscape.js
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value)}
            className="glass-button"
            title="Select layout algorithm">
            <option value="dagre">Hierarchical</option>
            <option value="breadthfirst">Breadth First</option>
            <option value="circle">Circular</option>
            <option value="concentric">Concentric</option>
          </select>
          <button
            onClick={performAnalysis}
            className="glass-button-solid flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analyze Network
          </button>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-bia-text-primary">
            Analysis Mode:
          </span>
          <div className="flex gap-2">
            {[
              { key: "centrality", label: "Centrality", icon: Network },
              { key: "criticality", label: "Criticality", icon: Target },
              { key: "paths", label: "Critical Paths", icon: Zap },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedAnalysis(key as any)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                  selectedAnalysis === key
                    ? "bg-bia-primary text-white"
                    : "bg-white/10 text-bia-text-secondary hover:bg-white/20"
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Technical Dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Operational Dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Resource Dependencies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Processes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resources</span>
          </div>
        </div>
      </div>

      {/* Cytoscape Visualization */}
      <div className="glass-panel p-4">
        <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={layoutConfigs[selectedLayout as keyof typeof layoutConfigs]}
          style={{ width: "100%", height: "600px" }}
          cy={(cy) => {
            cyRef.current = cy;

            // Add event listeners
            cy.on("tap", "node", (evt) => {
              const node = evt.target;
              highlightNode(node.id());
            });
          }}
        />
      </div>

      {/* Analysis Results */}
      {showAnalysis && analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Statistics */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" />
              Network Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nodes:</span>
                <span className="font-mono">
                  {analysisResult.networkStats.nodes}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Edges:</span>
                <span className="font-mono">
                  {analysisResult.networkStats.edges}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Density:</span>
                <span className="font-mono">
                  {analysisResult.networkStats.density.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Degree:</span>
                <span className="font-mono">
                  {analysisResult.networkStats.avgDegree.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Single Points of Failure */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Single Points of Failure
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {analysisResult.spofNodes.map((node, index) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-bia-critical font-mono">
                      #{index + 1}
                    </span>
                    <span>{node.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        node.type === "process"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-green-500/20 text-green-300"
                      }`}>
                      {node.type}
                    </span>
                  </div>
                  <span className="font-mono text-bia-text-tertiary">
                    {(node.centrality * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Paths */}
          <div className="glass-panel p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-bia-text-primary mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Most Critical Dependency Paths
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analysisResult.criticalPaths.slice(0, 10).map((path, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-bia-critical font-mono">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      {path.path.map((node, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-1 bg-white/10 rounded">
                            {node}
                          </span>
                          {i < path.path.length - 1 && (
                            <span className="text-bia-text-tertiary">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-mono">
                      Criticality: {path.criticality}
                    </div>
                    <div className="text-bia-text-tertiary">
                      Length: {path.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
