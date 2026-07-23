// Load Environment Variables safely 
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Initialize Stripe with the private secret key from your hidden environment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Standard middleware configuration parameters
app.use(express.json());

// Enable secure cross-origin sharing for your site domain
app.use(cors({
    origin: ['https://thelacewigs.com', 'http://localhost:3000', 'http://127.0.0.1:5500'],
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type']
}));

/* 
========================================================================
SECURE INVENTORY BASE DATABASE
------------------------------------------------------------------------
To prevent price tampering in the browser, prices are matched using 
trusted database values. Stripe units are calculated in pennies ($299.99 = 29999).
========================================================================
*/
const PRODUCT_INVENTORY = {
    "lw-frontal-24": {
        name: "Lace Frontal Wig - 24 Inch",
        priceInCents: 29999
    },
    "lw-closure-18": {
        name: "Lace Closure Wig - 18 Inch",
        priceInCents: 19999
    },
    "custom-lace-wig": {
        name: "Premium Luxury Lace Wig Custom Order",
        priceInCents: 45000
    }
};

// Main operational redirect handler endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, email } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Cart payload structure cannot be empty." });
        }

        // Loop through frontend array and securely map items to trusted server inventory values
        const lineItems = items.map(item => {
            const secureItem = PRODUCT_INVENTORY[item.id];
            
            if (!secureItem) {
                throw new Error(`Product mapping failed. ID '${item.id}' was not found in our database validation check.`);
            }

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: secureItem.name,
                    },
                    unit_amount: secureItem.priceInCents, 
                },
                quantity: parseInt(item.quantity) || 1,
            };
        });

        // Initialize Stripe Checkout session logic
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email || undefined,
            line_items: lineItems,
            // Stripe redirects users back to these paths after processing completes
            success_url: 'https://thelacewigs.com',
            cancel_url: 'https://thelacewigs.com',
        });

        // Return secure payment web route string address back to bag.html
        res.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Generation Failure:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start listening for client network data
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Stripe bridge running securely on network port ${PORT}`);
});

