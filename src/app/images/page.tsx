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
    InputLabel,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";

export default function Images() {
    const [data, setData] = useState<{ images: any[] }>({ images: [] });
    const [hostData, setHostData] = useState<{ hosts: any[] }>({ hosts: [] });
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [selectedHost, setSelectedHost] = useState<any>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info",
    });

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/dummyImageData.json");
            const jsonData = await response.json();
            jsonData.images = jsonData.images.map(formatImageData);
            setData(jsonData);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchHostData = async () => {
            const response = await fetch("/dummyData.json"); // real URL here
            const jsonHostData = await response.json();
            setHostData(jsonHostData);
        };

        fetchHostData();
    }, []);

    const formatImageData = (image: any) => {
        return {
            ...image,
            createdTime: formatDate(image.createdTime),
            sizeGiB: formatSize(image.size),
        };
    };

    const formatDate = (createdTime: string) => {
        const date = new Date(createdTime);
        return `${String(date.getDate()).padStart(2, "0")}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${date.getFullYear()}`;
    };

    const formatSize = (size: string) => {
        const sizes = size.split(":").filter((s: string) => s !== "");
        const lastValue = sizes[sizes.length - 1] || "0";
        const sizeBytes = parseFloat(lastValue);
        return (sizeBytes / Math.pow(1024, 3)).toFixed(2);
    };

    const handleImageClick = (image: any) => {
        setSelectedImage(image);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
    };

    const handleDeploy = async () => {
        if (!selectedHost) {
            setNotification({ open: true, message: "Please select a host!", severity: "error" });
            return;
        }

        setIsDeploying(true); // Show loading state

        try {
            const response = await fetch("/api/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageId: selectedImage.id,
                    hostId: selectedHost.id,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setNotification({ open: true, message: "Image deployed successfully!", severity: "success" });
                setSelectedImage(null);
                setSelectedHost(null);
                setOpen(false);
            } else {
                setNotification({ open: true, message: `Deployment failed: ${result.error || "Unknown error"}`, severity: "error" });
            }
        } catch (error: any) {
            setNotification({ open: true, message: `Error deploying image: ${error.message || error}`, severity: "error" });
        }

        setIsDeploying(false); // Remove loading state
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ border: "3px solid #ccc", padding: 5, borderRadius: 2 }}>
            <h1>All Images</h1>
            {data.images.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Image Name</strong></TableCell>
                                <TableCell><strong>Storage Group</strong></TableCell>
                                <TableCell><strong>Image Size:<br />ON CLIENT</strong></TableCell>
                                <TableCell><strong>Captured</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.images.map((image) => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                        <Link underline="none" onClick={() => handleImageClick(image)}>
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
            <Modal open={open} onClose={handleCloseModal} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                    <Typography id="modal-title" variant="h6">Image Details</Typography>
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
                            value={selectedHost ? selectedHost.id : ""}
                            label="Select Host"
                            onChange={(e) => {
                                const selected = hostData.hosts.find((host) => host.id === e.target.value);
                                setSelectedHost(selected);
                            }}
                        >
                            {hostData.hosts.map((host) => (
                                <MenuItem key={host.id} value={host.id}>
                                    {host.name} ({host.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button onClick={handleDeploy} sx={{ mt: 2 }} disabled={isDeploying}>
                        {isDeploying ? <CircularProgress size={24} /> : "Deploy"}
                    </Button>
                    <Button onClick={handleCloseModal} sx={{ mt: 2, marginLeft: 2 }} disabled={isDeploying}>
                        Close
                    </Button>
                </Box>
            </Modal>

            {/* Notification Snackbar */}
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
