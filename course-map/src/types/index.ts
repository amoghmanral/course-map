export type Prereq =
  | { type: "simple"; courses: string[] }
  | { type: "or" | "and"; courses: string[] }
  | { type: "complex"; groups: { type: "or" | "simple"; courses: string[] }[] }
  | null;

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string;
  prerequisites: Prereq;
};

export type Data = {
  courses: Course[];
  reversePrereqs: Record<string, string[]>;
}; 