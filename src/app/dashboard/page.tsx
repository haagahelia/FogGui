"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useActiveTasks } from "@/hooks/useActiveTasks";
import { useMulticastSessions } from "@/hooks/useMulticastSessions";
import { useScheduledMulticast } from "@/hooks/useScheduledMulticast";

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

  const MULTICAST_STATES: Record<
    number,
    { label: string; color: string; dot?: string }
  > = {
    0: {
      label: "Queuing",
      color: "text-slate-400  bg-[#1e2535]    border-[#2a3550]",
    },
    1: {
      label: "Booting",
      color: "text-yellow-400 bg-[#2a1f00]    border-yellow-800",
    },
    2: {
      label: "Attempting",
      color: "text-orange-400 bg-[#2a1500]    border-orange-800",
    },
    3: {
      label: "In-Progress",
      color: "text-[#4a90d9]  bg-[#0d1f33]    border-[#1e3a5a]",
    },
    4: {
      label: "Completed",
      color: "text-green-400  bg-[#0d2a1a]    border-green-800",
    },
    5: {
      label: "Cancelled",
      color: "text-red-400    bg-[#2a0d0d]    border-red-800",
    },
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

  if (loading) return <div className="p-8">Loading FOG Data...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-slate-200">
      {/* ── LEFT PANEL ── */}
      <div className="w-[340px] min-w-[340px] bg-[#161b27] border-r border-[#1e2535] flex flex-col p-8 gap-6">
        <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#4a90d9] border-b border-[#1e2535] pb-3">
          Group Multicast
        </div>

        {/* Group */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.65rem] font-medium tracking-[0.1em] uppercase text-slate-400">
            Group
          </label>
          <select
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-[#1e2535] rounded-md text-slate-200 text-sm outline-none transition-colors duration-150 cursor-pointer appearance-none focus:border-[#4a90d9] [&>option]:bg-[#161b27]"
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

        {/* Image */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.65rem] font-medium tracking-[0.1em] uppercase text-slate-400">
            Image
          </label>
          <select
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-[#1e2535] rounded-md text-slate-200 text-sm outline-none transition-colors duration-150 cursor-pointer appearance-none focus:border-[#4a90d9] [&>option]:bg-[#161b27]"
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

        {/* Primary Disk */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.65rem] font-medium tracking-[0.1em] uppercase text-slate-400">
            Primary Disk
          </label>
          <select
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-[#1e2535] rounded-md text-slate-200 text-sm outline-none transition-colors duration-150 cursor-pointer appearance-none focus:border-[#4a90d9] [&>option]:bg-[#161b27]"
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

        {/* Scheduled Start Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.65rem] font-medium tracking-[0.1em] uppercase text-slate-400">
            WIP - Scheduled Start Time{" "}
            <span className="text-slate-600 font-normal">(optional)</span>
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2.5 bg-[#0f1117] border border-[#1e2535] rounded-md text-slate-200 text-sm outline-none transition-colors duration-150 cursor-pointer appearance-none focus:border-[#4a90d9] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:w-[18px] [&::-webkit-calendar-picker-indicator]:h-[18px] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            value={scheduledStartTime}
            onChange={(e) => setScheduledStartTime(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            className="w-full py-3 px-3 bg-[#4a90d9] text-white border-none rounded-md text-[0.75rem] font-semibold tracking-[0.08em] uppercase cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none hover:not-disabled:bg-[#3a7bc8]"
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
      <div className="flex-1 flex flex-col p-8 gap-7 overflow-y-auto">
        {/* SCHEDULED TASKS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1e2535] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#4a90d9]">
                Scheduled Tasks
              </div>
              <span
                className={`text-[0.65rem] px-2.5 py-0.5 rounded-full tracking-[0.05em] ${
                  scheduledTasksForGroup.length > 0
                    ? "bg-[#0d1f33] text-[#4a90d9] border border-[#1e3a5a]"
                    : "bg-[#1e2535] text-slate-500"
                }`}
              >
                {scheduledTasksForGroup.length > 0
                  ? `${scheduledTasksForGroup.length} scheduled`
                  : "none"}
              </span>
            </div>
            {scheduledTasksForGroup.length > 0 && (
              <button
                className="text-[0.6rem] font-semibold tracking-[0.08em] uppercase px-3 py-1 rounded border border-red-500 bg-transparent text-red-500 cursor-pointer transition-all duration-150 hover:not-disabled:bg-red-500 hover:not-disabled:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={isCancellingScheduled || !selectedScheduledTaskId}
                onClick={handleCancelScheduled}
              >
                {isCancellingScheduled ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>

          {!selectedGroupId || scheduledTasksForGroup.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-[#2a3550] text-[0.75rem] tracking-[0.1em] uppercase py-8">
              <span className="text-2xl opacity-30">⬡</span>
              {!selectedGroupId
                ? "Select a group to begin"
                : "No scheduled tasks"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {scheduledTasksForGroup.map((task) => (
                <div
                  key={task.id}
                  className={`grid items-center gap-5 px-5 py-4 border rounded-lg transition-colors duration-150 cursor-pointer ${
                    selectedScheduledTaskId === task.id
                      ? "border-red-500 bg-[#1a1520] hover:border-red-400"
                      : "bg-[#161b27] border-[#1e2535] hover:border-[#2a3550]"
                  }`}
                  style={{ gridTemplateColumns: "1.4fr 1.2fr 1.6fr auto" }}
                  onClick={() =>
                    setSelectedScheduledTaskId(
                      selectedScheduledTaskId === task.id ? null : task.id,
                    )
                  }
                >
                  <span className="text-[0.95rem] font-semibold text-slate-100 truncate">
                    {task.groupName}
                  </span>
                  <span className="text-sm font-normal text-slate-300 whitespace-nowrap">
                    {task.starttime}
                  </span>
                  <span className="text-sm text-slate-400 truncate">
                    {task.imageName}
                  </span>
                  <span className="text-[0.6rem] px-2.5 py-0.5 rounded-full bg-[#0d1f33] text-[#4a90d9] border border-[#1e3a5a] whitespace-nowrap tracking-[0.05em] justify-self-end">
                    {task.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE HOSTS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#1e2535] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-[#4a90d9]">
                Active Hosts
              </div>
              <span
                className={`text-[0.65rem] px-2.5 py-0.5 rounded-full tracking-[0.05em] ${
                  enrichedTasks.length > 0
                    ? "bg-[#0d2a1a] text-green-500 border border-green-800"
                    : "bg-[#1e2535] text-slate-500"
                }`}
              >
                {enrichedTasks.length > 0
                  ? `${enrichedTasks.length} host${enrichedTasks.length > 1 ? "s" : ""} running`
                  : "no active session"}
              </span>
            </div>
            {enrichedTasks.length > 0 && (
              <button
                className="text-[0.6rem] font-semibold tracking-[0.08em] uppercase px-3 py-1 rounded border border-red-500 bg-transparent text-red-500 cursor-pointer transition-all duration-150 hover:not-disabled:bg-red-500 hover:not-disabled:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={isCancelling || !activeSessionId}
                onClick={handleCancelActiveSession}
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>

          {!selectedGroupId || enrichedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-[#2a3550] text-[0.75rem] tracking-[0.1em] uppercase py-8">
              <span className="text-2xl opacity-30">⬡</span>
              {!selectedGroupId
                ? "Select a group to begin"
                : "No active tasks for this group"}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {enrichedTasks.map((task) => {
                const state = MULTICAST_STATES[task.stateID] ?? {
                  label: `State ${task.stateID}`,
                  color: "text-slate-400 bg-[#1e2535] border-[#2a3550]",
                };
                return (
                  <div
                    key={task.id}
                    className="grid items-center gap-5 px-5 py-4 bg-[#161b27] border border-[#1e2535] rounded-lg transition-colors duration-150 hover:border-[#2a3550]"
                    style={{ gridTemplateColumns: "1.4fr 1.6fr auto auto" }}
                  >
                    <span className="text-[0.95rem] font-semibold text-slate-100 truncate">
                      {task.hostName}
                    </span>
                    <span className="text-sm text-slate-400 truncate">
                      {task.imageName}
                    </span>
                    <span
                      className={`text-[0.6rem] px-2.5 py-0.5 rounded-full border whitespace-nowrap tracking-[0.05em] ${state.color}`}
                    >
                      {state.label}
                    </span>
                    {task.pct !== undefined && task.pct !== "" ? (
                      <span className="text-sm font-medium text-[#4a90d9] whitespace-nowrap justify-self-end">
                        {Number(task.pct.slice(-3))}%
                      </span>
                    ) : (
                      <div
                        title="Running"
                        className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e88] justify-self-end animate-pulse"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
