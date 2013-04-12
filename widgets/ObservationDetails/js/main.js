/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation-details widget.
 *
 *     observation-details is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     observation-details is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation-details. If not, see
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
/*global MashupPlatform StyledElements Observation */

(function () {
 
    "use strict";

/******************************************************************************/
/********************************* PUBLIC *************************************/
/******************************************************************************/

    var ObservationDetails = function ObservationDetails () {
        this.tabs = {};
        this.observation = null;
        this.mainInfo = null;
        this.treeInfo = null;
        this.commentsInfo = null;
        MashupPlatform.wiring.registerCallback("observationInput", handlerInputObservation.bind(this));
        
        /* Context */
        MashupPlatform.widget.context.registerCallback(function (new_values) {
            if ('heightInPixels' in new_values) {
                this.tabs.repaint();
            }
        }.bind(this));
    };
 
    ObservationDetails.prototype.init = function init () {
        this.tabs = new StyledElements.StyledNotebook();
        this.tabs.insertInto(document.body);
        this.mainTab = this.tabs.createTab({name: "Main Info", closable: false});
        this.treeDetailsTab = this.tabs.createTab({name: "Tree Details", closable: false});
        this.commentsTab = this.tabs.createTab({name: "Comments", closable: false});

        this.mainTab.appendChild(createContainerWithID.call(this, "div", "initialMessageContainer"));
        this.mainTab.appendChild(createContainerWithID.call(this, "div", "mainInfoContainer"));
        this.treeDetailsTab.appendChild(createContainerWithID.call(this, "div", "treeDetailsContainer"));
        this.commentsTab.appendChild(createContainerWithID.call(this, "div", "commentsContainer"));
        
        displayInitialMessage.call(this);
    };

/******************************************************************************/
/************************************ VIEW ************************************/
/******************************************************************************/

    var createContainer = function createContainer(containerType){
        return  document.createElement(containerType);
    };

    var createContainerWithID = function createContainerWithID (containerType, idName){
        var container = createContainer(containerType);
        container.setAttribute("id", idName);
        return container;
    };
    
    var createContainerWithClass = function createContainerWithClass (containerType, className){
        var container = createContainer(containerType);
        container.setAttribute("class", className);
        return container;
    };

    var createTable = function createTable(parentNode, tableID, data){
        var i;
        var N_COL_TABLE = 2;
        var tableContainer = createContainerWithID("table", tableID);

        for(i = 0; i < data.length; i++){
            var rowContainer = createContainer("tr");
            var titleElement = createContainerWithClass("td", "title");
            var valueElement = createContainerWithClass("td", "value");

            rowContainer.appendChild(titleElement);
            rowContainer.appendChild(valueElement);
            tableContainer.appendChild(rowContainer);
        }
        parentNode.appendChild(tableContainer);
        return tableContainer;
    };

    var displayInitialMessage = function displayInitialMessage () {
        var messageContainer = document.getElementById("initialMessageContainer");
        var title = document.createElement("h4");
        var textContainer = document.createElement("p");
        var text = document.createElement("span");

        messageContainer.setAttribute("class", "alert alert-block");
        title.textContent = "This widget need to be wired";
        text.textContent = "This widget displays information about an observationt.";
        messageContainer.appendChild(title);
        messageContainer.appendChild(textContainer);
        textContainer.appendChild(text);
    };

    var fillTableInfo = function fillTableInfo(table, data){
        var i;
        var titleNode;
        var valueNode;
        for(i = 0; i < data.length; i++){
            titleNode = table.childNodes[i].childNodes[0];
            valueNode = table.childNodes[i].childNodes[1];
            
            titleNode.innerHTML = data[i].title;
            valueNode.innerHTML = data[i].value;
        }
    };

    var fillMainInfo = function fillMainInfo(){
        var initialMessageContainer = document.getElementById("initialMessageContainer");
        if (initialMessageContainer) {
            this.mainTab.removeChild(initialMessageContainer);
        }
       
        getMainInfo.call(this);
        
        var parentNode =  document.getElementById("mainInfoContainer");
        var table = document.getElementById("mainInfoTable");
        
        if(!table){
            table = createTable.call(this, parentNode, "mainInfoTable", this.mainInfo);
        }

        fillTableInfo.call(this, table, this.mainInfo);
    };

    var fillTreeInfo = function fillTreeInfo(){
        getTreeInfo.call(this);
        
        var parentNode =  document.getElementById("mainInfoContainer");
        var table = document.getElementById("treeInfoTable");

        if(!table){
            table = createTable.call(this, document.getElementById("treeDetailsContainer"), "treeInfoTable", this.treeInfo);
        }
        fillTableInfo.call(this, table, this.treeInfo);
    };

    var fillComments = function fillComments(){
        getComments.call(this);
        
        var parentNode =  document.getElementById("mainInfoContainer");
        var table = document.getElementById("commentsTable");

        if(!table){
            table = createTable.call(this, document.getElementById("commentsContainer"), "commentsTable", this.commentsInfo);
        }
        fillTableInfo.call(this, table, this.commentsInfo);
    };


/******************************************************************************/
/******************************** DATA MODEL **********************************/
/******************************************************************************/

    var getMainInfo = function getMainInfo(){
        this.mainInfo = [];
        var treeId = {};
        var street = {};
        var treeNumber = {};
        var time = {};
        var provider = {};

        treeId.title = "Tree ID";
        treeId.value = this.observation.getIdOoI();
        this.mainInfo.push(treeId);

        street.title = "Street";
        street.value = this.observation.getAddress();
        this.mainInfo.push(street);

        treeNumber.title = "Tree Number";
        treeNumber.value  = this.observation.getLabel();
        this.mainInfo.push(treeNumber);

        time.title = "Observation Date";
        time.value = this.observation.getTime();
        this.mainInfo.push(time);

        provider.title = "Data Provider";
        provider.value = this.observation.getProvider();
        this.mainInfo.push(provider);
    };

    var getTreeInfo = function getTreeInfo(){
        this.treeInfo = [];
        var gpsLocation = {};
        var height = {};
        var crownDiameter = {};
        var specieName = {};
        var plantingYear = {};
        var trunkCircunference = {};

        gpsLocation.title = "GPS Location";
        gpsLocation.value = this.observation.getLat() + ", " +  this.observation.getLng();
        this.treeInfo.push(gpsLocation);

        height.title = "Height";
        height.value = this.observation.getHeight();
        this.treeInfo.push(height);

        crownDiameter.title = "Crown Diameter";
        crownDiameter.value = this.observation.getCrownDiameter();
        this.treeInfo.push(crownDiameter);

        specieName.title = "Species Name";
        specieName.value = this.observation.getSpecies();
        this.treeInfo.push(specieName);

        plantingYear.title = "Planting Year";
        plantingYear.value = this.observation.getPlantingYear();
        this.treeInfo.push(plantingYear);

        trunkCircunference.title = "Trunk Cirumference";
        trunkCircunference.value = this.observation.getTrunkDiameter();
        this.treeInfo.push(trunkCircunference);
    };

    var getComments = function getComments(){
        this.commentsInfo = [];
        var comment = {};
        comment.title = "Description";
        comment.value = this.observation.getImageComment();
        this.commentsInfo.push(comment);
    };

/******************************************************************************/
/******************************** HANDLERS ************************************/
/******************************************************************************/

    var handlerInputObservation = function handlerInputObservation(observationString){
        this.observation = new Observation(JSON.parse(observationString));
        fillMainInfo.call(this);
        fillTreeInfo.call(this);
        fillComments.call(this);
    };

/******************************************************************************/    
    window.ObservationDetails = ObservationDetails;

 })();

var observationDetails = new ObservationDetails();

window.addEventListener("DOMContentLoaded", observationDetails.init.bind(observationDetails), false);
