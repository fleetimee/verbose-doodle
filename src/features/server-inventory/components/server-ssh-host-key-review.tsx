import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ServerSshHostKeyReview({
  review,
  pending,
  onTrust,
  onCancel,
}: {
  review: {
    host: string;
    port: number;
    algorithm: string;
    fingerprint: string;
  };
  pending: boolean;
  onTrust: () => void;
  onCancel: () => void;
}) {
  const copy = useI18n().messages.servers;
  return (
    <Alert className="shrink-0">
      <AlertTitle>{copy.sshHostKeyTitle}</AlertTitle>
      <AlertDescription>
        <p>{copy.sshHostKeyDescription}</p>
        <dl className="grid min-w-0 gap-2 sm:grid-cols-[auto_1fr]">
          <dt>{copy.host}</dt>
          <dd className="break-all font-mono">
            {review.host}:{review.port}
          </dd>
          <dt>{copy.sshHostKeyAlgorithm}</dt>
          <dd className="break-all font-mono">{review.algorithm}</dd>
          <dt>{copy.sshHostKeyFingerprint}</dt>
          <dd className="break-all font-mono">{review.fingerprint}</dd>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button disabled={pending} onClick={onTrust} size="sm">
            {pending ? copy.sshHostKeySaving : copy.sshHostKeyTrust}
          </Button>
          <Button onClick={onCancel} size="sm" variant="outline">
            {copy.sshHostKeyCancel}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
