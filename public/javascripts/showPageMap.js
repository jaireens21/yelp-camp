mapboxgl.accessToken= mapToken;

const map = new mapboxgl.Map({
  container: 'map', //the div in show.ejs
  style: 'mapbox://styles/mapbox/streets-v11', //style of map
  center: campground.geometry.coordinates,
  zoom: 7
});

// create the popup for when user hovers over the map pointer
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`);
 
  
// create the marker
const marker1= new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup) // sets a popup on this marker
  .addTo(map);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());