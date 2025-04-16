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
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
// import CreateGroupDialog from "@/components/CreateGroupDialog"; // Import the new component
import { useRouter } from "next/navigation";

export default function Groups() {
  const [data, setData] = useState<any>({ groups: [] });
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [primaryDisk, setPrimaryDisk] = useState<string | null>(null);
 // const [dialogOpen, setDialogOpen] = useState(false);
  const [imageData, setImageData] = useState<any>({ images: [] });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  const router = useRouter();

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

  useEffect(() => {
          const fetchImageData = async () => {
            try {
              const endpoint = useDummyData ? "/dummyImageData.json" : "/api/images";
              const response = await fetch(endpoint);
        
  
              if (!response.ok) {
                throw new Error(`Failed to fetch images: ${response.statusText}`);
              }
  
              const jsonData = await response.json();
        
  
              if (!jsonData.images || !Array.isArray(jsonData.images)) {
                console.error("Image data is not in expected format:", jsonData);
                return;
              }
        
              setImageData(jsonData);

            } catch (error) {
              console.error("Error fetching images:", error);
              alert("Failed to load images.");
            }
          };
        
          fetchImageData();
        }, []);
  
 /* const handleCreateGroup = async (name: string, description: string) => {
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
  }; */

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group); // Store the whole group object
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedImage(null);
    setPrimaryDisk(null);
    setIsModalOpen(false);
  };

  const startMulticast = () => {
    if (!selectedGroup || !selectedGroup.id) {
      console.error("No group selected or missing ID.");
      return;
    }
  
  
    if (!primaryDisk || !selectedImage) {
      console.error("Please select both a primary disk and an image before starting multicast.");
      return;
    }
  
    fetch("/api/groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateGroup",
        groupID: selectedGroup.id,
        imageID: selectedImage,
        kernelDevice: primaryDisk,
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
        // Redirect
        router.push("/dashboard");
      })
      .catch((error) => {
        console.error("Error during multicast process:", error.message);
        alert("❌ An unexpected error occurred.");
      });
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
              To Multicast:
          </Typography>
          
            {/* Dropdown for selecting an image */}
            <FormControl fullWidth sx={{ marginTop: 3 }}>
              <InputLabel id="image-select-label">Select Image</InputLabel>
              <Select
                labelId="image-select-label"
                value={selectedImage || ""}
                onChange={(e) => setSelectedImage(e.target.value)}
                label="Choose Image"
              >
                {imageData.images.map((image: any) => (
                  <MenuItem key={image.id} value={image.id}>
                    {image.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Dropdown for selecting primary disk */}
            <FormControl fullWidth sx={{ marginTop: 3 }}>
              <InputLabel id="disk-select-label">Select Primary Disk</InputLabel>
              <Select
                labelId="disk-select-label"
                value={primaryDisk || ""}
                onChange={(e) => setPrimaryDisk(e.target.value)}
                label="Select Primary Disk"
              >

                <MenuItem value="1">Disk 1</MenuItem>
                <MenuItem value="2">Disk 2</MenuItem>
              </Select>
            </FormControl>

          <Button
            onClick={startMulticast}
              variant="contained"
              color="primary"
            sx={{ marginTop: 2 }}
            disabled={!selectedImage || !primaryDisk}
            >
              Start Multicast
            </Button>

            <Button onClick={handleModalClose} sx={{ marginTop: 2 }}>Close</Button>
          </Box>
        </Modal>

      {/*
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={() => setDialogOpen(true)}
      >
        Create New Group
      </Button>


      <CreateGroupDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreateGroup} />
    */}
    </Box>
  );
}
