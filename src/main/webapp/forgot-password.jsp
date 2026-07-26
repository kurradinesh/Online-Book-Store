<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Forgot Password · Booknook</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/forgot-password.css">
</head>
<body class="bg-light">
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h3 class="card-title mb-3">Forgot your password?</h3>
          <p class="text-muted">Enter your registered email and we'll send a one-time reset code.</p>
          <%
             String csrf = (String) session.getAttribute("csrfToken");
             if (csrf == null) { csrf = java.util.UUID.randomUUID().toString(); session.setAttribute("csrfToken", csrf); }
          %>
          <form method="post" action="ForgotPasswordServlet" id="forgotForm">
            <input type="hidden" name="csrfToken" value="<%= csrf %>" />
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" name="email" required>
            </div>
            <button type="submit" class="btn btn-primary">Send OTP</button>
            <a href="login.html" class="btn btn-link">Back to login</a>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
