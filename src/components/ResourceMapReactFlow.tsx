import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MiniMap,
  Panel,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./ResourceMapReactFlow.css";

import { useStore } from "../store/useStore";
import {
  Users,
  Monitor,
  Wrench,
  Building,
  Truck,
  Database,
  Save,
  TrendingUp,
  Network,
  ArrowLeft,
} from "lucide-react";
import { RESOURCE_TYPES, ResourceType } from "../types";

// Fallback in case RESOURCE_TYPES is undefined
const SAFE_RESOURCE_TYPES = RESOURCE_TYPES || [
  { value: "personnel" as const, label: "Personnel" },
  { value: "systems" as const, label: "Systems/Applications" },
  { value: "equipment" as const, label: "Equipment" },
  { value: "facilities" as const, label: "Facilities" },
  { value: "vendors" as const, label: "Vendors/Suppliers" },
  { value: "data" as const, label: "Data/Records" },
];

// Resource type colors and icons
const RESOURCE_COLORS: Record<ResourceType, string> = {
  personnel: "#22C55E",
  systems: "#3B82F6",
  equipment: "#F97316",
  facilities: "#A855F7",
  vendors: "#EF4444",
  data: "#06B6D4",
};

const RESOURCE_ICONS: Record<ResourceType, typeof Users> = {
  personnel: Users,
  systems: Monitor,
  equipment: Wrench,
  facilities: Building,
  vendors: Truck,
  data: Database,
};

// Custom Node Components
const ProcessNode = ({ data }: { data: any }) => {
  const IconComponent = TrendingUp;
  const criticalityClass = `criticality-${data.criticality || "low"}`;

  return (
    <>
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <div className="px-4 py-3 shadow-lg rounded-lg bg-gray-800 border-2 border-gray-600 min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className={`w-5 h-5 ${criticalityClass}-icon`} />
          <div className="text-white flex-1">
            <div className="text-sm font-semibold">{data.label}</div>
            <div className="text-xs text-gray-400">{data.department}</div>
            <div className={`text-xs ${criticalityClass}-text`}>
              {data.criticality?.toUpperCase()} criticality
            </div>
          </div>
        </div>
        <div className="flex gap-3 text-xs pt-2 border-t border-gray-700">
          <div>
            <span className="text-gray-500">RTO:</span>{" "}
            <span className="text-gray-300 font-medium">{data.rto || 0}h</span>
          </div>
          <div>
            <span className="text-gray-500">RPO:</span>{" "}
            <span className="text-gray-300 font-medium">{data.rpo || 0}h</span>
          </div>
        </div>
      </div>
    </>
  );
};

const ResourceNode = ({ data }: { data: any }) => {
  const IconComponent = RESOURCE_ICONS[data.resourceType] || Database;
  const resourceClass = `resource-${data.resourceType || "data"}`;

  return (
    <>
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <div
        className={`px-3 py-2 shadow-lg rounded-lg border-2 min-w-[150px] ${resourceClass}-node`}>
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className={`w-4 h-4 ${resourceClass}-icon`} />
          <div className="text-white flex-1">
            <div className="text-sm font-medium">{data.label}</div>
            <div className="text-xs text-gray-400">{data.type}</div>
          </div>
        </div>
        <div className="flex gap-3 text-xs pt-2 border-t border-gray-700">
          <div>
            <span className="text-gray-500">RTO:</span>{" "}
            <span className="text-gray-300 font-medium">{data.rto || 0}h</span>
          </div>
          <div>
            <span className="text-gray-500">RPO:</span>{" "}
            <span className="text-gray-300 font-medium">{data.rpo || 0}h</span>
          </div>
        </div>
      </div>
    </>
  );
};

// Node types
const nodeTypes = {
  process: ProcessNode,
  resource: ResourceNode,
};

export function ResourceMap() {
  const {
    processes,
    businessResources,
    selectedProcessId,
    setCurrentView,
    recoveryObjectives,
  } = useStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"processes" | "resources">(
    "processes",
  );

  // Find the selected process
  const selectedProcess = processes.find((p) => p.id === selectedProcessId);

  // Load saved maps from localStorage
  const loadSavedMaps = (): Record<string, any> => {
    try {
      const saved = localStorage.getItem("bia-dependency-maps");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const [savedMaps, setSavedMaps] =
    useState<Record<string, any>>(loadSavedMaps);

  // Handle connection
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  // Save canvas state to database
  const handleSave = useCallback(async () => {
    if (!selectedProcessId) return;

    try {
      // Save to localStorage as backup
      const newMaps = {
        ...savedMaps,
        [`process-${selectedProcessId}`]: {
          nodes,
          edges,
        },
      };
      setSavedMaps(newMaps);
      localStorage.setItem("bia-dependency-maps", JSON.stringify(newMaps));

      // Save to database
      for (const edge of edges) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) continue;

        const sourceType = sourceNode.id.startsWith("process-")
          ? "process"
          : "resource";
        const targetType = targetNode.id.startsWith("process-")
          ? "process"
          : "resource";

        if (sourceType === "process" && targetType === "process") {
          // Process-to-Process dependency
          const sourceProcessId = sourceNode.id.replace("process-", "");
          const targetProcessId = targetNode.id.replace("process-", "");

          await fetch("/api/dependencies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceProcessId,
              targetProcessId,
              type: "operational",
              criticality: 3,
              description: `Dependency from ${sourceNode.data.label} to ${targetNode.data.label}`,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
            }),
          });
        } else if (sourceType === "process" && targetType === "resource") {
          // Process-to-Resource link
          const processId = sourceNode.id.replace("process-", "");
          const resourceId = targetNode.id.replace("resource-", "");

          await fetch("/api/process-resource-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              processId,
              resourceId,
              criticality: "essential",
              quantityRequired: 1,
              notes: `Dependency from ${sourceNode.data.label} to ${targetNode.data.label}`,
              processHandle: edge.sourceHandle,
              resourceHandle: edge.targetHandle,
            }),
          });
        } else if (sourceType === "resource" && targetType === "process") {
          // Resource-to-Process link (reverse)
          const processId = targetNode.id.replace("process-", "");
          const resourceId = sourceNode.id.replace("resource-", "");

          await fetch("/api/process-resource-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              processId,
              resourceId,
              criticality: "essential",
              quantityRequired: 1,
              notes: `Dependency from ${targetNode.data.label} to ${sourceNode.data.label}`,
              resourceHandle: edge.sourceHandle,
              processHandle: edge.targetHandle,
            }),
          });
        } else if (sourceType === "resource" && targetType === "resource") {
          // Resource-to-Resource dependency
          const sourceResourceId = sourceNode.id.replace("resource-", "");
          const targetResourceId = targetNode.id.replace("resource-", "");

          await fetch("/api/resource-dependencies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceResourceId,
              targetResourceId,
              type: "operational",
              isBlocking: true,
              description: `Dependency from ${sourceNode.data.label} to ${targetNode.data.label}`,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
            }),
          });
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving dependencies:", error);
      alert("Failed to save dependencies");
    }
  }, [nodes, edges, savedMaps, selectedProcessId]);

  // Load saved dependencies on mount and add selected process to canvas
  useEffect(() => {
    const loadDependencies = async () => {
      if (!selectedProcessId) return;

      try {
        // Try loading from localStorage first
        const saved = savedMaps[`process-${selectedProcessId}`];
        if (saved) {
          setNodes(saved.nodes || []);
          setEdges(saved.edges || []);
        } else {
          // If no saved data, add the selected process to the canvas
          const process = processes.find((p) => p.id === selectedProcessId);
          if (process) {
            const recoveryObj = recoveryObjectives[selectedProcessId];
            const newNode: Node = {
              id: `process-${process.id}`,
              type: "process",
              position: { x: 300, y: 200 },
              data: {
                label: process.name,
                department: process.department,
                criticality: process.criticality,
                type: "process",
                processId: process.id,
                rto: recoveryObj?.rto || 0,
                rpo: recoveryObj?.rpo || 0,
              },
            };
            setNodes([newNode]);
          }
        }

        // TODO: Load from database and merge with localStorage
        // const response = await fetch(`/api/dependencies/process/${selectedProcessId}`);
        // const dbDependencies = await response.json();
        // Convert DB dependencies to nodes and edges format
      } catch (error) {
        console.error("Error loading dependencies:", error);
      }
    };

    loadDependencies();
  }, [
    setNodes,
    setEdges,
    savedMaps,
    selectedProcessId,
    processes,
    recoveryObjectives,
  ]);

  if (processes.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-16">
          <Network className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No business processes found
          </h3>
          <p className="text-gray-400">
            Create some business processes first to start mapping dependencies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("resource-map")}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Processes</span>
          </button>
          <div className="h-8 w-px bg-gray-700"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100">
              {selectedProcess ? selectedProcess.name : "Dependency Analysis"}
            </h2>
            <p className="text-gray-400 mt-1">
              {selectedProcess
                ? `Map dependencies for ${selectedProcess.department}`
                : "Map dependencies between business processes and resources"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Dependencies"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Entity Palette with Tabs */}
        <div className="w-64 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
          {/* Tab Header */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("processes")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "processes"
                  ? "text-white bg-gray-700 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Processes
              </div>
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "resources"
                  ? "text-white bg-gray-700 border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                Resources
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <div className="text-xs text-gray-400 mb-4 text-center">
              Click to add to canvas
            </div>

            {/* Business Processes Tab */}
            {activeTab === "processes" && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {processes.map((process) => {
                    const isOnCanvas = nodes.some(
                      (node) => node.id === `process-${process.id}`,
                    );
                    const criticalityClass = `criticality-${process.criticality || "low"}`;

                    return (
                      <button
                        key={process.id}
                        onClick={() => {
                          if (!isOnCanvas) {
                            const recoveryObj = recoveryObjectives[process.id];
                            const newNode: Node = {
                              id: `process-${process.id}`,
                              type: "process",
                              position: {
                                x: Math.random() * 400 + 200,
                                y: Math.random() * 300 + 200,
                              },
                              data: {
                                label: process.name,
                                department: process.department,
                                criticality: process.criticality,
                                type: "process",
                                processId: process.id,
                                rto: recoveryObj?.rto || 0,
                                rpo: recoveryObj?.rpo || 0,
                              },
                            };
                            setNodes((nds) => nds.concat(newNode));
                          }
                        }}
                        disabled={isOnCanvas}
                        className={`w-full flex items-center gap-2 p-3 text-left rounded transition-colors border ${
                          isOnCanvas
                            ? "bg-gray-600 border-gray-600 opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-700 border-gray-600 hover:border-gray-500 hover:scale-[1.02]"
                        }`}>
                        <TrendingUp
                          className={`w-4 h-4 ${criticalityClass}-icon`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-200 truncate font-medium">
                            {process.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {process.department}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {process.criticality} priority
                          </div>
                        </div>
                        {isOnCanvas && (
                          <span className="text-xs text-green-400 font-medium">
                            ✓ Added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business Resources Tab */}
            {activeTab === "resources" && (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {businessResources.map((resource) => {
                    const isOnCanvas = nodes.some(
                      (node) => node.id === `resource-${resource.id}`,
                    );
                    const IconComponent = RESOURCE_ICONS[resource.type];
                    const resourceClass = `resource-${resource.type}`;

                    return (
                      <button
                        key={resource.id}
                        onClick={() => {
                          if (!isOnCanvas) {
                            const rtoValue = resource.rto?.value || 0;
                            const rpoValue = resource.rpo?.value || 0;
                            const newNode: Node = {
                              id: `resource-${resource.id}`,
                              type: "resource",
                              position: {
                                x: Math.random() * 400 + 200,
                                y: Math.random() * 300 + 200,
                              },
                              data: {
                                label: resource.name,
                                resourceType: resource.type,
                                type: resource.type,
                                resourceId: resource.id,
                                rto: rtoValue,
                                rpo: rpoValue,
                              },
                            };
                            setNodes((nds) => nds.concat(newNode));
                          }
                        }}
                        disabled={isOnCanvas}
                        className={`w-full flex items-center gap-2 p-3 text-left rounded transition-colors border ${
                          isOnCanvas
                            ? "bg-gray-600 border-gray-600 opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-700 border-gray-600 hover:border-gray-500 hover:scale-[1.02]"
                        }`}>
                        <IconComponent
                          className={`w-4 h-4 ${resourceClass}-icon`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-200 truncate font-medium">
                            {resource.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {
                              SAFE_RESOURCE_TYPES.find(
                                (t) => t.value === resource.type,
                              )?.label
                            }
                          </div>
                        </div>
                        {isOnCanvas && (
                          <span className="text-xs text-green-400 font-medium">
                            ✓ Added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={(deleted) => {
              // Nodes are already deleted by onNodesChange, just log for debugging
              console.log("Nodes deleted:", deleted);
            }}
            onEdgesDelete={(deleted) => {
              // Edges are already deleted by onEdgesChange, just log for debugging
              console.log("Edges deleted:", deleted);
            }}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
            deleteKeyCode="Delete"
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "#6B7280", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed },
            }}>
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color="#374151"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
