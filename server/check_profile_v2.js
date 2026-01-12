require('dotenv').config();
const axios = require('axios');

const API_BASE = "https://staging.api.payluk.ng/v1";
const SECRET_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6";

async function run() {
    try {
        console.log("Testing GET /merchant/profile without Content-Type header...");
        
        const response = await axios.get(`${API_BASE}/merchant/profile`, {
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`
                // No Content-Type
            }
        });

        console.log("SUCCESS:", response.status);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
         if (error.response) {
            console.log(`FAILED: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`ERROR: ${error.message}`);
        }
    }
}

run();
