"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Group } from "@/types/group";
import { Image } from "@/types/image";
import { Host } from "@/types/host";
import { Task } from "@/types/task";
import { Groupassociation } from "@/types/groupassociation";

import HostModal from "@/components/HostModal";


export default function Dashboard() {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [groupAssociations, setGroupAssociations] = useState<Groupassociation[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [selectedPrimaryDisk, setSelectedPrimaryDisk] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [refreshTasks, setRefreshTasks] = useState(false);

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  const disk1value = process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_1;
  const disk2value = process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_2;



  useEffect(() => {
    const fetchData = async () => {
      try {

        const assocEndpoint = useDummyData ? "/dummyGroupAssociation.json" : "/api/groupassociations";
        const hostEndpoint = useDummyData ? "/dummyData.json" : "/api/hosts";
        const groupEndpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        const imageEndpoint = useDummyData ? "/dummyImageData.json" : "/api/images";


        const [groupAssocResponse, hostResponse, groupResponse, imageResponse] = await Promise.all([
          fetch(assocEndpoint),
          fetch(hostEndpoint),
          fetch(groupEndpoint),
          fetch(imageEndpoint),
        ]);

        const groupAssocData = await groupAssocResponse.json();
        const hostData = await hostResponse.json();
        const groupData = await groupResponse.json();
        const imageData = await imageResponse.json();

        setGroupAssociations(groupAssocData.groupassociations || []);
        setHosts(hostData.hosts || []);
        setGroups(groupData.groups || []);
        setImages(imageData.images || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Second useEffect for fetching active tasks for selected group
  useEffect(() => {
    if (!selectedGroup) return;
  
    let intervalId: NodeJS.Timeout | null = null;
  
    const fetchActiveTasks = async () => {
      try {
        const response = await fetch(`/api/active-tasks?groupId=${selectedGroup.id}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data: Task[] = await response.json();
        setActiveTasks(data);
  
        // Stop polling if no active tasks
        if (data.length === 0 && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (error) {
        console.error("Error fetching active tasks:", error);
        setActiveTasks([]);
      }
    };
  
    // Initial fetch
    fetchActiveTasks();
  
    // Start polling
    intervalId = setInterval(fetchActiveTasks, 5000);
  
    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedGroup, refreshTasks]);
  
  // Load selected group from local storage on component mount
  useEffect(() => {
    const storedGroupID = localStorage.getItem("selectedGroup");
    if (storedGroupID) {
      const foundGroup = groups.find((g: any) => g.id === Number(storedGroupID));
      if (foundGroup) setSelectedGroup(foundGroup);
    }
  }, [groups]);

  // Save selected group to local storage whenever it changes
  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem("selectedGroup", String(selectedGroup.id));
    }
  }, [selectedGroup]);


  if (loading) {
    return <Typography>Loading...</Typography>;
  }

    // Get host IDs that are part of the selected group
    const groupHostIds = groupAssociations
    .filter((assoc: any) => assoc.groupID === selectedGroup?.id)
    .map((assoc: any) => assoc.hostID);

  // Map group associations to hosts
  const groupMap = groupAssociations.reduce((hostGroupMap: any, assoc: any) => {
    if (!assoc.hostID || !assoc.groupID)
      return hostGroupMap;
    hostGroupMap[assoc.hostID] = hostGroupMap[assoc.hostID] || [];
    hostGroupMap[assoc.hostID].push(assoc.groupID);
    return hostGroupMap;
  }, {});
    
 const startMulticast = () => {
  if (!selectedGroup || !selectedImage || !selectedPrimaryDisk) {
    console.error("Please select group, image and disk before starting multicast");
    return;
  }

  const confirmMulticast = window.confirm(
    `Are you sure you want to start MULTICAST session for ${selectedGroup.name}?`
  );
  if (!confirmMulticast) return;

  if (activeTasks.length > 0) {
    const confirm = window.confirm(
      `⚠️ Warning: ${activeTasks.length} host(s) in this group already have active tasks. Do you want to continue?`
    );
    if (!confirm) return;
  }


  fetch("/api/groups", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupID: selectedGroup.id,
      imageID: selectedImage.id,
      kernelDevice: selectedPrimaryDisk,
      hostIDs: groupHostIds,
    }),
  })
    .then(async (updateResponse) => {
      const text = await updateResponse.text();
      let updateData;
      try {
        updateData = JSON.parse(text);
      } catch {
        throw new Error(`Update group failed with non-JSON response: ${text}`);
      }

      if (!updateResponse.ok)
        throw new Error(updateData.error || "Failed to update group");

      return fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startMulticast",
          groupID: selectedGroup.id,
          taskTypeID: "8",
          name: `Multicast for ${selectedGroup.name}`,
        }),
      });
    })
    .then(async (multicastResponse) => {
      const text = await multicastResponse.text();
      let multicastData;
      try {
        multicastData = JSON.parse(text);
      } catch {
        throw new Error(`Multicast start failed with non-JSON response: ${text}`);
      }

      if (!multicastResponse.ok)
        throw new Error(multicastData.error || "Failed to start multicast");

      console.log("Multicast started successfully:", multicastData);
      alert("🎉 Multicast started successfully!");
      // 👇 This triggers a task refresh
      setRefreshTasks(prev => !prev);
    })
    .catch((error: unknown) => {
      let message = "Unknown error";
      if (error instanceof Error) message = error.message;
      else if (typeof error === "string") message = error;

      console.error("Error during multicast process:", message);
      alert(`❌ An unexpected error occurred: ${message}`);
    });
};

      

  const startUnicast = () => {

    if (!selectedGroup || !selectedImage || !selectedPrimaryDisk) {
      console.error("Please select group, image and disk before starting multicast");
      return;
    }

    const confirmUnicast = window.confirm(`Are you sure you want to start UNICAST for ${selectedGroup.name}?`);
    if (!confirmUnicast) return;

    if (activeTasks.length > 0) {
      const confirm = window.confirm(
        `⚠️ Warning: ${activeTasks.length} host(s) in this group already have active tasks. Do you want to continue?`
      );
      if (!confirm) return;
    }

    fetch("/api/groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupID: selectedGroup.id,
        imageID: selectedImage.id,
        kernelDevice: selectedPrimaryDisk,
        hostIDs: groupHostIds
      }),
    })
      .then(async (updateResponse) => {
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) throw new Error(updateData.error || "Failed to update group");

        return fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "startUnicast",
            groupID: selectedGroup.id,
          }),
        });
      })
      .then(async (unicastResponse) => {
        const unicastData = await unicastResponse.json();
        if (!unicastResponse.ok) throw new Error(unicastData.error || "Failed to start unicast");

        console.log("unicast started successfully:", unicastData);
        alert("🎉 Unicast started successfully!");
        // 👇 This triggers a task refresh
      setRefreshTasks(prev => !prev);

      })
      .catch((error) => {
        console.error("Error during deployment process:", error.message);
        alert("❌ An unexpected error occurred.");
      });
  };


  const startFastWipe = async () => {
    if (!selectedGroup || !selectedPrimaryDisk) {
      console.error("Please select disk before starting Fast Wipe");
      alert("⚠️ Please select disk");
      return;
    }

    const confirmFastWipe = window.confirm(`Are you sure you want to start FAST WIPE for ${selectedGroup.name} in Disk ${selectedPrimaryDisk}?`);
    if (!confirmFastWipe) return;

    if (activeTasks.length > 0) {
      const confirm = window.confirm(
        `⚠️ Warning: ${activeTasks.length} host(s) in this group have active tasks. Do you want to continue?`
      );
      if (!confirm) return;
    }

    try {

      // Step 1: Set the kernel device for group and hosts (== primary disk)
      const updateResponse = await fetch("/api/groups/prepareFastWipe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupID: selectedGroup.id,
          kernelDevice: selectedPrimaryDisk,
          hostIDs: groupHostIds,
        }),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Failed to update primary disk.");
      }

      // Step 2: Trigger the fast wipe task
      const startResponse = await fetch("/api/groups/prepareFastWipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupID: selectedGroup.id,
        }),
      });

      const startData = await startResponse.json();
      if (!startResponse.ok) {
        throw new Error(startData.error || "Failed to start Fast Wipe task.");
      }

      // After success
      console.log("Fast Wipe started successfully:", startData);
      alert("🎉 Fast Wipe started successfully!");
      // 👇 This triggers a task refresh
      setRefreshTasks(prev => !prev);

    } catch (error: any) {
      console.error("Fast Wipe error:", error.message || error);
      alert(`❌ Fast Wipe failed: ${error.message || "Unknown error"}`);
    }
  };

  // Function to handle opening the modal
  const handleOpenModal = (host: any) => {
    setSelectedHost(host);
    setOpenModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedHost(null);
  };


  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Left Column: Group Selector and Group Assignments */}
        <Grid item xs={6} md={3}>
          {/* Group Selector */}
          <Card
            sx={{
              border: "2px solid #1976d2",
              borderRadius: 2,
              boxShadow: 2,
              background: "#f4f8fd",
              minWidth: 220,
              minHeight: 170,
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                Select a Group
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="group-select-label">Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  value={selectedGroup?.id ?? ""}
                  onChange={(e) => {
                    const chosenValue = e.target.value;
                    if (chosenValue === "") {
                      setSelectedGroup(null);
                      return;
                    }
                    const group = groups.find((g) => g.id === Number(chosenValue));
                    setSelectedGroup(group ?? null);
                  }}
                  label="Group"
                  size="medium"
                  sx={{ background: "#fff", borderRadius: 1 }}
                >
                  {groups.map((group: any) => (
                    <MenuItem key={group.id} value={String(group.id)}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Group Assignments */}
          {selectedGroup && (
            <Card
              sx={{
                boxShadow: 1,
                borderRadius: 2,
                background: "#f4f6f8",
                border: "1.5px solid #1976d2",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontSize: "1.1rem", color: "#1976d2", mb: 1 }}>
                  Hosts Assigned to '{selectedGroup.name}'
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1, fontSize: "0.95rem" }}>
                  Host Count:{" "}
                  {hosts.filter((host) =>
                    groupAssociations.some(
                      (assoc) => assoc.groupID === selectedGroup.id && assoc.hostID === host.id
                    )
                  ).length}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ maxHeight: 350, overflowY: "auto", pr: 1 }}>
                  {hosts
                    .filter((host) =>
                      groupAssociations.some(
                        (assoc) => assoc.groupID === selectedGroup.id && assoc.hostID === host.id
                      )
                    )
                    .map((host) => (
                      <Box
                        key={host.id}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        mb={1}
                        p={1}
                        borderBottom={"1.5px solid #e0e0e0"}
                        maxWidth={220}
                        mx="auto"
                      >
                        <Typography variant="subtitle1" sx={{ fontSize: "0.95rem" }}>
                          <Typography
                            component="span"
                            sx={{ cursor: "pointer", color: "#1976d2", fontWeight: 500 }}
                            onClick={() => handleOpenModal(host)}
                          >
                            {host.name}
                          </Typography>
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
          )}
          {selectedHost && (
            <HostModal open={openModal} onClose={handleCloseModal} hosts={[selectedHost]} />
          )}
        </Grid>

        {/* Right Column: Actions and Active Tasks */}
        {selectedGroup && (
          <Grid item xs={6} md={7} lg={8}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Actions for '{selectedGroup.name}'</Typography>
                {/* Image selection */}
                <FormControl fullWidth sx={{ my: 2 }}>
                  <InputLabel id="image-select-label">Select Image</InputLabel>
                  <Select
                    labelId="image-select-label"
                    value={selectedImage?.id ?? ""}
                    onChange={(e) => {
                      const image = images.find((img) => img.id === Number(e.target.value));
                      setSelectedImage(image ?? null);
                    }}
                    label="Select Image"
                  >
                    {images.map((image: any) => (
                      <MenuItem key={image.id} value={image.id}>
                        {image.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Disk selection */}
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                  <InputLabel id="disk-select-label">Select Primary Disk</InputLabel>
                  <Select
                    labelId="disk-select-label"
                    value={selectedPrimaryDisk || ""}
                    onChange={(e) => setSelectedPrimaryDisk(e.target.value)}
                    label="Select Primary Disk"
                  >
                    <MenuItem value={disk1value}>Disk 1</MenuItem>
                    <MenuItem value={disk2value}>Disk 2</MenuItem>
                  </Select>
                </FormControl>

                {/* Action buttons */}
                <Button
                  onClick={startMulticast}
                  variant="contained"
                  sx={{ m: 0.5 }}
                  disabled={!selectedGroup || !selectedImage || !selectedPrimaryDisk}
                >
                  Start Multicast
                </Button>
                <Button
                  onClick={startUnicast}
                  variant="contained"
                  color="secondary"
                  sx={{ m: 0.5 }}
                  disabled={!selectedGroup || !selectedImage || !selectedPrimaryDisk}
                >
                  Start Unicast
                </Button>
                <Button
                  onClick={startFastWipe}
                  variant="contained"
                  color="error"
                  disabled={!selectedGroup || !selectedPrimaryDisk}
                  sx={{ m: 0.5 }}
                >
                  Fast Wipe
                </Button>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card sx={{ boxShadow: 2, borderRadius: 2, background: "#f8fafc" }}>
              <CardContent>
                <Typography variant="h6">
                  Active Tasks in '{selectedGroup.name}'
                </Typography>
                <Divider sx={{ my: 1 }} />

                <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                  {activeTasks.length > 0 ? (
                    activeTasks.map((task: any) => (
                      <Box key={task.id} mb={2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                          mb={0.5}
                        >
                          <Typography fontSize="0.9rem" flex={1}>
                            {task.host?.name || task.name}
                          </Typography>
                          <Typography fontSize="0.9rem" color="text.secondary" flex={1}>
                            {task.image?.name || "No image"}
                          </Typography>
                          <Chip
                            label={
                              task.typeID === 1
                                ? `Unicast ${task.state?.name}`
                                : task.typeID === 8
                                  ? `Multicast ${task.state?.name}`
                                  : task.typeID === 18
                                    ? `Fast Wipe ${task.state?.name}`
                                    : task.state?.name
                            }
                            color={
                              task.typeID === 1
                                ? "secondary"
                                : task.typeID === 8
                                  ? "primary"
                                  : task.typeID === 18
                                    ? "error"
                                    : "default"
                            }
                            size="small"
                          />
                        </Box>

                        {task.stateID === 3 && (
                        <>
                          {/* Progress Bar */}
                          <Box width="100%" height={6} bgcolor="#e0e0e0" borderRadius={4}>
                            <Box
                              height="100%"
                              borderRadius={4}
                              bgcolor="#1976d2"
                              width={`${task.percent ?? 0}%`}
                              sx={{ transition: "width 0.5s ease-in-out" }}
                            />
                          </Box>

                          <Typography fontSize="0.7rem" textAlign="right" color="text.secondary">
                            {task.percent ?? 0}%
                          </Typography>
                        </>
                      )}
                      </Box>
                    ))
                  ) : (
                    <Typography>No active tasks</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};