"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Box,
  Button,
  Modal,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
// import CreateGroupDialog from "@/components/CreateGroupDialog"; // Import the new component
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Group } from "@/types/group";
import { Image } from "@/types/image";
import { Groupassociation } from "@/types/groupassociation";
import { useActiveTasks } from "../dashboard/hooks/useActiveTasks";

export default function Groups() {
  const [data, setData] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [primaryDisk, setPrimaryDisk] = useState<string | null>(null);
  // const [dialogOpen, setDialogOpen] = useState(false);
  const [imageData, setImageData] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [groupAssociations, setGroupAssociations] = useState<Groupassociation[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  const disk1value = process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_1;
  const disk2value = process.env.NEXT_PUBLIC_PRIMARY_DISK_VALUE_2;

  const [refreshTasks, setRefreshTasks] = useState(false);

  // Get host IDs that are part of the selected group
  const groupHostIds = useMemo(() =>
    selectedGroup
      ? groupAssociations.filter(a => a.groupID === selectedGroup.id).map(a => a.hostID)
      : [],
    [selectedGroup, groupAssociations]);

  const activeTasks = useActiveTasks(groupHostIds, refreshTasks);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assocEndpoint = useDummyData ? "/dummyGroupAssociation.json" : "/api/groupassociations";
        const groupEndpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        const imageEndpoint = useDummyData ? "/dummyImageData.json" : "/api/images";

        const [groupAssocResponse, groupResponse, imageResponse] = await Promise.all([
          fetch(assocEndpoint),
          fetch(groupEndpoint),
          fetch(imageEndpoint),
        ]);

        if (!groupAssocResponse.ok || !groupResponse.ok || !imageResponse.ok) {
          throw new Error("One or more fetches failed");
        }

        const groupAssocData = await groupAssocResponse.json();
        const groupData = await groupResponse.json();
        const imageData = await imageResponse.json();

        // Optional: Format dates
        const formattedGroups = (groupData.data || []).map((group: Group) => {
          if (!group.createdTime) return group;
          const date = new Date(group.createdTime);
          const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${date.getFullYear()}`;
          return { ...group, createdTime: formattedDate };
        });

        setGroupAssociations(groupAssocData.data || []);
        setData(formattedGroups);
        setImageData(imageData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data.");
      };
    }
    fetchData();
  }, []);


  /* const handleCreateGroup = async (name: string, description: string) => {
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({
          action: "createGroup",
          name: (name),
          description: (description)
        }),
        headers: { "Content-Type": "application/json" }
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create group: ${response.statusText}`);
      }
  
      const newGroup = await response.json();
      setData((prevData: any) => ({
        groups: [...prevData.groups, newGroup],
      }));
  
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group.");
    }
  }; */

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group); // Store the whole group object
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedImage(null);
    setPrimaryDisk(null);
    setIsModalOpen(false);
  };

  const startMulticast = async () => {
    if (!selectedGroup || !selectedImage || !primaryDisk || !groupHostIds?.length) {
      console.error("Please select group, image and disk before starting multicast");
      return;
    }

    const confirmMulticast = window.confirm(
      `Are you sure you want to start MULTICAST session for ${selectedGroup.name}?`
    );
    if (!confirmMulticast) return;

    if (activeTasks.length > 0) {
      const confirm = window.alert(
        `⚠️ Warning: ${activeTasks.length} host(s) in this group already have active tasks. Please wait for them to finish or cancel the tasks first.`
      );
      return;
    }

    try {

      const updateHosts = groupHostIds.map(async (hostID) => {
        const response = await fetch("api/hosts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostID: hostID,
            imageID: selectedImage?.id,
            kernelDevice: primaryDisk
          })
        })
        const text = await response.text();
        let updateData;
        try {
          updateData = JSON.parse(text);
        } catch {
          throw new Error(`Update host failed with non-JSON response: ${text}`);
        }

        if (!response.ok)
          throw new Error(updateData.error || "Failed to update host ");

      });

      await Promise.all(updateHosts);

      const groupResponse = await fetch("/api/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupID: selectedGroup.id,
          imageID: selectedImage.id,
          kernelDevice: primaryDisk,
          hostIDs: groupHostIds,
        }),
      })
      const text = await groupResponse.text();
      let updateData;
      try {
        updateData = JSON.parse(text);
      } catch {
        throw new Error(`Update group failed with non-JSON response: ${text}`);
      }

      if (!groupResponse.ok)
        throw new Error(updateData.error || "Failed to update group");

      const multicastResponse = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startMulticast",
          groupID: selectedGroup.id,
          taskTypeID: "8",
          name: `Multicast for ${selectedGroup.name}`,
        }),
      });

      const multiCastText = await multicastResponse.text();
      let multicastData;
      try {
        multicastData = JSON.parse(multiCastText);
      } catch {
        throw new Error(`Multicast start failed with non-JSON response: ${text}`);
      }

      if (!multicastResponse.ok)
        throw new Error(multicastData.error || "Failed to start multicast");

      console.log("Multicast started successfully:", multicastData);
      alert("🎉 Multicast started successfully!");
      // 👇 This triggers a task refresh
      setRefreshTasks(prev => !prev);
    } catch (error: unknown) {
      let message = "Unknown error";
      if (error instanceof Error) message = error.message;
      else if (typeof error === "string") message = error;

      console.error("Error during multicast process:", message);
      alert(`❌ An unexpected error occurred: ${message}`);
    };
  };


  // Create rows for DataGrid from groups data
  const rows = useMemo(() => {
    return (data || []).map((group: Group) => ({
      id: group.id,
      name: group.name,
      hostcount: group.members ?? 0,
      createdBy: group.createdBy ?? "Unknown",
      createdTime: group.createdTime ?? "-",
    }));
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
          onClick={() => handleGroupClick(row)}
          style={{ cursor: "pointer", color: "blue" }}
        >
          {row.name} - {row.id}
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
      field: "hostcount",
      headerName: "Host Count",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
          label="Host Count"
          value={filters.hostcount || ""}
          onChange={(val) => handleFilterChange("hostcount", val)}
        />
      ),
    },
    {
      field: "createdBy",
      headerName: "Created By",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
          label="Created By"
          value={filters.createdBy || ""}
          onChange={(val) => handleFilterChange("createdBy", val)}
        />
      ),
    },
    {
      field: "createdTime",
      headerName: "Created Time",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
          label="Created Time"
          value={filters.createdTime || ""}
          onChange={(val) => handleFilterChange("createdTime", val)}
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
      <h1>Groups</h1>
      {data?.length > 0 ? (
        // Using DataGrid for sorting and filtering
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
        <Typography variant="body1">No groups available.</Typography>
      )}
      {/* Modal for Group Details */}
      <Modal
        open={isModalOpen}
        onClose={handleModalClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            textAlign: "center",
            maxWidth: 600,
            width: "80%",
          }}
        >
          <Typography variant="h6">
            {selectedGroup && selectedGroup.name ? selectedGroup.name : ""}
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            To Multicast:
          </Typography>

          {/* Dropdown for selecting an image */}
          <FormControl fullWidth sx={{ marginTop: 3 }}>
            <InputLabel id="image-select-label">Select Image</InputLabel>
            <Select
              labelId="image-select-label"
              value={selectedImage?.id || ""}
              onChange={(e) => {
                const selected = imageData.find(img => img.id === Number(e.target.value));
                setSelectedImage(selected || null);
              }}
              label="Choose Image"
            >
              {imageData.map((image: Image) => (
                <MenuItem key={image.id} value={image.id}>
                  {image.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dropdown for selecting primary disk */}
          <FormControl fullWidth sx={{ marginTop: 3 }}>
            <InputLabel id="disk-select-label">Select Primary Disk</InputLabel>
            <Select
              labelId="disk-select-label"
              value={primaryDisk || ""}
              onChange={(e) => setPrimaryDisk(e.target.value)}
              label="Select Primary Disk"
            >
              <MenuItem value={disk1value}>Disk 1 {disk1value}</MenuItem>
              <MenuItem value={disk2value}>Disk 2 {disk2value}</MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={startMulticast}
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            disabled={!selectedImage || !primaryDisk}
          >
            Start Multicast
          </Button>

          <Button onClick={handleModalClose} sx={{ marginTop: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>

      {/*
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={() => setDialogOpen(true)}
      >
        Create New Group
      </Button>
  
  
      <CreateGroupDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreateGroup} />
      */}
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