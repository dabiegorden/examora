/**
 * Seed content.
 *
 * Written by hand rather than generated: a seeded database that a developer
 * actually reads should contain plausible exam questions with genuinely correct
 * answers, not lorem ipsum. The data is deterministic, so re-seeding produces
 * an identical database.
 */

export interface SeedStudent {
  fullName: string;
  email: string;
  studentNumber: string;
}

export interface SeedOption {
  text: string;
  isCorrect: boolean;
}

export interface SeedQuestion {
  question: string;
  marks: number;
  options: SeedOption[];
}

export const SEED_PASSWORD = "Examora2026!";

export const seedTeacher = {
  fullName: "Naomi Adjetey",
  email: "teacher@examora.app",
} as const;

export const seedStudents: readonly SeedStudent[] = [
  { fullName: "Ama Boateng", email: "ama.boateng@examora.app", studentNumber: "EXM-2026-001" },
  { fullName: "Kwesi Owusu", email: "kwesi.owusu@examora.app", studentNumber: "EXM-2026-002" },
  { fullName: "Lena Fischer", email: "lena.fischer@examora.app", studentNumber: "EXM-2026-003" },
  { fullName: "Ravi Sharma", email: "ravi.sharma@examora.app", studentNumber: "EXM-2026-004" },
  { fullName: "Chiamaka Eze", email: "chiamaka.eze@examora.app", studentNumber: "EXM-2026-005" },
  { fullName: "Tomas Silva", email: "tomas.silva@examora.app", studentNumber: "EXM-2026-006" },
  { fullName: "Aisha Bello", email: "aisha.bello@examora.app", studentNumber: "EXM-2026-007" },
  { fullName: "Daniel Mensah", email: "daniel.mensah@examora.app", studentNumber: "EXM-2026-008" },
  { fullName: "Sofia Rossi", email: "sofia.rossi@examora.app", studentNumber: "EXM-2026-009" },
  { fullName: "Yusuf Karim", email: "yusuf.karim@examora.app", studentNumber: "EXM-2026-010" },
  { fullName: "Grace Otieno", email: "grace.otieno@examora.app", studentNumber: "EXM-2026-011" },
  { fullName: "Mateo Alvarez", email: "mateo.alvarez@examora.app", studentNumber: "EXM-2026-012" },
  { fullName: "Priya Nair", email: "priya.nair@examora.app", studentNumber: "EXM-2026-013" },
  { fullName: "Kofi Asante", email: "kofi.asante@examora.app", studentNumber: "EXM-2026-014" },
  { fullName: "Hana Suzuki", email: "hana.suzuki@examora.app", studentNumber: "EXM-2026-015" },
];

export const seedCourses = [
  {
    title: "Physics",
    code: "PHY101",
    description:
      "Mechanics, energy, and waves for Grade 11. Weekly assessment via multiple-choice papers.",
    academicYear: "2025/2026",
  },
  {
    title: "Mathematics",
    code: "MTH101",
    description:
      "Algebra, sequences, and coordinate geometry for Grade 11, assessed continuously.",
    academicYear: "2025/2026",
  },
] as const;

/** 20 questions — the Physics mid-term. */
export const physicsQuestions: readonly SeedQuestion[] = [
  {
    question: "What is the SI unit of force?",
    marks: 1,
    options: [
      { text: "Newton", isCorrect: true },
      { text: "Joule", isCorrect: false },
      { text: "Watt", isCorrect: false },
      { text: "Pascal", isCorrect: false },
    ],
  },
  {
    question: "A body moves at constant velocity. What is the net force acting on it?",
    marks: 1,
    options: [
      { text: "Zero", isCorrect: true },
      { text: "Equal to its weight", isCorrect: false },
      { text: "Equal to its momentum", isCorrect: false },
      { text: "Constantly increasing", isCorrect: false },
    ],
  },
  {
    question: "Which quantity is a vector?",
    marks: 1,
    options: [
      { text: "Displacement", isCorrect: true },
      { text: "Speed", isCorrect: false },
      { text: "Mass", isCorrect: false },
      { text: "Temperature", isCorrect: false },
    ],
  },
  {
    question: "What does Newton's third law state?",
    marks: 2,
    options: [
      {
        text: "For every action there is an equal and opposite reaction",
        isCorrect: true,
      },
      { text: "Force equals mass times acceleration", isCorrect: false },
      { text: "A body at rest stays at rest", isCorrect: false },
      { text: "Energy cannot be created or destroyed", isCorrect: false },
    ],
  },
  {
    question: "A 2 kg mass accelerates at 3 m/s². What force acts on it?",
    marks: 2,
    options: [
      { text: "6 N", isCorrect: true },
      { text: "1.5 N", isCorrect: false },
      { text: "5 N", isCorrect: false },
      { text: "0.67 N", isCorrect: false },
    ],
  },
  {
    question: "Which of these is the correct unit of energy?",
    marks: 1,
    options: [
      { text: "Joule", isCorrect: true },
      { text: "Newton", isCorrect: false },
      { text: "Ampere", isCorrect: false },
      { text: "Kelvin", isCorrect: false },
    ],
  },
  {
    question: "The acceleration due to gravity near Earth's surface is approximately:",
    marks: 1,
    options: [
      { text: "9.8 m/s²", isCorrect: true },
      { text: "3.7 m/s²", isCorrect: false },
      { text: "1.6 m/s²", isCorrect: false },
      { text: "12.5 m/s²", isCorrect: false },
    ],
  },
  {
    question: "What is the kinetic energy of a 4 kg object moving at 5 m/s?",
    marks: 2,
    options: [
      { text: "50 J", isCorrect: true },
      { text: "20 J", isCorrect: false },
      { text: "100 J", isCorrect: false },
      { text: "10 J", isCorrect: false },
    ],
  },
  {
    question: "Which statement about frequency and wavelength is correct?",
    marks: 2,
    options: [
      {
        text: "They are inversely proportional at constant wave speed",
        isCorrect: true,
      },
      { text: "They are directly proportional at constant wave speed", isCorrect: false },
      { text: "They are unrelated", isCorrect: false },
      { text: "Their product is always zero", isCorrect: false },
    ],
  },
  {
    question: "What is the momentum of a 3 kg object moving at 4 m/s?",
    marks: 1,
    options: [
      { text: "12 kg·m/s", isCorrect: true },
      { text: "0.75 kg·m/s", isCorrect: false },
      { text: "7 kg·m/s", isCorrect: false },
      { text: "24 kg·m/s", isCorrect: false },
    ],
  },
  {
    question: "Sound cannot travel through:",
    marks: 1,
    options: [
      { text: "A vacuum", isCorrect: true },
      { text: "Water", isCorrect: false },
      { text: "Steel", isCorrect: false },
      { text: "Air", isCorrect: false },
    ],
  },
  {
    question: "Which device converts electrical energy into mechanical energy?",
    marks: 1,
    options: [
      { text: "Electric motor", isCorrect: true },
      { text: "Generator", isCorrect: false },
      { text: "Transformer", isCorrect: false },
      { text: "Thermistor", isCorrect: false },
    ],
  },
  {
    question: "What happens to the period of a simple pendulum if its length is increased?",
    marks: 2,
    options: [
      { text: "It increases", isCorrect: true },
      { text: "It decreases", isCorrect: false },
      { text: "It stays the same", isCorrect: false },
      { text: "It becomes zero", isCorrect: false },
    ],
  },
  {
    question: "Power is defined as:",
    marks: 1,
    options: [
      { text: "The rate of doing work", isCorrect: true },
      { text: "The product of force and distance", isCorrect: false },
      { text: "The rate of change of momentum", isCorrect: false },
      { text: "Force per unit area", isCorrect: false },
    ],
  },
  {
    question: "Which of the following is a scalar quantity?",
    marks: 1,
    options: [
      { text: "Work", isCorrect: true },
      { text: "Force", isCorrect: false },
      { text: "Acceleration", isCorrect: false },
      { text: "Velocity", isCorrect: false },
    ],
  },
  {
    question: "In a series circuit, the current through each component is:",
    marks: 2,
    options: [
      { text: "The same", isCorrect: true },
      { text: "Divided equally", isCorrect: false },
      { text: "Inversely proportional to resistance", isCorrect: false },
      { text: "Zero", isCorrect: false },
    ],
  },
  {
    question: "What is the resistance of a component carrying 2 A under 12 V?",
    marks: 2,
    options: [
      { text: "6 Ω", isCorrect: true },
      { text: "24 Ω", isCorrect: false },
      { text: "0.17 Ω", isCorrect: false },
      { text: "10 Ω", isCorrect: false },
    ],
  },
  {
    question: "Light travelling from air into glass will:",
    marks: 2,
    options: [
      { text: "Slow down and bend towards the normal", isCorrect: true },
      { text: "Speed up and bend away from the normal", isCorrect: false },
      { text: "Continue at the same speed", isCorrect: false },
      { text: "Be completely absorbed", isCorrect: false },
    ],
  },
  {
    question: "The principle of conservation of energy states that energy:",
    marks: 2,
    options: [
      { text: "Cannot be created or destroyed, only transformed", isCorrect: true },
      { text: "Is always increasing in a closed system", isCorrect: false },
      { text: "Is destroyed when work is done", isCorrect: false },
      { text: "Only exists as heat", isCorrect: false },
    ],
  },
  {
    question: "Which graph shape represents constant acceleration on a velocity-time plot?",
    marks: 2,
    options: [
      { text: "A straight line with non-zero gradient", isCorrect: true },
      { text: "A horizontal straight line", isCorrect: false },
      { text: "A parabola", isCorrect: false },
      { text: "A vertical line", isCorrect: false },
    ],
  },
];

/** 20 questions — the Mathematics mid-term. */
export const mathsQuestions: readonly SeedQuestion[] = [
  {
    question: "Solve for x: 3x + 7 = 22",
    marks: 1,
    options: [
      { text: "5", isCorrect: true },
      { text: "7", isCorrect: false },
      { text: "15", isCorrect: false },
      { text: "3", isCorrect: false },
    ],
  },
  {
    question: "What is the value of 5! (five factorial)?",
    marks: 1,
    options: [
      { text: "120", isCorrect: true },
      { text: "25", isCorrect: false },
      { text: "60", isCorrect: false },
      { text: "720", isCorrect: false },
    ],
  },
  {
    question: "The gradient of the line y = 4x − 3 is:",
    marks: 1,
    options: [
      { text: "4", isCorrect: true },
      { text: "−3", isCorrect: false },
      { text: "3", isCorrect: false },
      { text: "1/4", isCorrect: false },
    ],
  },
  {
    question: "What is the sum of the interior angles of a triangle?",
    marks: 1,
    options: [
      { text: "180°", isCorrect: true },
      { text: "360°", isCorrect: false },
      { text: "90°", isCorrect: false },
      { text: "270°", isCorrect: false },
    ],
  },
  {
    question: "Simplify: (x³)(x⁴)",
    marks: 1,
    options: [
      { text: "x⁷", isCorrect: true },
      { text: "x¹²", isCorrect: false },
      { text: "x", isCorrect: false },
      { text: "2x⁷", isCorrect: false },
    ],
  },
  {
    question: "What is 15% of 240?",
    marks: 1,
    options: [
      { text: "36", isCorrect: true },
      { text: "24", isCorrect: false },
      { text: "40", isCorrect: false },
      { text: "16", isCorrect: false },
    ],
  },
  {
    question: "The next term in the sequence 2, 6, 18, 54, ... is:",
    marks: 2,
    options: [
      { text: "162", isCorrect: true },
      { text: "108", isCorrect: false },
      { text: "216", isCorrect: false },
      { text: "72", isCorrect: false },
    ],
  },
  {
    question: "Factorise: x² − 9",
    marks: 2,
    options: [
      { text: "(x − 3)(x + 3)", isCorrect: true },
      { text: "(x − 3)²", isCorrect: false },
      { text: "(x + 9)(x − 1)", isCorrect: false },
      { text: "x(x − 9)", isCorrect: false },
    ],
  },
  {
    question: "What is the area of a circle with radius 5 (use π ≈ 3.14)?",
    marks: 2,
    options: [
      { text: "78.5", isCorrect: true },
      { text: "31.4", isCorrect: false },
      { text: "15.7", isCorrect: false },
      { text: "157", isCorrect: false },
    ],
  },
  {
    question: "Solve the quadratic: x² − 5x + 6 = 0",
    marks: 2,
    options: [
      { text: "x = 2 or x = 3", isCorrect: true },
      { text: "x = −2 or x = −3", isCorrect: false },
      { text: "x = 1 or x = 6", isCorrect: false },
      { text: "x = 5 or x = 6", isCorrect: false },
    ],
  },
  {
    question: "What is the median of 4, 8, 15, 16, 23, 42?",
    marks: 2,
    options: [
      { text: "15.5", isCorrect: true },
      { text: "15", isCorrect: false },
      { text: "16", isCorrect: false },
      { text: "18", isCorrect: false },
    ],
  },
  {
    question: "If a fair die is rolled once, what is P(rolling a number greater than 4)?",
    marks: 2,
    options: [
      { text: "1/3", isCorrect: true },
      { text: "1/2", isCorrect: false },
      { text: "1/6", isCorrect: false },
      { text: "2/3", isCorrect: false },
    ],
  },
  {
    question: "What is the value of log₁₀(1000)?",
    marks: 2,
    options: [
      { text: "3", isCorrect: true },
      { text: "10", isCorrect: false },
      { text: "100", isCorrect: false },
      { text: "1", isCorrect: false },
    ],
  },
  {
    question: "Two lines are perpendicular. If one has gradient 2, the other has gradient:",
    marks: 2,
    options: [
      { text: "−1/2", isCorrect: true },
      { text: "1/2", isCorrect: false },
      { text: "−2", isCorrect: false },
      { text: "2", isCorrect: false },
    ],
  },
  {
    question: "Expand: (x + 4)(x − 2)",
    marks: 2,
    options: [
      { text: "x² + 2x − 8", isCorrect: true },
      { text: "x² − 2x − 8", isCorrect: false },
      { text: "x² + 6x − 8", isCorrect: false },
      { text: "x² + 2x + 8", isCorrect: false },
    ],
  },
  {
    question: "What is the 10th term of the arithmetic sequence 3, 7, 11, ...?",
    marks: 2,
    options: [
      { text: "39", isCorrect: true },
      { text: "43", isCorrect: false },
      { text: "40", isCorrect: false },
      { text: "35", isCorrect: false },
    ],
  },
  {
    question: "In a right-angled triangle, sin θ is defined as:",
    marks: 1,
    options: [
      { text: "Opposite ÷ hypotenuse", isCorrect: true },
      { text: "Adjacent ÷ hypotenuse", isCorrect: false },
      { text: "Opposite ÷ adjacent", isCorrect: false },
      { text: "Hypotenuse ÷ opposite", isCorrect: false },
    ],
  },
  {
    question: "Simplify the fraction 18/24 to its lowest terms.",
    marks: 1,
    options: [
      { text: "3/4", isCorrect: true },
      { text: "6/8", isCorrect: false },
      { text: "9/12", isCorrect: false },
      { text: "2/3", isCorrect: false },
    ],
  },
  {
    question: "What is the volume of a cube with side length 4?",
    marks: 1,
    options: [
      { text: "64", isCorrect: true },
      { text: "16", isCorrect: false },
      { text: "48", isCorrect: false },
      { text: "12", isCorrect: false },
    ],
  },
  {
    question: "If f(x) = 2x² − 3, what is f(3)?",
    marks: 2,
    options: [
      { text: "15", isCorrect: true },
      { text: "9", isCorrect: false },
      { text: "33", isCorrect: false },
      { text: "3", isCorrect: false },
    ],
  },
];
