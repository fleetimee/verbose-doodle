import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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

function claimTime(name: string, value: unknown, now: number): string {
  if (!["exp", "iat", "nbf"].includes(name)) {
    return "";
  }
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    Number.isNaN(new Date(value * 1000).getTime())
  ) {
    return copy.invalidTimestamp;
  }
  const date = new Date(value * 1000).toISOString();
  const seconds = Math.ceil(value - now / 1000);
  if (name === "exp") {
    return seconds <= 0
      ? `${date} · ${copy.statusExpired}`
      : `${date} · ${copy.expiresIn} ${seconds}s`;
  }
  if (name === "nbf" && seconds > 0) {
    return `${date} · ${copy.statusNotYetActive}`;
  }
  return date;
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

type JwtPaneMotionProps = {
  readonly layout: false | "position";
  readonly layoutDuration: number;
};

function JwtTokenPane({
  inspectMode,
  layout,
  layoutDuration,
  onInspect,
  signature,
  token,
  tokenError,
}: JwtPaneMotionProps & {
  readonly inspectMode: boolean;
  readonly onInspect: (value: string) => void;
  readonly signature: string;
  readonly token: string;
  readonly tokenError: string;
}) {
  return (
    <motion.div
      className="min-w-0 space-y-4"
      data-jwt-pane="token"
      layout={layout}
      transition={{
        layout: { duration: layoutDuration, ease: MOTION_EASE.inOut },
      }}
    >
      <JwtEditor
        colorizeToken
        copyLabel={copy.copyToken}
        label={copy.inputLabel}
        onChange={inspectMode ? onInspect : undefined}
        placeholder={
          inspectMode ? copy.inputPlaceholder : copy.generatedPlaceholder
        }
        value={token}
      />
      {tokenError && (
        <p className="text-destructive text-sm" role="alert">
          {tokenError}
        </p>
      )}
      <JwtEditor label={copy.signatureLabel} value={signature} />
    </motion.div>
  );
}

function JwtDecodedPane({
  editable,
  header,
  layout,
  layoutDuration,
  onHeaderChange,
  onPayloadChange,
  payload,
}: JwtPaneMotionProps & {
  readonly editable: boolean;
  readonly header: string;
  readonly onHeaderChange: (value: string) => void;
  readonly onPayloadChange: (value: string) => void;
  readonly payload: string;
}) {
  return (
    <motion.div
      className="min-w-0 space-y-4"
      data-jwt-pane="decoded"
      layout={layout}
      transition={{
        layout: { duration: layoutDuration, ease: MOTION_EASE.inOut },
      }}
    >
      <JwtEditor
        copyLabel={copy.copyHeader}
        json
        label={copy.headerLabel}
        onChange={editable ? (value) => onHeaderChange(value) : undefined}
        value={header}
      />
      <JwtEditor
        copyLabel={copy.copyDecoded}
        json
        label={copy.payloadLabel}
        onChange={editable ? (value) => onPayloadChange(value) : undefined}
        value={payload}
      />
    </motion.div>
  );
}

export function JwtInspector() {
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
  const [now, setNow] = useState(Date.now);
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
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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
    const seconds = Math.floor(Date.now() / 1000);
    const h = JSON.stringify({ alg: preset, typ: "JWT" });
    const p = JSON.stringify({
      sub: "developer",
      iss: "biller-simulator-backend",
      iat: seconds,
      exp: seconds + 3600,
    });
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
      try {
        const alg = JSON.parse(value)?.alg;
        if (isSupportedAlgorithm(alg)) {
          setPreset(alg);
        }
      } catch {
        // Keep incomplete JSON editable.
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
      inspectMode={mode === "inspect"}
      key="token-pane"
      layout={paneLayout}
      layoutDuration={paneDuration}
      onInspect={inspectToken}
      signature={parsed.isValidStructure ? parsed.signatureHex : ""}
      token={token}
      tokenError={tokenError}
    />
  );
  const decodedPane = (
    <JwtDecodedPane
      editable={mode === "create"}
      header={header}
      key="decoded-pane"
      layout={paneLayout}
      layoutDuration={paneDuration}
      onHeaderChange={(value) => changeDraft("header", value)}
      onPayloadChange={(value) => changeDraft("payload", value)}
      payload={payload}
    />
  );
  const workspacePanes =
    mode === "create" ? [decodedPane, tokenPane] : [tokenPane, decodedPane];

  return (
    <DeveloperToolLayout
      clearLabel={copy.clear}
      description={copy.simpleDescription}
      headerExtra={
        <JwtAlgorithmSelect onValueChange={changeAlgorithm} value={preset} />
      }
      onClear={clear}
      onReset={loadExample}
      resetLabel={copy.loadExample}
      title={copy.title}
    >
      <fieldset aria-label={copy.modeLabel} className="mb-4 flex gap-2">
        {(["inspect", "create"] as const).map((value) => (
          <Button
            aria-pressed={mode === value}
            key={value}
            onClick={() => {
              invalidate();
              if (value === "inspect") {
                inspectToken(token);
              }
              setMode(value);
            }}
            size="sm"
            variant={mode === value ? "secondary" : "ghost"}
          >
            {value === "inspect" ? copy.inspect : copy.create}
          </Button>
        ))}
      </fieldset>
      <LayoutGroup id="jwt-inspector-workspace">
        <motion.div
          className="grid min-w-0 gap-4 lg:grid-cols-2"
          data-testid="jwt-editor-workspace"
          layout={!shouldReduceMotion}
          transition={paneTransition}
        >
          {workspacePanes}
        </motion.div>
      </LayoutGroup>
      <section className="mt-6 space-y-3 border-t pt-4">
        <h2 className="font-medium text-sm">
          {mode === "inspect" ? copy.verificationOptional : copy.signing}
        </h2>
        <JwtKeyFields
          changeKeys={changeKeys}
          keys={keys}
          mode={mode}
          symmetric={symmetric}
        />
        {mode === "create" && (
          <Button disabled={generating} onClick={generate} size="sm">
            {generating ? copy.generating : copy.generate}
          </Button>
        )}
        <p
          aria-live="polite"
          className="text-muted-foreground text-sm"
          role="status"
        >
          {generating ? copy.generating : status}
        </p>
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
      </section>
      {parsed.isValidStructure && (
        <section className="mt-6 border-t pt-4">
          <h2 className="mb-3 font-medium text-sm">{copy.claimsTitle}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">
                    {copy.claimHeaderName}
                  </th>
                  <th className="py-2 pr-4 font-normal">
                    {copy.claimHeaderValue}
                  </th>
                  <th className="py-2 font-normal">{copy.timeUtc}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(parsed.payload).map(([name, value]) => (
                  <tr className="border-b last:border-0" key={name}>
                    <td className="py-2 pr-4 align-top font-mono">{name}</td>
                    <td className="max-w-xs break-all py-2 pr-4 align-top font-mono">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </td>
                    <td className="py-2 align-top text-muted-foreground">
                      {claimTime(name, value, now)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DeveloperToolLayout>
  );
}
