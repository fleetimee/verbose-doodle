import type { Endpoint } from "@/features/endpoints/types";

export const mockEndpoints: Endpoint[] = [
  {
    id: "endpoint-1",
    slug: "pln-post-payment-process-a1b2c3",
    method: "POST",
    url: "/api/payment/process",
    billerSlug: "pln",
    responses: [
      {
        id: "resp-1",
        name: "Success Response",
        json: '{"status": "success", "transaction_id": "TXN123"}',
        statusCode: 200,
        activated: true,
      },
      {
        id: "resp-2",
        name: "Insufficient Funds",
        json: '{"status": "error", "message": "Insufficient funds"}',
        statusCode: 400,
        activated: false,
      },
      {
        id: "resp-3",
        name: "Server Error",
        json: '{"status": "error", "message": "Internal server error"}',
        statusCode: 500,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-2",
    slug: "pln-get-payment-status-d4e5f6",
    method: "GET",
    url: "/api/payment/status/{id}",
    billerSlug: "pln",
    responses: [
      {
        id: "resp-4",
        name: "Payment Found",
        json: '{"status": "completed", "amount": 1000}',
        statusCode: 200,
        activated: true,
      },
      {
        id: "resp-5",
        name: "Payment Not Found",
        json: '{"status": "error", "message": "Payment not found"}',
        statusCode: 404,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-3",
    slug: "pln-delete-payment-cancel-a1b2c3",
    method: "DELETE",
    url: "/api/payment/cancel/{id}",
    billerSlug: "pln",
    responses: [
      {
        id: "resp-6",
        name: "Cancelled Successfully",
        json: '{"status": "cancelled"}',
        statusCode: 200,
        activated: true,
      },
    ],
  },
  {
    id: "endpoint-4",
    slug: "pdam-post-users-register-d4e5f6",
    method: "POST",
    url: "/api/users/register",
    billerSlug: "pdam",
    responses: [
      {
        id: "resp-7",
        name: "User Created",
        json: '{"user_id": "USR123", "username": "john_doe"}',
        statusCode: 201,
        activated: true,
      },
      {
        id: "resp-8",
        name: "User Already Exists",
        json: '{"error": "Username already taken"}',
        statusCode: 409,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-5",
    slug: "pdam-get-users-a1b2c3",
    method: "GET",
    url: "/api/users/{id}",
    billerSlug: "pdam",
    responses: [
      {
        id: "resp-9",
        name: "User Details",
        json: '{"user_id": "USR123", "username": "john_doe", "email": "john@example.com"}',
        statusCode: 200,
        activated: true,
      },
    ],
  },
  {
    id: "endpoint-6",
    slug: "pdam-patch-users-d4e5f6",
    method: "PATCH",
    url: "/api/users/{id}",
    billerSlug: "pdam",
    responses: [
      {
        id: "resp-10",
        name: "Update Success",
        json: '{"status": "updated"}',
        statusCode: 200,
        activated: true,
      },
      {
        id: "resp-11",
        name: "Validation Error",
        json: '{"error": "Invalid email format"}',
        statusCode: 422,
        activated: false,
      },
    ],
  },
  {
    id: "endpoint-7",
    slug: "pdam-put-users-profile-a1b2c3",
    method: "PUT",
    url: "/api/users/{id}/profile",
    billerSlug: "pdam",
    responses: [],
  },
];
