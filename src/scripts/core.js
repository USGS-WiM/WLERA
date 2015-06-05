//for jshint
'use strict';
// Generated on 2015-04-13 using generator-wim 0.0.1

/**
 * Created by bdraper on 4/3/2015.
 */

var map;
var maxLegendHeight;
var maxLegendDivHeight;

require([
    'esri/map',
    "esri/SnappingManager",
    "esri/dijit/HomeButton",
    "esri/dijit/LocateButton",
    "esri/dijit/Measurement",
    'application/bootstrapmap',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/dijit/Geocoder',
    'esri/dijit/PopupTemplate',
    'esri/graphic',
    'esri/geometry/Multipoint',
    'esri/symbols/PictureMarkerSymbol',
    "esri/geometry/webMercatorUtils",
    "esri/config",
    "dojo/keys",
    "dojo/has",
    'dojo/dom',
    'dojo/on',
    'dojo/domReady!'
], function (
    Map,
    SnappingManager,
    HomeButton,
    LocateButton,
    Measurement,
    BootstrapMap,
    ArcGISTiledMapServiceLayer,
    Geocoder,
    PopupTemplate,
    Graphic,
    Multipoint,
    PictureMarkerSymbol,
    webMercatorUtils,
    esriConfig,
    keys,
    has,
    dom,
    on
) {

    map = Map('mapDiv', {
        basemap: 'gray',
        center: [-82.745, 41.699],
        spatialReference: 26917,
        zoom: 10
    });
    const home = new HomeButton({
        map: map
    }, "homeButton");
    home.startup();

    const geoLocate = new LocateButton({
        map: map
    }, "locateButton");
    geoLocate.startup();

    var measurement = new Measurement({
        map: map
    }, dom.byId("measurementDiv"));
    measurement.startup();

    var utmCoords = $('<tr class="esriMeasurementTableRow" id="utmCoords"><td><span>UTM17</span></td><td class="esriMeasurementTableCell"> <span id="utmX" dir="ltr">UTM X</span></td> <td class="esriMeasurementTableCell"> <span id="utmY" dir="ltr">UTM Y</span></td></tr>');
    $('.esriMeasurementResultTable').append(utmCoords);

    esri.config.defaults.io.corsEnabledServers.push("http://52.0.108.106:6080/");

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

    //displays map scale on map load
    on(map, "load", function() {
        var scale =  map.getScale().toFixed(0);
        $('#scale')[0].innerHTML = addCommas(scale);
        var initMapCenter = webMercatorUtils.webMercatorToGeographic(map.extent.getCenter());
        $('#latitude').html(initMapCenter.y.toFixed(4));
        $('#longitude').html(initMapCenter.x.toFixed(4));
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
    // Show modal dialog; handle legend sizing (both on doc ready)
    $(document).ready(function(){
        function showModal() {
            $('#geosearchModal').modal('show');
        }
        // Geosearch nav menu is selected
        $('#geosearchNav').click(function(){
            showModal();
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

        //create global layers lookup
        var mapLayers = [];

        const mapServiceRoot= "http://wlera.wimcloud.usgs.gov:6080/arcgis/rest/services/WLERA/";

        const geomService = new GeometryService("http://wlera.wimcloud.usgs.gov:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");


        const normRestorationIndexLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "normalized", visible:true} );
        normRestorationIndexLayer.setVisibleLayers([0]);
        mapLayers.push(normRestorationIndexLayer);
        legendLayers.push ({layer:normRestorationIndexLayer, title:" "});
        normRestorationIndexLayer.inLegendLayers = true;

        const dikedAreasLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "dikedAreas", visible:false} );
        dikedAreasLayer.setVisibleLayers([4]);
        mapLayers.push(dikedAreasLayer);
        dikedAreasLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikedAreasLayer, title: "Diked Areas"});

        //begin reference layers////////////////////////////////////
        const studyAreaLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "reference/MapServer", {id: "studyArea", visible:true} );
        studyAreaLayer.setVisibleLayers([0]);
        mapLayers.push(studyAreaLayer);
        legendLayers.push({layer:studyAreaLayer , title:" "});
        studyAreaLayer.inLegendLayers = true;

        //const parcelsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "reference/MapServer", {id: "parcels", visible:false, minScale:100000} );
        //parcelsLayer.setVisibleLayers([2]);
        const parcelsLayer = new FeatureLayer(mapServiceRoot + "reference/MapServer/1", {id: "parcels", visible:false, minScale:100000, mode: FeatureLayer.MODE_ONDEMAND, outfields: ["*"]});
        mapLayers.push(parcelsLayer);
        //legendLayers.push ({layer:parcelsLayer, title: "Parcels"});
        parcelsLayer.inLegendLayers = false;
        ////end reference layers////////////////////////////////////////

        const dikeBreaksLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "dikeBreaks", visible:false, minScale:100000} );
        dikeBreaksLayer.setVisibleLayers([0]);
        mapLayers.push(dikeBreaksLayer);
        dikeBreaksLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikeBreaksLayer, title: "Dike Breaks"});

        const culvertsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "culverts", visible:false, minScale:100000} );
        culvertsLayer.setVisibleLayers([1]);
        mapLayers.push(culvertsLayer);
        culvertsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:culvertsLayer, title: "Culverts"});

        const degFlowlinesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "degFlowlines", visible:false, minScale:100000} );
        degFlowlinesLayer.setVisibleLayers([2]);
        mapLayers.push(degFlowlinesLayer);
        degFlowlinesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:degFlowlinesLayer, title: "Degree flowlines"});

        const dikesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "hydroCondition/MapServer", {id: "dikes", visible:false, minScale:100000} );
        dikesLayer.setVisibleLayers([3]);
        mapLayers.push(dikesLayer);
        dikesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:dikesLayer, title: "Dikes"});



        ///parameters group
        const waterMaskLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "waterMask", visible:false} );
        waterMaskLayer.setVisibleLayers([2]);
        mapLayers.push(waterMaskLayer);
        waterMaskLayer.inLegendLayers = false;
        //legendLayers.push ({layer:waterMaskLayer, title: "P0 - Water Mask"});

        const hydroperiodLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "hydroperiod", visible:false} );
        hydroperiodLayer.setVisibleLayers([3]);
        mapLayers.push(hydroperiodLayer);
        hydroperiodLayer.inLegendLayers = false;
        //legendLayers.push ({layer:hydroperiodLayer, title: "P1 - Hydroperiod"});

        const wetsoilsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "wetsoils", visible:false} );
        wetsoilsLayer.setVisibleLayers([4]);
        mapLayers.push(wetsoilsLayer);
        wetsoilsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:wetsoilsLayer, title: "P2 - Wetsoils"});

        const flowlineLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "flowline", visible:false} );
        flowlineLayer.setVisibleLayers([5]);
        mapLayers.push(flowlineLayer);
        flowlineLayer.inLegendLayers = false;
        //legendLayers.push ({layer:flowlineLayer, title: "P3 - Flowline"});

        const conservedLandsLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "conservedLands", visible:false} );
        conservedLandsLayer.setVisibleLayers([6]);
        mapLayers.push(conservedLandsLayer);
        conservedLandsLayer.inLegendLayers = false;
        //legendLayers.push ({layer:conservedLandsLayer, title: "P4 - Conserved Lands"});

        const imperviousSurfacesLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "imperviousSurfaces", visible:false} );
        imperviousSurfacesLayer.setVisibleLayers([7]);
        mapLayers.push(imperviousSurfacesLayer);
        imperviousSurfacesLayer.inLegendLayers = false;
        //legendLayers.push ({layer:imperviousSurfacesLayer, title: "P5 - Impervious Surfaces"});

        const landuseLayer =  new ArcGISDynamicMapServiceLayer(mapServiceRoot + "restorationModel/MapServer", {id: "landuse", visible:false} );
        landuseLayer .setVisibleLayers([8]);
        mapLayers.push(landuseLayer );
        landuseLayer.inLegendLayers = false;
        //legendLayers.push ({layer:landuseLayer , title: "P6 - Landuse"});
        /////end parameters group
        //


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
            var zoomDialog = $('<div class="zoomDialog"><label class="zoomClose pull-right">X</label><br><div class="list-group"><a href="#" id="zoomscale" class="list-group-item zoomscale">Zoom to scale</a> <a id="zoomcenter" href="#" class="list-group-item zoomcenter">Zoom to center</a><a id="zoomextent" href="#" class="list-group-item zoomcenter">Zoom to extent</a></div></div>');

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

