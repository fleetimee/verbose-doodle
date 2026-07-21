import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { TeamMemberModal, type TeamMemberProfile } from "./team-member-modal";

const sampleMember: TeamMemberProfile = {
  id: 4,
  name: "Novian Andika",
  designation: "Frontend Developer",
  image: "/assets/teams/45744788-1x.webp",
  bio: "Lead Frontend Developer & System Architect driving React 19 architecture.",
  githubUsername: "fleetime",
  roles: ["Frontend Architecture", "Base UI Systems"],
  contributions: ["React 19 & Base UI Seam Architecture"],
  socials: {
    github: "https://github.com/fleetime",
  },
};

describe("TeamMemberModal component", () => {
  test("renders profile details and GitHub link when open", () => {
    let isOpen = true;
    render(
      <TeamMemberModal
        member={sampleMember}
        open={isOpen}
        onOpenChange={(val) => {
          isOpen = val;
        }}
      />
    );

    expect(screen.getByText("Novian Andika")).toBeDefined();
    expect(screen.getByText("Frontend Developer")).toBeDefined();
    expect(
      screen.getByText(
        "Lead Frontend Developer & System Architect driving React 19 architecture."
      )
    ).toBeDefined();

    const githubLink = screen.getByTitle("View Novian Andika's GitHub Profile");
    expect(githubLink).toBeDefined();
    expect(githubLink.getAttribute("href")).toBe("https://github.com/fleetime");
    expect(githubLink.getAttribute("target")).toBe("_blank");
    expect(githubLink.getAttribute("rel")).toBe("noreferrer");
  });
});
