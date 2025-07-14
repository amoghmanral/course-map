const fs = require('fs');
const path = require('path');

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

    if (groups.length === 1 && groups[0].type === 'simple') {
      return { type: 'simple', courses: groups[0].courses };
    }
    return { type: 'complex', groups };
  }

  return null;
}

// Read courses.json
const inputPath = path.join(__dirname, 'courses.json');
const outputPath = path.join(__dirname, 'courses.normalized.json');

const raw = fs.readFileSync(inputPath, 'utf-8');
const data = JSON.parse(raw);

// If the file is an array, wrap in { courses: [...] }
const courses = Array.isArray(data) ? data : data.courses;

// Build normalized courses and reverse mapping
const reversePrereqs = {};
const normalizedCourses = courses.map(course => {
  const normPrereq = normalizePrerequisites(course.prerequisites);
  // Build reverse mapping
  if (normPrereq) {
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

const output = { courses: normalizedCourses, reversePrereqs };
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`Normalized data written to ${outputPath}`); 