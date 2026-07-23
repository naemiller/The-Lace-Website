package com.yourdomain.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*") // Adjust this in production to match your domain settings
@RequestMapping("/api")
public class CheckoutController {

    // Ideally, load this configuration from application.properties using @Value("${stripe.api.key}")
    private final String stripeSecretKey = "sk_test_your_actual_private_key_here";

    public CheckoutController() {
        // Initialize the Stripe SDK with your secret API key
        Stripe.apiKey = this.stripeSecretKey;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody CheckoutRequest request) {
        Map<String, String> responseData = new HashMap<>();
        
        try {
            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

            // Loop through each item sent from the bag.html frontend layout
            for (CartItem item : request.getItems()) {
                
                // Stripe processes money amounts strictly in cents (e.g., $350.00 = 35000 cents)
                long unitAmountInCents = Math.round(item.getPrice() * 100);

                // Build line item product data inline using the latest Builder patterns
                SessionCreateParams.LineItem.PriceData.ProductData productData = 
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName(item.getName())
                        .addImage(item.getImg()) // Array list structure for product images
                        .build();

                SessionCreateParams.LineItem.PriceData priceData = 
                    SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency("usd")
                        .setUnitAmount(unitAmountInCents)
                        .setProductData(productData)
                        .build();

                SessionCreateParams.LineItem lineItem = 
                    SessionCreateParams.LineItem.builder()
                        .setQuantity((long) item.getQty())
                        .setPriceData(priceData)
                        .build();

                lineItems.add(lineItem);
            }

            // Define session options adhering to the modern Stripe Session creation structures
            SessionCreateParams params = SessionCreateParams.builder()
                .setCustomerEmail(request.getCustomerEmail())
                .setMode(SessionCreateParams.Mode.PAYMENT) // One-time payment mode selection
                .setSuccessUrl("http://localhost:8080/success.html?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:8080/bag.html")
                .addAllLineItem(lineItems)
                .setAllowPromotionCodes(true) // Matches your optional coupon text field input
                .build();

            // Programmatically request the session string token from Stripe
            Session session = Session.create(params);

            // Pass back the secure checkout url endpoint to trigger client navigation
            responseData.put("url", session.getUrl());
            return ResponseEntity.ok(responseData);

        } catch (StripeException e) {
            responseData.put("error", e.getMessage());
            return ResponseEntity.status(500).body(responseData);
        }
    }

    // ==========================================================================
    // INNER REQUEST DATA TRANSFER OBJECTS (DTOs)
    // ==========================================================================
    public static class CheckoutRequest {
        private List<CartItem> items;
        private String customerEmail;
        private String promoCode;

        // Getters and Setters
        public List<CartItem> getItems() { return items; }
        public void setItems(List<CartItem> items) { this.items = items; }
        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
        public String getPromoCode() { return promoCode; }
        public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    }

    public static class CartItem {
        private String id;
        private String name;
        private double price;
        private int qty;
        private String img;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQty() { return qty; }
        public void setQty(int qty) { this.qty = qty; }
        public String getImg() { return img; }
        public void setImg(String img) { this.img = img; }
    }
}
