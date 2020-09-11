export const getUTMObject = function(params) {
    let { utm_source = null, utm_medium = null, utm_campaign = null, utm_term = null, utm_content = null } = params
    return {
        utm_source,
        utm_campaign, 
        utm_medium,
        utm_term,
        utm_content
    }
}

