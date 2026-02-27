"use client";

import { useState } from "react";
import { useDashboardData } from "@/test-hooks/useDashboardData";
import { useActiveTasks } from "@/test-hooks/useActiveTasks";

export default function MulticastDashboard() {
  const { groups, images, hosts, groupAssociations, loading, error } =
    useDashboardData();

  const { activeTasks, refetch: refetchActiveTasks } = useActiveTasks();

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
      refetchActiveTasks();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const associatedHostIDs = groupAssociations
    .filter((assoc) => assoc.groupID === Number(selectedGroupId))
    .map((assoc) => assoc.hostID);

  const activeTasksForSelectedGroup = activeTasks.filter((task) =>
    associatedHostIDs.includes(task.hostID),
  );

  const enrichedTasks = activeTasksForSelectedGroup.map((task) => {
    const host = hosts.find((h) => h.id === task.hostID);
    const image = images.find((img) => img.id === task.imageID);
    return {
      ...task,
      hostName: host?.name ?? `Host #${task.hostID}`,
      imageName: image?.name ?? `Image #${task.imageID}`,
    };
  });

  if (loading) return <div>Loading FOG Data...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="multicast-container">
      <style>{`
        .multicast-container {
          max-width: 480px;
          margin: 20px auto;
          padding: 24px;
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
        .active-tasks {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }
        .active-tasks h3 {
          margin: 0 0 12px 0;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #555;
        }
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 6px;
          background: #f5f5f5;
          font-size: 0.875rem;
        }
        .task-host {
          font-weight: 600;
          color: #222;
        }
        .task-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          color: #555;
          font-size: 0.8rem;
        }
        .task-status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          background: #dbeafe;
          color: #1d4ed8;
        }
        .task-status.active {
          background: #dcfce7;
          color: #15803d;
        }
        .no-tasks {
          font-size: 0.875rem;
          color: #888;
          text-align: center;
          padding: 12px 0;
        }
      `}</style>

      <h2>Group Multicast</h2>

      <div className="form-group">
        <label>Select Group</label>
        <select
          value={selectedGroupId}
          onChange={(e) => {
            setSelectedGroupId(e.target.value);
            refetchActiveTasks();
          }}
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

      {selectedGroupId && (
        <div className="active-tasks">
          <h3>Active Tasks for Group</h3>
          {enrichedTasks.length === 0 ? (
            <p className="no-tasks">No active tasks for this group.</p>
          ) : (
            <div className="task-list">
              {enrichedTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <span className="task-host">{task.hostName}</span>
                  <div className="task-details">
                    <span className="task-status active">{task.imageName}</span>
                    {task.pct !== undefined && <span>{task.pct}%</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
