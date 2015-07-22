//for jshint
'use strict';
// Generated on 2015-04-13 using generator-wim 0.0.1

/**
 * Created by bdraper on 4/3/2015.
 */

var wlera = wlera || {
        bookmarks: [
            {"id":"ottawa-nwr", "name":"Ottawa NWR", "userCreated": false, spatialReference:{"wkid":102100}, "xmax":-9253627.864758775,"xmin":-9268896.161158718,"ymax":5109457.058192252,"ymin":5099759.110228584},
            {"id":"erie-marsh", "name":"Erie Marsh", "userCreated": false, spatialReference:{"wkid":102100}, "xmax":-9281192.968084078,"xmin":-9296461.264484022,"ymax":5130611.005770145,"ymin":5120913.057806477}
        ]
        ,
        globals: {

        }
    };


var map;
var maxLegendHeight;
var maxLegendDivHeight;
var printCount = 0;
var storageName = 'esrijsapi_mapmarks';
var bmToDelete = "";
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
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/keys",
    "dojo/cookie",
    "dojo/has",
    'dojo/dom',
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
    array,
    lang,
    keys,
    cookie,
    has,
    dom,
    on
) {

    var useLocalStorage = supports_local_storage();

    map = Map('mapDiv', {
        basemap: 'gray',
        center: [-82.745, 41.699],
        spatialReference: 26917,
        zoom: 10,
        logo: false
    });

    //esriConfig.defaults.geometryService = new esri.tasks.GeometryService("http://wlera.wimcloud.usgs.gov:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    esriConfig.defaults.geometryService = new GeometryService("http://54.152.244.240:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    esri.config.defaults.io.corsEnabledServers.push("http://52.0.108.106:6080/");

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
    if ( bmJSON && bmJSON != 'null' && bmJSON.length > 4) {
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
                if (bm.userCreated == false){
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
            if (bm.userCreated == true){
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
            //$('#' + bmToDelete).remove();
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
        var shareQueryString = "?xmax=" + map.extent.xmax.toString() + "&xmin=" + map.extent.xmin.toString() + "&ymax=" + map.extent.ymax.toString() + "&ymin=" + map.extent.ymin.toString();
        var cleanURL = document.location.href;

        var shareURL = cleanURL + shareQueryString;
        console.log("Share URL is:" + shareURL);
        $("#fullShareURL").html(shareURL);

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

    $('#bookmarkSaveButton').click(function () {
        saveUserBookmark();
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
        if (cursorPosition.mapPoint != null) {
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

    // Symbols
    var sym = createPictureSymbol('images/purple-pin.png', 0, 12, 13, 24);

    map.on('load', function (){
        map.infoWindow.set('highlight', false);
        map.infoWindow.set('titleInBody', false);
    });

    // Geosearch functions
    on(dom.byId('btnGeosearch'),'click', geosearch);

    // Optionally confine search to map extent
    function setSearchExtent (){
        if (dom.byId('chkExtent').checked === 1) {
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
        template.format = "PDF";
        template.layout = "Letter ANSI A Landscape";
        template.preserveScale = false;
        var legendLayer = new LegendLayer();
        legendLayer.layerId = "normalized";
        //legendLayer.subLayerIds = [*];

        var userTitle = $("#printTitle").val();
        //if user does not provide title, use default. otherwise apply user title
        if (userTitle == "") {
            template.layoutOptions = {
                "titleText": "Western Lake Erie Restoration Assessment",
                "authorText" : "Western Lake Erie Restoration Assessment (WLERA)",
                "copyrightText": "This page was produced by the WLERA web application at [insert app URL]",
                "legendlayers": [legendLayer]
            };
        } else {
            template.layoutOptions = {
                "titleText": userTitle,
                "authorText" : "Western Lake Erie Restoration Assessment (WLERA)",
                "copyrightText": "This page was produced by the WLERA web application at [insert app URL]",
                "legendlayers": [legendLayer]
            };
        }
        var docTitle = template.layoutOptions.titleText;
        printParams.template = template;
        var printMap = new PrintTask("http://wlera.wimcloud.usgs.gov:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
        printMap.execute(printParams, printDone, printError);

        function printDone(event) {
            //alert(event.url);
            //window.open(event.url, "_blank");
            printCount++;
            //var printJob = $('<a href="'+ event.url +'" target="_blank">Printout ' + printCount + ' </a>');
            var printJob = $('<p><label>' + printCount + ': </label>&nbsp;&nbsp;<a href="'+ event.url +'" target="_blank">' + docTitle +' </a></p>');
            //$("#print-form").append(printJob);
            $("#printJobsDiv").find("p.toRemove").remove();
            $("#printModalBody").append(printJob);
            $("#printExecuteButton").button('reset');
        }

        function printError(event) {
            alert("Sorry, an unclear print error occurred. Please try refreshing the application to fix the problem");
        }
    }

    function saveUserBookmark () {

        var currentMapExtentJSON = map.extent.toJson();
        var userBookmarkTitle = $("#bookmarkTitle").val();
        var userBookmarkID = userBookmarkTitle.toLowerCase().replace(/ /g, '-');

        currentMapExtentJSON.name = userBookmarkTitle;
        currentMapExtentJSON.id = userBookmarkID;
        currentMapExtentJSON.userCreated = true;
        wlera.bookmarks.push(currentMapExtentJSON);

        var userBookmarkButton = $('<tr id="'+ userBookmarkID +'"><td  class="bookmarkTitle td-bm">'+ userBookmarkTitle +'</td><td class="text-right text-nowrap"> <button class="btn btn-xs btn-warning bookmarkDelete" data-toggle="tooltip" data-placement="top" title="Delete bookmark"> <span class="glyphicon glyphicon-remove"></span> </button> </td> </tr>');
        $("#bookmarkList").append(userBookmarkButton);
        refreshBookmarks();
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
        // Geosearch nav menu is selected
        $('#geosearchNav').click(function(){
            showGeosearchModal();
        });

        $("#html").niceScroll();
        $("#sidebar").niceScroll();
        $("#sidebar").scroll(function () {
           $("#sidebar").getNiceScroll().resize();
        });
        
        $("#legendDiv").niceScroll();
        
        maxLegendHeight =  ($('#mapDiv').height()) * 0.90;
        $('#legendElement').css('max-height', maxLegendHeight);
        
        $('#legendCollapse').on('shown.bs.collapse', function () {
            $('#legendLabel').show();
           maxLegendHeight =  ($('#mapDiv').height()) * 0.90;
           $('#legendElement').css('max-height', maxLegendHeight);
           maxLegendDivHeight = ($('#legendElement').height()) - parseInt($('#legendHeading').css("height").replace('px',''));
           $('#legendDiv').css('max-height', maxLegendDivHeight);
        });
        $('#legendCollapse').on('hide.bs.collapse', function () {
           $('#legendElement').css('height', 'initial');
            if (window.innerWidth <= 767){
                $('#legendLabel').hide();
            }
        });

        $('#measurementCollapse').on('shown.bs.collapse', function () {
            //show label when the collapse panel is expanded(for mobile, where label is hidden while collapsed)
            $('#measureLabel').show();
        });
        $('#measurementCollapse').on('hide.bs.collapse', function () {
            //hide label on collapse if window is small (mobile)
            if (window.innerWidth <= 767){
                $('#measureLabel').hide();
            }
        });

        wlera.bookmarks.forEach(function(bm) {
            if (bm.userCreated == false) {
                var bookmarkButton = $('<tr id="'+ bm.id +'"><td class="bookmarkTitle td-bm">'+ bm.name +'</td><td class="text-right text-nowrap"></td> </tr>');
                $("#bookmarkList").append(bookmarkButton);
            } else {
                var userBookmarkButton = $('<tr id="'+ bm.id +'"><td  class="bookmarkTitle td-bm">'+ bm.name +'</td><td class="text-right text-nowrap"> <button class="btn btn-xs btn-warning bookmarkDelete" data-toggle="tooltip" data-placement="top" title="Delete bookmark"> <span class="glyphicon glyphicon-remove"></span> </button> </td> </tr>');
                $("#bookmarkList").append(userBookmarkButton);
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
            })
        });

        $("body").on('click', '.bookmarkDelete' ,function (){
             bmToDelete = this.parentNode.parentNode.id;
            $('.bookmarkDelete').confirmation({
                placement: "left",
                title: "Delete this bookmark?",
                btnOkLabel: "Yes",
                btnCancelLabel: "Cancel",
                popout: true,
                onConfirm: function() {
                    $('#' + bmToDelete).remove();

                    for(var i = 0; i < wlera.bookmarks.length; i++) {
                        var obj = wlera.bookmarks[i];

                        if(bmToDelete.indexOf(obj.id) !== -1) {
                            wlera.bookmarks.splice(i, 1);
                        }
                    }
                    refreshBookmarks();
                }
            });
        });

        $('[data-toggle="tooltip"]').tooltip({delay: { show: 500, hide: 0 }});

        //$('#removeBookmarksButton').confirmModal();

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
        'esri/tasks/GeometryService',
        "esri/tasks/ProjectParameters",
        'esri/tasks/QueryTask',
        'esri/graphicsUtils',
        'esri/geometry/Point',
        'esri/SpatialReference',
        'esri/geometry/Extent',
        'esri/layers/ArcGISDynamicMapServiceLayer',
        'esri/layers/FeatureLayer',
        'dojo/query',
        'dojo/dom'
    ], function(
        Legend,
        Locator,
        Query,
        GeometryService,
        ProjectParameters,
        QueryTask,
        graphicsUtils,
        Point,
        SpatialReference,
        Extent,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        query,
        dom
    ) {

        var legendLayers = [];
        var layersObject = [];
        var layerArray = [];
        var staticLegendImage;
        var identifyTask, identifyParams;
        var navToolbar;
        var locator;
        var legendLayerInfos = [];

        const mapServiceRoot= "http://wlera.wimcloud.usgs.gov:6080/arcgis/rest/services/WLERA/";

        const geomService = new GeometryService("http://wlera.wimcloud.usgs.gov:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");

        const dikedAreasLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "dikedAreas", visible:false} );
        dikedAreasLayer.setVisibleLayers([4]);
        mapLayers.push(dikedAreasLayer);
        mapLayerIds.push(dikedAreasLayer.id);
        dikedAreasLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikedAreasLayer, title: "Diked Areas"});

        const dikesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "dikes", visible:false, minScale:100000} );
        dikesLayer.setVisibleLayers([3]);
        mapLayers.push(dikesLayer);
        mapLayerIds.push(dikesLayer.id);
        dikesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikesLayer, title: "Dikes"});

        const degFlowlinesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "degFlowlines", visible:false, minScale:100000} );
        degFlowlinesLayer.setVisibleLayers([2]);
        mapLayers.push(degFlowlinesLayer);
        mapLayerIds.push(degFlowlinesLayer.id);
        degFlowlinesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:degFlowlinesLayer, title: "Degree flowlines"});

        const culvertsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "culverts", visible:false, minScale:100000} );
        culvertsLayer.setVisibleLayers([1]);
        mapLayers.push(culvertsLayer);
        mapLayerIds.push(culvertsLayer.id);
        culvertsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:culvertsLayer, title: "Culverts"});

        const dikeBreaksLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "dikeBreaks", visible:false, minScale:100000} );
        dikeBreaksLayer.setVisibleLayers([0]);
        mapLayers.push(dikeBreaksLayer);
        mapLayerIds.push(dikeBreaksLayer.id);
        dikeBreaksLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikeBreaksLayer, title: "Dike Breaks"});

        //begin reference layers////////////////////////////////////
        //const parcelsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "reference/MapServer", {id: "parcels", visible:false, minScale:100000} );
        //parcelsLayer.setVisibleLayers([2]);
        const parcelsLayer = new FeatureLayer(mapServiceRoot + "reference/MapServer/1", {id: "parcels", visible:false, minScale:100000, mode: FeatureLayer.MODE_ONDEMAND, outfields: ["*"]});
        mapLayers.push(parcelsLayer);
        mapLayerIds.push(parcelsLayer.id);
        //legendLayers.push ({layer:parcelsLayer, title: "Parcels"});
        parcelsLayer.inLegendLayers = false;

        const studyAreaLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "reference/MapServer", {id: "studyArea", visible:true} );
        studyAreaLayer.setVisibleLayers([0]);
        mapLayers.push(studyAreaLayer);
        mapLayerIds.push(studyAreaLayer.id);
        legendLayers.push({layer:studyAreaLayer , title:" "});
        studyAreaLayer.inLegendLayers = true;
        ////end reference layers////////////////////////////////////////

        ///parameters group
        const landuseLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "landuse", visible:false} );
        landuseLayer .setVisibleLayers([8]);
        mapLayers.push(landuseLayer );
        mapLayerIds.push(landuseLayer.id);
        landuseLayer.inLegendLayers = false;
        //legendLayers.push ({layer:landuseLayer , title: "P6 - Landuse"});

        const imperviousSurfacesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "imperviousSurfaces", visible:false} );
        imperviousSurfacesLayer.setVisibleLayers([7]);
        mapLayers.push(imperviousSurfacesLayer);
        mapLayerIds.push(imperviousSurfacesLayer.id);
        imperviousSurfacesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:imperviousSurfacesLayer, title: "P5 - Impervious Surfaces"});

        const conservedLandsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "conservedLands", visible:false} );
        conservedLandsLayer.setVisibleLayers([6]);
        mapLayers.push(conservedLandsLayer);
        mapLayerIds.push(conservedLandsLayer.id);
        conservedLandsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:conservedLandsLayer, title: "P4 - Conserved Lands"});

        const flowlineLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "flowline", visible:false} );
        flowlineLayer.setVisibleLayers([5]);
        mapLayers.push(flowlineLayer);
        mapLayerIds.push(flowlineLayer.id);
        flowlineLayer.inLegendLayers = false;
        //legendLayers.push ({layer:flowlineLayer, title: "P3 - Flowline"});

        const wetsoilsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "wetsoils", visible:false} );
        wetsoilsLayer.setVisibleLayers([4]);
        mapLayers.push(wetsoilsLayer);
        mapLayerIds.push(wetsoilsLayer.id);
        wetsoilsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:wetsoilsLayer, title: "P2 - Wetsoils"});

        const hydroperiodLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "hydroperiod", visible:false} );
        hydroperiodLayer.setVisibleLayers([3]);
        mapLayers.push(hydroperiodLayer);
        mapLayerIds.push(hydroperiodLayer.id);
        hydroperiodLayer.inLegendLayers = false;
        //legendLayers.push ({layer:hydroperiodLayer, title: "P1 - Hydroperiod"});


        const waterMaskLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "waterMask", visible:false} );
        waterMaskLayer.setVisibleLayers([2]);
        mapLayers.push(waterMaskLayer);
        mapLayerIds.push(waterMaskLayer.id);
        waterMaskLayer.inLegendLayers = false;
        //legendLayers.push ({layer:waterMaskLayer, title: "P0 - Water Mask"});

        /////end parameters group
        //


        const normRestorationIndexLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "normalized", visible:true} );
        normRestorationIndexLayer.setVisibleLayers([0]);
        mapLayers.push(normRestorationIndexLayer);
        mapLayerIds.push(normRestorationIndexLayer.id);
        legendLayers.push ({layer:normRestorationIndexLayer, title:" "});
        normRestorationIndexLayer.inLegendLayers = true;


        map.addLayers(mapLayers);

        //dojo.keys.copyKey maps to CTRL on windows and Cmd on Mac., but has wrong code for Chrome on Mac
        var snapManager = map.enableSnapping({
            snapKey: has("mac") ? keys.META : keys.CTRL
        });
        var layerInfos = [{
            layer: parcelsLayer
        }];
        snapManager.setLayerInfos(layerInfos);


        var outSR = new SpatialReference(26917);
        measurement.on("measure-end", function(evt){
            //$("#utmCoords").remove();
            var resultGeom = evt.geometry;
            var utmResult;
            var absoluteX = (evt.geometry.x)*-1;
            if ( absoluteX < 84 && absoluteX > 78 ){
                geomService.project ( [ resultGeom ], outSR, function (projectedGeoms){
                    utmResult = projectedGeoms[0];
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


            //geomService.project ( [ resultGeom ], outSR, function (projectedGeoms){
            //    utmResult = projectedGeoms[0];
            //    console.log(utmResult);
            //
            //
            //
            //});

        });

        //checks to see which layers are visible on load, sets toggle to active
        for(var j = 0; j < map.layerIds.length; j++) {
            var layer = map.getLayer(map.layerIds[j]);
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
                if (layer.inLegendLayers == false) {
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
            var zoomDialog = $('<div class="zoomDialog"><label class="zoomClose pull-right">X</label><br><div class="list-group"><a href="#" id="zoomscale" class="list-group-item lgi-zoom zoomscale">Zoom to scale</a> <a id="zoomcenter" href="#" class="list-group-item lgi-zoom zoomcenter">Zoom to center</a><a id="zoomextent" href="#" class="list-group-item lgi-zoom zoomextent">Zoom to extent</a></div></div>');

            $("body").append(zoomDialog);

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
                map.setExtent(layerExtent);
            });
        });


        $(".opacity").hover(function () {
            $(".opacitySlider").remove();
            var layerToChange = this.parentNode.id;
            var currOpacity = map.getLayer(layerToChange).opacity;
            var slider = $('<div class="opacitySlider"><label id="opacityValue">Opacity: ' + currOpacity + '</label><label class="opacityClose pull-right">X</label><input id="slider" type="range"></div>');
            $("body").append(slider);

            $("#slider")[0].value = currOpacity*100;
            $(".opacitySlider").css('left', event.clientX-180);
            $(".opacitySlider").css('top', event.clientY-5);

            $(".opacitySlider").mouseleave(function() {
                $(".opacitySlider").remove();
            });

            $(".opacityClose").click(function() {
                $(".opacitySlider").remove();
            });
            $('#slider').change(function(event) {
                //get the value of the slider with this call
                var o = ($('#slider')[0].value)/100;
                console.log("o: " + o);
                $("#opacityValue").html("Opacity: " + o)
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

