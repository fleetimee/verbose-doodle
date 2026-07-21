import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Activity, Braces, Cpu, Network, Play, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

type DemoTab = "endpoints" | "sockets" | "devtools";

export type SimulatorDemoPreviewProps = {
  locale?: AppLocale;
};

export function SimulatorDemoPreview({ locale }: SimulatorDemoPreviewProps) {
  const [activeTab, setActiveTab] = useState<DemoTab>("endpoints");
  const [simulating, setSimulating] = useState(false);
  const activeMessages = getMessages(locale || getActiveLocale());

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 800);
  };

  return (
    <Card className="overflow-hidden border-border/80 bg-card/60 shadow-lg backdrop-blur-md">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Cpu className="h-5 w-5 text-primary" />
              {activeMessages.about.interactiveDemoTitle}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {activeMessages.about.interactiveDemoDescription}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/80 p-1">
            <Button
              className="gap-1.5 text-xs"
              onClick={() => setActiveTab("endpoints")}
              size="sm"
              variant={activeTab === "endpoints" ? "default" : "ghost"}
            >
              <Network className="h-3.5 w-3.5" />
              API Endpoints
            </Button>
            <Button
              className="gap-1.5 text-xs"
              onClick={() => setActiveTab("sockets")}
              size="sm"
              variant={activeTab === "sockets" ? "default" : "ghost"}
            >
              <Activity className="h-3.5 w-3.5" />
              Socket Bridge
            </Button>
            <Button
              className="gap-1.5 text-xs"
              onClick={() => setActiveTab("devtools")}
              size="sm"
              variant={activeTab === "devtools" ? "default" : "ghost"}
            >
              <Braces className="h-3.5 w-3.5" />
              Dev Tools
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "endpoints" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="endpoints"
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      POST
                    </Badge>
                    <span className="font-semibold text-foreground">/api/v1/biller/inquiry</span>
                  </div>
                  <Badge variant="secondary">200 OK</Badge>
                </div>
                <div className="mt-2 rounded bg-muted/60 p-3 text-muted-foreground">
                  <pre className="overflow-x-auto">
{`{
  "biller_code": "PLN_POSTPAID",
  "customer_id": "530001234567",
  "status": "SUCCESS",
  "amount": 250000,
  "admin_fee": 2500
}`}
                  </pre>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Matched via JSON-driven mock rules seam
                </span>
                <Button className="gap-1.5" onClick={handleSimulate} size="sm">
                  <Play className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} />
                  {simulating ? "Simulating..." : "Test Endpoint"}
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "sockets" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="sockets"
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-slate-950 p-4 font-mono text-xs text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300">SocketBridgeEngine [TCP: 8080]</span>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    CONNECTED
                  </Badge>
                </div>
                <div className="flex flex-col gap-1.5 py-2 text-slate-400">
                  <div>[15:37:01] <span className="text-emerald-400">INFO</span> Protocol handshake initiated via ISO-8583 bridge</div>
                  <div>[15:37:02] <span className="text-emerald-400">INFO</span> ACK frame received (len=128 bytes)</div>
                  <div>[15:37:03] <span className="text-cyan-400">EVENT</span> Realtime ticket broadcast sent to subscribers</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Capped 600-entry ring-buffer log observer
                </span>
                <Badge variant="outline">TCP / UDP / WS</Badge>
              </div>
            </motion.div>
          )}

          {activeTab === "devtools" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="devtools"
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-background/50 p-3 font-mono text-xs">
                  <span className="text-muted-foreground font-sans text-[11px] font-semibold">JSON Input</span>
                  <pre className="overflow-x-auto text-foreground">
{`{
  "service": "biller",
  "active": true
}`}
                  </pre>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-background/50 p-3 font-mono text-xs">
                  <span className="text-muted-foreground font-sans text-[11px] font-semibold">YAML Output</span>
                  <pre className="overflow-x-auto text-emerald-600 dark:text-emerald-400">
{`service: biller
active: true`}
                  </pre>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Standardized ToolProcessor&lt;TInput, TOutput&gt; seam
                </span>
                <Badge variant="outline">Instant Conversion</Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
