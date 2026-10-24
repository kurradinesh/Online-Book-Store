package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.model.Address;
import com.booknook.repository.AddressRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressRepository addressRepository;

    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(Authentication authentication) {
        String email = authentication.getName();
        List<Address> addresses = addressRepository.findByUserEmailOrderByIsDefaultDescIdDesc(email);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Address>> createAddress(
            @RequestBody Address address,
            Authentication authentication
    ) {
        String email = authentication.getName();
        address.setUserEmail(email);

        List<Address> existing = addressRepository.findByUserEmailOrderByIsDefaultDescIdDesc(email);
        if (existing.isEmpty() || Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.resetDefaultAddressForUser(email);
            address.setIsDefault(true);
        } else {
            address.setIsDefault(false);
        }

        Address saved = addressRepository.save(address);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Address saved", saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @PathVariable Integer id,
            @RequestBody Address updated,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Address address = addressRepository.findByIdAndUserEmail(id, email).orElse(null);

        if (address == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Address not found"));
        }

        address.setLabel(updated.getLabel());
        address.setRecipient(updated.getRecipient());
        address.setPhone(updated.getPhone());
        address.setLine1(updated.getLine1());
        address.setLine2(updated.getLine2());
        address.setCity(updated.getCity());
        address.setState(updated.getState());
        address.setZip(updated.getZip());
        address.setCountry(updated.getCountry());

        if (Boolean.TRUE.equals(updated.getIsDefault())) {
            addressRepository.resetDefaultAddressForUser(email);
            address.setIsDefault(true);
        }

        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.success("Address updated", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        Address address = addressRepository.findByIdAndUserEmail(id, email).orElse(null);

        if (address == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Address not found"));
        }

        addressRepository.delete(address);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @PatchMapping("/{id}/default")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> setDefaultAddress(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        Address address = addressRepository.findByIdAndUserEmail(id, email).orElse(null);

        if (address == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Address not found"));
        }

        addressRepository.resetDefaultAddressForUser(email);
        address.setIsDefault(true);
        addressRepository.save(address);

        return ResponseEntity.ok(ApiResponse.success("Default address updated", null));
    }
}
