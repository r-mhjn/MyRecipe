const staticCacheName = "site-static-v2";
const dynamicCacheName = "site-dynamic-v2";
const dynamicCacheSize = 20;
const assets = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/ui.js",
  "/pages/fallback.html",
  "/css/styles.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
  "https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2"
];

// install service worker, on install event from browser
// this will not be installed again until, the sw.js file is changed
// and it will be become only in a new instance of the app
// cache the assets that make the code design of our app..cache assets every time a new install is needed
self.addEventListener("install", event => {
  //   console.log("service worker installed");
  // gonna open this cache is its doesn't exist then it creates this cache
  // the install event is very fast and after its done it will stop the sw due to which the caching might not be comopleted
  event.waitUntil(
    caches
      .open(staticCacheName)
      .then(cache => {
        console.log("caching shell assests");
        cache.addAll(assets); // this makes the request to server to bring all the links into cache
      })
      .catch(err => console.log("Error opening cache ", err))
  );
});

// activate service worker
self.addEventListener("activate", evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(
        keys
          .filter(key => key != staticCacheName && key != dynamicCacheName) // everything that we want to delete stays in the array then we map through the array and detele em all
          .map(key => caches.delete(key))
      );
    })
  );
});

// fetch event, intercept request to fetch from the cache is available
// dynamic caching, using this we need not bring all the pages into cache at once but we dynamically cache the pages when the user is online and request for those pages
self.addEventListener("fetch", event => {
  if (event.request.url.indexOf("firestore.googleapis.com") === -1) {
    // since we do not want to catch any firestore requests
    event.respondWith(
      caches.match(event.request).then(cacheRes => {
        return (
          cacheRes ||
          fetch(event.request)
            .then(fetchRes => {
              return caches
                .open(dynamicCacheName)
                .then(cache => {
                  cache.put(event.request.url, fetchRes.clone()); // this does not explicitly call the server to fetch the resouces
                  limitCacheSize(dynamicCacheName, dynamicCacheSize);
                  return fetchRes;
                })
                .catch(err => console.log(err));
            })
            .catch(() => {
              if (event.request.url.indexOf(".html") > -1)
                return caches.match("/pages/fallback.html");
            }) // serving fallback pages
        ); // if not in cache the  return to original fetch req from the server
      })
    );
  }
});

// limiting cache size
const limitCacheSize = (name, size) => {
  caches
    .open(name)
    .then(cache => {
      cache.keys().then(keys => {
        if (keys.length > size) {
          cache.delete(keys[0]).then(limitCacheSize(name, size)); // deletes the 1st items in the cache array
        }
      });
    })
    .catch(err => console.log(err));
};
