mapboxgl.accessToken= mapToken;

const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: campground.geometry.coordinates,
        zoom: 7
      });

// create the popup
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`);
 
  
// create the marker
const marker1= new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(popup) // sets a popup on this marker
    .addTo(map);