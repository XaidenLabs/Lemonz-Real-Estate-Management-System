require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.PAYLUK_API_BASE || "https://staging.api.payluk.ng/v1";
const API_KEY = process.env.PAYLUK_API_KEY;

console.log(`Testing Customer Create at: ${API_BASE}`);

async function testCreateCustomer() {
    try {
        const payload = {
            firstName: "Test",
            lastName: "Buyer",
            email: `testbuyer${Date.now()}@example.com`, // Unique email
            phone: "08012345678"
        };
        
        console.log("Creating customer with:", payload);

        const response = await axios.post(`${API_BASE}/customer/create`, payload, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error("Error Status:", error.response.status);
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testCreateCustomer();
