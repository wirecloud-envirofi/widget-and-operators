/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the observation-report widget.
 *
 *     observation-report is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     observation-report is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with observation-report. If not, see
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
/*global MashupPlatform StyledElements Observation Report*/

(function () {
 
    "use strict";

/******************************************************************************/
/********************************* PUBLIC *************************************/
/******************************************************************************/

    var ObservationReport = function ObservationReport (divName) {
        /* Wirecloud Variables */
        MashupPlatform.wiring.registerCallback("observationInput",  handlerInputObservation.bind(this));

        /* View Variables */
        this.form = {};
        this.divName = divName;
        this.infoBox = null;
        this.observationId = null;
    };
 
    ObservationReport.prototype.init = function init () {
        /* Create InfoBox */
        var div = document.getElementById(this.divName);
        this.infoBox = document.createElement("div");
        this.infoBox.setAttribute("id", "infoBox");
        this.infoBox.setAttribute("class", "alert");
        this.infoBox.textContent = "An observation is needed!";
        if (!div) {
            div = createDiv();
        }
        div.appendChild(this.infoBox);

        /* Create Form */
        var fields = {
            "reportImageQuality": {
                label: "Image Quality",
                type: "select",
                required: true,
                initialEntries:[{
                    label:"Good",
                    value:"Good"
                },{
                    label:"Great",
                    value:"Great"
                },{
                    label:"Poor",
                    value:"Poor"
                }]
            },
            "reportImageType": {
                label: "Image Type",
                type: "select",
                required: true,
                initialEntries:[{
                    label:"Tree",
                    value:"Tree"
                },{
                    label:"Leaf",
                    value:"Leaf"
                },{
                    label:"Fruit",
                    value:"Fruit"
                },{
                    label:"Bark",
                    value:"Bark"
                },{
                    label:"Flower",
                    value:"Flower"
                },{
                    label:"LeafConn",
                    value:"LeafConn"
                },{
                    label:"Other",
                    value:"Other"
                }]

            },
            "reportTreeStatus": {
                label: "Tree Status",
                type: "select",
                required: true,
                initialEntries:[{
                    label:"Living",
                    value:"Living"
                },{
                    label:"Dead Standing",
                    value:"Dead Standing"
                },{
                    label:"Dead Lying",
                    value:"Dead Lying"
                }]
            },
            "reportDamage": {
                label: "Damage",
                type: "select",
                required: true,
                initialEntries:[{
                    label:"None",
                    value:"none"
                },{
                    label:"Treetop Breakage",
                    value:"treetop breakage"
                },{
                    label:"Broken Branches",
                    value:"broken branches"
                }]
            },
            "reportComments": {
                label: "Comments",
                type: "longtext",
                required: true
            },
            "reportBarkBeetle": {
                label: "Bark Beetle",
                type: "boolean",
                required: true
            }
        };
        var options = {
            cancelButton: false
        };
        this.form = new StyledElements.Form(fields, options);
        this.form.addEventListener("submit", handlerSubmitForm.bind(this));
        // createCleanButton.call(this);
        this.form.insertInto(div);
    };


/******************************************************************************/
/******************************** PRIVATE *************************************/
/******************************************************************************/

    var handlerInputObservation = function handlerInputObservation (observationString) {
        this.infoBox.setAttribute("class", "alert alert-error");
        this.infoBox.textContent = "ERROR: Invalid input!";
        if (observationString) {
            var observation = new Observation(JSON.parse(observationString));
            if (observation) {
                var obsId = observation.getId();
                this.observation = observation;
                this.infoBox.setAttribute("class", "alert alert-info");
                this.infoBox.textContent = "Add a report to observation: " + obsId;
                setValueFields.call(this, observation);
            }
        }
    };

    var handlerSubmitForm = function handlerSubmitForm (context, data) {
        this.observation.setReportImageQuality(data.reportImageQuality);
        this.observation.setReportImageType(data.reportImageType);
        this.observation.setReportTreeStatus(data.reportTreeStatus);
        this.observation.setReportDamage(data.reportDamage);
        this.observation.setReportComments(data.reportComments);
        this.observation.setReportBarkBeetle(data.reportBarkBeetle);
        this.observation.setReportProvider(MashupPlatform.context.get('username'));
        var now = new Date();
        this.observation.setReportTime(now.toISOString());

        MashupPlatform.wiring.pushEvent("observationReportOutput", this.observation.toString());
        
        this.infoBox.setAttribute("class", "alert alert-success");
        this.infoBox.textContent = "The report has been sent!";
    };

    var createDiv = function createDiv () {
        var form = document.createElement('div');
        document.body.appendChild(form);

        return form;
    };

    // var createCleanButton = function createCleanButton () {
    //     var button = document.createElement("button");
    //     
    //     button.setAttribute("type", "button");
    //     button.textContent = "Clean";
    //     
    //     button.addEventListener("click", function(){
    //         this.form.reset();
    //     }.bind(this));

    //     this.form.appendChild(button);
    // };

    var setValueFields = function setValueFields (observation) {

        if (observation.isReported) {
            var data = {
                "reportImageQuality": observation.getReportImageQuality(),
                "reportImageType": observation.getReportImageType(),
                "reportTreeStatus": observation.getReportTreeStatus(),
                "reportDamage": observation.getReportDamage(),
                "reportComments": observation.getReportComments(),
                "reportBarkBeetle": observation.getReportBarkBeetle()
            };
            this.form.setData(data);
        }
    };

    window.ObservationReport = ObservationReport;

 })();

var observationReport = new ObservationReport('form');

window.addEventListener("DOMContentLoaded", observationReport.init.bind(observationReport), false);
