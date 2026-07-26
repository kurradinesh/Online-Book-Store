<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Account Settings</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
    <style>
        .settings-summary {
            border-radius: 18px;
            background: #ffffff;
            border: 1px solid rgba(148, 163, 184, 0.18);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
        }
        .settings-summary .avatar-large {
            width: 96px;
            height: 96px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: rgba(37, 99, 235, 0.12);
            color: #0f172a;
            font-size: 1.75rem;
            font-weight: 700;
        }
    </style>
</head>
<body id="accountSettingsPage" data-page-title="Account Settings">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4">
            <div class="col-xl-4">
                <div class="settings-summary p-4" data-aos="fade-up">
                    <div class="d-flex align-items-start gap-3 mb-4">
                        <div class="avatar-large position-relative overflow-hidden" id="profileAvatarPreview">
                            <img id="profileAvatarImage" class="w-100 h-100 position-absolute top-0 start-0 d-none" style="object-fit: cover;" alt="Avatar">
                            <span id="profileAvatarInitials">BK</span>
                        </div>
                        <div>
                            <div class="text-uppercase text-muted small">Profile</div>
                            <h4 class="mb-1" id="settingsUserName">BookNook Reader</h4>
                            <p class="mb-1 text-muted" id="settingsUserEmail">user@example.com</p>
                            <span class="badge bg-primary">Regular Member</span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h6 class="mb-2">Profile completion</h6>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: 76%;" aria-valuenow="76" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small class="text-muted">76% completed. Complete your profile for better recommendations.</small>
                    </div>
                    <div class="d-grid gap-3">
                        <div class="border rounded-3 p-3 bg-body-tertiary">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <strong>Membership</strong>
                                <span class="badge bg-success">Premium</span>
                            </div>
                            <div class="text-muted">Upgrade available for faster delivery and offers.</div>
                        </div>
                        <div class="border rounded-3 p-3 bg-body-tertiary">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <strong>Last login</strong>
                                <span class="text-muted">Today</span>
                            </div>
                            <div class="text-muted">Recent login location and device trends.</div>
                        </div>
                        <div class="d-grid gap-2">
                            <a href="AddressBook.jsp" class="btn btn-outline-primary btn-sm">Manage Addresses</a>
                            <a href="HelpCenter.jsp" class="btn btn-outline-secondary btn-sm">Contact Support</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-8">
                <div class="account-card mb-4" data-aos="fade-up" data-aos-delay="80">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Personal Information</div>
                            <h3 class="mb-1">Profile & Preferences</h3>
                            <p class="page-subtitle mb-0">Manage your contact information, preferences, and notification settings.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <form id="profileForm" onsubmit="saveProfile(event)" class="row g-4 needs-validation" novalidate>
                            <div class="col-md-6">
                                <label class="form-label" for="profileName">Full Name</label>
                                <input class="form-control" id="profileName" name="name" required>
                                <div class="invalid-feedback">Please enter your full name.</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="profileEmail">Email</label>
                                <input class="form-control" id="profileEmail" name="email" type="email" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="avatarUpload">Profile Photo</label>
                                <input class="form-control" id="avatarUpload" name="avatar" type="file" accept="image/*">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="mobileNumber">Mobile Number</label>
                                <input class="form-control" id="mobileNumber" name="mobileNumber" type="text" placeholder="+91 98765 43210" required>
                                <div class="invalid-feedback">Please enter your mobile number.</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="languageSelect">Language</label>
                                <select class="form-select" id="languageSelect" name="language" required>
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="es">Spanish</option>
                                </select>
                                <div class="invalid-feedback">Choose a preferred language.</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label" for="timeZoneSelect">Time Zone</label>
                                <select class="form-select" id="timeZoneSelect" name="timezone" required>
                                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York</option>
                                </select>
                                <div class="invalid-feedback">Pick a time zone.</div>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Email Preferences</label>
                                <div class="row g-3">
                                    <div class="col-sm-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="promoEmails" name="promoEmails">
                                            <label class="form-check-label" for="promoEmails">Receive promotions</label>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="orderAlerts" name="orderAlerts" checked>
                                            <label class="form-check-label" for="orderAlerts">Order updates</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Notification Settings</label>
                                <div class="row g-3">
                                    <div class="col-sm-6">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="notifyEmail" checked>
                                            <label class="form-check-label" for="notifyEmail">Email notifications</label>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="notifySms">
                                            <label class="form-check-label" for="notifySms">SMS notifications</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 d-flex gap-2 flex-wrap">
                                <button class="btn account-btn-primary" type="submit">Save Changes</button>
                                <button class="btn btn-outline-secondary" type="button" onclick="document.getElementById('profileForm').reset();">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="account-card mb-4" data-aos="fade-up" data-aos-delay="120">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Security</div>
                            <h3 class="mb-1">Change Password</h3>
                            <p class="page-subtitle mb-0">Update your password to keep your account secure.</p>
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
                            <button class="btn account-btn-primary mt-4" type="submit">Change Password</button>
                        </form>
                    </div>
                </div>
                <div class="account-card" data-aos="fade-up" data-aos-delay="140">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Login Activity</div>
                            <h3 class="mb-1">Security Settings</h3>
                            <p class="page-subtitle mb-0">Review recent sign-ins and keep your account protected.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <div class="row g-3">
                            <div class="col-12">
                                <div class="border rounded-3 p-3 bg-body-tertiary">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div><strong>Recent login</strong></div>
                                        <span class="badge bg-success">Verified</span>
                                    </div>
                                    <div class="text-muted">Last active from Mumbai using Chrome on Windows.</div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="border rounded-3 p-3 bg-body-tertiary">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div><strong>2-step verification</strong></div>
                                        <span class="text-success">Enabled</span>
                                    </div>
                                    <div class="text-muted">Your account is protected with additional login security.</div>
                                </div>
                            </div>
                            <div class="col-12 text-end">
                                <button class="btn btn-outline-danger btn-sm" type="button">Delete Account</button>
                            </div>
                        </div>
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
