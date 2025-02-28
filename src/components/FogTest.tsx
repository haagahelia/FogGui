"use client";
import React, { useEffect, useState } from "react";

const FogTest = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/fog");

        if (!response.ok) throw new Error("Failed to fetch");

        const jsonData = await response.json();
        setData(jsonData);
        console.log("Fetched data:", jsonData);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>FOG API Test</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default FogTest;
