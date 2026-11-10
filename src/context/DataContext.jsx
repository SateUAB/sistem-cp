
import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { client } from '../sanityClient';
import { postTitle, scheduleItemTitle } from '../utils/postTitle';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // `shortTitle`, `summary` and `linkedPostKey` are optional: the site works without them (see src/utils/cp)
  const fetchCalls = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        // Simple query to fetch calls
        const query = `* [_type == "call"] | order(publicationDate desc) {
    "id": editalNumber,
        title,
        shortTitle,
        summary,
        description,
        type,
        courseType,
        status,
        subscriptionLink,
        appealLink,
        publicationDate,
        startDate,
        subscriptionEndDate,
        endDate,
        schedule[] {
            _key,
            "title": ${scheduleItemTitle},
            category,
            startDate,
            endDate,
            linkedPostKey
        },
        timeline[] {
            _key,
            date,
            "title": ${postTitle},
            "type": "pdf",
            "url": fileUrl,
            changesSchedule
        }
    } `;
        const data = await client.fetch(query);
        setCalls(data);
      } catch (fetchError) {
        console.error("Failed to fetch calls from Sanity:", fetchError);
        setError(fetchError);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

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
    <DataContext.Provider value={{ calls, loading, error, reload: fetchCalls, addCall, updateCall, deleteCall }}>
      {children}
    </DataContext.Provider>
  );
};

