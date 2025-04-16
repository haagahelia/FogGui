"use client"
import { useEffect, useState } from "react"
import { Box, LinearProgress, Typography, TextField, InputAdornment, IconButton } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"

interface Task {
    id: number
    createdBy?: string
    hostname?: string
    imageName?: string
    createdTime?: string
    node?: string
    status?: string
    percent: number
    [key: string]: any
}

export default function Tasks() {
    const [data, setData] = useState<{ tasks: Task[] }>({ tasks: [] })
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [filters, setFilters] = useState({
        createdBy: "",
        hostname: "",
        imageName: "",
        createdTime: "",
        node: "",
        status: "",
    })

    const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true"

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const endpoint = useDummyData ? "/dummyTaskData.json" : "/api/tasks"
                const response = await fetch(endpoint)

                if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`)

                const jsonData = await response.json()

                const processedTasks = jsonData.tasks.map((task: any, index: number) => ({
                    id: index,
                    ...task,
                    percent: task.percent || 0,
                    status: task.state?.name || "",
                    hostname: task.host?.name || task.hostname || "",
                    imageName: task.image?.name || task.imageName || "",
                }))

                setData({ tasks: processedTasks })
                setFilteredTasks(processedTasks)
            } catch (error) {
                console.error("Error fetching tasks:", error)
                alert("Failed to load tasks.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [useDummyData])

    useEffect(() => {
        const filtered = data.tasks.filter((task) => {
            return (
                (task.createdBy || "").toLowerCase().includes(filters.createdBy.toLowerCase()) &&
                (task.hostname || "").toLowerCase().includes(filters.hostname.toLowerCase()) &&
                (task.imageName || "").toLowerCase().includes(filters.imageName.toLowerCase()) &&
                (task.createdTime || "").toLowerCase().includes(filters.createdTime.toLowerCase()) &&
                (task.node || "").toLowerCase().includes(filters.node.toLowerCase()) &&
                (task.status || "").toLowerCase().includes(filters.status.toLowerCase())
            )
        })
        setFilteredTasks(filtered)
    }, [filters, data.tasks])

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    // Create interleaved rows with tasks and progress bars
    const rows = filteredTasks.flatMap((task, index) => [
        // Regular task row
        { ...task, isProgressRow: false },
        // Progress row (with unique ID)
        {
            id: `progress-${task.id}`,
            percent: task.percent,
            isProgressRow: true,
            parentId: task.id,
        },
    ])

    const columns: GridColDef[] = [
        {
            field: "createdBy",
            headerName: "Created By",
            flex: 1,
            renderCell: (params) => {
                // For progress rows, render progress bar that spans all columns
                if (params.row.isProgressRow) {
                    return (
                        <Box
                            sx={{
                                width: "100%",
                                gridColumn: "1/-1",
                                position: "absolute",
                                left: 0,
                                right: 0,
                                padding: "0 16px",
                            }}
                        >
                            <LinearProgress variant="determinate" value={params.row.percent} sx={{ height: 8, borderRadius: 5 }} />
                            <Typography variant="caption" display="block" textAlign="center">
                                {`${params.row.percent}%`}
                            </Typography>
                        </Box>
                    )
                }
                // For regular rows, just show the value
                return params.value
            },
        },
        {
            field: "hostname",
            headerName: "Hostname",
            flex: 1,
            renderCell: (params) => (params.row.isProgressRow ? null : params.value),
        },
        {
            field: "imageName",
            headerName: "Image Name",
            flex: 1,
            renderCell: (params) => (params.row.isProgressRow ? null : params.value),
        },
        {
            field: "createdTime",
            headerName: "Created Time",
            flex: 1,
            renderCell: (params) => (params.row.isProgressRow ? null : params.value),
        },
        {
            field: "node",
            headerName: "Node",
            flex: 1,
            renderCell: (params) => (params.row.isProgressRow ? null : params.value),
        },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (params.row.isProgressRow ? null : params.value),
        },
    ]

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

            {/* Filters */}
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                {Object.keys(filters).map((key) => (
                    <TextField
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        variant="outlined"
                        size="small"
                        value={(filters as any)[key]}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                ))}
            </Box>

            {/* DataGrid */}
            <Box width="100%" height={600}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    disableRowSelectionOnClick
                    autoHeight
                    getRowId={(row) => row.id}
                    getRowHeight={(params) => {
                        // Make progress rows shorter
                        return params.model.isProgressRow ? 40 : 52
                    }}
                    sx={{
                        "& .MuiDataGrid-cell": {
                            alignItems: "center",
                        },
                        // Style for progress rows
                        "& .MuiDataGrid-row:nth-of-type(even)": {
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                        // Make progress bar span across all cells
                        "& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell:first-of-type": {
                            overflow: "visible",
                        },
                        // Hide cell borders in progress rows
                        "& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell": {
                            borderBottom: "none",
                        },
                    }}
                    hideFooter
                />
            </Box>
        </Box>
    )
}
