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

@RestController
public class CheckoutController {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @CrossOrigin(origins = "https://thelacewigs.com") 
    @GetMapping("/checkout")
    public RedirectView checkout(
            @RequestParam String products,
            @RequestParam(required = false) String coupon) {
        
        String frontendUrl = "https://thelacewigs.com";

        try {
            SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/success.html")
                    .setCancelUrl(frontendUrl + "/bag.html");

            // Option A: If passing an explicit internal Coupon ID
            if (coupon != null && !coupon.trim().isEmpty()) {
                sessionBuilder.addDiscount(
                    SessionCreateParams.Discount.builder()
                        .setCoupon(coupon.trim()) 
                        .build()
                );
            }
            
            // Option B (RECOMMENDED): Let Stripe handle user-facing Promo Codes natively:
            // sessionBuilder.setAllowPromotionCodes(true);

            if (products != null && !products.trim().isEmpty()) {
                for (String productEntry : products.split(",")) {
                    String[] parts = productEntry.split(":");
                    if (parts.length == 2) {
                        // FIX: Added explicit array indices [0] and [1]
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

            Session session = Session.create(sessionBuilder.build());
            return new RedirectView(session.getUrl());

        } catch (Exception e) {
            e.printStackTrace(); 
            return new RedirectView(frontendUrl + "/bag.html?error=checkout_failed");
        }
    }

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
