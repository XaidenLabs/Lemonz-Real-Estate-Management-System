import * as Location from "expo-location";

/**
 * Geocode an address string to coordinates using expo-location
 * Returns an array of results similar to Location.geocodeAsync
 */
export async function geocodeAddress(query) {
  if (!query) return [];
  try {
    const results = await Location.geocodeAsync(query);
    return results;
  } catch (err) {
    console.warn("geocodeAddress error:", err);
    throw err;
  }
}

/**
 * Fetch place suggestions from Nominatim (OpenStreetMap).
 * Returns an array of objects: { label, lat, lon }
 */
export async function fetchSuggestions(query, limit = 5) {
  if (!query) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query,
    )}&addressdetails=1&limit=${limit}`;

    const res = await fetch(url, {
      headers: {
        // Nominatim requires a valid User-Agent — set a short identifier for the app
        "User-Agent": "lemon-app",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      // propagate an error to the caller
      const errText = await res.text();
      throw new Error(`Nominatim error: ${res.status} ${errText}`);
    }

    const data = await res.json();

    return data.map((r) => ({ label: r.display_name, lat: r.lat, lon: r.lon }));
  } catch (err) {
    console.warn("fetchSuggestions error:", err);
    return [];
  }
}
