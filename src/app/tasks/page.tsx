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

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/dummyTaskData.json");
            const jsonData = await response.json();

            jsonData.tasks = jsonData.tasks.map((task: any) => {
                const date = new Date(task.createdTime);
                const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
                return { ...task, createdTime: formattedDate };
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
                                    <TableCell>{task.scheduledStartTime}</TableCell>
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
