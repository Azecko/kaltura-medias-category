async function createKS(adminSecret, partnerId) {
    let response = await fetch(`https://api.cast.switch.ch/api_v3/service/session/action/start?secret=${adminSecret}&partnerId=${partnerId}&type=2&expiry=600&format=1`)
    let data = await response.json()
    return data
}

async function getMediasFromCategory(ks, categoryID) {
    let response = await fetch(`https://api.cast.switch.ch/api_v3/service/media/action/list?ks=${ks}&filter[categoriesIdsMatchAnd]=${categoryID}&filter[objectType]=KalturaMediaEntryFilter&format=1`)
    let data = await response.json()
    return data
}