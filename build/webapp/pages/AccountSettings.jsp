<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Account Settings</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="accountSettingsPage" data-page-title="Account Settings">
    <div class="container-fluid px-4 pb-5">
        <div class="row gx-4">
            <div class="col-xl-4">
                <div class="account-card mb-4" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <h3 class="mb-1">Profile</h3>
                            <p class="text-muted mb-0">Update your account details and avatar.</p>
                        </div>
                    </div>
                    <div class="account-card-body text-center">
                        <div class="account-avatar-large mb-3" id="profileAvatarPreview">BK</div>
                        <img id="profileAvatarImage" class="img-fluid rounded-4 d-none mb-3" alt="Profile avatar">
                        <form id="profileForm" onsubmit="saveProfile(event)">
                            <div class="mb-3">
                                <label class="form-label" for="profileName">Full Name</label>
                                <input class="form-control" id="profileName" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label" for="profileEmail">Email</label>
                                <input class="form-control" id="profileEmail" name="email" type="email" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label" for="avatarUpload">Profile Picture</label>
                                <input class="form-control" id="avatarUpload" name="avatar" type="file" accept="image/*">
                            </div>
                            <button class="btn account-btn-glow w-100" type="submit">Save Profile</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-xl-8">
                <div class="account-card mb-4" data-aos="fade-up" data-aos-delay="80">
                    <div class="account-card-header">
                        <div>
                            <h3 class="mb-1">Security</h3>
                            <p class="text-muted mb-0">Change your password securely.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <form id="passwordForm" onsubmit="changePassword(event)">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label" for="currentPassword">Current Password</label>
                                    <input class="form-control" id="currentPassword" type="password" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label" for="newPassword">New Password</label>
                                    <input class="form-control" id="newPassword" type="password" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label" for="confirmPassword">Confirm Password</label>
                                    <input class="form-control" id="confirmPassword" type="password" required>
                                </div>
                            </div>
                            <button class="btn account-btn-glow mt-4" type="submit">Change Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="accountToastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1200;"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
    <script src="../js/account.js"></script>
</body>
</html>
