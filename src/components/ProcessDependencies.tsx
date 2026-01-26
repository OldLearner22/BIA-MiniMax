import React, { useState, useRef, useMemo, useCallback } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import "cytoscape-dagre";
import "cytoscape-klay";
import "cytoscape-cola";
import { useStore } from "../store/useStore";
import {
  Save,
  Users,
  Monitor,
  Wrench,
  Building,
  Truck,
  Database,
  Workflow,
  Settings2,
  X,
} from "lucide-react";
import { RESOURCE_TYPES, ResourceType } from "../types";

// Fallback in case RESOURCE_TYPES is undefined
// --- Cytoscape.js-based implementation ---
export function ProcessDependencies() {
  const { processes, settings } = useStore();
  const businessResources = settings.businessResources || [];
  const [selectedProcessId, setSelectedProcessId] = useState(processes[0]?.id || "");
  const [saved, setSaved] = useState(false);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedLayout, setSelectedLayout] = useState("dagre");

  // Map saving/loading logic (preserved)
  const loadSavedMaps = (): Record<string, any> => {
    try {
      const saved = localStorage.getItem("bia-process-dependency-maps");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };
  const [savedMaps, setSavedMaps] = useState<Record<string, any>>(loadSavedMaps);

  // Elements for Cytoscape
  const elements = useMemo(() => {
    const nodes: cytoscape.ElementDefinition[] = [];
    const edges: cytoscape.ElementDefinition[] = [];
    const currentProcess = processes.find((p) => p.id === selectedProcessId);
    if (!currentProcess) return [];

    // Center process node
    nodes.push({
      data: {
        id: `process-${currentProcess.id}`,
        label: currentProcess.name,
        type: "process",
        criticality: currentProcess.criticality,
        department: currentProcess.department,
        nodeType: "process",
      },
    });

    // Other processes (draggable)
    processes.filter((p) => p.id !== selectedProcessId).forEach((process) => {
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

    // Resources
    businessResources.forEach((resource) => {
      nodes.push({
        data: {
          id: `resource-${resource.id}`,
          label: resource.name,
          type: "resource",
          resourceType: resource.type,
          criticality: resource.redundancy === "none" ? 5 : resource.redundancy === "partial" ? 3 : 1,
          nodeType: "resource",
        },
      });
    });

    // Edges (from saved map if available)
    const savedMap = savedMaps[selectedProcessId];
    if (savedMap && savedMap.edges) {
      edges.push(...savedMap.edges);
    }
    return [...nodes, ...edges];
  }, [processes, businessResources, selectedProcessId, savedMaps]);

  // Cytoscape layout configs
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

  // Style config (simplified for now)
  const stylesheet: any[] = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "font-size": "12px",
        "font-weight": "bold",
        "background-color": (ele: cytoscape.NodeSingular) =>
          ele.data("nodeType") === "process" ? "#3B82F6" : "#10B981",
        "border-width": "2px",
        "border-color": "#FFFFFF",
        width: "60px",
        height: "60px",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#818CF8",
        "target-arrow-color": "#818CF8",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
  ];

  // Save map
  const handleSave = () => {
    // Save only edges for now (nodes are derived from data)
    const cy = cyRef.current;
    if (!cy) return;
    const edges = cy.edges().map((e) => ({ data: e.data() }));
    const newMaps = {
      ...savedMaps,
      [selectedProcessId]: {
        processId: selectedProcessId,
        edges,
      },
    };
    setSavedMaps(newMaps);
    localStorage.setItem("bia-process-dependency-maps", JSON.stringify(newMaps));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Drag-and-drop for resources/processes
  const handleDragStart = (event: React.DragEvent, item: any) => {
    event.dataTransfer.setData("application/json", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;
    const item = JSON.parse(data);
    // Add node logic (future: allow adding new nodes dynamically)
    // For now, nodes are always present; could highlight or focus node here
  };

  if (processes.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-bia-text-primary mb-4">Process Dependencies</h1>
        <div className="glass-panel p-8 text-center">
          <p className="text-bia-text-secondary">No processes available. Create processes first.</p>
        </div>
      </div>
    );
  }

  const otherProcesses = processes.filter((p) => p.id !== selectedProcessId);

  return (
    <div className="animate-fade-in h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Process Dependencies</h1>
          <p className="text-bia-text-secondary mt-1">Map resources and processes that support each business process</p>
        </div>
        <button onClick={handleSave} className="glass-button-solid flex items-center gap-2">
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Dependencies"}
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedProcessId}
          onChange={(e) => setSelectedProcessId(e.target.value)}
          className="glass-input w-full max-w-md">
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.department})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 h-[calc(100%-120px)]">
        <div className="w-64 glass-panel p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-bia-text-primary mb-3">Drag onto Canvas</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-bia-text-tertiary uppercase mb-2">Resources</h4>
              <div className="space-y-2">
                {businessResources.map((resource) => {
                  const color = RESOURCE_COLORS[resource.type];
                  const Icon = RESOURCE_ICONS[resource.type];
                  const typeLabel =
                    (SAFE_RESOURCE_TYPES && SAFE_RESOURCE_TYPES.find((t) => t && t.value === resource.type)?.label) || resource.type;
                  return (
                    <div
                      key={resource.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, {
                        type: "resource",
                        id: resource.id,
                        name: resource.name,
                        resourceType: resource.type,
                        resourceTypeLabel: typeLabel,
                      })}
                      className="p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm text-bia-text-primary truncate">{resource.name}</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color }}>{typeLabel}</div>
                    </div>
                  );
                })}
                {businessResources.length === 0 && (
                  <p className="text-xs text-bia-text-tertiary">No resources defined. Add in Settings.</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium text-bia-text-tertiary uppercase mb-2">Other Processes</h4>
              <div className="space-y-2">
                {otherProcesses.map((process) => (
                  <div
                    key={process.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, {
                      type: "process",
                      id: process.id,
                      name: process.name,
                    })}
                    className="p-2 rounded-lg border border-blue-500/30 bg-blue-500/10 cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-bia-text-primary truncate">{process.name}</span>
                    </div>
                    <div className="text-xs text-blue-400 mt-0.5">{process.department}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 glass-panel overflow-hidden rounded-lg">
          <div
            style={{ width: "100%", height: "100%" }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}>
            <CytoscapeComponent
              elements={elements}
              stylesheet={stylesheet}
              layout={layoutConfigs[selectedLayout as keyof typeof layoutConfigs]}
              style={{ width: "100%", height: "600px" }}
              cy={(cy) => {
                cyRef.current = cy;
                // Add event listeners for future interactivity
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
      );
      setEdges(savedMap.edges);
    } else {
      setNodes([
        {
          id: "center",
          type: "processNode",
          position: { x: 400, y: 250 },
          data: {
            label: process?.name || "Process",
            isCenter: true,
            onOpenMenu: openNodeMenu,
          },
          deletable: false,
        },
      ]);
      setEdges([]);
    }
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#818CF8", strokeWidth: 2 },
            deletable: true,
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      // Toggle selection styling on click
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id ? !e.selected : false,
          style:
            e.id === edge.id && !e.selected
              ? { stroke: "#EF4444", strokeWidth: 3 }
              : { stroke: "#818CF8", strokeWidth: 2 },
        })),
      );
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData("application/json");
      if (!data) return;

      const item = JSON.parse(data);
      const reactFlowBounds = (event.target as HTMLElement)
        .closest(".react-flow")
        ?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 80,
        y: event.clientY - reactFlowBounds.top - 30,
      };

      const newNode: Node = {
        id: `${item.type}-${item.id}-${Date.now()}`,
        type: item.type === "process" ? "processNode" : "resourceNode",
        position,
        data:
          item.type === "process"
            ? {
                label: item.name,
                isCenter: false,
                shape: "rounded",
                onOpenMenu: openNodeMenu,
              }
            : {
                label: item.name,
                resourceType: item.resourceType,
                resourceTypeLabel: item.resourceTypeLabel,
                shape: "rounded",
                onOpenMenu: openNodeMenu,
              },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, openNodeMenu],
  );

  const handleSave = () => {
    // Strip onOpenMenu before saving
    const nodesToSave = nodes.map((n) => {
      const { onOpenMenu, ...rest } = n.data;
      return { ...n, data: rest };
    });
    const newMaps = {
      ...savedMaps,
      [selectedProcessId]: {
        processId: selectedProcessId,
        nodes: nodesToSave,
        edges,
      },
    };
    setSavedMaps(newMaps);
    localStorage.setItem(
      "bia-process-dependency-maps",
      JSON.stringify(newMaps),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDragStart = (event: DragEvent, item: any) => {
    event.dataTransfer.setData("application/json", JSON.stringify(item));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleChangeShape = (nodeId: string, shape: NodeShape) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, shape } } : n,
      ),
    );
  };

  const handleChangeColor = (nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, customColor: color } } : n,
      ),
    );
  };

  const selectedNode = nodes.find((n) => n.id === contextMenu?.nodeId);

  if (processes.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-bia-text-primary mb-4">
          Process Dependencies
        </h1>
        <div className="glass-panel p-8 text-center">
          <p className="text-bia-text-secondary">
            No processes available. Create processes first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">
            Process Dependencies
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Map resources and processes that support each business process
          </p>
        </div>
        <button
          onClick={handleSave}
          className="glass-button-solid flex items-center gap-2">
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Dependencies"}
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedProcessId}
          onChange={(e) => handleProcessChange(e.target.value)}
          className="glass-input w-full max-w-md">
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.department})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 h-[calc(100%-120px)]">
        <div className="w-64 glass-panel p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-bia-text-primary mb-3">
            Drag onto Canvas
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-bia-text-tertiary uppercase mb-2">
                Resources
              </h4>
              <div className="space-y-2">
                {businessResources.map((resource) => {
                  const color = RESOURCE_COLORS[resource.type];
                  const Icon = RESOURCE_ICONS[resource.type];
                  const typeLabel =
                    (SAFE_RESOURCE_TYPES &&
                      SAFE_RESOURCE_TYPES.find(
                        (t) => t && t.value === resource.type,
                      )?.label) ||
                    resource.type;
                  return (
                    <div
                      key={resource.id}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, {
                          type: "resource",
                          id: resource.id,
                          name: resource.name,
                          resourceType: resource.type,
                          resourceTypeLabel: typeLabel,
                        })
                      }
                      className="p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: `${color}15`,
                        borderColor: `${color}40`,
                      }}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm text-bia-text-primary truncate">
                          {resource.name}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color }}>
                        {typeLabel}
                      </div>
                    </div>
                  );
                })}
                {businessResources.length === 0 && (
                  <p className="text-xs text-bia-text-tertiary">
                    No resources defined. Add in Settings.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-bia-text-tertiary uppercase mb-2">
                Other Processes
              </h4>
              <div className="space-y-2">
                {otherProcesses.map((process) => (
                  <div
                    key={process.id}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, {
                        type: "process",
                        id: process.id,
                        name: process.name,
                      })
                    }
                    className="p-2 rounded-lg border border-blue-500/30 bg-blue-500/10 cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-bia-text-primary truncate">
                        {process.name}
                      </span>
                    </div>
                    <div className="text-xs text-blue-400 mt-0.5">
                      {process.department}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 glass-panel overflow-hidden rounded-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            className="bg-black/20">
            <Controls className="!bg-bia-card !border-bia-border !rounded-lg [&>button]:!bg-bia-card [&>button]:!border-bia-border [&>button]:!text-bia-text-primary [&>button:hover]:!bg-white/10" />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255,255,255,0.1)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && selectedNode && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          currentShape={(selectedNode.data.shape as NodeShape) || "rounded"}
          currentColor={
            (selectedNode.data.customColor as string) ||
            (selectedNode.data.resourceType
              ? RESOURCE_COLORS[selectedNode.data.resourceType as ResourceType]
              : "#818CF8")
          }
          onChangeShape={(shape) =>
            handleChangeShape(contextMenu.nodeId, shape)
          }
          onChangeColor={(color) =>
            handleChangeColor(contextMenu.nodeId, color)
          }
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
