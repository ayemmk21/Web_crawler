console.log("JS is running");

let movies = [];
let originalMovies = [];
let currentMovies = [];

/* =========================
   LOAD DATA
========================= */

fetch("/api/films")
    .then(response => response.json())
    .then(data => {
        movies = data;
        originalMovies = [...data];
        currentMovies = [...data];

        if (document.getElementById("movieGrid")) {
            populateYearFilter();
            displayMovies(currentMovies);
            setupPagination(currentMovies);
            setupHomeEvents();
        }

        if (document.getElementById("detailsContainer")) {
            showDetails();
        }
    });

/* ================HOME PAGE===================== */

function populateYearFilter() {
    const yearFilter = document.getElementById("yearFilter");
    if (!yearFilter) return;
    const years = [...new Set(originalMovies.map(m => m.year))].sort((a, b) => b - a);
    years.forEach(year => {
        const opt = document.createElement("option");
        opt.value = year;
        opt.textContent = year;
        yearFilter.appendChild(opt);
    });
}

function setupHomeEvents() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", applyFilters);

    const yearFilter = document.getElementById("yearFilter");
    if (yearFilter) yearFilter.addEventListener("change", applyFilters);

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.addEventListener("change", applyFilters);
}

/* ================PAGING===================== */
const moviesPerPage = 24;
let currentPage = 1;

function displayMovies(list) {
    const grid = document.getElementById("movieGrid");
    if (!grid) return;

    grid.innerHTML = "";

    const start = (currentPage - 1) * moviesPerPage;
    const moviesToShow = list.slice(start, start + moviesPerPage);

    moviesToShow.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("card");

        movieCard.innerHTML = `
            <div class="movie-card">
                <img src="${movie.poster || ''}" alt="${movie.title}" class="movie-poster"
                     onerror="this.style.display='none'">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="year">${movie.year}</span>
                        <span class="wins">⭐ ${movie.awards || 1} wins</span>
                    </div>
                </div>
            </div>
        `;

        const originalIndex = originalMovies.indexOf(movie);
        movieCard.onclick = () => goToDetails(originalIndex);

        grid.appendChild(movieCard);
    });
}

function setupPagination(list) {
    const pageCount = Math.ceil(list.length / moviesPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (pageCount <= 1) return;

    function makeBtn(label, page, isActive) {
        const btn = document.createElement("button");
        btn.innerText = label;
        if (isActive) btn.classList.add("active-page");
        btn.addEventListener("click", () => {
            currentPage = page;
            displayMovies(list);
            setupPagination(list);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        return btn;
    }

    function makeEllipsis() {
        const span = document.createElement("span");
        span.innerText = "...";
        span.className = "pagination-ellipsis";
        return span;
    }

    // Prev
    const prev = makeBtn("‹", currentPage - 1, false);
    if (currentPage === 1) prev.disabled = true;
    pagination.appendChild(prev);

    // Windowed page numbers
    const delta = 2;
    const pagesToShow = [];
    for (let i = 1; i <= pageCount; i++) {
        if (i === 1 || i === pageCount || (i >= currentPage - delta && i <= currentPage + delta)) {
            pagesToShow.push(i);
        }
    }

    let lastPage = null;
    for (const page of pagesToShow) {
        if (lastPage !== null && page - lastPage > 1) {
            pagination.appendChild(makeEllipsis());
        }
        pagination.appendChild(makeBtn(page, page, page === currentPage));
        lastPage = page;
    }

    // Next
    const next = makeBtn("›", currentPage + 1, false);
    if (currentPage === pageCount) next.disabled = true;
    pagination.appendChild(next);
}

/* ================FILTER/SORT===================== */

function parseAmount(str) {
    if (!str || str === 'N/A') return -1;
    const match = str.match(/([₩€£$])?\s*([\d,.]+)\s*[–\-]?\s*([\d,.]+)?\s*(million|billion|thousand)?/i);
    if (!match) return -1;
    const lo = parseFloat(match[2].replace(/,/g, ''));
    const hi = match[3] ? parseFloat(match[3].replace(/,/g, '')) : lo;
    let num = (lo + hi) / 2;
    const unit = (match[4] || '').toLowerCase();
    if (unit === 'billion')       num *= 1_000_000_000;
    else if (unit === 'million')  num *= 1_000_000;
    else if (unit === 'thousand') num *= 1_000;
    // Ballpark conversion to USD
    const currency = match[1] || '$';
    if (currency === '€')  num *= 1.1;   // EUR → USD
    else if (currency === '£') num *= 1.27;  // GBP → USD
    else if (currency === '₩') num *= 0.00075; // KRW → USD
    return num;
}

function applyFilters() {
    const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const yearValue = document.getElementById("yearFilter")?.value || "All";
    const sortValue = document.getElementById("sortSelect")?.value || "default";

    let result = originalMovies.filter(movie => {
        const matchesSearch =
            (movie.title || "").toLowerCase().includes(searchValue) ||
            (movie.director || "").toLowerCase().includes(searchValue) ||
            (movie.starring || "").toLowerCase().includes(searchValue);
        const matchesYear = yearValue === "All" || movie.year == yearValue;
        return matchesSearch && matchesYear;
    });

    if (sortValue === "wins_desc") {
        result.sort((a, b) => (parseInt(b.awards) || 0) - (parseInt(a.awards) || 0));
    } else if (sortValue === "nominations_desc") {
        result.sort((a, b) => (parseInt(b.nominations) || 0) - (parseInt(a.nominations) || 0));
    } else if (sortValue === "budget_desc") {
        result.sort((a, b) => parseAmount(b.budget) - parseAmount(a.budget));
    } else if (sortValue === "boxoffice_desc") {
        result.sort((a, b) => parseAmount(b.box_office) - parseAmount(a.box_office));
    }

    currentMovies = result;

    const grid = document.getElementById("movieGrid");
    const noResults = document.getElementById("noResults");

    if (currentMovies.length === 0) {
        grid.style.display = "none";
        noResults.style.display = "flex";
        noResults.textContent = searchValue.trim()
            ? `No movies found for "${searchValue.trim()}"`
            : `No movies found`;
    } else {
        grid.style.display = "grid";
        noResults.style.display = "none";
        currentPage = 1;
        displayMovies(currentMovies);
        setupPagination(currentMovies);
    }
}

/* ================DETAILS PAGE===================== */

function goToDetails(index) {
    window.location.href = "/film/" + index;
}

function showDetails() {
    console.log("showDetails running");

    const container = document.getElementById("detailsContainer");
    if (!container) return;

    const index = Number(window.location.pathname.split("/").pop());
    console.log("index from URL:", index);
    console.log("movies length:", movies.length);

    if (isNaN(index) || index < 0 || index >= movies.length) {
        container.innerHTML = "<h2 style='padding:40px'>Movie not found</h2>";
        return;
    }

    const movie = movies[index];
    console.log("movie:", movie);

    container.innerHTML = `
    <div class="details-card">
        <img src="${movie.poster || ''}" alt="${movie.title}"
             onerror="this.style.display='none'">
        <div class="details-text">
            <h2>${movie.title}</h2>
            <p><strong>Year:</strong> ${movie.year}</p>
            <p><strong>Awards:</strong> ${movie.awards} wins / ${movie.nominations} nominations</p>
            <p><strong>Director:</strong> ${movie.director || 'N/A'}</p>
            <p><strong>Starring:</strong> ${movie.starring || 'N/A'}</p>
            <p><strong>Production:</strong> ${movie.production_companies || 'N/A'}</p>
            <p><strong>Distributor:</strong> ${movie.distributor || 'N/A'}</p>
            <p><strong>Running Time:</strong> ${movie.running_time || 'N/A'}</p>
            <p><strong>Country:</strong> ${movie.country || 'N/A'}</p>
            <p><strong>Budget:</strong> ${movie.budget || 'N/A'}</p>
            <p><strong>Box Office:</strong> ${movie.box_office || 'N/A'}</p>
            <p><strong>Language:</strong> ${movie.language || 'N/A'}</p>
        </div>
    </div>
    `;
}

function goBack() {
    window.location.href = "/";
}

/* ================LOGO CLICK===================== */

const logo = document.querySelector(".logo");

if (logo) {
    logo.addEventListener("click", () => {
        if (!document.getElementById("movieGrid")) {
            window.location.href = "/";
            return;
        }

        const searchInput = document.getElementById("searchInput");
        const yearFilter = document.getElementById("yearFilter");
        const sortSelect = document.getElementById("sortSelect");
        const noResults = document.getElementById("noResults");
        const grid = document.getElementById("movieGrid");

        if (searchInput) searchInput.value = "";
        if (yearFilter) yearFilter.value = "All";
        if (sortSelect) sortSelect.value = "default";

        currentMovies = [...originalMovies];
        currentPage = 1;

        displayMovies(currentMovies);
        setupPagination(currentMovies);

        if (noResults) noResults.style.display = "none";
        if (grid) grid.style.display = "grid";
    });
}
