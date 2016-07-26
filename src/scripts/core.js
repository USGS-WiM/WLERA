//for jshint
(function () {'use strict';}());
// Generated on 2015-04-13 using generator-wim 0.0.1
/**
 * Created by bdraper on 4/3/2015.
 */
var wlera = wlera || {
        bookmarks: [
            {"id":"ottawa-nwr", "name":"Ottawa NWR", "userCreated": false, spatialReference:{"wkid":102100}, "xmax":-9253627.864758775,"xmin":-9268896.161158718,"ymax":5109457.058192252,"ymin":5099759.110228584}
        ],
        globals: {

        }
    };

var map;
var zonalStatsGP;
var maxLegendHeight;
var maxLegendDivHeight;
var printCount = 0;
var storageName = 'esrijsapi_mapmarks';
//create global layers lookup
var mapLayers = [];
var mapLayerIds = [];

require([
    'esri/map',
    "esri/dijit/OverviewMap",
    "esri/SnappingManager",
    "esri/dijit/HomeButton",
    "esri/dijit/LocateButton",
    "esri/dijit/Measurement",
    "esri/dijit/Bookmarks",
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/dijit/Geocoder',
    "esri/dijit/Popup",
    'esri/dijit/PopupTemplate',
    'esri/graphic',
    'esri/geometry/Multipoint',
    'esri/symbols/PictureMarkerSymbol',
    "esri/geometry/webMercatorUtils",
    'esri/tasks/GeometryService',
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "esri/tasks/LegendLayer",
    'esri/SpatialReference',
    'esri/geometry/Extent',
    "esri/config",
    "esri/urlUtils",
    "esri/request",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/keys",
    "dojo/cookie",
    "dojo/has",
    'dojo/dom',
    "dojo/dom-class",
    "dojo/dom-construct",
    'dojo/on',
    'dojo/domReady!'
], function (
    Map,
    OverviewMap,
    SnappingManager,
    HomeButton,
    LocateButton,
    Measurement,
    Bookmarks,
    ArcGISTiledMapServiceLayer,
    Geocoder,
    Popup,
    PopupTemplate,
    Graphic,
    Multipoint,
    PictureMarkerSymbol,
    webMercatorUtils,
    GeometryService,
    PrintTask,
    PrintParameters,
    PrintTemplate,
    LegendLayer,
    SpatialReference,
    Extent,
    esriConfig,
    urlUtils,
    esriRequest,
    array,
    lang,
    keys,
    cookie,
    has,
    dom,
    domClass,
    domConstruct,
    on
) {

    var useLocalStorage = supports_local_storage();
    var popup = new Popup({
    }, domConstruct.create("div"));
    //Add the dark theme which is customized further in the <style> tag at the top of this page
    domClass.add(popup.domNode, "dark");

    map = new Map('mapDiv', {
        basemap: 'gray',
        center: [-82.745, 41.699],
        spatialReference: 26917,
        zoom: 10,
        logo: false,
        minZoom: 9,
        infoWindow: popup
    });

    //esriConfig.defaults.geometryService = new esri.tasks.GeometryService("http://wlera.wim.usgs.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    esriConfig.defaults.geometryService = new GeometryService("http://gis.wim.usgs.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    esri.config.defaults.io.corsEnabledServers.push("http://gis.wim.usgs.gov/");

    const home = new HomeButton({
        map: map
    }, "homeButton");
    home.startup();

    const geoLocate = new LocateButton({
        map: map
    }, "locateButton");
    geoLocate.startup();

    const measurement = new Measurement({
        map: map,
        advancedLocationUnits: true
    }, dom.byId("measurementDiv"));
    measurement.startup();
    //bookmarks code////////////////////////////////////////////////////////////

    // Save new bookmarks in local storage, fall back to a cookie
    // If a cookie is used, it expires after a week
    // Look for stored bookmarks
    var bmJSON;
    if ( useLocalStorage ) {
        bmJSON = window.localStorage.getItem(storageName);
    } else {
        bmJSON = dojo.cookie(storageName);
    }

    // Load bookmarks
    // Fall back to a single bookmark if no cookie
    if ( bmJSON && bmJSON !== 'null' && bmJSON.length > 4) {
        console.log('cookie: ', bmJSON, bmJSON.length);
        var bmarks = dojo.fromJson(bmJSON);
        array.forEach(bmarks, function(b) {
            wlera.bookmarks.push(b);
        });
    } else {
        console.log('no stored bookmarks...');
    }

    function refreshBookmarks() {
        if ( useLocalStorage ) {
            //create new array with only user created bookmarks, to save to local storage.
            var appBMs = [];
            array.forEach(wlera.bookmarks, function (bm){
                if (bm.userCreated === false){
                    appBMs.push(bm.id);
                }
            });
            var bmStorageArray = wlera.bookmarks.slice();
            for(var i = 0; i < bmStorageArray.length; i++) {
                var obj = bmStorageArray[i];

                if(appBMs.indexOf(obj.id) !== -1) {
                    bmStorageArray.splice(i, 1);
                    i--;
                    //!!!IMPORTANT:If adding another permanent bookmark (non-user defined) may need another i decrement.
                }
            }
            console.log(bmStorageArray);
            var x = JSON.stringify(bmStorageArray);
            window.localStorage.setItem(storageName, x);
        } else {
            var exp = 7; // number of days to persist the cookie
            cookie(storageName, dojo.toJson(wlera.bookmarks), {
                expires: exp
            });
        }
    }

    function removeUserBookmarks () {
        if ( useLocalStorage ) {
            // Remove from local storage
            window.localStorage.removeItem(storageName);
        } else {
            // Remove cookie
            dojo.cookie(storageName, null, { expires: -1 });
        }
        //creates list of user defined bookmarks
        var userBMs = [];
        array.forEach(wlera.bookmarks, function (bm){
            if (bm.userCreated === true){
                userBMs.push(bm.id);
            }
        });
        //removes user bookmarks from the wlera.bookmarks array
        for(var i = 0; i < wlera.bookmarks.length; i++) {
            var obj = wlera.bookmarks[i];

            if(userBMs.indexOf(obj.id) !== -1) {
                wlera.bookmarks.splice(i, 1);
                i--;
                //!!!IMPORTANT:If adding another permanent bookmark (non-user defined) may need another i decrement.
            }
        }
        array.forEach(userBMs, function (bmID) {
            $('#' + bmID).remove();
        });
        //alert('Bookmarks Removed.');
    }

    // source for supports_local_storage function:
    // http://diveintohtml5.org/detect.html
    function supports_local_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch( e ){
            return false;
        }
    }
    //end bookmarks code ////////////////////////////////////////////////

    const overviewMapDijit = new OverviewMap({
        map: map,
        attachTo: "bottom-right"
    });
    overviewMapDijit.startup();

    var utmCoords = $('<tr class="esriMeasurementTableRow" id="utmCoords"><td><span>UTM17</span></td><td class="esriMeasurementTableCell"> <span id="utmX" dir="ltr">UTM X</span></td> <td class="esriMeasurementTableCell"> <span id="utmY" dir="ltr">UTM Y</span></td></tr>');
    $('.esriMeasurementResultTable').append(utmCoords);

    //following block forces map size to override problems with default behavior
    $(window).resize(function () {
        if ($("#legendCollapse").hasClass('in')) {
            maxLegendHeight =  ($('#mapDiv').height()) * 0.90;
            $('#legendElement').css('height', maxLegendHeight);
            $('#legendElement').css('max-height', maxLegendHeight);
            maxLegendDivHeight = ($('#legendElement').height()) - parseInt($('#legendHeading').css("height").replace('px',''));
            $('#legendDiv').css('max-height', maxLegendDivHeight);
        }
        else {
            $('#legendElement').css('height', 'initial');
        }
    });

    function showShareModal() {
        $('#shareModal').modal('show');
        //create array to store layer info(on hold for now - timing issues with setting layer vis on load
        //var layerInfo = [];
        ////retrieve layer info to record current visibility and opacity settings, push to array
        //array.forEach(mapLayerIds, function(id) {
        //    var layer = map.getLayer(id);
        //    layerInfo.push({id: layer.id, visible: layer.visible, opacity:  layer.opacity});
        //});
        //retrieve current map extent (in map's spatial reference)
        var currentMapExtent = map.extent;
        //create a URL query string with extent
        var shareQueryString = "?xmax=" + currentMapExtent.xmax.toString() + "&xmin=" + currentMapExtent.xmin.toString() + "&ymax=" + currentMapExtent.ymax.toString() + "&ymin=" + currentMapExtent.ymin.toString();
        var encodedShareQueryString = "%3Fxmax=" + currentMapExtent.xmax.toString() + "%26xmin=" + currentMapExtent.xmin.toString() + "%26ymax=" + currentMapExtent.ymax.toString() + "%26ymin=" + currentMapExtent.ymin.toString();
        //var cleanURL = document.location.href;
        //below line for local testing only. replace with above line for production
        var cleanURL = "http://wlera.wim.usgs.gov/WLERA/";
        var shareURL = cleanURL + shareQueryString;
        var encodedShareURL = cleanURL + encodedShareQueryString;
        console.log("Share URL is:" + shareURL);
        $("#showFullLinkButton").click(function(){
            $("#fullShareURL").html('<span id="fullLinkLabel" class="label label-default"><span class="glyphicon glyphicon-link"></span> Full link</span><br><textarea style="margin-bottom: 10px; cursor: text" class="form-control"  rows="3" readonly>' + shareURL + '</textarea>');
        });

        $("#showShortLinkButton").click(function(){
            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: 'https://api-ssl.bitly.com/v3/shorten?access_token=e1a16076cc8470c65419920156e0ae2c4f77850f&longUrl='+ encodedShareURL,
                headers: {'Accept': '*/*'},
                success: function (data) {
                    var bitlyURL = data.data.url;
                    $("#bitlyURL").html('<span class="label label-default"><span class="glyphicon glyphicon-link"></span> Bitly link</span><code>' + bitlyURL + '</code>');
                },
                error: function (error) {
                    $("#bitlyURL").html('<i class="fa fa-exclamation-triangle"></i> An error occurred retrieving shortened Bitly URL');

                }
            });
        });
    }

    $('#shareNavButton').click(function(){
        showShareModal();
    });

    function showPrintModal() {
        $('#printModal').modal('show');
    }

    $('#printNavButton').click(function(){
        showPrintModal();
    });

    function showBookmarkModal() {
        $('#bookmarkModal').modal('show');
    }

    $('#addBookmarkButton').click(function(){
        showBookmarkModal();
    });

    $('#printExecuteButton').click(function () {
        $(this).button('loading');
        printMap();
    });
    //captures the enter key being pressed to print map
    $("#print-title-form").on("keypress", function (e) {
        if (e.keyCode == 13) {
            $('#printExecuteButton').button('loading');
            printMap();
        }
    });
    $('#bookmarkSaveButton').click(function () {
        saveUserBookmark();
    });
    //captures the enter key being pressed to save bookmark
    $("#bookmark-title-form").on("keypress", function (e) {
        if (e.keyCode == 13) {
            saveUserBookmark();
        }
    });

    $('#bookmarkDismissButton').click(function () {
        $("#bmAlert").hide();
    });

    //displays map scale on map load
    on(map, "load", function() {
        var scale =  map.getScale().toFixed(0);
        $('#scale')[0].innerHTML = addCommas(scale);
        var initMapCenter = webMercatorUtils.webMercatorToGeographic(map.extent.getCenter());
        $('#latitude').html(initMapCenter.y.toFixed(4));
        $('#longitude').html(initMapCenter.x.toFixed(4));
        mapReady();
    });
    //displays map scale on scale change (i.e. zoom level)
    on(map, "zoom-end", function () {
        var scale =  map.getScale().toFixed(0);
        $('#scale')[0].innerHTML = addCommas(scale);
    });

    //updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes "map center" label
    on(map, "mouse-move", function (cursorPosition) {
        $('#mapCenterLabel').css("display", "none");
        if (cursorPosition.mapPoint !== null) {
            var geographicMapPt = webMercatorUtils.webMercatorToGeographic(cursorPosition.mapPoint);
            $('#latitude').html(geographicMapPt.y.toFixed(4));
            $('#longitude').html(geographicMapPt.x.toFixed(4));
        }
    });
    //updates lat/lng indicator to map center after pan and shows "map center" label.
    on(map, "pan-end", function () {
        //displays latitude and longitude of map center
        $('#mapCenterLabel').css("display", "inline");
        var geographicMapCenter = webMercatorUtils.webMercatorToGeographic(map.extent.getCenter());
        $('#latitude').html(geographicMapCenter.y.toFixed(4));
        $('#longitude').html(geographicMapCenter.x.toFixed(4));
    });

    var nationalMapBasemap = new ArcGISTiledMapServiceLayer('http://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer', {visible: false});
    map.addLayer(nationalMapBasemap);
    //on clicks to swap basemap. visibility toggling is required for nat'l map b/c it is not technically a basemap, but a tiled layer.
    on(dom.byId('btnStreets'), 'click', function () {
        map.setBasemap('streets');
        nationalMapBasemap.setVisibility(false);
    });
    on(dom.byId('btnSatellite'), 'click', function () {
        map.setBasemap('satellite');
        nationalMapBasemap.setVisibility(false);
    });
    on(dom.byId('btnGray'), 'click', function () {
        map.setBasemap('gray');
        nationalMapBasemap.setVisibility(false);
    });
    on(dom.byId('btnOSM'), 'click', function () {
        map.setBasemap('osm');
        nationalMapBasemap.setVisibility(false);
    });
    on(dom.byId('btnTopo'), 'click', function () {
        map.setBasemap('topo');
        nationalMapBasemap.setVisibility(false);
    });
    on(dom.byId('btnNatlMap'), 'click', function () {
        nationalMapBasemap.setVisibility(true);
    });
    var geocoder = new Geocoder({
        value: '',
        maxLocations: 25,
        autoComplete: true,
        arcgisGeocoder: true,
        autoNavigate: false,
        map: map
    }, 'geosearch');
    geocoder.startup();
    geocoder.on('select', geocodeSelect);
    geocoder.on('findResults', geocodeResults);
    geocoder.on('clear', clearFindGraphics);
    on(geocoder.inputNode, 'keydown', function (e) {
        if (e.keyCode == 13) {
            setSearchExtent();
        }
    });
    // map pin symbol for geosearch
    var sym = createPictureSymbol('images/purple-pin.png', 0, 12, 13, 24);
    map.on('load', function (){
        map.infoWindow.set('highlight', false);
        map.infoWindow.set('titleInBody', false);
    });
    // Geosearch functions
    on(dom.byId('btnGeosearch'),'click', geosearch);
    // Optionally confine search to map extent
    function setSearchExtent (){
        if (dom.byId('chkExtent').checked == 1) {
            geocoder.activeGeocoder.searchExtent = map.extent;
        } else {
            geocoder.activeGeocoder.searchExtent = null;
        }
    }
    function geosearch() {
        setSearchExtent();
        var def = geocoder.find();
        def.then(function (res){
            geocodeResults(res);
        });
        // Close modal
        $('#geosearchModal').modal('hide');
    }
    function geocodeSelect(item) {
        clearFindGraphics();
        var g = (item.graphic ? item.graphic : item.result.feature);
        g.setSymbol(sym);
        addPlaceGraphic(item.result,g.symbol);
        // Close modal
        //$('#geosearchModal').modal('hide');
    }
    function geocodeResults(places) {
        places = places.results;
        if (places.length > 0) {
            clearFindGraphics();
            var symbol = sym;
            // Create and add graphics with pop-ups
            for (var i = 0; i < places.length; i++) {
                addPlaceGraphic(places[i], symbol);
            }
            zoomToPlaces(places);
        } else {
            //alert('Sorry, address or place not found.');  // TODO
        }
    }
    function stripTitle(title) {
        var i = title.indexOf(',');
        if (i > 0) {
            title = title.substring(0,i);
        }
        return title;
    }
    function addPlaceGraphic(item,symbol)  {
        var place = {};
        var attributes,infoTemplate,pt,graphic;
        pt = item.feature.geometry;
        place.address = item.name;
        place.score = item.feature.attributes.Score;
        // Graphic components
        attributes = { address:stripTitle(place.address), score:place.score, lat:pt.getLatitude().toFixed(2), lon:pt.getLongitude().toFixed(2) };
        infoTemplate = new PopupTemplate({title:'{address}', description: 'Latitude: {lat}<br/>Longitude: {lon}'});
        graphic = new Graphic(pt,symbol,attributes,infoTemplate);
        // Add to map
        map.graphics.add(graphic);
    }
    function zoomToPlaces(places) {
        var multiPoint = new Multipoint(map.spatialReference);
        for (var i = 0; i < places.length; i++) {
            multiPoint.addPoint(places[i].feature.geometry);
        }
        map.setExtent(multiPoint.getExtent().expand(2.0));
    }
    function clearFindGraphics() {
        map.infoWindow.hide();
        map.graphics.clear();
    }
    function createPictureSymbol(url, xOffset, yOffset, xWidth, yHeight) {
        return new PictureMarkerSymbol(
            {
                'angle': 0,
                'xoffset': xOffset, 'yoffset': yOffset, 'type': 'esriPMS',
                'url': url,
                'contentType': 'image/png',
                'width':xWidth, 'height': yHeight
            });
    }
    function printMap() {
        var printParams = new PrintParameters();
        printParams.map = map;
        var template = new PrintTemplate();
        template.exportOptions = {
            width: 500,
            height: 400,
            dpi: 300
        };
        ////5 lines below get zoom level and set the zoomFactor for the specific layout template (mainly for graticule)
        var mapZoomLevel = map.getZoom();
        var zoomFactor = "";
        if (mapZoomLevel >= 9 ){zoomFactor = "9";}
        if (mapZoomLevel >= 11) {zoomFactor = "11";}
        if (mapZoomLevel >= 15) {zoomFactor = "15";}
        template.showAttribution = false;
        template.format = "PDF";
        //custom template stored on AGS server instance at C:\Program Files\ArcGIS\Server\Templates\ExportWebMapTemplates
        template.layout = "Letter ANSI A LandscapeWLERA" + zoomFactor;
        template.preserveScale = false;
        var legendLayer = new LegendLayer();
        legendLayer.layerId = "normalized";
        legendLayer.subLayerIds = [0];

        var userTitle = $("#printTitle").val();
        //if user does not provide title, use default. otherwise apply user title
        if (userTitle === "") {
            template.layoutOptions = {
                "titleText": "Western Lake Erie Restoration Assessment - Provisional Data",
                "authorText" : "Western Lake Erie Restoration Assessment (WLERA)",
                "copyrightText": "This page was produced by the WLERA web application at wlera.wim.usgs.gov/wlera",
                "legendLayers": [legendLayer]
            };
        } else {
            template.layoutOptions = {
                "titleText": userTitle + " - Provisional Data",
                "authorText" : "Western Lake Erie Restoration Assessment (WLERA)",
                "copyrightText": "This page was produced by the WLERA web application at wlera.wim.usgs.gov/wlera",
                "legendLayers": [legendLayer]
            };
        }
        var docTitle = template.layoutOptions.titleText;
        printParams.template = template;

        var printMap = new PrintTask("http://gis.wim.usgs.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
        printMap.execute(printParams, printDone, printError);

        function printDone(event) {
            printCount++;
            var printJobMarkup = $('<p><label>' + printCount + ': </label>&nbsp;&nbsp;<a href="'+ event.url +'" target="_blank">' + docTitle +' </a></p>');
            //$("#print-form").append(printJob);
            $("#printJobsDiv").find("p.toRemove").remove();
            $("#printModalBody").append(printJobMarkup);
            $("#printTitle").val("");
            $("#printExecuteButton").button('reset');
        }

        function printError(event) {
            alert("Sorry, an unclear print error occurred. Please try refreshing the application to fix the problem");
            $("#printExecuteButton").button('reset');
        }
    }
    function saveUserBookmark () {

        //jQuery selector variable assignment for sidebar
        var bookmarkTitle = $("#bookmarkTitle");
        var currentMapExtentJSON = map.extent.toJson();
        var userBookmarkTitle = bookmarkTitle.val();

        if (userBookmarkTitle.length > 0 ){

            var userBookmarkID = userBookmarkTitle.toLowerCase().replace(/ /g, '-');

            currentMapExtentJSON.name = userBookmarkTitle;
            currentMapExtentJSON.id = userBookmarkID;
            currentMapExtentJSON.userCreated = true;
            wlera.bookmarks.push(currentMapExtentJSON);

            var bmDeleteID = userBookmarkID + "_delete";
            var userBookmarkButton = $('<tr id="'+ userBookmarkID +'"><td  class="bookmarkTitle td-bm">'+ userBookmarkTitle +'</td><td class="text-right text-nowrap"> <button id="'+ bmDeleteID + '" class="btn btn-xs btn-warning bookmarkDelete" data-toggle="tooltip" data-placement="top" > <span class="glyphicon glyphicon-remove"></span> </button> </td> </tr>');
            $("#bookmarkList").append(userBookmarkButton);

            $('#' + bmDeleteID).confirmation({
                placement: "left",
                title: "Delete this bookmark?",
                btnOkLabel: "Yes",
                btnCancelLabel: "Cancel",
                popout: true,
                onConfirm: function() {
                    $("#" + userBookmarkID).remove();

                    for(var i = 0; i < wlera.bookmarks.length; i++) {
                        var obj = wlera.bookmarks[i];

                        if(userBookmarkID.indexOf(obj.id) !== -1) {
                            wlera.bookmarks.splice(i, 1);
                        }
                    }
                    refreshBookmarks();
                }
            });

            bookmarkTitle.val("");
            refreshBookmarks();
            $("#bmAlert").hide();
            $("#bookmarkModal").modal('hide');

        } else {
            $("#bmAlert").show();
        }
    }
    function mapReady(){
        var urlSiteObject = esri.urlToObject(document.location.href);
        if (urlSiteObject.query){
            var urlExtent = new Extent(parseFloat(urlSiteObject.query.xmin), parseFloat(urlSiteObject.query.ymin), parseFloat(urlSiteObject.query.xmax), parseFloat(urlSiteObject.query.ymax), new SpatialReference({"wkid":102100}) );
            map.setExtent(urlExtent);
            //to be used if layer visibility is asked for as part of share (has some timing challenges)
            //var urlVisLayers = urlSiteObject.query.visLayers;
            //var visLayersArray = urlVisLayers.split(',');
            var arrivalURL = document.location.href;
            var cleanURL = arrivalURL.substring(0, arrivalURL.indexOf('?'));
            history.pushState(null, "", cleanURL);
        }
    }
    // Show modal dialog; handle legend sizing (both on doc ready)
    $(document).ready(function(){
        function showGeosearchModal() {
            $('#geosearchModal').modal('show');
        }
        $('#geosearchNav').click(function(){
            showGeosearchModal();
        });
        function showAboutModal () {
            $('#aboutModal').modal('show');
        }
        $('#aboutNav').click(function(){
            showAboutModal();
        });

        $('#scaleAlertClose').click(function() {
            $('#parcelSelectScaleAlert').hide();
        });

        $('#goToScale').click(function() {
            $('#parcelSelectScaleAlert').hide();
            var parcelsScale = map.getLayer('parcelsFeat').minScale;
            map.setScale(parcelsScale);
        });

        $('#disclaimerModal').modal({backdrop: 'static'});
        $('#disclaimerModal').modal('show');

        $("#html").niceScroll();
        //jQuery selector variable assignment for sidebar
        var sidebar = $("#sidebar");
        sidebar.niceScroll();
        sidebar.scroll(function () {
           $("#sidebar").getNiceScroll().resize();
        });

        /////logic dealing with legend resizing
        //jQuery selector variable assignment for legendCollapse control
        var legendCollapse =  $('#legendCollapse');
        //jQuery selector variable assignment for legendElement div
        var legendElement = $('#legendElement');
        $("#legendDiv").niceScroll();
        maxLegendHeight =  ($('#mapDiv').height()) * 0.90;
        legendElement.css('max-height', maxLegendHeight);
        legendCollapse.on('shown.bs.collapse', function () {
            $('#legendLabel').show();
           maxLegendHeight =  ($('#mapDiv').height()) * 0.90;
           legendElement.css('max-height', maxLegendHeight);
           maxLegendDivHeight = (legendElement.height()) - parseInt($('#legendHeading').css("height").replace('px',''));
           $('#legendDiv').css('max-height', maxLegendDivHeight);
        });
        legendCollapse.on('hide.bs.collapse', function () {
           legendElement.css('height', 'initial');
            if (window.innerWidth <= 767){
                $('#legendLabel').hide();
            }
        });
        //jQuery selector for measurement tool control
        var measurementCollapse = $('#measurementCollapse');
        measurementCollapse.on('shown.bs.collapse', function () {
            //show label when the collapse panel is expanded(for mobile, where label is hidden while collapsed)
            $('#measureLabel').show();
        });
        measurementCollapse.on('hide.bs.collapse', function () {
            //hide label on collapse if window is small (mobile)
            if (window.innerWidth <= 767){
                $('#measureLabel').hide();
            }
        });
        //custom function for handling of show/hide alert divs
        $(function(){
            $("[data-hide]").on("click", function(){
                $("." + $(this).attr("data-hide")).hide();
            });
        });
        wlera.bookmarks.forEach(function(bm) {
            if (bm.userCreated === false) {
                var bookmarkButton = $('<tr id="'+ bm.id +'"><td class="bookmarkTitle td-bm">'+ bm.name +'</td><td class="text-right text-nowrap"></td> </tr>');
                $("#bookmarkList").append(bookmarkButton);
            } else {
                var bmDeleteID = bm.id + "_delete";
                var userBookmarkButton = $('<tr id="'+ bm.id +'"><td  class="bookmarkTitle td-bm">'+ bm.name +'</td><td class="text-right text-nowrap"> <button id="'+ bmDeleteID + '" class="btn btn-xs btn-warning bookmarkDelete" data-toggle="tooltip" data-placement="top" title="Delete bookmark"> <span class="glyphicon glyphicon-remove"></span> </button> </td> </tr>');
                $("#bookmarkList").append(userBookmarkButton);

                $('#' + bmDeleteID).confirmation({
                    placement: "left",
                    title: "Delete this bookmark?",
                    btnOkLabel: "Yes",
                    btnCancelLabel: "Cancel",
                    popout: true,
                    onConfirm: function() {
                        $("#" + bm.id).remove();

                        for(var i = 0; i < wlera.bookmarks.length; i++) {
                            var obj = wlera.bookmarks[i];

                            if(bm.id.indexOf(obj.id) !== -1) {
                                wlera.bookmarks.splice(i, 1);
                            }
                        }
                        refreshBookmarks();
                    }
                });


            }
        });
        //need this style onclick because user bookmark buttons are appended to dom and event delegation blah blah
        $("body").on('click', '.td-bm' ,function (){
            var bookmarkID = this.parentNode.id;
            wlera.bookmarks.forEach(function(bookmark) {
                if (bookmark.id == bookmarkID){
                    var bookmarkExtent = new Extent(bookmark.xmin, bookmark.ymin, bookmark.xmax, bookmark.ymax, new SpatialReference(bookmark.spatialReference) );
                    //var extent = new Extent(-122.68,45.53,-122.45,45.60, new SpatialReference({ wkid:4326 }));
                    map.setExtent(bookmarkExtent);
                }
            });
        });

        $('[data-toggle="tooltip"]').tooltip({delay: { show: 500, hide: 0 }});
        $('#removeBookmarksButton').confirmModal({
            confirmTitle     : 'Delete user bookmarks from memory',
            confirmMessage   : 'This action will remove all user-defined bookmarks from local memory on your computer or device. Would you like to continue?',
            confirmOk        : 'Yes, delete bookmarks',
            confirmCancel    : 'Cancel',
            confirmDirection : 'rtl',
            confirmStyle     : 'primary',
            confirmCallback  : removeUserBookmarks,
            confirmDismiss   : true,
            confirmAutoOpen  : false
        });
    });
    require([
        'esri/dijit/Legend',
        'esri/tasks/locator',
        'esri/tasks/query',
        "esri/tasks/Geoprocessor",
        "esri/tasks/FeatureSet",
        'esri/tasks/GeometryService',
        "esri/tasks/ProjectParameters",
        'esri/tasks/QueryTask',
        'esri/graphicsUtils',
        'esri/geometry/Point',
        "esri/toolbars/draw",
        'esri/SpatialReference',
        'esri/geometry/Extent',
        'esri/layers/ArcGISDynamicMapServiceLayer',
        'esri/layers/FeatureLayer',
        "esri/layers/LabelLayer",
        "esri/symbols/TextSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/SimpleRenderer",
        "esri/Color",
        "esri/dijit/Popup",
        "esri/dijit/PopupTemplate",
        'dojo/query',
        'dojo/dom'
    ], function(
        Legend,
        Locator,
        Query,
        Geoprocessor,
        FeatureSet,
        GeometryService,
        ProjectParameters,
        QueryTask,
        graphicsUtils,
        Point,
        Draw,
        SpatialReference,
        Extent,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        LabelLayer,
        TextSymbol,
        SimpleFillSymbol,
        SimpleLineSymbol,
        SimpleRenderer,
        Color,
        Popup,
        PopupTemplate,
        query,
        dom
    ) {
        var legendLayers = [];
        var customAreaDraw;
        var parcelAreaDraw;
        var clickSelectionActive = false;
        var clickRemoveSelectionActive = false;
        var drawCustomActive = false;
        var customAreaSymbol;
        var customAreaGraphic;
        var parcelAreaSymbol;
        var parcelAreaGraphic;
        var parcelDrawActive = false;
        var customAreaParams = { "inputPoly":null };
        var customAreaFeatureArray = [];

        const mapServiceRoot= "http://gis.wim.usgs.gov/arcgis/rest/services/GLCWRA/";
        const geomService = new GeometryService("http://gis.wim.usgs.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");

        const normRestorationIndexLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "normalized", visible:true} );
        normRestorationIndexLayer.setVisibleLayers([0]);
        mapLayers.push(normRestorationIndexLayer);
        mapLayerIds.push(normRestorationIndexLayer.id);
        legendLayers.push ({layer:normRestorationIndexLayer, title:" "});
        normRestorationIndexLayer.inLegendLayers = true;

        const dikesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_hydroCondition/MapServer", {id: "dikes", visible:false, minScale:100000} );
        dikesLayer.setVisibleLayers([2]);
        mapLayers.push(dikesLayer);
        mapLayerIds.push(dikesLayer.id);
        dikesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikesLayer, title: "Dikes"});

        const degFlowlinesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_hydroCondition/MapServer", {id: "degFlowlines", visible:false, minScale:100000} );
        degFlowlinesLayer.setVisibleLayers([1]);
        mapLayers.push(degFlowlinesLayer);
        mapLayerIds.push(degFlowlinesLayer.id);
        degFlowlinesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:degFlowlinesLayer, title: "Degree flowlines"});

        const culvertsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_hydroCondition/MapServer", {id: "culverts", visible:false, minScale:100000} );
        culvertsLayer.setVisibleLayers([0]);
        mapLayers.push(culvertsLayer);
        mapLayerIds.push(culvertsLayer.id);
        culvertsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:culvertsLayer, title: "Culverts"});

        //////////////begin reference layers////////////////////////////////////
        ///dynamic parcels layer for display only
        const parcelsDynLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_reference/MapServer", {id: "parcelsDyn", visible:true, minScale:100000} );
        parcelsDynLayer.setVisibleLayers([4]);
        mapLayers.push(parcelsDynLayer);
        mapLayerIds.push(parcelsDynLayer.id);
        parcelsDynLayer.inLegendLayers = false;

        ///parcels feature layer for selection/zonal stats calc
        //const parcelsLayer = new FeatureLayer(mapServiceRoot + "reference/MapServer/1", {id: "parcels", visible:false, minScale:150000, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"]});
        const parcelsFeatLayer = new FeatureLayer(mapServiceRoot + "WLERA_reference/MapServer/4", {id: "parcelsFeat", visible:true, minScale:100000, mode: FeatureLayer.MODE_SELECTION, outFields: ["*"]});
        mapLayers.push(parcelsFeatLayer);
        mapLayerIds.push(parcelsFeatLayer.id);
        //legendLayers.push ({layer:parcelsLayer, title: "Parcels"});
        parcelsFeatLayer.inLegendLayers = false;

        var parcelQuery = new Query();
        parcelQuery.outSpatialReference = map.spatialReference;
        //var parcelSelectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SHORTDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));
        var parcelSelectionSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));
        parcelsFeatLayer.setSelectionSymbol(parcelSelectionSymbol);

        //disable shift-click to recenter since we are using shift click to remove features from selection
        map.disableClickRecenter();

        //map click based parcel query (necessary because parcel layers is strictly selection mode due to full feature display causing print problems)
        map.on("click", function(evt){
            parcelQuery.geometry = evt.mapPoint;
            parcelQuery.outFields = ["*"];
            parcelQuery.returnGeometry = true;
            if (clickSelectionActive) {
                parcelsFeatLayer.selectFeatures(parcelQuery, FeatureLayer.SELECTION_ADD);
            }
            if(evt.shiftKey){
                parcelsFeatLayer.selectFeatures(parcelQuery, FeatureLayer.SELECTION_SUBTRACT);
            }
        });
        //end map click based parcel query
        parcelsFeatLayer.on("selection-complete", function () {
            $("#displayStats").prop('disabled', false);
        });
        //graphics layer based on click query for parcels feature layer. deprecated due to need to use dynamic layer for display because of printing issues
        //parcelsFeatLayer.on("click", function (evt){
        //    parcelQuery.geometry = evt.mapPoint;
        //    //parcelQuery.outFields = ["*"];
        //    parcelQuery.returnGeometry = true;
        //    if (clickSelectionActive) {
        //        parcelsFeatLayer.selectFeatures(parcelQuery, FeatureLayer.SELECTION_ADD, function (results) {
        //        });
        //    }
        //    if(evt.shiftKey){
        //        parcelsFeatLayer.selectFeatures(parcelQuery, FeatureLayer.SELECTION_SUBTRACT);
        //    }
        //});
        //end graphics layer based parcels query

        //instantiation of Draw element for custom area draw
        customAreaDraw = new Draw(map);
        //jQuery selector variable assignment for the draw custom area button
        var drawCustom =  $('#drawCustom');

        drawCustom.click(function(){
            parcelsFeatLayer.clearSelection();
            map.graphics.remove(customAreaGraphic);
            map.graphics.remove(parcelAreaGraphic);
            $("#displayStats").prop('disabled', true);
            $("#calculateStats").prop('disabled', true);
            //clear the feature set
            customAreaParams = { "inputPoly":null };
            //if active, turn off. if not, turn on
            if (drawCustomActive){
                customAreaDraw.finishDrawing();
                customAreaDraw.deactivate();
               drawCustom.removeClass("active");
               drawCustom.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw');
                drawCustomActive = false;
            } else if (!drawCustomActive) {
               drawCustom.addClass("active");
               drawCustom.html('<i class="fa fa-stop"></i>&nbsp;&nbsp;Stop drawing');
                clickSelectionActive = false;
                customAreaDraw.activate(Draw.POLYGON);
                drawCustomActive = true;
            }
            //map.setMapCursor("auto");
            //clickSelectionActive = false;
            //customAreaDraw.activate(Draw.POLYGON);
            //selectionToolbar.activate(Draw.POLYGON);
        });

        //jQuery selector variable assignment for select parcels button
        var selectParcels = $('#selectParcels');
        selectParcels.click(function(){
           drawCustom.removeClass("active");
           drawCustom.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw');
            drawCustomActive = false;
            customAreaDraw.deactivate();
            if (clickSelectionActive) {
                selectParcels.removeClass("active");
                selectParcels.html('<span class="ti-plus"></span>&nbsp;&nbsp;Click');
                map.setMapCursor("auto");
                clickSelectionActive = false;
            } else if (!clickSelectionActive) {
                selectParcels.addClass("active");
                selectParcels.html('<i class="fa fa-stop"></i>&nbsp;&nbsp;Stop selecting');
                map.setMapCursor("crosshair");
                clickRemoveSelectionActive = false;
                clickSelectionActive = true;
            }
        });

        $('#clearSelection').click(function(){
            parcelsFeatLayer.clearSelection();
            map.graphics.remove(customAreaGraphic);
            map.graphics.remove(parcelAreaGraphic);
            $("#displayStats").prop('disabled', true);
            $("#calculateStats").prop('disabled', true);
            //clear the feature set and the customFeatureArray
            customAreaParams = { "inputPoly":null };
            customAreaFeatureArray = [];
            console.log("Length  of input poly array: " + customAreaParams.inputPoly.features.length)
        });
        zonalStatsGP = new Geoprocessor("http://gis.wim.usgs.gov/arcgis/rest/services/GLCWRA/WLERAZonalStats/GPServer/WLERAZonalStats");
        zonalStatsGP.setOutputSpatialReference({wkid:102100});
        zonalStatsGP.on("execute-complete", displayCustomStatsResults);
        $('#calculateStats').click(function () {
            $(this).button('loading');
            zonalStatsGP.execute(customAreaParams);
        });
        on(customAreaDraw, "DrawEnd", function (customAreaGeometry) {
            //var symbol = new SimpleFillSymbol("none", new SimpleLineSymbol("dashdot", new Color([255,0,0]), 2), new Color([255,255,0,0.25]));
            customAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));
            customAreaGraphic = new Graphic(customAreaGeometry,customAreaSymbol);
            map.graphics.add(customAreaGraphic);
            customAreaDraw.deactivate();
            drawCustom.removeClass("active");
            drawCustom.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw');
            drawCustomActive = false;
            customAreaFeatureArray.push(customAreaGraphic);
            var featureSet = new FeatureSet();
            featureSet.features = customAreaFeatureArray;
            customAreaParams = { "inputPoly":featureSet };
            $("#calculateStats").prop('disabled', false);
            //zonalStatsGP.execute(customAreaParams);
        });

        //instantiation of Draw element for parcel area draw
        parcelAreaDraw = new Draw(map);
        //jQuery selector variable assignment for the draw custom area button
        var selectParcelsDraw =  $('#selectParcelsDraw');

        selectParcelsDraw.click(function(){
            map.graphics.remove(parcelAreaGraphic);
            var currentMapScale = map.getScale();
            var parcelsScale = map.getLayer('parcelsFeat').minScale;
            //if active, turn off. if not, turn on
            if (parcelDrawActive){
                parcelAreaDraw.finishDrawing();
                parcelAreaDraw.deactivate();
                selectParcelsDraw.removeClass("active");
                selectParcelsDraw.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw');
                parcelDrawActive = false;
            } else if (!parcelDrawActive) {
                if (currentMapScale > parcelsScale ){
                    $('#parcelSelectScaleAlert').show();
                } else {
                    selectParcelsDraw.addClass("active");
                    selectParcelsDraw.html('<i class="fa fa-stop"></i>&nbsp;&nbsp;Stop drawing');
                    clickSelectionActive = false;
                    parcelAreaDraw.activate(Draw.POLYGON);
                    parcelDrawActive = true;
                }
            }
        });

        //below is for selecting parcels with a user-drawn polygon area
        on(parcelAreaDraw, "DrawEnd", function (parcelAreaGeometry) {
            parcelAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([25, 25, 255]), 2), new Color([0, 0, 0, 0.1]));
            parcelAreaGraphic = new Graphic(parcelAreaGeometry,parcelAreaSymbol);
            map.graphics.add(parcelAreaGraphic);
            parcelAreaDraw.deactivate();

            selectParcelsDraw.removeClass("active");
            selectParcelsDraw.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw');
            drawCustomActive = false;

            parcelQuery.geometry = parcelAreaGeometry;
            parcelsFeatLayer.selectFeatures(parcelQuery,
                FeatureLayer.SELECTION_ADD);
        });

        function displayCustomStatsResults (customStatsResults) {
            $("#calculateStats").button('reset');
            var results = customStatsResults.results[0].value.features[0].attributes;
            var zonalStatsTable = $('#zonalStatsTable');
            zonalStatsTable.html('<tr><th>Mean </th><th>Standard Deviation</th><th>Max</th></tr>');
            zonalStatsTable.append('<tr><td>' + results.MEAN.toFixed(4) + '</td><td>' + results.STD.toFixed(3) + '</td><td>' + results.MAX + '</td></tr>');
            $('#zonalStatsModal').modal('show');
        }

        $('#displayStats').click(function(){
            $('#zonalStatsTable').html('<tr><th>Parcel ID</th><th>Hectares</th><th>Mean </th><th>Standard Deviation</th><th>Max</th></tr>');
            //if there are selected parcels, retrieve their zonal stats attributes and append to the table
            if (map.getLayer('parcelsFeat').getSelectedFeatures().length > 0) {
                $.each(map.getLayer('parcelsFeat').getSelectedFeatures(), function() {
                    $('#zonalStatsTable').append('<tr><td>' + this.attributes.PARCELS_ID + '</td><td>' + this.attributes.Hec.toFixed(3) + '</td><td>' + this.attributes.MEAN.toFixed(4) + '</td><td>' + this.attributes.STD.toFixed(3) + '</td><td>' + this.attributes.stat_MAX + '</td></tr>');
                    //$('#zonalStatsTable').append('<tr><td>' + this.attributes.P_ID + '</td><td>' + this.attributes.Hec + '</td><td>' + this.attributes.MEAN + '</td><td>' + this.attributes.STD + '</td><td>' + this.attributes.MAX + '</td></tr>');
                    $('#zonalStatsModal').modal('show');
                });
            }
        });

        const studyAreaLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_reference/MapServer", {id: "studyArea", visible:true} );
        studyAreaLayer.setVisibleLayers([0]);
        mapLayers.push(studyAreaLayer);
        mapLayerIds.push(studyAreaLayer.id);
        legendLayers.push({layer:studyAreaLayer , title:" "});
        studyAreaLayer.inLegendLayers = true;

        const GLRIWetlandsLayer = new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_reference/MapServer", {id: "GLRIWetlands", visible:true, minScale: 100000, maxScale: 10000 } );
        GLRIWetlandsLayer.setVisibleLayers([2]);
        mapLayers.push(GLRIWetlandsLayer);
        //mapLayerIds.push(GLRIWetlandsLayer.id);
        legendLayers.push({layer:GLRIWetlandsLayer, title:" "});
        GLRIWetlandsLayer.inLegendLayers = true;

        var aerialsPopup = new PopupTemplate({
            title: "U.S. ACOE Aerial Photo",
            mediaInfos: [{
                "title": "",
                "caption": "Date & Time taken: {date_}",
                "type": "image",
                "value": {
                    sourceURL: "{imageUrl}",
                    linkURL: "{imageUrl}"
                }
            }]
        });
        //const aerialsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "reference/MapServer", {id: "aerials", visible:false} );
        //aerialsLayer.setVisibleLayers([2]);
        var aerialsLayer = new FeatureLayer(mapServiceRoot + "WLERA_reference/MapServer/1", {id: "aerials", layerID: "aerials", visible:true, minScale:100000, mode: FeatureLayer.MODE_ONDEMAND, outFields: ["*"], infoTemplate: aerialsPopup});
        aerialsLayer.id = "aerials";
        mapLayers.push(aerialsLayer);
        mapLayerIds.push(aerialsLayer.id);
        legendLayers.push({layer:aerialsLayer , title:"US Army Corps of Engineers Aerial Photos "});
        aerialsLayer.inLegendLayers = true;
        ////end reference layers////////////////////////////////////////

        ///parameters group
        const landuseLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "landuse", visible:false} );
        landuseLayer .setVisibleLayers([8]);
        mapLayers.push(landuseLayer );
        mapLayerIds.push(landuseLayer.id);
        landuseLayer.inLegendLayers = false;
        //legendLayers.push ({layer:landuseLayer , title: "P6 - Landuse"});

        const imperviousSurfacesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "imperviousSurfaces", visible:false} );
        imperviousSurfacesLayer.setVisibleLayers([7]);
        mapLayers.push(imperviousSurfacesLayer);
        mapLayerIds.push(imperviousSurfacesLayer.id);
        imperviousSurfacesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:imperviousSurfacesLayer, title: "P5 - Impervious Surfaces"});

        const conservedLandsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "conservedLands", visible:false} );
        conservedLandsLayer.setVisibleLayers([6]);
        mapLayers.push(conservedLandsLayer);
        mapLayerIds.push(conservedLandsLayer.id);
        conservedLandsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:conservedLandsLayer, title: "P4 - Conserved Lands"});

        const flowlineLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "flowline", visible:false} );
        flowlineLayer.setVisibleLayers([5]);
        mapLayers.push(flowlineLayer);
        mapLayerIds.push(flowlineLayer.id);
        flowlineLayer.inLegendLayers = false;
        //legendLayers.push ({layer:flowlineLayer, title: "P3 - Flowline"});

        const wetsoilsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "wetsoils", visible:false} );
        wetsoilsLayer.setVisibleLayers([4]);
        mapLayers.push(wetsoilsLayer);
        mapLayerIds.push(wetsoilsLayer.id);
        wetsoilsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:wetsoilsLayer, title: "P2 - Wetsoils"});

        const hydroperiodLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "hydroperiod", visible:false} );
        hydroperiodLayer.setVisibleLayers([3]);
        mapLayers.push(hydroperiodLayer);
        mapLayerIds.push(hydroperiodLayer.id);
        hydroperiodLayer.inLegendLayers = false;
        //legendLayers.push ({layer:hydroperiodLayer, title: "P1 - Hydroperiod"});

        const waterMaskLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "WLERA_restorationModel/MapServer", {id: "waterMask", visible:true, opacity: 0.75} );
        waterMaskLayer.setVisibleLayers([2]);
        mapLayers.push(waterMaskLayer);
        mapLayerIds.push(waterMaskLayer.id);
        waterMaskLayer.inLegendLayers = false;
        //legendLayers.push ({layer:waterMaskLayer, title: "P0 - Water Mask"});
        /////end parameters group

        map.addLayers(mapLayers);

        //dojo.keys.copyKey maps to CTRL on windows and Cmd on Mac., but has wrong code for Chrome on Mac
        var snapManager = map.enableSnapping({
            snapKey: has("mac") ? keys.META : keys.CTRL
        });
        var layerInfos = [{
            layer: parcelsFeatLayer
        }];
        snapManager.setLayerInfos(layerInfos);

        var projectParams = new ProjectParameters();

        var outSR = new SpatialReference(26917);
        measurement.on("measure-end", function(evt){
            //$("#utmCoords").remove();
            //var resultGeom = evt.geometry;
            projectParams.geometries = [evt.geometry];
            projectParams.outSR = outSR;
            var absoluteX = (evt.geometry.x)*-1;
            if ( absoluteX < 84 && absoluteX > 78 ){
                geomService.project(projectParams, function (projectedGeoms){
                    var utmResult = projectedGeoms[0];
                    console.log(utmResult);
                    var utmX = utmResult.x.toFixed(0);
                    var utmY = utmResult.y.toFixed(0);
                    $("#utmX").html(utmX);
                    $("#utmY").html(utmY);
                    //var utmCoords = $('<tr id="utmCoords"><td dojoattachpoint="pinCell"><span>UTM17</span></td> <td class="esriMeasurementTableCell"> <span id="utmX" dir="ltr">' + utmX + '</span></td> <td class="esriMeasurementTableCell"> <span id="utmY" dir="ltr">' + utmY + '</span></td></tr>');
                    //$('.esriMeasurementResultTable').append(utmCoords);
                });
            } else {
                //$("#utmX").html("out of zone");
                $("#utmX").html('<span class="label label-danger">outside zone</span>');
                //$("#utmY").html("out of zone");
                $("#utmY").html('<span class="label label-danger">outside zone</span>');
            }
        });

        //checks to see which layers are visible on load, sets toggle to active (this only works for dynamic layers. feature layer ids are in a separate array)
        for(var j = 0; j < map.layerIds.length; j++) {
            var layer = map.getLayer(map.layerIds[j]);
            if (layer.visible) {
                $("#" + layer.id).button('toggle');
                $("#" + layer.id).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            }
        }
        //repeat of the above layer vis check, this one for feature layers which only appear in the graphicsLayerIds array (thanks esri)
        for(var j = 0; j < map.graphicsLayerIds.length; j++) {
            var layer = map.getLayer(map.graphicsLayerIds[j]);
            if (layer.visible) {
                $("#" + layer.id).button('toggle');
                $("#" + layer.id).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            }
        }
        //toggles the visibility of corresponding layer and status of toggle button on click.
        $("button.lyrTog").click(function(e) {
            //toggle checkmark and button state
            $(this).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            $(this).button('toggle');
            e.preventDefault();
            e.stopPropagation();
            var layer =   map.getLayer($(this).attr('id'));
            ////layer toggle
            if (layer.visible) {
                layer.setVisibility(false);
            } else {
                layer.setVisibility(true);
                //add to legend layers object if not there already(this prevents waiting for all to load on init)
                if (layer.inLegendLayers === false) {
                    legendLayers.push({layer: layer, title: " "});
                    layer.inLegendLayers = true;
                    legend.refresh();
                }
            }
        });
        //toggles the icons of the group toggle buttons on click
        $('#hydroConditionGroup, #parametersGroup, #4scaleGroup').on('hide.bs.collapse', function () {
            var groupToggleID = $(this)[0].id.replace('Group', '');
            $(("#"+ groupToggleID)).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            $(("#"+ groupToggleID)).find('i.chevron').toggleClass('fa-chevron-right fa-chevron-down');

            var buttonGroupID = $(this).attr('id') + "Buttons";
            $("#" + buttonGroupID).button('toggle');

        });
        $('#hydroConditionGroup, #parametersGroup, #4scaleGroup').on('show.bs.collapse', function () {
            var groupToggleID = $(this)[0].id.replace('Group', '');
            $(("#"+ groupToggleID)).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            $(("#"+ groupToggleID)).find('i.chevron').toggleClass('fa-chevron-right fa-chevron-down');
        });

        $(".zoomto").hover(function (e) {

            $(".zoomDialog").remove();
            var layerToChange = this.parentNode.id;
            var zoomDialogMarkup = $('<div class="zoomDialog"><label class="zoomClose pull-right">X</label><br><div class="list-group"><a href="#" id="zoomscale" class="list-group-item lgi-zoom zoomscale">Zoom to scale</a> <a id="zoomcenter" href="#" class="list-group-item lgi-zoom zoomcenter">Zoom to center</a><a id="zoomextent" href="#" class="list-group-item lgi-zoom zoomextent">Zoom to extent</a></div></div>');
            $("body").append(zoomDialogMarkup);

            $(".zoomDialog").css('left', event.clientX-80);
            $(".zoomDialog").css('top', event.clientY-5);

            $(".zoomDialog").mouseleave(function() {
                $(".zoomDialog").remove();
            });

            $(".zoomClose").click(function() {
                $(".zoomDialog").remove();
            });

            $('#zoomscale').click(function (e) {
                //logic to zoom to layer scale
                var layerMinScale = map.getLayer(layerToChange).minScale;
                map.setScale(layerMinScale);
            });

            $("#zoomcenter").click(function (e){
                //logic to zoom to layer center
                //var layerCenter = map.getLayer(layerToChange).fullExtent.getCenter();
                //map.centerAt(layerCenter);
                var dataCenter = new Point(-83.208084,41.628103, new SpatialReference({wkid:4326}));
                map.centerAt(dataCenter);
            });

            $("#zoomextent").click(function (e){
                //logic to zoom to layer extent
                var layerExtent = map.getLayer(layerToChange).fullExtent;
                var extentProjectParams = new ProjectParameters();
                extentProjectParams.outSR = new SpatialReference(102100);
                extentProjectParams.geometries = [layerExtent];
                geomService.project(extentProjectParams, function(projectedExtentObj) {
                    var projectedExtent = projectedExtentObj[0];
                    map.setExtent(projectedExtent, new SpatialReference({ wkid:102100 }));
                });
            });
        });

        $(".opacity").hover(function () {

            $(".opacitySlider").remove();
            var layerToChange = this.parentNode.id;
            var currOpacity = map.getLayer(layerToChange).opacity;
            var sliderMarkup = $('<div class="opacitySlider"><label id="opacityValue">Opacity: ' + currOpacity + '</label><label class="opacityClose pull-right">X</label><input id="slider" type="range"></div>');
            $("body").append(sliderMarkup);

            var slider = $("#slider");
            slider[0].value = currOpacity*100;
            $(".opacitySlider").css('left', event.clientX-180);
            $(".opacitySlider").css('top', event.clientY-5);
            $(".opacitySlider").mouseleave(function() {
                $(".opacitySlider").remove();
            });
            $(".opacityClose").click(function() {
                $(".opacitySlider").remove();
            });
            slider.change(function(event) {
                //get the value of the slider with this call
                var o = (slider[0].value)/100;
                console.log("o: " + o);
                $("#opacityValue").html("Opacity: " + o);
                map.getLayer(layerToChange).setOpacity(o);
                //here I am just specifying the element to change with a "made up" attribute (but don't worry, this is in the HTML specs and supported by all browsers).
                //var e = '#' + $(this).attr('data-wjs-element');
                //$(e).css('opacity', o)
            });
        });
        var legend = new Legend({
            map: map,
            layerInfos: legendLayers
        }, "legendDiv");
        legend.startup();
    });//end of require statement containing legend building code
});

