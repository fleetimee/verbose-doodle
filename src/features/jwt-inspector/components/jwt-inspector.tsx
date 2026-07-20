import { AlertCircle, CheckCircle2, Copy, HelpCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import {
  base64UrlEncode,
  parseJwt,
  signHS256,
  verifyHS256,
} from "@/features/jwt-inspector/utils/jwt";
import { messages } from "@/lib/i18n";

const parentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.32, bounce: 0.08 },
  },
};

const JWT_TOUR_ID = "jwt-inspector-intro";
const JWT_TOUR_TARGETS = {
  controls: "jwt-inspector-tour-controls",
  editors: "jwt-inspector-tour-editors",
} as const;

const JWT_TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    selectorId: JWT_TOUR_TARGETS.controls,
    position: "bottom",
    title: messages.jwtInspector.tour.controlsTitle,
    description: messages.jwtInspector.tour.controlsDescription,
  },
  {
    selectorId: JWT_TOUR_TARGETS.editors,
    position: "top",
    title: messages.jwtInspector.tour.editorsTitle,
    description: messages.jwtInspector.tour.editorsDescription,
  },
];

const DEFAULT_SECRET = "bpd-diy-jwt-secret-key-xyz-98765";

interface ClaimRow {
  readonly description: string;
  readonly name: string;
  readonly status: "success" | "warning" | "error" | "info" | "neutral";
  readonly statusText: string;
  readonly value: string;
}

function parseClaim(key: string, val: unknown): ClaimRow {
  const valStr =
    typeof val === "object" && val !== null ? JSON.stringify(val) : String(val);

  if (key === "exp" && typeof val === "number") {
    const expMs = val * 1000;
    const isExpired = expMs < Date.now();
    return {
      name: "exp (Expiration Time)",
      value: valStr,
      description: `${new Date(expMs).toLocaleString()} (${new Date(expMs).toUTCString()})`,
      status: isExpired ? "error" : "success",
      statusText: isExpired
        ? messages.jwtInspector.statusExpired
        : messages.jwtInspector.statusActive,
    };
  }

  if (key === "iat" && typeof val === "number") {
    const iatMs = val * 1000;
    return {
      name: "iat (Issued At)",
      value: valStr,
      description: `${new Date(iatMs).toLocaleString()} (${new Date(iatMs).toUTCString()})`,
      status: "info",
      statusText: "Issued",
    };
  }

  if (key === "nbf" && typeof val === "number") {
    const nbfMs = val * 1000;
    const isNotActive = nbfMs > Date.now();
    return {
      name: "nbf (Not Before)",
      value: valStr,
      description: `${new Date(nbfMs).toLocaleString()} (${new Date(nbfMs).toUTCString()})`,
      status: isNotActive ? "warning" : "success",
      statusText: isNotActive
        ? messages.jwtInspector.statusNotYetActive
        : messages.jwtInspector.statusActive,
    };
  }

  if (key === "iss") {
    return {
      name: "iss (Issuer)",
      value: valStr,
      description: messages.jwtInspector.claimIssDescription,
      status: "neutral",
      statusText: "Claim",
    };
  }

  if (key === "sub") {
    return {
      name: "sub (Subject)",
      value: valStr,
      description: messages.jwtInspector.claimSubDescription,
      status: "neutral",
      statusText: "Claim",
    };
  }

  if (key === "aud") {
    return {
      name: "aud (Audience)",
      value: valStr,
      description: messages.jwtInspector.claimAudDescription,
      status: "neutral",
      statusText: "Claim",
    };
  }

  return {
    name: key,
    value: valStr,
    description: "Custom claim",
    status: "neutral",
    statusText: "Claim",
  };
}

export function JwtInspector() {
  const shouldReduceMotion = useReducedMotion();
  const [encodedToken, setEncodedToken] = useState("");
  const [headerJson, setHeaderJson] = useState("");
  const [payloadJson, setPayloadJson] = useState("");
  const [secret, setSecret] = useState(DEFAULT_SECRET);

  const [headerError, setHeaderError] = useState<string | null>(null);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [structureError, setStructureError] = useState<string | null>(null);

  const [isSignatureVerified, setIsSignatureVerified] = useState<
    boolean | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [algorithm, setAlgorithm] = useState("HS256");

  // Track editing source to prevent infinite update loops
  const isSyncing = useRef(false);

  const loadDefaultToken = useCallback(async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const h = { alg: "HS256", typ: "JWT" };
    const p = {
      sub: "admin",
      name: "BPDDIY Administrator",
      role: "ADMIN",
      iss: "biller-simulator-backend",
      aud: "biller-simulator-frontend",
      iat: nowSeconds,
      exp: nowSeconds + 86_400, // 24 hours
    };

    const hStr = JSON.stringify(h, null, 2);
    const pStr = JSON.stringify(p, null, 2);
    const hEnc = base64UrlEncode(JSON.stringify(h));
    const pEnc = base64UrlEncode(JSON.stringify(p));
    const sig = await signHS256(`${hEnc}.${pEnc}`, DEFAULT_SECRET);

    isSyncing.current = true;
    setEncodedToken(`${hEnc}.${pEnc}.${sig}`);
    setHeaderJson(hStr);
    setPayloadJson(pStr);
    setSecret(DEFAULT_SECRET);
    setAlgorithm("HS256");
    setStructureError(null);
    setHeaderError(null);
    setPayloadError(null);
    isSyncing.current = false;
  }, []);

  // Initialize with dynamic mock token on mount
  useEffect(() => {
    loadDefaultToken();
  }, [loadDefaultToken]);

  // Update decoded views when encoded token changes
  const handleEncodedChange = useCallback((token: string) => {
    setEncodedToken(token);
    if (isSyncing.current) {
      return;
    }

    const parsed = parseJwt(token);
    if (!parsed.isValidStructure) {
      setStructureError(messages.jwtInspector.structureInvalid);
      return;
    }

    setStructureError(null);
    setHeaderError(null);
    setPayloadError(null);

    isSyncing.current = true;
    try {
      setHeaderJson(
        parsed.headerStr ? JSON.stringify(parsed.header, null, 2) : ""
      );
      setPayloadJson(
        parsed.payloadStr ? JSON.stringify(parsed.payload, null, 2) : ""
      );
      setAlgorithm(String(parsed.header.alg || "HS256"));
    } catch {
      setStructureError(messages.jwtInspector.structureInvalid);
    } finally {
      isSyncing.current = false;
    }
  }, []);

  // Sync JSON editors back to encoded token when edited
  const syncJsonToToken = useCallback(
    async (hJson: string, pJson: string, key: string) => {
      if (isSyncing.current) {
        return;
      }

      let parsedHeader: Record<string, unknown>;
      let parsedPayload: Record<string, unknown>;

      try {
        parsedHeader = JSON.parse(hJson);
        setHeaderError(null);
      } catch (e) {
        setHeaderError((e as Error).message);
        return;
      }

      try {
        parsedPayload = JSON.parse(pJson);
        setPayloadError(null);
      } catch (e) {
        setPayloadError((e as Error).message);
        return;
      }

      const alg = String(parsedHeader.alg || "HS256");
      setAlgorithm(alg);
      setStructureError(null);

      isSyncing.current = true;
      try {
        const hEnc = base64UrlEncode(JSON.stringify(parsedHeader));
        const pEnc = base64UrlEncode(JSON.stringify(parsedPayload));
        const headerAndPayload = `${hEnc}.${pEnc}`;

        if (alg === "HS256") {
          const sig = await signHS256(headerAndPayload, key);
          setEncodedToken(`${headerAndPayload}.${sig}`);
        } else {
          const parts = encodedToken.split(".");
          const oldSig =
            parts.length === 3 ? parts[2] : "signature_placeholder";
          setEncodedToken(`${headerAndPayload}.${oldSig}`);
        }
      } catch (e) {
        setStructureError((e as Error).message);
      } finally {
        isSyncing.current = false;
      }
    },
    [encodedToken]
  );

  const handleHeaderChange = useCallback(
    (value: string) => {
      setHeaderJson(value);
      syncJsonToToken(value, payloadJson, secret);
    },
    [payloadJson, secret, syncJsonToToken]
  );

  const handlePayloadChange = useCallback(
    (value: string) => {
      setPayloadJson(value);
      syncJsonToToken(headerJson, value, secret);
    },
    [headerJson, secret, syncJsonToToken]
  );

  const handleSecretChange = useCallback(
    (value: string) => {
      setSecret(value);
      syncJsonToToken(headerJson, payloadJson, value);
    },
    [headerJson, payloadJson, syncJsonToToken]
  );

  // Async signature verification
  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      const parts = encodedToken.split(".");
      if (parts.length !== 3) {
        setIsSignatureVerified(false);
        return;
      }

      if (algorithm !== "HS256") {
        setIsSignatureVerified(null);
        return;
      }

      setIsVerifying(true);
      const isOk = await verifyHS256(encodedToken, secret);
      if (isMounted) {
        setIsSignatureVerified(isOk);
        setIsVerifying(false);
      }
    };
    verify();
    return () => {
      isMounted = false;
    };
  }, [encodedToken, secret, algorithm]);

  const copyToClipboard = async (text: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const resetExample = () => {
    loadDefaultToken();
  };

  const clearEditors = () => {
    isSyncing.current = true;
    setEncodedToken("");
    setHeaderJson("");
    setPayloadJson("");
    setSecret("");
    setAlgorithm("HS256");
    setStructureError(null);
    setHeaderError(null);
    setPayloadError(null);
    isSyncing.current = false;
  };

  const renderSignatureStatus = () => {
    if (isVerifying) {
      return (
        <Badge
          className="animate-pulse bg-muted text-muted-foreground"
          variant="outline"
        >
          Verifying...
        </Badge>
      );
    }
    if (isSignatureVerified === true) {
      return (
        <Badge className="flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {messages.jwtInspector.signatureValid}
        </Badge>
      );
    }
    if (isSignatureVerified === false) {
      return (
        <Badge className="flex items-center gap-1.5 border-destructive/30 bg-destructive/15 px-2.5 py-1 font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {messages.jwtInspector.signatureInvalid}
        </Badge>
      );
    }
    return (
      <Badge className="flex items-center gap-1.5 border-yellow-500/30 bg-yellow-500/15 px-2.5 py-1 font-medium text-yellow-500">
        <HelpCircle className="h-3.5 w-3.5" />
        {messages.jwtInspector.signatureUnsupported}
      </Badge>
    );
  };

  const renderClaimStatus = (status: string, text: string) => {
    if (status === "success") {
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/15 font-normal text-[10px] text-emerald-500 hover:bg-emerald-500/15">
          {text}
        </Badge>
      );
    }
    if (status === "error") {
      return (
        <Badge className="border-destructive/30 bg-destructive/15 font-normal text-[10px] text-destructive hover:bg-destructive/15">
          {text}
        </Badge>
      );
    }
    if (status === "warning") {
      return (
        <Badge className="border-yellow-500/30 bg-yellow-500/15 font-normal text-[10px] text-yellow-500 hover:bg-yellow-500/15">
          {text}
        </Badge>
      );
    }
    if (status === "info") {
      return (
        <Badge className="border-blue-500/30 bg-blue-500/15 font-normal text-[10px] text-blue-500 hover:bg-blue-500/15">
          {text}
        </Badge>
      );
    }
    return (
      <Badge
        className="border bg-muted font-normal text-[10px] text-muted-foreground hover:bg-muted"
        variant="outline"
      >
        {text}
      </Badge>
    );
  };

  // Build claims analysis table rows
  const getClaimsRows = (): readonly ClaimRow[] => {
    if (!payloadJson) {
      return [];
    }
    try {
      const payload = JSON.parse(payloadJson);
      if (typeof payload !== "object" || payload === null) {
        return [];
      }
      return Object.entries(payload).map(([key, val]) => parseClaim(key, val));
    } catch {
      return [];
    }
  };

  const claimsRows = getClaimsRows();

  return (
    <motion.div
      animate="visible"
      className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 pb-10 md:grid-cols-[210px_minmax(0,1fr)] md:gap-10 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-14"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      {/* Sticky Sidebar */}
      <motion.aside
        className="md:sticky md:top-6 md:self-start"
        variants={childVariants}
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
          {messages.jwtInspector.eyebrow}
        </p>
        <h1 className="mt-4 max-w-48 font-semibold text-3xl leading-[0.96] tracking-[-0.045em]">
          {messages.jwtInspector.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          {messages.jwtInspector.description}
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.jwtInspector.algorithmsLabel}
            </dt>
            <dd>{messages.jwtInspector.algorithmsValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.jwtInspector.limitLabel}
            </dt>
            <dd className="font-mono">{messages.jwtInspector.limitValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">
              {messages.jwtInspector.storageLabel}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {messages.jwtInspector.storageValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-start">
          <DeveloperToolTourButton
            label={messages.jwtInspector.tour.startButton}
            steps={JWT_TOUR_STEPS}
            storageKey="jwt-inspector-tour-seen"
            tourId={JWT_TOUR_ID}
          />
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={resetExample}
            type="button"
          >
            {messages.jwtInspector.resetExample}
          </button>
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={clearEditors}
            type="button"
          >
            {messages.jwtInspector.clear}
          </button>
        </div>
      </motion.aside>

      {/* Main Panel Content */}
      <main className="min-w-0">
        {/* Controls & Secret Panel */}
        <motion.section
          className="border-y py-4"
          id={JWT_TOUR_TARGETS.controls}
          variants={childVariants}
        >
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end sm:gap-6 md:pr-6">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="jwt-secret-input">
                {messages.jwtInspector.secretLabel}
              </Label>
              <Input
                className="h-10 rounded-md bg-background px-3 font-mono shadow-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                id="jwt-secret-input"
                onChange={(e) => handleSecretChange(e.target.value)}
                placeholder={messages.jwtInspector.secretPlaceholder}
                type="text"
                value={secret}
              />
            </div>
            <div className="flex h-10 items-center justify-between border-l pl-6">
              <span className="text-muted-foreground text-xs">
                {messages.jwtInspector.signatureStatusLabel}:
              </span>
              {renderSignatureStatus()}
            </div>
          </div>
        </motion.section>

        {/* Editor Workspace */}
        <div
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
          id={JWT_TOUR_TARGETS.editors}
        >
          {/* Encoded JWT Section */}
          <div className="flex flex-col gap-6">
            <Card className="flex h-full flex-col border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold text-sm">
                    {messages.jwtInspector.inputLabel}
                  </CardTitle>
                  <Button
                    className="h-7 text-xs"
                    onClick={() =>
                      copyToClipboard(
                        encodedToken,
                        messages.jwtInspector.copySuccess
                      )
                    }
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    {messages.jwtInspector.copyToken}
                  </Button>
                </div>
                <CardDescription className="text-[11px]">
                  {messages.jwtInspector.inputDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex flex-1 flex-col p-6 pt-0">
                <div className="relative flex flex-1 flex-col">
                  <Textarea
                    aria-label={messages.jwtInspector.inputLabel}
                    className="min-h-[300px] flex-1 resize-none border bg-background font-mono text-[13px] leading-relaxed focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 lg:min-h-[440px]"
                    id="encoded-jwt-input"
                    onChange={(e) => handleEncodedChange(e.target.value)}
                    placeholder={messages.jwtInspector.inputPlaceholder}
                    value={encodedToken}
                  />
                  {structureError && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 rounded-b-md border-destructive border-t bg-destructive/10 px-3 py-2 text-destructive text-xs">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                      <span>{structureError}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decoded JSON Editors */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* Header Editor */}
            <div className="relative overflow-hidden rounded-lg border shadow-sm">
              <DocumentEditor
                byteCountMessage={messages.developerTools.converterLimit}
                description={messages.jwtInspector.headerDescription}
                format="json"
                index="01"
                label={messages.jwtInspector.headerLabel}
                lineCountMessage={messages.developerTools.openAction}
                onChange={handleHeaderChange}
                value={headerJson}
              />
              {headerError && (
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-destructive border-t bg-destructive/10 px-3 py-2 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-mono">{headerError}</span>
                </div>
              )}
            </div>

            {/* Payload Editor */}
            <div className="relative overflow-hidden rounded-lg border shadow-sm">
              <DocumentEditor
                byteCountMessage={messages.developerTools.converterLimit}
                description={messages.jwtInspector.payloadDescription}
                format="json"
                index="02"
                label={messages.jwtInspector.payloadLabel}
                lineCountMessage={messages.developerTools.openAction}
                onChange={handlePayloadChange}
                value={payloadJson}
              />
              {payloadError && (
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-destructive border-t bg-destructive/10 px-3 py-2 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-mono">{payloadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Claims Analysis */}
        {claimsRows.length > 0 && (
          <Card className="mt-6 border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-semibold text-sm">
                {messages.jwtInspector.claimsTitle}
              </CardTitle>
              <CardDescription className="text-[11px]">
                {messages.jwtInspector.claimsDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[180px] pl-6 text-xs">
                      {messages.jwtInspector.claimHeaderName}
                    </TableHead>
                    <TableHead className="text-xs">
                      {messages.jwtInspector.claimHeaderValue}
                    </TableHead>
                    <TableHead className="text-xs">
                      {messages.jwtInspector.claimHeaderDescription}
                    </TableHead>
                    <TableHead className="w-[120px] pr-6 text-xs">
                      {messages.jwtInspector.claimHeaderStatus}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claimsRows.map((row) => (
                    <TableRow className="hover:bg-muted/30" key={row.name}>
                      <TableCell className="pl-6 font-mono text-xs">
                        {row.name}
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate font-mono text-xs"
                        title={row.value}
                      >
                        {row.value}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.description}
                      </TableCell>
                      <TableCell className="pr-6">
                        {renderClaimStatus(row.status, row.statusText)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </motion.div>
  );
}
