# Duke Course Map

A visual, interactive map of Duke University's course prerequisites and curriculum structure.

Unlike most course planners, this tool not only shows prerequisites (inputs) for each course, but also the *outputs*—advanced courses that have the selected course as a prerequisite. This makes it easy to plan forward and see the impact of each course on your academic path.



https://github.com/user-attachments/assets/d5dd83d6-73d0-4d3f-9777-bf31ca359ea8



---

## Core Features

- Search for courses by name or code
- Visualize inputs (prerequisites) **and outputs (all courses that have the selected course as a prerequisite)**
- Click any course to see details and recenter the map

---

## Data Source & Normalization

- The course data is sourced using Duke University's API for publicly available curriculum data.
- Using the API, I was able to compile information about all courses into a single json file.
- I then used an AI agent to parse the text-based prerequisite information into a structured data model. Example:

```json
{
  "id": "027881",
  "code": "COMPSCI 210D",
  "title": "Introduction to Computer Systems",
  "subject": "COMPSCI",
  "subjectDescription": "Computer Science",
  "catalogNumber": "210D",
  "description": "This course provides a programmer's view of how computer systems execute programs and store information. It examines key computational abstraction levels below modern high-level languages; introduction to C, number and data representations, computer memory, assembly language, memory management, the operating-system process model, high-level machine architecture including the memory hierarchy, and introduction to concurrency. Prerequisite: Computer Science 201. Not open to students who have taken Computer Science 250D. Insructor: Lebeck, Chase, Zhou, Fain, Wills",
  "units": "1.00",
  "prerequisites": {
    "type": "simple",
    "courses": [
      "COMPSCI 201"
    ]
  },
  "rawPrereqText": "Prerequisite: Computer Science 201. Not open to students who have taken Computer Science 250D.",
  "school": "Undergraduate",
  "department": "Computer Science Dept.",
  "campus": "Duke University",
  "grading": "Graded",
  "offering": "Fall and/or Spring",
  "restrictions": [
    {
      "type": "EXCLUSION",
      "description": "Not open to students who have taken Computer Science 250D."
    }
  ]
}
```
- This data is stored in `data/courses.json`.
- A normalization script (`data/normalize_courses.js`) processes and deduplicates the data, outputting a cleaned `courses.normalized.json` for use in the app. It also finds the courses "unlocked" by each course and stores this in a property called "reversePrereqs," for easy lookup while creating the map.

---

## Rendering the map

The interactive course map is rendered using a combination of [React Flow](https://reactflow.dev/) and [dagre](https://github.com/dagrejs/dagre):

- **React Flow** provides the canvas, node/edge rendering, zoom/pan, and interactivity. Each course and prerequisite is represented as a node, and dependencies are shown as edges.
- **Dagre** is used to automatically lay out the nodes in a readable, top-to-bottom (vertical) directed acyclic graph (DAG) structure. When a course is selected, the code:
  - Builds a graph of the selected course, its prerequisites (inputs), and the courses it unlocks (outputs).
  - Handles complex prerequisite logic (AND/OR groups) with virtual nodes and custom edge styles.
  - Uses dagre to calculate optimal x/y positions for all nodes, minimizing edge crossings and making the map easy to read.
- The graph is re-generated and re-laid-out whenever a new course is selected, ensuring a dynamic and responsive visualization.
- The map supports zooming, panning, and clicking nodes to recenter or view details, all powered by React Flow's built-in controls.

## 🗂️ Project Structure

```
course-map/
  ├── public/                # Static assets (including courses.normalized.json)
  ├── src/
  │   ├── components/        # React components (CourseMap, SearchBar, Header, etc.)
  │   ├── types/             # TypeScript types
  │   ├── App.tsx            # Main app entry
  │   └── ...
  ├── data/                  # Data scripts and raw/normalized course data
  ├── assets/                # Demo video and other portfolio assets
  ├── package.json           # Project metadata and scripts
  └── README.md              # This file
```

---

## Quick Start

1. **Install dependencies:**
   ```bash
   cd course-map
   npm install
   ```
2. **Run the app locally:**
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.
---

## Contributing

Pull requests and suggestions are welcome.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---
