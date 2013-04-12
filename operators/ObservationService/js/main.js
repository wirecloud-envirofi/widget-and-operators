/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation-service widget.
 *
 *     observation-service is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     observation-service is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation-service. If not, see
 *     <http://www.gnu.org/licenses/>.
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
/*global MashupPlatform NGSI console Observation Report*/

(function(){

    "use strict";

/*****************************************************************************/
/********************************** PUBLIC ***********************************/
/*****************************************************************************/

    var ObservationSource = function ObservationSource () {
        this.connection = {};
        this.observationList = null;
        this.lastViewport = null;

        // Initialize Observation Lists:
        this.listAllObs = [];       // All observations. Fill it in onSuccess query function.
        this.listOKObs = [];        // Observations filtered
        this.listOldOKObs = [];     // Last observations before to send the new ones.
        this.listInsertObs = [];    // Observations to insert.
        this.listDeleteObs = [];    // Observations to delete.

        // Initialize filters:
        this.filters = {};

        // Set handlers for inputs:
        MashupPlatform.wiring.registerCallback("timeIntervalInput", handlerTimeIntervalInput.bind(this));
        MashupPlatform.wiring.registerCallback("viewportInput", handlerViewportInput.bind(this));
        MashupPlatform.wiring.registerCallback("reportInput", handlerReportInput.bind(this));
    };

    ObservationSource.prototype.init = function init () {
        // Initialize ngsi:
        var ngsi_server = 'http://130.206.80.195:1026';
        var ngsi_proxy = 'http://wirecloud.conwet.fi.upm.es:3000/';
        this.connection = new NGSI.Connection(ngsi_server, {
            ngsi_proxy_url: ngsi_proxy,
            requestFunction: MashupPlatform.http.makeRequest
        });

        this.connection.query([{
                type: 'Observation',
                id: '*'
            }],
            null, {
                flat:true,
                onSuccess: getAllObservations.bind(this)
            }
        );

        this.connection.createSubscription([
                {type: 'Observation', id: '*'}
            ],
            null,
            'PT24H',
            null,
            [{type:'ONCHANGE'}],
            {
                flat: true,
                onNotify: getAllObservations.bind(this) 
            }
        );
    };


/*****************************************************************************/
/********************************** PRIVATE **********************************/
/*****************************************************************************/

    var getAllObservations = function getAllObservations (obsList) {
        for (var key in obsList) {
            this.listAllObs.push(new Observation(obsList[key]));
        }

        this.listInsertObs = this.listAllObs;
        sendObservations.call(this);
    };

    var sendObservations = function sendObservations () {
        var observation;
        var item;

        for (var i = 0; i < this.listInsertObs.length; i++) {
            observation = this.listInsertObs[i];
            if(observation.getImageFile()){
                MashupPlatform.wiring.pushEvent('outputInsertObservation', observation.toString());
            }
            updateImage.call(this, observation);
        }

        for (var j = 0; j < this.listDeleteObs.length; j++) {
            observation = this.listDeleteObs[j].toString();
            MashupPlatform.wiring.pushEvent('outputDeleteObservation', observation);
        }
    };


/********************************** HANDLERS *********************************/

    var handlerTimeIntervalInput = function handlerTimeIntervalInput (timeInterval) {
        // timeInterval example: 2007-03-01T13:00:00Z/2008-05-11T15:30:00Z
        // TODO: test input format by regExp.

        if (timeInterval) { //TODO: && regExp.test(timeInterval)) {
            // 1. Update time filter:
            setTimeFilter.call(this);

            // 2. buildOKList(); Pasar los filtros a la lista listAllObs y construir listOKObs.
            buildOKList.call(this);

            // 3. Enviar las observations para insertar. 
            buildInsertList.call(this);

            // 4. Enviar las observations para borrar.
            buildDeleteList.call(this);

            // 5. Enviar las observaciones:
            sendObservations.call(this);
            
            // 6. Actualizar listOldOKObs con listOKObs.
            this.listOldOKObs = this.listOKObs;

            //doQuery.call(this, this.filters.time);
        }
    };

    var handlerViewportInput = function handlerViewportInput (viewport) {
        // viewport example: ((50.75117680997111, 4.133357028515661), (50.99512417785961, 4.640101413281286))
        // 1. Update viewport filter:
        var regExp = /(\(\(-{0,1}(\d)+(\.(\d)+){0,1}, -{0,1}(\d)+(\.(\d)+){0,1}\), \(-{0,1}(\d)+(\.(\d)+){0,1}, -{0,1}(\d)+(\.(\d)+){0,1}\)\)){1}/;

        if (viewport && regExp.test(viewport)) {

            // 1. Update viewport filter:
            setViewportFilter.call(this, viewport);

            // 2. buildOKList(); Pasar los filtros a la lista listAllObs y construir listOKObs.
            buildOKList.call(this);

            // 3. Enviar las observations para insertar. 
            buildInsertList.call(this);

            // 4. Enviar las observations para borrar.
            buildDeleteList.call(this);

            // 5. Enviar las observaciones:
            sendObservations.call(this);
            
            // 6. Actualizar listOldOKObs con listOKObs.
            this.listOldOKObs = this.listOKObs;

            //TODO:
            // Difference is enough?
            // 1. get last viewport.
            // if (!this.lastViewport) {
            //     this.lastViewport = viewport;
            // } else {
            // 2. compare last viewport with the new one.
            //     compareViewports(this.lastViewport, viewport);
            // }
            // 3. if (is enough) => do the query, change last viewport
            // 4. Else do nothing

            // Do Query
            //doQuery.call(this, this.filters.viewport);
        }
    };

    var handlerReportInput = function handlerReportInput (observation) {
        // Do update with report.
        if (observation) {
            updateObservation.call(this, observation);
        }
    };


/********************************** AUXILIAR *********************************/

    /******************************* Filters *********************************/

    var setTimeFilter = function setTimeFilter (timeInterval) {
    // timeInterval example: 2007-03-01T13:00:00Z/2008-05-11T15:30:00Z
        // It does not exist a time filter:
        if (!this.filters.hasOwnProperty('time')) {
            this.filters.time = {
                start: {},
                end: {}
            };
        }

        // Get time interval from standard String (ISO 8601) and set filter:
        var stringInterval = timeInterval.split('/');
        this.filters.time.start =  new Date(stringInterval[0]);
        this.filters.time.end = new Date(stringInterval[1]);

        // It filter an array of observations.
        this.filters.viewport.fun = function (observation, index, array) {
            var time = new Date(observation.getTime());

            return time > this.filters.time.start &&
                time < this.filters.time.end;
        };
    };

    var setViewportFilter = function setViewportFilter (viewport) {
    // viewport example: ((50.75117680997111, 4.133357028515661), (50.99512417785961, 4.640101413281286))
        var latLng;
        var stringViewport;
        var startCoordinates;
        var endCoordinates;

        // It does not exist a viewport filter:
        if (!this.filters.hasOwnProperty('viewport')) {
            this.filters.viewport = {
                start: {},
                end: {}
            };
        }

        // Get viewport from string and set filter:
        stringViewport = viewport.split('), (');
        startCoordinates = stringViewport[0].split('((')[1];
        endCoordinates = stringViewport[1].split('))')[0];

        latLng = startCoordinates.split(',');
        this.filters.viewport.start = {
            lat: parseFloat(latLng[0].trim()),
            lng: parseFloat(latLng[1].trim())
        };

        latLng = endCoordinates.split(',');
        this.filters.viewport.end = {
            lat: parseFloat(latLng[0].trim()),
            lng: parseFloat(latLng[1].trim())
        };

        // It filter an array of observations.
        this.filters.viewport.fun = function (observation, index, array) {
            var latitude = parseFloat(observation.getLat());
            var longitude = parseFloat(observation.getLng());

            return latitude > this.filters.viewport.start.lat &&
                    latitude < this.filters.viewport.end.lat &&
                    longitude > this.filters.viewport.start.lng &&
                    longitude < this.filters.viewport.end.lng;
        };
    };


    /******************************* Build list *********************************/

    var buildOKList = function buildOKList () {
        var keys = Object.keys(this.filters);

        if (keys.length > 0) {
            this.listOKObs = this.listAllObs.filter(this.filters[keys[0]].fun.bind(this));
            for (var i = 1; i < keys.length; i++) {
                this.listOKObs = this.listOKObs.filter(this.filters[keys[i]].fun.bind(this));
            }
        }
    };

    var buildInsertList = function buildInsertList () {
        this.listInsertObs = [];
        // Comprobar cuales de los elementos de listOKObs no está en listOldOKObs.
        for (var i = 0; i < this.listOKObs.length; i++) {
            if (!findElement(this.listOKObs[i], this.listOldOKObs)) {
                this.listInsertObs.push(this.listOKObs[i]);
            }
        }
    };

    var buildDeleteList = function buildDeleteList () {
        this.listDeleteObs = [];
        // Comprobar cuales de los elementos de listOldOKObs no está en listOKObs.
        for (var i = 0; i < this.listOldOKObs.length; i++) {
            if (!findElement(this.listOldOKObs[i], this.listOKObs)) {
                this.listDeleteObs.push(this.listOldOKObs[i]);
            }
        }
    };


    /******************************* Request Images *********************************/

    var updateImage = function updateImage (observation) {
    /* Envirofi Authentication credentials and repo info */
        var envirofiAuth = {
            "PROJECT": "ENVIROFI",
            "USER": "envirofi_ait",
            "PASS": "welcome10",
            "TENANT_ID": "35e92f2be42b48778c0456f51ba71be6",
            "IMAGE_REPO": "EnvirofiImg"
        };
        envirofiAuth.IMAGE_REPOSITORY_URL = "http://130.206.80.102:8080/v1/AUTH_" + envirofiAuth.TENANT_ID + "/" + envirofiAuth.IMAGE_REPO + "/";

        // Send Request to get token:
        var TOKEN_REQUEST_URL = "http://130.206.80.100:5000/v2.0/tokens";
        var postBody = {
            "auth": {
                "project": envirofiAuth.PROJECT,
                "passwordCredentials": {
                    "username": envirofiAuth.USER,
                    "password": envirofiAuth.PASS
                },
                "tenantId": envirofiAuth.TENANT_ID
            }
        };
        var requestHeaders = {
            "Accept": "application/json"
        };
        var tokenRequestParms = {
            "contentType": "application/json",
            "postBody": JSON.stringify(postBody),
            "requestHeaders": requestHeaders,
            "onSuccess": successfulyRequestedAuthToken.bind(this, observation, envirofiAuth.IMAGE_REPOSITORY_URL)
        };
        MashupPlatform.http.makeRequest(TOKEN_REQUEST_URL, tokenRequestParms);
    };

    var successfulyRequestedAuthToken = function successfulyRequestedAuthToken (observationString, repositoryUrl, response) {
        var observation = new Observation(JSON.parse(observationString));
        var JSONResponse = JSON.parse(response.responseText);
        var authToken = JSONResponse.access.token.id;
        var imageFileName = observation.getImageFile();
        var urlToRequestImage = repositoryUrl + imageFileName;

        var requestHeaders = {
            "X-Auth-Token": authToken
        };
        var imageRequestParms = {
            "method": "GET",
            "requestHeaders": requestHeaders,
            "responseType": "blob",
            "onSuccess": updateImageObservation.bind(this, observation)
        };
        MashupPlatform.http.makeRequest(urlToRequestImage, imageRequestParms);
    };

    var updateImageObservation = function updateImageObservation (observation, response) {
        var photoURL = window.URL.createObjectURL(response.response);
        observation.setImageURL(photoURL);
        if (findElement(observation, this.listOKObs)) {
            MashupPlatform.wiring.pushEvent("outputInsertObservation", observation.toString());
            replaceElement(observation, this.listAllObs);
            replaceElement(observation, this.listOKObs);
        }
    };


    /******************************* Others *********************************/

    var findElement = function findElement (observation, list) {
        return list.some(function(element, index, array){
            return observation.getId() === element.getId();
        });
    };

    var replaceElement = function replaceElement (observation, list) {
        var obsId = observation.getId();

        for (var i = 0; i < list.length; i += 1) {
            if (list[i].getId() === obsId) {
                list[i] = observation;
                return;
            }
        }
    };

    var doQuery = function doQuery (filter) {
        // FIXME: Define filter and do query. It can not be done. Filters don't work.
        this.connection.query([{type: 'Observation', id: '*'}], [], {
            flat:true,
            onSuccess: querySuccess.bind(this)
        });
    };

    var querySuccess = function querySuccess (observationList) {
        //FIXME: Results will be returned when filters are implemented.
        var observation;
        for (var item in observationList) {
            observation = filterObservation.call(this, observationList[item]);
            if (observation) {
                MashupPlatform.wiring.pushEvent("observationOutput", observationList[observation]);
            }
        }
    };

    var filterObservation = function filterObservation (observation) {
        var obItem = new Observation(observation);
        var latitude = parseFloat(obItem.getLat());
        var longitude = parseFloat(obItem.getLng());
        var time = new Date(obItem.getTime());
        var result = null;

        // Viewport filter:
        var coordinatesCond = true;
        if (this.filters.viewport.start && this.filters.viewport.end) {
            coordinatesCond = latitude > this.filters.viewport.start.lat &&
                latitude < this.filters.viewport.end.lat &&
                longitude > this.filters.viewport.start.lng &&
                longitude < this.filters.viewport.end.lng;
        }

        // Time interval filter:
        var timeCond = true;
        if (this.filters.time.start && this.filters.time.end) {
            timeCond = time > this.filters.time.start &&
                time < this.filters.time.end;
        }

        if (coordinatesCond && timeCond) {
            result = observation;
        }

        return result;
    };

    var updateObservation = function updateObservation (observationString) {
        var attrsUpdate = [];
        var report = new Observation(JSON.parse(observationString));
        var attrs = report.getAttributes();

        var id = report.getId();
        var type = report.getType();
        for (var key in attrs) {
            if (attrs[key]) {
                attrsUpdate.push({
                    'name': key,
                    'contextValue': attrs[key]
                });
            }
        }

        var update = [{
            entity: {
                'id': id,
                'type': type
            },
            attributes: attrsUpdate
        }];
        var callbacks = {
            flat:true,
            onSuccess: function (observationList) {
                for (var key in observationList) {
                    var observation = new Observation(observationList[key]);

                    var obsInList = findElement(observation, this.listOKObs);
                    if(obsInList) {
                        replaceElement(observation, this.listAllObs);
                        buildOKList.call(this);
                        MashupPlatform.wiring.pushEvent("outputInsertObservation", observation.toString());
                        this.listOldOKObs = this.listOKObs;
                    } else {
                        obsInList = findElement(observation, this.listAllObs);
                        if (obsInList) {
                            replaceElement(observation, this.listAllObs);
                        } else {
                            this.listAllObs.push(observation);
                        }
                    }
                }
            }.bind(this)
        };
        this.connection.updateAttributes(update, callbacks);
    };


    /*********************************** viewports ****************************/

    var compareViewports = function compareViewports (oldViewport, newViewport) {
        var shift = null;
        var error = 1e-10;
        var oldDist = distance2Points(oldViewport);
        var newDist = distance2Points(newViewport);

        var distance = Math.abs(oldDist - newDist);
        if (distance > error) {  // same distance.

        }
    };

    var distance2Points = function distance2Points (viewport) {
        var latDiff = viewport.start.lat - viewport.start.lat;
        var lngDiff = viewport.start.lng - viewport.start.lng;

        return Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lngDiff, 2));  // Pitagoras
    };

    window.ObservationSource = ObservationSource;

})();

var observationSource = new ObservationSource();

observationSource.init();
