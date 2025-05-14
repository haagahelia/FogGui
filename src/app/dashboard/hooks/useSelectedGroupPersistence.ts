import { useEffect } from "react";
import { Group } from "@/types/group";

export function useSelectedGroupPersistence(groups: Group[], selectedGroup: Group | null, setSelectedGroup: (g: Group) => void) {
  useEffect(() => {
    if (groups.length === 0) return;
    const storedID = localStorage.getItem("selectedGroup");
    const found = groups.find(g => g.id === Number(storedID));
    if (found) setSelectedGroup(found);
  }, [groups]);

  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem("selectedGroup", String(selectedGroup.id));
    }
  }, [selectedGroup]);
}
