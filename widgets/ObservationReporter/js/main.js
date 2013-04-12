/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation-report widget.
 *
 *     observation-reporter is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     observation-reporter is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation-reporter. If not, see
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
/*global MashupPlatform StyledElements*/

(function () {
 
    "use strict";

    var url = 'http://130.206.80.195:1026';
    var options = {
        requestFunction: MashupPlatform.http.makeRequest
    };
    var connection = new NGSI.Connection(url, options);

    var update_id_select, update_observation;

/******************************************************************************/
/********************************* PUBLIC *************************************/
/******************************************************************************/

    var ObservationReporter = function ObservationReporter() {
        this.wirecloudAuth = {};

        /*Wirecloud Authentication credentials and repo info.*/
        this.wirecloudAuth.PROJECT = "ENVIROFI";
        this.wirecloudAuth.USER = "envirofi_ait";
        this.wirecloudAuth.PASS = "welcome10";
        this.wirecloudAuth.TENANT_ID = "35e92f2be42b48778c0456f51ba71be6";
        this.wirecloudAuth.IMAGE_REPO = "EnvirofiImg";
        this.wirecloudAuth.IMAGE_REPOSITORY_URL = "http://130.206.80.102:8080/v1/AUTH_" + this.wirecloudAuth.TENANT_ID + "/" + this.wirecloudAuth.IMAGE_REPO + "/";
        this.TOKEN_REQUEST_URL = "http://130.206.80.100:5000/v2.0/tokens";
        this.authToken = "";
    };
 
    ObservationReporter.prototype.init = function init() {
        var fields = {
            "id": {
                label: 'Observation',
                type: 'select',
                initialEntries: [{label: '--------------', value: ''}],
                required: true
            },
            "imageType": {
                label: "Photo Type",
                type: "select",
                required: true,
                initialEntries: [
                    {label: "Tree", value: "Tree"},
                    {label: "Leaf", value: "Leaf"},
                    {label: "Fruit", value: "Fruit"},
                    {label: "Bark", value: "Bark"},
                    {label: "Flower", value: "Flower"},
                    {label: "LeafConn", value: "LeafConn"},
                    {label: "Other", value: "Other"}
                ]
            },
            "imageFile" : {
                label: 'Image',
                type: 'file',
                required: true
            },
            "imageComment": {
                label: 'Comments',
                type: 'longtext',
                required: true
            },
            "height": {
                label: 'Height',
                type: 'text',
                required: true
            },
            "crowDiameter": {
                label: 'Crow Diameter',
                type: 'text',
                required: true
            },
            "trunkDiameter": {
                label: 'Trunk Diameter',
                type: 'text',
                required: true
            },
            "plantingYear": {
                label: 'Planting Year',
                type: 'text',
                required: true
            }
        };
        var options = {
            cancelButton: false
        };
        this.form = new StyledElements.Form(fields, options);
        this.form.addEventListener("submit", handlerUploadFile.bind(this));
        this.form.insertInto(document.body);

        this.updateAvailableObservations();
    };

    ObservationReporter.prototype.updateAvailableObservations = function updateAvailableObservations() {
        /* TODO
        */
        connection.query([{
                id: '*',
                type: 'Observation'
            }],
            null,
            {
              flat: true,
              onSuccess: update_id_select.bind(this)
            }
        );
    };

/******************************************************************************/
/******************************** PRIVATE *************************************/
/******************************************************************************/

    update_id_select = function update_id_select(observations) {
        var key, entries = [];

        for (key in observations) {
            if (!('imageFile' in observations[key]) || observations[key].imageFile.trim() === '' || observations[key].imageFile === 'emptycontent') {
                entries.push({label: key, value: key});
            }
        }

        /* TODO
        this.form.fieldInterfaces['id'].clear();
        this.form.fieldInterfaces['id'].addEntries(entries);
        */
        this.form.fieldInterfaces['id'].inputElement.clear();
        this.form.fieldInterfaces['id'].inputElement.addEntries(entries);
    };

    update_observation = function update_observation(values) {
        connection.updateAttributes([
            {
                entity: {
                    id: values.id,
                    type: 'Observation'
                },
                attributes: [
                    {name: 'imageType', contextValue: values.imageType},
                    {name: 'imageFile', contextValue: values.imageFile.name},
                    {name: 'imageComment', contextValue: values.imageComment},
                    {name: 'height', contextValue: values.height},
                    {name: 'crownDiameter', contextValue: values.crowDiameter},
                    {name: 'trunkDiameter', contextValue: values.trunkDiameter},
                    {name: 'plantingYear', contextValue: values.plantingYear},
                ]
            }
            ], {
                onComplete: function () {
                    this.form.acceptButton.enable();
                }.bind(this),
                onFailure: function () {
                    /* TODO */
                    this.form.msgElement.textContent = 'Error uploading image to the Object Storage';
                }.bind(this)
            }
        );
    };

    var handlerUploadFile = function (form, data) {

        this.form.acceptButton.disable();

        var uploadFile = function uploadFile() {
            MashupPlatform.http.makeRequest(this.wirecloudAuth.IMAGE_REPOSITORY_URL + data.imageFile.name, {
                method: 'PUT',
                contentType: 'image/jpeg',
                requestHeaders: {'X-Auth-Token': this.authToken},
                postBody: data.imageFile,
                onSuccess: update_observation.bind(null, data),
                onFailure: function () {
                    this.form.acceptButton.enable();
                    /* TODO */
                    this.form.msgElement.textContent = 'Error uploading image to the Object Storage';
                }.bind(this)
            });
        };

        getAuthToken.call(this, {onSuccess: uploadFile.bind(this)});
    };

    var getAuthToken = function getAuthToken(options) {
        if (options == null) {
            options = {};
        }

        var tokenRequest = {};
        
        var wirecloudPostBody = {"auth": {
            "project": this.wirecloudAuth.PROJECT,
            "passwordCredentials": {
                "username": this.wirecloudAuth.USER,
                "password": this.wirecloudAuth.PASS
            },
            "tenantId":this.wirecloudAuth.TENANT_ID
        }};

        var postBody = wirecloudPostBody;
        var requestHeaders = {"Accept":"application/json"}; 
        var tokenRequestParms = {
            "contentType": "application/json",
            "postBody": JSON.stringify(postBody),
            "requestHeaders": requestHeaders, 
            "onSuccess": successfulyRequestedAuthToken.bind(this, options.onSuccess)
        };
        tokenRequest = MashupPlatform.http.makeRequest(this.TOKEN_REQUEST_URL, tokenRequestParms);
    };
   
    
    var successfulyRequestedAuthToken = function successfulyRequestedAuthToken(onSuccess, response) {
        var JSONResponse = {};
        JSONResponse = JSON.parse(response.responseText);
        this.authToken = JSONResponse.access.token.id;

        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    };

    window.ObservationReporter = ObservationReporter;

})();

var observationReporter = new ObservationReporter();

window.addEventListener("DOMContentLoaded", observationReporter.init.bind(observationReporter), false);
