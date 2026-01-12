const axios = require('axios');
const FormData = require('form-data');

const API_BASE = "https://staging.api.payluk.ng/v1";
const API_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6"; 

async function testWithHeader(val) {
    try {
        console.log(`\nTesting 'customer-id': '${val}' ...`);
        
        const form = new FormData();
        form.append("amount", "1000");
        form.append("purpose", "Test");
        form.append("description", "Test Description");
        form.append("whoPays", "buyer");
        form.append("maxDelivery", "7");
        form.append("deliveryTimeline", "days");
        
        const apiHeaders = {
            Authorization: `Bearer ${API_KEY}`,
            "customer-id": val,
            ...form.getHeaders(),
        };

        const response = await axios.post(`${API_BASE}/escrow/create`, form, {
            headers: apiHeaders
        });

        console.log("Response Status:", response.status);
    } catch (error) {
        if (error.response) {
            console.log("Error Status:", error.response.status);
            console.log("Error Data:", JSON.stringify(error.response.data));
        } else {
            console.log("Error Message:", error.message);
        }
    }
}

async function run() {
    // 1. Random String (like mongo ID)
    await testWithHeader("669123456789abcdef123456");

    // 2. Email
    await testWithHeader("validemail@example.com");
}

run();
