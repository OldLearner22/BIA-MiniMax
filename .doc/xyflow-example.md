import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node components for different shapes
const CircleNode = ({ data }) => (
  <div style={{
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: data.color || '#6366f1',
    border: '2px solid #4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
  }}>
    {data.label}
  </div>
);

const RectangleNode = ({ data }) => (
  <div style={{
    width: 120,
    height: 60,
    background: data.color || '#10b981',
    border: '2px solid #059669',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
  }}>
    {data.label}
  </div>
);

const DiamondNode = ({ data }) => (
  <div style={{
    width: 80,
    height: 80,
    background: data.color || '#f59e0b',
    border: '2px solid #d97706',
    transform: 'rotate(45deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      transform: 'rotate(-45deg)',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
    }}>
      {data.label}
    </div>
  </div>
);

const nodeTypes = {
  circle: CircleNode,
  rectangle: RectangleNode,
  diamond: DiamondNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'circle',
    position: { x: 100, y: 100 },
    data: { label: 'Start', color: '#6366f1' },
  },
  {
    id: '2',
    type: 'rectangle',
    position: { x: 300, y: 100 },
    data: { label: 'Process', color: '#10b981' },
  },
  {
    id: '3',
    type: 'diamond',
    position: { x: 520, y: 80 },
    data: { label: 'Decision', color: '#f59e0b' },
  },
  {
    id: '4',
    type: 'rectangle',
    position: { x: 300, y: 250 },
    data: { label: 'Action A', color: '#8b5cf6' },
  },
  {
    id: '5',
    type: 'rectangle',
    position: { x: 500, y: 250 },
    data: { label: 'Action B', color: '#ec4899' },
  },
  {
    id: '6',
    type: 'circle',
    position: { x: 400, y: 380 },
    data: { label: 'End', color: '#ef4444' },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export default function FlowDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f8fafc' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 4,
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Interactive Flow Diagram
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          Drag shapes to move • Click and drag from edge to connect nodes
        </p>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'circle': return '#6366f1';
              case 'rectangle': return '#10b981';
              case 'diamond': return '#f59e0b';
              default: return '#94a3b8';
            }
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}