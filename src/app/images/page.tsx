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
} from "@mui/material";

export default function Images() {

    const [data, setData] = useState<any>({ images: [] });
    
      useEffect(() => {
        const fetchData = async () => {
          const response = await fetch("/dummyImageData.json");
          const jsonData = await response.json();
      
          jsonData.images = jsonData.images.map((image: any) => {
            // Format the date
            const date = new Date(image.createdTime);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}-
                ${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

            // Format the image size
            const sizes = image.size.split(":").filter((s: string) => s !== "");
            const lastValue = sizes[sizes.length - 1] || "0";
            const sizeBytes = parseFloat(lastValue);
            const sizeGiB = (sizeBytes / Math.pow(1024, 3)).toFixed(2);
            
            return { ...image, createdTime: formattedDate, sizeGiB };
          });
      
          setData(jsonData);
          console.log(jsonData);
        };
      
        fetchData();
      }, []);

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
                                    <strong>Image Size:<br/>ON CLIENT</strong>
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
                                        <Link underline="none">
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
        </Box>
    );
}