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

fetch("data.json")
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

// function displayMovies(movieArray) {
//     const grid = document.getElementById("movieGrid");
//     if (!grid) return;

//     grid.innerHTML = "";

//     movieArray.forEach((movie, index) => {
//         grid.innerHTML += `
//             <div class="card" onclick="goToDetails(${movies.indexOf(movie)})">
//                 <div class="poster-wrapper">
//                     <img src="${movie.poster}" alt="${movie.title}">
//                 </div>
//                 <h3>${movie.title}</h3>
//             </div>
//         `;
//     });
// }

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

    moviesToShow.forEach((movie, i) => {

        const movieCard = document.createElement("div");
        movieCard.classList.add("card");

        movieCard.innerHTML = `
            <div class="movie-card">

                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">

                <div class="movie-info">
                    <h3>${movie.title}</h3>

                    <div class="movie-meta">
                        <span class="year">${movie.year}</span>
                        <span class="wins">⭐ ${movie.wins || 1} wins</span>
                    </div>
                </div>

            </div>
        `;

        movieCard.onclick = () => goToDetails(movies.indexOf(movie));

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
            movie.title.toLowerCase().includes(searchValue) ||
            movie.director.toLowerCase().includes(searchValue) ||
            movie.starring.toLowerCase().includes(searchValue);
        const matchesYear = yearValue === "All" || movie.year == yearValue;
        return matchesSearch && matchesYear;
    });

    const grid = document.getElementById("movieGrid");
    const noResults = document.getElementById("noResults");

    const searchText = searchValue.trim();

    if (currentMovies.length === 0) {

        grid.style.display = "none";
        noResults.style.display = "flex";

        if (searchText !== "") {
            noResults.textContent = `No movies found for "${searchText}"`;
        } else {
            noResults.textContent = `No movies found`;
        }

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
    }

    else if (sortState === 2) {
        currentMovies.sort((a, b) => b.title.localeCompare(a.title));
        document.getElementById("sortBtn").textContent = "Sort: Z-A";
    }

    else {
        currentMovies = [...originalMovies];
        applyFilters(); // reapply search + year
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
    localStorage.setItem("selectedMovieIndex", index);
    window.location.href = "details.html";
}

function showDetails() {

    console.log("showDetails running");

    const container = document.getElementById("detailsContainer");
    console.log("container:", container);

    const index = Number(localStorage.getItem("selectedMovieIndex"));
    console.log("index:", index);

    console.log("movies length:", movies.length);

    const movie = movies[index];
    console.log("movie:", movie);

    if (!container) return;

    if (!movie) {
        container.innerHTML = "<h2 style='padding:40px'>Movie not found</h2>";
        return;
    }

    container.innerHTML = `
    <div class="details-card">
        <img src="${movie.poster}" alt="${movie.title}">
        
        <div class="details-text">
            <h2>${movie.title}</h2>

            <p><strong>Director:</strong> ${movie.director}</p>
            <p><strong>Starring:</strong> ${movie.starring}</p>
            <p><strong>Production:</strong> ${movie.production_companies}</p>
            <p><strong>Distributor:</strong> ${movie.distributor}</p>
            <p><strong>Running Time:</strong> ${movie.running_time}</p>
            <p><strong>Country:</strong> ${movie.country}</p>
            <p><strong>Budget:</strong> ${movie.budget}</p>
            <p><strong>Box Office:</strong> ${movie.box_office}</p>
            <p><strong>Language:</strong> ${movie.language}</p>

        </div>
    </div>
    `;
}
function goBack() {
    window.location.href = "index.html";
}

// const logo = document.querySelector(".logo");

// if (logo) {
//     logo.addEventListener("click", () => {
//         window.location.href = "index.html";
//     });
// }

const logo = document.querySelector(".logo");

if (logo) {
    logo.addEventListener("click", () => {

        // If NOT on homepage → go there
        if (!document.getElementById("movieGrid")) {
            window.location.href = "index.html";
            return;
        }

        // If already on homepage → reset everything smoothly
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