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

export default function Tasks() {
    const router = useRouter();

    const [data, setData] = useState<any>({ tasks: [] });

    const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true"; // Check if we should use dummy data

useEffect(() => { 
    const fetchData = async () => {
        try {
            // Determine the data source based on the environment variable
            const endpoint = useDummyData ? "/dummyTaskData.json" : "/api/tasks";  
            const response = await fetch(endpoint);

            // Check if the response is OK (status 200-299), otherwise throw an error
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
            }

            const jsonData = await response.json();

            // Ensure the response contains valid data before setting state
            if (!jsonData.tasks || !Array.isArray(jsonData.tasks)) {
                console.error("Invalid response structure:", jsonData);
                return;
            }

            setData(jsonData);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            alert("Failed to load tasks.");
        }
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
            <h1>Tasks</h1>
            {data.tasks?.length > 0 ? (
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Started By:</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Hostname
                                        MAC</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Image Name</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Start Time</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Working with node</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Status</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.tasks.map((task: any) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.createdBy}</TableCell>
                                    <TableCell>{task.host?.name}</TableCell>
                                    <TableCell>{task.image?.name}</TableCell>
                                    <TableCell>{task.createdTime}</TableCell>
                                    <TableCell>{task.node}</TableCell>
                                    <TableCell>{task.state?.name}</TableCell>
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
