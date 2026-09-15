import { Code2, Eye, FileText, Hash } from "@/components/hugeicons";
import { messages } from "@/lib/i18n";

export const STEPS = [
  {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    get description() {
      return messages.endpoints.responseNameDescription;
    },
    icon: FileText,
    id: "name",
    get title() {
      return messages.endpoints.responseNameLabel;
    },
  },
  {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    get description() {
      return messages.endpoints.statusCodeDescription;
    },
    icon: Hash,
    id: "statusCode",
    get title() {
      return messages.endpoints.statusCodeLabel;
    },
  },
  {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    get description() {
      return messages.endpoints.jsonResponseDescription;
    },
    icon: Code2,
    id: "json",
    get title() {
      return messages.endpoints.jsonResponseLabel;
    },
  },
  {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    get description() {
      return messages.endpoints.stepperReviewReadyDescription;
    },
    icon: Eye,
    id: "review",
    get title() {
      return messages.endpoints.stepperReviewReadyTitle;
    },
  },
];

// Animation constants
export const PERCENT_MULTIPLIER = 100;
export const ACTIVE_INDICATOR_SCALE = 1.2;
export const INACTIVE_INDICATOR_SCALE = 1;
export const ACTIVE_INDICATOR_OPACITY = 1;
export const INACTIVE_INDICATOR_OPACITY = 0.6;
export const ANIMATION_DURATION = 0.2;
export const AUTO_ADVANCE_DELAY = 100;

export const JSON_PRESETS = [
  {
    get name() {
      return messages.endpoints.jsonPresets.simpleSuccess;
    },
    value: `{
  "success": true,
  "message": "Operation completed successfully"
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.resourcePayload;
    },
    value: `{
  "id": "res_9f2x8",
  "status": "active",
  "created_at": "2026-06-25T08:00:00Z",
  "metadata": {}
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.validationError;
    },
    value: `{
  "error": "validation_failed",
  "message": "Invalid request parameters",
  "details": [
    {
      "field": "email",
      "issue": "must be a valid email address"
    }
  ]
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.paginatedList;
    },
    value: `{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0
  }
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.billingInquiry;
    },
    value: `{
  "biller_code": "MANDIRI_PLN",
  "customer_id": "532110023912",
  "customer_name": "JOHN DOE",
  "amount": 150000,
  "admin_fee": 3000,
  "total_amount": 153000,
  "status": "UNPAID"
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.paymentReceipt;
    },
    value: `{
  "transaction_id": "TX_883019283",
  "reference_number": "REF9928311",
  "status": "SUCCESS",
  "paid_at": "2026-06-25T09:00:00Z",
  "amount_paid": 153000
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.unauthorized;
    },
    value: `{
  "error": "unauthorized",
  "message": "Authentication required. Please provide a valid Bearer token."
}`,
  },
  {
    get name() {
      return messages.endpoints.jsonPresets.rateLimited;
    },
    value: `{
  "error": "too_many_requests",
  "message": "Rate limit exceeded. Please try again in 60 seconds."
}`,
  },
] as const;
