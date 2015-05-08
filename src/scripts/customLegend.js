/**
 * Created by bdraper on 5/8/2015.
 */
//get visible and non visible layer lists
function addMapServerLegend(layerName, layerDetails) {


    if (layerDetails.wimOptions.layerType === 'agisFeature') {

        //for feature layer since default icon is used, put that in legend
        var legendItem = $('<div align="left" id="' + camelize(layerName) + '"><img alt="Legend Swatch" src="https://raw.githubusercontent.com/Leaflet/Leaflet/master/dist/images/marker-icon.png" /><strong>&nbsp;&nbsp;' + layerName + '</strong></br></div>');
        $('#legendDiv').append(legendItem);

    }

    else if (layerDetails.wimOptions.layerType === 'agisWMS') {

        //for WMS layers, for now just add layer title
        var legendItem = $('<div align="left" id="' + camelize(layerName) + '"><img alt="Legend Swatch" src="http://placehold.it/25x41" /><strong>&nbsp;&nbsp;' + layerName + '</strong></br></div>');
        $('#legendDiv').append(legendItem);

    }

    else if (layerDetails.wimOptions.layerType === 'agisDynamic') {

        //create new legend div
        var legendItemDiv = $('<div align="left" id="' + camelize(layerName) + '"><strong>&nbsp;&nbsp;' + layerName + '</strong></br></div>');
        $('#legendDiv').append(legendItemDiv);

        //get legend REST endpoint for swatch
        $.getJSON(layerDetails.url + '/legend?f=json', function (legendResponse) {

            console.log(layerName,'legendResponse',legendResponse);



            //make list of layers for legend
            if (layerDetails.options.layers) {
                //console.log(layerName, 'has visisble layers property')
                //if there is a layers option included, use that
                var visibleLayers = layerDetails.options.layers;
            }
            else {
                //console.log(layerName, 'no visible layers property',  legendResponse)

                //create visibleLayers array with everything
                var visibleLayers = [];
                $.grep(legendResponse.layers, function(i,v) {
                    visibleLayers.push(v);
                });
            }

            //loop over all map service layers
            $.each(legendResponse.layers, function (i, legendLayer) {

                //var legendHeader = $('<strong>&nbsp;&nbsp;' + legendLayer.layerName + '</strong>');
                //$('#' + camelize(layerName)).append(legendHeader);

                //sub-loop over visible layers property
                $.each(visibleLayers, function (i, visibleLayer) {

                    //console.log(layerName, 'visibleLayer',  visibleLayer);

                    if (visibleLayer == legendLayer.layerId) {

                        console.log(layerName, visibleLayer,legendLayer.layerId, legendLayer)

                        //console.log($('#' + camelize(layerName)).find('<strong>&nbsp;&nbsp;' + legendLayer.layerName + '</strong></br>'))

                        var legendHeader = $('<strong>&nbsp;&nbsp;' + legendLayer.layerName + '</strong></br>');
                        $('#' + camelize(layerName)).append(legendHeader);

                        //get legend object
                        var feature = legendLayer.legend;
                        /*
                         //build legend html for categorized feautres
                         if (feature.length > 1) {
                         */

                        //placeholder icon
                        //<img alt="Legend Swatch" src="http://placehold.it/25x41" />

                        $.each(feature, function () {

                            //make sure there is a legend swatch
                            if (this.imageData) {
                                var legendFeature = $('<img alt="Legend Swatch" src="data:image/png;base64,' + this.imageData + '" /><small>' + this.label.replace('<', '').replace('>', '') + '</small></br>');

                                $('#' + camelize(layerName)).append(legendFeature);
                            }
                        });
                        /*
                         }
                         //single features
                         else {
                         var legendFeature = $('<img alt="Legend Swatch" src="data:image/png;base64,' + feature[0].imageData + '" /><small>&nbsp;&nbsp;' + legendLayer.layerName + '</small></br>');

                         //$('#legendDiv').append(legendItem);
                         $('#' + camelize(layerName)).append(legendFeature);

                         }
                         */
                    }
                }); //each visible layer
            }); //each legend item
        }); //get legend json
    }
}
/* parse layers.js */