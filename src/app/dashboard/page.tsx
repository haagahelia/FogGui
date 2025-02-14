'use client'
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [data, setData] = useState<any>({ hosts: [] }); 

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/dummyData.json');
      const jsonData = await response.json();
      setData(jsonData); 
    };

    fetchData();
  }, []);

  console.log(data); 

  return (
    <div>
      <h1>Dashboard</h1>
      {data.hosts && data.hosts.length > 0 ? (
        <ul>
          {data.hosts.map((host: any) => (
            <li key={host.id}>
              <p><strong>Name:</strong> {host.name}</p>
              <p><strong>MAC Address:</strong> {host.mac}</p>
              <p><strong>Image:</strong> {host.image}</p>
              <p><strong>Status:</strong> {host.status}</p>
              <p>-------------</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hosts available.</p>
      )}
    </div>
  );
};

export default Dashboard;
