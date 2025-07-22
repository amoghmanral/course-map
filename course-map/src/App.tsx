import { useEffect, useState, useRef } from "react";
import type { NodeMouseHandler } from "reactflow";
import { CourseMap } from "./components/CourseMap";
import { CourseInfoBox } from "./components/CourseInfoBox";
import type { Course, Data } from "./types";
import "./App.css";
import { Header } from "./components/Header";
import LoadingScreen from "./components/LoadingScreen";

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
}

function App() {
  const [data, setData] = useState<Data | null>(null);
  const [selected, setSelected] = useState<Course | null>(null);
  const [centered, setCentered] = useState<Course | null>(null);
  const [inputValue, setInputValue] = useState("");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    fetch("/courses.normalized.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(true), 30000);
    return () => clearTimeout(timer);
  }, []);


  const onNodeClick: NodeMouseHandler = (_, node) => {
    const course = data?.courses.find((c) => c.code === node.id);
    if (course) {
      setSelected(course);
    }
  };

  // Selecting from search or recenter button recenters the graph
  const handleCourseSelect = (course: Course, fromUserAction = false) => {
    setCentered(course);
    if (!isMobile() || fromUserAction) {
      setSelected(course);
    }
    // Zoom out after centering
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.8, minZoom: 0.2, maxZoom: 1.5 });
      }
    }, 100);
  };

  // Initial graph, using COMPSCI 210 as example
  useEffect(() => {
    if (data && !centered) {
      handleCourseSelect(data.courses[2217]);
    }
    // eslint-disable-next-line
  }, [data]);

  // Set reactFlowInstance on mount
  const onInit = (_instance: any) => {
    setReactFlowInstance(_instance);
    // Set initial zoom out
    setTimeout(() => {
      _instance.fitView({ padding: 0.8, minZoom: 0.2, maxZoom: 1.5 });
    }, 100);
  };

  if (!data) return <LoadingScreen />;

  return (
    <div className="app">
      <Header
        data={data}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onCourseSelect={(course) => handleCourseSelect(course, true)}
        showNudge={showNudge}
        onCloseNudge={() => setShowNudge(false)}
      />
      
      <CourseMap
        data={data}
        selected={centered}
        onNodeClick={onNodeClick}
        reactFlowWrapper={reactFlowWrapper}
        onInit={onInit}
      />

      <CourseInfoBox
        course={selected}
        onClose={() => setSelected(null)}
        onRecenter={(course) => handleCourseSelect(course, true)}
      />
    </div>
  );
}

export default App;