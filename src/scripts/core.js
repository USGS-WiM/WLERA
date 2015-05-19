//for jshint
'use strict';
// Generated on 2015-04-13 using generator-wim 0.0.1

/**
 * Created by bdraper on 4/3/2015.
 */

var map;
var allLayers;
var maxLegendHeight;
var maxLegendDivHeight;

require([
    'esri/map',
    "esri/dijit/HomeButton",
    'application/bootstrapmap',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/dijit/Geocoder',
    'esri/dijit/PopupTemplate',
    'esri/graphic',
    'esri/geometry/Multipoint',
    'esri/symbols/PictureMarkerSymbol',
    "esri/geometry/webMercatorUtils",
    'dojo/dom',
    'dojo/on',
    'dojo/domReady!'
], function (
    Map,
    HomeButton,
    BootstrapMap,
    ArcGISTiledMapServiceLayer,
    Geocoder,
    PopupTemplate,
    Graphic,
    Multipoint,
    PictureMarkerSymbol,
    webMercatorUtils,
    dom,
    on
) {

    //bring this line back after experiment////////////////////////////
    //allLayers = mapLayers;

    map = Map('mapDiv', {
        basemap: 'gray',
        center: [-82.745, 41.699],
        zoom: 10
    });
    var home = new HomeButton({
        map: map
    }, "homeButton");
    home.startup();

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
        $('#latitude').html(initMapCenter.y.toFixed(3));
        $('#longitude').html(initMapCenter.x.toFixed(3));
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
            $('#latitude').html(geographicMapPt.y.toFixed(3));
            $('#longitude').html(geographicMapPt.x.toFixed(3));
        }
    });
    //updates lat/lng indicator to map center after pan and shows "map center" label.
    on(map, "pan-end", function () {
        //displays latitude and longitude of map center
        $('#mapCenterLabel').css("display", "inline");
        var geographicMapCenter = webMercatorUtils.webMercatorToGeographic(map.extent.getCenter());
        $('#latitude').html(geographicMapCenter.y.toFixed(3));
        $('#longitude').html(geographicMapCenter.x.toFixed(3));
    });

    var nationalMapBasemap = new ArcGISTiledMapServiceLayer('http://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer');
    //on clicks to swap basemap. map.removeLayer is required for nat'l map b/c it is not technically a basemap, but a tiled layer.
    on(dom.byId('btnStreets'), 'click', function () {
        map.setBasemap('streets');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnSatellite'), 'click', function () {
        map.setBasemap('satellite');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnHybrid'), 'click', function () {
        map.setBasemap('hybrid');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnTerrain'), 'click', function () {
        map.setBasemap('terrain');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnGray'), 'click', function () {
        map.setBasemap('gray');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnNatGeo'), 'click', function () {
        map.setBasemap('national-geographic');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnOSM'), 'click', function () {
        map.setBasemap('osm');
        map.removeLayer(nationalMapBasemap);
    });
    on(dom.byId('btnTopo'), 'click', function () {
        map.setBasemap('topo');
        map.removeLayer(nationalMapBasemap);
    });

    on(dom.byId('btnNatlMap'), 'click', function () {
        map.addLayer(nationalMapBasemap);
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
    var sym = createPictureSymbol('../images/purple-pin.png', 0, 12, 13, 24);

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
        $('#geosearchModal').modal('hide');
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
           maxLegendHeight =  ($('#mapDiv').height()) * 0.90;
           $('#legendElement').css('max-height', maxLegendHeight);
           maxLegendDivHeight = ($('#legendElement').height()) - parseInt($('#legendHeading').css("height").replace('px',''));
           $('#legendDiv').css('max-height', maxLegendDivHeight);
        });
        
        $('#legendCollapse').on('hide.bs.collapse', function () {
           $('#legendElement').css('height', 'initial');
        });

    });

    require([
        'esri/dijit/Legend',
        'esri/tasks/locator',
        'esri/tasks/query',
        'esri/tasks/QueryTask',
        'esri/graphicsUtils',
        'esri/geometry/Point',
        'esri/geometry/Extent',
        'esri/layers/ArcGISDynamicMapServiceLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/WMSLayer',
        'esri/layers/WebTiledLayer',
        'esri/layers/WMSLayerInfo',
        'dijit/form/CheckBox',
        'dijit/form/RadioButton',
        'dojo/query',
        'dojo/dom',
        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/on'
    ], function(
        Legend,
        Locator,
        Query,
        QueryTask,
        graphicsUtils,
        Point,
        Extent,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        WMSLayer,
        WebTiledLayer,
        WMSLayerInfo,
        CheckBox,
        RadioButton,
        query,
        dom,
        domClass,
        domConstruct,
        domStyle,
        on
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
        //begin reference layers////////////////////////////////////
        const hexRefLayer = new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "hexRef", visible:false} );
        hexRefLayer.setVisibleLayers([0]);
        mapLayers.push(hexRefLayer);
        legendLayers.push({layer:hexRefLayer, title: "Hex Reference"});

        //const hexRefLayer = new WebTiledLayer("http://wimcloud.usgs.gov.s3-website-us-east-1.amazonaws.com/tiles/WLERA/HexRef/${level}/${row}/${col}.png", {
        //    "id": "hexRef",
        //    "copyright": "WiM 2015"
        //});
        //mapLayers.push(hexRefLayer);

        //const studyAreaLayer = new WebTiledLayer("http://wimcloud.usgs.gov.s3-website-us-east-1.amazonaws.com/tiles/WLERA/StudyArea/${level}/${row}/${col}.png", {
        //    "id": "studyArea",
        //    "copyright": "WiM 2015"
        //});
        //mapLayers.push(studyAreaLayer);

        const studyAreaLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "studyArea", visible:false} );
        studyAreaLayer.setVisibleLayers([1]);
        mapLayers.push(studyAreaLayer);
        legendLayers.push({layer:studyAreaLayer, title: "Study Area"});

        const parcelsLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "parcels", visible:false} );
        parcelsLayer.setVisibleLayers([2]);
        mapLayers.push(parcelsLayer);
        legendLayers.push ({layer:parcelsLayer, title: "Parcels"});
        ////end reference layers////////////////////////////////////////

        const dikeBreaksLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "dikeBreaks", visible:false} );
        dikeBreaksLayer.setVisibleLayers([4]);
        mapLayers.push(dikeBreaksLayer);
        legendLayers.push ({layer:dikeBreaksLayer, title: "Dike Breaks"});

        const culvertsLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "culverts", visible:false} );
        culvertsLayer.setVisibleLayers([5]);
        mapLayers.push(culvertsLayer);
        legendLayers.push ({layer:culvertsLayer, title: "Culverts"});

        const degFlowlinesLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "degFlowlines", visible:false} );
        degFlowlinesLayer.setVisibleLayers([6]);
        mapLayers.push(degFlowlinesLayer);
        legendLayers.push ({layer:degFlowlinesLayer, title: "Degree flowlines"});

        const dikesLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "dikes", visible:false} );
        dikesLayer.setVisibleLayers([8]);
        mapLayers.push(dikesLayer);
        legendLayers.push ({layer:dikesLayer, title: "Dikes"});

        const dikedAreasLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "dikedAreas", visible:false} );
        dikedAreasLayer.setVisibleLayers([9]);
        mapLayers.push(dikedAreasLayer);
        legendLayers.push ({layer:dikedAreasLayer, title: "Diked Areas"});

        //const waterMaskLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "waterMask", visible:false} );
        //waterMaskLayer.setVisibleLayers([12]);
        //mapLayers.push(waterMaskLayer);
        //legendLayers.push ({layer:waterMaskLayer, title: "P0 - Water Mask"});
        //
        //const hydroperiodLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "hydroperiod", visible:false} );
        //hydroperiodLayer.setVisibleLayers([13]);
        //mapLayers.push(hydroperiodLayer);
        //legendLayers.push ({layer:hydroperiodLayer, title: "P1 - Hydroperiod"});
        //
        //const wetsoilsLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "wetsoils", visible:false} );
        //wetsoilsLayer.setVisibleLayers([14]);
        //mapLayers.push(wetsoilsLayer);
        //legendLayers.push ({layer:wetsoilsLayer, title: "P2 - Wetsoils"});
        //
        //const flowlineLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "flowline", visible:false} );
        //flowlineLayer.setVisibleLayers([15]);
        //mapLayers.push(flowlineLayer);
        //legendLayers.push ({layer:flowlineLayer, title: "P3 - Flowline"});
        //
        //const conservedLandsLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "conservedLands", visible:false} );
        //conservedLandsLayer.setVisibleLayers([16]);
        //mapLayers.push(conservedLandsLayer);
        //legendLayers.push ({layer:conservedLandsLayer, title: "P4 - Conserved Lands"});
        //
        //const imperviousSurfacesLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "imperviousSurfaces", visible:false} );
        //imperviousSurfacesLayer.setVisibleLayers([17]);
        //mapLayers.push(imperviousSurfacesLayer);
        //legendLayers.push ({layer:imperviousSurfacesLayer, title: "P5 - Impervious Surfaces"});
        //
        //const landuseLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "landuse", visible:false} );
        //landuseLayer .setVisibleLayers([18]);
        //mapLayers.push(landuseLayer );
        //legendLayers.push ({layer:landuseLayer , title: "P6 - Landuse"});

        const normRestorationIndexLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "normRestorationIndex", visible:false} );
        normRestorationIndexLayer.setVisibleLayers([19]);
        mapLayers.push(normRestorationIndexLayer);
        legendLayers.push ({layer:normRestorationIndexLayer, title: "Normalized Restoration Index"});

        //const highRestoreLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "highRestore", visible:false} );
        //highRestoreLayer.setVisibleLayers([21]);
        //mapLayers.push(highRestoreLayer);
        //legendLayers.push ({layer:highRestoreLayer, title: "High restorable"});
        //
        //const mediumRestoreLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "mediumRestore", visible:false} );
        //mediumRestoreLayer.setVisibleLayers([22]);
        //mapLayers.push(mediumRestoreLayer);
        //legendLayers.push ({layer:mediumRestoreLayer, title: "Medium restorable"});
        //
        //const lowRestoreLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "lowRestore", visible:false} );
        //lowRestoreLayer.setVisibleLayers([23]);
        //mapLayers.push(lowRestoreLayer);
        //legendLayers.push ({layer:lowRestoreLayer, title: "Low restorable"});
        //
        //const noRestoreLayer =  new ArcGISDynamicMapServiceLayer("http://wim.usgs.gov/arcgis/rest/services/WLEWetlands/WLERA/MapServer", {id: "noRestore", visible:false} );
        //noRestoreLayer.setVisibleLayers([24]);
        //mapLayers.push(noRestoreLayer);
        //legendLayers.push ({layer:noRestoreLayer, title: "Not restorable"});


        map.addLayers(mapLayers);

        $("button.lyrTog").click(function(e) {
            //toggle checkmark
            $(this).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            $(this).button('toggle');

            e.preventDefault();
            e.stopPropagation();

            //$('#' + camelize(layerName)).toggle();
            //
            ////layer toggle
            //if (layer.visible) {
            //    layer.setVisibility(false);
            //} else {
            //    layer.setVisibility(true);
            //}
        });

        $('#hydroConditionGroup, #parametersGroup, #4scaleGroup').on('hide.bs.collapse', function () {
            var groupToggleID = $(this)[0].id.replace('Group', '');
            $(("#"+ groupToggleID)).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            $(("#"+ groupToggleID)).find('i.chevron').toggleClass('fa-chevron-right fa-chevron-down');
        });
        $('#hydroConditionGroup, #parametersGroup, #4scaleGroup').on('show.bs.collapse', function () {
            var groupToggleID = $(this)[0].id.replace('Group', '');
            $(("#"+ groupToggleID)).find('i.checkBoxIcon').toggleClass('fa-check-square-o fa-square-o');
            $(("#"+ groupToggleID)).find('i.chevron').toggleClass('fa-chevron-right fa-chevron-down');
        });

        //$.each(allLayers, function (index,group) {
        //    console.log('processing: ', group.groupHeading)
        //
        //
        //    //sub-loop over layers within this groupType
        //    $.each(group.layers, function (layerName,layerDetails) {
        //
        //
        //
        //        //check for exclusiveGroup for this layer
        //        var exclusiveGroupName = '';
        //        if (layerDetails.wimOptions.exclusiveGroupName) {
        //            exclusiveGroupName = layerDetails.wimOptions.exclusiveGroupName;
        //        }
        //
        //        if (layerDetails.wimOptions.layerType === 'agisFeature') {
        //            var layer = new FeatureLayer(layerDetails.url, layerDetails.options);
        //            //check if include in legend is true
        //            if (layerDetails.wimOptions && layerDetails.wimOptions.includeLegend == true){
        //                legendLayers.push({layer:layer, title: layerName});
        //            }
        //            addLayer(group.groupHeading, group.showGroupHeading, layer, layerName, exclusiveGroupName, layerDetails.options, layerDetails.wimOptions);
        //            //addMapServerLegend(layerName, layerDetails);
        //        }
        //
        //        else if (layerDetails.wimOptions.layerType === 'agisWMS') {
        //            var layer = new WMSLayer(layerDetails.url, {resourceInfo: layerDetails.options.resourceInfo, visibleLayers: layerDetails.options.visibleLayers }, layerDetails.options);
        //            //check if include in legend is true
        //            if (layerDetails.wimOptions && layerDetails.wimOptions.includeLegend == true){
        //                legendLayers.push({layer:layer, title: layerName});
        //            }
        //            //map.addLayer(layer);
        //            addLayer(group.groupHeading, group.showGroupHeading, layer, layerName, exclusiveGroupName, layerDetails.options, layerDetails.wimOptions);
        //            //addMapServerLegend(layerName, layerDetails);
        //        }
        //
        //        else if (layerDetails.wimOptions.layerType === 'agisDynamic') {
        //            var layer = new ArcGISDynamicMapServiceLayer(layerDetails.url, layerDetails.options);
        //            //check if include in legend is true
        //            if (layerDetails.wimOptions && layerDetails.wimOptions.includeLegend == true){
        //                legendLayers.push({layer:layer, title: layerName});
        //            }
        //            if (layerDetails.visibleLayers) {
        //                layer.setVisibleLayers(layerDetails.visibleLayers);
        //            }
        //            //map.addLayer(layer);
        //            addLayer(group.groupHeading, group.showGroupHeading, layer, layerName, exclusiveGroupName, layerDetails.options, layerDetails.wimOptions);
        //            //addMapServerLegend(layerName, layerDetails);
        //        }
        //    });
        //});
        //
        //function addLayer(groupHeading, showGroupHeading, layer, layerName, exclusiveGroupName, options, wimOptions) {
        //
        //    //add layer to map
        //    //layer.addTo(map);
        //    map.addLayer(layer);
        //
        //    //add layer to layer list
        //    mapLayers.push([exclusiveGroupName,camelize(layerName),layer]);
        //
        //    //check if its an exclusiveGroup item
        //    if (exclusiveGroupName) {
        //
        //        if (!$('#' + camelize(exclusiveGroupName)).length) {
        //            var exGroupRoot = $('<div id="' + camelize(exclusiveGroupName +" Root") + '" class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <button type="button" class="btn btn-default active" aria-pressed="true" style="font-weight: bold;text-align: left"><i class="glyphspan fa fa-check-square-o"></i>&nbsp;&nbsp;' + exclusiveGroupName + '</button> </div>');
        //
        //            exGroupRoot.click(function(e) {
        //                exGroupRoot.find('i.glyphspan').toggleClass('fa-check-square-o fa-square-o');
        //
        //                $.each(mapLayers, function (index, currentLayer) {
        //
        //                    var tempLayer = map.getLayer(currentLayer[2].id);
        //
        //                    if (currentLayer[0] == exclusiveGroupName) {
        //                        if ($("#" + currentLayer[1]).find('i.glyphspan').hasClass('fa-dot-circle-o') && exGroupRoot.find('i.glyphspan').hasClass('fa-check-square-o')) {
        //                            console.log('adding layer: ',currentLayer[1]);
        //                            map.addLayer(currentLayer[2]);
        //                            var tempLayer = map.getLayer(currentLayer[2].id);
        //                            tempLayer.setVisibility(true);
        //                        } else if (exGroupRoot.find('i.glyphspan').hasClass('fa-square-o')) {
        //                            console.log('removing layer: ',currentLayer[1]);
        //                            map.removeLayer(currentLayer[2]);
        //                        }
        //                    }
        //
        //                });
        //            });
        //
        //            var exGroupDiv = $('<div id="' + camelize(exclusiveGroupName) + '" class="btn-group-vertical" data-toggle="buttons"></div');
        //            $('#toggle').append(exGroupDiv);
        //        }
        //
        //        //create radio button
        //        //var button = $('<input type="radio" name="' + camelize(exclusiveGroupName) + '" value="' + camelize(layerName) + '"checked>' + layerName + '</input></br>');
        //        if (layer.visible) {
        //            var button = $('<div id="' + camelize(layerName) + '" class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <label class="btn btn-default"  style="font-weight: bold;text-align: left"> <input type="radio" name="' + camelize(exclusiveGroupName) + '" autocomplete="off"><i class="glyphspan fa fa-dot-circle-o ' + camelize(exclusiveGroupName) + '"></i>&nbsp;&nbsp;' + layerName + '</label> </div>');
        //        } else {
        //            var button = $('<div id="' + camelize(layerName) + '" class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <label class="btn btn-default"  style="font-weight: bold;text-align: left"> <input type="radio" name="' + camelize(exclusiveGroupName) + '" autocomplete="off"><i class="glyphspan fa fa-circle-o ' + camelize(exclusiveGroupName) + '"></i>&nbsp;&nbsp;' + layerName + '</label> </div>');
        //        }
        //
        //        $('#' + camelize(exclusiveGroupName)).append(button);
        //
        //        //click listener for radio button
        //        button.click(function(e) {
        //
        //            if ($(this).find('i.glyphspan').hasClass('fa-circle-o')) {
        //                $(this).find('i.glyphspan').toggleClass('fa-dot-circle-o fa-circle-o');
        //
        //                var newLayer = $(this)[0].id;
        //
        //                $.each(mapLayers, function (index, currentLayer) {
        //
        //                    if (currentLayer[0] == exclusiveGroupName) {
        //                        if (currentLayer[1] == newLayer && $("#" + camelize(exclusiveGroupName + " Root")).find('i.glyphspan').hasClass('fa-check-square-o')) {
        //                            console.log('adding layer: ',currentLayer[1]);
        //                            map.addLayer(currentLayer[2]);
        //                            var tempLayer = map.getLayer(currentLayer[2].id);
        //                            tempLayer.setVisibility(true);
        //                            //$('#' + camelize(currentLayer[1])).toggle();
        //                        }
        //                        else if (currentLayer[1] == newLayer && $("#" + camelize(exclusiveGroupName + " Root")).find('i.glyphspan').hasClass('fa-square-o')) {
        //                            console.log('groud heading not checked');
        //                        }
        //                        else {
        //                            console.log('removing layer: ',currentLayer[1]);
        //                            map.removeLayer(currentLayer[2]);
        //                            if ($("#" + currentLayer[1]).find('i.glyphspan').hasClass('fa-dot-circle-o')) {
        //                                $("#" + currentLayer[1]).find('i.glyphspan').toggleClass('fa-dot-circle-o fa-circle-o');
        //                            }
        //                            //$('#' + camelize(this[1])).toggle();
        //                        }
        //                    }
        //                });
        //            }
        //        });
        //    }
        //
        //    //not an exclusive group item
        //    else {
        //
        //        //create layer toggle
        //        //var button = $('<div align="left" style="cursor: pointer;padding:5px;"><span class="glyphspan glyphicon glyphicon-check"></span>&nbsp;&nbsp;' + layerName + '</div>');
        //        if (layer.visible && wimOptions.hasOpacitySlider !== undefined && wimOptions.hasOpacitySlider == true) {
        //            var button = $('<div class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <button type="button" class="btn btn-default active" aria-pressed="true" style="font-weight: bold;text-align: left"><i class="glyphspan fa fa-check-square-o"></i>&nbsp;&nbsp;' + layerName + '<span id="opacity' + camelize(layerName) + '" class="glyphspan glyphicon glyphicon-adjust pull-right"></button></span></div>');
        //        } else if ((!layer.visible && wimOptions.hasOpacitySlider !== undefined && wimOptions.hasOpacitySlider == true)) {
        //            var button = $('<div class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <button type="button" class="btn btn-default" aria-pressed="true" style="font-weight: bold;text-align: left"><i class="glyphspan fa fa-square-o"></i>&nbsp;&nbsp;' + layerName + '<span id="opacity' + camelize(layerName) + '" class="glyphspan glyphicon glyphicon-adjust pull-right"></button></span></div>');
        //        } else if (layer.visible) {
        //            var button = $('<div class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <button type="button" class="btn btn-default active" aria-pressed="true" style="font-weight: bold;text-align: left"><i class="glyphspan fa fa-check-square-o"></i>&nbsp;&nbsp;' + layerName + '</button></span></div>');
        //        } else {
        //            var button = $('<div class="btn-group-vertical lyrTog" style="cursor: pointer;" data-toggle="buttons"> <button type="button" class="btn btn-default" aria-pressed="true" style="font-weight: bold;text-align: left"><i class="glyphspan fa fa-square-o"></i>&nbsp;&nbsp;' + layerName + '</button> </div>');
        //        }
        //
        //        //click listener for regular
        //        button.click(function(e) {
        //
        //            //toggle checkmark
        //            $(this).find('i.glyphspan').toggleClass('fa-check-square-o fa-square-o');
        //            $(this).find('button').button('toggle');
        //
        //            e.preventDefault();
        //            e.stopPropagation();
        //
        //            $('#' + camelize(layerName)).toggle();
        //
        //            //layer toggle
        //            if (layer.visible) {
        //                layer.setVisibility(false);
        //            } else {
        //                layer.setVisibility(true);
        //            }
        //
        //        });
        //    }
        //
        //    //group heading logic
        //    if (showGroupHeading) {
        //
        //        //camelize it for divID
        //        var groupDivID = camelize(groupHeading);
        //
        //        //check to see if this group already exists
        //        if (!$('#' + groupDivID).length) {
        //            //if it doesn't add the header
        //            var groupDiv = $('<div id="' + groupDivID + '"><div class="alert alert-info" role="alert"><strong>' + groupHeading + '</strong></div></div>');
        //            $('#toggle').append(groupDiv);
        //        }
        //
        //        //if it does already exist, append to it
        //
        //        if (exclusiveGroupName) {
        //            //if (!exGroupRoot.length)$("#slider"+camelize(layerName))
        //            $('#' + groupDivID).append(exGroupRoot);
        //            $('#' + groupDivID).append(exGroupDiv);
        //        } else {
        //            $('#' + groupDivID).append(button);
        //            if ($("#opacity"+camelize(layerName)).length > 0) {
        //                $("#opacity"+camelize(layerName)).hover(function () {
        //                    $(".opacitySlider").remove();
        //                    var currOpacity = map.getLayer(options.id).opacity;
        //                    var slider = $('<div class="opacitySlider"><label id="opacityValue">Opacity: ' + currOpacity + '</label><label class="opacityClose pull-right">X</label><input id="slider" type="range"></div>');
        //                    $("body").append(slider);[0]
        //
        //                    $("#slider")[0].value = currOpacity*100;
        //                    $(".opacitySlider").css('left', event.clientX-180);
        //                    $(".opacitySlider").css('top', event.clientY-5);
        //
        //                    $(".opacitySlider").mouseleave(function() {
        //                        $(".opacitySlider").remove();
        //                    });
        //
        //                    $(".opacityClose").click(function() {
        //                        $(".opacitySlider").remove();
        //                    });
        //                    $('#slider').change(function(event) {
        //                        //get the value of the slider with this call
        //                        var o = ($('#slider')[0].value)/100;
        //                        console.log("o: " + o);
        //                        $("#opacityValue").html("Opacity: " + o)
        //                        map.getLayer(options.id).setOpacity(o);
        //                        //here I am just specifying the element to change with a "made up" attribute (but don't worry, this is in the HTML specs and supported by all browsers).
        //                        //var e = '#' + $(this).attr('data-wjs-element');
        //                        //$(e).css('opacity', o)
        //                    });
        //                });
        //            }
        //        }
        //    }
        //
        //    else {
        //        //otherwise append
        //        $('#toggle').append(button);
        //    }
        //}



        var legend = new Legend({
            map: map,
            layerInfos: legendLayers
        }, "legendDiv");
        legend.startup();


    });//end of require statement containing legend building code


});

$(document).ready(function () {
    //7 lines below are handler for the legend buttons. to be removed if we stick with the in-map legend toggle
    //$('#legendButtonNavBar, #legendButtonSidebar').on('click', function () {
    //    $('#legend').toggle();
    //    //return false;
    //});
    //$('#legendClose').on('click', function () {
    //    $('#legend').hide();
    //});

});