import { useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import type { Node, Edge, NodeMouseHandler } from "reactflow";
import "reactflow/dist/style.css";
import type { Course, Data } from "../types";

interface CourseMapProps {
  data: Data;
  selected: Course | null;
  onNodeClick: NodeMouseHandler;
  reactFlowWrapper: React.RefObject<HTMLDivElement | null>;
  onInit: (instance: any) => void;
}

export function CourseMap({ data, selected, onNodeClick, reactFlowWrapper, onInit }: CourseMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Row layout for nodes
  function rowLayout(count: number, y: number, spacing = 180, centerX = 0) {
    if (count === 0) return [];
    const totalWidth = (count - 1) * spacing;
    return Array.from({ length: count }, (_, i) => ({
      x: centerX - totalWidth / 2 + i * spacing,
      y,
    }));
  }

  // Extract course codes and create virtual OR nodes
  const extractPrereqStructure = (prereq: any): { 
    courseNodes: Node[], 
    virtualNodes: Node[], 
    virtualEdges: Edge[],
    finalPrereqNodes: string[] 
  } => {
    if (!prereq) return { courseNodes: [], virtualNodes: [], virtualEdges: [], finalPrereqNodes: [] };

    const courseNodes: Node[] = [];
    const virtualNodes: Node[] = [];
    const virtualEdges: Edge[] = [];
    let finalPrereqNodes: string[] = [];
    let virtualNodeCounter = 0;

    if (prereq.type === "simple") {
      // For simple prerequisites, just return the course codes
      finalPrereqNodes = prereq.courses || [];
    } else if (prereq.type === "or") {
      const courseCodes = prereq.courses || [];
      if (courseCodes.length > 1) {
        // Create virtual OR node
        const orNodeId = `or_${virtualNodeCounter++}`;
        virtualNodes.push({
          id: orNodeId,
          type: "default",
          position: { x: 0, y: -100 }, // Will be positioned later
          data: { label: "OR" },
          style: {
            background: "none",
            color: "black",
            fontWeight: "bold",
            fontSize: "12px",
            border: "2px dashed #666",
          },
        });
        
        // Create individual course nodes and add edges to OR node
        courseCodes.forEach((code: string) => {
          courseNodes.push({
            id: code,
            type: "default",
            position: { x: 0, y: -200 }, // Will be positioned later
            data: { label: code },
            style: {
              background: "#4ecdc4",
              color: "black",
              fontSize: "12px",
            },
          });
          
          // Add dotted edge from course to OR node
          virtualEdges.push({
            id: `${code}-${orNodeId}`,
            source: code,
            target: orNodeId,
            type: "smoothstep",
            style: { stroke: "#666", strokeWidth: 1, strokeDasharray: "5,5" },
          });
        });
        
        finalPrereqNodes = [orNodeId];
      } else {
        // Single course, no OR node needed
        finalPrereqNodes = courseCodes;
      }
    } else if (prereq.type === "and") {
      finalPrereqNodes = prereq.courses || [];
    } else if (prereq.type === "complex") {
      const groups = prereq.groups || [];
      const groupNodes: string[] = [];
      
      groups.forEach((group: any) => {
        const groupCodes = group.courses || [];
        if (groupCodes.length === 0) return;
        
        if (groupCodes.length === 1) {
          groupNodes.push(groupCodes[0]);
        } else if (group.type === "or") {
          // Create virtual OR node for this group
          const orNodeId = `or_${virtualNodeCounter++}`;
          virtualNodes.push({
            id: orNodeId,
            type: "default",
            position: { x: 0, y: -100 }, // Will be positioned later
            data: { label: "OR" },
            style: {
              background: "none",
              color: "black",
              fontWeight: "bold",
              fontSize: "12px",
              border: "2px dashed #666",
            },
          });
          
          // Create individual course nodes for this OR group
          groupCodes.forEach((code: string) => {
            courseNodes.push({
              id: code,
              type: "default",
              position: { x: 0, y: -200 }, // Will be positioned later
              data: { label: code },
              style: {
                background: "#4ecdc4",
                color: "black",
                fontSize: "12px",
              },
            });
            
            // Add dotted edge from course to OR node
            virtualEdges.push({
              id: `${code}-${orNodeId}`,
              source: code,
              target: orNodeId,
              type: "smoothstep",
              style: { stroke: "#666", strokeWidth: 1, strokeDasharray: "5,5" },
            });
          });
          
          groupNodes.push(orNodeId);
        } else {
          groupNodes.push(...groupCodes);
        }
      });
      
      finalPrereqNodes = groupNodes;
    }

    return { courseNodes, virtualNodes, virtualEdges, finalPrereqNodes };
  };

  const generateGraph = useCallback(
    (course: Course) => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const nodeIds = new Set<string>();
      
      // Center node
      newNodes.push({
        id: course.code,
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: course.code },
        style: {
          background: "#ff6b6b",
          color: "black",
          fontWeight: "bold",
          fontSize: "14px",
        },
      });
      nodeIds.add(course.code);

      // Handle prerequisites with virtual nodes
      if (course.prerequisites) {
        const { courseNodes, virtualNodes, virtualEdges, finalPrereqNodes } = extractPrereqStructure(course.prerequisites);
        
        // Add all course nodes (individual courses that feed into OR nodes)
        courseNodes.forEach(node => {
          newNodes.push(node);
          nodeIds.add(node.id);
        });
        
        // Add virtual nodes (OR nodes)
        virtualNodes.forEach(node => {
          newNodes.push(node);
          nodeIds.add(node.id);
        });
        
        // Add virtual edges (dotted lines from courses to OR nodes)
        newEdges.push(...virtualEdges);
        
        // Position all final prerequisite nodes (OR nodes and direct prerequisites)
        const finalPrereqPositions = rowLayout(finalPrereqNodes.length, -200);
        
        finalPrereqNodes.forEach((nodeId, index) => {
          // Update position of existing nodes (OR nodes or direct prerequisites)
          const existingNode = newNodes.find(n => n.id === nodeId);
          if (existingNode) {
            existingNode.position = finalPrereqPositions[index];
          } else {
            // This is a direct prerequisite that wasn't part of an OR group
            newNodes.push({
              id: nodeId,
              type: "default",
              position: finalPrereqPositions[index],
              data: { label: nodeId },
              style: {
                background: "#4ecdc4",
                color: "black",
                fontSize: "12px",
              },
            });
            nodeIds.add(nodeId);
          }
          
          // Add solid edge from final prereq node to center course
          newEdges.push({
            id: `${nodeId}-${course.code}`,
            source: nodeId,
            target: course.code,
            type: "smoothstep",
            style: { stroke: "#4ecdc4", strokeWidth: 2 },
          });
        });
        
        // Position individual course nodes that feed into OR nodes
        const individualCourseNodes = courseNodes.filter(node => !finalPrereqNodes.includes(node.id));
        if (individualCourseNodes.length > 0) {
          const individualPositions = rowLayout(individualCourseNodes.length, -300);
          individualCourseNodes.forEach((node, index) => {
            node.position = individualPositions[index];
          });
        }
      }

      // Outputs
      const outputCodes = data.reversePrereqs[course.code] || [];
      const outputPositions = rowLayout(outputCodes.length, 200);
      outputCodes.forEach((code, index) => {
        if (!nodeIds.has(code)) {
          newNodes.push({
            id: code,
            type: "default",
            position: outputPositions[index],
            data: { label: code },
            style: {
              background: "#45b7d1",
              color: "black",
              fontSize: "12px",
            },
          });
          nodeIds.add(code);
        }
        newEdges.push({
          id: `${course.code}-${code}`,
          source: course.code,
          target: code,
          type: "smoothstep",
          style: { stroke: "#45b7d1", strokeWidth: 2 },
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [data, setNodes, setEdges]
  );

  // Generate graph when selected course changes
  useMemo(() => {
    if (selected) {
      generateGraph(selected);
    }
  }, [selected, generateGraph]);

  return (
    <div style={{ width: "100vw", height: "100vh" }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        onInit={onInit}
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Controls position="bottom-right" />
        <Background />
      </ReactFlow>
    </div>
  );
} 