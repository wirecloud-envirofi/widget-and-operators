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
/*global MashupPlatform StyledElements*/

(function(){

    "use strict";

    /******************************************************************************/
    /********************************* PUBLIC *************************************/
    /******************************************************************************/

    var Observation = function Observation (observation) {
        if (!observation) {
            throw new TypeError("Observation is needed");
        }

        this.entityList = ['id', 'type'];
        this.attributeList = ['time', 'provider', 'imageType', 'imageComment',
                'idOoI', 'imageFile', 'imageURL','longitude', 'latitude',
                'address', 'label', 'species', 'commonName', 'height',
                'crownDiameter', 'trunkDiameter', 'plantingYear',
                'reportTime', 'reportProvider', 'reportImageType', 'reportImageQuality',
                'reportComment', 'reportTreeStatus', 'reportBarkbeetle', 'reportDamage'];

        this.observation = {
            "entity": {},
            "attributes": {}
        };
        
        createObservation.call(this, observation);
        this.reported = isReported.call(this);
    };

    /* GET Methods */
    Observation.prototype.getId = function getId () {
        return this.observation.entity.id;
    };

    Observation.prototype.getType = function getType () {
        return this.observation.entity.type;
    };

    Observation.prototype.getTime = function getTime () {
        return this.observation.attributes.time;
    };
    
    Observation.prototype.getProvider = function getProvider () {
        return this.observation.attributes.provider;
    };
    
    Observation.prototype.getImageType = function getImageType () {
        return this.observation.attributes.imageType;
    };

    Observation.prototype.getImageComment = function getImageComment () {
        return this.observation.attributes.imageComment;
    };

    Observation.prototype.getIdOoI = function getIdOoI () {
        return this.observation.attributes.idOoI;
    };

    Observation.prototype.getImageFile = function getImageFile () {
        return this.observation.attributes.imageFile;
    };
    
    Observation.prototype.getImageURL = function getImageURL () {
        return this.observation.attributes.imageURL;
    };

    Observation.prototype.getLat = function getLat () {
        return this.observation.attributes.latitude;
    };

    Observation.prototype.getLng = function getLng () {
        return this.observation.attributes.longitude;
    };

    Observation.prototype.getAddress = function getAddress (){
        return this.observation.attributes.address;
    };
    
    Observation.prototype.getLabel = function getLabel (){
        return this.observation.attributes.label;
    };
    
    Observation.prototype.getSpecies = function getSpecies (){
        return this.observation.attributes.species;
    };
    
    Observation.prototype.getCommonName = function getCommonName (){
        return this.observation.attributes.commonName ;
    };
    
    Observation.prototype.getHeight = function getHeight (){
        return this.observation.attributes.height;
    };
    
    Observation.prototype.getCrownDiameter = function getCrownDiameter (){
        return this.observation.attributes.crownDiameter;
    };
   
    Observation.prototype.getTrunkDiameter = function getTrunkDiameter (){
        return this.observation.attributes.trunkDiameter;
    };
   
    Observation.prototype.getPlantingYear = function getPlantingYear (){
        return this.observation.attributes.plantingYear;
    };
   
    Observation.prototype.getAttributeNames = function getAttributeNames () {
        return this.attributeList;
    };

    Observation.prototype.getAttributes = function getAttributes () {
        return this.observation.attributes;
    };

    Observation.prototype.getEntity = function getEntity () {
        return this.observation.entity;
    };

    /* Get report methods */
    Observation.prototype.getReportTime = function getReportTime (dateTime) {
        return this.observation.attributes.reportTime;
    };

    Observation.prototype.getReportProvider = function getReportProvider (provider) {
        return this.observation.attributes.reportProvider;
    };

    Observation.prototype.getReportImageType = function getReportImageType (type) {
        return this.observation.attributes.reportImageType;
    };

    Observation.prototype.getReportImageQuality = function getReportImageQuality (quality) {
        return this.observation.attributes.reportImageQuality;
    };

    Observation.prototype.getReportComments = function getReportComments (comment) {
        return this.observation.attributes.reportComment;
    };

    Observation.prototype.getReportTreeStatus = function getReportTreeStatus (treeStatus) {
        return this.observation.attributes.reportTreeStatus;
    };

    Observation.prototype.getReportBarkBeetle = function getReportBarkBeetle (barkBeetle) {
        return this.observation.attributes.reportBarkBeetle;
    };

    Observation.prototype.getReportDamage = function getReportDamage (damage) {
        return this.observation.attributes.reportDamage;
    };

    /* Other get methods */
    Observation.prototype.getObservation = function getObservation () {
        var observation = {};
        for (var key in this.observation) {
            var attr = this.observation[key];
            observation[key] = {};
            for (var key2 in attr) {
                if (attr[key2]) {
                    observation[key][key2] = attr[key2];
                }
            }
        }

        return observation;
    };

    /* SET Methods */
    Observation.prototype.setId = function setId (id){
        this.observation.entity.id = id ;     
    };

    Observation.prototype.setType = function setType (type){
        this.observation.entity.type = type;     
    };

    Observation.prototype.setTime = function setTime (time){
        this.observation.attributes.time = time;     
    };

    Observation.prototype.setProvider = function setProvider (provider){
        this.observation.attributes.provider = provider ;     
    };

    Observation.prototype.setImageType  = function setImageType (imageType){
        this.observation.attributes.imageType = imageType;     
    };
    
    Observation.prototype.setImageComment  = function setImageComment (imageComment){
        this.observation.attributes.imageComment = imageComment;     
    };
    
    Observation.prototype.setIdOoI  = function setIdOoI (idOoI){
        this.observation.attributes.idOoI = idOoI;     
    };
    
    Observation.prototype.setImageFile = function setImageFile (imageFile){
        this.observation.attributes.imageFile = imageFile;     
    };
    
    Observation.prototype.setImageURL = function setImageURL (imageURL){
        this.observation.attributes.imageURL = imageURL;     
    };
    
    Observation.prototype.setLat = function setLat (latitude){
        this.observation.attributes.latitude = latitude;     
    };
    
    Observation.prototype.setLng = function setLng (longitude){
        this.observation.attributes.longitude = longitude;     
    };
 
    Observation.prototype.setAddress = function setAddress (address){
        this.observation.attributes.address = address;     
    };
 
    Observation.prototype.setLabel = function setLabel (label){
        this.observation.attributes.label = label;     
    };
   
    Observation.prototype.setSpecies = function setSpecies (species){
        this.observation.attributes.species = species;     
    };
    
    Observation.prototype.setCommonName = function setCommonName (commonName){
        this.observation.attributes.commonName = commonName;     
    };
    
    Observation.prototype.setHeight = function setHeight (height){
        this.observation.attributes.height = height;     
    };
    
    Observation.prototype.setCrownDiameter = function setCrownDiameter (crownDiameter){
        this.observation.attributes.crownDiameter = crownDiameter;     
    };
    
    Observation.prototype.setTrunkDiameter = function setTrunkDiameter (trunkDiameter){
        this.observation.attributes.trunkDiameter = trunkDiameter;     
    };

    Observation.prototype.setPlantingYear = function setPlantingYear (plantingYear){
        this.observation.attributes.plantingYear = plantingYear;     
    };

    /* Set report methods */
    Observation.prototype.setReportTime = function setReportTime (dateTime) {
        this.observation.attributes.reportTime = dateTime;
    };

    Observation.prototype.setReportProvider = function setReportProvider (provider) {
        this.observation.attributes.reportProvider = provider;
    };

    Observation.prototype.setReportImageType = function setReportImageType (type) {
        this.observation.attributes.reportImageType = type;
    };

    Observation.prototype.setReportImageQuality = function setReportImageQuality (quality) {
        this.observation.attributes.reportImageQuality = quality;
    };

    Observation.prototype.setReportComments = function setReportComments (comment) {
        this.observation.attributes.reportComment = comment;
    };

    Observation.prototype.setReportTreeStatus = function setReportTreeStatus (treeStatus) {
        this.observation.attributes.reportTreeStatus = treeStatus;
    };

    Observation.prototype.setReportBarkBeetle = function setBarkBeetle (barkBeetle) {
        this.observation.attributes.reportBarkBeetle = barkBeetle;
    };

    Observation.prototype.setReportDamage = function setDamage(damage) {
        this.observation.attributes.reportDamage = damage;
    };

    /* Report */
    Observation.prototype.isReported = function isReported () {
        return this.reported;
    };

    /* Output methods */
    Observation.prototype.toJson= function toJson () {
        return observation2Json.call(this);
    };

    Observation.prototype.toString = function toString () {
        var observation = observation2Json.call(this);

        return JSON.stringify(observation);
    };

/******************************************************************************/
/********************************* PRIVATE ************************************/
/******************************************************************************/

    var createObservation = function createObservation (originalObservation) {
        var attr;

        if (originalObservation.hasOwnProperty('entity') && originalObservation.hasOwnProperty('attributes')) {
            for (var i = 0; i < this.entityList.length; i++) {
                attr = this.entityList[i];
                if (this.entityList.indexOf(attr) > -1) {
                    this.observation.entity[attr] = originalObservation.entity[attr];
                }
            }

            for (var j = 0; j < this.attributeList.length; j++) {
                attr = this.attributeList[j];
                if (this.attributeList.indexOf(attr) > -1) {
                    this.observation.attributes[attr] = originalObservation.attributes[attr];
                }
            }
        } else {
            for (var key in originalObservation) {
                if (key === 'id' || key === 'type') {
                    this.observation.entity[key] = originalObservation[key];
                } else {
                    this.observation.attributes[key] = fixEmptyContent(originalObservation[key]);
                }
            }
        }

    };

    var observation2Json = function observation2Json () {
        var observation = {};
        var attr = "";

        for (var i = 0; i < this.entityList.length; i++) {
            attr = this.entityList[i];
            if (this.observation.entity[attr]) {
                observation[attr] = this.observation.entity[attr];
            }
        }

        for (var j = 0; j < this.attributeList.length; j++) {
            attr = this.attributeList[j];
            if (this.observation.attributes[attr]) {
                observation[attr] = this.observation.attributes[attr];
            }
        }
        return observation;
    };

    var isReported = function isReported () {
        return Boolean(this.observation.attributes.reportTime);
    };

    var fixEmptyContent = function fixEmptyContent (value) {
        if (value === "emptycontent") {
            return "";
        }
        return value;
    };

    window.Observation = Observation;

 })();
