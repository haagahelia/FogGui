"use client";

import { useState } from "react";
import { useDashboardData } from "@/test-hooks/useDashboardData";
import { useActiveTasks } from "@/test-hooks/useActiveTasks";
import { useMulticastSessions } from "@/test-hooks/useMulticastSessions";
import { useScheduledMulticast } from "@/test-hooks/useScheduledMulticast";

export default function MulticastDashboard() {
  const { groups, images, hosts, groupAssociations, loading, error } =
    useDashboardData();
  const { activeTasks, refetch: refetchActiveTasks } = useActiveTasks();
  const { multicastSessions, refetch: refetchSessions } =
    useMulticastSessions();
  const { scheduledMulticast, refetch: refetchScheduledMulticast } =
    useScheduledMulticast();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedImageId, setSelectedImageId] = useState("");
  const [selectedDisk, setSelectedDisk] = useState("");
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedScheduledTaskId, setSelectedScheduledTaskId] = useState<
    number | null
  >(null);
  const [isCancellingScheduled, setIsCancellingScheduled] = useState(false);

  const diskOptions = [
    process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_1,
    process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_2,
  ].filter(Boolean);

  const formatScheduledTime = (value: string) => {
    if (!value) return undefined;
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-");
    const time = timePart.length === 5 ? timePart + ":00" : timePart;
    return `${year}-${month}-${day} ${time}`;
  };

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
          ...(scheduledStartTime && {
            scheduledStartTime: formatScheduledTime(scheduledStartTime),
          }),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Server Error");

      alert(
        scheduledStartTime
          ? `Multicast scheduled for ${formatScheduledTime(scheduledStartTime)}!`
          : "Multicast started successfully!",
      );

      refetchActiveTasks();
      refetchSessions();
      refetchScheduledMulticast();
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

  const scheduledTasksForGroup = scheduledMulticast
    .filter((s) => String(s.hostID) === selectedGroupId)
    .map((s) => {
      const group = groups.find((g) => g.id === Number(selectedGroupId));
      const image = images.find((img) => img.id === s.imageID);
      return {
        ...s,
        groupName: group?.name ?? `Group #${s.hostID}`,
        imageName: image?.name ?? `Image #${s.imageID}`,
      };
    });

  const handleCancelScheduled = async () => {
    if (!selectedScheduledTaskId) {
      alert("Please select a scheduled task to cancel.");
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this scheduled task?"))
      return;

    setIsCancellingScheduled(true);
    try {
      const response = await fetch("/api/actions/multicast/scheduled", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledTaskID: selectedScheduledTaskId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Server Error");
      alert("Scheduled task cancelled successfully!");
      setSelectedScheduledTaskId(null);
      refetchScheduledMulticast();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCancellingScheduled(false);
    }
  };

  const handleCancelActiveSession = async () => {
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
          color: #94a3b8;
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
          -webkit-appearance: none;
        }

        .form-select:focus { border-color: #4a90d9; }
        .form-select option { background: #161b27; }

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.6;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

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

        /* ── RIGHT PANEL ── */
        .panel-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 32px 28px;
          gap: 28px;
          overflow-y: auto;
        }

        /* ── SECTION ── */
        .section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1e2535;
          padding-bottom: 12px;
        }

        .section-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title {
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

        .session-badge.scheduled {
          background: #0d1f33;
          color: #4a90d9;
          border: 1px solid #1e3a5a;
        }

        .section-cancel-btn {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 4px;
          border: 1px solid #ef4444;
          background: transparent;
          color: #ef4444;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .section-cancel-btn:hover:not(:disabled) { background: #ef4444; color: #fff; }
        .section-cancel-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* ── HOST LIST ── */
        .host-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .host-item {
          display: grid;
          grid-template-columns: 1.4fr 1.6fr auto;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 8px;
          transition: border-color 0.15s;
        }

        .host-item:hover { border-color: #2a3550; }

        .host-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .host-image {
          font-size: 0.875rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .host-percent {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a90d9;
          white-space: nowrap;
          justify-self: end;
        }

        .state-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e88;
          animation: pulse 2s infinite;
          flex-shrink: 0;
          justify-self: end;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── SCHEDULED ITEMS ── */
        .scheduled-item {
          display: grid;
          grid-template-columns: 1.4fr 1.2fr 1.6fr auto;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 8px;
          transition: border-color 0.15s;
        }

        .scheduled-item:hover { border-color: #2a3550; }

        .scheduled-item.selected {
          border-color: #ef4444;
          background: #1a1520;
        }

        .scheduled-item.selected:hover { border-color: #f87171; }

        .scheduled-group-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scheduled-starttime {
          font-size: 0.875rem;
          font-weight: 400;
          color: #cbd5e1;
          white-space: nowrap;
        }

        .scheduled-image-name {
          font-size: 0.875rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scheduled-badge {
          font-size: 0.6rem;
          padding: 3px 10px;
          border-radius: 99px;
          background: #0d1f33;
          color: #4a90d9;
          border: 1px solid #1e3a5a;
          white-space: nowrap;
          letter-spacing: 0.05em;
          justify-self: end;
        }

        /* ── EMPTY STATE ── */
        .no-tasks {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #2a3550;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 32px 0;
        }

        .no-tasks-icon {
          font-size: 1.5rem;
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
              refetchScheduledMulticast();
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

        <div className="form-group">
          <label className="form-label">
            Scheduled Start Time{" "}
            <span style={{ color: "#4a5568", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <input
            type="datetime-local"
            className="form-select"
            value={scheduledStartTime}
            onChange={(e) => setScheduledStartTime(e.target.value)}
          />
        </div>

        <div className="btn-actions">
          <button
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={handleMulticast}
          >
            {isSubmitting
              ? scheduledStartTime
                ? "Scheduling..."
                : "Starting..."
              : scheduledStartTime
                ? "Schedule Multicast"
                : "Start Multicast"}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="panel-right">
        {/* SCHEDULED TASKS */}
        <div className="section">
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-title">Scheduled Tasks</div>
              <span
                className={`session-badge ${scheduledTasksForGroup.length > 0 ? "scheduled" : ""}`}
              >
                {scheduledTasksForGroup.length > 0
                  ? `${scheduledTasksForGroup.length} scheduled`
                  : "none"}
              </span>
            </div>
            {scheduledTasksForGroup.length > 0 && (
              <button
                className="section-cancel-btn"
                disabled={isCancellingScheduled || !selectedScheduledTaskId}
                onClick={handleCancelScheduled}
              >
                {isCancellingScheduled ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>

          {!selectedGroupId || scheduledTasksForGroup.length === 0 ? (
            <div className="no-tasks">
              <span className="no-tasks-icon">⬡</span>
              {!selectedGroupId
                ? "Select a group to begin"
                : "No scheduled tasks"}
            </div>
          ) : (
            <div className="host-list">
              {scheduledTasksForGroup.map((task) => (
                <div
                  key={task.id}
                  className={`scheduled-item ${selectedScheduledTaskId === task.id ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedScheduledTaskId(
                      selectedScheduledTaskId === task.id ? null : task.id,
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <span className="scheduled-group-name">{task.groupName}</span>
                  <span className="scheduled-starttime">{task.starttime}</span>
                  <span className="scheduled-image-name">{task.imageName}</span>
                  <span className="scheduled-badge">{task.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE HOSTS */}
        <div className="section">
          <div className="section-header">
            <div className="section-header-left">
              <div className="section-title">Active Hosts</div>
              <span
                className={`session-badge ${enrichedTasks.length > 0 ? "active" : ""}`}
              >
                {enrichedTasks.length > 0
                  ? `${enrichedTasks.length} host${enrichedTasks.length > 1 ? "s" : ""} running`
                  : "no active session"}
              </span>
            </div>
            {enrichedTasks.length > 0 && (
              <button
                className="section-cancel-btn"
                disabled={isCancelling || !activeSessionId}
                onClick={handleCancelActiveSession}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
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
    </div>
  );
}
