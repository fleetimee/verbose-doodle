import type { Endpoint } from "@/features/endpoints/types";

export const mockEndpoints: Endpoint[] = [
  {
    id: "endpoint-1",
    method: "POST",
    url: "/api/payment/process",
    billerId: 1,
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
    method: "GET",
    url: "/api/payment/status/{id}",
    billerId: 1,
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
    method: "DELETE",
    url: "/api/payment/cancel/{id}",
    billerId: 1,
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
    method: "POST",
    url: "/api/users/register",
    billerId: 2,
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
    method: "GET",
    url: "/api/users/{id}",
    billerId: 2,
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
    method: "PATCH",
    url: "/api/users/{id}",
    billerId: 2,
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
    method: "PUT",
    url: "/api/users/{id}/profile",
    billerId: 2,
    responses: [],
  },
];
