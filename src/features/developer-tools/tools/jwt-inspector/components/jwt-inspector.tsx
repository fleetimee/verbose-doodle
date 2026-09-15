import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { parseJwt } from "@/features/developer-tools/tools/jwt-inspector/utils/jwt";
import { messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import {
  createJwtKeys,
  isSupportedAlgorithm,
  JWT_ALGORITHMS,
  type JwtAlgorithm,
  type JwtKeys,
  signJwt,
  verifyJwt,
} from "../utils/jwt-crypto";
import { JwtEditor } from "./jwt-editor";
import { JwtKeyFields } from "./jwt-key-fields";

const copy = messages.jwtInspector;
const BEARER_PREFIX = /^Bearer\s+/i;

function signatureStatus(
  algorithm: string,
  secret: string,
  result: string
): string {
  if (!algorithm) {
    return copy.notChecked;
  }
  if (!isSupportedAlgorithm(algorithm)) {
    return copy.signatureUnsupported;
  }
  return secret ? result || copy.verifying : copy.notChecked;
}

function algorithmDisplayName(algorithm: JwtAlgorithm): string {
  return algorithm === "EdDSA" ? "EdDSA (Ed25519)" : algorithm;
}

function JwtAlgorithmSelect({
  onValueChange,
  value,
}: {
  readonly onValueChange: (value: string) => void;
  readonly value: JwtAlgorithm;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs" htmlFor="jwt-algorithm">
        {copy.algorithm}
      </Label>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger
          className="w-36 bg-background font-mono text-xs shadow-none"
          id="jwt-algorithm"
          size="sm"
        >
          <SelectValue>{algorithmDisplayName(value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {JWT_ALGORITHMS.map((algorithm) => (
            <SelectItem className="font-mono" key={algorithm} value={algorithm}>
              {algorithmDisplayName(algorithm)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function parseHeaderAlgorithm(headerJson: string): JwtAlgorithm | null {
  try {
    const alg = JSON.parse(headerJson)?.alg;
    return isSupportedAlgorithm(alg) ? (alg as JwtAlgorithm) : null;
  } catch {
    return null;
  }
}

function buildDefaultClaims(preset: JwtAlgorithm) {
  const seconds = Math.floor(Date.now() / 1000);
  const header = JSON.stringify({ alg: preset, typ: "JWT" });
  const payload = JSON.stringify({
    sub: "developer",
    iss: "biller-simulator-backend",
    iat: seconds,
    exp: seconds + 3600,
  });
  return { header, payload };
}

function ModeSelector({
  mode,
  onModeChange,
}: {
  readonly mode: "inspect" | "create";
  readonly onModeChange: (mode: "inspect" | "create") => void;
}) {
  return (
    <fieldset aria-label={copy.modeLabel} className="mb-4 flex gap-2">
      {(["inspect", "create"] as const).map((value) => (
        <Button
          aria-pressed={mode === value}
          key={value}
          onClick={() => onModeChange(value)}
          size="sm"
          variant={mode === value ? "secondary" : "ghost"}
        >
          {value === "inspect" ? copy.inspect : copy.create}
        </Button>
      ))}
    </fieldset>
  );
}

type JwtPaneMotionProps = {
  readonly layout: false | "position";
  readonly layoutDuration: number;
};

function renderTokenStatus(token: string, tokenError: string) {
  if (!token) {
    return (
      <span className="text-muted-foreground">{copy.noTokenProvided}</span>
    );
  }
  if (tokenError) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
        <HugeiconsIcon className="size-4" icon={AlertCircleIcon} />
        <span>{tokenError}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
      <HugeiconsIcon className="size-4" icon={CheckmarkCircle02Icon} />
      <span>{copy.validJwt}</span>
    </span>
  );
}

function renderSignatureStatus(
  status: string,
  isValidSig: boolean,
  isInvalidSig: boolean
) {
  if (isValidSig) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
        <HugeiconsIcon className="size-4" icon={CheckmarkCircle02Icon} />
        <span>{copy.signatureValid}</span>
      </span>
    );
  }
  if (isInvalidSig) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
        <HugeiconsIcon className="size-4" icon={AlertCircleIcon} />
        <span>{copy.signatureInvalid}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span>{status || copy.notChecked}</span>
    </span>
  );
}

function JwtTokenPane({
  error,
  inspectMode,
  layout,
  layoutDuration,
  onInspect,
  status,
  token,
  tokenError,
}: JwtPaneMotionProps & {
  readonly error?: string;
  readonly inspectMode: boolean;
  readonly onInspect: (value: string) => void;
  readonly status: string;
  readonly token: string;
  readonly tokenError: string;
}) {
  const isInvalidSig = status === copy.signatureInvalid;
  const isValidSig = status === copy.signatureValid;

  return (
    <motion.div
      className="flex h-full min-w-0 flex-col"
      data-jwt-pane="token"
      layout={layout}
      transition={{
        layout: { duration: layoutDuration, ease: MOTION_EASE.inOut },
      }}
    >
      <JwtEditor
        className="flex h-full min-h-0 flex-1 flex-col"
        colorizeToken
        copyLabel={copy.copyToken}
        description={copy.inputDescription}
        footer={
          <div className="shrink-0 space-y-1.5 border-t bg-muted/10 px-4 py-2.5 font-mono text-xs">
            <div className="flex items-center gap-2">
              {renderTokenStatus(token, tokenError)}
            </div>

            <div className="flex items-center gap-2">
              {renderSignatureStatus(status, isValidSig, isInvalidSig)}
            </div>

            {error && (
              <p className="text-destructive text-xs" role="alert">
                {error}
              </p>
            )}
          </div>
        }
        label={copy.inputLabel}
        onChange={inspectMode ? onInspect : undefined}
        placeholder={
          inspectMode ? copy.inputPlaceholder : copy.generatedPlaceholder
        }
        value={token}
      />
    </motion.div>
  );
}

function JwtDecodedPane({
  changeKeys,
  editable,
  generating,
  header,
  keys,
  layout,
  layoutDuration,
  mode,
  onGenerate,
  onHeaderChange,
  onPayloadChange,
  payload,
  signature,
  symmetric,
}: JwtPaneMotionProps & {
  readonly changeKeys: (next: Partial<JwtKeys>) => void;
  readonly editable: boolean;
  readonly generating: boolean;
  readonly header: string;
  readonly keys: JwtKeys;
  readonly mode: "inspect" | "create";
  readonly onGenerate: () => void;
  readonly onHeaderChange: (value: string) => void;
  readonly onPayloadChange: (value: string) => void;
  readonly payload: string;
  readonly signature: string;
  readonly symmetric: boolean;
}) {
  return (
    <motion.div
      className="flex h-full min-w-0 flex-col justify-between gap-3"
      data-jwt-pane="decoded"
      layout={layout}
      transition={{
        layout: { duration: layoutDuration, ease: MOTION_EASE.inOut },
      }}
    >
      <JwtEditor
        copyLabel={copy.copyHeader}
        description={copy.headerDescription}
        height="95px"
        json
        label={copy.headerLabel}
        onChange={editable ? (value) => onHeaderChange(value) : undefined}
        value={header}
      />
      <JwtEditor
        copyLabel={copy.copyDecoded}
        description={copy.payloadDescription}
        height="160px"
        json
        label={copy.payloadLabel}
        onChange={editable ? (value) => onPayloadChange(value) : undefined}
        value={payload}
      />
      <JwtKeyFields
        changeKeys={changeKeys}
        generating={generating}
        keys={keys}
        mode={mode}
        onGenerate={onGenerate}
        signature={signature}
        symmetric={symmetric}
      />
    </motion.div>
  );
}

export function JwtInspector() {
  useI18n();
  const [mode, setMode] = useState<"inspect" | "create">("inspect");
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [keys, setKeys] = useState<JwtKeys>({
    secret: "",
    encoded: false,
    privateKey: "",
    publicKey: "",
  });
  const [preset, setPreset] = useState<JwtAlgorithm>("HS256");
  const [error, setError] = useState("");
  const [verification, setVerification] = useState({
    token: "",
    secret: "",
    status: "",
  });
  const [generating, setGenerating] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const revision = useRef(0);
  const parsed = parseJwt(token);
  const algorithm = parsed.isValidStructure ? String(parsed.header.alg) : "";
  const keyAlgorithm = mode === "create" ? preset : algorithm || preset;
  const symmetric = keyAlgorithm.startsWith("HS");
  const verificationKey = JSON.stringify([
    keys.secret,
    keys.encoded,
    keys.publicKey,
  ]);
  const hasVerificationKey = algorithm.startsWith("HS")
    ? keys.secret
    : keys.publicKey;

  useEffect(() => {
    if (
      !(
        token &&
        parsed.isValidStructure &&
        isSupportedAlgorithm(algorithm) &&
        hasVerificationKey
      )
    ) {
      return;
    }
    let cancelled = false;
    verifyJwt(token, keys)
      .then((valid) => {
        if (!cancelled) {
          setVerification({
            token,
            secret: verificationKey,
            status: valid ? copy.signatureValid : copy.signatureInvalid,
          });
        }
      })
      .catch((failure: unknown) => {
        if (!cancelled) {
          setVerification({
            token,
            secret: verificationKey,
            status:
              failure instanceof Error ? failure.message : copy.cryptoError,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    token,
    keys,
    verificationKey,
    hasVerificationKey,
    algorithm,
    parsed.isValidStructure,
  ]);

  const invalidate = () => {
    revision.current += 1;
    setGenerating(false);
    setError("");
  };

  const inspectToken = (value: string) => {
    invalidate();
    const normalized = value.trim().replace(BEARER_PREFIX, "");
    setToken(normalized);
    const result = parseJwt(normalized);
    if (!result.isValidStructure) {
      setHeader("");
      setPayload("");
      return;
    }
    setHeader(JSON.stringify(result.header, null, 2));
    setPayload(JSON.stringify(result.payload, null, 2));
    if (isSupportedAlgorithm(String(result.header.alg))) {
      setPreset(result.header.alg as JwtAlgorithm);
    }
  };

  const clear = () => {
    invalidate();
    setToken("");
    setHeader("");
    setPayload("");
    setKeys({ secret: "", encoded: false, privateKey: "", publicKey: "" });
  };

  const loadExample = async () => {
    invalidate();
    const current = revision.current;
    const { header: h, payload: p } = buildDefaultClaims(preset);
    setGenerating(true);
    try {
      const exampleKeys = await createJwtKeys(preset);
      const exampleToken = await signJwt(h, p, exampleKeys);
      if (current === revision.current) {
        inspectToken(exampleToken);
        setKeys(exampleKeys);
      }
    } catch (failure) {
      if (current === revision.current) {
        setError(failure instanceof Error ? failure.message : copy.cryptoError);
        setGenerating(false);
      }
    }
  };

  useEffect(() => {
    loadExample();
  }, []);

  const generate = async () => {
    invalidate();
    const current = revision.current;
    try {
      setGenerating(true);
      const generated = await signJwt(header, payload, keys);
      if (current === revision.current) {
        setToken(generated);
      }
    } catch (failure) {
      if (current === revision.current) {
        setError(failure instanceof Error ? failure.message : copy.cryptoError);
      }
    } finally {
      if (current === revision.current) {
        setGenerating(false);
      }
    }
  };

  const changeKeys = (next: Partial<JwtKeys>) => {
    invalidate();
    setKeys({ ...keys, ...next });
    if (mode === "create") {
      setToken("");
    }
  };

  const changeDraft = (field: "header" | "payload", value: string) => {
    invalidate();
    setToken("");
    if (field === "header") {
      setHeader(value);
      const alg = parseHeaderAlgorithm(value);
      if (alg) {
        setPreset(alg);
      }
    } else {
      setPayload(value);
    }
  };

  const changeAlgorithm = (value: string) => {
    const next = value as JwtAlgorithm;
    invalidate();
    setPreset(next);
    if (mode === "create") {
      setToken("");
      setHeader(JSON.stringify({ alg: next, typ: "JWT" }, null, 2));
      setKeys({
        secret: "",
        encoded: false,
        privateKey: "",
        publicKey: "",
      });
    }
  };

  const status = signatureStatus(
    algorithm,
    hasVerificationKey,
    verification.token === token && verification.secret === verificationKey
      ? verification.status
      : ""
  );
  const tokenError =
    token && !parsed.isValidStructure ? (parsed.error ?? "") : "";
  const paneDuration = shouldReduceMotion
    ? MOTION_DURATION.instant
    : MOTION_DURATION.standard;
  const paneTransition = {
    layout: {
      duration: paneDuration,
      ease: MOTION_EASE.inOut,
    },
  };
  const paneLayout: false | "position" = shouldReduceMotion
    ? false
    : "position";
  const tokenPane = (
    <JwtTokenPane
      error={error}
      inspectMode={mode === "inspect"}
      key="token-pane"
      layout={paneLayout}
      layoutDuration={paneDuration}
      onInspect={inspectToken}
      status={status}
      token={token}
      tokenError={tokenError}
    />
  );
  const decodedPane = (
    <JwtDecodedPane
      changeKeys={changeKeys}
      editable={mode === "create"}
      generating={generating}
      header={header}
      key="decoded-pane"
      keys={keys}
      layout={paneLayout}
      layoutDuration={paneDuration}
      mode={mode}
      onGenerate={generate}
      onHeaderChange={(value) => changeDraft("header", value)}
      onPayloadChange={(value) => changeDraft("payload", value)}
      payload={payload}
      signature={parsed.isValidStructure ? parsed.signatureHex : ""}
      symmetric={symmetric}
    />
  );
  const workspacePanes =
    mode === "create" ? [decodedPane, tokenPane] : [tokenPane, decodedPane];

  return (
    <DeveloperToolLayout
      className="jwt-inspector-scrollbars min-h-0 flex-1 gap-4 pb-4"
      clearLabel={copy.clear}
      description={copy.simpleDescription}
      headerExtra={
        <JwtAlgorithmSelect onValueChange={changeAlgorithm} value={preset} />
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={clear}
      onReset={loadExample}
      resetLabel={copy.loadExample}
      title={copy.title}
    >
      <ModeSelector
        mode={mode}
        onModeChange={(nextMode) => {
          invalidate();
          if (nextMode === "inspect") {
            inspectToken(token);
          }
          setMode(nextMode);
        }}
      />
      <LayoutGroup id="jwt-inspector-workspace">
        <motion.div
          className="grid min-w-0 items-stretch gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2"
          data-testid="jwt-editor-workspace"
          layout={!shouldReduceMotion}
          transition={paneTransition}
        >
          {workspacePanes}
        </motion.div>
      </LayoutGroup>
    </DeveloperToolLayout>
  );
}
