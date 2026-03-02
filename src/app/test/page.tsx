"use client";

import { useState } from "react";
import { useDashboardData } from "@/test-hooks/useDashboardData";
import { useActiveTasks } from "@/test-hooks/useActiveTasks";
import { useMulticastSessions } from "@/test-hooks/useMulticastSessions";

export default function MulticastDashboard() {
  const { groups, images, hosts, groupAssociations, loading, error } =
    useDashboardData();
  const { activeTasks, refetch: refetchActiveTasks } = useActiveTasks();
  const { multicastSessions, refetch: refetchSessions } =
    useMulticastSessions();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedDisk, setSelectedDisk] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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
      refetchSessions();
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

  const activeSessionId =
    multicastSessions.find((s) => enrichedTasks.some((t) => t.name === s.name))
      ?.id ?? null;

  const handleCancelAll = async () => {
    if (!activeSessionId) {
      alert("No active session found for this group.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to cancel active tasks for this group?",
      )
    )
      return;

    setIsCancelling(true);
    try {
      const response = await fetch("/api/actions/multicast", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID: activeSessionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Server Error");
      alert("Tasks cancelled successfully!");
      refetchActiveTasks();
      refetchSessions();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading FOG Data...</div>;
  if (error)
    return <div style={{ padding: 32, color: "#ef4444" }}>{error}</div>;

  return (
    <div className="dashboard">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #0f1117;
          color: #e2e8f0;
        }

        /* ── LEFT PANEL ── */
        .panel-left {
          width: 340px;
          min-width: 340px;
          background: #161b27;
          border-right: 1px solid #1e2535;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          gap: 24px;
        }

        .panel-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4a90d9;
          border-bottom: 1px solid #1e2535;
          padding-bottom: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #64748b;
        }

        .form-select {
          width: 100%;
          padding: 10px 12px;
          background: #0f1117;
          border: 1px solid #1e2535;
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
          cursor: pointer;
          appearance: none;
        }

        .form-select:focus { border-color: #4a90d9; }
        .form-select option { background: #161b27; }

        .btn-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }

        .btn:active { transform: scale(0.98); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .btn-primary { background: #4a90d9; color: #fff; }
        .btn-primary:hover:not(:disabled) { background: #3a7bc8; }

        .btn-danger {
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
        }
        .btn-danger:hover:not(:disabled) { background: #ef4444; color: #fff; }

        /* ── RIGHT PANEL ── */
        .panel-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 32px 28px;
          gap: 16px;
          overflow-y: auto;
        }

        .panel-right-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1e2535;
          padding-bottom: 12px;
        }

        .panel-right-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #4a90d9;
        }

        .session-badge {
          font-size: 0.65rem;
          padding: 3px 10px;
          border-radius: 99px;
          background: #1e2535;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .session-badge.active {
          background: #0d2a1a;
          color: #22c55e;
          border: 1px solid #166534;
        }

        .host-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .host-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 8px;
          transition: border-color 0.15s;
        }

        .host-item:hover { border-color: #2a3550; }

        .host-name {
          font-size: 0.825rem;
          font-weight: 500;
          color: #e2e8f0;
        }

        .host-image {
          font-size: 0.75rem;
          color: #64748b;
        }

        .host-percent {
          font-size: 0.75rem;
          color: #4a90d9;
          min-width: 40px;
          text-align: right;
        }

        .state-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e88;
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .no-tasks {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 8px;
          color: #2a3550;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 60px 0;
        }

        .no-tasks-icon {
          font-size: 2rem;
          opacity: 0.3;
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="panel-left">
        <div className="panel-title">Group Multicast</div>

        <div className="form-group">
          <label className="form-label">Group</label>
          <select
            className="form-select"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              refetchActiveTasks();
              refetchSessions();
            }}
          >
            <option value="">— Select Group —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Image</label>
          <select
            className="form-select"
            value={selectedImageId}
            onChange={(e) => setSelectedImageId(e.target.value)}
          >
            <option value="">— Select Image —</option>
            {images.map((img) => (
              <option key={img.id} value={img.id}>
                {img.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Primary Disk</label>
          <select
            className="form-select"
            value={selectedDisk}
            onChange={(e) => setSelectedDisk(e.target.value)}
          >
            <option value="">— Select Disk —</option>
            {diskOptions.map((disk) => (
              <option key={disk} value={disk}>
                {disk}
              </option>
            ))}
          </select>
        </div>

        <div className="btn-actions">
          <button
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={handleMulticast}
          >
            {isSubmitting ? "Starting..." : "Start Multicast"}
          </button>

          {enrichedTasks.length > 0 && (
            <button
              className="btn btn-danger"
              disabled={isCancelling || !activeSessionId}
              onClick={handleCancelAll}
            >
              {isCancelling ? "Cancelling..." : "Cancel Session"}
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="panel-right">
        <div className="panel-right-header">
          <div className="panel-right-title">Active Hosts</div>
          <span
            className={`session-badge ${enrichedTasks.length > 0 ? "active" : ""}`}
          >
            {enrichedTasks.length > 0
              ? `${enrichedTasks.length} host${enrichedTasks.length > 1 ? "s" : ""} running`
              : "no active session"}
          </span>
        </div>

        {!selectedGroupId || enrichedTasks.length === 0 ? (
          <div className="no-tasks">
            <span className="no-tasks-icon">⬡</span>
            {!selectedGroupId
              ? "Select a group to begin"
              : "No active tasks for this group"}
          </div>
        ) : (
          <div className="host-list">
            {enrichedTasks.map((task) => (
              <div key={task.id} className="host-item">
                <span className="host-name">{task.hostName}</span>
                <span className="host-image">{task.imageName}</span>
                {task.pct !== undefined && task.pct !== "" ? (
                  <span className="host-percent">
                    {Number(task.pct.slice(-2))}%
                  </span>
                ) : (
                  <div className="state-dot" title="Running" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
