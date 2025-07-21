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
import dagre from "dagre";

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

  // Parse comma-separated course strings into individual courses
  function parseCourseString(courseString: string): string[] {
    return courseString.split(',').map(course => course.trim());
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
    const uniqueCourseIds = new Set<string>(); // Track unique courses

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
            background: "#ffd93d",
            color: "black",
            fontWeight: "bold",
            fontSize: "12px",
            border: "2px dashed #666",
            cursor: "pointer",
          },
        });
        
        // Process each course code - handle comma-separated subgroups
        courseCodes.forEach((courseCode: string) => {
          const individualCourses = parseCourseString(courseCode);
          
          if (individualCourses.length === 1) {
            // Single course
            const courseId = individualCourses[0];
            if (!uniqueCourseIds.has(courseId)) {
              courseNodes.push({
                id: courseId,
                type: "default",
                position: { x: 0, y: -300 }, // Will be positioned later
                data: { label: courseId },
                style: {
                  background: "#4ecdc4",
                  color: "black",
                  fontSize: "12px",
                  cursor: "pointer",
                },
              });
              uniqueCourseIds.add(courseId);
            }
            
            // Add dotted edge from course to OR node
            virtualEdges.push({
              id: `${courseId}-${orNodeId}`,
              source: courseId,
              target: orNodeId,
              type: "smoothstep",
              style: { stroke: "#666", strokeWidth: 1, strokeDasharray: "5,5" },
            });
          } else {
            // Multiple courses (AND relationship) - create AND node
            const andNodeId = `and_${virtualNodeCounter++}`;
            virtualNodes.push({
              id: andNodeId,
              type: "default",
              position: { x: 0, y: -200 }, // Will be positioned later
              data: { label: "AND" },
              style: {
                background: "#ff6b6b",
                color: "black",
                fontWeight: "bold",
                fontSize: "12px",
                border: "2px solid #666",
                cursor: "pointer",
              },
            });
            
            // Create nodes for each course in the AND group (only if not already created)
            individualCourses.forEach((course: string) => {
              if (!uniqueCourseIds.has(course)) {
                courseNodes.push({
                  id: course,
                  type: "default",
                  position: { x: 0, y: -300 }, // Will be positioned later
                  data: { label: course },
                  style: {
                    background: "#4ecdc4",
                    color: "black",
                    fontSize: "12px",
                    cursor: "pointer",
                  },
                });
                uniqueCourseIds.add(course);
              }
              
              // Add solid edge from course to AND node
              virtualEdges.push({
                id: `${course}-${andNodeId}`,
                source: course,
                target: andNodeId,
                type: "smoothstep",
                style: { stroke: "#666", strokeWidth: 2 },
              });
            });
            
            // Add dotted edge from AND node to OR node
            virtualEdges.push({
              id: `${andNodeId}-${orNodeId}`,
              source: andNodeId,
              target: orNodeId,
              type: "smoothstep",
              style: { stroke: "#666", strokeWidth: 1, strokeDasharray: "5,5" },
            });
          }
        });
        
        // The final prerequisite is the OR node
        finalPrereqNodes = [orNodeId];
      } else {
        // Single course, no OR node needed
        const individualCourses = parseCourseString(courseCodes[0]);
        finalPrereqNodes = individualCourses;
      }
    } else if (prereq.type === "and") {
      finalPrereqNodes = prereq.courses || [];
    } else if (prereq.type === "complex") {
      const groups = prereq.groups || [];
      const groupNodes: string[] = [];
      
      // Process each group separately
      groups.forEach((group: any, groupIndex: number) => {
        const groupCodes = group.courses || [];
        if (groupCodes.length === 0) return;
        
        if (groupCodes.length === 1) {
          // Single item in group - parse for comma-separated courses
          const individualCourses = parseCourseString(groupCodes[0]);
          if (individualCourses.length === 1) {
            groupNodes.push(individualCourses[0]);
          } else {
            // Multiple courses in single item - create AND node
            const andNodeId = `and_${virtualNodeCounter++}`;
            virtualNodes.push({
              id: andNodeId,
              type: "default",
              position: { x: 0, y: -200 }, // Will be positioned later
              data: { label: "AND" },
              style: {
                background: "#ff6b6b",
                color: "black",
                fontWeight: "bold",
                fontSize: "12px",
                border: "2px solid #666",
                cursor: "pointer",
              },
            });
            
            // Create nodes for each course (only if not already created)
            individualCourses.forEach((course: string) => {
              if (!uniqueCourseIds.has(course)) {
                courseNodes.push({
                  id: course,
                  type: "default",
                  position: { x: 0, y: -300 }, // Will be positioned later
                  data: { label: course },
                  style: {
                    background: "#4ecdc4",
                    color: "black",
                    fontSize: "12px",
                    cursor: "pointer",
                  },
                });
                uniqueCourseIds.add(course);
              }
              
              // Add solid edge from course to AND node
              virtualEdges.push({
                id: `${course}-${andNodeId}`,
                source: course,
                target: andNodeId,
                type: "smoothstep",
                style: { stroke: "#666", strokeWidth: 2 },
              });
            });
            
            groupNodes.push(andNodeId);
          }
        } else if (group.type === "or") {
          // Create virtual OR node for this group
          const orNodeId = `or_${virtualNodeCounter++}`;
          virtualNodes.push({
            id: orNodeId,
            type: "default",
            position: { x: 0, y: -100 }, // Will be positioned later
            data: { label: "OR" },
            style: {
              background: "#ffd93d",
              color: "black",
              fontWeight: "bold",
              fontSize: "12px",
              border: "2px dashed #666",
              cursor: "pointer",
            },
          });
          
          // Process each course code in the OR group
          groupCodes.forEach((courseCode: string) => {
            const individualCourses = parseCourseString(courseCode);
            
            if (individualCourses.length === 1) {
              // Single course
              const courseId = individualCourses[0];
              if (!uniqueCourseIds.has(courseId)) {
                courseNodes.push({
                  id: courseId,
                  type: "default",
                  position: { x: 0, y: -300 }, // Will be positioned later
                  data: { label: courseId },
                  style: {
                    background: "#4ecdc4",
                    color: "black",
                    fontSize: "12px",
                    cursor: "pointer",
                  },
                });
                uniqueCourseIds.add(courseId);
              }
              
              // Add dotted edge from course to OR node
              virtualEdges.push({
                id: `${courseId}-${orNodeId}`,
                source: courseId,
                target: orNodeId,
                type: "smoothstep",
                style: { stroke: "#666", strokeWidth: 1, strokeDasharray: "5,5" },
              });
            } else {
              // Multiple courses (AND relationship) - create AND node
              const andNodeId = `and_${virtualNodeCounter++}`;
              virtualNodes.push({
                id: andNodeId,
                type: "default",
                position: { x: 0, y: -200 }, // Will be positioned later
                data: { label: "AND" },
                style: {
                  background: "#ff6b6b",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "12px",
                  border: "2px solid #666",
                  cursor: "pointer",
                },
              });
              
              // Create nodes for each course in the AND group (only if not already created)
              individualCourses.forEach((course: string) => {
                if (!uniqueCourseIds.has(course)) {
                  courseNodes.push({
                    id: course,
                    type: "default",
                    position: { x: 0, y: -300 }, // Will be positioned later
                    data: { label: course },
                    style: {
                      background: "#4ecdc4",
                      color: "black",
                      fontSize: "12px",
                      cursor: "pointer",
                    },
                  });
                  uniqueCourseIds.add(course);
                }
                
                // Add solid edge from course to AND node
                virtualEdges.push({
                  id: `${course}-${andNodeId}`,
                  source: course,
                  target: andNodeId,
                  type: "smoothstep",
                  style: { stroke: "#666", strokeWidth: 2 },
                });
              });
              
              // Add dotted edge from AND node to OR node
              virtualEdges.push({
                id: `${andNodeId}-${orNodeId}`,
                source: andNodeId,
                target: orNodeId,
                type: "smoothstep",
                style: { stroke: "#666", strokeWidth: 1, strokeDasharray: "5,5" },
              });
            }
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

  // Helper to layout nodes using dagre
  function layoutWithDagre(nodes: Node[], edges: Edge[]): Node[] {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 });

    // Set nodes in dagre
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 120, height: 50 });
    });
    // Set edges in dagre
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // Update node positions
    return nodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: dagreNode ? dagreNode.x : node.position.x,
          y: dagreNode ? dagreNode.y : node.position.y,
        },
      };
    });
  }

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
          cursor: "pointer",
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
        const finalPrereqPositions = rowLayout(finalPrereqNodes.length, -50);
        
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
                cursor: "pointer",
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
          const individualPositions = rowLayout(individualCourseNodes.length, -250);
          individualCourseNodes.forEach((node, index) => {
            node.position = individualPositions[index];
          });
        }
        
        // Position AND nodes that feed into OR nodes
        const andNodes = virtualNodes.filter(node => node.id.startsWith('and_'));
        if (andNodes.length > 0) {
          const andPositions = rowLayout(andNodes.length, -150);
          andNodes.forEach((node, index) => {
            node.position = andPositions[index];
          });
        }
        
        // Position OR nodes
        const orNodes = virtualNodes.filter(node => node.id.startsWith('or_'));
        if (orNodes.length > 0) {
          const orPositions = rowLayout(orNodes.length, -50);
          orNodes.forEach((node, index) => {
            node.position = orPositions[index];
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
              cursor: "pointer",
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

      setNodes(layoutWithDagre(newNodes, newEdges));
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