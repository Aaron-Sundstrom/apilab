require('dotenv').config();
const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const axios = require('axios');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Firestore document reference
const docRef = db.collection('Facts').doc('Advice');

// Scheduled Pub/Sub function
exports.pubsub = onSchedule("* * * * *", async () => {
    console.log("Scheduled function started");

    try {
        // Fetch advice from Advice Slip API
        const response = await axios.get("https://api.adviceslip.com/advice");
        console.log("Fetched advice:", response.data);

        // The API returns { slip: { id: ..., advice: "..." } }
        const advice = response.data.slip;

        // Save to Firestore
        await docRef.set({
            current: advice,
            last_updated: new Date().toISOString()
        });

        console.log("Advice saved to Firestore!");
    } catch (err) {
        console.error("Error fetching or saving advice:", err);
    }
});
