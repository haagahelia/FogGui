"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    LinearProgress,
    TextField,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridToolbar,
} from "@mui/x-data-grid";

export default function Tasks() {
    const [data, setData] = useState<{ tasks: any[] }>({ tasks: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = useDummyData
                    ? "/dummyTaskData.json"
                    : "/api/tasks";
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch tasks: ${response.status} ${response.statusText}`
                    );
                }

                const jsonData = await response.json();

                if (!jsonData.tasks || !Array.isArray(jsonData.tasks)) {
                    console.error("Task data is not in expected format:", jsonData);
                    return;
                }

                setData(jsonData);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                alert("Failed to load tasks.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const rows = useMemo(() => {
        return data.tasks.map((task: any) => ({
            id: task.id,
            createdBy: task.createdBy,
            hostName: task.host?.name ?? "N/A",
            imageName: task.image?.name ?? "N/A",
            createdTime: task.createdTime,
            node: task.node ?? "N/A",
            status: task.state?.name ?? "N/A",
            progress: parseFloat(task.percent) || 0,
        }));
    }, [data]);

    const filteredRows = useMemo(() => {
        return rows.filter((row: any) =>
            Object.entries(filters).every(([key, value]) =>
                row[key]?.toString().toLowerCase().includes(value.toLowerCase())
            )
        );
    }, [rows, filters]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const columns: GridColDef[] = [
        {
            field: "createdBy",
            headerName: "Started By",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <FilterHeader
                    label="Started By"
                    value={filters.createdBy || ""}
                    onChange={(val) => handleFilterChange("createdBy", val)}
                />
            ),
        },
        {
            field: "hostName",
            headerName: "Hostname MAC",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <FilterHeader
                    label="Hostname MAC"
                    value={filters.hostName || ""}
                    onChange={(val) => handleFilterChange("hostName", val)}
                />
            ),
        },
        {
            field: "imageName",
            headerName: "Image Name",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <FilterHeader
                    label="Image Name"
                    value={filters.imageName || ""}
                    onChange={(val) => handleFilterChange("imageName", val)}
                />
            ),
        },
        {
            field: "createdTime",
            headerName: "Start Time",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <FilterHeader
                    label="Start Time"
                    value={filters.createdTime || ""}
                    onChange={(val) => handleFilterChange("createdTime", val)}
                />
            ),
        },
        {
            field: "node",
            headerName: "Working with Node",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <FilterHeader
                    label="Node"
                    value={filters.node || ""}
                    onChange={(val) => handleFilterChange("node", val)}
                />
            ),
        },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <FilterHeader
                    label="Status"
                    value={filters.status || ""}
                    onChange={(val) => handleFilterChange("status", val)}
                />
            ),
        },
        {
            field: "progress",
            headerName: "Progress",
            flex: 1,
            sortable: true,
            renderHeader: () => (
                <Typography variant="body2" fontWeight="bold">
                    Progress
                </Typography>
            ),
            renderCell: (params) => (
                <Box width="100%">
                    <LinearProgress
                        variant="determinate"
                        value={params.value}
                        sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography
                        variant="caption"
                        display="block"
                        textAlign="center"
                    >
                        {params.value}%
                    </Typography>
                </Box>
            ),
        },
    ];

    let content;

    if (loading) {
        content = <Typography variant="body1">Loading tasks...</Typography>;
    } else if (data.tasks.length > 0) {
        content = (
            <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 15, page: 0 } },
                        sorting: {
                            sortModel: [{ field: "createdTime", sort: "asc" }],
                        },
                    }}
                    pageSizeOptions={[5, 15, 20]}
                    disableRowSelectionOnClick
                    sortingOrder={["asc", "desc", null]}
                    slots={{ toolbar: GridToolbar }}
                />
            </Box>
        );
    } else {
        content = <Typography variant="body1">No tasks available.</Typography>;
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ border: "3px solid #ccc", padding: 5, borderRadius: 2 }}
        >
            <Typography variant="h4" gutterBottom>
                Tasks
            </Typography>

            {content}
        </Box>
    );
}

// Reusable component for filterable column headers
function FilterHeader({
                          label,
                          value,
                          onChange,
                      }: Readonly<{
    label: string;
    value: string;
    onChange: (val: string) => void;
}>) {
    return (
        <Box display="flex" flexDirection="column">
            <Typography variant="body2" fontWeight="bold">
                {label}
            </Typography>
            <TextField
                variant="standard"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Filter..."
                size="small"
            />
        </Box>
    );
}
 