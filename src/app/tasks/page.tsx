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
    LinearProgress
} from "@mui/material";

export default function Tasks() {
    const router = useRouter();
    const [data, setData] = useState<any>({ tasks: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/dummyTaskData.json");
                if (!response.ok) throw new Error("Failed to load tasks");
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const getProgress = (status: string | undefined) => {
        if (!status) return 0;
        switch (status.toLowerCase()) {
            case "queued":
                return 20;
            case "pending":
                return 10;
            case "in progress":
                return 50;
            case "almost done":
                return 80;
            case "complete":
            case "completed":
                return 100;
            case "cancelled":
                return 0; // No progress for cancelled tasks
            default:
                return 0;
        }
    };

    const getProgressColor = (progress: number, status: string) => {
        if (status === "In-Progress" && (progress < 50 || progress > 50)) return "primary";
        if (progress === 0) return "error";
        if (progress < 50) return "warning";
        return "success";
    };

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
                <TableContainer component={Paper} sx={{ maxWidth: "80%" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Started By</strong></TableCell>
                                <TableCell><strong>Hostname MAC</strong></TableCell>
                                <TableCell><strong>Image Name</strong></TableCell>
                                <TableCell><strong>Start Time</strong></TableCell>
                                <TableCell><strong>Working with Node</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.tasks.map((task: any) => {
                                const status = task.state?.name || "";
                                const progress = getProgress(status);

                                return (
                                    <React.Fragment key={task.id}>
                                        <TableRow>
                                            <TableCell>{task.createdBy}</TableCell>
                                            <TableCell>{task.host?.name}</TableCell>
                                            <TableCell>{task.image?.name}</TableCell>
                                            <TableCell>{task.createdTime}</TableCell>
                                            <TableCell>{task.node}</TableCell>
                                            <TableCell>{status}</TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={task.percent}
                                                    color={getProgressColor(progress, status)}
                                                    sx={{ height: 8, borderRadius: 5, marginBottom: 1 }}
                                                />
                                                <Typography variant="caption" display="block" textAlign="center">
                                                    {task.percent}%
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1">No tasks available.</Typography>
            )}
            <Button className="button-primary" onClick={() => router.push("/dashboard")} sx={{ marginTop: 3 }}>
                Back
            </Button>
        </Box>
    );
}
