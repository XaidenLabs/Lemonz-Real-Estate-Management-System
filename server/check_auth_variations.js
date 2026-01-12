require('dotenv').config();
const axios = require('axios');

const API_BASE = "https://staging.api.payluk.ng/v1";
const SECRET_KEY = "sk_test_WyhJih8vceqimj82Hl1SVYDvi0eudJp6";
const PUBLIC_KEY = "pk_test_Uj1xX6ZVHlNJCGmJsDENCwCMPzes0M07";

async function testEndpoint(name, method, url, keyType, key, payload = null) {
    try {
        console.log(`\n[${name}] ${method} ${url} (Key: ${keyType})`);
        
        const config = {
            method: method,
            url: `${API_BASE}${url}`,
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            data: payload
        };
        
        const response = await axios(config);
        console.log(`SUCCESS: ${response.status}`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log(`FAILED: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`ERROR: ${error.message}`);
        }
    }
}

async function run() {
    // 1. Try Create Customer with Public Key
    const customerPayload = {
        firstName: "TestPub",
        lastName: "Key",
        email: `testpub${Date.now()}@example.com`,
        phone: "08099887766"
    };
    await testEndpoint("Create Customer", "POST", "/customer/create", "PUBLIC", PUBLIC_KEY, customerPayload);

    // 2. Try Get Profile / Merchant with Secret Key
    await testEndpoint("Get Profile", "GET", "/merchant/profile", "SECRET", SECRET_KEY);
    await testEndpoint("Get Me", "GET", "/auth/me", "SECRET", SECRET_KEY);
    await testEndpoint("Get Account", "GET", "/accounts", "SECRET", SECRET_KEY);
}

run();
