import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    NodeProps,
    Handle,
    Position,
    BackgroundVariant,
    MarkerType,
    Connection,
    Panel,
    BaseEdge,
    getBezierPath,
    EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';
import { Users, Monitor, Wrench, Building, Truck, Database, Settings2, Save, Layers, ChevronLeft, Search, Grid, List as ListIcon, AlertTriangle, Trash2, ArrowRight, Table, Plus, X } from 'lucide-react';
import { RESOURCE_TYPES, ResourceType, ResourceCriticality, Dependency, DependencyType } from '../types';
import dagre from 'dagre';
import { WarningDetailsModal } from './WarningDetailsModal';

// Resource type colors and icons
const RESOURCE_COLORS: Record<ResourceType, string> = {
    personnel: '#22C55E',
    systems: '#3B82F6',
    equipment: '#F97316',
    facilities: '#A855F7',
    vendors: '#EF4444',
    data: '#06B6D4',
};

const RESOURCE_ICONS: Record<ResourceType, typeof Users> = {
    personnel: Users,
    systems: Monitor,
    equipment: Wrench,
    facilities: Building,
    vendors: Truck,
    data: Database,
};

// ----------------------------------------------------------------------------
// Custom Node Components
// ----------------------------------------------------------------------------

interface ResourceNodeData extends Record<string, unknown> {
    label: string;
    resourceType: ResourceType;
    resourceTypeLabel: string;
    rto?: { value: number; unit: string };
    rpo?: { value: number; unit: string };
    mainRto?: number; // In hours
    mainRpo?: number; // In hours
}

// Helper to convert time value to hours
const toHours = (val?: number | { value: number; unit: string }) => {
    if (val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (val.unit === 'days') return val.value * 24;
    if (val.unit === 'minutes') return val.value / 60;
    return val.value; // hours
};

type CustomResourceNode = Node<ResourceNodeData, 'resourceNode'>;

function ResourceNode({ id, data, selected }: NodeProps<CustomResourceNode>) {
    const color = RESOURCE_COLORS[data.resourceType] || '#6B7280';
    const Icon = RESOURCE_ICONS[data.resourceType] || Database;

    // Compliance Checks
    const rtoHours = toHours(data.rto);
    const rpoHours = toHours(data.rpo);
    const rtoViolation = data.mainRto !== undefined && rtoHours > data.mainRto;
    const rpoViolation = data.mainRpo !== undefined && rpoHours > data.mainRpo;

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 min-w-[180px] bg-black/80 backdrop-blur-md transition-all ${selected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent'} ${(rtoViolation || rpoViolation) ? 'ring-2 ring-red-500' : ''}`}
            style={{ borderColor: selected ? color : `${color}60` }}
        >
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !-top-1.5 !bg-bia-text-secondary" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !-bottom-1.5 !bg-bia-text-secondary" />
            <Handle type="target" position={Position.Left} id="l" className="!w-3 !h-3 !-left-1.5 !bg-bia-text-secondary" />
            <Handle type="source" position={Position.Right} id="r" className="!w-3 !h-3 !-right-1.5 !bg-bia-text-secondary" />

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-white/10" style={{ color }}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-bia-text-primary truncate" title={data.label}>{data.label}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70" style={{ color }}>{data.resourceTypeLabel}</div>
                </div>
                {(rtoViolation || rpoViolation) && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            {/* Metrics Badges */}
            <div className="flex gap-2">
                {data.rto && (
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${rtoViolation ? 'bg-red-500/20 text-red-200 border-red-500/50' : 'bg-white/10 text-bia-text-secondary border-white/5'}`}>
                        RTO: <span className={rtoViolation ? 'text-white font-bold' : 'text-white'}>{data.rto.value}{data.rto.unit.charAt(0)}</span>
                    </div>
                )}
                {data.rpo && (
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${rpoViolation ? 'bg-red-500/20 text-red-200 border-red-500/50' : 'bg-white/10 text-bia-text-secondary border-white/5'}`}>
                        RPO: <span className={rpoViolation ? 'text-white font-bold' : 'text-white'}>{data.rpo.value}{data.rpo.unit.charAt(0)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProcessNodeData extends Record<string, unknown> {
    label: string;
    criticality: string;
    isMain?: boolean;
    rto?: number;
    rpo?: number;
    mainRto?: number;
    mainRpo?: number;
}

type CustomProcessNode = Node<ProcessNodeData, 'processNode'>;

function ProcessNode({ data, selected }: NodeProps<CustomProcessNode>) {
    const borderColor = '#3B82F6'; // Blue for processes (changed from pink)

    // Checks (Only for dependencies, not main)
    const rtoViolation = !data.isMain && data.mainRto !== undefined && data.rto !== undefined && data.rto > data.mainRto;
    const rpoViolation = !data.isMain && data.mainRpo !== undefined && data.rpo !== undefined && data.rpo > data.mainRpo;

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 min-w-[180px] bg-black/80 backdrop-blur-md transition-all ${selected ? 'border-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent'} ${data.isMain ? 'ring-4 ring-blue-500/20' : ''} ${(rtoViolation || rpoViolation) ? 'ring-2 ring-red-500' : ''}`}
            style={{ borderColor: selected ? '#fff' : borderColor }}
        >
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !-top-1.5 !bg-bia-text-secondary" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !-bottom-1.5 !bg-bia-text-secondary" />
            <Handle type="target" position={Position.Left} id="l" className="!w-3 !h-3 !-left-1.5 !bg-bia-text-secondary" />
            <Handle type="source" position={Position.Right} id="r" className="!w-3 !h-3 !-right-1.5 !bg-bia-text-secondary" />

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-blue-500/20 text-blue-400">
                    <Layers className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate" title={data.label}>{data.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-300">Process</div>
                </div>
                {(rtoViolation || rpoViolation) && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            {/* Metrics Badges */}
            <div className="flex gap-2">
                {data.rto !== undefined && (
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${rtoViolation ? 'bg-red-500/20 text-red-200 border-red-500/50' : 'bg-blue-500/10 text-blue-200 border-blue-500/20'}`}>
                        RTO: <span className={rtoViolation ? 'text-white font-bold' : 'text-white'}>{data.rto}h</span>
                    </div>
                )}
                {data.rpo !== undefined && (
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${rpoViolation ? 'bg-red-500/20 text-red-200 border-red-500/50' : 'bg-blue-500/10 text-blue-200 border-blue-500/20'}`}>
                        RPO: <span className={rpoViolation ? 'text-white font-bold' : 'text-white'}>{data.rpo}h</span>
                    </div>
                )}
            </div>
        </div>
    );
}



// ----------------------------------------------------------------------------
// Types must be defined outside component to prevent re-creation
// ----------------------------------------------------------------------------
const nodeTypes = {
    resourceNode: ResourceNode,
    processNode: ProcessNode,
};

const edgeTypes = {
    customEdge: CustomEdge,
};

function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            interactionWidth={20}
            style={{
                ...style,
                stroke: selected ? '#ffffff' : style.stroke,
                strokeWidth: selected ? 3 : style.strokeWidth,
                filter: selected ? 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' : 'none',
                opacity: selected ? 1 : style.opacity,
            }}
        />
    );
}

// ----------------------------------------------------------------------------
// Sidebar Library Component
// ----------------------------------------------------------------------------

function DraggableLibrary() {
    const { businessResources, processes, selectedProcessId } = useStore();
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'resources' | 'processes'>('resources');

    const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/reactflow-data', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'move';
    };

    const filteredResources = businessResources.filter(r =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.type.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredProcesses = processes.filter(p =>
        p.id !== selectedProcessId && // Don't show the currently selected main process
        p.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <aside className="w-80 border-r border-white/10 bg-bia-glass flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-sm font-semibold text-bia-text-secondary uppercase tracking-wider mb-3">Library</h2>

                {/* Tabs */}
                <div className="flex p-1 bg-black/40 rounded-lg mb-3">
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'resources' ? 'bg-bia-primary text-white' : 'text-bia-text-secondary hover:text-white'}`}
                    >
                        Resources
                    </button>
                    <button
                        onClick={() => setActiveTab('processes')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'processes' ? 'bg-bia-primary text-white' : 'text-bia-text-secondary hover:text-white'}`}
                    >
                        Processes
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-bia-text-primary focus:outline-none focus:border-bia-primary"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activeTab === 'resources' ? (
                    filteredResources.map(res => (
                        <div
                            key={res.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, 'resourceNode', {
                                id: res.id,
                                label: res.name,
                                resourceType: res.type,
                                // Pass RTO/RPO on drag start so it's immediately available on drop
                                rto: res.rto,
                                rpo: res.rpo
                            })}
                            className="p-3 bg-bia-card border border-bia-border rounded-lg cursor-grab hover:border-bia-primary/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: RESOURCE_COLORS[res.type] }}></div>
                                <span className="text-sm text-bia-text-primary group-hover:text-white truncate">{res.name}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    filteredProcesses.map(proc => (
                        <div
                            key={proc.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, 'processNode', {
                                id: proc.id,
                                label: proc.name,
                                criticality: proc.criticality
                                // Process RTO/RPO will be hydrated by Canvas logic lookup since it's not on the Process object directly
                            })}
                            className="p-3 bg-bia-card border border-bia-border rounded-lg cursor-grab hover:border-pink-500/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Layers className="w-4 h-4 text-pink-500" />
                                <span className="text-sm text-bia-text-primary group-hover:text-white truncate">{proc.name}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-3 border-t border-white/10 text-xs text-center text-bia-text-tertiary">
                Drag items onto the canvas
            </div>
        </aside>
    );
}

// Helper for Dagre Layout
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        // Adjust width/height based on your node dimensions
        dagreGraph.setNode(node.id, { width: 200, height: 100 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // Dagre centers nodes, ReactFlow top-lefts them. Adjust.
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - 100, // half width
                y: nodeWithPosition.y - 50,  // half height
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// ----------------------------------------------------------------------------
// Dependency Table View
// ----------------------------------------------------------------------------

function DependencyTable() {
    const { processes, dependencies, removeDependency, getProcessById } = useStore();
    const DEP_COLORS: Record<DependencyType, string> = {
        technical: 'text-bia-primary',
        operational: 'text-bia-warning',
        resource: 'text-bia-secondary'
    };

    const getProcessName = (id: string) => processes.find((p) => p.id === id)?.name || id;

    return (
        <div className="p-8 w-full h-full overflow-y-auto bg-bia-bg-end">
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-bia-text-primary mb-4">All Dependencies</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20">
                            <tr className="text-left text-xs text-bia-text-secondary uppercase">
                                <th className="p-3">Source Activity</th>
                                <th className="p-3">Depends On</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Criticality</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bia-border">
                            {dependencies.map((dep) => (
                                <tr key={dep.id} className="hover:bg-bia-glass-hover transition-colors">
                                    <td className="p-3 text-bia-text-primary font-medium">{getProcessName(dep.sourceProcessId)}</td>
                                    <td className="p-3 text-bia-text-primary">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3 text-bia-text-tertiary" />
                                            {getProcessName(dep.targetProcessId)}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs border border-white/5 bg-white/5 ${DEP_COLORS[dep.type]}`}>
                                            {dep.type}
                                        </span>
                                    </td>
                                    <td className="p-3 text-bia-text-primary">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${i < dep.criticality ? 'bg-bia-primary' : 'bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 text-bia-text-secondary text-sm">{dep.description || '-'}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => removeDependency(dep.id)}
                                            className="p-1.5 hover:bg-bia-critical/20 rounded text-bia-text-tertiary hover:text-bia-critical transition-colors"
                                            title="Delete Dependency"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {dependencies.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-bia-text-tertiary">No dependencies defined</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Resource Map Canvas
// ----------------------------------------------------------------------------

function ResourceMapCanvas() {
    const {
        businessResources,
        resourceDependencies,
        addResourceDependency,
        removeResourceDependency,
        processes,
        processResourceLinks,
        linkResourceToProcess,
        unlinkResourceFromProcess,
        selectedProcessId,
        setSelectedProcessId,
        getProcessById,
        dependencies,
        addDependency,
        removeDependency,
        recoveryObjectives,
        loadDiagram,
        saveDiagram
    } = useStore();

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition, fitView } = useReactFlow();

    // Memoize types to prevent React Flow warning
    const memoizedNodeTypes = useMemo(() => nodeTypes, []);
    const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

    // Nodes & Edges State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [layoutSaved, setLayoutSaved] = useState(false);
    const [pendingDeletions, setPendingDeletions] = useState<Map<string, string>>(new Map()); // ID -> Type
    const [upstreamPickerOpen, setUpstreamPickerOpen] = useState(false);
    const [upstreamSearch, setUpstreamSearch] = useState('');

    const filteredUpstreamProcesses = processes.filter(p =>
        p.id !== selectedProcessId &&
        p.name.toLowerCase().includes(upstreamSearch.toLowerCase()) &&
        !dependencies.some(d => d.sourceProcessId === p.id && d.targetProcessId === selectedProcessId) // Exclude existing upstream
    );

    const handleAddUpstream = (sourceId: string) => {
        if (!selectedProcessId) return;
        addDependency({
            id: crypto.randomUUID(),
            sourceProcessId: sourceId,
            targetProcessId: selectedProcessId,
            type: 'operational',
            criticality: 3,
            description: 'Upstream added via map',
            sourceHandle: null,
            targetHandle: null
        });
        setUpstreamPickerOpen(false);
        setUpstreamSearch('');
    };




    const [diagramData, setDiagramData] = useState<any>(null);
    const [isDiagramLoading, setIsDiagramLoading] = useState(false);

    // Load Diagram Data
    useEffect(() => {
        if (!selectedProcessId) {
            setDiagramData(null);
            return;
        }
        setDiagramData(null); // Reset
        setIsDiagramLoading(true);
        loadDiagram(selectedProcessId).then(diagram => {
            if (diagram && diagram.data) {
                setDiagramData(diagram.data);
            }
        }).finally(() => setIsDiagramLoading(false));
    }, [selectedProcessId, loadDiagram]);

    const saveLayout = useCallback(async () => {
        if (!selectedProcessId) return;

        // 1. Execute Pending Deletions
        if (pendingDeletions.size > 0) {
            const promises: Promise<void>[] = [];
            pendingDeletions.forEach((type, id) => {
                if (type === 'process-link') promises.push(unlinkResourceFromProcess(id));
                else if (type === 'resource-dep') promises.push(removeResourceDependency(id));
                else if (type === 'process-dep') promises.push(removeDependency(id));
            });

            await Promise.all(promises);
            setPendingDeletions(new Map());
        }

        // 2. Save Positions
        const layoutData = {
            nodes: nodes.map(n => ({ id: n.id, position: n.position, type: n.type })),
            timestamp: Date.now()
        };

        // Save to DB via Diagram API
        await saveDiagram(selectedProcessId, layoutData);

        setLayoutSaved(true);
        setTimeout(() => setLayoutSaved(false), 2000);
    }, [selectedProcessId, nodes, pendingDeletions, unlinkResourceFromProcess, removeResourceDependency, removeDependency, saveDiagram]);

    // Auto Layout Handler
    const onLayout = useCallback((direction: 'TB' | 'LR' = 'TB') => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        );

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);

        setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
            // Trigger save after auto-layout
            saveLayout();
        }, 100);
    }, [nodes, edges, setNodes, setEdges, fitView, saveLayout]);

    // Initial Load Effect
    useEffect(() => {
        if (!selectedProcessId || isDiagramLoading) return;

        const savedLayout = diagramData;
        const initialNodes: Node[] = [];
        const addedNodeIds = new Set<string>();

        // 1. Add Main Process Node
        const proc = getProcessById(selectedProcessId);
        let mainRto = 0;
        let mainRpo = 0;

        if (proc) {
            const objectives = recoveryObjectives[proc.id];
            mainRto = objectives?.rto || 0;
            mainRpo = objectives?.rpo || 0;

            initialNodes.push({
                id: proc.id,
                type: 'processNode',
                position: savedLayout?.nodes?.find((n: any) => n.id === proc.id)?.position || { x: 400, y: 50 },
                data: {
                    label: proc.name,
                    criticality: proc.criticality,
                    isMain: true,
                    rto: mainRto,
                    rpo: mainRpo,
                    mainRto,
                    mainRpo
                },
            });
            addedNodeIds.add(proc.id);
        }

        // 2. Add Saved Nodes OR Default Linked Nodes
        if (savedLayout && savedLayout.nodes) {
            savedLayout.nodes.forEach((savedNode: any) => {
                if (savedNode.id !== selectedProcessId) { // Skip main, already added

                    // Refresh data to keep RTO/RPO sync
                    let updatedData = { ...savedNode.data, mainRto, mainRpo }; // Pass main metrics

                    if (savedNode.type === 'processNode') {
                        const objectives = recoveryObjectives[savedNode.id];
                        updatedData = { ...updatedData, rto: objectives?.rto, rpo: objectives?.rpo };
                    } else if (savedNode.type === 'resourceNode') {
                        const res = businessResources.find(r => r.id === savedNode.id);
                        if (res) {
                            updatedData = { ...updatedData, rto: res.rto, rpo: res.rpo };
                        }
                    }

                    initialNodes.push({
                        ...savedNode,
                        data: updatedData
                    });
                    addedNodeIds.add(savedNode.id);
                }
            });

            // 3. (NEW) Check for ANY missing resources/dependencies not in saved layout
            // This ensures if a new dependency is added via API/other user, it still shows up
            processResourceLinks
                .filter(link => link.processId === selectedProcessId && !pendingDeletions.has(link.id)) // Skip pending deletions
                .forEach((link, index) => {
                    if (!addedNodeIds.has(link.resourceId)) {
                        const res = businessResources.find(r => r.id === link.resourceId);
                        if (res) {
                            initialNodes.push({
                                id: res.id,
                                type: 'resourceNode',
                                position: { x: (index % 4) * 200, y: 300 + Math.floor(index / 4) * 150 },
                                data: {
                                    label: res.name,
                                    resourceType: res.type,
                                    resourceTypeLabel: RESOURCE_TYPES.find(t => t.value === res.type)?.label || res.type,
                                    rto: res.rto,
                                    rpo: res.rpo,
                                    mainRto,
                                    mainRpo
                                }
                            });
                            addedNodeIds.add(res.id);
                        }
                    }
                });

            dependencies.forEach((dep, index) => {
                if (pendingDeletions.has(dep.id)) return; // Skip pending deletions

                let relatedProcessId: string | null = null;
                let yOffset = 0;

                if (dep.sourceProcessId === selectedProcessId) {
                    relatedProcessId = dep.targetProcessId;
                    yOffset = 300;
                }
                else if (dep.targetProcessId === selectedProcessId) {
                    relatedProcessId = dep.sourceProcessId;
                    yOffset = -200;
                }

                if (relatedProcessId && !addedNodeIds.has(relatedProcessId)) {
                    const relatedProc = getProcessById(relatedProcessId);
                    if (relatedProc) {
                        const objectives = recoveryObjectives[relatedProc.id];
                        initialNodes.push({
                            id: relatedProc.id,
                            type: 'processNode',
                            position: { x: (index % 3) * 300, y: yOffset },
                            data: {
                                label: relatedProc.name,
                                criticality: relatedProc.criticality,
                                isMain: false,
                                rto: objectives?.rto,
                                rpo: objectives?.rpo,
                                mainRto,
                                mainRpo
                            },
                        });
                        addedNodeIds.add(relatedProc.id);
                    }
                }
            });

        } else {
            // Default: Show currently linked resources
            processResourceLinks
                .filter(link => link.processId === selectedProcessId && !pendingDeletions.has(link.id)) // Skip pending deletions
                .forEach((link, index) => {
                    const res = businessResources.find(r => r.id === link.resourceId);
                    if (res && !addedNodeIds.has(res.id)) {
                        initialNodes.push({
                            id: res.id,
                            type: 'resourceNode',
                            position: { x: (index % 4) * 200, y: 300 + Math.floor(index / 4) * 150 },
                            data: {
                                label: res.name,
                                resourceType: res.type,
                                resourceTypeLabel: RESOURCE_TYPES.find(t => t.value === res.type)?.label || res.type,
                                rto: res.rto,
                                rpo: res.rpo,
                                mainRto,
                                mainRpo
                            }
                        });
                        addedNodeIds.add(res.id);
                    }
                });

            // Default: Show connected processes (Upstream & Downstream)
            dependencies.forEach((dep, index) => {
                if (pendingDeletions.has(dep.id)) return; // Skip pending deletions

                let relatedProcessId: string | null = null;
                let yOffset = 0;

                // If Selected depends on X (Selected -> X), X is downstream/dependency
                if (dep.sourceProcessId === selectedProcessId) {
                    relatedProcessId = dep.targetProcessId;
                    yOffset = 300; // Place below
                }
                // If X depends on Selected (X -> Selected), X is upstream/dependent
                else if (dep.targetProcessId === selectedProcessId) {
                    relatedProcessId = dep.sourceProcessId;
                    yOffset = -200; // Place above
                }

                if (relatedProcessId && !addedNodeIds.has(relatedProcessId)) {
                    const relatedProc = getProcessById(relatedProcessId);
                    if (relatedProc) {
                        const objectives = recoveryObjectives[relatedProc.id];
                        initialNodes.push({
                            id: relatedProc.id,
                            type: 'processNode',
                            position: { x: (index % 3) * 300, y: yOffset },
                            data: {
                                label: relatedProc.name,
                                criticality: relatedProc.criticality,
                                isMain: false,
                                rto: objectives?.rto,
                                rpo: objectives?.rpo,
                                mainRto,
                                mainRpo
                            },
                        });
                        addedNodeIds.add(relatedProc.id);
                    }
                }
            });
        }

        setNodes(initialNodes);
    }, [selectedProcessId, isDiagramLoading, diagramData, getProcessById, setNodes, recoveryObjectives, businessResources, processResourceLinks, dependencies, pendingDeletions]);

    // Update Edges based on visible nodes
    useEffect(() => {
        if (!selectedProcessId) return;

        const visibleNodeIds = new Set(nodes.map(n => n.id));
        const newEdges: Edge[] = [];

        // 1. Process -> Resource Links
        processResourceLinks.forEach(link => {
            if (pendingDeletions.has(link.id)) return; // Skip pending deletions

            if (visibleNodeIds.has(link.processId) && visibleNodeIds.has(link.resourceId)) {

                const criticalityColors: Record<ResourceCriticality, string> = {
                    essential: '#EF4444',
                    important: '#F59E0B',
                    supporting: '#10B981'
                };
                const color = criticalityColors[link.criticality] || '#ffffff';

                newEdges.push({
                    id: link.id,
                    source: link.processId,
                    target: link.resourceId,
                    sourceHandle: link.processHandle, // Use stored handle
                    targetHandle: link.resourceHandle, // Use stored handle
                    type: 'customEdge',
                    animated: true,
                    style: { stroke: color, strokeWidth: 2, strokeDasharray: '5,5' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: color },
                    data: { type: 'process-link', ...link }
                });
            }
        });

        // 2. Resource -> Resource Dependencies
        resourceDependencies.forEach(dep => {
            if (pendingDeletions.has(dep.id)) return; // Skip pending deletions

            if (visibleNodeIds.has(dep.sourceResourceId) && visibleNodeIds.has(dep.targetResourceId)) {
                let strokeColor = '#64748B';
                if (dep.type === 'technical') strokeColor = '#3B82F6';
                else if (dep.type === 'operational') strokeColor = '#F97316';
                else if (dep.type === 'resource') strokeColor = '#A855F7';
                if (dep.isBlocking) strokeColor = '#EF4444';

                newEdges.push({
                    id: dep.id,
                    source: dep.sourceResourceId,
                    target: dep.targetResourceId,
                    sourceHandle: dep.sourceHandle, // Use stored handle
                    targetHandle: dep.targetHandle, // Use stored handle
                    type: 'customEdge',
                    animated: true,
                    style: { stroke: strokeColor, strokeWidth: dep.isBlocking ? 3 : 1.5, opacity: 0.8 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
                    data: { type: 'resource-dep', ...dep }
                });
            }
        });

        // 3. Process -> Process Dependencies (NEW)
        const { dependencies } = useStore.getState(); // direct access or add to destructuring
        dependencies.forEach(dep => {
            if (pendingDeletions.has(dep.id)) return; // Skip pending deletions

            if (visibleNodeIds.has(dep.sourceProcessId) && visibleNodeIds.has(dep.targetProcessId)) {
                newEdges.push({
                    id: dep.id,
                    source: dep.sourceProcessId,
                    target: dep.targetProcessId,
                    sourceHandle: dep.sourceHandle, // Use stored handle
                    targetHandle: dep.targetHandle, // Use stored handle
                    type: 'customEdge',
                    animated: true,
                    style: { stroke: '#EC4899', strokeWidth: 2 }, // Pink for process flow
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#EC4899' },
                    data: { type: 'process-dep', ...dep }
                });
            }
        });

        setEdges(newEdges);

    }, [nodes, processResourceLinks, resourceDependencies, selectedProcessId, setEdges, pendingDeletions, dependencies]);

    // ------------------------------------
    // Drag & Drop Handlers
    // ------------------------------------
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const dataString = event.dataTransfer.getData('application/reactflow-data');

            if (typeof type === 'undefined' || !type || !dataString) {
                return;
            }

            const data = JSON.parse(dataString) as { id: string;[key: string]: any };

            // Check if node already exists
            if (nodes.find(n => n.id === data.id)) {
                return;
            }

            // Hydrate Process RTO/RPO if needed (as it's not carried on drag data effectively for stale reasons)
            // Ideally we could drag it, but fetching fresh is safer.
            if (type === 'processNode') {
                const objectives = useStore.getState().recoveryObjectives[data.id];
                if (objectives) {
                    data.rto = objectives.rto;
                    data.rpo = objectives.rpo;
                }
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: data.id,
                type,
                position,
                data: { ...data },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, nodes, setNodes],
    );

    // ------------------------------------
    // Connection & Deletion Handlers
    // ------------------------------------
    const onConnect = useCallback((params: Connection) => {
        if (!params.source || !params.target) return;

        // Ensure processes is available
        if (!processes) {
            console.error('Processes not defined in onConnect scope!');
            return;
        }

        // Determine types
        const isSourceResource = businessResources.some(r => r.id === params.source);
        const isTargetResource = businessResources.some(r => r.id === params.target);
        const isSourceProcess = processes.some(p => p.id === params.source);
        const isTargetProcess = processes.some(p => p.id === params.target);

        // 1. Process -> Resource (Existing)
        if (isSourceProcess && isTargetResource) {
            linkResourceToProcess({
                id: crypto.randomUUID(),
                processId: params.source,
                resourceId: params.target,
                criticality: 'important',
                quantityRequired: 1,
                notes: 'Created via Map',
                processHandle: params.sourceHandle, // Save Handle
                resourceHandle: params.targetHandle  // Save Handle
            });
        }
        // 2. Resource -> Resource (Existing)
        else if (isSourceResource && isTargetResource) {
            addResourceDependency({
                id: crypto.randomUUID(),
                sourceResourceId: params.source,
                targetResourceId: params.target,
                type: 'technical',
                isBlocking: false,
                description: 'Created via Map',
                sourceHandle: params.sourceHandle, // Save Handle
                targetHandle: params.targetHandle  // Save Handle
            });
        }
        // 3. Process -> Process (NEW)
        else if (isSourceProcess && isTargetProcess) {
            addDependency({
                id: crypto.randomUUID(),
                sourceProcessId: params.source,
                targetProcessId: params.target,
                type: 'operational',
                criticality: 3,
                description: 'Created via Map',
                sourceHandle: params.sourceHandle, // Save Handle
                targetHandle: params.targetHandle  // Save Handle
            });
        }
        // 4. Resource -> Process (NEW - Treat as Process->Resource inverted logic? Or just link them?)
        else if (isSourceResource && isTargetProcess) {
            linkResourceToProcess({
                id: crypto.randomUUID(),
                processId: params.target, // Target is the process
                resourceId: params.source, // Source is the resource
                criticality: 'important',
                quantityRequired: 1,
                notes: 'Created via Map (Reverse Link)',
                processHandle: params.targetHandle, // Process is Target here!
                resourceHandle: params.sourceHandle // Resource is Source here!
            });
        }

    }, [businessResources, processes, linkResourceToProcess, addResourceDependency, addDependency]);

    const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
        console.log('onEdgesDelete triggered', deletedEdges);
        const newDeletions = new Map(pendingDeletions);

        deletedEdges.forEach(edge => {
            console.log('Marking for deletion:', edge.id);
            if (edge.data?.type === 'process-link') {
                newDeletions.set(edge.id, 'process-link');
            } else if (edge.data?.type === 'resource-dep') {
                newDeletions.set(edge.id, 'resource-dep');
            } else if (edge.data?.type === 'process-dep') {
                newDeletions.set(edge.id, 'process-dep');
            }
        });

        setPendingDeletions(newDeletions);

        // Force visual update if useEdgesState didn't catch it
        setEdges(edges => edges.filter(e => !newDeletions.has(e.id)));
    }, [pendingDeletions, setEdges]);

    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
        const edgesToDelete: Edge[] = [];

        deletedNodes.forEach(node => {
            // Find all edges connected to this node
            const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id);
            edgesToDelete.push(...nodeEdges);
        });

        if (edgesToDelete.length > 0) {
            onEdgesDelete(edgesToDelete);
        }
    }, [edges, onEdgesDelete]);

    // State for Warning Modal
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningModalType, setWarningModalType] = useState<'spof' | 'compliance' | null>(null);

    // SPOF Calculation
    const spofProcesses = processes.filter((p) => {
        const downstream = dependencies.filter((d) => d.targetProcessId === p.id);
        return downstream.length >= 2;
    });

    // Compliance Gap Calculation (Detailed)
    const [complianceViolations, setComplianceViolations] = useState<any[]>([]);

    useEffect(() => {
        if (!selectedProcessId) {
            setComplianceViolations([]);
            return;
        }

        const proc = getProcessById(selectedProcessId);
        if (!proc) return;

        const mainObjectives = recoveryObjectives[proc.id];
        const mainRto = mainObjectives?.rto || 0;

        const violations: any[] = [];
        const checkedIds = new Set<string>();

        // Check Nodes currently on the canvas to ensure we match what the user sees
        nodes.forEach(node => {
            if (node.id === selectedProcessId) return; // Skip main

            const nodeRto = node.data.rto;
            if (nodeRto !== undefined && node.data.mainRto !== undefined) {
                const nodeRtoHours = toHours(nodeRto);

                // Check Violation
                if (nodeRtoHours > node.data.mainRto) {
                    if (!checkedIds.has(node.id)) {
                        violations.push({
                            id: node.id,
                            name: node.data.label,
                            type: node.type === 'resourceNode' ? 'resource' : 'process',
                            rto: nodeRtoHours,
                            targetRto: node.data.mainRto
                        });
                        checkedIds.add(node.id);
                    }
                }
            }
        });

        setComplianceViolations(violations);

    }, [nodes, selectedProcessId, recoveryObjectives, getProcessById]);

    return (
        <div className="flex-1 flex h-full" ref={reactFlowWrapper}>
            <div className="flex-1 relative bg-black/20">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgesDelete={onEdgesDelete}
                    onNodesDelete={onNodesDelete}
                    deleteKeyCode={['Backspace', 'Delete']}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={memoizedNodeTypes}
                    edgeTypes={memoizedEdgeTypes}
                    fitView
                    className="bg-transparent"
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.1)" />
                    <Controls className="!bg-bia-card !border-bia-border !rounded-lg" />

                    <Panel position="top-right" className="flex gap-2 items-start">
                        {/* Upstream Picker */}
                        <div className="relative">
                            <button
                                onClick={() => setUpstreamPickerOpen(!upstreamPickerOpen)}
                                className={`flex items-center gap-2 px-4 py-2 bg-bia-card border border-bia-border rounded-lg text-bia-text-primary hover:bg-white/5 transition-colors shadow-lg ${upstreamPickerOpen ? 'ring-2 ring-pink-500/50' : ''}`}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Upstream</span>
                            </button>

                            {/* Dropdown */}
                            {upstreamPickerOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-bia-card border border-bia-border rounded-lg shadow-xl p-3 z-50 flex flex-col gap-2 max-h-96">
                                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                        <span className="text-xs font-semibold text-bia-text-secondary uppercase">Select Process</span>
                                        <button onClick={() => setUpstreamPickerOpen(false)}><X className="w-4 h-4 text-bia-text-tertiary hover:text-white" /></button>
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm text-bia-text-primary focus:border-pink-500/50 outline-none"
                                        value={upstreamSearch}
                                        onChange={e => setUpstreamSearch(e.target.value)}
                                    />
                                    <div className="flex-1 overflow-y-auto space-y-1 min-h-[100px]">
                                        {filteredUpstreamProcesses.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleAddUpstream(p.id)}
                                                className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-sm text-bia-text-primary truncate transition-colors"
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                        {filteredUpstreamProcesses.length === 0 && (
                                            <div className="text-center py-4 text-xs text-bia-text-tertiary">No matching processes</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => onLayout('TB')}
                            className="flex items-center gap-2 px-4 py-2 bg-bia-card border border-bia-border rounded-lg text-bia-text-primary hover:bg-white/5 transition-colors shadow-lg"
                        >
                            <Grid className="w-4 h-4" />
                            <span>Auto Layout</span>
                        </button>
                        <button
                            onClick={saveLayout}
                            className="flex items-center gap-2 px-4 py-2 bg-bia-card border border-bia-border rounded-lg text-bia-text-primary hover:bg-white/5 transition-colors shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                            <span>{layoutSaved ? 'Saved' : 'Save Layout'}</span>
                        </button>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Resource Map Wrapper
// ----------------------------------------------------------------------------

export function ResourceMap() {
    const {
        processes,
        selectedProcessId,
        setSelectedProcessId,
        dependencies,
        recoveryObjectives,
        businessResources,
        processResourceLinks,
        getProcessById
    } = useStore();
    const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

    // State for Warning Modal
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningModalType, setWarningModalType] = useState<'spof' | 'compliance' | null>(null);
    const [complianceViolations, setComplianceViolations] = useState<any[]>([]);



    // SPOF Calculation
    const spofProcesses = processes.filter((p) => {
        const downstream = dependencies.filter((d) => d.targetProcessId === p.id);
        return downstream.length >= 2;
    });

    // Compliance Gap Calculation (Detailed)
    useEffect(() => {
        if (!selectedProcessId) {
            setComplianceViolations([]);
            return;
        }

        const proc = getProcessById(selectedProcessId);
        if (!proc) return;

        const mainObjectives = recoveryObjectives[proc.id];
        const mainRto = mainObjectives?.rto || 0;

        const violations: any[] = [];

        // 1. Check Resources
        processResourceLinks.filter(l => l.processId === selectedProcessId).forEach(link => {
            const res = businessResources.find(r => r.id === link.resourceId);
            if (res && res.rto !== undefined && toHours(res.rto) > mainRto) {
                violations.push({
                    id: res.id,
                    name: res.name,
                    type: 'resource',
                    rto: toHours(res.rto),
                    targetRto: mainRto
                });
            }
        });

        // 2. Check Upstream Processes (Dependencies)
        const upstream = dependencies.filter(d => d.targetProcessId === selectedProcessId);
        upstream.forEach(dep => {
            const sourceProc = processes.find(p => p.id === dep.sourceProcessId);
            if (sourceProc) {
                const sourceRto = recoveryObjectives[sourceProc.id]?.rto;
                if (sourceRto !== undefined && sourceRto < mainRto) {
                    violations.push({
                        id: sourceProc.id,
                        name: sourceProc.name,
                        type: 'process',
                        rto: sourceRto,
                        targetRto: mainRto
                    });
                }
            }
        });

        setComplianceViolations(violations);

    }, [selectedProcessId, recoveryObjectives, processResourceLinks, businessResources, dependencies, getProcessById, processes]);

    // VIEW 1: Process Grid (Master)
    if (!selectedProcessId) {
        return (
            <div className="animate-fade-in space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-bia-text-primary">Dependency Mapping</h1>
                    <p className="text-bia-text-secondary mt-1">Select a business process to visualize and map its dependencies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {processes.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedProcessId(p.id)}
                            className="glass-panel-hover p-6 text-left group transition-all duration-300 hover:border-pink-500/50"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold text-bia-text-primary group-hover:text-pink-400 transition-colors">{p.name}</h3>
                            </div>
                            <p className="text-sm text-bia-text-secondary mt-1">{p.department}</p>
                            <div className="flex items-center gap-2 mt-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium criticality-${p.criticality}`}>{p.criticality}</span>
                            </div>
                        </button>
                    ))}

                    {processes.length === 0 && (
                        <div className="col-span-full text-center p-12 glass-panel border-dashed border-2 border-white/10">
                            <Layers className="w-12 h-12 text-bia-text-tertiary mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-bia-text-secondary">No Processes Found</h3>
                            <p className="text-bia-text-tertiary mt-2">Go to the Process Registry to create your first process.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // VIEW 2: Detail
    return (
        <div className="h-[calc(100vh-4rem)] animate-fade-in flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedProcessId(null)}
                        className="p-2 hover:bg-bia-glass-hover rounded-lg transition-colors border border-transparent hover:border-white/10"
                        title="Back to List"
                    >
                        <ChevronLeft className="w-5 h-5 text-bia-text-secondary" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-bia-text-primary flex items-center gap-3">
                            <Layers className="w-6 h-6 text-pink-500" />
                            {processes.find(p => p.id === selectedProcessId)?.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* SPOF Warning */}
                    {spofProcesses.length > 0 && (
                        <button
                            onClick={() => { setWarningModalType('spof'); setWarningModalOpen(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-bia-critical/10 border border-bia-critical/20 rounded-lg text-bia-critical text-sm animate-pulse hover:bg-bia-critical/20 transition-colors cursor-pointer"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-semibold"> {spofProcesses.length} Bottlenecks</span>
                        </button>
                    )}

                    {/* Compliance Warning */}
                    {complianceViolations.length > 0 && (
                        <button
                            onClick={() => { setWarningModalType('compliance'); setWarningModalOpen(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-semibold"> {complianceViolations.length} Compliance Gaps</span>
                        </button>
                    )}

                    {/* View Toggle */}
                    <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${viewMode === 'graph' ? 'bg-bia-primary text-white shadow-lg' : 'text-bia-text-tertiary hover:text-white'}`}
                        >
                            <Grid className="w-4 h-4" />
                            <span className="text-sm font-medium">Graph</span>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-bia-primary text-white shadow-lg' : 'text-bia-text-tertiary hover:text-white'}`}
                        >
                            <Table className="w-4 h-4" />
                            <span className="text-sm font-medium">List</span>
                        </button>
                    </div>
                </div>
            </div>

            <WarningDetailsModal
                isOpen={warningModalOpen}
                onClose={() => setWarningModalOpen(false)}
                type={warningModalType}
                spofProcesses={spofProcesses}
                complianceViolations={complianceViolations}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden rounded-xl border border-white/10 glass-panel p-0 bg-black/30">
                {viewMode === 'graph' ? (
                    <ReactFlowProvider>
                        <DraggableLibrary />
                        <ResourceMapCanvas />
                    </ReactFlowProvider>
                ) : (
                    <DependencyTable />
                )}
            </div>
        </div>
    );
}
