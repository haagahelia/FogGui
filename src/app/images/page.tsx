"use client";
import React, { useEffect, useState } from "react";
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
    Button
} from "@mui/material";

export default function Images() {

    const [imageData, setImageData] = useState<any>({ images: [] });
    const [hostData, setHostData] = useState<any>({ hosts: [] });
    const [selectedImageID, setSelectedImageID] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchHostData = async () => {
          try {
            // Using dummy data for now (GitHub version)
            const response = await fetch("/dummyData.json");
            const jsonData = await response.json();
            setHostData(jsonData);
            console.log("Using dummy data:", jsonData);
    
            // Uncomment this and remove above stuff when using the real API
            /*
            const response = await fetch("/api/hosts");
            if (!response.ok) {
              throw new Error(Failed to fetch hosts: ${response.statusText});
            }
    
            const jsonData = await response.json();
            setHostData({ hosts: jsonData.hosts });
            */
          } catch (error) {
            console.error("Error fetching hosts:", error);
            alert("Failed to load hosts.");
          }
        };
    
        fetchHostData();
      }, []);


    useEffect(() => {
        const fetchImageData = async () => {
          try {
            // Using dummy data for now (GitHub version)
            const response = await fetch("/dummyImageData.json");
              const jsonData = await response.json();
              const imageJSONData = jsonData.map(formatImageData)
            setImageData(imageJSONData);
            console.log("Using dummy data:", imageJSONData);
    
            // Uncomment this and remove above stuff when using the real API
            /*
            const response = await fetch("/api/images");
            if (!response.ok) {
              throw new Error(Failed to fetch images: ${response.statusText});
            }
    
            const jsonData = await response.json();
            jsonData.images = jsonData.images.map(formatImageData);
            setImageData({ images: jsonData.images });
            */
          } catch (error) {
            console.error("Error fetching images:", error);
            alert("Failed to load images.");
          }
        };
    
        fetchImageData();
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
            // Using dummy data for now (GitHub version)
            alert(`Deploying image ${imageID} to host ${hostID}`);
            
            // Uncomment this and remove above stuff when using the real API
            /*
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
            */
        } catch (error) {
            console.error(error);
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

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
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Image Name</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Storage Group</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Image Size:<br />ON CLIENT</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Captured</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {imageData.images.map((image: any) => (
                                <TableRow key={image.id}>
                                <TableCell
                                    onClick={() => handleImageClick(image.id)}
                                    style={{ cursor: "pointer", color: "blue" }}
                                    >
                                    {image.name} - {image.id}
                                    </TableCell>
                                    <TableCell>{image.storagegroupname}</TableCell>
                                    <TableCell>{image.sizeGiB} GiB</TableCell>
                                    <TableCell>{image.createdTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
            ) : (
                <Typography variant="body1">No images available.</Typography>
            )}

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
                           <TableCell>{host.macs[0]}</TableCell>
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