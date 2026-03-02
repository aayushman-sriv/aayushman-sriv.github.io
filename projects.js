// Edit this file only to update portfolio content.
// Add projects by copying an existing project object and adjusting fields.

window.PORTFOLIO = {
  person: {
    name: "Your Name",
    kicker: "Senior Mechanical Engineering Student",
    title: "Designing and building practical systems—mechanical design, prototyping, and mechatronics.",
    summary:
      "Brief positioning statement. Example: Focused on mechanism design, CAD, rapid prototyping, and integrating actuators and sensors for real-world testing.",
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
      { label: "Design Portfolio PDF", href: "#" },
    ],
  },

  projects: [
    {
      title: "Docking Station Mechanism (Capstone)",
      meta: "Mechanism Design • Mechatronics • Testing",
      summary:
        "Designed a docking station with Z-axis lift, XY planar tracking, and a stepper-actuated clamp.",
      bullets: [
        "Designed frame and guide system; validated motion envelopes and tolerances.",
        "Selected actuators and transmission; estimated loads, duty cycles, and safety factors.",
        "Built prototype and defined acceptance tests and iteration plan.",
      ],
      tags: ["CAD", "DFM", "Stepper", "Fixtures"],
      // Optional: image shown above text (recommended if no 3D model)
      image: { src: "assets/images/docking.jpg", alt: "Docking station prototype or render" },
      // Optional: interactive 3D model viewer (GLB recommended)
      model3d: {
        src: "assets/models/assembly-1.glb",
        alt: "Docking station 3D model",
        heightPx: 320,
      },
      links: [
        { label: "Case Study", href: "#", style: "outline" },
        { label: "Repo / Files", href: "#", style: "ghost" },
      ],
    },

    {
      title: "Robotics / Design Team System",
      meta: "Prototyping • Integration • Field Use",
      summary: "Subsystem design and build under schedule constraints, validated through real testing.",
      bullets: [
        "Designed and fabricated components with rapid iteration cycles.",
        "Integrated actuators and sensors; improved reliability based on test outcomes.",
        "Documented assembly steps and maintenance procedures for repeatability.",
      ],
      tags: ["Prototyping", "Testing", "Integration"],
      image: { src: "assets/images/hero.jpg", alt: "Project image" },
      // No model3d field means no viewer renders
      links: [
        { label: "Case Study", href: "#", style: "outline" },
        { label: "Media", href: "#", style: "ghost" },
      ],
    },
  ],

  experience: [
    {
      role: "Student Design Team — Role",
      meta: "Organization • Dates",
      bullets: [
        "Owned subsystem design from requirements to prototype.",
        "Produced CAD, drawings, and test plan; coordinated with electrical and software workflows.",
      ],
    },
    {
      role: "Startup / Research / Club — Role",
      meta: "Organization • Dates",
      bullets: [
        "Built and iterated prototypes; improved performance based on test results.",
        "Created documentation for handoff and repeatability.",
      ],
    },
  ],

  skills: [
    {
      category: "Mechanical",
      items: [
        "Mechanisms, fixtures, tolerance strategy",
        "Load paths and design justification",
        "Prototype iteration and test planning",
      ],
    },
    {
      category: "Tools",
      items: [
        "CAD: SolidWorks / Fusion / Onshape",
        "Drawings, BOM, revision control",
        "Basic FEA (as applicable)",
      ],
    },
    {
      category: "Mechatronics",
      items: [
        "Stepper motors, belts/leadscrews",
        "Sensors, wiring, integration mindset",
        "MATLAB/Python basics (as applicable)",
      ],
    },
  ],

  contact: [
    { label: "Email", value: "you@example.com", href: "mailto:you@example.com" },
    { label: "LinkedIn", value: "linkedin.com/in/your-handle", href: "https://www.linkedin.com/" },
    { label: "GitHub", value: "github.com/your-handle", href: "https://github.com/" },
  ],

};

