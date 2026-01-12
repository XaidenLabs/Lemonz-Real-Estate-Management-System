const axios = require('axios');
const FormData = require('form-data');

const API_BASE = "https://staging.api.payluk.ng/v1";
const API_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6"; 

async function testPayload(name, extraFields = {}) {
    try {
        console.log(`\nTesting Payload: ${name}`);
        console.log("Extra Fields:", JSON.stringify(extraFields));
        
        const form = new FormData();
        form.append("amount", "1000");
        form.append("purpose", "Test");
        form.append("description", "Test Description");
        form.append("whoPays", "buyer"); // Try default first
        form.append("maxDelivery", "7");
        form.append("deliveryTimeline", "days");
        
        // Add variations
        for (const [key, val] of Object.entries(extraFields)) {
            if (key !== 'customer-id-header') {
                form.append(key, val);
            }
        }

        const apiHeaders = {
            Authorization: `Bearer ${API_KEY}`,
             // No customer-id header by default
            ...form.getHeaders(),
        };
        
        if (extraFields['customer-id-header']) {
             apiHeaders['customer-id'] = extraFields['customer-id-header'];
        }

        const response = await axios.post(`${API_BASE}/escrow/create`, form, {
            headers: apiHeaders
        });

        console.log("SUCCESS");
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log("FAILED:", error.response.status);
            console.log("Data:", JSON.stringify(error.response.data));
        } else {
            console.log("ERROR:", error.message);
        }
    }
}

async function run() {
    // 1. Explicit buyer details
    await testPayload("Buyer Info", { 
        "buyer_email": "realbuyer@example.com",
    });

    // 2. Email field
    await testPayload("Email Field", { 
        "email": "realbuyer@example.com"
    });
    
    // 3. Customer field
    await testPayload("Customer Field", { 
        "customer": "realbuyer@example.com"
    });

}

run();
