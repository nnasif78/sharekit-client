
"use client";

import { apiFetch } from "@/lib/api-request";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AddEquipmentPage() {
  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    price: "",
    rentalType: "daily",
    availableQuantity: "1",
    condition: "Good",
    brand: "",
    model: "",
    image: "",
    rentalTerms: "",
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError("");
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      setImageError("Image upload is not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to the client environment.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("Choose an image file.");
      return;
    }
    try {
      setUploadingImage(true);
      const body = new FormData();
      body.append("image", file);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.error?.message || "Image upload failed.");
      }
      setFormData((previous) => ({ ...previous, image: result.data.url }));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!session?.user) {
      setError("Please login before adding equipment.");
      return;
    }

    const price = Number(formData.price);
    const availableQuantity = Number(formData.availableQuantity);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid rental price.");
      return;
    }

    if (!Number.isInteger(availableQuantity) || availableQuantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/equipment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            price,
            availableQuantity,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add equipment.");
      }

      setSuccess("Equipment submitted successfully! Waiting for admin approval.");

      setFormData({
        name: "",
        description: "",
        category: "",
        location: "",
        price: "",
        rentalType: "daily",
        availableQuantity: "1",
        condition: "Good",
        brand: "",
        model: "",
        image: "",
        rentalTerms: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return <p className="p-10">Loading...</p>;
  }

  if (!session) {
    return (
      <div className="p-10 text-center">
        Please login to continue.
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold">
        Add Equipment
      </h1>

      <p className="mb-8 text-gray-500">
        Submit your equipment for customers to rent.
      </p>

      <div className="mb-6 rounded-xl border bg-gray-50 p-4 text-sm">
        <p><strong>Owner:</strong> {session.user.name} · {session.user.email}</p>
        <p className="mt-1 text-gray-600"><strong>Listing status:</strong> Pending admin approval</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="mb-2 block font-medium">
            Equipment Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Canon DSLR Camera"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your equipment..."
            className={inputClass}
            rows={4}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select category</option>
              <option value="Construction Equipment">Construction Equipment</option>
              <option value="Photography Equipment">Photography Equipment</option>
              <option value="Vehicles & Transportation">Vehicles & Transportation</option>
              <option value="Agriculture Equipment">Agriculture Equipment</option>
              <option value="Electronics">Electronics</option>
              <option value="Event Equipment">Event Equipment</option>
              <option value="Tools">Tools</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Location
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Equipment location"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Rental Price (৳)
            </label>
            <input
              type="number"
              name="price"
              min="1"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Rental Type
            </label>
            <select
              name="rentalType"
              value={formData.rentalType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Available Quantity
            </label>
            <input
              type="number"
              name="availableQuantity"
              min="1"
              value={formData.availableQuantity}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Equipment Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Used">Used</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Brand
            </label>
            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Equipment brand"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Model
            </label>
            <input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Equipment model"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Equipment Image
          </label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className={inputClass} disabled={uploadingImage} />
          {uploadingImage && <p className="mt-2 text-sm text-gray-500">Uploading image…</p>}
          {imageError && <p className="mt-2 text-sm text-red-600">{imageError}</p>}
          {formData.image && <img src={formData.image} alt="Equipment preview" className="mt-3 h-40 w-full rounded-lg object-cover" />}
          <p className="my-2 text-sm text-gray-500">Or paste an image URL</p>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Rental Terms and Conditions
          </label>
          <textarea
            name="rentalTerms"
            value={formData.rentalTerms}
            onChange={handleChange}
            placeholder="Enter rental terms..."
            className={inputClass}
            rows={3}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Equipment"}
        </button>

      </form>
    </main>
  );
}
