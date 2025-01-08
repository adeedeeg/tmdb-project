const searchForm = document.getElementById('searchForm');
const apiKey = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDlkMWNmNzVmYjI2ZjljNzQ4Y2JlZjlhOTdiZWVhMyIsIm5iZiI6MTczNDY1NDY5My4zNTYsInN1YiI6IjY3NjRiYWU1MWIwNmM1ZjI4Yjc0ODYyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.SgSWhGUA5UcgHWmTj0f5E5wZzgofoNsjmN6sD4MNDoM'
const watchlistAdd = document.getElementById('watchlist-list');
// const logInForm = document.getElementById('LogInForm');

// filterButtonsWrapper();

// //log in button pressed
// logInForm.addEventListener('submit',(l) =>{
//   l.preventDefault();

//   const displaySidebar = document.getElementByClassName('sidebar-watchlist');
//   displaySidebar.innterHTML = 'My Watchlist';

// })


//use input to search api
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const displayTitleCard = document.getElementById('title-card-store');
  displayTitleCard.innerHTML = '';

  let query = searchForm.querySelector('input').value;
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
      console.log('This is a person not a movie/TV show');
    }
  }
}

function extractMediaType(movie){
  if (movie.media_type === 'movie'){
    return 'Movie';
  }else{
    return 'TV Series';
  }
}

function createMediaTypeContainer(mediaType){
  const mediaTypeContainer = document.createElement('div');
  mediaTypeContainer.classList.add('media-type-container');

  const mediaTypeText = document.createElement('p');
  mediaTypeText.textContent = mediaType;
  mediaTypeContainer.appendChild(mediaTypeText);

  return mediaTypeContainer;
}


function extractRatings(movie){
  ratingsPercent = Math.round(movie.vote_average * 10);
  ratings = `${ratingsPercent}% Rating of`;
  return ratings;
}

function createRatingsContainer(ratings){
  const ratingsContainer = document.createElement('div');
  ratingsContainer.classList.add('ratings-container');

  const ratingsText = document.createElement('p');
  ratingsText.textContent = ratings;
  ratingsContainer.appendChild(ratingsText);

  return ratingsContainer;
}

function extractSynopsis(movie){
  synopsis = movie.overview;
  return synopsis;
}

function createSynposisContainer(synopsis){
  const synposisOverlayContainer = document.createElement('div');
  synposisOverlayContainer.classList.add('synopsis-overlay-container');

  const synopsisText = document.createElement('p');
  synopsisText.textContent = synopsis;
  synopsisText.classList.add('synopsis-text');
  synposisOverlayContainer.appendChild(synopsisText);

  return synposisOverlayContainer;
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
  console.log('Providers info: ', providers);
  return streamLogoPath(providers);
  // return {
  //   currentStreamsOnly: () => currentStreamsOnly(providers),
  //   streamLogoPath: () => streamLogoPath(providers),
  // };
}

//NOT IN USE ANYMORE - streaming providers indicated by logos now
//stating only the current stream providers
// function currentStreamsOnly(providers) {
//   let flatrate = providers.results.GB?.flatrate;
//   let currentStreamProviders = [];
//   if (flatrate && flatrate.length > 0) {
//     currentStreamProviders = flatrate.map(providers => providers.provider_name);
//   } else {
//     currentStreamProviders = 'None'
//   }
//   console.log(currentStreamProviders);
//   return currentStreamProviders;
// }

//create streaming provider container
//replaced with logos
// function streamProviderContainer(provider) {
//   const providerContainer = document.createElement('div');
//   providerContainer.classList.add('provider-container');

//   const providerSites = document.createElement('p');
//   providerSites.textContent = provider;
//   providerContainer.appendChild(providerSites);
//   return providerContainer;
// }

//logo path for stream provider
function streamLogoPath(providers) {
  let flatrate = providers.results.GB?.flatrate;
  let streamProviderLogoPaths = [];

  if (flatrate && flatrate.length > 0) {
    streamProviderLogoPaths = flatrate.map(providers => providers.logo_path);
  } else {
    console.log('No provider logo path.')
  }
  console.log(streamProviderLogoPaths);
  return streamLogoURL(streamProviderLogoPaths);
}
// make logo URL
function streamLogoURL(streamProviderLogoPaths) {
  if (streamProviderLogoPaths && streamProviderLogoPaths.length > 0) {
    // Map each providerLogoPath to a complete URL
    let logoImgUrls = streamProviderLogoPaths.map(
      (providerLogoPath) => `https://image.tmdb.org/t/p/w45${providerLogoPath}`
    );
    // Log the generated URLs (optional)
    console.log('Generated Logo URLs:', logoImgUrls);
    // Return the array of complete URLs
    return logoImgUrls;
  } else {
    console.log('No logos available.');
    return []; // Return an empty array if no logos are found
  }
}

//create streaming provider logo container
function createLogoContainer(logoUrl) {
  const providerLogoContainer = document.createElement('div');
  providerLogoContainer.classList.add('provider-container');

  const providerLogoSites = document.createElement('img');
  providerLogoSites.src = logoUrl;
  providerLogoContainer.appendChild(providerLogoSites);
  return providerLogoContainer;
}

function createNoneLogoContainer(noneStatement){
  const noneLogoContainer = document.createElement('div');
  noneLogoContainer.classList.add('none-provider-container');

  const noneText = document.createElement('p');
  noneText.textContent = noneStatement;
  noneLogoContainer.appendChild(noneText);
  return noneLogoContainer;
}


async function makeTitleCard(movie) {
  //creating wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');

  //create and add poster
  const allContainer = document.querySelector('.all-container');
  
  let posterPath = movie.poster_path;
  let ImgUrl = `http://image.tmdb.org/t/p/w300/${posterPath}` //TODO: add function to do this
  const imageContainer = createImageContainer(ImgUrl);

  //synopsis overlay
  let synopsis = extractSynopsis(movie);
  const synopsisContainer = createSynposisContainer(synopsis);
  imageContainer.appendChild(synopsisContainer);

  //title (movie name & year) and id
  let title = titleAll(movie);
  let id = movie.id;
  const titleContainer = createTitleContainer(title);

  const mediaRatingWrapper = document.createElement('div');
  mediaRatingWrapper.classList.add('media-ratings-wrapper');

  //media type 
  let mediaType = extractMediaType(movie);
  const mediaTypeContainer = createMediaTypeContainer(mediaType);

  //ratings
  let ratings = extractRatings(movie);
  const ratingsContainer = createRatingsContainer(ratings);

  mediaRatingWrapper.appendChild(mediaTypeContainer);
  mediaRatingWrapper.appendChild(ratingsContainer);

  //adding elements to titlecard wrappers 
  wrapper.appendChild(imageContainer);
  wrapper.appendChild(titleContainer);
  wrapper.appendChild(mediaRatingWrapper);

  const addAndRemoveWrapper = document.createElement('div');
  addAndRemoveWrapper.classList.add('add-and-remove-button-wrapper');

  //button to add titles to watchlist 
  addMovietoWatchlist(title, id, addAndRemoveWrapper);

  wrapper.appendChild(addAndRemoveWrapper);
  wrapper.appendChild(document.createElement('hr'));

 
  //provider logos
  try {
    let logoImgUrls = await watchProvidersApi(movie);
    console.log('These logos will be listed: ', logoImgUrls);
    if (logoImgUrls && logoImgUrls.length > 0) {
      logoImgUrls.forEach((logoURL) => {
        let logoContainer = createLogoContainer(logoURL);
        wrapper.appendChild(logoContainer); 
      });
    } else {
      console.log('No provider logos found.');
      let noneStatement = 'Not currently streaming in the UK';
      let noneStatementContainer = createNoneLogoContainer(noneStatement);
      wrapper.appendChild(noneStatementContainer);
    } 
  } catch (error) {
    console.error('Error fetching provider data:', error);
  }

  allContainer.appendChild(wrapper);
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


//adding title to watchlist when add button is clicked
function addMovietoWatchlist(title, id, addAndRemoveWrapper) {
  const existingButtons = addAndRemoveWrapper.querySelectorAll('button');
  existingButtons.forEach(button => button.remove());

  //add button and add to list function
  const addToWatchButton = document.createElement('button');
  addToWatchButton.classList.add('material-symbols-outlined');
  addToWatchButton.classList.add('add-button');
  addToWatchButton.textContent = 'add';

  addAndRemoveWrapper.appendChild(addToWatchButton);

  addToWatchButton.addEventListener('click', () => {
    console.log(`${title} added to your watchlist!`);
    addMovieToHTMLList(title, id, addAndRemoveWrapper);
    //remove add button
    addToWatchButton.remove();
    //add remove button
    removeButton(title, id, addAndRemoveWrapper);
  });
}


function removeButton(title, id, addAndRemoveWrapper) {
  const removeWatchButton = document.createElement('button');
  removeWatchButton.classList.add('material-symbols-outlined');
  removeWatchButton.classList.add('remove-button');
  removeWatchButton.textContent = 'check';

  addAndRemoveWrapper.appendChild(removeWatchButton);

  removeWatchButton.addEventListener('click', () => {
    console.log(`${title} removed from your watchlist!`);
    removeWatchButton.remove();
    resetTitlecard(title, id, addAndRemoveWrapper);
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
  crossButton.textContent = 'close';

  sidebarWrapper.appendChild(crossButton);

  crossButton.addEventListener('click', () => {
    console.log(`${title} removed from your watchlist!`);
    removeMovieFromHTMLList(title, id);
    resetTitlecard(title, id, wrapper);
  })
}

function filterButtonsWrapper() {
  const mediaFilter = document.querySelector('.media-type-filter-buttons'); 

  const mediaFilterWrapper = document.createElement('div');
  mediaFilterWrapper.classList.add('filter-wrapper');

  const movieButton = document.createElement('button');
  movieButton.classList.add('movie-filter-button');
  movieButton.textContent = 'Movie';

  const tvButton = document.createElement('button');
  tvButton.classList.add('tv-filter-button');
  tvButton.textContent = 'TV';

  const bothButton = document.createElement('button');
  bothButton.classList.add('both-filter-button');
  bothButton.textContent = 'Both';

  mediaFilterWrapper.appendChild(movieButton);
  mediaFilterWrapper.appendChild(tvButton);
  mediaFilterWrapper.appendChild(bothButton);

  mediaFilter.appendChild(mediaFilterWrapper);
}
