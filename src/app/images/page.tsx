"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Modal,
    Button,
    TextField
} from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

export default function Images() {

    const [imageData, setImageData] = useState<any>({ images: [] });
    const [hostData, setHostData] = useState<any>({ hosts: [] });
    const [selectedImageID, setSelectedImageID] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Added filters state for sorting and filtering similar to Tasks page
    const [filters, setFilters] = useState<Record<string, string>>({});

    const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true"; // Check if we should use dummy data
  
    const router = useRouter();
  
    useEffect(() => {
      const fetchHostData = async () => {
        try {
          const endpoint = useDummyData ? "/dummyData.json" : "/api/hosts";
          const response = await fetch(endpoint);

          if (!response.ok) {
            throw new Error(`Failed to fetch hosts: ${response.statusText}`);
          }

          const jsonData = await response.json();

          if (!jsonData.data || !Array.isArray(jsonData.data)) {
            console.error("Host data is not in expected format:", jsonData);
            return;
          }

          setHostData({ hosts: jsonData.data });

          if (useDummyData) {
            console.log("Using dummy data");
          }
        } catch (error) {
          console.error("Error fetching hosts:", error);
          alert("Failed to load hosts.");
        }
      };

      fetchHostData();
    }, []);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Determine the data source based on the environment variable
          const endpoint = useDummyData ? "/dummyImageData.json" : "/api/images";
          const response = await fetch(endpoint);
      
          if (!response.ok) {
            throw new Error(`Failed to fetch images: ${response.statusText}`);
          }
      
          const jsonData = await response.json();
      
          if (!jsonData.data || !Array.isArray(jsonData.data)) {
            console.error("Image data is not in expected format:", jsonData);
            return;
          }

          console.log(jsonData.data);
      
          // Process each image in the images array
          const formattedImages = jsonData.data.map(formatImageData);
      
          // Set the state with the formatted images data
          setImageData({ images: formattedImages });
      
        } catch (error) {
          console.error("Error fetching images:", error);
          alert("Failed to load images.");
        }
      };
      
      fetchData();
    }, []);
      
    // Formating image data
    const formatImageData = (image: any) => {
        const formattedDate = formatDate(image.createdTime);
        const sizeGiB = formatSize(image.size);
        return { ...image, createdTime: formattedDate, sizeGiB };
    };

    // Formated date to DD-MM-YYYY
    const formatDate = (createdTime: string) => {
        const date = new Date(createdTime);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Formated size to GiB
    const formatSize = (size: string) => {
        const sizes = size.split(":").filter((s: string) => s !== "");
        const lastValue = sizes[sizes.length - 1] || "0";
        const sizeBytes = parseFloat(lastValue);
        return (sizeBytes / Math.pow(1024, 3)).toFixed(2);
    };

    const handleImageClick = (imageId: number) => {
        setSelectedImageID(imageId);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
    };

    const handleDeployClick = async (hostID: number, imageID: number) => {
        const confirmDeploy = window.confirm(`Are you sure you want to deploy image ${imageID} to host ${hostID}?`);
        if (!confirmDeploy) return;
    
        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ hostID, imageID }),
            });
    
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Deployment failed");
            }
    
          alert("Deployment started successfully.");
          // Redirect
          router.push("/dashboard");
            
        } catch (error) {
            console.error(error);
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    // Create rows for DataGrid from images data
    const rows = useMemo(() => {
      return imageData.images?.map((image: any) => ({
        id: image.id,
        name: image.name,
        sizeGiB: image.sizeGiB,
        createdTime: image.createdTime,
        // Include the whole image object if needed for future extensions
        original: image,
      })) || [];
    }, [imageData]);

    // Filter the rows using filters state
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

    // Define columns for DataGrid with filtering headers (without deleting any comments)
    const columns: GridColDef[] = [
      {
      field: "name",
      headerName: "Image Name",
      flex: 1,
      sortable: true,
      renderCell: ({ row }) => (
        <span
        onClick={() => handleImageClick(row.id)}
        style={{ cursor: "pointer", color: "blue" }}
        >
        {row.name} - {row.id}
        </span>
      ),
      renderHeader: () => (
        <FilterHeader
        label="Image Name"
        value={filters.name || ""}
        onChange={(val) => handleFilterChange("name", val)}
        />
      ),
      },
      {
      field: "sizeGiB",
      headerName: "Image Size: ON CLIENT",
      flex: 1,
      sortable: true,
      renderCell: ({ value }) => `${value} GiB`,
      renderHeader: () => (
        <FilterHeader
        label="Image Size: ON CLIENT"
        value={filters.sizeGiB || ""}
        onChange={(val) => handleFilterChange("sizeGiB", val)}
        />
      ),
      },
      {
      field: "createdTime",
      headerName: "Captured",
      flex: 1,
      sortable: true,
      renderHeader: () => (
        <FilterHeader
        label="Captured"
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
            <h1>All Images</h1>
            {imageData.images?.length > 0 ? (
                // Using DataGrid for sorting and filtering instead of Table
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
                <Typography variant="body1">No images available.</Typography>
            )}
            
            {/* Modal for deploying image to hosts */}
            <Modal
               open={isModalOpen}
               onClose={handleClose}
               sx={{
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
               }}
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
                   Hosts for Image ID: {selectedImageID}
                 </Typography>
                 <TableContainer component={Paper} className="table-container">
                   <Table>
                     <TableHead>
                       <TableRow>
                         <TableCell>
                           <strong>Host ID</strong>
                         </TableCell>
                         <TableCell>
                           <strong>Host Name</strong>
                         </TableCell>
                         <TableCell>
                           <strong>MAC Address</strong>
                         </TableCell>
                         <TableCell>
                           <strong>Actions</strong>
                         </TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {hostData.hosts.map((host: any) => (
                         <TableRow key={host.id}>
                           <TableCell>{host.id}</TableCell>
                           <TableCell>{host.name}</TableCell>
                           <TableCell>{host.primac}</TableCell>
                           <TableCell>
                           <Button 
                                onClick={() => {
                                  if (selectedImageID !== null) {
                                    handleDeployClick(host.id, selectedImageID);
                                  } else {
                                    console.error("selectedImageId is unexpectedly null");
                                  }
                                }}
                              >
                                Deploy
                              </Button>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
                 <Button onClick={handleClose} sx={{ marginTop: 2 }}>
                   Close
                 </Button>
                 </Box>
      </Modal>
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