import { useEffect, useState } from "react";

type Prereq =
  | { type: "simple"; courses: string[] }
  | { type: "or" | "and"; courses: string[] }
  | { type: "complex"; groups: { type: "or" | "simple"; courses: string[] }[] }
  | null;

type Course = {
  id: string;
  code: string;
  title: string;
  description: string;
  prerequisites: Prereq;
  // ...other fields
};

type Data = {
  courses: Course[];
  reversePrereqs: Record<string, string[]>;
};

function App() {
  const [data, setData] = useState<Data | null>(null);
  const [selected, setSelected] = useState<Course | null>(null);

  useEffect(() => {
    fetch("/courses.normalized.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 400, borderRight: "1px solid #ccc", height: "100vh", overflow: "auto" }}>
        <h2>Courses</h2>
        <ul>
          {data.courses.slice(0, 10000).map((course) => (
            <li key={course.code}>
              <button onClick={() => setSelected(course)} style={{ background: "none", border: "none", textAlign: "left", cursor: "pointer" }}>
                {course.code}: {course.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: 24 }}>
        {selected ? (
          <>
            <h2>
              {selected.code}: {selected.title}
            </h2>
            <p>{selected.description}</p>
            <h3>Prerequisites</h3>
            <pre>{JSON.stringify(selected.prerequisites, null, 2)}</pre>
            <h3>Unlocks (outputs)</h3>
            <ul>
              {(data.reversePrereqs[selected.code] || []).map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Select a course to see details.</p>
        )}
      </div>
    </div>
  );
}

export default App;