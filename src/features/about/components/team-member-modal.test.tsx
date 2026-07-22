import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TeamMemberModal,
  type TeamMemberProfile,
} from "@/features/about/components/team-member-modal";

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
  test("renders nothing without a selected member", () => {
    const { container } = render(
      <TeamMemberModal member={null} onOpenChange={() => undefined} open />
    );

    expect(container.firstChild).toBeNull();
  });

  test("renders profile details and GitHub link when open", () => {
    let isOpen = true;
    render(
      <TeamMemberModal
        member={sampleMember}
        onOpenChange={(val) => {
          isOpen = val;
        }}
        open={isOpen}
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

  test("uses profile fallbacks and closes from the dialog action", async () => {
    const user = userEvent.setup();
    const openChanges: boolean[] = [];
    const member: TeamMemberProfile = {
      id: 7,
      name: "Fallback Profile",
      designation: "Engineer",
      image: "/fallback.webp",
      githubUsername: "fallback-user",
      socials: {
        linkedin: "https://www.linkedin.com/in/fallback-user",
      },
    };

    render(
      <TeamMemberModal
        member={member}
        onOpenChange={(open) => openChanges.push(open)}
        open
      />
    );

    expect(
      screen
        .getByTitle("View Fallback Profile's GitHub Profile")
        .getAttribute("href")
    ).toBe("https://github.com/fallback-user");
    expect(
      screen
        .getByTitle("View Fallback Profile's LinkedIn Profile")
        .getAttribute("href")
    ).toBe("https://www.linkedin.com/in/fallback-user");

    await user.click(screen.getAllByRole("button", { name: "Close" })[0]);
    expect(openChanges).toContain(false);
  });

  test("omits optional profile sections and social links", () => {
    render(
      <TeamMemberModal
        member={{
          id: 8,
          name: "Minimal Profile",
          designation: "Engineer",
          image: "/minimal.webp",
          roles: [],
          contributions: [],
        }}
        onOpenChange={() => undefined}
        open
      />
    );

    expect(screen.queryByText("Key Specializations")).toBeNull();
    expect(screen.queryByText("Core Contributions")).toBeNull();
    expect(screen.queryByText("GitHub")).toBeNull();
    expect(screen.queryByText("LinkedIn")).toBeNull();
  });
});
