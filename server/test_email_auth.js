const axios = require('axios');
const FormData = require('form-data');

const API_BASE = "https://staging.api.payluk.ng/v1";
const API_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6"; 

async function testWithEmail() {
    try {
        console.log(`\nTesting with EMAIL in body (No customer-id header)...`);
        
        const form = new FormData();
        form.append("amount", "1000");
        form.append("purpose", "Test");
        form.append("description", "Test Description");
        form.append("whoPays", "buyer");
        form.append("maxDelivery", "7");
        form.append("deliveryTimeline", "days");
        
        // ADD EMAIL
        form.append("email", "testbuyer_fix@example.com");
        form.append("buyer_email", "testbuyer_fix@example.com"); // Trying both common variations

        const apiHeaders = {
            Authorization: `Bearer ${API_KEY}`,
            // "customer-id": ... REMOVED
            ...form.getHeaders(),
        };

        const response = await axios.post(`${API_BASE}/escrow/create`, form, {
            headers: apiHeaders
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", JSON.stringify(error.response.data));
        } else {
            console.log("Error Message:", error.message);
        }
    }
}

testWithEmail();
