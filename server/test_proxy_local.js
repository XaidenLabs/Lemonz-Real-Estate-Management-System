require("dotenv").config({ path: ".env.local" });
const paylukService = require('./services/payluk.service');

async function testWhitelist() {
    try {
        console.log("Testing Payluk Proxy...");
        console.log("Proxy URL Configured:", process.env.PAYLUK_PROXY_URL);

        // Attempt to create a dummy transaction to see if we get past the Cloudflare/IP blocking phase.
        // Even if we get a validation error (e.g. invalid amount/email), it means the IP is whitelisted!
        const result = await paylukService.createTransaction({
            amount: 50,
            email: "test@example.com",
            reference: "TEST_REF_" + Date.now(),
            description: "Testing proxy IP whitelist",
            callbackUrl: "https://lemonz.com/callback"
        });

        console.log("\nSuccess Payload:");
        console.log(result);

    } catch (error) {
        console.error("\nFailed. Error Message:");
        console.error(error.message);
    }
}

testWhitelist();
