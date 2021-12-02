function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 1,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['mandelbrot 1']
    }
  });

  var mapType1 = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var type = '1';
      var normalizedCoord = getNormalizedCoord(coord, zoom);
      if (!normalizedCoord) {
        return `img/default.png`;
      }
      var bound = Math.pow(2, zoom);
      var {x, y} = normalizedCoord;
      var ret = `img/${zoom + 1}/${x + 1}/${y + 1}.png`;
      return ret;
    },
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 7,
    minZoom: 0,
    radius: 1738000,
    name: 'Mandelbrot 1'
  });

  map.mapTypes.set('Mandelbrot 1', mapType1);
  map.setMapTypeId('Mandelbrot 1');

  var markerArr = [];
  var infoWindowArr = [];

  Object.keys(spotLi.sheet).forEach(key => {
    var marker;
    var infoWindow;
    var spot = spotLi.sheet[key];

    var { x, y, title, youtubeId } = spot;

    const lng = x;
    const lat = y;

    icon = {
      url: "img/marker.png",
      size: new google.maps.Size(29, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 32),
      }

    marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      icon,
      title,
    });

    markerArr.push(marker);

    infoWindow = new google.maps.InfoWindow({
      content: `
<h2>${spot.title}</h2>
<p><a href="//youtu.be/${spot.youtubeId}" target="_blank"><img src="//img.youtube.com/vi/${youtubeId}/maxresdefault.jpg" width="320"></a></p>
      `,
    });

    infoWindowArr.push(infoWindow);

    infoWindowArr.forEach(function(iw, i) {
      google.maps.event.addListener(markerArr[i], 'click', function(evt) {
        infoWindowArr.forEach(function(iw, i) {
          iw.close();
        })

        iw.open(map, markerArr[i]);
      })
    });
  });

  map.addListener('click', function(evt) {
    console.log(evt.latLng.lat(), evt.latLng.lng());
  });
}

// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = (x % tileRange + tileRange) % tileRange;
  }

  return {x: x, y: y};
}
