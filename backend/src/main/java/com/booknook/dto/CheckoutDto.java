package com.booknook.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CheckoutDto {

    public static class CheckoutRequest {
        private Integer addressId;

        private String recipient;
        private String phone;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String zip;

        @NotBlank(message = "Payment method is required (COD, CARD, or UPI)")
        private String paymentMethod = "COD";

        private String paymentReference;

        public Integer getAddressId() { return addressId; }
        public void setAddressId(Integer addressId) { this.addressId = addressId; }
        public String getRecipient() { return recipient; }
        public void setRecipient(String recipient) { this.recipient = recipient; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getLine1() { return line1; }
        public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; }
        public void setLine2(String line2) { this.line2 = line2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getZip() { return zip; }
        public void setZip(String zip) { this.zip = zip; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentReference() { return paymentReference; }
        public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    }

    public static class OrderStatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;

        private String trackingCode;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTrackingCode() { return trackingCode; }
        public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }
    }
}
