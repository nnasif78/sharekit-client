
"use client";

import { useCallback, useEffect, useState } from "react";

interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  rentalType: string;
  availableQuantity: number;
  condition: string;
  image: string;
  ownerName: string;
  ownerEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/equipment`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch equipment"
        );
      }

      setEquipment(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      setProcessingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/equipment/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update equipment"
        );
      }

      setMessage(
        `Equipment ${status} successfully!`
      );

      await fetchEquipment();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setProcessingId("");
    }
  };

  const pendingCount = equipment.filter(
    (item) => item.status === "pending"
  ).length;

  if (loading) {
    return (
      <main className="p-8">
        Loading equipment...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Equipment Management
          </h1>

          <p className="mt-2 text-gray-500">
            Review and manage equipment submissions.
          </p>
        </div>

        <button
          onClick={fetchEquipment}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 rounded-lg border p-5">
        <p className="text-gray-500">
          Pending Approval
        </p>

        <p className="mt-2 text-3xl font-bold">
          {pendingCount}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          No equipment submissions found.
        </div>
      ) : (
        <div className="space-y-5">
          {equipment.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border p-5"
            >
              <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-44 w-full rounded-lg object-cover"
                />

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                      {item.name}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mb-3 text-gray-600">
                    {item.description}
                  </p>

                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <strong>Category:</strong>{" "}
                      {item.category}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {item.location}
                    </p>

                    <p>
                      <strong>Price:</strong>{" "}
                      ৳{item.price} / {item.rentalType}
                    </p>

                    <p>
                      <strong>Quantity:</strong>{" "}
                      {item.availableQuantity}
                    </p>

                    <p>
                      <strong>Condition:</strong>{" "}
                      {item.condition}
                    </p>

                    <p>
                      <strong>Owner:</strong>{" "}
                      {item.ownerName}
                    </p>

                    <p>
                      <strong>Owner Email:</strong>{" "}
                      {item.ownerEmail}
                    </p>
                  </div>

                  {item.status === "pending" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          updateStatus(item._id, "approved")
                        }
                        disabled={processingId === item._id}
                        className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === item._id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(item._id, "rejected")
                        }
                        disabled={processingId === item._id}
                        className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {processingId === item._id
                          ? "Processing..."
                          : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
