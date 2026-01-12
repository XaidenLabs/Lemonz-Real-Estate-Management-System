import { createContext, useContext, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../config";
import { useRouter } from "expo-router";
import { getToken } from "../services/getToken";

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [propertyError, setPropertyError] = useState("");
  const [propertyMessage, setPropertyMessage] = useState("");
  const [agentProperties, setAgentProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [property, setProperty] = useState({});
  const [numberOfProperties, setNumberOfProperties] = useState(0);
  const [propertiesForRent, setPropertiesForRent] = useState(0);
  const [propertiesForLease, setPropertiesForLease] = useState(0);
  const [propertiesForSale, setPropertiesForSale] = useState(0);
  const [rentProperties, setRentProperties] = useState([]);
  const [leaseProperties, setLeaseProperties] = useState([]);
  const [saleProperties, setSaleProperties] = useState([]);
  const [agentRentProperties, setAgentRentProperties] = useState([]);
  const [agentLeaseProperties, setAgentLeaseProperties] = useState([]);
  const [agentSaleProperties, setAgentSaleProperties] = useState([]);
  const [lands, setLands] = useState([]);
  const [houses, setHouses] = useState([]);
  const [shopSpaces, setShopSpaces] = useState([]);
  const [officeBuildings, setOfficeBuildings] = useState([]);
  const [industrialBuildings, setIndustrialBuildings] = useState([]);
  const [newListings, setNewListings] = useState([]);
  const [sponsoredProperties, setSponsoredProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [analytics, setAnalytics] = useState({
    labels: [],
    revenue: [],
    engagement: [],
    totalRevenue: 0,
  });

  const router = useRouter();

  const uploadProperty = async (
    title,
    description,
    category,
    status,
    price,
    currency,
    country,
    images,
    video,
    document,
    coordinates
  ) => {
    setPropertyLoading(true);

    try {
      const token = await getToken();

      await axios.post(
        `${config.API_BASE_URL}/api/property/upload`,
        {
          title,
          description,
          category,
          status,
          price,
          currency,
          country,
          images,
          video,
          document,
          coordinates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPropertyMessage("Property uploaded successfully");

      setTimeout(() => {
        setPropertyMessage("");

        router.replace("/agent/properties");
      }, 3000);
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
      setPropertyError(error.response.data.message);
    } finally {
      setPropertyLoading(false);
    }
  };

  const getProperties = async (page, limit) => {
    setPropertyLoading(true);

    try {
      const token = await getToken();
      const userId = await AsyncStorage.getItem("userId");

      const response = await axios.get(
        `${config.API_BASE_URL}/api/property/all?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedProperties = response.data.properties.filter((property) =>
        property.savedBy.includes(userId)
      );

      setAgentProperties(response.data.agentProperties);
      setProperties(response.data.properties);
      setSponsoredProperties(response.data.sponsoredProperties);
      setSavedProperties(savedProperties);
      setNumberOfProperties(response.data.numberOfProperties);
      setPropertiesForLease(response.data.propertiesForLease);
      setPropertiesForRent(response.data.propertiesForRent);
      setPropertiesForSale(response.data.propertiesForSale);
      setAgentRentProperties(response.data.agentRentProperties);
      setAgentLeaseProperties(response.data.agentLeaseProperties);
      setAgentSaleProperties(response.data.agentSaleProperties);
      setRentProperties(response.data.rentProperties);
      setLeaseProperties(response.data.leaseProperties);
      setSaleProperties(response.data.saleProperties);
      setLands(response.data.lands);
      setHouses(response.data.houses);
      setShopSpaces(response.data.shopSpaces);
      setOfficeBuildings(response.data.officeBuildings);
      setIndustrialBuildings(response.data.industrialBuildings);
      setNewListings(response.data.newListings);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      if (response.data.analytics) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setPropertyLoading(false);
    }
  };

  const getProperty = async (id) => {
    setPropertyLoading(true);

    try {
      const token = await getToken();

      const response = await axios.get(
        `${config.API_BASE_URL}/api/property/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProperty(response.data.property);
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setPropertyLoading(false);
    }
  };

  const updateProperty = async (
    id,
    title,
    description,
    category,
    status,
    price,
    currency,
    location,
    images,
    video,
    document
  ) => {
    setPropertyLoading(true);

    try {
      const token = await getToken();

      const response = await axios.put(
        `${config.API_BASE_URL}/api/property/${id}`,
        {
          title,
          description,
          category,
          status,
          price,
          currency,
          location,
          images,
          video,
          document,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPropertyMessage(response.data.message);

      setTimeout(() => {
        setPropertyMessage("");

        if (response.data.message === "Property saved successfully") {
          router.push("/user/properties/saved");
        }
      }, 3000);
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setPropertyLoading(false);
    }
  };

  const searchProperty = async (
    title,
    country,
    category,
    status,
    minPrice,
    maxPrice
  ) => {
    setPropertyLoading(true);

    try {
      const token = await getToken();

      const response = await axios.get(
        `${config.API_BASE_URL}/api/property?title=${title}&country=${country}&category=${category}&status=${status}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProperties(response.data.properties);
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setPropertyLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    setPropertyLoading(true);

    try {
      const token = await getToken();

      await axios.delete(`${config.API_BASE_URL}/api/property/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setPropertyLoading(false);
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        propertyLoading,
        propertyError,
        propertyMessage,
        setPropertyError,
        setPropertyMessage,
        uploadProperty,
        getProperties,
        agentProperties,
        numberOfProperties,
        propertiesForRent,
        propertiesForLease,
        propertiesForSale,
        properties,
        savedProperties,
        rentProperties,
        leaseProperties,
        saleProperties,
        agentRentProperties,
        agentLeaseProperties,
        agentSaleProperties,
        lands,
        houses,
        shopSpaces,
        officeBuildings,
        industrialBuildings,
        newListings,
        sponsoredProperties,
        currentPage,
        totalPages,
        getProperty,
        property,
        updateProperty,
        searchProperty,
        deleteProperty,

      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => useContext(PropertyContext);
