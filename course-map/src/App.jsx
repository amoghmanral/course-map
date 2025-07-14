import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("/courses.normalized.json")
      .then(res => res.json())
      .then(data => {
        console.log("Loaded courses:", data);
      });
  }, []);

  return <div>Course Map App</div>;
}

export default App;
