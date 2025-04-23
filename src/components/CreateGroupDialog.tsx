/* import React, { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button 
} from "@mui/material";

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function CreateGroupDialog({ open, onClose, onCreate }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }
    onCreate(groupName, groupDescription);
    setGroupName("");
    setGroupDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <TextField
          label="Group Name"
          fullWidth
          variant="outlined"
          margin="dense"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <TextField
          label="Group Description"
          fullWidth
          variant="outlined"
          margin="dense"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary" variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}*/
