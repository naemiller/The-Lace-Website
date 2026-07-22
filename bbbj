package com.example.demo.controller; // Update this to match your actual project package

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import java.util.*;

@RestController
public class CheckoutController {

    // 1. SET UP YOUR STRIPE KEY
    static {
        // Replace this with your actual Stripe Secret Key from your Stripe Dashboard
        Stripe.apiKey = "sk_test_51P...YourActualSecretKeyHere"; 
    }

    @GetMapping("/checkout")
    public RedirectView checkout(
            @RequestParam String products,
            @RequestParam(required = false) String coupon) {
        
        try {
            // 2. SET UP LOCALHOST OR YOUR DOMAIN FOR REDIRECTS
            // Use http://localhost:8080 during testing, or change to your live website URL
            String domainUrl = "http://localhost:8080"; 

            // Start building the Stripe Session
            SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(domainUrl + "/success.html") // Where to go after paying
                .setCancelUrl(domainUrl + "/bag.html");     // Where to go if they click back

            // 3. PARSE PRODUCTS SENT FROM BAG.HTML
            if (products != null && !products.trim().isEmpty()) {
                for (String productEntry : products.split(",")) {
                    String[] parts = productEntry.split(":");
                    
                    if (parts.length == 2) {
                        String productId = parts[0].trim();
                        long quantity = Long.parseLong(parts[1].trim());

                        // Map the Product ID to the correct Name and Price
                        long priceInCents = getProductPriceInCents(productId); 
                        String productName = getProductName(productId);

                        // Add the item to the Stripe checkout page line items
                        sessionBuilder.addLineItem(
                            SessionCreateParams.LineItem.builder()
                                .setQuantity(quantity)
                                .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("usd")
                                        .setUnitAmount(priceInCents) // Stripe uses cents ($450.00 = 45000)
                                        .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName(productName)
                                                .build()
                                        )
                                        .build()
                                )
                                .build()
                        );
                    }
                }
            }

            // 4. GENERATE THE SECURE STRIPE PAGE
            Session session = Session.create(sessionBuilder.build());

            // 5. REDIRECT THE BUYER TO STRIPE
            return new RedirectView(session.getUrl());

        } catch (Exception e) {
            e.printStackTrace();
            // If something goes wrong, send them back to the bag with an error
            return new RedirectView("/bag.html?error=stripe_failed");
        }
    }

    // HELPER MAPPING: Matches the catalog ids used inside your bag.html
    private long getProductPriceInCents(String id) {
        if (id.equals("wig_01")) return 45000;  // $450.00
        if (id.equals("wig_02")) return 65000;  // $650.00
        if (id.equals("wig_03")) return 35000;  // $350.00
        return 20000; // Default fallback $200.00
    }

    private String getProductName(String id) {
        if (id.equals("wig_01")) return "Signature HD Lace Wig";
        if (id.equals("wig_02")) return "Luxury Full Lace Body Wave";
        if (id.equals("wig_03")) return "Glueless Bob Custom Unit";
        return "Custom Lace Wig Unit";
    }
}
