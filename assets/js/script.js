// Token de la API y su URL
const token = '92fa6610faba6ee2e7fb2e85002f98f7';
const apiUrl = `https://www.superheroapi.com/api.php/${token}`;

// Referencias al DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const genderSelect = document.getElementById('gender-select');
const minHeightInput = document.getElementById('min-height');
const minWeightInput = document.getElementById('min-weight');
const raceInput = document.getElementById('race-select');
const eyeColorInput = document.getElementById('eye-color');
const hairColorInput = document.getElementById('hair-color');
const resultsContainer = document.getElementById('results');

// Almacenar los héroes obtenidos
let allHeroesCache = [];

// Evento para empezar la búsqueda
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const query = searchInput.value.trim();

  if (query === '') {
    fetchAllHeroes();
  } else {
    fetchHeroesByName(query);
  }
});

// Obtener todos los héroes por ID
async function fetchAllHeroes() {
  showLoading();
  try {
    const ids = Array.from({ length: 731 }, (_, i) => i + 1);
    const requests = ids.map(id =>
      fetch(`${apiUrl}/${id}`).then(res => res.json())
    );

    // Esperar a que terminen las solicitudes
    const all = await Promise.all(requests);

    // Filtrar las respuestas 
    allHeroesCache = all.filter(hero => hero.response === 'success');

    applyFiltersAndDisplay();
  } catch (err) {
    console.error(err);
    showError("Error loading heroes.");
  }
}

// Obtener héroes por su nombre
async function fetchHeroesByName(name) {
  showLoading();
  try {
    const res = await fetch(`${apiUrl}/search/${name}`);
    const data = await res.json();

    if (data.response === 'success') {
      allHeroesCache = data.results;
      applyFiltersAndDisplay();
    } else {
      allHeroesCache = [];
      showError(`No heroes found for "${name}".`);
    }
  } catch (err) {
    console.error(err);
    showError("Search error.");
  }
}

// Función para aplicar los filtros y mostrar los personajes
// PD: No estoy seguro si esta es una forma eficiente de hacerlo pero funciona :)
function applyFiltersAndDisplay() {
  // Obtener los valores de los filtros
  const gender = genderSelect.value.toLowerCase();
  const race = raceInput.value.toLowerCase();
  const eyeColor = eyeColorInput.value.toLowerCase();
  const hairColor = hairColorInput.value.toLowerCase();
  const minHeight = parseInt(minHeightInput.value) || 0;
  const minWeight = parseInt(minWeightInput.value) || 0;

  // Filtrar en base a los filtros de apariencia
  const filtered = allHeroesCache.filter(hero => {
    const a = hero.appearance;

    // Normalizar los datos
    const g = a.gender.toLowerCase();
    const r = a.race ? a.race.toLowerCase() : '';
    const e = a['eye-color'] ? a['eye-color'].toLowerCase() : '';
    const h = a['hair-color'] ? a['hair-color'].toLowerCase() : '';
    const height = parseInt(a.height[1]) || 0;
    const weight = parseInt(a.weight[1]) || 0;

    // Aplicar cada filtro
    const matchesGender = !gender || g === gender;
    const matchesRace = !race || r.includes(race);
    const matchesEye = !eyeColor || e.includes(eyeColor);
    const matchesHair = !hairColor || h.includes(hairColor);
    const matchesHeight = !isNaN(height) && height >= minHeight;
    const matchesWeight = !isNaN(weight) && weight >= minWeight;

    // Incluir si coinciden los filtros
    return (
      matchesGender &&
      matchesRace &&
      matchesEye &&
      matchesHair &&
      matchesHeight &&
      matchesWeight
    );
  });

  displayHeroes(filtered);
}

// Función para mostrar los resultados
function displayHeroes(heroes) {
  resultsContainer.innerHTML = '';

  if (heroes.length === 0) {
    showError("No heroes match your filters.");
    return;
  }

  heroes.forEach(hero => {
    const a = hero.appearance;
    const b = hero.biography;
    const p = hero.powerstats;
    const card = document.createElement('div');
    card.className = 'hero-detail-card';

    card.innerHTML = `
      <div class="hero-detail-inner d-flex">
        <div class="hero-image">
          <img src="${hero.image.url}" alt="${hero.name}" class="img-fluid">
        </div>
        <div class="hero-info">
          <h3>${hero.name}</h3>
          <p><strong>Full Name:</strong> ${b['full-name'] || 'N/A'}</p>
          <p><strong>Gender:</strong> ${a.gender}</p>
          <p><strong>Race:</strong> ${a.race || 'Unknown'}</p>
          <p><strong>Height:</strong> ${a.height[1]}</p>
          <p><strong>Weight:</strong> ${a.weight[1]}</p>
          <p><strong>Eye Color:</strong> ${a['eye-color']}</p>
          <p><strong>Hair Color:</strong> ${a['hair-color']}</p>
          <p><strong>Powerstats:</strong><br>
            Strength: ${p.strength}, Speed: ${p.speed}, Intelligence: ${p.intelligence},<br>
            Power: ${p.power}, Durability: ${p.durability}, Combat: ${p.combat}
          </p>
        </div>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
}

// Función para mostrar el spinner de carga.
function showLoading() {
  resultsContainer.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
}

// Mostrar mensaje de error
function showError(message) {
  resultsContainer.innerHTML = `<p class="text-danger">${message}</p>`;
}