const fs = require('fs');
const path = require('path');

// Helper to normalize prerequisites
function normalizePrerequisites(prereq) {
  if (!prereq || typeof prereq !== 'object') return null;
  const { type } = prereq;

  if (type === 'simple') {
    // If courses is empty or missing, ignore
    if (!Array.isArray(prereq.courses) || prereq.courses.length === 0 || !prereq.courses[0]) return null;
    return { type: 'simple', courses: [prereq.courses[0]] };
  }

  if (type === 'or' || type === 'and') {
    // Remove blanks
    const courses = (prereq.courses || []).filter(Boolean);
    if (courses.length === 0) return null;
    if (courses.length === 1) {
      return { type: 'simple', courses: [courses[0]] };
    }
    return { type, courses };
  }

  if (type === 'complex') {
    // Each group should be an 'or' group
    const groups = (prereq.groups || []).map(group => {
      const courses = (group.courses || []).filter(Boolean);
      if (courses.length === 0) return null;
      if (courses.length === 1) {
        return { type: 'simple', courses: [courses[0]] };
      }
      return { type: 'or', courses };
    }).filter(Boolean);
    if (groups.length === 0) return null;
    // If only one group and it's simple, flatten
    if (groups.length === 1 && groups[0].type === 'simple') {
      return { type: 'simple', courses: groups[0].courses };
    }
    return { type: 'complex', groups };
  }

  return null;
}

// Helper to determine which course to keep when deduplicating
function shouldKeepCourse(existing, newCourse) {
  // Check if the raw prerequisites field has meaningful data (before normalization)
  const existingHasPrereqs = existing.prerequisites && 
    existing.prerequisites !== null &&
    ((existing.prerequisites.type && existing.prerequisites.type !== 'simple') ||
     (Array.isArray(existing.prerequisites) && existing.prerequisites.length > 0) ||
     (typeof existing.prerequisites === 'object' && 
      Object.keys(existing.prerequisites).length > 0 && 
      existing.prerequisites.type));
  
  const newHasPrereqs = newCourse.prerequisites && 
    newCourse.prerequisites !== null &&
    ((newCourse.prerequisites.type && newCourse.prerequisites.type !== 'simple') ||
     (Array.isArray(newCourse.prerequisites) && newCourse.prerequisites.length > 0) ||
     (typeof newCourse.prerequisites === 'object' && 
      Object.keys(newCourse.prerequisites).length > 0 && 
      newCourse.prerequisites.type));
  
  // Always prioritize the one with prerequisites
  if (existingHasPrereqs && !newHasPrereqs) return true;
  if (!existingHasPrereqs && newHasPrereqs) return false;
  
  // If both have prerequisites or both don't, keep the existing one (first occurrence)
  return true;
}

// Read courses.json
const inputPath = path.join(__dirname, 'courses.json');
const outputPath = path.join(__dirname, 'courses.normalized.json');

const raw = fs.readFileSync(inputPath, 'utf-8');
const data = JSON.parse(raw);

// If the file is an array, wrap in { courses: [...] }
const courses = Array.isArray(data) ? data : data.courses;

// Deduplicate courses by ID AND code combination, keeping the one with the most complete prerequisite info
const courseMap = new Map();
courses.forEach(course => {
  const key = `${course.id}-${course.code}`;
  const existing = courseMap.get(key);
  
  if (!existing) {
    courseMap.set(key, course);
  } else if (shouldKeepCourse(existing, course)) {
    // Don't replace the existing entry
  } else {
    courseMap.set(key, course);
  }
});

const uniqueCourses = Array.from(courseMap.values());

console.log(`Original courses: ${courses.length}`);
console.log(`After deduplication: ${uniqueCourses.length}`);
console.log(`Removed ${courses.length - uniqueCourses.length} duplicates`);

// Build normalized courses and reverse mapping
const reversePrereqs = {};
const normalizedCourses = uniqueCourses.map(course => {
  const normPrereq = normalizePrerequisites(course.prerequisites);
  // Build reverse mapping
  if (normPrereq) {
    // Helper to collect all course codes from prerequisites
    function collectCodes(pr) {
      if (!pr) return [];
      if (pr.type === 'simple' || pr.type === 'or' || pr.type === 'and') {
        return pr.courses || [];
      }
      if (pr.type === 'complex') {
        return (pr.groups || []).flatMap(collectCodes);
      }
      return [];
    }
    const prereqCodes = collectCodes(normPrereq);
    prereqCodes.forEach(code => {
      if (!reversePrereqs[code]) reversePrereqs[code] = [];
      reversePrereqs[code].push(course.code);
    });
  }
  return { ...course, prerequisites: normPrereq };
});

// Write output
const output = { courses: normalizedCourses, reversePrereqs };
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`Normalized data written to ${outputPath}`); 