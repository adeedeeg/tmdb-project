const form = document.querySelector('form');
const apiKey = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDlkMWNmNzVmYjI2ZjljNzQ4Y2JlZjlhOTdiZWVhMyIsIm5iZiI6MTczNDY1NDY5My4zNTYsInN1YiI6IjY3NjRiYWU1MWIwNmM1ZjI4Yjc0ODYyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.SgSWhGUA5UcgHWmTj0f5E5wZzgofoNsjmN6sD4MNDoM'
const watchlistAdd = document.getElementById('watchlist-list');


//use input to search api
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const displayTitleCard = document.getElementById('title-card-store');//CHECK WHY THIS IS REQUIRED
  displayTitleCard.innerHTML = '';

  let query = form.querySelector('input').value;
  console.log(query);

  tmdbApi(query);
})


//search tmdb api for input
async function tmdbApi(query) {
  const req = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=1`, {
    headers: {
      Authorization: apiKey,
    }
  });
  let movies = await req.json();

  console.log(movies);
  await filterOutPeople(movies);
}

//remove people from the results
async function filterOutPeople(movies) {
  for (let movie of movies.results) {
    if (movie.media_type !== 'person') {
      await makeTitleCard(movie);
    } else {
      console.log('This is a person not a movie/TV show')
    }
  }
}

//await = makes an async function wait for a promise
//promise = object that links producing code and consuming code

//using movie or tv id to search in the provider database
async function watchProvidersApi(movie) {
  let providers;
  if (movie.media_type === 'movie') {
    let movieId = movie.id;
    let reqMovies = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`, {
      headers: {
        Authorization: apiKey,
      }
    })
    providers = await reqMovies.json();
  } else {
    let seriesId = movie.id;
    let reqSeries = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/watch/providers`, {
      headers: {
        Authorization: apiKey,
      }
    })
    providers = await reqSeries.json();
  }
  console.log(providers);
  return streamSites(providers);
}

//stating only the current stream providers
function streamSites(providers) {
  let flatrate = providers.results.GB?.flatrate;
  let streamProvider = [];
  if (flatrate && flatrate.length > 0) {
    streamProvider = flatrate.map(providers => providers.provider_name);
  } else {
    streamProvider = 'None'
  }
  console.log(streamProvider);
  return streamProvider;
}


async function makeTitleCard(movie) {
  //creating wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');

  //create and add poster
  const imageTitleContainer = document.querySelector('.image-title-container');
  let posterPath = movie.poster_path;
  let ImgUrl = `http://image.tmdb.org/t/p/w300/${posterPath}` //TODO: add function to do this
  const imageContainer = createImageContainer(ImgUrl);

  //title (movie name & year) and id
  let title = titleAll(movie);
  let id = movie.id;
  const titleContainer = createTitleContainer(title);

  addMovietoWatchlist(title, id, wrapper);

  //providers
  let provider = await watchProvidersApi(movie);
  const providerContainer = streamProviderContainer(provider);

  wrapper.appendChild(imageContainer);
  wrapper.appendChild(titleContainer);
  wrapper.appendChild(providerContainer);

  imageTitleContainer.appendChild(wrapper);
}


//movie name and year
function titleAll(movie) {
  let titleName = movie.title || movie.name || 'No title available';
  let titleDate = movie.release_date || movie.first_air_date || 'No year available';
  let titleYear = titleDate.substr(0, 4);
  let title = titleName.concat(' (', titleYear, ')');
  return title;
}


//create poster containers
function createImageContainer(ImgUrl) {
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');
  const img = document.createElement('img');
  img.src = ImgUrl;
  imageContainer.appendChild(img);
  return imageContainer;
}


//create name + year container
function createTitleContainer(title) {
  const titleContainer = document.createElement('div');
  titleContainer.classList.add('title-container');

  const titleText = document.createElement('p');
  titleText.textContent = title;
  titleContainer.appendChild(titleText);
  return titleContainer;
}


//create streaming provider container
function streamProviderContainer(provider) {
  const providerContainer = document.createElement('div');
  providerContainer.classList.add('provider-container');

  const providerSites = document.createElement('p');
  providerSites.textContent = provider;
  providerContainer.appendChild(providerSites);
  return providerContainer;
}


//adding title to watchlist when add button is clicked
function addMovietoWatchlist(title, id, wrapper) {
  const existingButtons = wrapper.querySelectorAll('button');
  existingButtons.forEach(button => button.remove());

  //add button and add to list function
  const addToWatchButton = document.createElement('button');
  addToWatchButton.classList.add('material-symbols-outlined');
  addToWatchButton.classList.add('add-button');
  addToWatchButton.textContent = 'add';

  wrapper.appendChild(addToWatchButton);

  addToWatchButton.addEventListener('click', () => {
    console.log(`${title} added to your watchlist!`);
    addMovieToHTMLList(title, id, wrapper);
    //remove add button
    addToWatchButton.remove();
    //add remove button
    removeButton(title, id, wrapper);
  });
}


function removeButton(title, id, wrapper) {
  const removeWatchButton = document.createElement('button');
  removeWatchButton.classList.add('material-symbols-outlined');
  removeWatchButton.classList.add('remove-button');
  removeWatchButton.textContent = 'check';

  wrapper.appendChild(removeWatchButton);

  removeWatchButton.addEventListener('click', () => {
    console.log(`${title} removed from your watchlist!`);
    removeWatchButton.remove();
    resetTitlecard(title, id, wrapper);
  });
}

function resetTitlecard(title, id, wrapper) {
  addMovietoWatchlist(title, id, wrapper);
  removeMovieFromHTMLList(title, id);
}


//remove array from html list
function removeMovieFromHTMLList(title, id) {
  let movieInWatchlist = document.getElementById(`${id}`);
  if (movieInWatchlist) {
    movieInWatchlist.remove(title, id);
  } else {

  }
}


//add array to html list
function addMovieToHTMLList(title, id, wrapper) {
  const sidebarWrapper = document.createElement('div');
  sidebarWrapper.classList.add('sidebar-wrapper');

  sidebarCrossButton(title, id, wrapper, sidebarWrapper);

  let li = document.createElement('li');
  li.id = `${id}`; //id added to diffrenciate movies that might have the same name
  li.innerHTML = title;

  li.appendChild(sidebarWrapper);
  watchlistAdd.appendChild(li);
}

//remove title from watch list when cross button is clicked
function sidebarCrossButton(title, id, wrapper, sidebarWrapper) {
  const crossButton = document.createElement('button');
  crossButton.classList.add('material-symbols-outlined');
  crossButton.classList.add('cross-button');
  crossButton.textContent = 'close'

  sidebarWrapper.appendChild(crossButton);

  crossButton.addEventListener('click', () => {
    console.log(`${title} removed from your watchlist!`);
    removeMovieFromHTMLList(title, id);
    resetTitlecard(title, id, wrapper);
  })
}

