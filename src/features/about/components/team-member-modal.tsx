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

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0024 12.017C24 6.484 19.522 2 12 2z"
        fillRule="evenodd"
      />
    </svg>
  );
}

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
                src={member.imageWebp1x || member.image}
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
                    <GithubIcon className="h-3.5 w-3.5 text-foreground" />
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
