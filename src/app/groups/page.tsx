"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Modal,
  MenuItem,
  Select
} from "@mui/material";
import CreateGroupDialog from "@/components/CreateGroupDialog"; // Import the new component

export default function Groups() {
  const [data, setData] = useState<any>({ groups: [] });
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [primaryDisk, setPrimaryDisk] = useState("Disk 1");
  const [dialogOpen, setDialogOpen] = useState(false);

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        const response = await fetch(endpoint);
  
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
  
        const jsonData = await response.json();
  
        if (!jsonData.groups || !Array.isArray(jsonData.groups)) {
          console.error("Groups data is missing:", jsonData);
          return;
        }
  
        jsonData.groups = jsonData.groups.map((group: any) => {
          const date = new Date(group.createdTime);
          const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
          return { ...group, createdTime: formattedDate };
        });
  
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Failed to load groups.");
      }
    };
  
    fetchData();
  }, []);
  
  const handleCreateGroup = async (name: string, description: string) => {
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({
          action: "createGroup",
          name: (name),
          description: (description)
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Failed to create group: ${response.statusText}`);
      }

      const newGroup = await response.json();
      setData((prevData: any) => ({
        groups: [...prevData.groups, newGroup],
      }));

      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  };

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group); // Store the whole group object
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const startMulticast = () => {
    if (!selectedGroup || !selectedGroup.id) {
      console.error("No group selected or missing ID.");
      return;
    }
  
    fetch("/api/groups", {
      method: "POST",
      body: JSON.stringify({
        action: "startMulticast",
        groupID: selectedGroup.id,  // Get ID from selectedGroup
        taskTypeID: "8",
        name: `Multicast for ${selectedGroup.name}`,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to start multicast");
        console.log("Multicast started successfully:", data);
      })
      .catch((error) => console.error("Error starting multicast:", error.message));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ border: "3px solid #ccc", padding: 5, borderRadius: 2 }}
    >
      <h1>Groups</h1>
      {data.groups?.length > 0 ? (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Host Count</strong></TableCell>
                <TableCell><strong>Created By</strong></TableCell>
                <TableCell><strong>Created Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.groups.map((group: any) => (
                <TableRow key={group.id}>
                  <TableCell>{group.id}</TableCell>
                  <TableCell
                    onClick={() => handleGroupClick(group)}
                    style={{ cursor: "pointer", color: "blue" }}
                  >
                    {group.name} - {group.id}
                  </TableCell>
                  <TableCell>{group.hostcount}</TableCell>
                  <TableCell>{group.createdBy}</TableCell>
                  <TableCell>{group.createdTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No groups available.</Typography>
      )}
      {/* Modal for Group Details */}
      <Modal
          open={isModalOpen}
          onClose={handleModalClose}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              padding: 4,
              borderRadius: 2,
              boxShadow: 24,
              textAlign: "center",
              maxWidth: 600,
              width: "80%",
            }}
          >
          <Typography variant="h6">
              {selectedGroup && selectedGroup.name ? selectedGroup.name : ""}
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              Assigned Image: <strong>(Placeholder - Fetch Later)</strong>
            </Typography>

            <Typography variant="body1" sx={{ marginTop: 2 }}>Select Primary Disk:</Typography>
            <Select
              value={primaryDisk}
              onChange={(e) => setPrimaryDisk(e.target.value)}
              fullWidth
              sx={{ marginTop: 1 }}
            >
              <MenuItem value="Disk 1 (Windows)">Disk 1</MenuItem>
              <MenuItem value="Disk 2 (Linux)">Disk 2</MenuItem>
            </Select>

          <Button
            onClick={startMulticast}
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
            >
              Start Multicast
            </Button>

            <Button onClick={handleModalClose} sx={{ marginTop: 2 }}>Close</Button>
          </Box>
        </Modal>

      {/* Create Group Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={() => setDialogOpen(true)}
      >
        Create New Group
      </Button>

      {/* Create Group Dialog */}
      <CreateGroupDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreateGroup} />
    </Box>
  );
}
