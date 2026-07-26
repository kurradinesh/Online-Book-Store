/**
 * MANAGEMENT CRUD PANEL CONTROLLER
 * Row Modification Listeners, Asynchronous Form Handlers, and Role Authorization Guards
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Prevent unauthenticated accounts or standard shoppers from entry route scopes
  if (!isAdminLoggedIn()) {
    showToast('Unauthorized access redirection.', 'error');
    setTimeout(() => window.location.href = 'login.html', 1000);
    return;
  }

  // Render administrative data table logs dynamically
  async function renderAdminTable() {
    const tableBody = document.getElementById('adminBookList');
    if (!tableBody) return;

    // Show safe interface animation layer loading spinner element
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Synchronizing books database repository entries...</td></tr>`;

    try {
      const books = await getBooks();
      
      if (!books || books.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);"><i class="fas fa-folder-open"></i> Inventory catalog database currently empty.</td></tr>`;
        return;
      }

      tableBody.innerHTML = books.map(book => `
        <tr class="fade-up">
          <td><code>#${book.id}</code></td>
          <td><strong style="color:var(--text-main); font-weight:600;">${escapeHtml(book.name)}</strong></td>
          <td><span class="admin-author-badge">${escapeHtml(book.author)}</span></td>
          <td style="font-family:monospace; font-weight:600;">₹${parseFloat(book.price).toFixed(2)}</td>
          <td><span class="admin-genre-tag">${escapeHtml(book.genre || 'General')}</span></td>
          <td>
            <div style="display:flex; gap:0.5rem;">
              <button class="page-btn edit-btn" style="padding:0.4rem 0.8rem; font-size:0.85rem;" data-id="${book.id}">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="page-btn delete-btn" style="padding:0.4rem 0.8rem; font-size:0.85rem; background:#ff4d4d; border-color:#ff4d4d;" data-id="${book.id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      // Attach runtime tracking configurations to element modification arrays
      attachTableEventListeners();
    } catch (error) {
      console.error("Critical Admin View Rendering failure:", error);
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#ff4d4d;"><i class="fas fa-exclamation-circle"></i> Error fetching database array. Check Tomcat connection logs.</td></tr>`;
    }
  }

  // Core Execution Action Handlers Registration Layer Setup
  function attachTableEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editBookInline(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        if (confirm(`Are you absolutely sure you want to hard delete book metadata id record #${id}?`)) {
          const success = await deleteBook(id);
          if (success) {
            await renderAdminTable();
            if (typeof updateStats === 'function') updateStats();
            showToast('Book entry extracted successfully.', 'success');
          } else {
            showToast('Failed to drop record item entry.', 'error');
          }
        }
      });
    });
  }

  // Handle entry parameters modifications
  async function editBookInline(id) {
    const books = await getBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;

    const newName = prompt('Update book display title string:', book.name);
    if (newName === null) return; // Action aborted by developer choice
    
    const newPriceInput = prompt('Update inventory baseline unit value (₹):', book.price);
    if (newPriceInput === null) return;

    const newPrice = parseFloat(newPriceInput);
    
    let updates = {};
    if (newName.trim() !== '') updates.name = newName.trim();
    if (!isNaN(newPrice) && newPrice >= 0) updates.price = newPrice;
    
    if (Object.keys(updates).length > 0) {
      const success = await updateBook(id, updates);
      if (success) {
        await renderAdminTable();
        showToast('Database ledger parameters adjusted.', 'success');
      } else {
        showToast('Servlet system execution rejected parameters changes.', 'error');
      }
    } else {
      showToast('No modifications configured.', 'error');
    }
  }

  // Toggle record initialization container forms panels animation behaviors
  const showAddBtn = document.getElementById('showAddBookBtn');
  const formWrapperDiv = document.getElementById('addBookForm');
  if (showAddBtn && formWrapperDiv) {
    showAddBtn.addEventListener('click', () => {
      const isHidden = formWrapperDiv.style.display === 'none' || !formWrapperDiv.style.display;
      formWrapperDiv.style.display = isHidden ? 'block' : 'none';
      showAddBtn.innerHTML = isHidden ? '<i class="fas fa-times"></i> Close Control Form' : '<i class="fas fa-plus"></i> Add New Book Entry';
    });
  }

  // Parse layout strings fields and process raw dataset record creation commands
  const saveBookBtn = document.getElementById('saveBookBtn');
  if (saveBookBtn) {
    saveBookBtn.addEventListener('click', async () => {
      const titleInput = document.getElementById('bookTitle');
      const authorInput = document.getElementById('bookAuthor');
      const priceInput = document.getElementById('bookPrice');
      const genreInput = document.getElementById('bookGenre');

      const title = titleInput?.value.trim();
      const author = authorInput?.value.trim();
      const price = parseFloat(priceInput?.value);
      const genre = genreInput?.value.trim();
      
      if (!title || !author || isNaN(price) || price < 0) {
        showToast('Please correct validation issues. Fields cannot be empty or negative.', 'error');
        return;
      }
      
      const newBookSchema = {
        name: title,
        author: author,
        price: price,
        genre: genre || 'General',
        format: 'Paperback',
        subject: genre || 'General',
        class: 'General'
      };

      const result = await addBook(newBookSchema);
      if (result) {
        await renderAdminTable();
        
        // Hide entry wrapper cleanly on state confirmation execution
        if (formWrapperDiv) {
          formWrapperDiv.style.display = 'none';
          if (showAddBtn) showAddBtn.innerHTML = '<i class="fas fa-plus"></i> Add New Book Entry';
        }
        
        // Purge field strings targets inputs buffers clear loops
        titleInput.value = '';
        authorInput.value = '';
        priceInput.value = '';
        if (genreInput) genreInput.value = '';
        
        if (typeof updateStats === 'function') updateStats();
        showToast('Database node record deployed successfully.', 'success');
      } else {
        showToast('Data write execution exception via Servlet stream.', 'error');
      }
    });
  }

  // Execute base loop data layout rendering operations
  await renderAdminTable();

  // Attach exit security operations logs handler
  const logoutAdminBtn = document.getElementById('logoutAdminBtn');
  if (logoutAdminBtn) {
    logoutAdminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});