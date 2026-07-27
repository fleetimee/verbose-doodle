import { GitHubDark, GitHubLight } from "developer-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function LinkedinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

export type TeamMemberProfile = {
  id: number;
  name: string;
  designation: string;
  image: string;
  imageWebp1x?: string;
  imageWebp2x?: string;
  bio?: string;
  githubUsername?: string;
  roles?: readonly string[];
  contributions?: readonly string[];
  socials?: {
    github?: string;
    linkedin?: string;
  };
};

export type TeamMemberModalProps = {
  member: TeamMemberProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TeamMemberModal({
  member,
  open,
  onOpenChange,
}: TeamMemberModalProps) {
  if (!member) {
    return null;
  }

  const githubUrl =
    member.socials?.github ||
    (member.githubUsername
      ? `https://github.com/${member.githubUsername}`
      : undefined);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg overflow-hidden border-border/80 bg-background/95 p-6 backdrop-blur-md sm:max-w-xl">
        <DialogHeader className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/30 shadow-md">
              <img
                alt={member.name}
                className="h-full w-full object-cover object-top"
                height={64}
                src={member.imageWebp1x || member.image}
                width={64}
              />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-semibold text-foreground text-xl">
                {member.name}
              </DialogTitle>
              <DialogDescription className="font-medium text-primary text-sm">
                {member.designation}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-sm leading-relaxed">
          {member.bio && <p className="text-muted-foreground">{member.bio}</p>}

          {member.roles && member.roles.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Key Specializations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {member.roles.map((role) => (
                  <Badge className="text-xs" key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {member.contributions && member.contributions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Core Contributions
              </span>
              <ul className="ml-4 flex list-disc flex-col gap-1 text-muted-foreground text-xs">
                {member.contributions.map((contribution) => (
                  <li key={contribution}>{contribution}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between border-border/40 border-t pt-4 sm:justify-between">
          <div className="flex items-center gap-2">
            {githubUrl && (
              <Button
                className="gap-1.5 text-xs"
                nativeButton={false}
                render={
                  <a
                    href={githubUrl}
                    rel="noreferrer"
                    target="_blank"
                    title={`View ${member.name}'s GitHub Profile`}
                  >
                    <GitHubDark
                      className="block h-3.5 w-3.5 dark:hidden"
                      size={14}
                    />
                    <GitHubLight
                      className="hidden h-3.5 w-3.5 dark:block"
                      size={14}
                    />
                    <span>GitHub</span>
                  </a>
                }
                size="sm"
                variant="outline"
              />
            )}
            {member.socials?.linkedin && (
              <Button
                className="gap-1.5 text-xs"
                nativeButton={false}
                render={
                  <a
                    href={member.socials.linkedin}
                    rel="noreferrer"
                    target="_blank"
                    title={`View ${member.name}'s LinkedIn Profile`}
                  >
                    <LinkedinIcon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>LinkedIn</span>
                  </a>
                }
                size="sm"
                variant="outline"
              />
            )}
          </div>
          <Button onClick={() => onOpenChange(false)} size="sm" variant="ghost">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
