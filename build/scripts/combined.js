function addCommas(e){e+="";for(var a=e.split("."),t=a[0],i=a.length>1?"."+a[1]:"",o=/(\d+)(\d{3})/;o.test(t);)t=t.replace(o,"$1,$2");return t+i}function camelize(e){return e.replace(/(?:^\w|[A-Z]|\b\w)/g,function(e,a){return 0==a?e.toLowerCase():e.toUpperCase()}).replace(/\s+/g,"")}!function(e){e.fn.confirmModal=function(a){function t(e,a){}var i=e("body"),o={confirmTitle:"Please confirm",confirmMessage:"Are you sure you want to perform this action ?",confirmOk:"Yes",confirmCancel:"Cancel",confirmDirection:"rtl",confirmStyle:"primary",confirmCallback:t,confirmDismiss:!0,confirmAutoOpen:!1},s=e.extend(o,a),r='<div class="modal fade" id="#modalId#" tabindex="-1" role="dialog" aria-labelledby="#AriaLabel#" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>#Heading#</h3></div><div class="modal-body"><p>#Body#</p></div><div class="modal-footer">#buttonTemplate#</div></div></div></div>';return this.each(function(a){var t=e(this),o=t.data(),n=(e.extend(s,o),"confirmModal"+Math.floor(1e9*Math.random())),l=r,c='<button class="btn btn-default" data-dismiss="modal">#Cancel#</button><button class="btn btn-#Style#" data-dismiss="ok">#Ok#</button>';"ltr"==s.confirmDirection&&(c='<button class="btn btn-#Style#" data-dismiss="ok">#Ok#</button><button class="btn btn-default" data-dismiss="modal">#Cancel#</button>');var d=s.confirmTitle;"function"==typeof s.confirmTitle&&(d=s.confirmTitle.call(this));var p=s.confirmMessage;"function"==typeof s.confirmMessage&&(p=s.confirmMessage.call(this)),l=l.replace("#buttonTemplate#",c).replace("#modalId#",n).replace("#AriaLabel#",d).replace("#Heading#",d).replace("#Body#",p).replace("#Ok#",s.confirmOk).replace("#Cancel#",s.confirmCancel).replace("#Style#",s.confirmStyle),i.append(l);var m=e("#"+n);t.on("click",function(e){e.preventDefault(),m.modal("show")}),e('button[data-dismiss="ok"]',m).on("click",function(e){s.confirmDismiss&&m.modal("hide"),s.confirmCallback(t,m)}),s.confirmAutoOpen&&m.modal("show")})}}(jQuery);var allLayers;require(["esri/geometry/Extent","esri/layers/WMSLayerInfo","esri/layers/FeatureLayer","dojo/domReady!"],function(e,a,t){allLayers=[]}),function(){"use strict"}();var wlera=wlera||{bookmarks:[{id:"ottawa-nwr",name:"Ottawa NWR",userCreated:!1,spatialReference:{wkid:102100},xmax:-9253627.864758775,xmin:-9268896.161158718,ymax:5109457.058192252,ymin:5099759.110228584}],globals:{}},map,zonalStatsGP,maxLegendHeight,maxLegendDivHeight,printCount=0,storageName="esrijsapi_mapmarks",mapLayers=[],mapLayerIds=[];require(["esri/map","esri/dijit/OverviewMap","esri/SnappingManager","esri/dijit/HomeButton","esri/dijit/LocateButton","esri/dijit/Measurement","esri/dijit/Bookmarks","esri/layers/ArcGISTiledMapServiceLayer","esri/dijit/Geocoder","esri/dijit/Search","esri/dijit/Popup","esri/dijit/PopupTemplate","esri/graphic","esri/geometry/Multipoint","esri/symbols/PictureMarkerSymbol","esri/geometry/webMercatorUtils","esri/tasks/GeometryService","esri/tasks/PrintTask","esri/tasks/PrintParameters","esri/tasks/PrintTemplate","esri/tasks/LegendLayer","esri/SpatialReference","esri/geometry/Extent","esri/config","esri/urlUtils","esri/request","dojo/_base/array","dojo/_base/lang","dojo/keys","dojo/cookie","dojo/has","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/on","dojo/domReady!"],function(e,a,t,i,o,s,r,n,l,c,d,p,m,u,g,h,y,b,v,f,L,k,w,S,x,C,M,E,D,T,I,A,R,O,P){function W(){if(U){var e=[];M.forEach(wlera.bookmarks,function(a){a.userCreated===!1&&e.push(a.id)});for(var a=wlera.bookmarks.slice(),t=0;t<a.length;t++){var i=a[t];-1!==e.indexOf(i.id)&&(a.splice(t,1),t--)}console.log(a);var o=JSON.stringify(a);window.localStorage.setItem(storageName,o)}else{var s=7;T(storageName,dojo.toJson(wlera.bookmarks),{expires:s})}}function F(){U?window.localStorage.removeItem(storageName):dojo.cookie(storageName,null,{expires:-1});var e=[];M.forEach(wlera.bookmarks,function(a){a.userCreated===!0&&e.push(a.id)});for(var a=0;a<wlera.bookmarks.length;a++){var t=wlera.bookmarks[a];-1!==e.indexOf(t.id)&&(wlera.bookmarks.splice(a,1),a--)}M.forEach(e,function(e){$("#"+e).remove()})}function z(){try{return"localStorage"in window&&null!==window.localStorage}catch(e){return!1}}function B(){$("#shareModal").modal("show");var e=map.extent,a="?xmax="+e.xmax.toString()+"&xmin="+e.xmin.toString()+"&ymax="+e.ymax.toString()+"&ymin="+e.ymin.toString(),t="%3Fxmax="+e.xmax.toString()+"%26xmin="+e.xmin.toString()+"%26ymax="+e.ymax.toString()+"%26ymin="+e.ymin.toString(),i="http://glcwra.wim.usgs.gov/WLERA/",o=i+a,s=i+t;console.log("Share URL is:"+o),$("#showFullLinkButton").click(function(){$("#fullShareURL").html('<span id="fullLinkLabel" class="label label-default"><span class="glyphicon glyphicon-link"></span> Full link</span><br><textarea style="margin-bottom: 10px; cursor: text" class="form-control"  rows="3" readonly>'+o+"</textarea>")}),$("#showShortLinkButton").click(function(){$.ajax({dataType:"json",type:"GET",url:"https://api-ssl.bitly.com/v3/shorten?access_token=e1a16076cc8470c65419920156e0ae2c4f77850f&longUrl="+s,headers:{Accept:"*/*"},success:function(e){var a=e.data.url;$("#bitlyURL").html('<span class="label label-default"><span class="glyphicon glyphicon-link"></span> Bitly link</span><code>'+a+"</code>")},error:function(e){$("#bitlyURL").html('<i class="fa fa-exclamation-triangle"></i> An error occurred retrieving shortened Bitly URL')}})})}function G(){$("#printModal").modal("show")}function j(){$("#bookmarkModal").modal("show")}function N(){function e(e){printCount++;var a=$("<p><label>"+printCount+': </label>&nbsp;&nbsp;<a href="'+e.url+'" target="_blank">'+l+" </a></p>");$("#printJobsDiv").find("p.toRemove").remove(),$("#printModalBody").append(a),$("#printTitle").val(""),$("#printExecuteButton").button("reset")}function a(e){alert("Sorry, an unclear print error occurred. Please try refreshing the application to fix the problem"),$("#printExecuteButton").button("reset")}var t=new v;t.map=map;var i=new f;i.exportOptions={width:500,height:400,dpi:300};var o=map.getZoom(),s="";o>=9&&(s="9"),o>=11&&(s="11"),o>=15&&(s="15"),i.showAttribution=!1,i.format="PDF",i.layout="Letter ANSI A LandscapeGLCWRA"+s,i.preserveScale=!1;var r=new L;r.layerId="normalized",r.subLayerIds=[0];var n=$("#printTitle").val();""===n?i.layoutOptions={titleText:"Western Lake Erie Restoration Assessment - Provisional Data",authorText:"Western Lake Erie Restoration Assessment (WLERA)",copyrightText:"This page was produced by the WLERA web application at glcwra.wim.usgs.gov/wlera",legendLayers:[r]}:i.layoutOptions={titleText:n+" - Provisional Data",authorText:"Western Lake Erie Restoration Assessment (WLERA)",copyrightText:"This page was produced by the WLERA web application at glcwra.wim.usgs.gov/wlera",legendLayers:[r]};var l=i.layoutOptions.titleText;t.template=i;var c=new b("http://gis.wim.usgs.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");c.execute(t,e,a)}function V(){var e=$("#bookmarkTitle"),a=map.extent.toJson(),t=e.val();if(t.length>0){var i=t.toLowerCase().replace(/ /g,"-");a.name=t,a.id=i,a.userCreated=!0,wlera.bookmarks.push(a);var o=i+"_delete",s=$('<tr id="'+i+'"><td  class="bookmarkTitle td-bm">'+t+'</td><td class="text-right text-nowrap"> <button id="'+o+'" class="btn btn-xs btn-warning bookmarkDelete" data-toggle="tooltip" data-placement="top" > <span class="glyphicon glyphicon-remove"></span> </button> </td> </tr>');$("#bookmarkList").append(s),$("#"+o).confirmation({placement:"left",title:"Delete this bookmark?",btnOkLabel:"Yes",btnCancelLabel:"Cancel",popout:!0,onConfirm:function(){$("#"+i).remove();for(var e=0;e<wlera.bookmarks.length;e++){var a=wlera.bookmarks[e];-1!==i.indexOf(a.id)&&wlera.bookmarks.splice(e,1)}W()}}),e.val(""),W(),$("#bmAlert").hide(),$("#bookmarkModal").modal("hide")}else $("#bmAlert").show()}function H(){var e=esri.urlToObject(document.location.href);if(e.query){var a=new w(parseFloat(e.query.xmin),parseFloat(e.query.ymin),parseFloat(e.query.xmax),parseFloat(e.query.ymax),new k({wkid:102100}));map.setExtent(a);var t=document.location.href,i=t.substring(0,t.indexOf("?"));history.pushState(null,"",i)}}var U=z(),_=new d({},O.create("div"));R.add(_.domNode),map=new e("mapDiv",{basemap:"gray",center:[-82.745,41.699],spatialReference:26917,zoom:10,logo:!1,minZoom:9,infoWindow:_}),S.defaults.geometryService=new y("http://gis.wim.usgs.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer"),esri.config.defaults.io.corsEnabledServers.push("http://gis.wim.usgs.gov/");const q=new i({map:map},"homeButton");q.startup();const Y=new o({map:map},"locateButton");Y.startup();const X=new s({map:map,advancedLocationUnits:!0},A.byId("measurementDiv"));X.startup();var Z;if(Z=U?window.localStorage.getItem(storageName):dojo.cookie(storageName),Z&&"null"!==Z&&Z.length>4){console.log("cookie: ",Z,Z.length);var J=dojo.fromJson(Z);M.forEach(J,function(e){wlera.bookmarks.push(e)})}else console.log("no stored bookmarks...");const K=new a({map:map,attachTo:"bottom-right"});K.startup();var Q=$('<tr class="esriMeasurementTableRow" id="utmCoords"><td><span>UTM17</span></td><td class="esriMeasurementTableCell"> <span id="utmX" dir="ltr">UTM X</span></td> <td class="esriMeasurementTableCell"> <span id="utmY" dir="ltr">UTM Y</span></td></tr>');$(".esriMeasurementResultTable").append(Q),$(window).resize(function(){$("#legendCollapse").hasClass("in")?(maxLegendHeight=.9*$("#mapDiv").height(),$("#legendElement").css("height",maxLegendHeight),$("#legendElement").css("max-height",maxLegendHeight),maxLegendDivHeight=$("#legendElement").height()-parseInt($("#legendHeading").css("height").replace("px","")),$("#legendDiv").css("max-height",maxLegendDivHeight)):$("#legendElement").css("height","initial")}),$("#shareNavButton").click(function(){B()}),$("#printNavButton").click(function(){G()}),$("#addBookmarkButton").click(function(){j()}),$("#printExecuteButton").click(function(){$(this).button("loading"),N()}),$("#print-title-form").on("keypress",function(e){13==e.keyCode&&($("#printExecuteButton").button("loading"),N())}),$("#bookmarkSaveButton").click(function(){V()}),$("#bookmark-title-form").on("keypress",function(e){13==e.keyCode&&V()}),$("#bookmarkDismissButton").click(function(){$("#bmAlert").hide()}),P(map,"load",function(){var e=map.getScale().toFixed(0);$("#scale")[0].innerHTML=addCommas(e);var a=h.webMercatorToGeographic(map.extent.getCenter());$("#latitude").html(a.y.toFixed(4)),$("#longitude").html(a.x.toFixed(4)),H()}),P(map,"zoom-end",function(){var e=map.getScale().toFixed(0);$("#scale")[0].innerHTML=addCommas(e)}),P(map,"mouse-move",function(e){if($("#mapCenterLabel").css("display","none"),null!==e.mapPoint){var a=h.webMercatorToGeographic(e.mapPoint);$("#latitude").html(a.y.toFixed(4)),$("#longitude").html(a.x.toFixed(4))}}),P(map,"pan-end",function(){$("#mapCenterLabel").css("display","inline");var e=h.webMercatorToGeographic(map.extent.getCenter());$("#latitude").html(e.y.toFixed(4)),$("#longitude").html(e.x.toFixed(4))});var ee=new n("http://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer",{visible:!1});map.addLayer(ee),P(A.byId("btnStreets"),"click",function(){map.setBasemap("streets"),ee.setVisibility(!1)}),P(A.byId("btnSatellite"),"click",function(){map.setBasemap("satellite"),ee.setVisibility(!1)}),P(A.byId("btnGray"),"click",function(){map.setBasemap("gray"),ee.setVisibility(!1)}),P(A.byId("btnOSM"),"click",function(){map.setBasemap("osm"),ee.setVisibility(!1)}),P(A.byId("btnTopo"),"click",function(){map.setBasemap("topo"),ee.setVisibility(!1)}),P(A.byId("btnNatlMap"),"click",function(){ee.setVisibility(!0)});var ae=new c({map:map},"geosearch");ae.startup(),P(ae,"search-results",function(e){$("#geosearchModal").modal("hide")}),$(document).ready(function(){function e(){$("#geosearchModal").modal("show")}function a(){$("#aboutModal").modal("show")}$("#geosearchNav").click(function(){e()}),$("#aboutNav").click(function(){a()}),$("#scaleAlertClose").click(function(){$("#parcelSelectScaleAlert").hide()}),$("#goToScale").click(function(){$("#parcelSelectScaleAlert").hide();var e=map.getLayer("parcelsFeat").minScale;map.setScale(e)}),$("#IEwarnContinue").click(function(){$("#disclaimerModal").modal({backdrop:"static"}),$("#disclaimerModal").modal("show")}),-1!==navigator.userAgent.indexOf("MSIE")||navigator.appVersion.indexOf("Trident/")>0?$("#IEwarningModal").modal("show"):($("#disclaimerModal").modal({backdrop:"static"}),$("#disclaimerModal").modal("show")),$(window).width()<767&&$("#legendCollapse").addClass("collapse"),$("#html").niceScroll();var t=$("#sidebar");t.niceScroll(),t.scroll(function(){$("#sidebar").getNiceScroll().resize()});var i=$("#legendCollapse"),o=$("#legendElement"),s=$("#legendDiv");$("#legendDiv").niceScroll({autohidemode:!1}),maxLegendHeight=.9*$("#mapDiv").height(),o.css("max-height",maxLegendHeight),i.css("max-height",maxLegendHeight),s.css("max-height",maxLegendHeight),i.on("shown.bs.collapse",function(){$("#legendLabel").show(),maxLegendHeight=.9*$("#mapDiv").height(),o.css("max-height",maxLegendHeight),i.css("max-height",maxLegendHeight),s.css("max-height",maxLegendHeight),o.css("height",maxLegendHeight),i.css("height",maxLegendHeight),maxLegendDivHeight=o.height()-parseInt($("#legendHeading").css("height").replace("px","")),s.css("height",maxLegendDivHeight)}),i.on("hide.bs.collapse",function(){o.css("height","initial"),window.innerWidth<=767&&$("#legendLabel").hide()});var r=$("#measurementCollapse");r.on("shown.bs.collapse",function(){$("#measureLabel").show()}),r.on("hide.bs.collapse",function(){window.innerWidth<=767&&$("#measureLabel").hide()}),$(function(){$("[data-hide]").on("click",function(){$("."+$(this).attr("data-hide")).hide()})}),wlera.bookmarks.forEach(function(e){if(e.userCreated===!1){var a=$('<tr id="'+e.id+'"><td class="bookmarkTitle td-bm">'+e.name+'</td><td class="text-right text-nowrap"></td> </tr>');$("#bookmarkList").append(a)}else{var t=e.id+"_delete",i=$('<tr id="'+e.id+'"><td  class="bookmarkTitle td-bm">'+e.name+'</td><td class="text-right text-nowrap"> <button id="'+t+'" class="btn btn-xs btn-warning bookmarkDelete" data-toggle="tooltip" data-placement="top" title="Delete bookmark"> <span class="glyphicon glyphicon-remove"></span> </button> </td> </tr>');$("#bookmarkList").append(i),$("#"+t).confirmation({placement:"left",title:"Delete this bookmark?",btnOkLabel:"Yes",btnCancelLabel:"Cancel",popout:!0,onConfirm:function(){$("#"+e.id).remove();for(var a=0;a<wlera.bookmarks.length;a++){var t=wlera.bookmarks[a];-1!==e.id.indexOf(t.id)&&wlera.bookmarks.splice(a,1)}W()}})}}),$("body").on("click",".td-bm",function(){var e=this.parentNode.id;wlera.bookmarks.forEach(function(a){if(a.id==e){var t=new w(a.xmin,a.ymin,a.xmax,a.ymax,new k(a.spatialReference));map.setExtent(t)}})}),$('[data-toggle="tooltip"]').tooltip({delay:{show:500,hide:0}}),$("#removeBookmarksButton").confirmModal({confirmTitle:"Delete user bookmarks from memory",confirmMessage:"This action will remove all user-defined bookmarks from local memory on your computer or device. Would you like to continue?",confirmOk:"Yes, delete bookmarks",confirmCancel:"Cancel",confirmDirection:"rtl",confirmStyle:"primary",confirmCallback:F,confirmDismiss:!0,confirmAutoOpen:!1})}),require(["esri/dijit/Legend","esri/tasks/locator","esri/tasks/query","esri/tasks/Geoprocessor","esri/tasks/FeatureSet","esri/tasks/GeometryService","esri/tasks/ProjectParameters","esri/tasks/QueryTask","esri/graphicsUtils","esri/geometry/Point","esri/toolbars/draw","esri/SpatialReference","esri/geometry/Extent","esri/layers/ArcGISDynamicMapServiceLayer","esri/layers/FeatureLayer","esri/layers/LabelLayer","esri/symbols/TextSymbol","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol","esri/renderers/SimpleRenderer","esri/Color","esri/dijit/Popup","esri/dijit/PopupTemplate","esri/InfoTemplate","dojo/query","dojo/dom"],function(e,a,t,i,o,s,r,n,l,c,d,p,u,g,h,y,b,v,f,L,k,w,S,x,C,M){function E(e){$("#calculateStats").button("reset");var a=e.results[0].value.features[0].attributes,t=$("#zonalStatsTable");t.html("<tr><th>Mean </th><th>Standard Deviation</th><th>Max</th></tr>"),t.append("<tr><td>"+a.MEAN.toFixed(4)+"</td><td>"+a.STD.toFixed(3)+"</td><td>"+a.MAX+"</td></tr>"),$("#zonalStatsModal").modal("show")}var T,A,R,O,W,F,z=[],B=!1,G=!1,j=!1,N=!1,V={inputPoly:null},H=[];const U="http://gis.wim.usgs.gov/arcgis/rest/services/GLCWRA/",_=new s("http://gis.wim.usgs.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer"),q=new g(U+"WLERA/MapServer",{id:"normalized",visible:!0,opacity:1});q.setVisibleLayers([5]),mapLayers.push(q),mapLayerIds.push(q.id),z.push({layer:q,title:" "}),q.inLegendLayers=!0;const Y=new g(U+"WLERA/MapServer",{id:"dikes",visible:!1,minScale:1e5,opacity:.9});Y.setVisibleLayers([17]),mapLayers.push(Y),mapLayerIds.push(Y.id),Y.inLegendLayers=!1;const Z=new g(U+"WLERA/MapServer",{id:"degFlowlines",visible:!1,minScale:1e5,opacity:1});Z.setVisibleLayers([16]),mapLayers.push(Z),mapLayerIds.push(Z.id),Z.inLegendLayers=!1;const J=new g(U+"WLERA/MapServer",{id:"culverts",visible:!1,minScale:1e5,opacity:1});J.setVisibleLayers([15]),mapLayers.push(J),mapLayerIds.push(J.id),J.inLegendLayers=!1;const K=new g(U+"WLERA/MapServer",{id:"parcelsDyn",visible:!0,minScale:1e5,opacity:1});K.setVisibleLayers([1]),mapLayers.push(K),mapLayerIds.push(K.id),K.inLegendLayers=!1;const Q=new h(U+"WLERA/MapServer/1",{id:"parcelsFeat",visible:!0,minScale:1e5,mode:h.MODE_SELECTION,outFields:["*"]});mapLayers.push(Q),mapLayerIds.push(Q.id),Q.inLegendLayers=!1;var ee=new t;ee.outSpatialReference=map.spatialReference;var ae=new v(v.STYLE_SOLID,new f(f.STYLE_SOLID,new k([255,0,0]),2),new k([255,255,0,.5]));Q.setSelectionSymbol(ae),map.disableClickRecenter(),map.on("click",function(e){ee.geometry=e.mapPoint,ee.outFields=["*"],ee.returnGeometry=!0,B&&Q.selectFeatures(ee,h.SELECTION_ADD),e.shiftKey&&Q.selectFeatures(ee,h.SELECTION_SUBTRACT)}),Q.on("selection-complete",function(){$("#displayStats").prop("disabled",!1)}),T=new d(map);var te=$("#drawCustom");te.click(function(){Q.clearSelection(),map.graphics.remove(O),map.graphics.remove(F),$("#displayStats").prop("disabled",!0),$("#calculateStats").prop("disabled",!0),V={inputPoly:null},j?(T.finishDrawing(),T.deactivate(),te.removeClass("active"),te.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw'),j=!1):j||(te.addClass("active"),te.html('<i class="fa fa-stop"></i>&nbsp;&nbsp;Stop drawing'),B=!1,T.activate(d.POLYGON),j=!0)});var ie=$("#selectParcels");ie.click(function(){te.removeClass("active"),te.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw'),j=!1,T.deactivate(),B?(ie.removeClass("active"),ie.html('<span class="ti-plus"></span>&nbsp;&nbsp;Click'),map.setMapCursor("auto"),B=!1):B||(ie.addClass("active"),ie.html('<i class="fa fa-stop"></i>&nbsp;&nbsp;Stop selecting'),map.setMapCursor("crosshair"),G=!1,B=!0)}),$("#clearSelection").click(function(){Q.clearSelection(),map.graphics.remove(O),map.graphics.remove(F),$("#displayStats").prop("disabled",!0),$("#calculateStats").prop("disabled",!0),V={inputPoly:null},H=[],console.log("Length  of input poly array: "+V.inputPoly.features.length)}),zonalStatsGP=new i("http://gis.wim.usgs.gov/arcgis/rest/services/GLCWRA/WLERAZonalStats/GPServer/WLERAZonalStats"),zonalStatsGP.setOutputSpatialReference({wkid:102100}),zonalStatsGP.on("execute-complete",E),$("#calculateStats").click(function(){$(this).button("loading"),zonalStatsGP.execute(V)}),P(T,"DrawEnd",function(e){R=new v(v.STYLE_SOLID,new f(f.STYLE_SOLID,new k([255,0,0]),2),new k([255,255,0,.5])),O=new m(e,R),map.graphics.add(O),T.deactivate(),te.removeClass("active"),te.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw'),j=!1,H.push(O);var a=new o;a.features=H,V={inputPoly:a},$("#calculateStats").prop("disabled",!1)}),A=new d(map);var oe=$("#selectParcelsDraw");oe.click(function(){map.graphics.remove(F);var e=map.getScale(),a=map.getLayer("parcelsFeat").minScale;N?(A.finishDrawing(),A.deactivate(),oe.removeClass("active"),oe.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw'),N=!1):N||(e>a?$("#parcelSelectScaleAlert").show():(oe.addClass("active"),oe.html('<i class="fa fa-stop"></i>&nbsp;&nbsp;Stop drawing'),B=!1,A.activate(d.POLYGON),N=!0))}),P(A,"DrawEnd",function(e){W=new v(v.STYLE_SOLID,new f(f.STYLE_SOLID,new k([25,25,255]),2),new k([0,0,0,.1])),F=new m(e,W),map.graphics.add(F),A.deactivate(),oe.removeClass("active"),oe.html('<span class="ti-pencil-alt2"></span>&nbsp;Draw'),j=!1,ee.geometry=e,Q.selectFeatures(ee,h.SELECTION_ADD)}),$("#displayStats").click(function(){$("#zonalStatsTable").html("<tr><th>Parcel ID</th><th>Hectares</th><th>Mean </th><th>Standard Deviation</th><th>Max</th></tr>"),map.getLayer("parcelsFeat").getSelectedFeatures().length>0&&$.each(map.getLayer("parcelsFeat").getSelectedFeatures(),function(){$("#zonalStatsTable").append("<tr><td>"+this.attributes.PARCELS_ID+"</td><td>"+this.attributes.Hec.toFixed(3)+"</td><td>"+this.attributes.MEAN.toFixed(4)+"</td><td>"+this.attributes.STD.toFixed(3)+"</td><td>"+this.attributes.stat_MAX+"</td></tr>"),$("#zonalStatsModal").modal("show")})});const se=new g(U+"WLERA/MapServer",{id:"studyArea",visible:!0,opacity:1});se.setVisibleLayers([0]),mapLayers.push(se),mapLayerIds.push(se.id),z.push({layer:se,title:" "}),se.inLegendLayers=!0;const re=new g(U+"WLERA/MapServer",{id:"GLRIWetlands",visible:!0,minScale:1e5,maxScale:1e4,opacity:1});re.setVisibleLayers([4]),mapLayers.push(re),z.push({layer:re,title:" "}),re.inLegendLayers=!0;const ne=new g(U+"WLERA/MapServer",{id:"stations",visible:!1});ne.setVisibleLayers([3]),mapLayers.push(ne),z.push({layer:ne,title:" "}),ne.inLegendLayers=!0;var le=new x;le.setTitle("Wetland Biological Integrity"),le.setContent("<div style='text-align: left'><b>Wetland:</b>  ${name}<br/><b>Wetland class:</b> ${class}<br/><b>Veg IBI value:</b> ${VegIBI}<br/>More information available from the Great Lakes Coastal Wetlands Monitoring Program: <a href='http://greatlakeswetlands.org' target='_blank'>greatlakeswetlands.org</a></div>");var ce=new h("https://services5.arcgis.com/ed839pyDNWVlk9KK/ArcGIS/rest/services/CWMP_Vegetation_IBI/FeatureServer/0",{id:"veg",layerID:"veg",visible:!1,mode:h.MODE_ONDEMAND,outFields:["*"],infoTemplate:le});ce.id="veg",mapLayers.push(ce),mapLayerIds.push(ce.id),z.push({layer:ce,title:""}),ce.inLegendLayers=!0;var de=new S({title:"U.S. ACOE Aerial Photo",mediaInfos:[{title:"",caption:"Date & Time taken: {date_}",type:"image",value:{sourceURL:"{imageUrl}",linkURL:"{imageUrl}"}}]}),pe=new h(U+"WLERA/MapServer/2",{id:"aerials",layerID:"aerials",visible:!1,minScale:1e5,mode:h.MODE_ONDEMAND,outFields:["*"],infoTemplate:de});pe.id="aerials",mapLayers.push(pe),mapLayerIds.push(pe.id),z.push({layer:pe,title:"US Army Corps of Engineers Aerial Photos "}),pe.inLegendLayers=!0;const me=new g(U+"WLERA/MapServer",{id:"landuse",visible:!1,opacity:1});me.setVisibleLayers([13]),mapLayers.push(me),mapLayerIds.push(me.id),me.inLegendLayers=!1;const ue=new g(U+"WLERA/MapServer",{id:"imperviousSurfaces",visible:!1,opacity:1});ue.setVisibleLayers([12]),mapLayers.push(ue),mapLayerIds.push(ue.id),ue.inLegendLayers=!1;const ge=new g(U+"WLERA/MapServer",{id:"conservedLands",visible:!1,opacity:1});ge.setVisibleLayers([11]),mapLayers.push(ge),mapLayerIds.push(ge.id),ge.inLegendLayers=!1;const he=new g(U+"WLERA/MapServer",{id:"flowline",visible:!1,opacity:1});he.setVisibleLayers([10]),mapLayers.push(he),mapLayerIds.push(he.id),he.inLegendLayers=!1;const ye=new g(U+"WLERA/MapServer",{id:"wetsoils",visible:!1,opacity:1});ye.setVisibleLayers([9]),mapLayers.push(ye),mapLayerIds.push(ye.id),ye.inLegendLayers=!1;const be=new g(U+"WLERA/MapServer",{id:"hydroperiod",visible:!1,opacity:1});be.setVisibleLayers([8]),mapLayers.push(be),mapLayerIds.push(be.id),be.inLegendLayers=!1;const ve=new g(U+"WLERA/MapServer",{id:"waterMask",visible:!0,opacity:.75});ve.setVisibleLayers([7]),mapLayers.push(ve),mapLayerIds.push(ve.id),ve.inLegendLayers=!0,z.push({layer:ve,title:""}),map.addLayers(mapLayers);var fe=map.enableSnapping({snapKey:I("mac")?D.META:D.CTRL}),Le=[{layer:Q}];fe.setLayerInfos(Le);var ke=new r,we=new p(26917);X.on("measure-end",function(e){ke.geometries=[e.geometry],ke.outSR=we;var a=-1*e.geometry.x;84>a&&a>78?_.project(ke,function(e){var a=e[0];console.log(a);var t=a.x.toFixed(0),i=a.y.toFixed(0);$("#utmX").html(t),$("#utmY").html(i)}):($("#utmX").html('<span class="label label-danger">outside zone</span>'),$("#utmY").html('<span class="label label-danger">outside zone</span>'))});for(var $e=0;$e<map.layerIds.length;$e++){var Se=map.getLayer(map.layerIds[$e]);Se.visible&&($("#"+Se.id).button("toggle"),$("#"+Se.id).find("i.checkBoxIcon").toggleClass("fa-check-square-o fa-square-o"))}for(var $e=0;$e<map.graphicsLayerIds.length;$e++){var Se=map.getLayer(map.graphicsLayerIds[$e]);Se.visible&&($("#"+Se.id).button("toggle"),$("#"+Se.id).find("i.checkBoxIcon").toggleClass("fa-check-square-o fa-square-o"))}$(document).ready(function(){$("button.lyrTog").click(function(e){$(this).find("i.checkBoxIcon").toggleClass("fa-check-square-o fa-square-o"),$(this).button("toggle"),e.preventDefault(),e.stopPropagation();var a=map.getLayer($(this).attr("id"));a.visible?a.setVisibility(!1):(a.setVisibility(!0),a.inLegendLayers===!1&&(z.push({layer:a,title:" "}),a.inLegendLayers=!0,xe.refresh()))}),$("#hydroConditionGroup, #parametersGroup, #4scaleGroup").on("hide.bs.collapse",function(){var e=$(this)[0].id.replace("Group","");$("#"+e).find("i.checkBoxIcon").toggleClass("fa-check-square-o fa-square-o"),$("#"+e).find("i.chevron").toggleClass("fa-chevron-right fa-chevron-down");var a=$(this).attr("id")+"Buttons";$("#"+a).button("toggle")}),$("#hydroConditionGroup, #parametersGroup, #4scaleGroup").on("show.bs.collapse",function(){var e=$(this)[0].id.replace("Group","");$("#"+e).find("i.checkBoxIcon").toggleClass("fa-check-square-o fa-square-o"),$("#"+e).find("i.chevron").toggleClass("fa-chevron-right fa-chevron-down")}),$(".zoomto").hover(function(e){$(".zoomDialog").remove();var a=this.id.replace("zoom",""),t=$('<div class="zoomDialog"><label class="zoomClose pull-right">X</label><br><div class="list-group"><a href="#" id="zoomscale" class="list-group-item lgi-zoom zoomscale">Zoom to scale</a> <a id="zoomcenter" href="#" class="list-group-item lgi-zoom zoomcenter">Zoom to center</a><a id="zoomextent" href="#" class="list-group-item lgi-zoom zoomextent">Zoom to extent</a></div></div>');$("body").append(t),$(".zoomDialog").css("left",e.clientX-80),$(".zoomDialog").css("top",e.clientY-5),$(".zoomDialog").mouseleave(function(){$(".zoomDialog").remove()}),$(".zoomClose").click(function(){$(".zoomDialog").remove()}),$("#zoomscale").click(function(e){var t=map.getLayer(a).minScale;t>0?map.setScale(t):console.log("No minimum scale for layer.")}),$("#zoomcenter").click(function(e){var a=new c(-83.208084,41.628103,new p({wkid:4326}));map.centerAt(a)}),$("#zoomextent").click(function(e){var t=map.getLayer(a).fullExtent,i=new r;i.outSR=new p(102100),i.geometries=[t],_.project(i,function(e){var a=e[0];map.setExtent(a,new p({wkid:102100}))})})}),$(".opacity").hover(function(e){$(".opacitySlider").remove();var a=this.id.replace("opacity",""),t=map.getLayer(a).opacity,i=$('<div class="opacitySlider"><label id="opacityValue">Opacity: '+t+'</label><label class="opacityClose pull-right">X</label><input id="slider" type="range"></div>');$("body").append(i);var o=$("#slider");o[0].value=100*t,$(".opacitySlider").css("left",e.clientX-180),$(".opacitySlider").css("top",e.clientY-5),$(".opacitySlider").mouseleave(function(){$(".opacitySlider").remove()}),$(".opacityClose").click(function(){$(".opacitySlider").remove()}),o.change(function(e){var t=o[0].value/100;console.log("o: "+t),$("#opacityValue").html("Opacity: "+t),map.getLayer(a).setOpacity(t)})})});var xe=new e({map:map,layerInfos:z},"legendDiv");xe.startup()})});