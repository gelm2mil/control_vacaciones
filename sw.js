const CACHE = "pmt-control-v1";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./icons/pmt.png",
    "./icons/gelm.png"
];

self.addEventListener("install", e => {

    e.waitUntil(

        caches.open(CACHE)
        .then(cache => cache.addAll(ARCHIVOS))

    );

});

self.addEventListener("fetch", e => {

    e.respondWith(

        caches.match(e.request)
        .then(resp => resp || fetch(e.request))

    );

});
