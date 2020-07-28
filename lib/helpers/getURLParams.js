export const getURLParams = function(search) {
    const hashes = search.slice(search.indexOf('?') + 1).split('&')
    const params = {}
    hashes.map(hash => {
        let [key, val] = hash.split('=')
        key = decodeURIComponent(key)
        if (key.indexOf('[') > -1) { // handle multiple type inputs
            if (typeof params[key] === 'undefined') {
                params[key] = []
            }

            params[key].push(decodeURIComponent(val))
        } else {
            params[key] = decodeURIComponent(val)
        }
    })
    return params
}