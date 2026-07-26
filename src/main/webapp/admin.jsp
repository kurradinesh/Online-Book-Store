<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BOOKNOOK · Admin Dashboard</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* ===== GLOBAL RESETS & ENHANCEMENTS ===== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(145deg, #f4f1ea 0%, #eae3d5 100%);
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      color: #1e2a2e;
      min-height: 100vh;
    }

    /* ===== MODERN STORAGE BAR ===== */
    .storage-bar {
      background: rgba(47, 62, 70, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .storage-bar .left span {
      font-weight: 700;
      letter-spacing: 1px;
      background: linear-gradient(135deg, #ecd06f, #b9945c);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-size: 1.2rem;
    }

    .logout-btn {
      background: rgba(220, 53, 69, 0.9);
      color: white;
      padding: 8px 20px;
      border-radius: 40px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
    }

    .logout-btn:hover {
      background: #dc3545;
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(220,53,69,0.3);
    }

    /* ===== MAIN CONTAINER ===== */
    .admin-container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 2rem;
    }

    /* ===== HEADER CARD ===== */
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      background: rgba(255,255,255,0.4);
      backdrop-filter: blur(12px);
      padding: 1.5rem 2rem;
      border-radius: 32px;
      border: 1px solid rgba(255,255,255,0.6);
      box-shadow: 0 8px 20px rgba(0,0,0,0.05);
    }

    .admin-header h2 {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #2f3e46, #b9945c);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    /* ===== ADD BOOK BUTTON (GLASS) ===== */
    .btn-add {
      background: linear-gradient(95deg, #2f3e46, #3e5a4b);
      border: none;
      padding: 12px 28px;
      border-radius: 40px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 1rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .btn-add:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(47,62,70,0.3);
      background: linear-gradient(95deg, #3e5a4b, #2f3e46);
    }

    /* ===== ADD BOOK FORM (GLASS CARD + ANIMATION) ===== */
    .add-book-form {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(16px);
      border-radius: 28px;
      padding: 2rem;
      margin: 1.5rem 0 2rem;
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      display: none;
    }

    .add-book-form.visible {
      display: block;
      animation: fadeSlideUp 0.4s ease-out;
    }

    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group input {
      flex: 1;
      min-width: 180px;
      padding: 12px 18px;
      border: 1px solid #e2d8ca;
      border-radius: 60px;
      background: white;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #b9945c;
      box-shadow: 0 0 0 3px rgba(185,148,92,0.2);
    }

    .btn-save {
      background: #b9945c;
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 40px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
      width: 100%;
      font-size: 1rem;
    }

    .btn-save:hover {
      background: #9c7a4a;
      transform: scale(1.01);
    }

    /* ===== TABLE STYLES (MODERN, RESPONSIVE) ===== */
    .table-wrapper {
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(8px);
      border-radius: 28px;
      padding: 1.5rem;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      overflow-x: auto;
      transition: all 0.3s;
    }

    .admin-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 700px;
    }

    .admin-table th {
      text-align: left;
      padding: 1rem 1rem;
      background: #2f3e46;
      color: white;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .admin-table th:first-child {
      border-top-left-radius: 20px;
    }

    .admin-table th:last-child {
      border-top-right-radius: 20px;
    }

    .admin-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      background: rgba(255,255,255,0.5);
      transition: all 0.2s;
    }

    .admin-table tr:hover td {
      background: rgba(255,255,240,0.9);
      transform: scale(1.002);
    }

    /* action buttons */
    .actions-btn {
      padding: 8px 16px;
      border-radius: 40px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 8px;
      font-size: 0.8rem;
    }

    .btn-edit {
      background: #b9945c;
      color: white;
    }

    .btn-edit:hover {
      background: #9c7a4a;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(185,148,92,0.3);
    }

    .btn-delete {
      background: #c45a5a;
      color: white;
    }

    .btn-delete:hover {
      background: #a13e3e;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(196,90,90,0.3);
    }

    /* empty state */
    .empty-row td {
      text-align: center;
      padding: 3rem;
      font-style: italic;
      color: #7d6b51;
    }

    /* footer */
    .admin-footer {
      margin-top: 3rem;
      text-align: center;
      padding: 1.5rem;
      color: #5e4b3c;
      font-size: 0.8rem;
    }

    @media (max-width: 700px) {
      .admin-container { padding: 0 1rem; }
      .admin-header { flex-direction: column; align-items: stretch; text-align: center; }
      .form-group { flex-direction: column; }
      .storage-bar { padding: 0.8rem 1rem; }
    }
  </style>
</head>
<body>

<%
    // SECURITY GUARD: Only allow admins to see this page
    String userRole = (String) session.getAttribute("userRole");
    if (userRole == null || !"admin".equalsIgnoreCase(userRole)) {
        response.sendRedirect("login.html");
        return; 
    }
%>

<div class="storage-bar">
  <div class="left"><span><i class="fas fa-shield-alt"></i> ADMIN · BOOKNOOK</span></div>
  <div class="right">
       <a href="LogoutServlet" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
  </div>
</div>

<div class="admin-container">
  <div class="admin-header">
    <h2><i class="fas fa-book-open"></i> Inventory Manager</h2>
    <button onclick="toggleForm()" class="btn-add"><i class="fas fa-plus-circle"></i> Add New Book</button>
  </div>

  <!-- Add Book Form (enhanced) -->
  <div id="addBookForm" class="add-book-form">
    <form action="AddBookServlet" method="POST">
      <div class="form-group">
        <input type="text" name="title" placeholder="📖 Book Title" required>
        <input type="text" name="author" placeholder="✍️ Author" required>
        <input type="number" step="0.01" name="price" placeholder="💰 Price (₹)" required>
        <input type="text" name="genre" placeholder="🎭 Genre" required>
      </div>
      <button type="submit" class="btn-save"><i class="fas fa-save"></i> Save Book</button>
    </form>
  </div>

  <!-- Books Table -->
  <div class="table-wrapper">
    <table class="admin-table">
      <thead>
        <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
            <th>Genre</th>
            <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <% 
          List<String[]> books = (List<String[]>) request.getAttribute("bookList");
          if (books != null && !books.isEmpty()) {
              for (String[] book : books) {
        %>
          <tr>
              <td><%= book[0] %></td>
              <td><%= book[1] %></td>
              <td><%= book[2] %></td>
              <td>₹ <%= book[3] %></td>
              <td><%= book[4] %></td>
              <td>
                  <button class="actions-btn btn-edit" onclick="alert('Edit functionality can be connected to your backend.')"><i class="fas fa-edit"></i> Edit</button>
                  <button class="actions-btn btn-delete" onclick="if(confirm('Delete this book?')) alert('Delete endpoint would be called.');"><i class="fas fa-trash-alt"></i> Delete</button>
               </td>
           </tr>
        <% 
              } 
          } else {
        %>
          <tr class="empty-row"><td colspan="6"><i class="fas fa-database"></i> No books found in the database. Start by adding some!</td></tr>
        <% } %>
      </tbody>
    </table>
  </div>

  <div class="admin-footer">
    <i class="fas fa-warehouse"></i> BOOKNOOK Admin · Secure Inventory Management
  </div>
</div>

<script>
  function toggleForm() {
    const formDiv = document.getElementById('addBookForm');
    formDiv.classList.toggle('visible');
    // Smooth scroll to form when opened
    if (formDiv.classList.contains('visible')) {
      formDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Optional: auto-hide success message (if any flash messages later)
  // Keep all original behaviors intact
</script>

</body>
</html>