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
  Button
} from "@mui/material";
import CreateGroupDialog from "@/components/CreateGroupDialog"; // Import the new component

export default function Groups() {

  const [data, setData] = useState<any>({ groups: [] });
  const [dialogOpen, setDialogOpen] = useState(false);

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        const response = await fetch(endpoint);
  
        if (!response.ok) {
          throw new Error(`Failed to fetch groups: ${response.statusText}`);
        }
  
        const jsonData = await response.json();
  
        if (!jsonData.groups || !Array.isArray(jsonData.groups)) {
          console.error("Group data is not in expected format:", jsonData);
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
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Host Count</strong>
                </TableCell>
                <TableCell>
                  <strong>Created By</strong>
                </TableCell>
                <TableCell>
                  <strong>Created Time</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {data.groups.map((group: any) => (
                    <TableRow key={group.id}>
                        <TableCell>{group.id}</TableCell>
                        <TableCell>{group.name}</TableCell>
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
};
