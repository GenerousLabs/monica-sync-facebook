import * as L from 'leaflet'
import 'leaflet-providers'
import 'leaflet.markercluster'
import { getMonicaParams } from '../state'
let monicaApiToken: string, monicaApiUrl: string
let RATE_LIMITED: number | null = null

// fix for default icon & parceljs: https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
 

async function renderMap() {
  const map = L.map('map', {
    center: [52.5148763, 13.385661],
    zoom: 5,
    minZoom: 1,
    maxZoom: 14
  })

  // look at pretty providers here: https://leaflet-extras.github.io/leaflet-providers/preview/
  L.tileLayer
    .provider('CartoDB.VoyagerLabelsUnder')
    .addTo(map)

  L.control.scale().addTo(map)

  return map
}

async function pullPageFromMonica(pageNumber: number) {
  console.log('pulling page', pageNumber)
  const PAGE_SIZE = 100
  
  const headers = new Headers()
  headers.set('Authorization', `Bearer ${monicaApiToken}`)
  const options = { headers }
  const response = await fetch(`${monicaApiUrl}/contacts?page=${pageNumber}&limit=${PAGE_SIZE}&with=contactfields`, options)
  if (response.status != 200) throw Error(`received status ${response.status} when questing page ${pageNumber}`)
  const json = await response.json()
  const data = json.data
  const lastPage = json.meta?.last_page
  const total = json.meta?.total
  if (!data || !lastPage) throw Error(`received bad json when pulling page ${pageNumber}: ${json}`)
  return { data, lastPage, total }
}

async function pullDataFromMonica() {
  const KEY = 'my-key'
  let allContacts = []
  let i = 1

  // CURRENTLY CHANGED TO ALWAYS ASSUME DATA IS FRESH
  // assume local data is fresh if it's the same number of contacts
  const result: { [KEY]: { timestamp: string, data: any[] }} = await browser.storage.local.get(KEY)
  console.log('result', result)
  if (result[KEY]?.data?.length > 0) return result[KEY].data
  console.log('local data not fresh, pulling contacts again')
  let { data, lastPage, total } = await pullPageFromMonica(i)

  allContacts.push(...data);

  i++

  while (i <= lastPage) {
    const { data } = await pullPageFromMonica(i)
    allContacts.push(...data)
    i++
  }

  await browser.storage.local.set({ [KEY]: { timestamp: new Date().toISOString(), data: allContacts}})
  return allContacts
}

async function transformContacts(monicaContacts: any[]) {
  console.log('monicaContacts', monicaContacts)
  const allMarkers = await Promise.all(monicaContacts.map(transformContact))
  return allMarkers.flat().filter(m => m) as L.Marker[]
}

async function transformContact(contact: { addresses: any[], first_name: string, last_name: string, nickname: string, id: number, contactFields: any[]}) {
  const name = [contact.first_name, contact.nickname, contact.last_name]
    .filter(x => x)
    .join(' ')
  
  const markers = Promise.all(contact.addresses.map(async (address: any) => {
    const addressString = [address.street, address.city, address.province, address.country?.name]
      .filter(x => x)
      .join(', ')
    
    let latlng
    if (address.latitude && address.longitude) {
      latlng = { lat: address.latitude, lng: address.longitude }
    } else {
      latlng = await lookupFromMapbox(addressString)
      if (latlng) await updateContactLatLng(address, latlng)
      else return undefined
    }

    const facebookField = contact?.contactFields?.find(f => f?.contact_field_type?.name === 'Facebook')
    console.log('facebookField', facebookField)
    const facebookLink = facebookField ? `${facebookField?.contact_field_type?.protocol}/${facebookField?.content}` : ''

    const popup =
`<h3>${name}</h3>
<p>${addressString}</p>
<p><a href=${facebookLink} target="_blank">Facebook</a></p>`
    
    const options: L.MarkerOptions = {
      icon: L.divIcon({ className: 'name-marker', html: `<span>${contact.first_name}</span>` })
  }

    const marker = L.marker(latlng, options)
    marker.bindPopup(popup).openPopup()
    return marker
  }))

  return markers
}

const geoDict: { [id: string]: L.LatLngLiteral } = {} //TODO: put this in local extension storage
async function lookupFromMapbox(addressString: string) {
  const base = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
  const token = 'pk.eyJ1IjoiYWJlbHVnYSIsImEiOiJja3cwdG1iMjFiOXJ3Mm5xd2xra21zYm5wIn0.Hp1aDaQ0JwC8IPodCLh0Dg'
  if (geoDict[addressString]) return geoDict[addressString]

  const res = await fetch(`${base}${addressString}.json?access_token=${token}&types=place,address&limit=1`)
  if (res.status != 200) return
  const json = await res.json()
  const coords = json.features[0].geometry.coordinates
  const latlng: L.LatLngLiteral = { lat: coords[1], lng: coords[0]}
  geoDict[addressString] = latlng
  return latlng
}

async function updateContactLatLng(address: any, latlng: L.LatLngLiteral) {
  console.log('skipping')
  return
  console.log('RATE_LIMITED', RATE_LIMITED)
  if (RATE_LIMITED) {
    console.error(`we are rate limited since ${RATE_LIMITED}`)
    if ((Date.now() - RATE_LIMITED) > (60 * 1000)) {
      console.log('more than 60 seconds since last attempt, trying again')
    } else {
      return
    }
  }
  const headers = new Headers()
  headers.set('Authorization', `Bearer ${monicaApiToken}`)
  headers.set('Content-Type', 'application/json')
  const payload = {
    name: address.name ?? 'n/a',
    contact_id: address.contact.id,
    street: address.street,
    city: address.city,
    province: address.province,
    country: address.country?.id,
    postal_code: address.postal_code,
    latitude: latlng.lat,
    longitude: latlng.lng,
  }
  const options = { headers, method: 'put', body: JSON.stringify(payload) }
  
  const response = await fetch(`${monicaApiUrl}/addresses/${address.id}`, options)
  if (response.status === 429) {
    console.error('received 429 response, activating RATE_LIMITED')
    RATE_LIMITED = Date.now()
  } else if (response.status != 200) {
     console.error(`received status ${response.status} when updating address ${address.id} for contact ${address.contact.id}`)
  } else {
  RATE_LIMITED = null
  }
}

async function setup() {
  const map = await renderMap()
  const monicaParams = await getMonicaParams();
  monicaApiToken = monicaParams.monicaApiToken
  monicaApiUrl = monicaParams.monicaApiUrl
  const monicaContacts = await pullDataFromMonica()
  const markers: L.Marker[] = await transformContacts(monicaContacts)
  var clusterMarkers = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyDistanceMultiplier: 1.5
  })
  markers.forEach(marker => clusterMarkers.addLayer(marker))
  map.addLayer(clusterMarkers);
}

setup()