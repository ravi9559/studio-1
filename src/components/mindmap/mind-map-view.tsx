
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Person } from '@/types';
import { Building, LandPlot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const dagreGraph = new Dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'left';
    node.sourcePosition = 'right';
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const CustomNode = ({ data }: { data: { label: string, type: string, icon: React.ReactNode, level?: number } }) => (
  <Card className={cn(
    "w-[250px] h-[70px] shadow-md flex items-center p-3 bg-card/80 backdrop-blur-sm transition-opacity duration-300",
    (data.level && data.level >= 3) ? "opacity-60" : "opacity-100"
  )}>
    <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {data.icon}
        </div>
        <div>
            <div className="font-bold text-sm truncate">{data.label}</div>
            <div className="text-xs text-muted-foreground">{data.type}</div>
        </div>
    </div>
  </Card>
);

const nodeTypes = { custom: CustomNode };

// Component that does the actual work
function MindMapFlow({ projectName, familyHeads }: { projectName: string; familyHeads: Person[] }) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['project-root']));

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

    // This effect rebuilds and re-layouts the entire graph when expansion changes
    useEffect(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        
        // Always add project root
        newNodes.push({
            id: 'project-root',
            type: 'custom',
            data: { label: projectName, type: 'Project', icon: <Building size={24} />, level: 0 },
            position: { x: 0, y: 0 },
        });

        if (expandedNodes.has('project-root')) {
            // Recursively build the graph
            const buildGraph = (people: Person[], parentId: string, level: number) => {
                people.forEach(person => {
                    newNodes.push({
                        id: person.id,
                        type: 'custom',
                        data: { 
                            label: person.name, 
                            type: person.relation, 
                            icon: <User size={24} />,
                            level,
                        },
                        position: { x: 0, y: 0 },
                    });
                    newEdges.push({ id: `e-${parentId}-${person.id}`, source: parentId, target: person.id, type: 'smoothstep', animated: true, style: { strokeWidth: 1.5 } });

                    if (expandedNodes.has(person.id)) {
                        // Add children if expanded
                        if (person.heirs && person.heirs.length > 0) {
                            buildGraph(person.heirs, person.id, level + 1);
                        }
                        if (person.landRecords && person.landRecords.length > 0) {
                            person.landRecords.forEach(lr => {
                                newNodes.push({
                                    id: lr.id,
                                    type: 'custom',
                                    data: { 
                                        label: `S.No: ${lr.surveyNumber}`, 
                                        type: `${lr.acres || '0'}ac, ${lr.cents || '0'}c`, 
                                        icon: <LandPlot size={24} />,
                                        level: level + 1
                                    },
                                    position: { x: 0, y: 0 },
                                });
                                newEdges.push({ id: `e-${person.id}-${lr.id}`, source: person.id, target: lr.id, type: 'smoothstep', animated: true, style: { strokeWidth: 1.5 } });
                            });
                        }
                    }
                });
            };
            
            buildGraph(familyHeads, 'project-root', 1);
        }
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
        
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [projectName, familyHeads, expandedNodes]);

    // This effect centers the view when the layout changes
    useEffect(() => {
        if (nodes.length) {
            fitView({ duration: 400 });
        }
    }, [nodes, fitView]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setExpandedNodes(currentExpanded => {
            const newExpanded = new Set(currentExpanded);
            if (newExpanded.has(node.id)) {
                // If it's expanded, collapse it (and all its descendants)
                const person = findPerson(familyHeads, node.id);
                const idsToCollapse = new Set<string>();
                if(person) {
                    const collectIds = (p: Person) => {
                        idsToCollapse.add(p.id);
                        if (p.heirs) {
                           p.heirs.forEach(collectIds);
                        }
                    }
                    collectIds(person);
                } else {
                    idsToCollapse.add(node.id)
                }

                idsToCollapse.forEach(id => newExpanded.delete(id));

            } else {
                // If it's collapsed, expand it
                newExpanded.add(node.id);
            }
            return newExpanded;
        });
    }, [familyHeads]);

    const findPerson = (people: Person[], id: string): Person | null => {
        for (const person of people) {
            if (person.id === id) return person;
            if (person.heirs && person.heirs.length > 0) {
              const found = findPerson(person.heirs, id);
              if (found) return found;
            }
        }
        return null;
    };


    if (!familyHeads || familyHeads.length === 0) {
        return (
            <CardContent className="p-8 text-center text-muted-foreground">
                No lineage data available to build the mind map. Please import data in the "Family Lineage" tab.
            </CardContent>
        );
    }

    return (
        <CardContent className="p-0" style={{ height: '600px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <Background />
            </ReactFlow>
        </CardContent>
    );
}


// Main Mind Map View component with provider
export function MindMapView({ projectName, familyHeads }: { projectName: string; familyHeads: Person[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Mind Map</CardTitle>
                <CardDescription>An interactive hierarchy of the project's ownership. Click a person to expand or collapse their branch.</CardDescription>
            </CardHeader>
            <ReactFlowProvider>
                <MindMapFlow projectName={projectName} familyHeads={familyHeads} />
            </ReactFlowProvider>
        </Card>
    );
}
