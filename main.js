var markers = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    animateAddingMarkers: false,
    maxClusterRadius: 35,
    disableClusteringAtZoom: 15
});

var modal_markers = new L.FeatureGroup();

var modal_map;

var businessTemplate;

var modalTemplate;

function createIconForRow(row) {
    var icon;

    var companyType = row.cells["WhattypeofCOMPANYareyou?"];

    companyType = companyType.split(",")[0];

    var filename = companyType.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    //determine the size based on number of employees

    var iconSize;
    switch (row.cells['Numberofemployees']) {

        case "1 - 5":
            iconSize = [20, 20];
            break;
        case "6 - 10":
            iconSize = [30, 30];
            break;
        case "11 - 20":
            iconSize = [40, 40];
            break;
        case "21 - 50":
            iconSize = [50, 50];
            break;
        case ">50":
            iconSize = [60, 60];
            break;
        default:
            iconSize = [40, 40];
    }

    var iconAnchor = [iconSize[0] / 2, iconSize[1]];
    var popupAnchor = [0, (iconSize[1] * -1) + 4];


    if (row.cells["IsthisaPLACEinCville?"].toLowerCase().indexOf("coffee") > -1) {
        filename = "coffee";
    } else if (row.cells["IsthisaPLACEinCville?"].toLowerCase().indexOf("winery") > -1) {
        filename = "winery";
    } else if (row.cells["IsthisaPLACEinCville?"].toLowerCase().indexOf("brewery") > -1) {
        filename = "brewery";
    }

    // these are hacks just to get us through - think there are some questions to ask surrounding how to group things
    if (filename === 'social_innovation') {
        filename = 'innovation';
    }

    if (filename === 'architecture') {
        filename = 'unknown';
    }

    if (filename === '') {
        if (row.cells["UVAorCharlottesvilleMetroArea?"] === "UVA") {
            filename = "uva";
        } else {
            filename = 'unknown';
        }
    } else if (row.cells["UVAorCharlottesvilleMetroArea?"] === "UVA") {
        filename = filename + "_uva";
    }


    icon = L.icon({
        iconUrl: 'map_icons/ic_' + filename + '.svg',
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: popupAnchor
    });

    return icon;
}

var rowList = [];

    function updateMap() {

    //window.alert("updateMap called");
    markers.clearLayers();
    $('#business_listings').empty();
    var activeList = [];

    $(".filter_container img").each(function (index, element) {

        if (!$(element).hasClass("filter_inactive")) {
            activeList.push(element.name);
        }

    });

    //TODO: somehow determine that none are selected, so pass all as active
    processRows(activeList);
    $('.card_title, #modal-background, #modal-close').off('click');
    /*  JQuery Dialog for Business Cards  */
    $('.card_title, #modal-background, #modal-close').on('click', function (e){

        //$('#modal-content').empty();
        //$('#modal-content').append(modalTemplate(row));
        $("#modal-content, #modal-background").toggleClass("modal_active");

    });

    $('.card_title').on('click', function (e) {

        modal_markers.clearLayers();

        var index = $(this).attr("rowindex");

        var modal = $('#company_content');

        modal.empty();

        var row = rowList[index];

        var coordArray = ["38.0299","-78.4790"];

        $('#modal_map_element').hide();

        for (var key in row.cells) {

            if (key.toLowerCase().indexOf("gps") > -1) {

                coordArray = row.cells[key].split(",");

                if ($.isNumeric(coordArray[0]) && $.isNumeric(coordArray[1])) {
                    var icon = createIconForRow(row);
                    var marker = L.marker(coordArray, {
                        title: row.cells.Name,
                        riseOnHover: true,
                        icon: icon
                    });
                    $('#modal_map_element').show();

                    modal_map.setView(coordArray, 15);

                    modal_map._onResize();

                    modal_markers.addLayer(marker);

                    modal.append(modalTemplate(row));
                }
            }
        }

    });

}

function processRows(activeList) {

    var numberOfElement = 0;
    for (var idx in rowList) {

        var row = rowList[idx];

        var includeRow = false;
        var isHiring = false;

        if (activeList.length === 0) {
            includeRow = true;
        } else {
            for (var activeIdx in activeList) {

                var activeFilter = activeList[activeIdx];

                if (row.cells["WhattypeofCOMPANYareyou?"].toUpperCase()
                    === activeFilter.toUpperCase()
                    ||
                    row.cells["IsthisaPLACEinCville?"].toUpperCase()
                        .indexOf(activeFilter.toUpperCase()) > -1
                    ||
                    row.cells["UVAorCharlottesvilleMetroArea?"].toUpperCase()
                        .indexOf(activeFilter.toUpperCase()) > -1
                ) {
                    includeRow = true;
                    numberOfElement++;
                }
                if (activeList.indexOf("hiring") > -1) {
                    if (row.cells["NowHiring?"] === "Yes") {
                        if (activeList.length === 1) {
                            includeRow = true;
                            isHiring = true;
                        }
                        else {
                            isHiring = true;
                        }
                    }
                }
            }
        }


        if (!includeRow) continue;
        if (activeList.indexOf("hiring") > -1 && isHiring == false) continue;


        var icon = createIconForRow(row);
        var card_filename = icon.options.iconUrl.replace('ic_', 'ic_key_');
        if(card_filename.indexOf('ic_key_uva.svg') <= -1){
            card_filename = card_filename.replace('_uva', '');
        }
        row.cells['keyUrl'] = card_filename;


        for (var key in row.cells) {

            if (key.toLowerCase().indexOf("gps") > -1) {


                var rawGpsString = row.cells[key];
                var coordArray = rawGpsString.split(",", 2);
                if ($.isNumeric(coordArray[0]) && $.isNumeric(coordArray[1])) {
                    var marker = L.marker(coordArray, {
                        title: row.cells.Name,
                        riseOnHover: true,
                        icon: icon
                        //bounceOnAdd: true
                    });
                    //NOTE: we ONLY want to create a marker if there's an actual GPS point specified

                    //TODO: replace with handlebars template
                    marker.bindPopup("<b>" + row.cells.Name + "</b><br>" + row.cells['Numberofemployees'] + "<br>" + row.cells.PhysicalAddress + "<br><em>" + row.cells.OneLineDescriptionofYourCompany + "</em><br><a target='_blank' href='" + row.cells.Website + "'>" + row.cells.Website + "</a>");
                    if(row.cells['Checked'] == 1) {
                        markers.addLayer(marker);
                    }
                    else{
                        continue;
                    }

                }
            }
        }

        row.cells["isHiring"] = row.cells["NowHiring?"] === 'Yes';

        row.idx = idx;
        if(row.cells['Checked']==1) {
            $('#business_listings').append(businessTemplate(row));
        }

    }
}

$(document).ready(function () {

    /*  Hamburger Menu & Icon  */
    $('.hamburger').on('click', function (e) {

        e.preventDefault();
        $(this).toggleClass('opned');
        $('header nav').toggleClass('active');

    });
    /*  Filter Icons States  */
    $('.filter_container li img').on('click', function (e) {

        $(this).toggleClass('filter_inactive');

        updateMap();

    });

    businessTemplate = Handlebars.compile($('#business_template').html());

    modalTemplate = Handlebars.compile($('#modal_template').html());

    var zoomLevel = 15;
    if ($(window).width() < 550) zoomLevel = 12;

    L.mapbox.accessToken = 'pk.eyJ1IjoibWxha2U5MDAiLCJhIjoiSXV0UEF6dyJ9.8ZrYcafYb59U67LHErUegw';
    var map = L.mapbox.map('map', 'mlake900.lae6oebe', {
        zoomControl: true

    }).setView([38.032, -78.492], zoomLevel);
    //map.dragging.disable();
    //map.touchZoom.disable();
    //map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    map.zoomControl.setPosition('bottomright');

    L.control.fullscreen({position: "bottomright"}).addTo(map);

     modal_map = L.mapbox.map('modal_map_element', 'mlake900.lae6oebe', {
        zoomControl: true
    }).setView([38.032, -78.492], 15);
    modal_map.scrollWheelZoom.disable();
    modal_markers.addTo(modal_map);
    //modal_map.zoomControl.setPosition('bottomright');

    var mySpreadsheet = 'https://docs.google.com/spreadsheets/d/11aIxy4FbfcqwUprsP4FB5tnVXmEu_TRoK6ffLz7s7Rk/edit?pli=1#gid=66432575';


    map.addLayer(markers);


    var myRowHandler = function (row) {

        //save row data into a global array
        rowList.push(row);

    };


    var myUserCallback = function (options) {

        //do nothing
        updateMap();

    };



    $('#business_listings').sheetrock({
        url: mySpreadsheet,
        headersOff: true,
        rowGroups: false,
        rowHandler: myRowHandler,
        sql: 'select * order by %Name%',
        userCallback: myUserCallback
    });


});