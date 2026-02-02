// const socket = io();

// if (navigator.geolocation) {
//   navigator.geolocation.watchPosition(
//     (position) => {
//       const { latitude, longitude } = position.coords;
//       socket.emit("send-location", { latitude, longitude });
//     },
//     (error) => {
//       console.error(error);
//     },
//     {
//       enableHighAccuracy: true,
//       maximumAge: 0,
//       timeout: 5000,
//     },
//   );
// }

// const map = L.map("map").setView([0, 0], 16);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution: " © OpenStreetMap contributors",
// }).addTo(map);

// const marker = {};

// socket.on("receive-location", (data) => {
//   const { id, latitude, longitude } = data;
//   map.setView([latitude, longitude]);
//   if (marker[id]) {
//     marker[id].setLatLng([latitude, longitude]);
//   } else {
//     marker[id] = L.marker([latitude, longitude]).addTo(map);
//   }
// });

// socket.on("user-disconnected", (id) => {
//   if (marker[id]) {
//     map.removeLayer(marker[id]);
//     delete marker[id];
//   }
// });
const socket = io();
const markers = {};
let isMapCentered = false;
let lastSent = 0;

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const now = Date.now();
      if (now - lastSent < 2000) return;
      lastSent = now;

      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    console.error,
    { enableHighAccuracy: true },
  );
}

socket.on("receive-location", ({ id, latitude, longitude }) => {
  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }

  if (!isMapCentered) {
    map.setView([latitude, longitude], 16);
    isMapCentered = true;
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
