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

export default function Groups() {
  const router = useRouter();

  const [data, setData] = useState<any>({ groups: [] });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dummyGroupData.json");
      const jsonData = await response.json();
  
      jsonData.groups = jsonData.groups.map((group: any) => {
        const date = new Date(group.createdTime);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
        return { ...group, createdTime: formattedDate };
      });
  
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
      <Button className="button-primary" onClick={() => router.push("/dashboard")}>
        Back
      </Button>
    </Box>
  );
};
