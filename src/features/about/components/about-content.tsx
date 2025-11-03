import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const teamMembers = [
  {
    id: 1,
    name: "Nashira Oksani Ardine Santosa",
    designation: "Technical Writer & Frontend Developer",
    image: "/assets/teams/103569160.png",
  },
  {
    id: 2,
    name: "Novianto Eko Budiman",
    designation: "Backend Developer",
    image: "/assets/teams/15899547.jpeg",
  },
  {
    id: 3,
    name: "Bacharuddin Adieb Pratama",
    designation: "Backend Developer",
    image: "/assets/teams/22101214.jpeg",
  },
  {
    id: 4,
    name: "Novian Andika",
    designation: "Frontend Developer",
    image: "/assets/teams/45744788.jpeg",
  },
  {
    id: 5,
    name: "Rosinta Anggraini",
    designation: "Technical Writer & Backend Developer",
    image: "/assets/teams/48322786.png",
  },
  {
    id: 6,
    name: "Aulia Ariobimo",
    designation: "Frontend Developer",
    image: "/assets/teams/57403869.png",
  },
];

export function AboutContent() {
  return (
    <section className="flex flex-col gap-6 text-pretty leading-relaxed">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">What is this?</h2>
        <p>
          The Biller Simulator JSON is a powerful tool designed to help teams
          prototype, test, and visualize billing scenarios through an intuitive
          interface. Built with modern web technologies, it provides a flexible
          platform for managing billing workflows and API endpoints.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Key Features</h2>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          <li>
            <strong>Endpoint Management:</strong> Configure and monitor billing
            API endpoints with real-time status tracking
          </li>
          <li>
            <strong>User Administration:</strong> Role-based access control with
            dedicated user management for administrators
          </li>
          <li>
            <strong>JSON-Driven:</strong> Flexible configuration using JSON
            scenarios for rapid prototyping
          </li>
          <li>
            <strong>Modern Stack:</strong> Built with React 19, TypeScript, and
            Vite for optimal performance
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Our Team</h2>
        <div className="flex flex-row items-center justify-center">
          <AnimatedTooltip items={teamMembers} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Technology</h2>
        <p>
          This application leverages cutting-edge technologies including React
          19 with the new compiler, TypeScript for type safety, TanStack Query
          for data fetching, and Tailwind CSS for styling. The component library
          is built on shadcn/ui with Radix UI primitives.
        </p>
      </div>
    </section>
  );
}
