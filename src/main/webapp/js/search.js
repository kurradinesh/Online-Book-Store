/**
 * SEARCH ENGINE
 * Optimized with event delegation for security and performance.
 */

async function handleSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const dropdown = document.getElementById('suggestionDropdown');
  const query = searchInput?.value?.toLowerCase().trim();

  if (!query || query.length < 2 || !dropdown) {
    if (dropdown) dropdown.style.display = 'none';
    return;
  }
  
  const books = await getBooks();
  const suggestions = books.filter(b =>
    b.name.toLowerCase().includes(query) ||
    b.author.toLowerCase().includes(query)
  ).slice(0, 6);
  
  if (suggestions.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  // Create HTML using a map and attaching data via dataset (safer than onclick string)
  dropdown.innerHTML = suggestions.map(s => `
    <div class="suggestion-item" data-book-name="${escapeHtml(s.name)}">
      <i class="fas fa-search"></i> ${escapeHtml(s.name)} <small>by ${escapeHtml(s.author)}</small>
    </div>
  `).join('');
  
  dropdown.style.display = 'block';
}

// Event Delegation: Handle clicks on the dropdown container
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const dropdown = document.getElementById('suggestionDropdown');

  if (searchInput) searchInput.addEventListener('input', handleSearchInput);

  if (dropdown) {
    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item');
      if (item) {
        searchInput.value = item.dataset.bookName;
        dropdown.style.display = 'none';
        document.getElementById('searchBtn')?.click();
      }
    });
  }
});

window.toggleAdvancedSearch = function() {
  const panel = document.getElementById('advancedSearchPanel');
  if (panel) panel.classList.toggle('show');
};