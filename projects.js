// projects.js
// Single source of truth for portfolio content.
// Edit this file to add/remove projects, change links, update skills, etc.

window.PORTFOLIO = {
  person: {
    name: "Aayushman Srivastava",
    kicker: "Senior Mechanical Engineering Student",
    title:
      "Mechanical design, prototyping, and mechatronics—focused on building practical systems and validating them through testing.",
    summary:
      "Portfolio of selected engineering work. Emphasis on mechanism design, CAD and drawings, rapid prototyping, and integrating actuators and sensors into testable prototypes.",
    facts: {
      location: "St. John’s, NL (or Remote)",
      interests: "Mechanisms • Robotics • Prototyping",
      availability: "Internships • Capstone • Part-time",
    },
    highlights: [
      "Mechanism design: rails, belts, clamps, fixtures",
      "CAD + drawings: DFM, tolerances, assembly detail",
      "Prototyping: 3D printing, rapid iteration, testing",
      "Mechatronics: stepper motors, sensors, basic controls",
    ],
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "GitHub", href: "https://github.com/" },
      // Optional: update to a real link (Drive, Notion, PDF, etc.)
      { label: "Design Portfolio PDF", href: "#" },
    ],
  },

  // PROJECTS
  // Add more by copying one object and changing fields.
  projects: [
    {
      title: "Assembly 1 (Interactive 3D Model)",
      meta: "3D CAD • Assembly • Web Viewer (GLB)",
      summary:
        "Interactive 3D model embedded directly in the portfolio site for quick review of geometry and overall assembly layout.",
      bullets: [
        "Published a web-optimized GLB for fast loading and smooth interaction.",
        "Used orbit/zoom controls to support quick design review without CAD software.",
        "Structured the portfolio so each project can optionally include an interactive model.",
      ],
      tags: ["GLB", "CAD", "Assembly", "Portfolio"],
      model3d: {
        src: "assets/models/assembly-1.glb",
        alt: "Assembly 1 3D model",
        heightPx: 320,
      },
      links: [
        // Optional: add a case study page later (e.g., projects/assembly-1.html)
        { label: "Case Study", href: "#", style: "outline" },
        // Optional: link to original files or a repo folder
        { label: "Files", href: "assets/models/assembly-1.glb", style: "ghost" },
      ],
    },

    {
      title: "Docking Station Mechanism (Capstone)",
      meta: "Mechanism Design • Mechatronics • Testing",
      summary:
        "Docking station concept featuring vertical positioning (Z), planar motion (X/Y), and a stepper-actuated clamp for securing a payload/platform.",
      bullets: [
        "Defined motion requirements and interfaces; planned the frame and sliding mechanisms.",
        "Mapped actuator and transmission options (belts/leadscrews) against load and speed needs.",
        "Outlined a prototype and verification approach to reduce integration risk.",
      ],
      tags: ["Mechanisms", "CAD", "Stepper", "Integration"],
      // Add a project image later if desired:
      // image: { src: "assets/images/docking.jpg", alt: "Docking station render or prototype" },
      links: [
        { label: "Case Study", href: "#", style: "outline" },
        { label: "Media", href: "#", style: "ghost" },
      ],
    },
  ],

  // EXPERIENCE
  experience: [
    {
      role: "Student Design Team — Mechanical",
      meta: "Memorial University of Newfoundland • Dates",
      bullets: [
        "Designed and fabricated mechanical subsystems under schedule constraints.",
        "Produced CAD and documentation to support assembly, maintenance, and handoff.",
      ],
    },
    {
      role: "Project Work — Prototyping and Integration",
      meta: "Independent / Team Projects • Dates",
      bullets: [
        "Built and iterated prototypes; improved reliability based on testing outcomes.",
        "Integrated mechanical components with sensors/actuators and basic control logic.",
      ],
    },
  ],

  // SKILLS
  skills: [
    {
      category: "Mechanical",
      items: [
        "Mechanisms and fixtures",
        "Tolerance strategy and manufacturability mindset",
        "Prototyping and test planning",
      ],
    },
    {
      category: "CAD / Documentation",
      items: [
        "3D CAD modeling and assemblies",
        "Engineering drawings and BOM organization",
        "Revision control and clean deliverables",
      ],
    },
    {
      category: "Mechatronics",
      items: [
        "Stepper motors and motion components (belts/leadscrews/rails)",
        "Sensors and integration basics",
        "MATLAB/Python (as applicable)",
      ],
    },
  ],

  // CONTACT
  contact: [
    { label: "Email", value: "you@example.com", href: "mailto:you@example.com" },
    { label: "LinkedIn", value: "linkedin.com/in/your-handle", href: "https://www.linkedin.com/" },
    { label: "GitHub", value: "github.com/your-handle", href: "https://github.com/" },
  ],
};
