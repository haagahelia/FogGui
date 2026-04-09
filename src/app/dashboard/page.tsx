"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useActiveTasks } from "@/hooks/useActiveTasks";
import { useMulticastSessions } from "@/hooks/useMulticastSessions";
import { useScheduledMulticast } from "@/hooks/useScheduledMulticast";
import { createMulticast } from "@/services/multicastServices";
import { formatTime } from "@/lib/formatTime";
import { getErrorMessage } from "@/lib/errorHandler";

import { SelectField } from "@/components/DashboardSelectField";
import { SectionHeader } from "@/components/DashboardSectionHeader";
import { EmptyState } from "@/components/DashboardEmptyState";
import { ScheduledTaskCard } from "@/components/DashboardScheduledTaskCard";
import { ActiveHostCard } from "@/components/DashboardActiveHostsCard";

export default function MulticastDashboard() {
  const { groups, images, hosts, groupAssociations, loading, error } =
    useDashboardData();
  const { activeTasks, refetch: refetchActiveTasks } = useActiveTasks();
  const {
    multicastSessions,
    refetch: refetchSessions,
    cancelActiveSession,
  } = useMulticastSessions();
  const {
    scheduledMulticast,
    refetch: refetchScheduledMulticast,
    cancelScheduledMulticast,
  } = useScheduledMulticast();

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

  // Gets available disk devices from environment variables
  const diskOptions = [
    process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_1,
    process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_2,
  ].filter(Boolean);

  // MULTICAST CREATION HANDLER: Handles starting or scheduling a new multicast deployment
  const handleMulticast = async () => {
    // Validation
    if (!selectedGroupId || !selectedImageId || !selectedDisk) {
      alert("Please select a Group, Image, and Disk.");
      return;
    }

    if (!window.confirm("Are you sure you want to start the multicast?"))
      return;

    setIsSubmitting(true);

    // Call API to create multicast (immediate or scheduled)
    try {
      await createMulticast({
        groupID: Number(selectedGroupId),
        imageID: Number(selectedImageId),
        kernelDevice: selectedDisk,
        ...(scheduledStartTime && {
          scheduledStartTime: formatTime(scheduledStartTime),
        }),
      });

      alert(
        scheduledStartTime
          ? `Multicast scheduled for ${formatTime(scheduledStartTime)}!`
          : "Multicast started successfully!",
      );

      // Refresh all related data to show updates in UI
      refetchActiveTasks();
      refetchSessions();
      refetchScheduledMulticast();
    } catch (error) {
      alert(`Error: ${getErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find all hosts (computers) that belong to the selected group
  const associatedHostIDs = groupAssociations
    .filter((assoc) => assoc.groupID === Number(selectedGroupId))
    .map((assoc) => assoc.hostID);

  // Filter active tasks to only show those running on hosts in the selected group
  const activeTasksForSelectedGroup = activeTasks.filter((task) =>
    associatedHostIDs.includes(task.hostID),
  );

  // Enhance task data by looking up host and image names (instead of just IDs)
  const enrichedTasks = activeTasksForSelectedGroup.map((task) => {
    const host = hosts.find((h) => h.id === task.hostID);
    const image = images.find((img) => img.id === task.imageID);
    return {
      ...task,
      hostName: host?.name ?? `Host #${task.hostID}`,
      imageName: image?.name ?? `Image #${task.imageID}`,
    };
  });

  // Find the active multicast session ID for the selected group
  const activeSessionId =
    multicastSessions.find((s) => enrichedTasks.some((t) => t.name === s.name))
      ?.id ?? null;

  // Filter scheduled multicasts to only show those for the selected group
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

  // Handles cancelling a scheduled multicast task
  const handleCancelScheduled = async () => {
    if (!selectedScheduledTaskId) {
      alert("Please select a scheduled task to cancel.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this scheduled task?"))
      return;

    setIsCancellingScheduled(true);

    try {
      await cancelScheduledMulticast(selectedScheduledTaskId);
      alert("Scheduled task cancelled successfully!");
      setSelectedScheduledTaskId(null);
    } catch (error) {
      alert(`Error: ${getErrorMessage(error)}`);
    } finally {
      setIsCancellingScheduled(false);
    }
  };

  // Handles cancelling currently running multicast tasks for a group
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
      await cancelActiveSession(activeSessionId);
      refetchActiveTasks();
      alert("Tasks cancelled successfully!");
    } catch (error) {
      alert(`Error: ${getErrorMessage(error)}`);
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
        <SelectField
          label="Group"
          value={selectedGroupId}
          options={groups}
          placeholder="— Select Group —"
          onChange={(value) => {
            setSelectedGroupId(value);
            refetchActiveTasks();
            refetchSessions();
            refetchScheduledMulticast();
          }}
        />

        {/* Image */}
        <SelectField
          label="Image"
          value={selectedImageId}
          options={images}
          placeholder="— Select Image —"
          onChange={setSelectedImageId}
        />

        {/* Primary Disk */}
        <SelectField
          label="Primary Disk"
          value={selectedDisk}
          options={diskOptions.map((d) => ({ id: d!, name: d! }))}
          placeholder="— Select Disk —"
          onChange={setSelectedDisk}
        />

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
          <SectionHeader
            title="Scheduled Tasks"
            badge={{
              active: scheduledTasksForGroup.length > 0,
              label:
                scheduledTasksForGroup.length > 0
                  ? `${scheduledTasksForGroup.length} scheduled`
                  : "none",
            }}
            cancelButton={
              scheduledTasksForGroup.length > 0
                ? {
                    disabled: isCancellingScheduled || !selectedScheduledTaskId,
                    isLoading: isCancellingScheduled,
                    onClick: handleCancelScheduled,
                  }
                : undefined
            }
          />
          {!selectedGroupId || scheduledTasksForGroup.length === 0 ? (
            <EmptyState
              message={
                !selectedGroupId
                  ? "Select a group to begin"
                  : "No scheduled tasks"
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {scheduledTasksForGroup.map((task) => (
                <ScheduledTaskCard
                  key={task.id}
                  task={task}
                  isSelected={selectedScheduledTaskId === task.id}
                  onSelect={setSelectedScheduledTaskId}
                />
              ))}
            </div>
          )}
        </div>

        {/* ACTIVE HOSTS */}
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Active Hosts"
            badge={{
              active: enrichedTasks.length > 0,
              label:
                enrichedTasks.length > 0
                  ? `${enrichedTasks.length} host${enrichedTasks.length > 1 ? "s" : ""} running`
                  : "no active session",
            }}
            cancelButton={
              enrichedTasks.length > 0
                ? {
                    disabled: isCancelling || !activeSessionId,
                    isLoading: isCancelling,
                    onClick: handleCancelActiveSession,
                  }
                : undefined
            }
          />
          {!selectedGroupId || enrichedTasks.length === 0 ? (
            <EmptyState
              message={
                !selectedGroupId ? "Select a group to begin" : "No active hosts"
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {enrichedTasks.map((task) => (
                <ActiveHostCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
