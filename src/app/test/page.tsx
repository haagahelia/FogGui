"use client";

import React, { useState } from "react";
import { useDashboardData } from "@/test-hooks/useDashboardData";

export default function MulticastDashboard() {
  const { groups, images, loading, error } = useDashboardData();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedDisk, setSelectedDisk] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const diskOptions = [
    process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_1,
    process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_2,
  ].filter(Boolean);

  const handleMulticast = async () => {
    if (!selectedGroupId || !selectedImageId || !selectedDisk) {
      alert("Please select a Group, Image, and Disk.");
      return;
    }

    if (!window.confirm("Are you sure you want to start the multicast?"))
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/actions/multicast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupID: Number(selectedGroupId),
          imageID: Number(selectedImageId),
          kernelDevice: selectedDisk,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Server Error");

      alert("Multicast started successfully!");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading FOG Data...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="multicast-container">
      <style>{`
        .multicast-container {
          max-width: 400px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-family: sans-serif;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        select {
          width: 100%;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #999;
        }
        button {
          width: 100%;
          padding: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>

      <h2>Group Multicast</h2>

      <div className="form-group">
        <label>Select Group</label>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
        >
          <option value="">-- Choose Group --</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Select Image</label>
        <select
          value={selectedImageId}
          onChange={(e) => setSelectedImageId(e.target.value)}
        >
          <option value="">-- Choose Image --</option>
          {images.map((img) => (
            <option key={img.id} value={img.id}>
              {img.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Primary Disk</label>
        <select
          value={selectedDisk}
          onChange={(e) => setSelectedDisk(e.target.value)}
        >
          <option value="">-- Choose Disk --</option>
          {diskOptions.map((disk) => (
            <option key={disk} value={disk}>
              {disk}
            </option>
          ))}
        </select>
      </div>

      <button disabled={isSubmitting} onClick={handleMulticast}>
        {isSubmitting ? "Starting..." : "Start Multicast"}
      </button>
    </div>
  );
}
