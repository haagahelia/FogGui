"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    LinearProgress,
    TextField,
    Button
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridToolbar,
    GridRowParams,
} from "@mui/x-data-grid";
import { GRID_CHECKBOX_SELECTION_COL_DEF } from "@mui/x-data-grid";

// Main functional component for Tasks
export default function Tasks() {
    const [data, setData] = useState<{ tasks: any[] }>({ tasks: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedTasksId, setSelectedTasksId] = useState<number[]>([]);

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

    // Memoized rows for the table, mapped from the fetched task data
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

    // Filter the rows based on active filters
    const filteredRows = useMemo(() => {
        return rows.filter((row: any) =>
            Object.entries(filters).every(([key, value]) =>
                row[key]?.toString().toLowerCase().includes(value.toLowerCase())
            )
        );
    }, [rows, filters]);

    // Update filters when the user types something in filter fields
    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    // Color the progress bar based on task status
    const coloringBar = (status: string) => {
        switch (status) {
            case "Complete":
                return "#4caf50";
            case "In-Progress":
                return "#2196f3";
            case "Cancelled":
                return "#f44336";
            case "Queued":
                return "#ff9800";
            default:
                return "#9e9e9e";
        }
    };

    // Columns for the DataGrid
    const columns: GridColDef[] = [
        { ...GRID_CHECKBOX_SELECTION_COL_DEF }, // Checkbox column
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
            renderCell: (params) => {
                const statusColor = coloringBar(params.row.status);

                return (
                    <Box width="100%">
                        <LinearProgress
                            variant="determinate"
                            value={params.value}
                            sx={{
                                height: 8,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "transparent",
                                [`& .MuiLinearProgress-bar`]: {
                                    backgroundColor: statusColor,
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            display="block"
                            textAlign="center"
                        >
                            {params.value}%
                        </Typography>
                    </Box>
                );
            },
        },
    ];

    // Define which rows can be selected
    const isRowSelectable = (params: GridRowParams<any>) => {
        return params.row.status === "In-Progress" || params.row.status === "Queued";
    };

    // Add the class for each row to conditionally show or hide checkboxes
    const getRowClass = (params: GridRowParams) => {
        return isRowSelectable(params) ? 'selectable-row' : 'non-selectable-row';
    };

    const handleCancelTasks = async () => {

        if (selectedTasksId.length === 0) return alert("No tasks selected");

        const confirmed = window.confirm("Are you sure you want to cancel the selected task(s)?");

        if (!confirmed) return alert("No tasks were canceled.");

        try {

            const response = await fetch("/api/tasks", {

                method: "PUT",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ taskIds: selectedTasksId }), // send all at once

            });

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            alert(`Cancelled ${selectedTasksId.length} task(s).`);

        } catch (error: any) {

            alert("Failed to cancel tasks: " + error.message);

        }

    };


    let content;

    if (loading) {
        content = <Typography variant="body1">Loading tasks...</Typography>;
    } else if (data.tasks.length > 0) {
        content = (
            <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid
                    checkboxSelection
                    isRowSelectable={isRowSelectable}
                    onRowSelectionModelChange={(ids) => setSelectedTasksId(ids as number[])
                    }
                    rows={filteredRows}
                   //onClick={console.log(selectedTasksId)}
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
                    getRowClassName={getRowClass} // Apply the class to hide checkboxes for non-selectable rows
                    sx={{
                        '& .non-selectable-row .MuiDataGrid-cellCheckbox': {
                            visibility: 'hidden', // Hide the checkbox for non-selectable rows
                        },
                    }}
                />
            </Box>
        );
    } else {
        content = <Typography variant="body1">No tasks available.</Typography>;
    }

    return (
        <><Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{border: "3px solid #ccc", padding: 5, borderRadius: 2}}
        >
            <Typography variant="h4" gutterBottom>
                Tasks
            </Typography>

            {content}
            <Button variant="outlined"  onClick={handleCancelTasks} sx={{
                mt: 2.5,
                color: "red",
                borderColor: "red",
                "&:hover": {
                    backgroundColor: "red",
                    borderColor: "red",
                    color: "black"
                },
            }}>Cancel selected tasks</Button>
        </Box>
        </>

);
}

// Filter header component for each column's filter input
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
