import {
  ActivityIcon,
  ComputerTerminal01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Braces, Cpu, Network, Play } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card variant="glass">
      <CardHeader variant="preview">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle size="xl" variant="inline">
              <Cpu className="h-5 w-5 text-primary" />
              {activeMessages.about.interactiveDemoTitle}
            </CardTitle>
            <CardDescription size="xs">
              {activeMessages.about.interactiveDemoDescription}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/80 p-1">
            <Button
              onClick={() => setActiveTab("endpoints")}
              size="sm"
              variant={activeTab === "endpoints" ? "default" : "ghost"}
            >
              <Network className="h-3.5 w-3.5" />
              {activeMessages.about.demo.apiEndpoints}
            </Button>
            <Button
              onClick={() => setActiveTab("sockets")}
              size="sm"
              variant={activeTab === "sockets" ? "default" : "ghost"}
            >
              <HugeiconsIcon
                className="h-3.5 w-3.5"
                icon={ActivityIcon}
                strokeWidth={2}
              />
              {activeMessages.about.demo.socketBridge}
            </Button>
            <Button
              onClick={() => setActiveTab("devtools")}
              size="sm"
              variant={activeTab === "devtools" ? "default" : "ghost"}
            >
              <Braces className="h-3.5 w-3.5" />
              {activeMessages.about.demo.devTools}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent size="padded">
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
                    <Badge variant="success">POST</Badge>
                    <span className="font-semibold text-foreground">
                      /api/v1/biller/inquiry
                    </span>
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
                <span className="text-muted-foreground text-xs">
                  {activeMessages.about.demo.matchedRules}
                </span>
                <Button onClick={handleSimulate} size="sm">
                  <Play
                    className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`}
                  />
                  {simulating
                    ? activeMessages.about.demo.simulating
                    : activeMessages.about.demo.testEndpoint}
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
              <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border bg-sidebar p-4 font-mono text-sidebar-foreground text-xs">
                <div className="flex items-center justify-between border-sidebar-border border-b pb-2">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      className="h-4 w-4 text-primary"
                      icon={ComputerTerminal01Icon}
                      strokeWidth={2}
                    />
                    <span className="text-sidebar-foreground">
                      SocketBridgeEngine [TCP: 8080]
                    </span>
                  </div>
                  <Badge variant="primary-subtle">
                    {activeMessages.about.demo.connected}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1.5 py-2 text-muted-foreground">
                  <div>
                    [15:37:01] <span className="text-primary">INFO</span>{" "}
                    {activeMessages.about.demo.handshake}
                  </div>
                  <div>
                    [15:37:02] <span className="text-primary">INFO</span>{" "}
                    {activeMessages.about.demo.ack}
                  </div>
                  <div>
                    [15:37:03] <span className="text-primary">EVENT</span>{" "}
                    {activeMessages.about.demo.event}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {activeMessages.about.demo.ringBuffer}
                </span>
                <Badge variant="outline">
                  {activeMessages.about.demo.protocols}
                </Badge>
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
                  <span className="font-sans font-semibold text-muted-foreground text-xs">
                    {activeMessages.about.demo.jsonInput}
                  </span>
                  <pre className="overflow-x-auto text-foreground">
                    {`{
  "service": "biller",
  "active": true
}`}
                  </pre>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-background/50 p-3 font-mono text-xs">
                  <span className="font-sans font-semibold text-muted-foreground text-xs">
                    {activeMessages.about.demo.yamlOutput}
                  </span>
                  <pre className="overflow-x-auto text-primary">
                    {`service: biller
active: true`}
                  </pre>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {activeMessages.about.demo.processorSeam}
                </span>
                <Badge variant="outline">
                  {activeMessages.about.demo.instantConversion}
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
