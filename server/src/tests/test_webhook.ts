import axios from "axios";
import * as crypto from "crypto";
import "dotenv/config";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "whsec_... (get from .env)";
const BACKEND_URL = 'http://localhost:5000/api/payment/webhook';

interface ITestMetadata {
    type: string;
    patientId: string;
    doctorId: string;
    hospitalId: string;
    appointmentDate: string;
    mode: string;
    patientName: string;
    patientAge: string;
    patientPhone: string;
    patientEmail: string;
    patientAddress: string;
    bloodPressure: string;
    heartRate: string;
    weight: string;
}

const testMetadata: ITestMetadata = {
    type: 'appointment',
    patientId: '65f1a2b3c4d5e6f7a8b9c0d1',
    doctorId: '65f1a2b3c4d5e6f7a8b9c0d2', 
    hospitalId: '65f1a2b3c4d5e6f7a8b9c0d3',
    appointmentDate: new Date().toISOString(),
    mode: 'online',
    patientName: 'Test Patient',
    patientAge: '30',
    patientPhone: '1234567890',
    patientEmail: 'test@example.com',
    patientAddress: '123 Test St',
    bloodPressure: '120/80',
    heartRate: '72',
    weight: '70kg'
};

const payloadBody = {
    id: 'evt_test_' + Date.now(),
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_' + Date.now(),
            metadata: testMetadata
        }
    }
};

const payload = JSON.stringify(payloadBody);

const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

async function runTest() {
    console.log("Sending test webhook to:", BACKEND_URL);
    console.log("Using Webhook Secret:", WEBHOOK_SECRET.substring(0, 10) + "...");
    
    try {
        const response = await axios.post(BACKEND_URL, payload, {
            headers: {
                'stripe-signature': stripeSignature,
                'Content-Type': 'application/json'
            }
        });
        console.log('--- SUCCESS ---');
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error: unknown) {
        console.log('--- FAILED ---');
        
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as { 
                response: { 
                    status: number; 
                    data: { message?: string; error?: string } | string;
                };
                message: string;
            };
            console.log('Status:', axiosError.response.status);
            console.log('Error Message:', axiosError.response.data || axiosError.message);
        } else if (error instanceof Error) {
            console.log('Error Message:', error.message);
        } else {
            console.log('Unknown Error:', error);
        }
        
        console.log('\nTip: Ensure your server is running on port 5000 and the Webhook Secret in .env is correct.');
    }
}

runTest();
