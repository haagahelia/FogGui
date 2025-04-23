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


export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [groupAssociations, setGroupAssociations] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<Image[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [selectedPrimaryDisk, setSelectedPrimaryDisk] = useState<string | null>(null);

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  useEffect(() => {
    const fetchData = async () => {
      try {

        const taskEndpoint = useDummyData ? "/dummyTaskData.json" : "/api/tasks";
        const assocEndpoint = useDummyData ? "/dummyGroupAssociation.json" : "/api/groupassociations";
        const hostEndpoint = useDummyData ? "/dummyData.json" : "/api/hosts";
        const groupEndpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        const imageEndpoint = useDummyData ? "/dummyImageData.json" : "/api/images";
        
          
        const [taskResponse, groupAssocResponse, hostResponse, groupResponse, imageResponse] = await Promise.all([
          fetch(taskEndpoint),
          fetch(assocEndpoint),
          fetch(hostEndpoint),
          fetch(groupEndpoint),
          fetch(imageEndpoint),
        ]);

        const taskData = await taskResponse.json();
        const groupAssocData = await groupAssocResponse.json();
        const hostData = await hostResponse.json();
        const groupData = await groupResponse.json();
        const imageData = await imageResponse.json();

        setTasks(taskData.tasks || []);
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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // Filter tasks by group selected and with "Queued" or "In-progress" states
  const excludedStateIds = [4, 5]; // Complete, Cancelled

  // Get host IDs that are part of the selected group
  const groupHostIds = groupAssociations
    .filter((assoc: any) => assoc.groupID === selectedGroup?.id)
    .map((assoc: any) => assoc.hostID);

  // Filter tasks that are active and belong to those hosts
  const groupSpecificTasks = tasks.filter((task: any) =>
    groupHostIds.includes(task.host?.id) &&
    !excludedStateIds.includes(task.state?.id)
  );
  
  // Map group associations to hosts
  const groupMap = groupAssociations.reduce((hostGroupMap: any, assoc: any) => {
    if (!assoc.hostID || !assoc.groupID)
      return hostGroupMap;
    hostGroupMap[assoc.hostID] = hostGroupMap[assoc.hostID] || [];
    hostGroupMap[assoc.hostID].push(assoc.groupID);
    return hostGroupMap;
  }, {});

  // Group tasks by host and their associated groups
  const groupedTasks = hosts
    .filter((host: any) => groupMap[host.id])
    .map((host: any) => ({
      hostName: host.name,
      groups: groupMap[host.id].map(
        (groupID: number) =>
          (groups.find((group: { id: number; name: string }) =>
            group.id === groupID) as { id: number; name: string } | undefined)?.name ?? `Unknown group`
      ),
    }));
  
  const startMulticast = () => {

    if (!selectedGroup || !selectedImage || !selectedPrimaryDisk) {
      console.error("Please select group, image and disk before starting multicast");
      return;
    }

    const confirmMulticast= window.confirm(`Are you sure you want to start MULTICAST session for ${selectedGroup.name}?`);
    if (!confirmMulticast) return;
    
    if (groupSpecificTasks.length > 0) {
      const confirm = window.confirm(
        `⚠️ Warning: ${groupSpecificTasks.length} host(s) in this group already have active tasks. Do you want to continue?`
      );
      if (!confirm) return;
    }
    
    fetch("/api/groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateGroup",
        groupID: selectedGroup.id,
        imageID: selectedImage.id,
        kernelDevice: selectedPrimaryDisk,
      }),
    })
      .then(async (updateResponse) => {
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) throw new Error(updateData.error || "Failed to update group");
    
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
        const multicastData = await multicastResponse.json();
        if (!multicastResponse.ok) throw new Error(multicastData.error || "Failed to start multicast");
    
        console.log("Multicast started successfully:", multicastData);
        alert("🎉 Multicast started successfully!");
        // After successful multicast, re-fetch the tasks to update the active tasks section
        const taskResponse = await fetch("/api/tasks");
        const taskData = await taskResponse.json();
        setTasks(taskData.tasks || []);  // Update tasks to trigger re-render
      })
      .catch((error) => {
        console.error("Error during multicast process:", error.message);
        alert("❌ An unexpected error occurred.");
      });
  };
  
  const startUnicast = () => {

    if (!selectedGroup || !selectedImage || !selectedPrimaryDisk) {
      console.error("Please select group, image and disk before starting multicast");
      return;
    }

    const confirmUnicast= window.confirm(`Are you sure you want to start UNICAST for ${selectedGroup.name}?`);
    if (!confirmUnicast) return;

    if (groupSpecificTasks.length > 0) {
      const confirm = window.confirm(
        `⚠️ Warning: ${groupSpecificTasks.length} host(s) in this group already have active tasks. Do you want to continue?`
      );
      if (!confirm) return;
    }
  
    fetch("/api/groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateGroup",
        groupID: selectedGroup.id,
        imageID: selectedImage.id,
        kernelDevice: selectedPrimaryDisk,
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

        const taskResponse = await fetch("/api/tasks");
        const taskData = await taskResponse.json();
        setTasks(taskData.tasks || []);
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

    const confirmFastWipe= window.confirm(`Are you sure you want to start FAST WIPE for ${selectedGroup.name} in Disk ${selectedPrimaryDisk}?`);
    if (!confirmFastWipe) return;
  
    if (groupSpecificTasks.length > 0) {
      const confirm = window.confirm(
        `⚠️ Warning: ${groupSpecificTasks.length} host(s) in this group have active tasks. Do you want to continue?`
      );
      if (!confirm) return;
    }
  
    try {
      console.log("Starting Fast Wipe for", {
        groupID: selectedGroup?.id,
        disk: selectedPrimaryDisk,
      });
      // Step 1: Set the kernel device (== primary disk)
      const updateResponse = await fetch("/api/groups/prepareFastWipe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupID: selectedGroup.id,
          kernelDevice: selectedPrimaryDisk,
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
  
      // success
      console.log("Fast Wipe started successfully:", startData);
      alert("🎉 Fast Wipe started successfully!");
  
      const taskResponse = await fetch("/api/tasks");
      const taskData = await taskResponse.json();
      setTasks(taskData.tasks || []);
    } catch (error: any) {
      console.error("Fast Wipe error:", error.message || error);
      alert(`❌ Fast Wipe failed: ${error.message || "Unknown error"}`);
    }
  };
  
    
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Group Selector - Always Visible */}
        <Grid item xs={12}>
          <Card sx={{ border: '2px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Select a Group
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="group-select-label">Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  value={selectedGroup?.id ?? ""}
                  onChange={(e) => {
                    const group = groups.find((g) => g.id === Number(e.target.value));
                    setSelectedGroup(group ?? null);
                  }}
                  label="Group"
                >
                  {groups.map((group: any) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
  
        {/* Only render rest if group is selected */}
        {selectedGroup && (
          <>
            {/* Actions Panel */}
            <Grid item xs={12} md={4}>
              <Card>
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
                      <MenuItem value="1">Disk 1</MenuItem>
                      <MenuItem value="2">Disk 2</MenuItem>
                    </Select>
                  </FormControl>
  
                  {/* Action buttons */}
                  <Button
                    onClick={startMulticast}
                    variant="contained"
                    sx={{ mr: 1 }}
                    disabled={!selectedGroup || !selectedImage || !selectedPrimaryDisk}
                  >
                    Start Multicast
                  </Button>
                  <Button
                    onClick={startUnicast}
                    variant="contained"
                    color="secondary"
                    disabled={!selectedGroup || !selectedImage || !selectedPrimaryDisk}
                  >
                    Start Unicast
                  </Button>
                  <Button
                  onClick={startFastWipe}
                  variant="contained"
                  color="error"
                  disabled={!selectedGroup || !selectedPrimaryDisk}
                  sx={{ mt: 1 }}
                >
                  Fast Wipe
                </Button>
                </CardContent>
              </Card>
            </Grid>
  
            {/* Active Tasks */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Active Tasks in '{selectedGroup.name}'</Typography>
                  <Divider sx={{ my: 1 }} />
                  {groupSpecificTasks.length > 0 ? (
                    groupSpecificTasks.map((task: any) => (
                      <Box
                        key={task.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography>{task.host?.name || task.name}</Typography>
                        <Typography>{task.image?.name || "No image"}</Typography>
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
                    ))
                  ) : (
                    <Typography>No active tasks</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
  
            {/* Group Assignments */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Group Assignments</Typography>
                  <Divider sx={{ my: 1 }} />
                  {groupedTasks.length > 0 ? (
                    groupedTasks.map((task: any, index: number) => (
                      <Box key={index} display="flex" flexDirection="column" mb={2}>
                        <Typography>
                          <strong>Host:</strong> {task.hostName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Groups:</strong> {task.groups.join(", ")}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography>No group assignments</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};