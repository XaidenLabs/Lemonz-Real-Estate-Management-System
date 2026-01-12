require('dotenv').config();
const axios = require('axios');

// Using Staging
const API_BASE = "https://staging.api.payluk.ng/v1";
// Use the Known Working Key
const API_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6";

async function testCreate(path) {
    try {
        console.log(`\nTrying POST ${path}...`);
        const payload = {
            firstName: "Test",
            lastName: "Buyer",
            email: `testbuyer${Date.now()}@example.com`,
            phone: "08012345678"
        };
        
        const response = await axios.post(`${API_BASE}${path}`, payload, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
             console.log(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.log("Error:", error.message);
        }
    }
}

async function run() {
    await testCreate('/customers'); // Rest standard
    await testCreate('/customer'); 
    await testCreate('/client/create');
}

run();
