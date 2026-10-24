package com.booknook.repository;

import com.booknook.model.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Integer> {
    List<HelpRequest> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<HelpRequest> findAllByOrderByCreatedAtDesc();
}
