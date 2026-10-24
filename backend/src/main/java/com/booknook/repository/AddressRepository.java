package com.booknook.repository;

import com.booknook.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    List<Address> findByUserEmailOrderByIsDefaultDescIdDesc(String userEmail);
    Optional<Address> findByIdAndUserEmail(Integer id, String userEmail);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.userEmail = :userEmail")
    void resetDefaultAddressForUser(@Param("userEmail") String userEmail);
}
