
import React, { createContext, useContext, useState, useEffect } from 'react';
import { client } from '../sanityClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        // Simple query to fetch calls
        const query = `* [_type == "call"] | order(startDate desc) {
    "id": editalNumber,
        title,
        description,
        type,
        courseType,
        status,
        subscriptionLink,
        appealLink,
        vacancies,
        remuneration,
        startDate,
        endDate,
        timeline[] {
        date,
            title,
            "type": "pdf",
                isFeatured,
                "url": fileUrl
    }
} `;
        const data = await client.fetch(query);
        setCalls(data);
      } catch (error) {
        console.error("Failed to fetch calls from Sanity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // Admin functions now need to interact with Sanity (omitted for now as we focus on fetch)
  // Real implementation would use client.create / client.patch
  const addCall = (newCall) => {
    console.log("Adding call to Sanity not yet implemented in frontend. Use Sanity Studio.");
  };

  const updateCall = (updatedCall) => {
    console.log("Update via Sanity Studio");
  };

  const deleteCall = (id) => {
    console.log("Delete via Sanity Studio");
  }

  return (
    <DataContext.Provider value={{ calls, loading, addCall, updateCall, deleteCall }}>
      {children}
    </DataContext.Provider>
  );
};

