import { EXCHANGE_RATE_API_KEY } from "@env";

const EXCHANGE_API_KEY = EXCHANGE_RATE_API_KEY;
const EXCHANGE_BASE_URL = "https://v6.exchangerate-api.com/v6";
const COUNTRIES_API_URL = "https://restcountries.com/v3.1";

let countryDataCache = new Map();

export const getCountryCodeFromName = async (countryName) => {
  try {
    const response = await fetch(
      `${COUNTRIES_API_URL}/name/${encodeURIComponent(countryName)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch country data: ${response.status}`);
    }

    const countries = await response.json();

    if (!countries || countries.length === 0) {
      throw new Error("No country found with that name");
    }

    const country = countries[0];
    const countryCode = country.cca2;
    return countryCode;
  } catch (error) {
    throw error;
  }
};

export const getCountryCurrencyData = async (countryName) => {
  try {
    if (countryDataCache.has(countryName)) {
      return countryDataCache.get(countryName);
    }

    const response = await fetch(
      `${COUNTRIES_API_URL}/name/${encodeURIComponent(countryName)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch country data: ${response.status}`);
    }

    const countries = await response.json();

    if (!countries || countries.length === 0) {
      throw new Error("No country found with that name");
    }

    const countryData = countries[0];

    if (!countryData?.currencies) {
      throw new Error("No currency data found for country");
    }

    const currencies = countryData.currencies;
    const currencyCode = Object.keys(currencies)[0];

    if (!currencyCode) {
      throw new Error("No currency code found for country");
    }

    const currencyInfo = {
      code: currencyCode,
      symbol: currencies[currencyCode].symbol || currencyCode,
      name: currencies[currencyCode].name,
      countryCode: countryData.cca2,
    };

    countryDataCache.set(countryName, currencyInfo);

    return currencyInfo;
  } catch (error) {
    throw error;
  }
};

export const fetchExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const response = await fetch(
      `${EXCHANGE_BASE_URL}/${EXCHANGE_API_KEY}/pair/${fromCurrency}/${toCurrency}`,
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.conversion_rate;
  } catch (error) {
    throw error;
  }
};

export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    const rate = await fetchExchangeRate(fromCurrency, toCurrency);
    if (!rate) {
      throw new Error("Failed to get exchange rate");
    }

    return amount * rate;
  } catch (error) {
    throw error;
  }
};

export const formatCurrency = (amount, symbol, currencyCode) => {
  try {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${symbol || ""}${formattedAmount}`;
  } catch (error) {
    return `${amount}`;
  }
};
