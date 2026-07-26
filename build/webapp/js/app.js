/**
 * CUSTOMER STOREFRONT NAVIGATION CONTROLLER
 * Real-time Virtual Catalog Paging Layout, Active Multi-Property Queries Filters Engine
 */

let currentPage = 1;
const booksPerPage = 24;
let currentFilterTab = 'all';
let filteredBooksMaster = [];

// Filter complete dataset on criteria variables matching layout filter state loops
async function applyCatalogFilters() {
  const searchBarInput = document.getElementById('searchInput');
  const searchTerm = searchBarInput ? searchBarInput.value.toLowerCase().trim() : '';
  
  const authorSelect = document.getElementById('authorFilter');
  const selectedAuthor = authorSelect ? authorSelect.value : '';
  
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const minPrice = minPriceInput && minPriceInput.value !== '' ? parseFloat(minPriceInput.value) : 0;
  const maxPrice = maxPriceInput && maxPriceInput.value !== '' ? parseFloat(maxPriceInput.value) : 5000;
  
  const sortSelect = document.getElementById('sortSelect');
  const sortBy = sortSelect ? sortSelect.value : 'id';
  
  // Dynamic async initialization stream pull
  const allBooks = await getBooks();

  filteredBooksMaster = allBooks.filter(book => {
    // Evaluation Logic Loops Matching Core Data Schema
    const matchesSearch = !searchTerm || 
                          book.name.toLowerCase().includes(searchTerm) || 
                          book.author.toLowerCase().includes(searchTerm);
                          
    const matchesAuthor = !selectedAuthor || book.author === selectedAuthor;
    const matchesPrice = book.price >= minPrice && book.price <= maxPrice;
    
    let matchesCategoryTab = true;
    if (currentFilterTab === 'ncert') {
      matchesCategoryTab = book.author === 'NCERT';
    } else if (currentFilterTab === 'programming') {
      matchesCategoryTab = book.genre === 'Programming';
    } else if (currentFilterTab === 'fiction') {
      matchesCategoryTab = book.genre === 'Fiction';
    } else if (currentFilterTab === 'scripture') {
      matchesCategoryTab = book.genre === 'Scripture';
    } else if (currentFilterTab === 'selfhelp') {
      matchesCategoryTab = book.genre === 'Self-help';
    }
    
    return matchesSearch && matchesAuthor && matchesPrice && matchesCategoryTab;
  });

  // Execute specific sorting arrangements mapping
  if (sortBy === 'priceAsc') {
    filteredBooksMaster.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    filteredBooksMaster.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredBooksMaster.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filteredBooksMaster.sort((a, b) => a.id - b.id);
  }

  // Update dynamic metric counter layout strings elements if accessible
  const resultCountEl = document.getElementById('resultCount');
  if (resultCountEl) resultCountEl.innerText = filteredBooksMaster.length;
  
  currentPage = 1;
  renderCatalogGrid();
  buildDynamicPaginationControls();
}

// Generate structural item catalog display cards on client view port grid mapping layers
function renderCatalogGrid() {
  const gridContainer = document.getElementById('booksContainer');
  if (!gridContainer) return;

  const startIndex = (currentPage - 1) * booksPerPage;
  const targetPageBooksSlice = filteredBooksMaster.slice(startIndex, startIndex + booksPerPage);

  if (targetPageBooksSlice.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-books-message" style="grid-column: 1/-1; text-align:center; padding:4rem;">
        <i class="fas fa-book-open" style="font-size:3.5rem; margin-bottom:1rem; opacity:0.4;"></i>
        <h3>No titles match your selection criteria parameters.</h3>
        <p style="color:var(--text-muted);">Try clearing active fields parameters configurations or broadening price filters limits.</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = targetPageBooksSlice.map((book, layoutIndex) => `
    <div class="book-card fade-up" style="--order: ${layoutIndex % 6}" onclick="openBookPreviewModal(${book.id})">
      <div class="book-card-badge">${escapeHtml(book.genre || 'General')}</div>
      <div class="book-title" title="${escapeHtml(book.name)}">${escapeHtml(book.name)}</div>
      <div class="book-author">by ${escapeHtml(book.author)}</div>
      <div class="price-container">
        <span class="currency-symbol">₹</span><span class="price">${book.price}</span>
      </div>
      <button class="btn-storage ripple" onclick="event.stopPropagation(); handleCatalogAddToCart(${book.id}, '${escapeHtml(book.name).replace(/'/g, "\\'")}', ${book.price})">
        <i class="fas fa-cart-plus"></i> Add to Cart
      </button>
    </div>
  `).join('');
}

// Open modal dialogue context panel element frames mapping dynamic specifications fields
window.openBookPreviewModal = async function(id) {
  const books = await getBooks();
  const book = books.find(b => b.id === id);
  if (!book) return;
  
  const modalBody = document.getElementById('modalBody');
  if (!modalBody) return;
  
  modalBody.innerHTML = `
    <div class="modal-detail-wrapper" style="display:flex; gap:2rem; flex-wrap:wrap; padding:0.5rem;">
      <div class="modal-cover-mock" style="flex:1; min-width:200px; background:linear-gradient(135deg, var(--accent-primary, #4a90e2) 0%, #2c3e50 100%); border-radius:16px; min-height:280px; display:flex; align-items:center; justify-content:center; color:#fff; padding:1.5rem; text-align:center; font-weight:bold; box-shadow:0 8px 24px rgba(0,0,0,0.15);">
         <div>
           <i class="fas fa-book" style="font-size:3.5rem; margin-bottom:1rem;"></i>
           <div style="font-size:1.1rem;">${escapeHtml(book.name)}</div>
         </div>
      </div>
      <div style="flex:1.5; min-width:240px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span class="admin-genre-tag" style="margin-bottom:0.5rem; display:inline-block;">${escapeHtml(book.genre || 'General')}</span>
          <h2 style="margin:0 0 0.5rem 0; font-size:1.6rem; line-height:1.2;">${escapeHtml(book.name)}</h2>
          <p style="margin:0 0 1rem 0; color:var(--text-muted); font-size:1.05rem;">by <strong style="color:var(--text-main);">${escapeHtml(book.author)}</strong></p>
          
          <div style="background:rgba(0,0,0,0.03); padding:1rem; border-radius:12px; margin-bottom:1rem;">
            <div style="margin-bottom:0.4rem;"><strong>Format Architecture:</strong> ${escapeHtml(book.format || 'Paperback')}</div>
            <div style="margin-bottom:0.4rem;"><strong>Subject Classification:</strong> ${escapeHtml(book.subject || 'General')}</div>
            <div><strong>Academic Grading Scope:</strong> ${escapeHtml(book.class || 'General')}</div>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(0,0,0,0.08); padding-top:1rem; margin-top:1rem;">
          <div>
            <span style="font-size:0.85rem; color:var(--text-muted); display:block;">Unit Net Cost Value</span>
            <span style="font-size:1.5rem; font-weight:700; color:var(--text-main);">₹${book.price}</span>
          </div>
          <button class="btn-storage" style="margin:0; padding:0.8rem 1.5rem;" onclick="addToCart(${book.id}, '${escapeHtml(book.name).replace(/'/g, "\\'")}', ${book.price}); closeBookPreviewModal();">
            <i class="fas fa-shopping-bag"></i> Add To Cart Basket
          </button>
        </div>
      </div>
    </div>
  `;
  const previewModal = document.getElementById('bookModal');
  if (previewModal) previewModal.style.display = 'block';
};

window.closeBookPreviewModal = function() {
  const previewModal = document.getElementById('bookModal');
  if (previewModal) previewModal.style.display = 'none';
};

// Verify identity active state before pushing reference metrics items into storage cache
window.handleCatalogAddToCart = function(id, name, price) {
  if (!isLoggedIn()) {
    showToast('Session access unverified. Routing to identity verification login portal...', 'error');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }
  
  let currentCartArray = JSON.parse(localStorage.getItem('booknook_cart')) || [];
  const existingItemIndex = currentCartArray.findIndex(item => item.id === id);
  
  if (existingItemIndex !== -1) {
    currentCartArray[existingItemIndex].quantity += 1;
  } else {
    currentCartArray.push({ id, title: name, price, quantity: 1 });
  }
  
  localStorage.setItem('booknook_cart', JSON.stringify(currentCartArray));
  if (typeof updateCartUI === 'function') updateCartUI();
  showToast(`"${name}" successfully appended onto checkout stack.`, 'success');
};

// Build pagination control button groups dynamically matching tracked array item lengths
function buildDynamicPaginationControls() {
  const totalPages = Math.ceil(filteredBooksMaster.length / booksPerPage) || 1;
  
  const totalPagesDisplay = document.getElementById('totalPagesDisplay');
  const currentPageDisplay = document.getElementById('currentPageDisplay');
  if (totalPagesDisplay) totalPagesDisplay.innerText = totalPages;
  if (currentPageDisplay) currentPageDisplay.innerText = currentPage;
  
  const paginationWrapperDiv = document.getElementById('pagination');
  if (!paginationWrapperDiv) return;
  
  let controlButtonsHtml = `<button class="page-btn" onclick="executeCatalogPageChange(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ Previous</button>`;
  
  // Balanced tracking loop boundaries generation algorithm targeting center indices bounds
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
      controlButtonsHtml += `<button class="page-btn ${pageNum === currentPage ? 'active' : ''}" onclick="executeCatalogPageChange(${pageNum})">${pageNum}</button>`;
    } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
      controlButtonsHtml += `<span class="pagination-dots" style="padding:0 0.5rem; opacity:0.5;">...</span>`;
    }
  }
  
  controlButtonsHtml += `<button class="page-btn" onclick="executeCatalogPageChange(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button>`;
  paginationWrapperDiv.innerHTML = controlButtonsHtml;
}

window.executeCatalogPageChange = function(targetPageNum) {
  const totalPagesCountBound = Math.ceil(filteredBooksMaster.length / booksPerPage);
  if (targetPageNum < 1 || targetPageNum > totalPagesCountBound) return;
  
  currentPage = targetPageNum;
  renderCatalogGrid();
  buildDynamicPaginationControls();
  
  // Smooth reset display viewing focus positioning matrix back to core content header view
  const catalogSectionHeader = document.getElementById('catalogHeaderTitle') || document.getElementById('booksContainer');
  if (catalogSectionHeader) {
    catalogSectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }
};

// Dynamic mapping data assembly query grouping routine arrays fields for filters selectors options
async function populateAuthorsSelectionMenu() {
  const books = await getBooks();
  const distinctSortedAuthors = [...new Set(books.map(b => b.author))].sort();
  const authorSelectDropElement = document.getElementById('authorFilter');
  
  if (authorSelectDropElement) {
    authorSelectDropElement.innerHTML = '<option value="">All Registered Authors</option>' +
      distinctSortedAuthors.map(authorName => `<option value="${escapeHtml(authorName)}">${escapeHtml(authorName)}</option>`).join('');
  }
}

// Synchronize profile dynamic parameters layouts headers structures interfaces badges metrics counters
async function updateStatsCountersDataLayers() {
  const books = await getBooks();
  const totalStockEl = document.getElementById('totalStock');
  const inventoryCountEl = document.getElementById('inventoryCount');
  
  if (totalStockEl) totalStockEl.innerText = books.length;
  if (inventoryCountEl) inventoryCountEl.innerText = books.length;
}

// Perform active sub-group metrics parameters validation calculations totals
async function recalculateAndDisplayCategoryBadges() {
  const books = await getBooks();
  
  const counts = {
    ncert: books.filter(b => b.author === 'NCERT').length,
    prog: books.filter(b => b.genre === 'Programming').length,
    fic: books.filter(b => b.genre === 'Fiction').length,
    scrip: books.filter(b => b.genre === 'Scripture').length,
    self: books.filter(b => b.genre === 'Self-help').length
  };
  
  const elNcert = document.getElementById('statNcert');
  const elProg = document.getElementById('statProgramming');
  const elFic = document.getElementById('statFiction');
  const elScrip = document.getElementById('statScripture');
  const elSelf = document.getElementById('statSelfHelp');
  
  if (elNcert) elNcert.innerText = counts.ncert;
  if (elProg) elProg.innerText = counts.prog;
  if (elFic) elFic.innerText = counts.fic;
  if (elScrip) elScrip.innerText = counts.scrip;
  if (elSelf) elSelf.innerText = counts.self;
}

// Master execution thread listener assembly activation lifecycle
document.addEventListener('DOMContentLoaded', async () => {
  // Ensure background asynchronous updates clear sequencing loops independently
  await updateStatsCountersDataLayers();
  await populateAuthorsSelectionMenu();
  await recalculateAndDisplayCategoryBadges();
  await applyCatalogFilters();

  // Attach elements execution listeners hooks triggers functions objects mapping
  document.getElementById('searchBtn')?.addEventListener('click', applyCatalogFilters);
  document.getElementById('applyFilters')?.addEventListener('click', applyCatalogFilters);
  document.getElementById('sortSelect')?.addEventListener('change', applyCatalogFilters);
  
  document.getElementById('minPrice')?.addEventListener('change', applyCatalogFilters);
  document.getElementById('maxPrice')?.addEventListener('change', applyCatalogFilters);

  // Register interactive transformation behaviors on categories navigation tab elements arrays links
  document.querySelectorAll('.filter-tabs a').forEach(tabElement => {
    tabElement.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelectorAll('.filter-tabs a').forEach(t => t.classList.remove('active'));
      tabElement.classList.add('active');
      currentFilterTab = tabElement.dataset.filter;
      applyCatalogFilters();
    });
  });

  // Handle active sessions styling structures profile cards alterations interfaces layouts controls
  const authenticatedUserProfile = getCurrentUser();
  if (authenticatedUserProfile && !authenticatedUserProfile.isAdmin) {
    const profileWrapperSection = document.getElementById('userProfile');
    const loginPortalRouteLink = document.getElementById('loginLink');
    const registerPortalRouteLink = document.getElementById('registerLink');
    
    if (profileWrapperSection && loginPortalRouteLink && registerPortalRouteLink) {
      loginPortalRouteLink.style.display = 'none';
      registerPortalRouteLink.style.display = 'none';
      profileWrapperSection.style.display = 'flex';
      
      const targetProfileHeaderNameElement = document.getElementById('userName');
      if (targetProfileHeaderNameElement) {
        targetProfileHeaderNameElement.innerText = authenticatedUserProfile.name.split(' ')[0];
      }
      
      document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  }
});