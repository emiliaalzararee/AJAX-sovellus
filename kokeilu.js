const apiKey = '7b4574943fa5a148b8c1c1c8dba5d38a'; 
// haetaan "hae"-nappi ja laatikko, johon haettu vastaus tulee
const searchBtn = document.getElementById('searchBtn');
const moviesContainer = document.getElementById('movies-container');

// uusi laatikko jonne edelliset hakutulokset tallennetaan
const previousContainer = document.getElementById('previous-container');

// uusi laatikko aiemmille hakutuloksille
let previousSearches = [];

// ladataan localStoragesta tiedot
window.addEventListener('DOMContentLoaded', () => {
    const savedSearches = localStorage.getItem('previousSearches');
    if(savedSearches) {
        previousSearches = JSON.parse(savedSearches);
        previousSearches.forEach(movie => createPreviousCard(movie));
    }
});

// lisätään kuuntelija ja toiminto haku-napille
searchBtn.addEventListener('click', function() {
  const searchInput = document.getElementById('search').value.trim();

  // tyhjennetään aiemmat ilmoitukset
  moviesContainer.innerHTML= '';

  // jos hakukenttä on tyhjä, ilmoitetaan siitä käyttäjälle
  if (!searchInput) {
    alert('Please enter a movie name!');
    return;
  }

  // haetaan käyttäjän valitsema elokuva
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchInput)}`;

  // lähetetään pyyntö ja tarkistetaan status
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network error: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
        // jos elokuvia ei löydy haulla, ilmoitetaan siitä käyttäjälle
        if (data.results.length === 0) {
            moviesContainer.innerHTML = '<p>No movies found.</p>';
            return;
        }

        // näytetään vain ensimmäinen elokuva
        const movie = data.results[0];

        // kutsutaan funktiota, joka luo overlay-kortin
        showMovieCard(movie);

        // tallennetaan hakutulos aiempien hakutuloksien listaan
        addToPreviousSearches(movie);
    })
    // näytetään mahdolliset virheet
    .catch(error => {
        moviesContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        console.error('Virhe:', error);
    });
});

// Haku myös Enter-näppäimellä
document.getElementById('search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

// tehdään overlay taustan ja kortin
function showMovieCard(movie) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    movieCard.innerHTML = `
    <button class="close-btn">&times;</button>
    <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w400' + movie.poster_path : ''}" alt="${movie.title}">
    <div class="movie-info">
        <h2>${movie.title}</h2>
        <p><strong>Release date:</strong> ${movie.release_date || 'unknown'}</p>
        <p>${movie.overview || 'no description available'} </p>
    </div>
    `;

    overlay.appendChild(movieCard);
    document.body.appendChild(overlay);

    // käyttäjä voi sulkea kortin napista
    movieCard.querySelector('.close-btn').addEventListener('click', () => overlay.remove());

    // kortti sulkeutuu myös, jos käyttäjä klikkaa taustaa
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });
}

// lisätään edelliset haut kivaan riviin pikkukortteihin
function addToPreviousSearches(movie) {
    // ei lisätä kaksoiskappaleita hauista
    if (previousSearches.find(m => m.id === movie.id)) return;

    previousSearches.push(movie);

    // tallennetaan localStorageen
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));

    createPreviousCard(movie);
}

// luodaan pikkukortti edellisille hauille
function createPreviousCard(movie) {
    const card = document.createElement('div');
    card.classList.add('previous-card');
// lisätään pieni nappi, josta käyttäjä voi poistaa kortin listasta
const closeBtn = document.createElement('button');
closeBtn.classList.add('close-card-btn');
closeBtn.innerHTML = '&times;';

//lisätään napille kuuntelija
closeBtn.addEventListener('click', (e) => {
    // estää kortin click- eventin 
    e.stopPropagation();
    // poistetaan kortti
    card.remove();
    // poistetaan kortti myös edellisistä hauista
    previousSearches = previousSearches.filter (m => m.id !== movie.id);
    localStorage.setItem('previousSearches', JSON.stringify(previousSearches));

});

    card.innerHTML = `
        ${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">` : ''}
        <div class="movie-info">
            <h2>${movie.title}</h2>
        </div>
    `;

    // sijoitetaan nappi kortin sisälle
    card.appendChild(closeBtn);
    
    // jos käyttäjä klikkaa korttia uudelleen, näytetään se iso kortti
    card.addEventListener('click', () => showMovieCard(movie));

    previousContainer.appendChild(card);
}
