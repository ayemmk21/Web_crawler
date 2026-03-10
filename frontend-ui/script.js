console.log("JS is running");

let movies = [];
let originalMovies = [];
let currentMovies = [];
let sortState = 0;
// 0 = Default
// 1 = A-Z
// 2 = Z-A

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
            displayMovies(currentMovies);
            setupPagination(currentMovies);
            setupHomeEvents();
        }

        if (document.getElementById("detailsContainer")) {
            showDetails();
        }
    });

/* ================HOME PAGE===================== */

function setupHomeEvents() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    const yearFilter = document.getElementById("yearFilter");
    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
    }

    const sortBtn = document.getElementById("sortBtn");
    if (sortBtn) {
        sortBtn.addEventListener("click", handleSort);
    }
}

/* ================PAGING===================== */
const moviesPerPage = 24;
let currentPage = 1;

function displayMovies(movies) {
    const grid = document.getElementById("movieGrid");
    if (!grid) return;

    grid.innerHTML = "";

    const start = (currentPage - 1) * moviesPerPage;
    const end = start + moviesPerPage;
    const moviesToShow = movies.slice(start, end);

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

function setupPagination(movies) {
    const pageCount = Math.ceil(movies.length / moviesPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement("button");
        button.innerText = i;

        if (i === currentPage) {
            button.classList.add("active-page");
        }

        button.addEventListener("click", () => {
            currentPage = i;
            displayMovies(movies);
            setupPagination(movies);
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        pagination.appendChild(button);
    }
}

/* ================FILTER/SORT===================== */

function applyFilters() {
    const searchValue = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const yearValue = document.getElementById("yearFilter")?.value || "All";

    currentMovies = originalMovies.filter(movie => {
        const matchesSearch =
            (movie.title || "").toLowerCase().includes(searchValue) ||
            (movie.director || "").toLowerCase().includes(searchValue) ||
            (movie.starring || "").toLowerCase().includes(searchValue);
        const matchesYear = yearValue === "All" || movie.year == yearValue;
        return matchesSearch && matchesYear;
    });

    const grid = document.getElementById("movieGrid");
    const noResults = document.getElementById("noResults");
    const searchText = searchValue.trim();

    if (currentMovies.length === 0) {
        grid.style.display = "none";
        noResults.style.display = "flex";
        noResults.textContent = searchText !== ""
            ? `No movies found for "${searchText}"`
            : `No movies found`;
    } else {
        grid.style.display = "grid";
        noResults.style.display = "none";
        currentPage = 1;
        displayMovies(currentMovies);
        setupPagination(currentMovies);
    }
}

function handleSort() {
    sortState++;

    if (sortState === 1) {
        currentMovies.sort((a, b) => a.title.localeCompare(b.title));
        document.getElementById("sortBtn").textContent = "Sort: A-Z";
    } else if (sortState === 2) {
        currentMovies.sort((a, b) => b.title.localeCompare(a.title));
        document.getElementById("sortBtn").textContent = "Sort: Z-A";
    } else {
        currentMovies = [...originalMovies];
        applyFilters();
        sortState = 0;
        document.getElementById("sortBtn").textContent = "Sort: Default";
        return;
    }

    currentPage = 1;
    displayMovies(currentMovies);
    setupPagination(currentMovies);
}

/* ================DETAILS PAGE===================== */

function goToDetails(index) {
    window.location.href = "/film/" + index;
}

function showDetails() {
    console.log("showDetails running");

    const container = document.getElementById("detailsContainer");
    if (!container) return;

    // ← Read index from URL /film/5 → 5
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
        const noResults = document.getElementById("noResults");
        const grid = document.getElementById("movieGrid");

        if (searchInput) searchInput.value = "";
        if (yearFilter) yearFilter.value = "All";

        currentMovies = [...originalMovies];
        currentPage = 1;

        displayMovies(currentMovies);
        setupPagination(currentMovies);

        if (noResults) noResults.style.display = "none";
        if (grid) grid.style.display = "grid";
    });
}