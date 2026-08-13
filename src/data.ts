import {
  Cpu,
  Wrench,
  Factory,
  Code2,
  GraduationCap,
  Award,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Download,
  ChevronDown,
  CircuitBoard,
  Gauge,
  Battery,
  Wifi,
  Microscope,
  Briefcase,
  Layers,
  Zap,
  BarChart2,
  Terminal,
} from 'lucide-react';

export type ViewKey = 'home' | 'about' | 'projects' | 'researches' | 'contact' | 'admin' | 'desmen';

export const navItems: { key: ViewKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'projects', label: 'Projects' },
  { key: 'researches', label: 'Research' },
  { key: 'desmen', label: 'Experience' },
  { key: 'contact', label: 'Contact' },
];

export const highlightCards = [
  {
    icon: Wrench,
    title: 'Mechanical & CAD',
    description: 'SolidWorks part and assembly modeling, technical drawings, and fabrication-ready design.',
  },
  {
    icon: CircuitBoard,
    title: 'IoT & Embedded Systems',
    description: 'Custom PCB design, circuit schematic, component selection, and prototype assembly.',
  },
  {
    icon: Factory,
    title: 'Production Management',
    description: 'Production line management, Lean manufacturing, and quality assurance internship experience.',
  },
  {
    icon: Code2,
    title: 'Software & Programming',
    description: 'Mobile apps, web applications, and software tools built as supporting engineering projects.',
  },
];

export const skillGroups: {
  label: string;
  tier: 'primary' | 'secondary' | 'supporting';
  skills: string[];
}[] = [
  {
    label: 'Mechanical Design & CAD',
    tier: 'primary',
    skills: ['SolidWorks', '3D Part Modeling', 'Assembly Modeling', 'Technical Drawings', 'Mechanical Design', 'Component Design'],
  },
  {
    label: 'Engineering Analysis',
    tier: 'secondary',
    skills: ['SolidWorks Simulation', 'FEA — Practical', 'Stress Analysis', 'Displacement Analysis', 'Factor of Safety'],
  },
  {
    label: 'Electronics & PCB',
    tier: 'secondary',
    skills: ['PCB Design', 'Schematic Design', 'PCB Layout', 'Circuit Prototyping', 'ESP32 / Arduino'],
  },
  {
    label: 'Manufacturing / CAM',
    tier: 'supporting',
    skills: ['SolidCAM — Basic', 'CNC Machining', 'FDM / SLA 3D Printing', 'Steel Welding'],
  },
  {
    label: 'Software & Programming',
    tier: 'supporting',
    skills: ['Python', 'Flutter', 'React', 'JavaScript', 'C / C++'],
  },
];

export const workExperience = [
  {
    icon: Briefcase,
    role: 'Production Engineering Intern',
    org: 'Alumex PLC',
    period: 'May 11, 2026 – Nov 10, 2026',
    current: true,
    detail:
      'Industrial internship applying production line management, quality assurance, and process optimization principles on the factory floor.',
  },
];

export const education = [
  {
    icon: GraduationCap,
    degree: 'BSc (Hons) Science & Technology',
    field: 'Mechatronics Specialization',
    school: 'Uva Wellassa University of Sri Lanka',
    detail: 'GPA: 3.5 / 4.0',
  },
  {
    icon: GraduationCap,
    degree: 'G.C.E. Advanced Level',
    field: 'Physical Science Stream (2020)',
    school: 'Badulla Central College',
    detail: 'Z-Score: 0.9768 — Combined Mathematics: A',
  },
  {
    icon: GraduationCap,
    degree: 'G.C.E. Ordinary Level',
    field: '2017',
    school: 'Uva Science College',
    detail: '8 A Passes, 1 B Pass',
  },
];

export const accordionSections = [
  {
    id: 'researches',
    icon: Microscope,
    title: 'Researches',
    overview:
      'Comprehensive academic studies and long-term technical projects focused on mechatronic system integration, from initial concept to functional physical prototypes.',
    areas:
      'Personal mobility design, system architecture, power efficiency optimization, and hardware telemetry.',
    keyFocus:
      'End-to-end prototype fabrication (e.g., modular electric vehicles) integrating mechanical design with real-time software monitoring.',
  },
  {
    id: 'mechanical',
    icon: Wrench,
    title: 'Mechanical & CAD',
    overview:
      'Transforming theoretical kinematics and mechanical concepts into physical, manufacturable hardware.',
    areas:
      '3D modeling, 2D fabrication-ready drafting, parametric assemblies, structural safety validation, and hands-on workshop fabrication.',
    tools:
      'SolidWorks (Weldments, FEA, Motion Simulation), AutoCAD, CNC Machining, FDM/SLA 3D Printing, and steel welding.',
    featured:
      'Length-Adjustable Miter Saw Work Desk, Slider-Crank Generator, Industrial Drying Oven, and Precision XYZ Translation Stages.',
  },
  {
    id: 'production',
    icon: Factory,
    title: 'Production Management',
    overview:
      'Applying industrial engineering principles to optimize factory floor workflows, oversee production pipelines, and ensure manufacturing precision. Expanding this hands-on experience through a Production Engineering Internship at Alumex PLC.',
    areas:
      'Production line management, Lean manufacturing, Kaizen practices, quality assurance, and integrating design with manufacturing constraints.',
    techniques:
      'Managing industrial workflows, CNC tooling dashboards, X-Bar/R Control Charts, and Process Capability Index (Cpk).',
  },
  {
    id: 'iot',
    icon: CircuitBoard,
    title: 'IoT & Embedded Systems',
    overview:
      'Designing custom circuits and integrating smart electronics into mechanical frameworks to build automated, responsive systems.',
    areas:
      'PCB schematic layout, routing, component sourcing, hand-soldering, and hardware debugging.',
    tools:
      'Proteus (PCB Design), ESP32, Arduino, and VESC motor controllers.',
    featured:
      'Music-Reactive LED Lighting System on a custom etched copper board.',
  },
  {
    id: 'software',
    icon: Code2,
    title: 'Software & Programming',
    overview:
      'Developing user-facing applications and scripting custom software to interface with mechatronic systems and track real-time hardware data.',
    areas:
      'Cross-platform mobile application development, UI design, and real-time data visualization (telemetry, speed, and tilt tracking).',
    languages: 'Flutter, Python, and C/C++.',
  },
];

export const contactInfo = [
  { icon: Mail, label: 'Email', value: 'pujithajayathilaka2001@gmail.com', href: 'mailto:pujithajayathilaka2001@gmail.com' },
  { icon: Phone, label: 'Phone', value: '076 45 41 664', href: 'tel:+94764541664' },
  { icon: Linkedin, label: 'LinkedIn', value: '/in/poojithadilshan2001', href: 'https://www.linkedin.com/in/poojithadilshan2001' },
  { icon: Github, label: 'GitHub', value: 'github.com/poojithadilshan2001', href: 'https://github.com/poojithadilshan2001' },
  { icon: MapPin, label: 'Location', value: 'Badulla, Sri Lanka', href: 'https://maps.app.goo.gl/7h1Dc3bthJVzGoZn7' },
];

export const icons = {
  Download,
  ChevronDown,
  Gauge,
  Battery,
  Wifi,
  Layers,
  Zap,
  BarChart2,
  Terminal,
};

// ---- Database types ----

export interface ProjectRow {
  id: string;
  title: string;
  icon_name: string | null;
  image_url: string | null;
  overview: string | null;
  areas: string | null;
  tools: string | null;
  techniques: string | null;
  featured: string | null;
  languages: string | null;
  key_focus: string | null;
  sort_order: number;
}

export interface ResearchRow {
  id: string;
  title: string;
  period: string | null;
  description: string | null;
  hardware_architecture: string | null;
  software_integration: string | null;
  sort_order: number;
}

export interface SubprojectRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Map icon_name strings from the DB to lucide-react icon components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const iconMap: Record<string, React.ComponentType<any>> = {
  Microscope,
  Wrench,
  Factory,
  CircuitBoard,
  Code2,
  Cpu,
  Gauge,
  Battery,
  Wifi,
};
