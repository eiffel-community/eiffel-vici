function usableCache(cache, cacheName, value, timeValid) {
    return cache[cacheName] !== undefined && cache[cacheName].time + timeValid > Date.now() && cache[cacheName].value === value;
}

function storeCache(cache, cacheName, value) {
    cache[cacheName] = {
        value: value,
        time: Date.now()
    };
    console.log('Stored cache for ' + cacheName);
    console.log(cache);
}

function invalidateCache(cache, cacheName) {
    if (cacheName === undefined) {
        cache = {};
        console.log('Invalidated cache for ' + cacheName)
    } else {
        cache[cacheName] = undefined;
        console.log('Invalidated all cache')
    }
}