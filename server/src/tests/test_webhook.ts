import axios from "axios";
import * as crypto from "crypto";

const WEBHOOK_SECRET = 'whsec_test_secret'; // You need to set this in .env for real testing
const BACKEND_URL = 'http://localhost:3000/api/payment/webhook';

const payload = JSON.stringify({
    id: 'evt_test',
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_session',
            metadata: {
                planId: '65f1a2b3c4d5e6f7a8b9c0d1', // Replace with a real plan ID from your DB
                hospitalId: '65f1a2b3c4d5e6f7a8b9c0d2' // Replace with a real hospital ID from your DB
            }
        }
    }
});

const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

async function testWebhook() {
    try {
        const response = await axios.post(BACKEND_URL, payload, {
            headers: {
                'stripe-signature': stripeSignature,
                'Content-Type': 'application/json'
            }
        });
        console.log('Webhook Response:', response.data);
    } catch (error: any) {
        console.error('Webhook Error:', error.response?.data || error.message);
    }
}

// Note: This script requires a running server and the STRIPE_WEBHOOK_SECRET to be 'whsec_test_secret'
// testWebhook();
console.log('Test script ready. Replace IDs and set STRIPE_WEBHOOK_SECRET=whsec_test_secret in .env to run.');
