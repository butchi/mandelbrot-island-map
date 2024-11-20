import spotArr from './spot-list.json' with { type: 'json' }

import './style.css'

// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
const getNormalizedCoord = (coord: { x: number; y: number }, zoom: number) => {
  let y = coord.y
  let x = coord.x

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  const tileRange = 1 << zoom

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null
  }

  // repeat across x-axis
  if (x < 0 || x >= tileRange) {
    x = ((x % tileRange) + tileRange) % tileRange
  }

  return { x, y }
}

const handler = async () => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="map" class="map"></div>
  `

  const lib = await google.maps.importLibrary('maps')
  const { Map } = lib as google.maps.MapsLibrary
  const { ImageMapType, Size, Point, Marker, InfoWindow } = google.maps

  const map = new Map(document.getElementById('map') as HTMLElement, {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['mandelbrot 1'],
    },
  })

  const mapType1 = new ImageMapType({
    getTileUrl: function (coord: { x: number; y: number }, zoom: number) {
      // const type = '1'
      const normalizedCoord = getNormalizedCoord(coord, zoom)

      if (!normalizedCoord) {
        return `img/default.png`
      }

      // const bound = Math.pow(2, zoom)
      const { x, y } = normalizedCoord
      const ret = `img/${zoom + 1}/${x + 1}/${y + 1}.png`

      return ret
    },
    tileSize: new Size(256, 256),
    maxZoom: 7,
    minZoom: 0,
    // radius: 1738000,
    name: 'Mandelbrot 1',
  })

  map.mapTypes.set('Mandelbrot 1', mapType1)
  map.setMapTypeId('Mandelbrot 1')

  const markerArr: any[] = []
  const infoWindowArr: any[] = []

  spotArr.forEach((spot) => {
    const { x, y, title, youtubeId } = spot

    const lng = x
    const lat = y

    const icon = {
      url: 'img/marker.png',
      size: new Size(29, 32),
      origin: new Point(0, 0),
      anchor: new Point(16, 32),
    }

    // TODO: Markerを移行
    const marker = new Marker({
      position: { lat, lng },
      map,
      icon,
      title,
    })

    markerArr.push(marker)

    const infoWindow = new InfoWindow({
      content: `
<h2>${spot.title}</h2>
<p><a href="//youtu.be/${spot.youtubeId}" target="_blank"><img src="//img.youtube.com/vi/${youtubeId}/maxresdefault.jpg" width="320"></a></p>
      `,
    })

    infoWindowArr.push(infoWindow)

    infoWindowArr.forEach((iw: any, i) => {
      google.maps.event.addListener(markerArr[i], 'click', (_evt: unknown) => {
        infoWindowArr.forEach((iw: any) => {
          iw.close()
        })

        iw.open(map, markerArr[i])
      })
    })
  })

  map.addListener('click', function (_evt: any) {
    infoWindowArr.forEach((iw: any) => {
      iw.close()
    })

    // console.log(evt.latLng.lat(), evt.latLng.lng())
  })
}

handler()
