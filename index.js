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

var localStorageName = 'kaltura-medias-category'

$( document ).ready(function() {
    var storageObject = JSON.parse(localStorage.getItem(localStorageName))
    if(!storageObject) {
        return;
    }

    if(storageObject.adminSecret) {
        $('#adminSecret-input').val(storageObject.adminSecret)
    }

    if(storageObject.partnerId) {
        $('#partnerId-input').val(storageObject.partnerId)
    }

    if(storageObject.adminSecret && storageObject.partnerId) {
        $('.category').removeClass('d-none')
    }
});

function setLocalStorage(key, value) {
    var storageObject = JSON.parse(localStorage.getItem(localStorageName))
    if(!storageObject) storageObject = {}

    storageObject[key] = value

    localStorage.setItem(localStorageName, JSON.stringify(storageObject))

    if(storageObject.adminSecret && storageObject.partnerId) {
        $('.category').removeClass('d-none')
    } else {
        $('.category').addClass('d-none')
    }
}