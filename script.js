document.addEventListener("DOMContentLoaded", () => {
    // Navbar Scroll Effect
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
            navbar.classList.add("navbar--black");
        } else {
            navbar.classList.remove("navbar--black");
        }
    });

    // Initialize fetching and rendering
    init();

    // Setup Search
    setupSearch();
});

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

async function init() {
    // 1. Fetch Banner
    const originals = await fetchData(requests.fetchNetflixOriginals);
    if (originals && originals.length > 0) {
        const randomMovie = originals[Math.floor(Math.random() * originals.length)];
        setupBanner(randomMovie);
    }

    // 2. Fetch and render Rows
    const rowsContainer = document.getElementById("rows_container");
    
    await createRow(rowsContainer, "NETFLIX ORIGINALS", requests.fetchNetflixOriginals, true);
    await createRow(rowsContainer, "Trending Now", requests.fetchTrending);
    await createRow(rowsContainer, "Top Rated", requests.fetchTopRated);
    await createRow(rowsContainer, "Action Movies", requests.fetchActionMovies);
    await createRow(rowsContainer, "Comedy Movies", requests.fetchComedyMovies);
    await createRow(rowsContainer, "Horror Movies", requests.fetchHorrorMovies);
    await createRow(rowsContainer, "Romance Movies", requests.fetchRomanceMovies);
    await createRow(rowsContainer, "Documentaries", requests.fetchDocumentaries);
}

function setupBanner(movie) {
    const banner = document.getElementById("banner");
    const bannerTitle = document.getElementById("banner_title");
    const bannerDescription = document.getElementById("banner_description");

    banner.style.backgroundImage = `url("${IMAGE_BASE_URL}${movie.backdrop_path}")`;
    bannerTitle.textContent = movie?.title || movie?.name || movie?.original_name;
    
    // truncate description
    let desc = movie?.overview || "";
    if (desc.length > 150) {
        desc = desc.substring(0, 150) + "...";
    }
    bannerDescription.textContent = desc;
}

async function createRow(container, title, endpoint, isLarge = false) {
    const movies = await fetchData(endpoint);
    if (!movies || movies.length === 0) return;

    // Create Row container
    const rowEl = document.createElement("div");
    rowEl.className = "row";

    // Create Title
    const titleEl = document.createElement("h2");
    titleEl.textContent = title;
    rowEl.appendChild(titleEl);

    // Create Posters container
    const postersEl = document.createElement("div");
    postersEl.className = "row__posters";

    // Add movies
    movies.forEach(movie => {
        const posterPath = isLarge ? movie.poster_path : movie.backdrop_path;
        if (!posterPath) return; // skip if no image

        const img = document.createElement("img");
        img.className = `row__poster ${isLarge ? "row__posterLarge" : ""}`;
        img.src = `${IMAGE_BASE_URL}${posterPath}`;
        img.alt = movie.name || movie.title;

        postersEl.appendChild(img);
    });

    rowEl.appendChild(postersEl);
    container.appendChild(rowEl);
}

function setupSearch() {
    const searchIcon = document.getElementById("search_icon");
    const searchBox = document.getElementById("search_box");
    const searchInput = document.getElementById("search_input");
    const searchResultsContainer = document.getElementById("search_results_container");
    const searchResultsGrid = document.getElementById("search_results_grid");
    const rowsContainer = document.getElementById("rows_container");
    const banner = document.getElementById("banner");

    searchIcon.addEventListener("click", () => {
        searchBox.classList.toggle("active");
        if (searchBox.classList.contains("active")) {
            searchInput.focus();
        } else {
            searchInput.value = "";
            clearSearch();
        }
    });

    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length > 0) {
            debounceTimer = setTimeout(() => {
                performSearch(query);
            }, 500);
        } else {
            clearSearch();
        }
    });

    async function performSearch(query) {
        banner.style.display = "none";
        rowsContainer.style.display = "none";
        searchResultsContainer.style.display = "block";
        
        const results = await fetchData(requests.searchMovies(query));
        renderSearchResults(results);
    }

    function clearSearch() {
        banner.style.display = "block";
        rowsContainer.style.display = "block";
        searchResultsContainer.style.display = "none";
        searchResultsGrid.innerHTML = "";
    }

    function renderSearchResults(movies) {
        searchResultsGrid.innerHTML = "";
        
        if (!movies || movies.length === 0) {
            searchResultsGrid.innerHTML = "<p style='color: white;'>No results found.</p>";
            return;
        }

        movies.forEach(movie => {
            const posterPath = movie.poster_path || movie.backdrop_path;
            if (!posterPath) return;

            const img = document.createElement("img");
            img.src = `${IMAGE_BASE_URL}${posterPath}`;
            img.alt = movie.name || movie.title;
            
            searchResultsGrid.appendChild(img);
        });
    }
}
