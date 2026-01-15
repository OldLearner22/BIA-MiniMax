import { useState, useCallback, useMemo, DragEvent, useRef, useEffect } from 'react';
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
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';
import { Save, Users, Monitor, Wrench, Building, Truck, Database, Workflow, Settings2, X } from 'lucide-react';
import { RESOURCE_TYPES, ResourceType } from '../types';

// Shape types
type NodeShape = 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'hexagon';

const SHAPES: { value: NodeShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
];

const PRESET_COLORS = [
  '#818CF8', '#22C55E', '#3B82F6', '#F97316', '#A855F7', 
  '#EF4444', '#06B6D4', '#FBBF24', '#EC4899', '#6B7280'
];

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

// Shape clip paths
const getShapeStyles = (shape: NodeShape, color: string) => {
  const base = { backgroundColor: `${color}20`, borderColor: `${color}80` };
  switch (shape) {
    case 'rectangle': return { ...base, borderRadius: '4px' };
    case 'rounded': return { ...base, borderRadius: '16px' };
    case 'circle': return { ...base, borderRadius: '50%', minWidth: '120px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
    case 'diamond': return { ...base, transform: 'rotate(45deg)', borderRadius: '8px' };
    case 'hexagon': return { ...base, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', borderRadius: '0' };
    default: return base;
  }
};

// 4-sided handles component
function FourHandles({ color, isTarget = false }: { color: string; isTarget?: boolean }) {
  const type = isTarget ? 'target' : 'source';
  return (
    <>
      <Handle type={type} position={Position.Top} id={`${type}-top`} style={{ background: color }} className="!w-2 !h-2" />
      <Handle type={type} position={Position.Bottom} id={`${type}-bottom`} style={{ background: color }} className="!w-2 !h-2" />
      <Handle type={type} position={Position.Left} id={`${type}-left`} style={{ background: color }} className="!w-2 !h-2" />
      <Handle type={type} position={Position.Right} id={`${type}-right`} style={{ background: color }} className="!w-2 !h-2" />
    </>
  );
}

// Context menu for node customization
interface ContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  currentShape: NodeShape;
  currentColor: string;
  onChangeShape: (shape: NodeShape) => void;
  onChangeColor: (color: string) => void;
  onClose: () => void;
}

function NodeContextMenu({ nodeId, x, y, currentShape, currentColor, onChangeShape, onChangeColor, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [localShape, setLocalShape] = useState(currentShape);
  const [customColor, setCustomColor] = useState(currentColor);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleShapeChange = (shape: NodeShape) => {
    setLocalShape(shape);
    onChangeShape(shape);
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-bia-card border border-bia-border rounded-lg shadow-xl p-3 min-w-[200px]"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-bia-text-primary">Node Settings</span>
        <button onClick={onClose} className="text-bia-text-tertiary hover:text-bia-text-primary"><X className="w-4 h-4" /></button>
      </div>
      
      {/* Shape Selection */}
      <div className="mb-3">
        <label className="text-xs text-bia-text-tertiary block mb-1">Shape</label>
        <div className="grid grid-cols-5 gap-1">
          {SHAPES.map(s => (
            <button
              key={s.value}
              onClick={() => handleShapeChange(s.value)}
              className={`p-1.5 rounded text-xs ${localShape === s.value ? 'bg-bia-primary text-white' : 'bg-white/10 text-bia-text-secondary hover:bg-white/20'}`}
              title={s.label}
            >
              {s.label.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-xs text-bia-text-tertiary block mb-1">Color</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onChangeColor(c)}
              className={`w-6 h-6 rounded border-2 ${currentColor === c ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <button
            onClick={() => onChangeColor(customColor)}
            className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-bia-text-secondary"
          >
            Apply Custom
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom node components
function ProcessNode({ id, data }: NodeProps) {
  const isCenter = data.isCenter;
  const shape = (data.shape as NodeShape) || 'rounded';
  const customColor = data.customColor as string | undefined;
  const baseColor = isCenter ? '#818CF8' : '#3B82F6';
  const color = customColor || baseColor;
  const shapeStyles = getShapeStyles(shape, color);

  const content = (
    <div className="flex items-center justify-center gap-2" style={shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
      <Workflow className="w-4 h-4" style={{ color }} />
      <span className="font-medium text-bia-text-primary text-sm">{data.label}</span>
    </div>
  );

  return (
    <div
      className="px-4 py-3 border-2 min-w-[140px] text-center relative"
      style={shapeStyles}
    >
      <FourHandles color={color} isTarget={true} />
      {!isCenter && <FourHandles color={color} isTarget={false} />}
      {content}
      {isCenter && <div className="text-xs text-bia-text-tertiary mt-1" style={shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>Center</div>}
      {!isCenter && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-bia-card border border-bia-border flex items-center justify-center hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); data.onOpenMenu?.(id, e.clientX, e.clientY); }}
        >
          <Settings2 className="w-3 h-3 text-bia-text-tertiary" />
        </button>
      )}
    </div>
  );
}

function ResourceNode({ id, data }: NodeProps) {
  const shape = (data.shape as NodeShape) || 'rounded';
  const defaultColor = RESOURCE_COLORS[data.resourceType as ResourceType] || '#6B7280';
  const color = (data.customColor as string) || defaultColor;
  const Icon = RESOURCE_ICONS[data.resourceType as ResourceType] || Database;
  const shapeStyles = getShapeStyles(shape, color);

  const content = (
    <div style={shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-bia-text-primary font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-xs mt-1" style={{ color }}>{data.resourceTypeLabel}</div>
    </div>
  );

  return (
    <div className="px-4 py-3 border-2 min-w-[130px] relative" style={shapeStyles}>
      <FourHandles color={color} isTarget={true} />
      <FourHandles color={color} isTarget={false} />
      {content}
      <button
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-bia-card border border-bia-border flex items-center justify-center hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); data.onOpenMenu?.(id, e.clientX, e.clientY); }}
      >
        <Settings2 className="w-3 h-3 text-bia-text-tertiary" />
      </button>
    </div>
  );
}

const nodeTypes = {
  processNode: ProcessNode,
  resourceNode: ResourceNode,
};

interface ProcessDependencyMap {
  processId: string;
  nodes: Node[];
  edges: Edge[];
}

export function ProcessDependencies() {
  const { processes, settings } = useStore();
  const businessResources = settings.businessResources || [];
  
  const loadSavedMaps = (): Record<string, ProcessDependencyMap> => {
    try {
      const saved = localStorage.getItem('bia-process-dependency-maps');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const [savedMaps, setSavedMaps] = useState<Record<string, ProcessDependencyMap>>(loadSavedMaps);
  const [selectedProcessId, setSelectedProcessId] = useState<string>(processes[0]?.id || '');
  const [saved, setSaved] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);

  const currentProcess = processes.find(p => p.id === selectedProcessId);
  const otherProcesses = processes.filter(p => p.id !== selectedProcessId);

  const openNodeMenu = useCallback((nodeId: string, x: number, y: number) => {
    setContextMenu({ nodeId, x, y });
  }, []);

  const getInitialData = useCallback(() => {
    const savedMap = savedMaps[selectedProcessId];
    if (savedMap) {
      return {
        nodes: savedMap.nodes.map(n => ({ ...n, data: { ...n.data, onOpenMenu: openNodeMenu } })),
        edges: savedMap.edges
      };
    }
    const centerNode: Node = {
      id: 'center',
      type: 'processNode',
      position: { x: 400, y: 250 },
      data: { label: currentProcess?.name || 'Process', isCenter: true, onOpenMenu: openNodeMenu },
      deletable: false,
    };
    return { nodes: [centerNode], edges: [] };
  }, [selectedProcessId, savedMaps, currentProcess, openNodeMenu]);

  const initialData = useMemo(getInitialData, [getInitialData]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  const handleProcessChange = (processId: string) => {
    setSelectedProcessId(processId);
    setContextMenu(null);
    const savedMap = savedMaps[processId];
    const process = processes.find(p => p.id === processId);
    if (savedMap) {
      setNodes(savedMap.nodes.map(n => ({ ...n, data: { ...n.data, onOpenMenu: openNodeMenu } })));
      setEdges(savedMap.edges);
    } else {
      setNodes([{
        id: 'center',
        type: 'processNode',
        position: { x: 400, y: 250 },
        data: { label: process?.name || 'Process', isCenter: true, onOpenMenu: openNodeMenu },
        deletable: false,
      }]);
      setEdges([]);
    }
  };

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ 
      ...connection, 
      animated: true, 
      style: { stroke: '#818CF8', strokeWidth: 2 },
      deletable: true,
    }, eds));
  }, [setEdges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    // Toggle selection styling on click
    setEdges((eds) => eds.map(e => ({
      ...e,
      selected: e.id === edge.id ? !e.selected : false,
      style: e.id === edge.id && !e.selected 
        ? { stroke: '#EF4444', strokeWidth: 3 } 
        : { stroke: '#818CF8', strokeWidth: 2 }
    })));
  }, [setEdges]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;
    
    const item = JSON.parse(data);
    const reactFlowBounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const position = {
      x: event.clientX - reactFlowBounds.left - 80,
      y: event.clientY - reactFlowBounds.top - 30,
    };

    const newNode: Node = {
      id: `${item.type}-${item.id}-${Date.now()}`,
      type: item.type === 'process' ? 'processNode' : 'resourceNode',
      position,
      data: item.type === 'process' 
        ? { label: item.name, isCenter: false, shape: 'rounded', onOpenMenu: openNodeMenu }
        : { label: item.name, resourceType: item.resourceType, resourceTypeLabel: item.resourceTypeLabel, shape: 'rounded', onOpenMenu: openNodeMenu },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, openNodeMenu]);

  const handleSave = () => {
    // Strip onOpenMenu before saving
    const nodesToSave = nodes.map(n => {
      const { onOpenMenu, ...rest } = n.data;
      return { ...n, data: rest };
    });
    const newMaps = {
      ...savedMaps,
      [selectedProcessId]: { processId: selectedProcessId, nodes: nodesToSave, edges }
    };
    setSavedMaps(newMaps);
    localStorage.setItem('bia-process-dependency-maps', JSON.stringify(newMaps));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDragStart = (event: DragEvent, item: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleChangeShape = (nodeId: string, shape: NodeShape) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, shape } } : n));
  };

  const handleChangeColor = (nodeId: string, color: string) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, customColor: color } } : n));
  };

  const selectedNode = nodes.find(n => n.id === contextMenu?.nodeId);

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

  return (
    <div className="animate-fade-in h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Process Dependencies</h1>
          <p className="text-bia-text-secondary mt-1">Map resources and processes that support each business process</p>
        </div>
        <button onClick={handleSave} className="glass-button-solid flex items-center gap-2">
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Dependencies'}
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedProcessId}
          onChange={(e) => handleProcessChange(e.target.value)}
          className="glass-input w-full max-w-md"
        >
          {processes.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.department})</option>
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
                  const typeLabel = RESOURCE_TYPES.find(t => t.value === resource.type)?.label || resource.type;
                  return (
                    <div
                      key={resource.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { 
                        type: 'resource', 
                        id: resource.id, 
                        name: resource.name,
                        resourceType: resource.type,
                        resourceTypeLabel: typeLabel
                      })}
                      className="p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
                    >
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
                    onDragStart={(e) => handleDragStart(e, { type: 'process', id: process.id, name: process.name })}
                    className="p-2 rounded-lg border border-blue-500/30 bg-blue-500/10 cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                  >
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
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            className="bg-black/20"
          >
            <Controls className="!bg-bia-card !border-bia-border !rounded-lg [&>button]:!bg-bia-card [&>button]:!border-bia-border [&>button]:!text-bia-text-primary [&>button:hover]:!bg-white/10" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.1)" />
          </ReactFlow>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && selectedNode && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          currentShape={(selectedNode.data.shape as NodeShape) || 'rounded'}
          currentColor={(selectedNode.data.customColor as string) || (selectedNode.data.resourceType ? RESOURCE_COLORS[selectedNode.data.resourceType as ResourceType] : '#818CF8')}
          onChangeShape={(shape) => handleChangeShape(contextMenu.nodeId, shape)}
          onChangeColor={(color) => handleChangeColor(contextMenu.nodeId, color)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
