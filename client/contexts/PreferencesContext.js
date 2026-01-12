import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { config } from "../config";
import { getToken } from "../services/getToken";

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load preferences when context mounts
  // useEffect(() => {
  //   loadPreferences();
  // }, []);

  const loadPreferences = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${config.API_BASE_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.user?.preferences) {
        setPreferences(response.data.user.preferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(
        `${config.API_BASE_URL}/api/property/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRecommendations(response.data.properties || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const token = await getToken();
      await axios.put(
        `${config.API_BASE_URL}/api/user/preferences`,
        { preferences: newPreferences },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPreferences(newPreferences);
      // Refresh recommendations after updating preferences
      fetchRecommendations();
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        recommendations,
        loading,
        updatePreferences,
        fetchRecommendations,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
