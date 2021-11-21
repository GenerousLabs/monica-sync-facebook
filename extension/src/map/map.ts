import * as L from "leaflet";
import "leaflet-providers";
import "leaflet.markercluster";
import { getMonicaParams } from "../state";
let monicaApiToken: string, monicaApiUrl: string;

// fix for default icon & parceljs: https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

async function renderMap(markers: L.Marker[]) {
  const map = L.map("map", {
    center: [52.5148763, 13.385661],
    zoom: 5,
    minZoom: 1,
    maxZoom: 18,
  });

  L.tileLayer.provider("OpenStreetMap.DE").addTo(map);

  L.control.scale().addTo(map);

  console.log("markers", markers);
  var clusterMarkers = L.markerClusterGroup();
  markers.forEach((marker) => clusterMarkers.addLayer(marker));
  map.addLayer(clusterMarkers);
}

async function pullPageFromMonica(pageNumber: number) {
  console.log("pulling page", pageNumber);

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${monicaApiToken}`);
  const options = { headers };
  const response = await fetch(
    `${monicaApiUrl}/contacts?page=${pageNumber}`,
    options
  );
  if (response.status != 200)
    throw Error(
      `received status ${response.status} when questing page ${pageNumber}`
    );
  const json = await response.json();
  const data = json.data;
  const lastPage = json.meta?.last_page;
  if (!data || !lastPage)
    throw Error(`received bad json when pulling page ${pageNumber}: ${json}`);
  return { data, lastPage };
}

async function pullDataFromMonica() {
  let allContacts = [];
  let i = 1;
  let { data, lastPage } = await pullPageFromMonica(i);
  allContacts.push(...data);

  while (i < lastPage) {
    const { data } = await pullPageFromMonica(i);
    allContacts.push(...data);
    i++;
  }

  return allContacts;
}

async function transformContacts(monicaContacts: any[]) {
  console.log("monicaContacts", monicaContacts);
  const allMarkers = await Promise.all(monicaContacts.map(transformContact));
  console.log("allMarkers", allMarkers);
  return allMarkers.flat().filter((m) => m) as L.Marker[];
}

async function transformContact(contact: {
  addresses: any[];
  first_name: string;
  last_name: string;
  nickname: string;
  id: number;
}) {
  const name = [contact.first_name, contact.nickname, contact.last_name]
    .filter((x) => x)
    .join(" ");

  const markers = Promise.all(
    contact.addresses.map(async (address: any) => {
      const addressString = [
        address.street,
        address.city,
        address.province,
        address.country?.name,
      ]
        .filter((x) => x)
        .join(", ");

      let latlng;
      if (address.latitude && address.longitude) {
        latlng = { lat: address.latitude, lng: address.longitude };
      } else {
        latlng = await lookupFromMapbox(addressString);
        if (latlng) updateContactLatLng(address, latlng);
        else return undefined;
      }

      const options: L.MarkerOptions = {
        title: `${name}
${addressString}`,
      };
      const marker = L.marker(latlng, options);
      return marker;
    })
  );
  console.log("built some addresses for contact", markers);
  return markers;
}

const geoDict: { [id: string]: L.LatLngLiteral } = {}; //TODO: put this in local extension storage
async function lookupFromMapbox(addressString: string) {
  const base = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
  const token =
    "pk.eyJ1IjoiYWJlbHVnYSIsImEiOiJja3cwdG1iMjFiOXJ3Mm5xd2xra21zYm5wIn0.Hp1aDaQ0JwC8IPodCLh0Dg";
  if (geoDict[addressString]) return geoDict[addressString];

  const res = await fetch(
    `${base}${addressString}.json?access_token=${token}&types=place,address&limit=1`
  );
  if (res.status != 200) return;
  const json = await res.json();
  const coords = json.features[0].geometry.coordinates;
  const latlng: L.LatLngLiteral = { lat: coords[1], lng: coords[0] };
  geoDict[addressString] = latlng;
  return latlng;
}

async function updateContactLatLng(address: any, latlng: L.LatLngLiteral) {
  console.log("updating latlng", latlng, address);
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${monicaApiToken}`);
  headers.set("Content-Type", "application/json");
  const payload = {
    name: address.name ?? "n/a",
    contact_id: address.contact.id,
    street: address.street,
    city: address.city,
    province: address.province,
    country: address.country.id,
    postal_code: address.postal_code,
    latitude: latlng.lat,
    longitude: latlng.lng,
  };
  const options = { headers, method: "put", body: JSON.stringify(payload) };

  const response = await fetch(
    `${monicaApiUrl}/addresses/${address.id}`,
    options
  );
  if (response.status != 200)
    throw Error(
      `received status ${response.status} when updating address ${address.id} for contact ${address.contact.id}`
    );
}

async function setup() {
  const monicaParams = await getMonicaParams();
  monicaApiToken = monicaParams.monicaApiToken;
  monicaApiUrl = monicaParams.monicaApiUrl;
  const monicaContacts = await pullDataFromMonica();
  console.log("monicaContacts", monicaContacts);
  const markers: L.Marker[] = await transformContacts(monicaContacts);
  console.log("markers in setup", markers);
  renderMap(markers);
}

setup();
