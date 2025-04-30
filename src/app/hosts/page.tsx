"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
} from "@mui/material";
import HostModal from "../../components/HostModal";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

export default function Hosts() {
  const [data, setData] = useState<any>({ hosts: [] });
  const [openModal, setOpenModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true"; // Check if we should use dummy data

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Determine the data source based on the environment variable
        const endpoint = useDummyData ? "/dummyData.json" : "/api/hosts";
        const response = await fetch(endpoint);

        // Check if the response is OK (status 200-299), otherwise throw an error
        if (!response.ok) {
          throw new Error(`Failed to fetch hosts: ${response.status} ${response.statusText}`);
        }

        const jsonData = await response.json();

        // Ensure the response contains a valid 'hosts' array before setting state
        if (!jsonData.hosts || !Array.isArray(jsonData.hosts)) {
          console.error("Host data is not in expected format:", jsonData);
          return;
        }

        setData({ hosts: jsonData.hosts });
      } catch (error) {
        console.error("Error fetching hosts:", error);
        alert("Failed to load hosts.");
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (host: any) => {
    setSelectedHost(host);
    setOpenModal(true); 
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedHost(null);
  };

  const rows = useMemo(() => {
    return data.hosts?.map((host: any) => ({
      id: host.id,
      name: host.name,
      macAddress: host.macs ? host.macs[0] : "",
      image: host.image?.name || "",
      status: host.pingstatuscode,
      original: host, // include the full host data for the modal
    })) || [];
  }, [data]);

  const filteredRows = useMemo(() => {
    return rows.filter((row: { [key: string]: any }) =>
      Object.entries(filters).every(([key, value]) =>
        row[key]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
  }, [rows, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.5,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
          label="ID"
          value={filters.id || ""}
          onChange={(val) => handleFilterChange("id", val)}
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      sortable: true,
      renderCell: ({ row }) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal(row.original); // pass the original host object
          }}
          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
        >
          {row.name}
        </span>
      ),
      renderHeader: () => (
        <FilterHeader
          label="Name"
          value={filters.name || ""}
          onChange={(val) => handleFilterChange("name", val)}
        />
      ),
    },
    {
      field: "macAddress",
      headerName: "MAC Address",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
          label="MAC Address"
          value={filters.macAddress || ""}
          onChange={(val) => handleFilterChange("macAddress", val)}
        />
      ),
    },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
          label="Image"
          value={filters.image || ""}
          onChange={(val) => handleFilterChange("image", val)}
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
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ border: "3px solid #ccc", padding: 5, borderRadius: 2 }}
    >
      <h1>Hosts</h1>
      {data.hosts?.length > 0 ? (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 15, page: 0 } },
              sorting: { sortModel: [{ field: "id", sort: "asc" }] },
            }}
            pageSizeOptions={[5, 15, 20]}
            disableRowSelectionOnClick
            sortingOrder={["asc", "desc", null]}
            slots={{ toolbar: GridToolbar }}
          />
        </Box>
      ) : (
        <Typography variant="body1">No hosts available.</Typography>
      )}

      {/* HostModal Component */}
      {selectedHost && (
        <HostModal
          open={openModal}
          onClose={handleCloseModal}
          hosts={[selectedHost]}
        />
      )}
    </Box>
  );
}

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