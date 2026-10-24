// Mirrors Web/backend/utils/grading.js: the backend stays the authority that
// stores the card, this copy only previews a grade while the teacher is typing.
// Keep the tables in step if the scheme ever changes.
const SCALE = [
  { min: 90, grade: "A+", point: 4.0 },
  { min: 80, grade: "A", point: 3.6 },
  { min: 70, grade: "B+", point: 3.2 },
  { min: 60, grade: "B", point: 2.8 },
  { min: 50, grade: "C+", point: 2.4 },
  { min: 40, grade: "C", point: 2.0 },
  { min: 35, grade: "D", point: 1.6 },
];

export const PASS_RATIO = 0.35;

export const passMarksFor = (fullMarks) =>
  Math.ceil((Number(fullMarks) || 0) * PASS_RATIO);

export const gradeFor = (obtained, fullMarks) => {
  const total = Number(obtained) || 0;
  const full = Number(fullMarks) || 0;

  if (!full) {
    return { grade: "", gradePoint: null, passed: null, percentage: 0 };
  }

  const percentage = Math.round((total / full) * 10000) / 100;
  const step = SCALE.find((entry) => percentage >= entry.min);

  return {
    grade: step?.grade || "F",
    gradePoint: step ? step.point : 0,
    passed: total >= passMarksFor(full),
    percentage,
  };
};

export const gradeTone = (grade) => {
  if (grade === "Ab") return "bg-slate-100 text-slate-500 dark:text-slate-400";
  if (grade === "F") return "bg-red-50 text-red-700 dark:text-red-300";
  if (grade === "D") return "bg-amber-50 text-amber-700 dark:text-amber-300";

  return "bg-emerald-50 text-emerald-700 dark:text-emerald-300";
};
