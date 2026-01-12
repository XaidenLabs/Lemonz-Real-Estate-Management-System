require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.PAYLUK_API_BASE || "https://staging.api.payluk.ng/v1";
const API_KEY = process.env.PAYLUK_API_KEY;

console.log(`List Customers at: ${API_BASE}`);

async function testList() {
    try {
        // Try singular and plural
        const paths = ['/customer', '/customers', '/users', '/merchant/customers'];
        
        for (const p of paths) {
            console.log(`\nTrying GET ${p}...`);
            try {
                const response = await axios.get(`${API_BASE}${p}`, {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`SUCCESS: ${p}`);
                console.log("Data:", JSON.stringify(response.data, null, 2));
                break; // Found it
            } catch (err) {
                 console.log(`FAILED: ${p} -> ${err.response?.status} ${err.response?.statusText}`);
            }
        }

    } catch (error) {
        console.error("Global Error:", error.message);
    }
}

testList();
