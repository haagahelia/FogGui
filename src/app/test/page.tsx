"use client";

import { useDashboardData } from "@/test-hooks/useDashboardData";
import { useState } from "react";

export default function DashboardPage() {
  const { groups, images, hosts, groupAssociations, loading, error } =
    useDashboardData();

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Filter group associations for the selected group
  const filteredAssociations = selectedGroupId
    ? groupAssociations.filter((ga) => ga.groupID === selectedGroupId)
    : [];

  // Map to host objects
  const associatedHosts = filteredAssociations
    .map((ga) => hosts.find((h) => h.id === ga.hostID))
    .filter(Boolean); // remove undefined

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Groups Dropdown */}
      <h1>Groups</h1>
      <select
        value={selectedGroupId ?? ""}
        onChange={(e) => setSelectedGroupId(Number(e.target.value))}
      >
        <option value="" disabled>
          -- Select a group --
        </option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      {selectedGroupId && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Selected Group Details</h2>
          {groups
            .filter((g) => g.id === selectedGroupId)
            .map((group) => (
              <ul key={group.id}>
                <li>ID: {group.id}</li>
                <li>Name: {group.name}</li>
                <li>Description: {group.description || "-"}</li>
                <li>Kernel Device: {group.kernelDevice || "-"}</li>
                <li>Members: {group.members}</li>
                <li>Created: {group.createdTime}</li>
              </ul>
            ))}

          <h2>Associated Hosts</h2>
          {associatedHosts.length > 0 ? (
            <ul>
              {associatedHosts.map((host) => (
                <li key={host!.id}>{host!.name}</li>
              ))}
            </ul>
          ) : (
            <p>No hosts associated with this group.</p>
          )}
        </div>
      )}

      {/* Images Dropdown */}
      <h1>Images</h1>
      <select
        value={selectedImageId ?? ""}
        onChange={(e) => setSelectedImageId(Number(e.target.value))}
      >
        <option value="" disabled>
          -- Select an image --
        </option>
        {images.map((img) => (
          <option key={img.id} value={img.id}>
            {img.name} ({img.osname})
          </option>
        ))}
      </select>

      {selectedImageId && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Selected Image Details</h2>
          {images
            .filter((img) => img.id === selectedImageId)
            .map((img) => (
              <ul key={img.id}>
                <li>ID: {img.id}</li>
                <li>Name: {img.name}</li>
                <li>Description: {img.description || "-"}</li>
                <li>OS: {img.osname || "-"}</li>
                <li>Image Type: {img.imagetypename || "-"}</li>
                <li>Partition Type: {img.imageparttypename || "-"}</li>
                <li>Created: {img.createdTime}</li>
              </ul>
            ))}
        </div>
      )}
    </div>
  );
}
