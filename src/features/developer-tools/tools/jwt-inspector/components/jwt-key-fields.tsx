import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/lib/i18n";
import type { JwtKeys } from "../utils/jwt-crypto";
import { JwtEditor } from "./jwt-editor";

const copy = messages.jwtInspector;
export function JwtKeyFields({
  keys,
  changeKeys,
  symmetric,
  mode,
}: {
  readonly keys: JwtKeys;
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly symmetric: boolean;
  readonly mode: "inspect" | "create";
}) {
  const [showSecret, setShowSecret] = useState(false);
  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(keys.secret);
      toast.success(copy.copySuccess);
    } catch {
      toast.error(copy.copyFailed);
    }
  };
  return symmetric ? (
    <div className="max-w-xl space-y-3">
      <Label htmlFor="jwt-secret-input">{copy.secretLabel}</Label>
      <div className="flex gap-2">
        <Input
          autoComplete="off"
          className="font-mono"
          id="jwt-secret-input"
          onChange={(event) => changeKeys({ secret: event.target.value })}
          placeholder={copy.secretPlaceholder}
          spellCheck={false}
          type={showSecret ? "text" : "password"}
          value={keys.secret}
        />
        <Button
          aria-pressed={showSecret}
          onClick={() => setShowSecret(!showSecret)}
          size="sm"
          variant="ghost"
        >
          {showSecret ? copy.hideSecret : copy.showSecret}
        </Button>
        <Button
          aria-label="Copy secret"
          disabled={!keys.secret}
          onClick={copySecret}
          size="sm"
          variant="ghost"
        >
          {copy.copy}
        </Button>
        <Button
          aria-label="Clear secret"
          disabled={!keys.secret}
          onClick={() => changeKeys({ secret: "" })}
          size="sm"
          variant="ghost"
        >
          {copy.clear}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          aria-label={copy.base64Secret}
          checked={keys.encoded}
          id="jwt-secret-encoded"
          onCheckedChange={(checked) =>
            changeKeys({ encoded: checked === true })
          }
        />
        <Label className="cursor-pointer text-sm" htmlFor="jwt-secret-encoded">
          {copy.base64Secret}
        </Label>
      </div>
      {showSecret && (
        <JwtEditor
          label={copy.secretOutput}
          onChange={(value) => changeKeys({ secret: value })}
          value={keys.secret}
        />
      )}
    </div>
  ) : (
    <div className="grid gap-4 lg:grid-cols-2">
      <JwtEditor
        label={copy.publicKey}
        onChange={(value) => changeKeys({ publicKey: value })}
        placeholder={copy.publicKeyPlaceholder}
        value={keys.publicKey}
      />
      {mode === "create" && (
        <JwtEditor
          label={copy.privateKey}
          onChange={(value) => changeKeys({ privateKey: value })}
          placeholder={copy.privateKeyPlaceholder}
          value={keys.privateKey}
        />
      )}
    </div>
  );
}
