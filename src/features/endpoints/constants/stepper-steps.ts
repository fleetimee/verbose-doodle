import { Code2, Eye, FileText, Hash } from "@/components/hugeicons";

export const STEPS = [
  {
    id: "name",
    title: "Response Name",
    description: "What should we call this response?",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
  {
    id: "statusCode",
    title: "Status Code",
    description: "Which HTTP status code?",
    icon: Hash,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
  {
    id: "json",
    title: "JSON Response",
    description: "What data should it return?",
    icon: Code2,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
  {
    id: "review",
    title: "Review",
    description: "Everything looks good?",
    icon: Eye,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
] as const;

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
    name: "Simple Success",
    value: `{
  "success": true,
  "message": "Operation completed successfully"
}`,
  },
  {
    name: "Resource Payload",
    value: `{
  "id": "res_9f2x8",
  "status": "active",
  "created_at": "2026-06-25T08:00:00Z",
  "metadata": {}
}`,
  },
  {
    name: "Validation Error",
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
    name: "Paginated List",
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
    name: "Billing Inquiry",
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
    name: "Payment Receipt",
    value: `{
  "transaction_id": "TX_883019283",
  "reference_number": "REF9928311",
  "status": "SUCCESS",
  "paid_at": "2026-06-25T09:00:00Z",
  "amount_paid": 153000
}`,
  },
  {
    name: "Unauthorized (401)",
    value: `{
  "error": "unauthorized",
  "message": "Authentication required. Please provide a valid Bearer token."
}`,
  },
  {
    name: "Rate Limited (429)",
    value: `{
  "error": "too_many_requests",
  "message": "Rate limit exceeded. Please try again in 60 seconds."
}`,
  },
] as const;
