const staticPhoneStore = "phone-store-site-v1"
const assets = [
  "/",
  "/index.html",
  "/route.html",
  "/css/style.css",
  "/css/modal.css",
  "/css/route.css",
  "/css/index.css",
  "/js/app.js",
  "/js/modal_mechanic.js",
  "/js/routes.js",
  "/js/index.js",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticPhoneStore).then(cache => {
        cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
})


