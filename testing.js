var map;
var infoWindow;
var infoWindowContent;
var request;
var service;
var markers = [];
var geocoder = new google.maps.Geocoder();
var geocodeResult;
var selectDist;
var searchBox;
var inputPlace;

function init () {
  var startCenter = new google.maps.LatLng(33.9022481, -84.45803990000002);
  map = new google.maps.Map(document.getElementById("map"), {
    center: startCenter,
    zoom: 13
  });
  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

  //search bar
  var input = document.getElementById('searchmap');
  searchBox = new google.maps.places.SearchBox(input);

  searchBox.addListener('places_changed',  setSearchParameter);
}

function setSearchParameter() {
  clearResults(markers);
  inputPlace = searchBox.getPlaces();
  console.log(inputPlace);
  var geocodeRequest = inputPlace[0].place_id;
  var bounds = new google.maps.LatLngBounds();
  inputPlace.forEach(function (place) {
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  });
  map.fitBounds(bounds);

  //Geocodes inputPlace to latLng
  geocoder.geocode( {placeId: geocodeRequest}, geocoding);
 }

function geocoding(results, status) {
  map.setCenter(results[0].geometry.location);
  geocodeResult = results[0].geometry.location;

  // ADDS DISTANCE SELECTION
  var distInput = document.getElementById('searchDist');
  selectDist = searchDist.options[searchDist.selectedIndex].value;

  var requestLocal = {
    location: geocodeResult,
    radius: selectDist, // this is the distance you're trying to change with the dropdown menu
    types: ["cafe"],
  };
  var requestCorp = {
    location: geocodeResult,
    radius: selectDist, // this is the distance you're trying to change with the dropdown menu
    types: ["cafe"],
    keyword: "Starbucks, Dunkin, McDonald"
  };
  service.nearbySearch(requestLocal, callbackLocal);
  service.nearbySearch(requestCorp, callbackCorp);
}

function callbackLocal(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      markers.push(createMarkerLocal(results[i]));
    }
  }
}

function callbackCorp(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      markers.push(createMarkerCorp(results[i]));
    }
  }
}

function createMarkerLocal(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    icon: "img/localMarker.png",
    position: place.geometry.location,
    zIndex: 1,
  });
  marker.addListener('click', sad);
  return marker;
}

function createMarkerCorp(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    icon: "img/corpMarker.png",
    position: place.geometry.location,
    zIndex: 100,
  });
  marker.addListener('click', function() {
    var markerPlaceId = place.place_id;
    service.getDetails({placeId:place.place_id}, function() {
      infoWindowContent = document.getElementById('infoWindow-content');
      infoWindowContent.children['place-name'].textContent = place.name;
      infoWindowContent.children['place-address'].textContent = place.vicinity;
      infoWindowContent.children['rating'].textContent = place.rating;
      infoWindowContent.children['price'].textContent = place.price_level;
      console.log(place);
      infoWindow.setContent(infoWindowContent);
    });
    infoWindow.open(map, marker);
  });
  return marker;
}

function clearResults(markers) {
  for (var m in markers) {
    markers[m].setMap(null);
  }
  markers = []
}
// onload
google.maps.event.addDomListener(window, "load", init);
