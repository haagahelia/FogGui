"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Divider,
} from "@mui/material";


export default function Dashboard() {
  const [tasks, setTasks] = useState<any>([]);
  const [groupAssociations, setGroupAssociations] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const useDummyData = process.env.NEXT_PUBLIC_USE_DUMMY_DATA === "true";

  useEffect(() => {
    const fetchData = async () => {
      try {

        const taskEndpoint = useDummyData ? "/dummyTaskData.json" : "/api/tasks";
        const assocEndpoint = useDummyData ? "/dummyGroupAssociation.json" : "/api/groupassociations";
        const hostEndpoint = useDummyData ? "/dummyData.json" : "/api/hosts";
        const groupEndpoint = useDummyData ? "/dummyGroupData.json" : "/api/groups";
        
          
          const [taskResponse,groupAssocResponse, hostResponse, groupResponse] = await Promise.all([
            fetch(taskEndpoint),
            fetch(assocEndpoint),
            fetch(hostEndpoint),
            fetch(groupEndpoint),
              ]);

        const taskData = await taskResponse.json();
        const groupAssocData = await groupAssocResponse.json();
        const hostData = await hostResponse.json();
        const groupData = await groupResponse.json();

        setTasks(taskData.tasks || []);
        setGroupAssociations(groupAssocData.groupassociations || []);
        setHosts(hostData.hosts || []);
        setGroups(groupData.groups || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // Filter tasks with "Queued" or "In-progress" states
  const activeStatuses = ["Queued", "In-Progress"];
  const activeTasks = tasks.filter((task: any) =>
    activeStatuses.includes(task.state?.name)
  );

  // Map group associations to hosts
  const groupMap = groupAssociations.reduce((hostGroupMap: any, assoc: any) => {
    if (!assoc.hostID || !assoc.groupID) 
      return hostGroupMap;
    hostGroupMap[assoc.hostID] = hostGroupMap[assoc.hostID] || [];
    hostGroupMap[assoc.hostID].push(assoc.groupID);
    return hostGroupMap;
  }, {});

  // Group tasks by host and their associated groups
  const groupedTasks = hosts
    .filter((host: any) => groupMap[host.id])
    .map((host: any) => ({
      hostName: host.name,
      groups: groupMap[host.id].map(
        (groupID: number) =>
          (groups.find((group: { id: number; name: string }) => 
            group.id === groupID) as { id: number; name: string } | undefined)?.name ?? `Unknown group`
      ),
    }));
    
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Actions</Typography>
              <Box mt={2}>
                <Button variant="contained" sx={{ mr: 1 }}>
                  Start Multicast
                </Button>
                <Button variant="contained" color="secondary">
                  Start Unicast
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Tasks</Typography>
              <Divider sx={{ my: 1 }} />
              {activeTasks.length > 0 ? (
                activeTasks.map((task: any) => (
                  <Box
                    key={task.id}
                    display="flex"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Typography>{task.host?.name || task.name}</Typography>
                    <Chip
                      label={task.state?.name}
                      color="primary"
                      size="small"
                    />
                  </Box>
                ))
              ) : (
                <Typography>No active tasks</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Group Assignments</Typography>
              <Divider sx={{ my: 1 }} />
              {groupedTasks.length > 0 ? (
                groupedTasks.map((task: any, index: number) => (
                  <Box
                    key={index}
                    display="flex"
                    flexDirection="column"
                    mb={2}
                  >
                    <Typography>
                      <strong>Host:</strong> {task.hostName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Groups:</strong> {task.groups.join(", ")}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography>No group assignments</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};