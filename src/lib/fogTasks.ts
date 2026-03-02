import { fogFetchJson } from "@/lib/fogApi";

class MulticastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MulticastError";
  }
}

/**
 * Starts a multicast deployment for a group.
 *
 * 1. Validate inputs
 * 2. Ensure no active tasks
 * 3. Update hosts in the group to the new image
 * 4. Update the group image
 * 5. Create multicast task
 */
export async function startGroupMulticast(
  groupID: number,
  imageID: number,
  kernelDevice: string,
) {
  if (!groupID || !imageID || !kernelDevice) {
    throw new MulticastError("groupID, imageID, and primaryDisk are required");
  }

  // Fetch group associations to get hostIDs
  const associations = await fogFetchJson(`/fog/groupassociation`);

  if (!associations?.data || !Array.isArray(associations.data)) {
    throw new MulticastError("Invalid group association response");
  }

  const hostIDs = associations.data
    .filter((a: any) => Number(a.groupID) === groupID)
    .map((a: any) => Number(a.hostID));

  console.log(hostIDs);

  if (hostIDs.length === 0) {
    throw new MulticastError("No hosts associated with the selected group.");
  }

  // Ensure no active tasks on the selected group / hosts
  const activeTasks = await fogFetchJson(`/fog/task/active`);
  const hostIDSet = new Set(hostIDs);
  const hasMatch = activeTasks.data.some((task: any) =>
    hostIDSet.has(task.hostID),
  );

  if (hasMatch) {
    throw new MulticastError(
      "Validation Failed: One or more Hosts are already associated with active tasks.",
    );
  }

  // Update the new image to each host
  await Promise.all(
    hostIDs.map((hostID: number) =>
      fogFetchJson(`/fog/host/${hostID}/edit`, {
        method: "PUT",
        body: JSON.stringify({ imageID, kernelDevice }),
      }),
    ),
  );

  // Update group image
  await fogFetchJson(`/fog/group/${groupID}/edit`, {
    method: "PUT",
    body: JSON.stringify({ imageID, kernelDevice }),
  });

  // Create multicast task (taskTypeID 8 = multicast)
  const taskResponse = await fogFetchJson(`/fog/group/${groupID}/task`, {
    method: "POST",
    body: JSON.stringify({
      taskTypeID: "8",
      name: `Multicast for ${groupID}`,
      isActive: "1",
      shutdown: "0",
      other2: "0",
      other4: "1",
      wol: "1",
    }),
  });

  return {
    success: true,
    task: taskResponse,
  };
}

/**
 * Cancel a multicast deployment for a group.
 *
 * 1. Validate inputs
 * 2. Cancel all multicast tasks for selected group
 */
export async function cancelGroupMulticast(sessionID: number) {
  if (!sessionID) {
    throw new MulticastError("taskID is required!");
  }

  const cancelActiveTask = await fogFetchJson(
    `/fog/multicastsession/${sessionID}/cancel`,
    {
      method: "DELETE",
    },
  );

  return {
    success: true,
    task: cancelActiveTask,
  };
}
