import { apiFetch } from "@/lib/api-request";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  availableQuantity: number;
  condition: string;
  brand?: string;
  model?: string;
  image: string;
  rentalTerms?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface EquipmentResponse {
  success: boolean;
  count?: number;
  data: Equipment[];
  message?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result as T;
}

export async function getMyEquipment(): Promise<Equipment[]> {
  const response = await apiFetch(`${API_URL}/api/my-equipment`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = await handleResponse<EquipmentResponse>(response);
  return result.data;
}

export async function updateEquipment(
  id: string,
  data: Partial<Omit<Equipment, "_id" | "ownerId" | "ownerEmail" | "ownerName" | "status" | "createdAt" | "updatedAt">>
): Promise<ApiResponse> {
  const response = await apiFetch(`${API_URL}/api/equipment/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<ApiResponse>(response);
}

export async function deleteEquipment(id: string): Promise<ApiResponse> {
  const response = await apiFetch(`${API_URL}/api/equipment/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse<ApiResponse>(response);
}
