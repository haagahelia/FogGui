"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";

const Dashboard = () => {

  const [data, setData] = useState<any>({ hosts: [] });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dummyData.json");
      const jsonData = await response.json();
      setData(jsonData);
      console.log(jsonData);
    };

    fetchData();
  }, []);

  const handleDelete = async (hostId: number) => {
    const confirmDelete = confirm(`Are you sure you want to delete host ${hostId}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/hosts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hostId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete host");
      }

      // Remove the deleted host from state
      setData((prevData: any) => ({
        hosts: prevData.hosts.filter((host: any) => host.id !== hostId),
      }));

      alert("Host deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Error deleting host.");
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
      <h1>Dashboard</h1>
      {data.hosts?.length > 0 ? (
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
                  <strong>MAC Address</strong>
                </TableCell>
                <TableCell>
                  <strong>Image</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.hosts.map((host: any) => (
                <TableRow key={host.id}>
                  <TableCell>{host.id}</TableCell>
                  <TableCell>{host.name}</TableCell>
                  <TableCell>{host.macs[0]}</TableCell>
                  <TableCell>{host.image.name}</TableCell>
                  <TableCell>{host.pingstatuscode}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(host.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No hosts available.</Typography>
      )}
    </Box>
  );
};

export default Dashboard;
