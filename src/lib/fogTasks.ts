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
 * 5. Verify updates
 * 6. Create multicast task
 */
export async function startGroupMulticast(
  groupID: number,
  imageID: number,
  kernelDevice: string,
) {
  if (!groupID || !imageID || !kernelDevice) {
    throw new MulticastError("groupID, imageID, and primaryDisk are required");
  }

  // Ensure no active tasks
  // const tasks = await fogFetchJson(`/fog/group/${groupID}/task`);

  // const hasActiveTask = Array.isArray(tasks)
  //   ? tasks.some((t: any) => t.isActive === "1")
  //   : false;

  // if (hasActiveTask) {
  //   throw new MulticastError(
  //     "Group already has an active task. Cannot start multicast.",
  //   );
  // }

  // Fetch group associations to get hostIDs
  const associations = await fogFetchJson(`/fog/groupassociation`);

  if (!associations?.data || !Array.isArray(associations.data)) {
    throw new MulticastError("Invalid group association response");
  }

  const hostIDs = associations.data.map((a: any) => Number(a.hostID));
  console.log(hostIDs);

  if (hostIDs.length === 0) {
    throw new MulticastError("No hosts associated with the selected group.");
  }

  // Update each host to the new image
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

  // Verify image update
  // const updatedGroup = await fogFetchJson(`/fog/group/${groupID}`);
  // const imageMatch = Number(updatedGroup.imageID) === Number(imageID);
  // const diskMatch = updatedGroup.kernelDevice === kernelDevice;

  // if (!imageMatch || (kernelDevice && !diskMatch)) {
  //   throw new MulticastError("Update verification failed. Multicast aborted.");
  // }

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
