<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset Password · Booknook</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/reset-password.css">
</head>
<body class="bg-light">
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h3 class="card-title mb-3">Choose a new password</h3>
          <p class="text-muted">Your password must be at least 8 characters and include uppercase, lowercase, number and special character.</p>
          <%
             String csrf = (String) session.getAttribute("csrfToken");
             if (csrf == null) { csrf = java.util.UUID.randomUUID().toString(); session.setAttribute("csrfToken", csrf); }
          %>
          <form method="post" action="ResetPasswordServlet" id="resetForm">
            <input type="hidden" name="csrfToken" value="<%= csrf %>" />
            <div class="mb-3">
              <label for="password" class="form-label">New password</label>
              <input type="password" class="form-control" id="password" name="password" required>
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm password</label>
              <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required>
            </div>
            <div id="pwFeedback" class="mb-3"></div>
            <button type="submit" class="btn btn-primary">Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
function strength(p){
  let s=0; if(p.length>=8) s++; if(/[A-Z]/.test(p)) s++; if(/[a-z]/.test(p)) s++; if(/[0-9]/.test(p)) s++; if(/\W|_/.test(p)) s++; return s;
}
const pw = document.getElementById('password');
const cf = document.getElementById('confirmPassword');
const fb = document.getElementById('pwFeedback');
pw && pw.addEventListener('input', ()=>{
  const s = strength(pw.value);
  fb.innerText = ['Very weak','Weak','Okay','Good','Strong','Very strong'][s];
});
document.getElementById('resetForm').addEventListener('submit', function(e){
  if(pw.value!==cf.value){ e.preventDefault(); alert('Passwords do not match'); }
});
</script>
</body>
</html>
