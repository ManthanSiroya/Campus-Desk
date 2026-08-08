const API_URL = 'http://localhost:5000/api/resources';
const token = localStorage.getItem('campusDeskToken');

if (!token) {
  window.location.href = 'login.html';
}

const resourceGrid = document.getElementById('resource-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const paginationControls = document.getElementById('pagination-controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

let currentPage = 1;
const limit = 8;
let searchTimer; 

async function fetchResources() {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;

  const url = new URL(API_URL);
  url.searchParams.append('page', currentPage);
  url.searchParams.append('limit', limit);
  if (search) url.searchParams.append('search', search);
  if (category) url.searchParams.append('category', category);

  resourceGrid.innerHTML = '';
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  paginationControls.classList.add('hidden');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await response.json();

    if (response.status === 401) {
      handleLogout();
      return;
    }

    if (!response.ok) throw new Error(data.error || 'Failed to load resources');

    renderResources(data.data);
    updatePagination(data.total);

  } catch (error) {
    errorState.innerText = error.message;
    errorState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
  }
}

function renderResources(resources) {
  if (resources.length === 0) {
    resourceGrid.innerHTML = '<p class="col-span-full text-center text-muted">No resources found matching your criteria.</p>';
    return;
  }

  resources.forEach(resource => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <span class="tag">${resource.category}</span>
      <h3>${resource.name}</h3>
      <p class="resource-card-location">${resource.location}</p>
      <p class="resource-card-desc">${resource.description || 'No description available.'}</p>
      <p class="resource-card-hours">Hours: ${resource.openTime} - ${resource.closeTime}</p>
      <button class="mt-auto" onclick="window.location.href='resource-detail.html?id=${resource._id}&name=${encodeURIComponent(resource.name)}'">View Availability</button>
    `;
    resourceGrid.appendChild(card);
  });
}

function updatePagination(totalItems) {
  if (totalItems <= limit) return; 

  paginationControls.classList.remove('hidden');
  const totalPages = Math.ceil(totalItems / limit);
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; fetchResources(); } });
nextBtn.addEventListener('click', () => { currentPage++; fetchResources(); });

categoryFilter.addEventListener('change', () => {
  currentPage = 1;
  fetchResources();
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage = 1;
    fetchResources();
  }, 400);
});

function handleLogout() {
  localStorage.removeItem('campusDeskToken');
  localStorage.removeItem('campusDeskRole');
  window.location.href = 'login.html';
}

document.getElementById('logout-btn').addEventListener('click', handleLogout);

fetchResources();