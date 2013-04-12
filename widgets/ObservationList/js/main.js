/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation-list widget.
 *
 *     observation-list is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     observation-list is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation-list. If not, see <http://www.gnu.org/licenses/>.
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
/*global MashupPlatform StyledElements Observation */

(function () {
 
    "use strict";

    var ObservationList = function ObservationList () {

        /* Slots */
        MashupPlatform.wiring.registerCallback("observationInput", handlerInputObservation.bind(this));
        MashupPlatform.wiring.registerCallback("observationListInput", handlerInputObservationList.bind(this));
        
        /* Context */
        MashupPlatform.widget.context.registerCallback(function (new_values) {
            if (this.table && 'heightInPixels' in new_values) {
                this.table.repaint();
            }
        }.bind(this));
        
        /* Others */
        this.table = null;
        this.observationJSONList = null; 
        this.observationList = null;
        this.observationMapTableList = null;
   };
 
    ObservationList.prototype.init = function init () {
        createTable.call(this);
        displayInitialMessage.call(this);
    };

/**************************************************************************/
/****************************** AUXILIAR **********************************/
/**************************************************************************/

    var createTable = function createTable () {
        var columns = [
            {field:"id", label:"#", width:"95px", sortable:true},
            {field:"idOoI", label:"TreeID", width:"95px", sortable:true},
            {field:"imageComment", label:"Description", sortable: true},
            {field:"moreInfo", label:"More Info", width:"76px", sortable: true, contentBuilder: moreInfoRender.bind(this)}
        ];
        this.table = new StyledElements.ModelTable(columns);
        this.table.insertInto(document.body);
        this.table.addEventListener("click", handlerClickRow.bind(this), false);
        //updateTable.call(this);
        this.table.repaint();
    };

    var displayInitialMessage = function displayInitialMessage(){
        var messageContainer = document.createElement("div");
        var title = document.createElement("h4");
        var textContainer = document.createElement("p");
        var text = document.createElement("span");

        messageContainer.setAttribute("id", "messageContainer");
        messageContainer.setAttribute("class", "alert alert-block");
        title.setAttribute("class", "titleInfoBox");
        title.textContent = "This widget needs to be wired.";
        textContainer.setAttribute("class", "p1InfoBox");
        text.textContent = "Get real time observations from the Observation Service.";
        document.body.appendChild(messageContainer);
        messageContainer.appendChild(title);
        messageContainer.appendChild(textContainer);
        textContainer.appendChild(text);
    };
   
    var updateTable = function updateTable () {
        this.table.pagination.changeElements(this.observationMapTableList);
    };
    
    var parseObservationList = function parseObservationList(observationListString){
        this.observationJSONList = JSON.parse(observationListString);
    };

    var observationListMapping = function observationListMapping(){
        var e = 0;
        var observation = {};
        var observationTable = {};

        this.observationMapTableList = [];
        this.observationList = [];

        for(e in this.observationJSONList){
            observation = new Observation(this.observationJSONList[e]);
            this.observationList.push(observation);

            observationTable = {};
            observationTable.id = observation.getId();
            observationTable.idOoI = observation.getIdOoI();
            observationTable.imageComment = observation.getImageComment();
            observationTable.moreInfo = "";
            
            this.observationMapTableList.push(observationTable);
        }
    };

/**************************************************************************/
/****************************** HANDLERS **********************************/
/**************************************************************************/

    var handlerInputObservation = function handlerInputObservation(observationString) {
        var observation = new Observation(JSON.parse(observationString));
        this.table.select(observation.getId());
        
    };
    
    var handlerInputObservationList = function handlerInputObservationList (observationListString){
        var initialMessageContainer = document.getElementById("messageContainer");
        if(initialMessageContainer){
            document.body.removeChild(initialMessageContainer);
        }

        parseObservationList.call(this, observationListString);
        observationListMapping.call(this);
        
        //Update Table:
        updateTable.call(this);

    };

    var moreInfoRender = function moreInfoRender(){
        var arrowSpan = document.createElement("span");
        arrowSpan.setAttribute("class", "icon-arrow-right");

        return arrowSpan;
    };

    var handlerClickRow = function handlerClickRow (observationFromTable) {
        var observation;
        var idToSearch = observationFromTable.id;
        var found = false;
        var i = 0;

        while(!found){
            observation = this.observationList[i];
            if (observation.getId() === idToSearch){
                found = true;
            }
            i++;
        }

        MashupPlatform.wiring.pushEvent('observationOutput', JSON.stringify(observation.observation));
    };

/**************************************************************************/

    window.ObservationList = ObservationList;

 })();

var observationList = new ObservationList();

window.addEventListener("DOMContentLoaded", observationList.init.bind(observationList), false);
