package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;
import java.util.*;

@RestController
public class CheckoutController {

    // Inject your key securely from application.properties or system environment variables
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        // Initializes the Stripe SDK with your key once the bean is created
        Stripe.apiKey = stripeApiKey;
    }

    // Restrict origins in production instead of using "*" for better security
    @CrossOrigin(origins = "https://thelacewigs.com") 
    @GetMapping("/checkout")
    public RedirectView checkout(
            @RequestParam String products,
            @RequestParam(required = false) String coupon) {
        
        String frontendUrl = "https://thelacewigs.com";

        try {
            // 1. Initialize Session Builder
            SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/success.html")
                    .setCancelUrl(frontendUrl + "/bag.html");

            // 2. Handle Coupons / Discounts
            if (coupon != null && !coupon.trim().isEmpty()) {
                sessionBuilder.addDiscount(
                    SessionCreateParams.Discount.builder()
                        .setCoupon(coupon.trim()) // Dynamic coupon ID matching your Stripe Dashboard
                        .build()
                );
            }

            // 3. Parse and Add Products
            if (products != null && !products.trim().isEmpty()) {
                for (String productEntry : products.split(",")) {
                    String[] parts = productEntry.split(":");
                    if (parts.length == 2) {
                        String productId = parts[0].trim();
                        long quantity = Long.parseLong(parts[1].trim());

                        long priceInCents = getProductPriceInCents(productId);
                        String productName = getProductName(productId);

                        sessionBuilder.addLineItem(
                            SessionCreateParams.LineItem.builder()
                                .setQuantity(quantity)
                                .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                        .setCurrency("usd")
                                        .setUnitAmount(priceInCents)
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

            // 4. Create and Redirect
            Session session = Session.create(sessionBuilder.build());
            return new RedirectView(session.getUrl());

        } catch (Exception e) {
            // Consider using a logger framework (like SLF4J) instead of printStackTrace
            e.printStackTrace(); 
            return new RedirectView(frontendUrl + "/bag.html?error=checkout_failed");
        }
    }

    // Helper mappings
    private long getProductPriceInCents(String id) {
        return switch (id) {
            case "wig_01" -> 45000;  // $450.00
            case "wig_02" -> 65000;  // $650.00
            case "wig_03" -> 35000;  // $350.00
            default -> 20000;        // Fallback $200.00
        };
    }

    private String getProductName(String id) {
        return switch (id) {
            case "wig_01" -> "Signature HD Lace Wig";
            case "wig_02" -> "Luxury Full Lace Body Wave";
            case "wig_03" -> "Glueless Bob Custom Unit";
            default -> "Custom Lace Wig Unit";
        };
    }
}
