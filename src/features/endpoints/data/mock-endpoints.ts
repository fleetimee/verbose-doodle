import type { Endpoint } from "@/features/endpoints/types";

export const mockEndpoints: Endpoint[] = [
  {
    billerSlug: "pln",
    id: "endpoint-1",
    method: "POST",
    responses: [
      {
        activated: true,
        id: "resp-1",
        json: '{"status": "success", "transaction_id": "TXN123"}',
        name: "Success Response",
        statusCode: 200,
      },
      {
        activated: false,
        id: "resp-2",
        json: '{"status": "error", "message": "Insufficient funds"}',
        name: "Insufficient Funds",
        statusCode: 400,
      },
      {
        activated: false,
        id: "resp-3",
        json: '{"status": "error", "message": "Internal server error"}',
        name: "Server Error",
        statusCode: 500,
      },
    ],
    slug: "pln-post-payment-process-a1b2c3",
    url: "/api/payment/process",
  },
  {
    billerSlug: "pln",
    id: "endpoint-2",
    method: "GET",
    responses: [
      {
        activated: true,
        id: "resp-4",
        json: '{"status": "completed", "amount": 1000}',
        name: "Payment Found",
        statusCode: 200,
      },
      {
        activated: false,
        id: "resp-5",
        json: '{"status": "error", "message": "Payment not found"}',
        name: "Payment Not Found",
        statusCode: 404,
      },
    ],
    slug: "pln-get-payment-status-d4e5f6",
    url: "/api/payment/status/{id}",
  },
  {
    billerSlug: "pln",
    id: "endpoint-3",
    method: "DELETE",
    responses: [
      {
        activated: true,
        id: "resp-6",
        json: '{"status": "cancelled"}',
        name: "Cancelled Successfully",
        statusCode: 200,
      },
    ],
    slug: "pln-delete-payment-cancel-a1b2c3",
    url: "/api/payment/cancel/{id}",
  },
  {
    billerSlug: "pdam",
    id: "endpoint-4",
    method: "POST",
    responses: [
      {
        activated: true,
        id: "resp-7",
        json: '{"user_id": "USR123", "username": "john_doe"}',
        name: "User Created",
        statusCode: 201,
      },
      {
        activated: false,
        id: "resp-8",
        json: '{"error": "Username already taken"}',
        name: "User Already Exists",
        statusCode: 409,
      },
    ],
    slug: "pdam-post-users-register-d4e5f6",
    url: "/api/users/register",
  },
  {
    billerSlug: "pdam",
    id: "endpoint-5",
    method: "GET",
    responses: [
      {
        activated: true,
        id: "resp-9",
        json: '{"user_id": "USR123", "username": "john_doe", "email": "john@example.com"}',
        name: "User Details",
        statusCode: 200,
      },
    ],
    slug: "pdam-get-users-a1b2c3",
    url: "/api/users/{id}",
  },
  {
    billerSlug: "pdam",
    id: "endpoint-6",
    method: "PATCH",
    responses: [
      {
        activated: true,
        id: "resp-10",
        json: '{"status": "updated"}',
        name: "Update Success",
        statusCode: 200,
      },
      {
        activated: false,
        id: "resp-11",
        json: '{"error": "Invalid email format"}',
        name: "Validation Error",
        statusCode: 422,
      },
    ],
    slug: "pdam-patch-users-d4e5f6",
    url: "/api/users/{id}",
  },
  {
    billerSlug: "pdam",
    id: "endpoint-7",
    method: "PUT",
    responses: [],
    slug: "pdam-put-users-profile-a1b2c3",
    url: "/api/users/{id}/profile",
  },
];
