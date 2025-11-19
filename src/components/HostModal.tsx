import React, { useEffect, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Button,
} from "@mui/material";

interface Host {
    id: number;
    name: string;
    imagename: string;
    primac: string;
    description: string;
}

interface Group {
    id: number;
    name: string;
}

interface GroupAssociation {
    hostID: number;
    groupID: number;
}

interface HostModalProps {
    open: boolean;
    onClose: () => void;
    hosts: Host[];
}

const HostModal: React.FC<HostModalProps> = ({ open, onClose, hosts }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [groupAssociations, setGroupAssociations] = useState<GroupAssociation[]>([]);
    const [hostGroups, setHostGroups] = useState<string[]>([]);

    const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
              const groupEndpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
              const assocEndpoint = useDummyData ? "/dummyGroupAssociation.json" : "/api/groupassociations";
          
              const [groupResponse, groupAssocResponse] = await Promise.all([
                fetch(groupEndpoint),
                fetch(assocEndpoint),
              ]);

                const groupJson = await groupResponse.json();
                const groupAssocJson = await groupAssocResponse.json();

                setGroups(groupJson.data);
                setGroupAssociations(groupAssocJson.data);

                if (hosts.length > 0) {
                    const associatedGroups = groupAssocJson.data
                        .filter((assoc: GroupAssociation) => assoc.hostID === hosts[0].id)
                        .map((assoc: GroupAssociation) => {
                            const group = groupJson.data.find((g: Group) => g.id === assoc.groupID);
                            return group ? group.name : "Unknown Group";
                        });

                    setHostGroups(associatedGroups.length > 0 ? associatedGroups : ["No groups assigned"]);
                }
            } catch (error) {
                console.error("Error fetching group data:", error);
            }
        };

        if (open && hosts.length > 0) {
            fetchGroupData();
        }
    }, [open, hosts]);

    return (
        <Modal
            open={open}
            onClose={onClose}
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
                <Typography variant="h6">Host Details</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            {hosts.map((host: Host) => (
                                <React.Fragment key={host.id}>
                                    <TableRow>
                                        <TableCell><strong>ID</strong></TableCell>
                                        <TableCell>{host.id}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Name</strong></TableCell>
                                        <TableCell>{host.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Image</strong></TableCell>
                                        <TableCell>{host.imagename}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>MAC</strong></TableCell>
                                        <TableCell>{host.primac}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Description</strong></TableCell>
                                        <TableCell>{host.description}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Groups</strong></TableCell>
                                        <TableCell>{hostGroups.join(", ")}</TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button onClick={onClose} sx={{ marginTop: 2 }}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default HostModal;