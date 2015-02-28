$(document).ready(function(){


    var businessTemplate = Handlebars.compile($('#business_template').html());

    L.mapbox.accessToken = 'pk.eyJ1IjoibWxha2U5MDAiLCJhIjoiSXV0UEF6dyJ9.8ZrYcafYb59U67LHErUegw';
    var map = L.mapbox.map('map', 'mlake900.lae6oebe').setView([38.04, -78.493], 14);

    //map.dragging.disable();
    //map.touchZoom.disable();
    //map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    var mySpreadsheet = 'https://docs.google.com/spreadsheets/d/11aIxy4FbfcqwUprsP4FB5tnVXmEu_TRoK6ffLz7s7Rk/edit#gid=66432575';

    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        animateAddingMarkers: true,
        maxClusterRadius: 35,
        disableClusteringAtZoom: 15
    });


    map.addLayer(markers);

    var myRowHandler = function (row) {

        for (var key in row.cells) {
            if (key.toLowerCase().indexOf("gps") > -1) {

                var rawGpsString = row.cells[key];
                var coordArray = rawGpsString.split(",", 2);

                if ($.isNumeric(coordArray[0]) && $.isNumeric(coordArray[1])) {
                    var marker = L.marker(coordArray, {
                        title: row.cells.Name,
                        riseOnHover: true
                    });

                    //TODO: replace with handlebars template
                    marker.bindPopup("<b>" + row.cells.Name + "</b><br>" + row.cells.PhysicalAddress + "<br><em>" + row.cells.Tagline + "</em><br><a target='_blank' href='" + row.cells.Website + "'>" + row.cells.Website + "</a>");


                    markers.addLayer(marker);

                }
            }
        }

        return businessTemplate(row);
    };


    var myUserCallback = function (options){

        //do nothing

    };


    $('#business_listings').sheetrock({
        url: mySpreadsheet,
        headersOff: true,
        rowGroups: false,
        rowHandler: myRowHandler,
        userCallback: myUserCallback
    });




	/*  Hamburger Menu & Icon  */
	$('.hamburger').on('click', function(e){
		
		e.preventDefault();
		$(this).toggleClass('opned');
		$('header nav').toggleClass('active');
		
	});




	/*  Advanced search form & Icon  */
	$('#advanced_search_btn').on("click", function(e){
		e.preventDefault();

		var ads_box =$('.advanced_search');
		
		if(!ads_box.hasClass('advanced_displayed')){

			$(this).addClass('active');
			ads_box.stop().fadeIn(200).addClass('advanced_displayed');

		}else{

			$(this).removeClass('active');
			ads_box.stop().fadeOut(200).removeClass('advanced_displayed');

		}

	});




});