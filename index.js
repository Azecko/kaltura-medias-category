async function createKS(adminSecret, partnerId) {
    let response = await fetch(`https://api.cast.switch.ch/api_v3/service/session/action/start?secret=${adminSecret}&partnerId=${partnerId}&type=2&expiry=600&format=1`)
    let data = await response.json()
    return data
}

async function getMediasFromCategory(ks, categoryID) {
    let response = await fetch(`https://api.cast.switch.ch/api_v3/service/media/action/list?ks=${ks}&filter[categoriesIdsMatchAnd]=${categoryID}&filter[objectType]=KalturaMediaEntryFilter&format=1&pager[pageSize]=500`)
    let data = await response.json()
    return data
}

async function getCategoryById(ks, categoryID) {
    let response = await fetch(`https://api.cast.switch.ch/api_v3/service/category/action/get?ks=${ks}&id=${categoryID}&format=1`)
    let data = await response.json()
    return data
}

async function getAllCategories(ks) {
    let response = await fetch(`https://api.cast.switch.ch/api_v3/service/category/action/list?ks=${ks}&format=1`)
    let data = await response.json()
    return data
}

function setCategoriesAutocomplete(adminSecret, partnerId) {
    let categories = [];
    $('#categoryId-input').autocomplete({
        source: categories
    })
    createKS(adminSecret, partnerId).then(ks => {
        if(typeof(ks) !== "object") {
            getAllCategories(ks).then(data => {
                if(data.objects) {
                    categories = data.objects.map(category => {
                        return {
                            label: `${category.id.toString()} - ${category.name}`,
                            value: category.id.toString()
                        }
                    })
                    $('#categoryId-input').autocomplete({
                        source: categories
                    })
                }
            })
        }
    })
}

var localStorageName = 'kaltura-medias-category'

$( document ).ready(function() {
    var storageObject = JSON.parse(localStorage.getItem(localStorageName))
    if(!storageObject) {
        storageObject = {}
    }

    if(storageObject.adminSecret) {
        $('#adminSecret-input').val(storageObject.adminSecret)
    }

    if(storageObject.partnerId) {
        $('#partnerId-input').val(storageObject.partnerId)
    }

    if(storageObject.adminSecret && storageObject.partnerId) {
        $('.category').removeClass('d-none')
        setCategoriesAutocomplete(storageObject.adminSecret, storageObject.partnerId)
    }

    $('#categoryId-input').on('input',function(e){
        let inputValue = $('#categoryId-input').val()
        if(!inputValue) {
            $('#categoryId-button').prop('disabled', true);
        } else {
            $('#categoryId-button').prop('disabled', false);
        }
    });

    $('#adminSecret-input').on('input',function(e){
        let inputValue = $('#adminSecret-input').val()
        
        setLocalStorage('adminSecret', inputValue)
    });

    $('#partnerId-input').on('input',function(e){
        let inputValue = $('#partnerId-input').val()
        
        setLocalStorage('partnerId', inputValue)
    });
});

function setLocalStorage(key, value) {
    var storageObject = JSON.parse(localStorage.getItem(localStorageName))
    if(!storageObject) storageObject = {}

    storageObject[key] = value

    localStorage.setItem(localStorageName, JSON.stringify(storageObject))

    if(storageObject.adminSecret && storageObject.partnerId) {
        $('.category').removeClass('d-none')
        setCategoriesAutocomplete(storageObject.adminSecret, storageObject.partnerId)
    } else {
        $('.category').addClass('d-none')
        $("#medias-div").addClass('d-none')
        $(".tbody-medias").html("")
    }
}

function getMedias(categoryId) {
    var storageObject = JSON.parse(localStorage.getItem(localStorageName))
    let adminSecret = storageObject.adminSecret
    let partnerId = storageObject.partnerId

    createKS(adminSecret, partnerId).then(ks => {
        getMediasFromCategory(ks, categoryId).then(data => {
            if(data.code) {
                $('.alert-warning').html(`An error occured. Error : ${data.code}`)
                $('.alert-warning').removeClass('d-none')
                $("#medias-div").addClass('d-none')
                $(".tbody-medias").html("")
                return;
            }

            let media = data.objects
            if(!media.length) {
                $('.alert-warning').html("Category doesn't exist or is empty.")
                $('.alert-warning').removeClass('d-none')
                $("#medias-div").addClass('d-none')
                $(".tbody-medias").html("")
            } else {

                getCategoryById(ks, categoryId).then(data => {
                    $('#category-title').html(data.name)
                })

                $(`#download-all-medias-button`).unbind()
                $(`#download-all-medias-button`).html(`Download all medias (${data.objects.length})`)

                $(`#download-all-medias-button`).click(function(e) {
                    data.objects.map(media => {
                        e.preventDefault();
                        window.open(media.downloadUrl);
                    })
                });

                $(".tbody-medias").html("")
                data.objects.map(media => {
                    $('.alert-warning').addClass('d-none')
                    $("#medias-div").removeClass('d-none')
                    $(".tbody-medias").append(`<tr id="tr-${media.id}"></tr>`)
                    $(`#tr-${media.id}`).append(`<td><a href="${media.dataUrl} target="_blank">${media.name}</a></td>`)
                    $(`#tr-${media.id}`).append(`<td><a id="download-${media.id}" href="#">Download media</a></td>`)
                    
                    $(`#download-${media.id}`).click(function(e) {
                        e.preventDefault();
                        window.open(media.downloadUrl);
                    });
                })
            }

        })
    })
}