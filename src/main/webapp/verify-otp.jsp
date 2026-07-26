<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verify OTP · Booknook</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h3 class="card-title mb-3">Enter OTP</h3>
          <p class="text-muted">Check your email for a 6-digit code. It expires in 5 minutes.</p>
          <%
             String csrf = (String) session.getAttribute("csrfToken");
             if (csrf == null) { csrf = java.util.UUID.randomUUID().toString(); session.setAttribute("csrfToken", csrf); }
          %>
          <form method="post" action="VerifyOtpServlet">
            <input type="hidden" name="csrfToken" value="<%= csrf %>" />
            <div class="mb-3">
              <label for="otp" class="form-label">One-time code</label>
              <input type="text" class="form-control" id="otp" name="otp" pattern="\d{6}" required>
            </div>
            <button type="submit" class="btn btn-primary">Verify</button>
            <button type="button" class="btn btn-link" id="resendBtn">Resend OTP</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
document.getElementById('resendBtn').addEventListener('click', async function(){
  const csrf = '<%= csrf %>';
  const resp = await fetch('ResendOtpServlet', {method:'POST', headers: {'X-CSRF-Token': csrf}});
  const text = await resp.text();
  alert(text.replace(/<[^>]*>?/gm, ''));
});
</script>
</body>
</html>
