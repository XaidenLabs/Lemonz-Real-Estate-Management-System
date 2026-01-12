import axios from "axios";

export const fetchCountries = async () => {
  try {
    const response = await axios.get(
      "https://restcountries.com/v3.1/all?fields=name,currencies,idd,cca2,cca3",
    );
    const sortedCountries = response.data.sort((a, b) =>
      a.name.common.localeCompare(b.name.common),
    );
    return sortedCountries;
  } catch (error) {
    throw error;
  }
};
