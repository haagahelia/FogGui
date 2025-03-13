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
    Link,
    Modal,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";

export default function Images() {

    const [data, setData] = useState<any>({ images: [] });
    const [hostData, setHostData] = useState<any>({ hosts: [] });
    const [open, setOpen] = useState(false);  // Modal open/close state
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedHost, setSelectedHost] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/dummyImageData.json");
            const jsonData = await response.json();

            jsonData.images = jsonData.images.map(formatImageData);
            setData(jsonData);
            console.log(jsonData);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchHostData = async () => {
            const response = await fetch("/dummyData.json"); // real URL here
            const jsonHostData = await response.json();
            setHostData(jsonHostData);
            console.log(jsonHostData);
        };

        fetchHostData();
    }, []);

    // Formatting image data
    const formatImageData = (image: any) => {
        const formattedDate = formatDate(image.createdTime);
        const sizeGiB = formatSize(image.size);
        return { ...image, createdTime: formattedDate, sizeGiB };
    };

    // Formatted date to DD-MM-YYYY
    const formatDate = (createdTime: string) => {
        const date = new Date(createdTime);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Formatted size to GiB
    const formatSize = (size: string) => {
        const sizes = size.split(":").filter((s: string) => s !== "");
        const lastValue = sizes[sizes.length - 1] || "0";
        const sizeBytes = parseFloat(lastValue);
        return (sizeBytes / Math.pow(1024, 3)).toFixed(2);
    };

    const handleImageClick = (image: any) => {
        setSelectedImage(image);
        setOpen(true);  // Open modal
    };

    const handleCloseModal = () => {
        setOpen(false);  // Close modal
    };

    const handleDeploy = () => {
        if (selectedImage && selectedHost) {
            console.log(`Deploying image with ID: ${selectedImage.id} to host: ${selectedHost}`);
        }
        handleCloseModal();  // Close modal after action
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
            {data.images?.length > 0 ? (
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
                            {data.images.map((image: any) => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                        <Link
                                            underline="none"
                                            onClick={() => handleImageClick(image)}
                                        >
                                            <strong>{image.name} - {image.id}</strong>
                                        </Link>
                                        <Typography variant="body2">{image.imagetypename}</Typography>
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

            {/* Modal for Image Details */}
            <Modal
                open={open}
                onClose={handleCloseModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography id="modal-title" variant="h6" component="h2">
                        Image Details
                    </Typography>
                    {selectedImage && (
                        <Typography id="modal-description" sx={{ mt: 2 }}>
                            <strong>ID:</strong> {selectedImage.id} <br />
                            <strong>Name:</strong> {selectedImage.name} <br />
                        </Typography>
                    )}

                    {/* Select Host */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Host</InputLabel>
                        <Select
                            value={selectedHost}
                            label="Select Host"
                            onChange={(e) => setSelectedHost(e.target.value)}
                        >
                            {hostData.hosts?.map((host: any) => (
                                <MenuItem key={host.id} value={host.id}>
                                    {host.name} ({host.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button onClick={handleDeploy} sx={{ mt: 2 }}>
                        Deploy
                    </Button>
                    <Button onClick={handleCloseModal} sx={{ mt: 2, marginLeft: 2 }}>
                        Close
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
}
