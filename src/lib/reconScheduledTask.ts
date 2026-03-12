import { dbAll, dbRun } from "./db";
import { fogFetchJson } from "./fogApi";

/**
 * BACKGROUND JOB — runs every 60 seconds on the Node.js server.
 * WHY THIS EXISTS:
 * FOG's scheduled tasks don't store which image to deploy — imageID is always
 * 0 on group tasks. FOG reads the image from the hosts at execution time.
 * This means if the host's image changes between scheduling and execution,
 * the wrong image gets deployed.
 *
 * HOW IT SOLVES THE PROBLEM:
 * When a multicast task is scheduled, we store the intended imageID locally
 * in our own DB. 10 minutes before the task fires, this job updates all hosts
 * in the group to the correct image — so when FOGScheduler executes the task,
 * it reads the right image from the hosts.
 */
interface ScheduledMulticastTask {
  id: number;
  fogTaskID: number; // link to fog scheduled task ID
  groupID: number;
  imageID: number; // the image intended for the scheduled task
  kernelDevice: string;
  scheduledTime: number;
  status: "pending" | "reconciled" | "done" | "cancelled";
  createdAt: number;
}

// Updates every host in the group to the correct imageID and kernelDevice.
async function updateGroupHostImages(
  groupID: number,
  imageID: number,
  kernelDevice: string,
) {
  const associations = await fogFetchJson(`/fog/groupassociation`);

  if (!associations?.data || !Array.isArray(associations.data)) {
    throw new Error("Invalid group association response");
  }

  const hostIDs: number[] = associations.data
    .filter((a: any) => Number(a.groupID) === groupID)
    .map((a: any) => Number(a.hostID));

  if (hostIDs.length === 0) {
    throw new Error(`No hosts found for group ${groupID}`);
  }

  // Update all hosts in parallel — Promise.allSettled won't stop if one fails,
  const results = await Promise.allSettled(
    hostIDs.map((hostID) =>
      fogFetchJson(`/fog/host/${hostID}/edit`, {
        method: "PUT",
        body: JSON.stringify({ imageID, kernelDevice }),
      }),
    ),
  );

  // Check if any host updates failed
  // Promise.allSettled gives each result a status of "fulfilled" or "rejected"
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    throw new Error(`Failed to update ${failed.length} host(s)`);
  }
}

/**
 * Main reconciliation logic — runs every 60 seconds via setInterval.
 * Looks for tasks that are within 10 minutes of their scheduled time
 * and haven't been reconciled yet, then updates the hosts accordingly.
 */
async function runReconciliation() {
  const now = Math.floor(Date.now() / 1000);
  const tenMinutes = 10 * 60;

  /**
   * Find tasks that are:
   * still pending (not yet reconciled, cancelled, or done)
   * within the next 10 minutes (scheduledTime <= now + 10min)
   * not already in the past (scheduledTime >= now)
   */
  const upcoming = await dbAll<ScheduledMulticastTask>(
    `SELECT * FROM scheduled_multicast_tasks
     WHERE status = 'pending'
       AND scheduledTime <= ?
       AND scheduledTime >= ?`,
    [now + tenMinutes, now],
  );

  for (const task of upcoming) {
    try {
      // Verify the task still exists in FOG
      let fogTask = null;
      try {
        fogTask = await fogFetchJson(`/fog/scheduledtask/${task.fogTaskID}`);
      } catch {
        fogTask = null;
      }

      if (!fogTask || !fogTask.id) {
        // Task was deleted/cancelled in FOG — mark it cancelled locally
        await dbRun(
          `UPDATE scheduled_multicast_tasks SET status = 'cancelled' WHERE id = ?`,
          [task.id],
        );
        console.log(
          `[Reconciler] Task ${task.id} no longer exists in FOG — marked cancelled`,
        );
        continue;
      }

      console.log(
        `[Reconciler] Applying image ${task.imageID} to group ${task.groupID}`,
      );

      // Update all hosts in the group to the intended image
      await updateGroupHostImages(
        task.groupID,
        task.imageID,
        task.kernelDevice,
      );

      // Mark as reconciled so we don't process it again next minute
      await dbRun(
        `UPDATE scheduled_multicast_tasks SET status = 'reconciled' WHERE id = ?`,
        [task.id],
      );

      console.log(`[Reconciler] Task ${task.id} reconciled!`);
    } catch (err) {
      console.error(`[Reconciler] Failed to reconcile task ${task.id}:`, err);
    }
  }
}

// Safeguard to prevent multiple intervals from being created.
let jobStarted = false;

export function startReconciliationJob() {
  if (jobStarted) return;
  jobStarted = true;

  console.log("[Reconciler] Starting reconciliation job...");

  // Run once immediately on startup — handles the case where the server
  // restarted while a task was already inside the 10-minute window
  runReconciliation();

  // Then check every 60 seconds
  setInterval(runReconciliation, 60 * 1000);
}
