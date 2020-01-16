

const staticCacheName = 'site-static-v1';
const dynamicCache = 'site-dynamic-v1'


const assets = [
    '/',
    './index.html',
    './css/materialize.min.css',
    './js/materialize.min.js',
    './css/styles.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    './img/dish.png',
    './js/app.js',
    './js/ui.js',
    './pages/fallback.html'
]


//limiting cache size

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys =>{
            if(keys.length > size){
                cache.delete(keys[0])  //deleting the oldest element in the array
                .then(limitCacheSize(name, size))
            }
        })
    })
}
//

// install event 
self.addEventListener('install', (evt) => {
    //  console.log('service worker has been installed ');

    evt.waitUntil(
        caches.open(staticCacheName).then(cache =>{
            console.log('caching shell assets')
            cache.addAll(assets);
    }));

});


 //activate service worker
self.addEventListener('activate', evt => {
    //  console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== staticCacheName && key !== dynamicCache))
                .map(key => caches.delete(key)
            )
        })

    )
});


 //fetch event 
self.addEventListener('fetch', (evt) => {
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
        evt.respondWith(
            caches.match(evt.request).then(cachesRes => {
                return cachesRes || fetch(evt.request).then(fetchRes =>{
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCache, 60);
                        return fetchRes
                    })
                })
            }).catch(() => {
                if(evt.request.url.indexOf('.html') > -1){
                    return caches.match('./pages/fallback.html')
                }
            }
                
        ))
    }
    
    
     
})