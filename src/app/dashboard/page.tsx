"use client";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No hosts available.</Typography>
      )}
      <Button className="button-primary" onClick={() => router.push("/")}>Logout</Button>
    </Box>
  );
};

export default Dashboard;
