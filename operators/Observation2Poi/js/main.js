/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation2poi widget.
 *
 *     observation2poi is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     observation2poi is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation2poi. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

/*jshint browser:true*/
/*global MashupPlatform*/

MashupPlatform.wiring.registerCallback("observationInput", function(observation) {
    var poi = {};

    var obs = new Observation(JSON.parse(observation));

    poi.id = obs.getId(); 
    poi.icon = setIcon(obs);
    poi.tooltip = obs.getIdOoI();
    poi.data = obs.toString();

    poi.infoWindow = setInfoWindow.call(this, obs);

    poi.currentLocation = {};
    poi.currentLocation.system = "WGS84";
    poi.currentLocation.lat = parseFloat(obs.getLat());
    poi.currentLocation.lng = parseFloat(obs.getLng());

    MashupPlatform.wiring.pushEvent("poiOutput", JSON.stringify(poi));
});

var ownUrl = function ownUrl (data) {
    var url = document.createElement("a");
    url.href = data; 
    return url.href;
};

var setIcon = function setIcon (observation) {
    var imagePath = "images/";
    var imageType = observation.getImageType();
    var icon = imagePath + imageType + ".png";
    
    return ownUrl.call(this, icon);
};
var setInfoWindow = function setInfoWindow (observation) {
    var infoWindow;
    var image = observation.getImageURL();

    infoWindow = "<div>";
    if (image) {
        infoWindow += '<img src="' + image + '" style="width:100px;height:100px;float:left;margin:5px"></img>';
        infoWindow += "<br />";
    }
    infoWindow += "<span>" + observation.getImageComment() + "</span>";
    infoWindow += "</div>";

    return infoWindow;
};
