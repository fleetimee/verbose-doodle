import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ClipboardCopyIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { JwtKeys } from "../utils/jwt-crypto";

const copy = messages.jwtInspector;

export interface JwtKeyFieldsProps {
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly generating?: boolean;
  readonly keys: JwtKeys;
  readonly mode: "inspect" | "create";
  readonly onGenerate?: () => void;
  readonly signature?: string;
  readonly symmetric: boolean;
}

function TerminalHeader({
  actions,
  children,
}: {
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/15 px-3 py-1.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="font-mono font-semibold text-muted-foreground text-xs"
        >
          &gt;_
        </span>
        {children}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </div>
  );
}

function SymmetricKeyEditor({
  changeKeys,
  keys,
  signature = "",
}: {
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly keys: JwtKeys;
  readonly signature?: string;
}) {
  const [activeTab, setActiveTab] = useState<"secret" | "signature">("secret");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedSignature, setCopiedSignature] = useState(false);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(keys.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast.success(copy.copySuccess);
    } catch {
      toast.error(copy.copyFailed);
    }
  };

  const copySignatureValue = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopiedSignature(true);
      setTimeout(() => setCopiedSignature(false), 2000);
      toast.success(copy.copySuccess);
    } catch {
      toast.error(copy.copyFailed);
    }
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground">
      <Tabs
        className="w-full"
        onValueChange={(val) => setActiveTab(val as "secret" | "signature")}
        value={activeTab}
        variant="flush"
      >
        <TerminalHeader
          actions={
            activeTab === "secret" ? (
              <>
                <Button
                  aria-label={showSecret ? copy.hideSecret : copy.showSecret}
                  aria-pressed={showSecret}
                  className="size-7"
                  onClick={() => setShowSecret(!showSecret)}
                  size="icon"
                  title={showSecret ? copy.hideSecret : copy.showSecret}
                  variant="ghost"
                >
                  <HugeiconsIcon
                    className="size-3.5"
                    icon={showSecret ? ViewOffIcon : ViewIcon}
                  />
                  <span className="sr-only">
                    {showSecret ? copy.hideSecret : copy.showSecret}
                  </span>
                </Button>
                <Button
                  aria-label={`${copy.copy} ${copy.secretOutput}`}
                  className="size-7"
                  disabled={!keys.secret}
                  onClick={copySecret}
                  size="icon"
                  title={copy.copy}
                  variant="ghost"
                >
                  <HugeiconsIcon
                    className="size-3.5"
                    icon={
                      copiedSecret ? CheckmarkCircle02Icon : ClipboardCopyIcon
                    }
                  />
                  <span className="sr-only">{copy.copy}</span>
                </Button>
                <Button
                  aria-label={`${copy.clear} ${copy.secretOutput}`}
                  className="size-7"
                  disabled={!keys.secret}
                  onClick={() => changeKeys({ secret: "" })}
                  size="icon"
                  title={copy.clear}
                  variant="ghost"
                >
                  <HugeiconsIcon className="size-3.5" icon={Cancel01Icon} />
                  <span className="sr-only">{copy.clear}</span>
                </Button>
              </>
            ) : (
              <Button
                aria-label={`${copy.copy} ${copy.signatureLabel}`}
                className="size-7"
                disabled={!signature}
                onClick={copySignatureValue}
                size="icon"
                title={copy.copy}
                variant="ghost"
              >
                <HugeiconsIcon
                  className="size-3.5"
                  icon={
                    copiedSignature ? CheckmarkCircle02Icon : ClipboardCopyIcon
                  }
                />
                <span className="sr-only">
                  {copy.copy} {copy.signatureLabel}
                </span>
              </Button>
            )
          }
        >
          <TabsList size="xs" variant="subtle">
            <TabsTrigger size="sm" value="secret" variant="compact">
              {copy.secretOutput}
            </TabsTrigger>
            <TabsTrigger size="sm" value="signature" variant="compact">
              {copy.signatureLabel}
            </TabsTrigger>
          </TabsList>
        </TerminalHeader>

        <TabsContent
          className="m-0 min-h-[117px]"
          value="secret"
          variant="flush"
        >
          <div className="relative p-3">
            <Label className="sr-only" htmlFor="jwt-secret-input">
              {copy.secretLabel}
            </Label>
            <Textarea
              aria-label={copy.secretLabel}
              autoComplete="off"
              className={cn(
                "min-h-[60px] resize-none",
                !showSecret && "[-webkit-text-security:disc]"
              )}
              id="jwt-secret-input"
              onChange={(event) => changeKeys({ secret: event.target.value })}
              placeholder={copy.secretPlaceholder}
              spellCheck={false}
              value={keys.secret}
              variant="ghost-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 border-t bg-muted/5 px-3 py-2 text-xs">
            {keys.secret.trim() ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <HugeiconsIcon
                  className="size-3.5"
                  icon={CheckmarkCircle02Icon}
                />
                <span>{copy.validSecret}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                {copy.secretPlaceholder}
              </span>
            )}
          </div>
        </TabsContent>

        <TabsContent
          className="m-0 min-h-[117px]"
          value="signature"
          variant="flush"
        >
          <div className="relative p-3">
            <Textarea
              aria-label={copy.signatureLabel}
              className="min-h-[60px] resize-none break-all"
              placeholder={copy.tokenSignatureLabel}
              readOnly
              spellCheck={false}
              value={signature}
              variant="ghost-mono"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AsymmetricCreateKeyEditor({
  changeKeys,
  copyKey,
  keys,
}: {
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly copyKey: (
    value: string,
    setCopied: (value: boolean) => void
  ) => Promise<void>;
  readonly keys: JwtKeys;
}) {
  const [copiedPub, setCopiedPub] = useState(false);
  const [copiedPriv, setCopiedPriv] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground">
        <TerminalHeader
          actions={
            <>
              <Button
                aria-label={formatMessage(copy.copyTarget, {
                  target: copy.publicKey,
                })}
                className="size-7"
                disabled={!keys.publicKey}
                onClick={() => copyKey(keys.publicKey, setCopiedPub)}
                size="icon"
                title={copy.copy}
                variant="ghost"
              >
                <HugeiconsIcon
                  className="size-3.5"
                  icon={copiedPub ? CheckmarkCircle02Icon : ClipboardCopyIcon}
                />
              </Button>
              <Button
                aria-label={formatMessage(copy.clearTarget, {
                  target: copy.publicKey,
                })}
                className="size-7"
                disabled={!keys.publicKey}
                onClick={() => changeKeys({ publicKey: "" })}
                size="icon"
                title={copy.clear}
                variant="ghost"
              >
                <HugeiconsIcon className="size-3.5" icon={Cancel01Icon} />
              </Button>
            </>
          }
        >
          <span className="font-medium text-foreground text-xs">
            {copy.publicKey}
          </span>
        </TerminalHeader>
        <div className="relative p-3">
          <Textarea
            aria-label={copy.publicKey}
            className="max-h-[140px] min-h-[85px] resize-none overflow-auto"
            onChange={(e) => changeKeys({ publicKey: e.target.value })}
            placeholder={copy.publicKeyPlaceholder}
            size="xs"
            spellCheck={false}
            value={keys.publicKey}
            variant="ghost-mono"
          />
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground">
        <TerminalHeader
          actions={
            <>
              <Button
                aria-label={formatMessage(copy.copyTarget, {
                  target: copy.privateKey,
                })}
                className="size-7"
                disabled={!keys.privateKey}
                onClick={() => copyKey(keys.privateKey, setCopiedPriv)}
                size="icon"
                title={copy.copy}
                variant="ghost"
              >
                <HugeiconsIcon
                  className="size-3.5"
                  icon={copiedPriv ? CheckmarkCircle02Icon : ClipboardCopyIcon}
                />
              </Button>
              <Button
                aria-label={formatMessage(copy.clearTarget, {
                  target: copy.privateKey,
                })}
                className="size-7"
                disabled={!keys.privateKey}
                onClick={() => changeKeys({ privateKey: "" })}
                size="icon"
                title={copy.clear}
                variant="ghost"
              >
                <HugeiconsIcon className="size-3.5" icon={Cancel01Icon} />
              </Button>
            </>
          }
        >
          <span className="font-medium text-foreground text-xs">
            {copy.privateKey}
          </span>
        </TerminalHeader>
        <div className="relative p-3">
          <Textarea
            aria-label={copy.privateKey}
            className="max-h-[140px] min-h-[85px] resize-none overflow-auto"
            onChange={(e) => changeKeys({ privateKey: e.target.value })}
            placeholder={copy.privateKeyPlaceholder}
            size="xs"
            spellCheck={false}
            value={keys.privateKey}
            variant="ghost-mono"
          />
        </div>
      </div>
    </div>
  );
}

function AsymmetricInspectKeyEditor({
  changeKeys,
  copyKey,
  keys,
  signature,
}: {
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly copyKey: (
    value: string,
    setCopied: (value: boolean) => void
  ) => Promise<void>;
  readonly keys: JwtKeys;
  readonly signature: string;
}) {
  const [copiedPub, setCopiedPub] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const [activeTab, setActiveTab] = useState<"public" | "signature">("public");

  return (
    <div className="min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground">
      <Tabs
        defaultValue="public"
        onValueChange={(val) => setActiveTab(val as "public" | "signature")}
        value={activeTab}
      >
        <TerminalHeader
          actions={
            activeTab === "public" ? (
              <>
                <Button
                  aria-label={formatMessage(copy.copyTarget, {
                    target: copy.publicKey,
                  })}
                  className="size-7"
                  disabled={!keys.publicKey}
                  onClick={() => copyKey(keys.publicKey, setCopiedPub)}
                  size="icon"
                  title={copy.copy}
                  variant="ghost"
                >
                  <HugeiconsIcon
                    className="size-3.5"
                    icon={copiedPub ? CheckmarkCircle02Icon : ClipboardCopyIcon}
                  />
                </Button>
                <Button
                  aria-label={formatMessage(copy.clearTarget, {
                    target: copy.publicKey,
                  })}
                  className="size-7"
                  disabled={!keys.publicKey}
                  onClick={() => changeKeys({ publicKey: "" })}
                  size="icon"
                  title={copy.clear}
                  variant="ghost"
                >
                  <HugeiconsIcon className="size-3.5" icon={Cancel01Icon} />
                </Button>
              </>
            ) : (
              <Button
                aria-label={`${copy.copy} ${copy.signatureLabel}`}
                className="size-7"
                disabled={!signature}
                onClick={() => copyKey(signature, setCopiedSig)}
                size="icon"
                title={copy.copy}
                variant="ghost"
              >
                <HugeiconsIcon
                  className="size-3.5"
                  icon={copiedSig ? CheckmarkCircle02Icon : ClipboardCopyIcon}
                />
                <span className="sr-only">
                  {copy.copy} {copy.signatureLabel}
                </span>
              </Button>
            )
          }
        >
          <TabsList size="xs" variant="subtle">
            <TabsTrigger size="sm" value="public" variant="compact">
              {copy.publicKey}
            </TabsTrigger>
            <TabsTrigger size="sm" value="signature" variant="compact">
              {copy.signatureLabel}
            </TabsTrigger>
          </TabsList>
        </TerminalHeader>

        <TabsContent
          className="m-0 min-h-[142px]"
          value="public"
          variant="flush"
        >
          <div className="relative p-3">
            <Textarea
              aria-label={copy.publicKey}
              className="max-h-[140px] min-h-[85px] resize-none overflow-auto"
              onChange={(e) => changeKeys({ publicKey: e.target.value })}
              placeholder={copy.publicKeyPlaceholder}
              size="xs"
              spellCheck={false}
              value={keys.publicKey}
              variant="ghost-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 border-t bg-muted/5 px-3 py-2 text-xs">
            {keys.publicKey.trim() ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <HugeiconsIcon
                  className="size-3.5"
                  icon={CheckmarkCircle02Icon}
                />
                <span>{copy.validPublicKey}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                {copy.publicKeyPlaceholder}
              </span>
            )}
          </div>
        </TabsContent>

        <TabsContent
          className="m-0 min-h-[142px]"
          value="signature"
          variant="flush"
        >
          <div className="relative p-3">
            <Textarea
              aria-label={copy.signatureLabel}
              className="max-h-[140px] min-h-[85px] resize-none overflow-auto break-all"
              placeholder={copy.tokenSignatureLabel}
              readOnly
              size="xs"
              spellCheck={false}
              value={signature}
              variant="ghost-mono"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AsymmetricKeyEditor({
  changeKeys,
  keys,
  mode,
  signature = "",
}: {
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly keys: JwtKeys;
  readonly mode: "inspect" | "create";
  readonly signature?: string;
}) {
  const copyKey = async (text: string, setCopied: (value: boolean) => void) => {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(copy.copySuccess);
    } catch {
      toast.error(copy.copyFailed);
    }
  };

  return (
    <div className="space-y-3">
      {mode === "create" ? (
        <AsymmetricCreateKeyEditor
          changeKeys={changeKeys}
          copyKey={copyKey}
          keys={keys}
        />
      ) : (
        <AsymmetricInspectKeyEditor
          changeKeys={changeKeys}
          copyKey={copyKey}
          keys={keys}
          signature={signature}
        />
      )}
    </div>
  );
}

function getSubtitle(symmetric: boolean, mode: "inspect" | "create"): string {
  if (symmetric) {
    return copy.subtitleSymmetric;
  }
  if (mode === "inspect") {
    return copy.subtitleInspectAsymmetric;
  }
  return copy.subtitleCreateAsymmetric;
}

export function JwtKeyFields({
  changeKeys,
  generating = false,
  keys,
  mode,
  onGenerate,
  signature = "",
  symmetric,
}: JwtKeyFieldsProps) {
  const subtitle = getSubtitle(symmetric, mode);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-sm">
            {mode === "inspect" ? copy.verificationOptional : copy.signing}
          </h2>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
        {symmetric && (
          <div className="flex items-center gap-2">
            <Label
              className="cursor-pointer"
              htmlFor="jwt-secret-encoded"
              size="xs"
              variant="mono"
            >
              {copy.base64Secret}
            </Label>
            <Switch
              checked={keys.encoded}
              id="jwt-secret-encoded"
              onCheckedChange={(checked) =>
                changeKeys({ encoded: checked === true })
              }
            />
          </div>
        )}
      </div>

      {symmetric ? (
        <SymmetricKeyEditor
          changeKeys={changeKeys}
          keys={keys}
          signature={signature}
        />
      ) : (
        <AsymmetricKeyEditor
          changeKeys={changeKeys}
          keys={keys}
          mode={mode}
          signature={signature}
        />
      )}

      {mode === "create" && onGenerate && (
        <Button
          className="w-full"
          disabled={generating}
          onClick={onGenerate}
          size="sm"
        >
          {generating ? copy.generating : copy.generate}
        </Button>
      )}
    </div>
  );
}
