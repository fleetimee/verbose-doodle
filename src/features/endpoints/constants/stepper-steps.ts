import { Code2, Eye, FileText, Hash, Sparkles } from "lucide-react";

export const STEPS = [
  {
    id: "name",
    title: "Response Name",
    description: "What should we call this response?",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "statusCode",
    title: "Status Code",
    description: "Which HTTP status code?",
    icon: Hash,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: "json",
    title: "JSON Response",
    description: "What data should it return?",
    icon: Code2,
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    id: "review",
    title: "Review",
    description: "Everything looks good?",
    icon: Eye,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: "activated",
    title: "Activate Response",
    description: "Set as active response?",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
] as const;

// Animation constants
export const PERCENT_MULTIPLIER = 100;
export const ACTIVE_INDICATOR_SCALE = 1.2;
export const INACTIVE_INDICATOR_SCALE = 1;
export const ACTIVE_INDICATOR_OPACITY = 1;
export const INACTIVE_INDICATOR_OPACITY = 0.6;
export const ANIMATION_DURATION = 0.2;
export const STEP_TRANSITION_DURATION = 0.3;
export const AUTO_ADVANCE_DELAY = 100;
