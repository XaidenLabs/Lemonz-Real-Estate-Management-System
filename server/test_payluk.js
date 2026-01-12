const axios = require('axios');
const FormData = require('form-data');

// Try Staging URL based on docs
const API_BASE = "https://staging.api.payluk.ng/v1";

const API_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6"; 

console.log(`Testing with API Base: ${API_BASE}`);
console.log(`Using API Key: ${API_KEY}`);

async function testAuth() {
    try {
        console.log("Hitting /escrow/create...");
        
        const form = new FormData();
        form.append("amount", "1000");
        form.append("purpose", "Test");
        form.append("description", "Test Description");
        form.append("whoPays", "buyer");
        form.append("maxDelivery", "7");
        form.append("deliveryTimeline", "days");
        
        const apiHeaders = {
            Authorization: `Bearer ${API_KEY}`,
            ...form.getHeaders(),
        };

        const response = await axios.post(`${API_BASE}/escrow/create`, form, {
            headers: apiHeaders
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);
    } catch (error) {
        if (error.response) {
            console.log("\nError Status:", error.response.status);
            console.log("Error Data:", JSON.stringify(error.response.data));
        } else {
            console.log("\nError Message:", error.message);
        }
    }
}

testAuth();
