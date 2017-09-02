let contentGlobal = undefined;
let settingsElement = undefined;
let cache = {};

// FORMATTING
function formatTime(long) {
    return moment(long).format('YYYY-MM-DD, HH:mm:ss:SSS');
}

function isUrlValid(url) {
    const re = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\.(?:[a-z\\u00a1-\\uffff]{2,})).?)(?::\d{2,5})?(?:[\/?#]\S*)?$/;
    return re.test(url);
}

// SETTINGS
function getElementsSettings() {
    return {
        detailsTarget: $('#menu-details-extra'),
        eventChainTarget: $('#menu-eventChain-extra'),

        cacheKeepTime: $('#cacheKeepTime'),

        upStream: $('#upStream'),
        downStream: $('#downStream'),
        steps: $('#steps'),
        maxConnections: $('#maxConnections'),
        relativeXAxis: $('#relativeXAxis'),

        system: $('#systemSelect'),
        systems: $('#systemsSettings'),
    };
}

function setSettingsDefault(settingsElement) {
    settingsElement.cacheKeepTime.val(86400000);

    settingsElement.upStream.prop('checked', true).change();
    settingsElement.downStream.prop('checked', true).change();
    settingsElement.steps.val(5);
    settingsElement.maxConnections.val(16);
    settingsElement.relativeXAxis.prop('checked', false).change();

    settingsElement.systems.html('');

    settingsElement.system.selectpicker('val', undefined);
}

function getCurrentSettings() {
    let systemCount = settingsElement.systems.find('.panel').length;
    let systems = {};
    for (let i = 0; i < systemCount; i++) {
        systems[$('#systemName\\[' + i + '\\]').val()] = $('#systemUrl\\[' + i + '\\]').val()
    }
    return {
        systems: systems,

        system: {
            name: settingsElement.system.val(),
            url: systems[settingsElement.system.val()],
        },
        general: {
            timeStoreCache: parseInt(settingsElement.cacheKeepTime.val()),
        },
        aggregation: {},
        details: {
            target: settingsElement.detailsTarget.html(),
        },
        eventChain: {
            target: settingsElement.eventChainTarget.html(),
            steps: settingsElement.steps.val(),
            maxConnections: settingsElement.maxConnections.val(),
            upStream: settingsElement.upStream.prop('checked'),
            downStream: settingsElement.downStream.prop('checked'),
            relativeXAxis: settingsElement.relativeXAxis.prop('checked'),
            bannedLinks: [
                "PREVIOUS_VERSION",
            ]
        },
        live: {}
    };
}

function updateSystemSelector() {
    settingsElement.system.html('');
    let settings = getCurrentSettings();
    for (let key in settings.systems) {
        settingsElement.system.append('<option>' + key + '</option>');
    }
    settingsElement.system.selectpicker('refresh');
}


function resetSelections() {
    settingsElement.eventChainTarget.html("");
    settingsElement.detailsTarget.html("");
}

function newSystem(name, url) {
    if (name === undefined) {
        name = '';
    }
    if (url === undefined) {
        url = '';
    }
    let count = _.size(getCurrentSettings().systems);
    settingsElement.systems.append(
        '<div class="panel panel-default">' +
        '<div class="input-group">' +
        '<span class="input-group-addon">Name</span>' +

        '<input id="systemName[' + count + ']"  class="form-control" ' +

        'placeholder="My system" value="' + name + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">URL</span>' +
        '<input id="systemUrl[' + count + ']"  class="form-control systemsUrlInput" ' +

        'placeholder="http://localhost:8081/events.json" value="' + url + '"/>' +
        '</div>' +
        '</div>'
    );
    $('#systemsSettings').find('input').change(function () {
        updateSystemSelector();
    });
    updateSystemSelector();
}

// CACHE
function usableCache(cacheName, value, timeValid) {
    return cache[cacheName] !== undefined && cache[cacheName].time + timeValid > Date.now() && cache[cacheName].value === value;
}

function storeCache(cacheName, value) {
    cache[cacheName] = {
        value: value,
        time: Date.now()
    };
    console.log('Stored cache for ' + cacheName);
}

function invalidateCache(cacheName) {
    if (cacheName === undefined) {
        cache = {};

        console.log('Invalidated all cache')
    } else {
        cache[cacheName] = undefined;
        console.log('Invalidated cache for ' + cacheName)

    }
}

// RENDERING
function getContentElements() {
    return {
        cyAggregation: $('#aggregation'),
        datatableDetails: undefined,
        datatableDetailsContainer: $('#details_table_table'),
        detailsTable: $('#details_table'),
        detailsPlot: $('#details_plot_container'),
        cyEventChain: $('#event_chain'),
        loader: $('#loader_overlay'),
        detailsToggle: $('#details_toggle'),
        alertModal: $('#alertModal'),
        alertModalContent: $('#alertModalContent'),
        containers: {
            aggregation: $('#aggregation_wrapper'),
            details: $('#details'),
            eventChain: $('#event_chain_wrapper'),
            live: $('#live_wrapper'),
            settings: $('#settings'),
            help: $('#help'),
        },
        menu: {
            aggregation: $('#menu_aggregation'),
            details: $('#menu_details'),
            detailsToggle: $('#menu_details_toggle'),
            eventChain: $('#menu_eventChain'),
            live: $('#menu_live'),
        }
    }
        ;
}

function disableMenuLevel(level) {

    contentGlobal.menu.aggregation.addClass('disabled');
    contentGlobal.menu.details.addClass('disabled');
    contentGlobal.menu.eventChain.addClass('disabled');
    contentGlobal.menu.live.addClass('disabled');
    switch (level) {
        case 4:
            contentGlobal.menu.live.removeClass('disabled');
        case 3:
            contentGlobal.menu.eventChain.removeClass('disabled');
        case 2:
            contentGlobal.menu.details.removeClass('disabled');
        case 1:
            contentGlobal.menu.aggregation.removeClass('disabled');
        default:
            break;
    }
}

function setMenuActive(settings) {
    if (settings.system.url === undefined) {
        disableMenuLevel(0);
    } else if (settings.details.target === '') {
        disableMenuLevel(1);
    } else if (settings.eventChain.target === '') {
        disableMenuLevel(2);
    } else {
        disableMenuLevel(3);
    }
}

function showModal(content) {
    contentGlobal.alertModalContent.html(content);
    contentGlobal.alertModal.modal('show');
}

/**
 * this function fills the external legend with content using the getLegend() function.
 */
function populateExternalLegend(groups, graph2d) {
    let groupsData = groups.get();
    let legendDiv = document.getElementById("details_plot_legend");
    legendDiv.innerHTML = "";

    let legendContainer = $('#details_plot_legend');

    console.log(groupsData);

    // get for all groups:
    for (let i = 0; i < groupsData.length; i++) {

        // let container = $('<div class="legend-toggle-container"></div>');
        let container = $('<div class="col col-lg-3 legend-toggle-container"></div>');

        // get the legend for this group.
        let legend = graph2d.getLegend(groupsData[i].id, 30, 30);
        console.log(legend);

        // append class to icon. All styling classes from the vis.css/vis-timeline-graph2d.min.css have been copied over into the head here to be able to style the
        // icons with the same classes if they are using the default ones.
        legend.icon.setAttributeNS(null, "class", "legend-icon");

        // iconDiv.append(legend.icon);
        // legendContainer.append(iconDiv);

        // let label = $('<label id="legend-toggle-label-' + i + '" class="checkbox-inline"></label>');
        let inputToggle = $('<input id="legend-toggle-' + i + '" checked="checked" type="checkbox" data-toggle="toggle" data-on="On" data-off="Off" data-onstyle="default" data-offstyle="default">');
        container.append(inputToggle);
        container.append(legend.icon);
        container.append(legend.label);

        legendContainer.append(container);

        let toggle = $('#legend-toggle-' + i);
        toggle.bootstrapToggle();

        toggle.change(function () {
            // _.defer(function () {

            console.log(i + ' ' + $(this).prop('checked'));
            groups.update({id: i, visible: $(this).prop('checked')});

            // });
        });
    }
}

function load(stage) {
    let settings = getCurrentSettings();

    contentGlobal.loader.show();
    // $("#side-menu").find("a").removeClass("active");
    // $('#menu_' + stage).addClass('active');

    let systemUrl = settings.system.url;

    setMenuActive(settings);
    contentGlobal.menu.detailsToggle.hide();
    _.defer(function () {
        for (let container in contentGlobal.containers) {
            contentGlobal.containers[container].hide();
        }

        if (stage === 'aggregation') {
            contentGlobal.containers.aggregation.show();
            if (usableCache('aggregation', systemUrl, settings.general.timeStoreCache) === true) {
                console.log('Using cache for system ' + systemUrl);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/aggregationGraph',
                        data: JSON.stringify(settings),
                        success: function (data) {
                            renderCytoscape(contentGlobal.cyAggregation, data, settings, undefined);
                            storeCache('aggregation', systemUrl);
                        },
                        complete: function () {
                            contentGlobal.loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'details') {
            contentGlobal.menu.detailsToggle.show();
            contentGlobal.containers.details.show();

            let detailsTarget = settings.details.target;

            // Table
            if (contentGlobal.detailsToggle.prop('checked')) {
                contentGlobal.detailsTable.show();
                contentGlobal.detailsPlot.hide();

                if (usableCache('detailsTable', systemUrl + detailsTarget, settings.general.timeStoreCache)) {
                    console.log('Using cache for ' + detailsTarget + ' from system ' + systemUrl);
                    contentGlobal.loader.hide();
                } else {
                    _.defer(function () {
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: "/api/detailedEvents?name=" + detailsTarget,
                            data: JSON.stringify(settings),
                            success: function (data) {
                                if (contentGlobal.datatableDetails !== undefined) {
                                    contentGlobal.datatableDetails.destroy();
                                    contentGlobal.datatableDetailsContainer.empty();
                                }
                                if (data.data.length !== 0) {

                                    let preDefColumns = [
                                        {
                                            title: 'Chain',
                                            data: null,
                                            defaultContent: '<button class="btn btn-default btn-xs row-button">Graph</button>'
                                        }
                                    ];
                                    contentGlobal.datatableDetails = datatable = contentGlobal.datatableDetailsContainer.DataTable({
                                        destroy: true,
                                        data: data.data,
                                        columns: preDefColumns.concat(data.columns),
                                        scrollY: '80vh',
                                        scrollCollapse: true,
                                        lengthMenu: [[20, 200, -1], [20, 200, "All"]],
                                        order: [4, 'asc'],

                                    });

                                    contentGlobal.datatableDetailsContainer.find('tbody').on('click', 'button', function () {
                                        let data = contentGlobal.datatableDetails.row($(this).parents('tr')).data();

                                        settingsElement.eventChainTarget.html(data.id);

                                        load("eventChain");
                                    });

                                    storeCache('detailsTable', systemUrl + detailsTarget);
                                } else {
                                    console.log("No data");
                                }
                            },
                            complete: function () {
                                contentGlobal.loader.hide();
                            }
                        });
                    });
                }

            } else { // Plot
                contentGlobal.detailsTable.hide();
                contentGlobal.detailsPlot.show();

                if (usableCache('detailsPlot', systemUrl + detailsTarget, settings.general.timeStoreCache)) {
                    console.log('Using cache for ' + detailsTarget + ' from system ' + systemUrl);
                    contentGlobal.loader.hide();
                } else {
                    _.defer(function () {
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: "/api/detailedPlot?name=" + detailsTarget,
                            data: JSON.stringify(settings),
                            success: function (data) {
                                console.log(data);
                                if (data !== undefined && data.items.length !== 0) {
                                    let groups = new vis.DataSet();

                                    groups.add({
                                        id: 0,
                                        content: 'Execution time (ms)',
                                        className: 'vis-graph-result',
                                        options: {
                                            drawPoints: {
                                                styles: 'stroke:black;fill:black;',
                                                size: 2,
                                            },
                                            interpolation: true,
                                        },
                                    });

                                    groups.add({
                                        id: 1,
                                        content: "Inconclusive",
                                        className: 'vis-graph-inconclusive',
                                        options: {
                                            drawPoints: false,
                                            shaded: {
                                                orientation: 'zero',
                                            }
                                        }
                                    });
                                    groups.add({
                                        id: 2,
                                        content: "Success",
                                        className: 'vis-graph-success',
                                        options: {
                                            drawPoints: false,
                                            shaded: {
                                                orientation: 'zero',
                                            }
                                        }
                                    });
                                    groups.add({
                                        id: 3,
                                        content: "Fail",
                                        className: 'vis-graph-fail',
                                        options: {
                                            drawPoints: false,
                                            shaded: {
                                                orientation: 'zero',
                                            }
                                        }
                                    });


                                    let dataset = new vis.DataSet(data.items);
                                    let options = {
                                        sort: false,
                                        interpolation: false,
                                        graphHeight: '600px',
                                        // legend: true,
                                        dataAxis: {
                                            left: {
                                                // format: function (value) {
                                                //     if (Math.floor(value) === value) {
                                                //         return value;
                                                //     }
                                                //     return '';
                                                // },
                                                range: {
                                                    // max: (data.valueMax * 1.25),
                                                    min: 0,
                                                }
                                            }
                                        },
                                        // TODO: settings for default start
                                        start: data.timeLast - 345600000,
                                        end: data.timeLast,
                                    };

                                    console.log(groups);
                                    console.log(dataset);
                                    console.log(options);
                                    document.getElementById('details_plot').innerHTML = '';
                                    let plot = new vis.Graph2d(document.getElementById('details_plot'), dataset, groups, options);

                                    populateExternalLegend(groups, plot);


                                    storeCache('detailsPlot', systemUrl + detailsTarget);
                                } else {
                                    console.log("No data");
                                }
                            },
                            complete: function () {
                                contentGlobal.loader.hide();
                            }
                        });
                    });
                }
            }


        } else if (stage === 'eventChain') {
            contentGlobal.containers.eventChain.show();
            let eventTarget = settings.eventChain.target;
            if (usableCache('eventChain', systemUrl + eventTarget, settings.general.timeStoreCache)) {
                console.log('Using cache for ' + eventTarget + ' from system ' + systemUrl);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/eventChainGraph?id=' + eventTarget,
                        data: JSON.stringify(settings),
                        success: function (data) {
                            renderCytoscape(contentGlobal.cyEventChain, data.elements, settings, eventTarget);
                            storeCache('eventChain', systemUrl + eventTarget);
                        },
                        complete: function () {
                            contentGlobal.loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'live') {
            contentGlobal.containers.live.show();
            contentGlobal.loader.hide();
        } else if (stage === 'settings') {
            contentGlobal.containers.settings.show();
            contentGlobal.loader.hide();
        } else if (stage === 'help') {
            contentGlobal.containers.help.show();
            contentGlobal.loader.hide();
        } else {
            console.log("Error in mode switch: " + stage);
        }
    });
}

function newDetailsTarget(target,) {
    settingsElement.detailsTarget.html(target);

    load("details");
}

function renderCytoscape(container, data, settings, target) {
    const COLOR_PASS = '#22b14c';
    const COLOR_FAIL = '#af0020';
    const COLOR_UNDEFINED = '#666';

    let style = [
        {
            selector: 'node',
            style: {
                'background-color': COLOR_UNDEFINED,
                'border-color': '#000',
                'border-width': '1px',
                'border-style': 'solid',
                'label': 'data(label)',
                'font-size': "16"
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                // 'line-color': '#ccc',
                'curve-style': 'bezier', // To make sure edge arrows are supported
                // 'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'label': 'data(type)',
                'text-rotation': 'autorotate',
                'font-size': "8"
            }
        },

        // Specific style
        {
            selector: 'node[type ^= "Activity"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '-0.95 -0.77 -0.9 -0.82 -0.85 -0.87 -0.8 -0.91 -0.74 -0.94 -0.68 -0.97 -0.62 -0.98 -0.56 -1 -0.5 -1 -0.44 -1 -0.38 -0.98 -0.32 -0.97 -0.26 -0.94 -0.2 -0.91 -0.15 -0.87 -0.1 -0.82 -0.05 -0.77 0.05 -0.67 0.1 -0.62 0.15 -0.57 0.2 -0.53 0.26 -0.5 0.32 -0.47 0.38 -0.46 0.44 -0.44 0.5 -0.44 0.56 -0.44 0.62 -0.46 0.68 -0.47 0.74 -0.5 0.8 -0.53 0.85 -0.57 0.9 -0.62 0.95 -0.67 0.95 0.77 0.9 0.82 0.85 0.87 0.8 0.91 0.74 0.94 0.68 0.97 0.62 0.98 0.56 1 0.5 1 0.44 1 0.38 0.98 0.32 0.97 0.26 0.94 0.2 0.91 0.15 0.87 0.1 0.82 0.05 0.77 -0.05 0.67 -0.1 0.62 -0.15 0.57 -0.2 0.53 -0.26 0.5 -0.32 0.47 -0.38 0.46 -0.44 0.44 -0.5 0.44 -0.56 0.44 -0.62 0.46 -0.68 0.47 -0.74 0.5 -0.8 0.53 -0.85 0.57 -0.9 0.62 -0.95 0.67',
                'height': 60,
                'width': 100,
                'background-color': COLOR_FAIL,
                'background-position-x': '0px',
                'background-image': '/images/green.png',
                'background-height': '100%',
                'background-width': function (ele) {
                    if (ele.data().quantities.SUCCESSFUL === undefined) {
                        ele.data().quantities.SUCCESSFUL = 0;
                    }
                    return (ele.data().quantities.SUCCESSFUL * 100 / ele.data().quantity).toString() + '%';
                }
            }
        },
        {
            selector: 'node[type ^= "EiffelAnnouncementPublishedEvent"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '-0.1 0.99 -0.27 0.96 -0.43 0.9 -0.58 0.81 -0.72 0.7 -0.83 0.56 -0.91 0.41 -0.97 0.25 -1 0.07 -0.99 -0.1 -0.96 -0.27 -0.9 -0.43 -0.81 -0.58 -0.7 -0.72 -0.56 -0.83 -0.41 -0.91 -0.25 -0.97 -0.07 -1 0.1 -0.99 0.27 -0.96 0.43 -0.9 0.58 -0.81 0.72 -0.7 0.83 -0.56 0.91 -0.41 0.97 -0.25 1 -0.07 1 0 0.98 0.17 0.94 0.34 0.87 0.5 0.77 0.64 0.64 0.77 0.5 0.87 0.34 0.94 0.17 0.98 0 1 -0.33 0.07 0.51 0.16 0.45 0.1 0.4 0.05 0.29 -0.16 0.22 -0.3 0.19 -0.42 0.17 -0.5 0.16 -0.6 0.17 -0.7 0.18 -0.78 0.26 -0.7 0.3 -0.66 0.35 -0.6 0.41 -0.5 0.47 -0.4 0.49 -0.3 0.52 -0.2 0.53 -0.1 0.54 0 0.52 0.1 0.51 0.16 0.45 0.1 0.4 0.05 0.29 -0.16 0.22 -0.3 0.19 -0.42 0.17 -0.5 0.16 -0.6 0.17 -0.7 0.18 -0.78 -0.46 -0.09 -0.61 -0.05 -0.57 0.13 -0.41 0.09',
                'height': 90,
                'width': 90,
            }
        },
        {
            selector: 'node[type ^= "EiffelArtifact"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '1 -0.4 0 -0.8 -1 -0.4 0 0 1 -0.4 1 0.6 0 1 0 0 0 1 -1 0.6 -1 -0.4 0 0 1 -0.4',
                'height': 60,
                'width': 50,
            }
        },
        {
            selector: 'node[type ^= "EiffelArtifactCreatedEvent"]',
            style: {
                'background-color': '#557e62',
            }
        },
        {
            selector: 'node[type ^= "EiffelArtifactPublishedEvent"]',
            style: {
                'background-color': '#5a617e',
            }
        },
        {
            selector: 'node[type ^= "EiffelArtifactReusedEvent"]',
            style: {
                'background-color': '#7e5344',
            }
        },
        {
            selector: 'node[type ^= "EiffelCompositionDefinedEvent"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '1 0 1 0.6 0.5 0.8 0 0.6 -0.5 0.8 -1 0.6 -1 0 -0.5 -0.2 -0.5 -0.8 0 -1 0.5 -0.8 0.5 -0.2 1 0  0.5 0.2 0.5 0.8 0.5 0.2 0 0 0 0.6 0 0 -0.5 0.2 -0.5 0.8 -0.5 0.2 -1 0 -0.5 -0.2 0 0 0.5 -0.2 0 0 0 -0.6 -0.5 -0.8 0 -0.6 0.5 -0.8 0.5 -0.2 1 0',
                'height': 70,
                'width': 70,
            }
        },
        {
            selector: 'node[type ^= "EiffelConfidenceLevelModifiedEvent"]',
            style: {
                'background-color': '#fff',
                'width': '70px',
                'height': '70x',
                'pie-size': '100%',
                'pie-1-background-size': function (ele) {
                    /** @namespace ele.data().quantities.SUCCESS */
                    let value = (ele.data().quantities.SUCCESS);
                    if (value === undefined) {
                        value = 0;
                    }
                    return (value * 100 / ele.data().quantity).toString() + '%';
                },
                'pie-1-background-color': COLOR_PASS,
                'pie-2-background-size': function (ele) {
                    /** @namespace ele.data().quantities.FAILURE */
                    let value = (ele.data().quantities.FAILURE);
                    if (value === undefined) {
                        value = 0;
                    }
                    return (value * 100 / ele.data().quantity).toString() + '%';
                },
                'pie-2-background-color': COLOR_FAIL,
                'pie-3-background-size': function (ele) {
                    /** @namespace ele.data().quantities.INCONCLUSIVE */
                    let value = (ele.data().quantities.INCONCLUSIVE);
                    if (value === undefined) {
                        value = 0;
                    }
                    return (value * 100 / ele.data().quantity).toString() + '%';
                },
                'pie-3-background-color': COLOR_UNDEFINED
            }
        },
        {
            selector: 'node[type ^= "EiffelEnvironmentDefinedEvent"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '1 0 0.97 -0.26 0.87 -0.5 0.71 -0.71 0.5 -0.87 0.26 -0.97 ' +
                '0 -1 -0.26 -0.97 -0.5 -0.87 -0.71 -0.71 -0.87 -0.5 -0.6 -0.6 0 -0.7 0.6 -0.6 0.87 -0.5 0.6 -0.6 0 -0.7 -0.6 -0.6 -0.87 -0.5 -0.97 -0.26 ' +
                '-1 0 1 0 -1 0 -0.97 0.26 -0.87 0.5 -0.6 0.6 0 0.7 0.6 0.6 0.87 0.5 0.6 0.6 0 0.7 -0.6 0.6 -0.87 0.5 -0.71 0.71 -0.5 0.87 -0.6 0.6 -0.7 0 -0.6 -0.6 -0.5 -0.87 -0.6 -0.6 -0.7 0 -0.6 0.6 -0.5 0.87 -0.26 0.97 ' +
                '0 1 0 -1 0 1 0.26 0.97 0.5 0.87 0.6 0.6 0.7 0 0.6 -0.6 0.5 -0.87 0.6 -0.6 0.7 0 0.6 0.6 0.5 0.87 0.71 0.71 0.87 0.5 0.97 0.26 1 0',
                'height': 50,
                'width': 50,
                'border-width': '2px',
            }
        },
        {
            selector: 'node[type ^= "EiffelSourceChangeCreatedEvent"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '-0.33 -0.8 -0.35 -0.81 -0.37 -0.83 -0.39 -0.85 -0.4 -0.87 -0.4 -0.9 -0.4 -0.93 -0.39 -0.95 -0.37 -0.97 -0.35 -0.99 -0.33 -1 -0.3 -1 -0.27 -1 -0.25 -0.99 -0.23 -0.97 -0.21 -0.95 -0.2 -0.93 -0.2 -0.9 -0.2 -0.9 -0.2 -0.87 -0.21 -0.85 -0.23 -0.83 -0.25 -0.81 -0.27 -0.8 -0.27 -0.64 0.25 -0.09 0.27 -0.1 0.3 -0.1 0.33 -0.1 0.35 -0.09 0.37 -0.07 0.39 -0.05 0.4 -0.03 0.4 0 0.4 0 0.4 0.03 0.39 0.05 0.37 0.07 0.35 0.09 0.33 0.1 0.3 0.1 0.27 0.1 0.25 0.09 0.23 0.07 0.21 0.05 0.2 0.03 0.2 0 -0.27 -0.5 -0.27 0.5 -0.12 0.5 -0.3 0.7 -0.48 0.5 -0.33 0.5',
                'height': 70,
                'width': 70,
            }
        },
        {
            selector: 'node[type ^= "EiffelSourceChangeSubmittedEvent"]',
            style: {
                'shape': 'polygon',
                'shape-polygon-points': '-0.33 -0.8 -0.35 -0.81 -0.37 -0.83 -0.39 -0.85 -0.4 -0.87 -0.4 -0.9 -0.4 -0.93 -0.39 -0.95 -0.37 -0.97 -0.35 -0.99 -0.33 -1 -0.3 -1 -0.27 -1 -0.25 -0.99 -0.23 -0.97 -0.21 -0.95 -0.2 -0.93 -0.2 -0.9 -0.2 -0.9 -0.2 -0.87 -0.21 -0.85 -0.23 -0.83 -0.25 -0.81 -0.27 -0.8 -0.27 -0.64 0.25 -0.09 0.27 -0.1 0.3 -0.1 0.33 -0.1 0.35 -0.09 0.37 -0.07 0.39 -0.05 0.4 -0.03 0.4 0 0.4 0 0.4 0.03 0.39 0.05 0.37 0.07 0.35 0.09 0.33 0.1 0.3 0.1 0.27 0.1 0.25 0.09 0.25 0.09 -0.27 0.38 -0.27 0.28 0.2 0 -0.27 -0.5 -0.27 0.5 -0.12 0.5 -0.3 0.7 -0.48 0.5 -0.33 0.5',
                'height': 70,
                'width': 70,
            }
        },
        {
            selector: 'node[type ^= "TestCase"]',
            style: {
                'background-color': COLOR_FAIL,
                'shape': 'rectangle',
                'height': 50,
                'width': 100,
                'background-image': '/images/green.png',
                'background-height': '100%',
                'background-width': function (ele) {
                    if (ele.data().quantities.SUCCESSFUL === undefined) {
                        ele.data().quantities.SUCCESSFUL = 0;
                    }
                    return (ele.data().quantities.SUCCESSFUL * 100 / ele.data().quantity).toString() + '%';
                },
                'background-position-x': '0px'
            }
        },
        {
            selector: 'node[type ^= "TestSuite"]',
            style: {
                'shape': 'rectangle',
                'border-style': 'double', // solid, dotted, dashed, or double.
                'border-width': '6px', // The size of the node’s border.
                'height': 50,
                'width': 100,
                'background-color': COLOR_FAIL,
                'background-position-x': '0px',
                'background-image': '/images/green.png',
                'background-height': '100%',
                'background-width': function (ele) {
                    let success = ele.data().quantities.SUCCESSFUL;
                    if (success === undefined) {
                        success = 0;
                    }
                    return (success * 100 / ele.data().quantity).toString() + '%';
                },
            }
        },
    ];
    let layout = {
        name: 'dagre',
        rankDir: 'RL',
    };

    if (target !== undefined) {
        style.push({
            selector: 'node[id ^= "' + target + '"]',
            style: {
                'border-width': '8px', // The size of the node’s border.
                'border-color': '#ffea22',
            }
        });
        if (settings.eventChain.relativeXAxis) {
            layout = {
                name: 'preset',
            }
        }
    }


    let cy = cytoscape({

        container: container,
        elements: data,
        layout: layout,
        // Higher = faster zoom
        wheelSensitivity: 0.075,
        style: style
    });

    function getQTipContent(data) {
        let content = '<h4>' + data.label + '</h4>';
        if (target === undefined) {
            content = content + '<button type="button" class="btn btn-block btn-secondary" onclick="newDetailsTarget(\'' + data.id + '\')" value="' + data.id + '"> Show events </button>';
        }
        content = content + '<table class="table table-bordered table-sm table-hover table-qtip">';

        for (let key in data.info) {
            content = content +
                '<tr><td>' + key + '</td><td class="td-right">' + data.info[key] + '</td></tr>';
        }
        if (target !== undefined) {
            /** @namespace data.quantities */
            for (let quantity in data.quantities) {
                if (quantity === 'SUCCESSFUL') {
                    content = content + '<tr class="table-success">';
                } else if (quantity === 'FAILED' || quantity === 'UNSUCCESSFUL') {
                    content = content + '<tr class="table-danger">';
                } else if (quantity === 'INCONCLUSIVE') {
                    content = content + '<tr class="table-active">';
                } else if (quantity === 'TIMED_OUT' || quantity === 'ABORTED') {
                    content = content + '<tr class="table-warning">';
                } else {
                    content = content + '<tr>';
                }

                content = content +
                    '<td>Result</td><td class="td">' + quantity + '</td></tr>';
            }
            content = content + '</table><table class="table table-bordered table-sm table-hover table-qtip"><tr><th>Key</th><th colspan="2">Timestamp</th></tr>';
            for (let time in data.times) {
                if (time === 'Execution') {
                    content = content +
                        '<tr><td>' + time + ' (ms)</td><td class="td-right">' + data.times[time] + '</td></tr>';
                } else {
                    content = content +
                        '<tr><td>' + time + '</td><td class="td-right">' + formatTime(data.times[time]) + '</td></tr>';
                }
            }
        }

        content = content + '</table>';


        if (target === undefined) {
            content = content + '<table class="table table-bordered table-sm table-hover table-qtip">' +
                '<tr><th>Attribute</th><th colspan="2">Amount</th></tr>';
            for (let quantity in data.quantities) {
                if (quantity === 'SUCCESSFUL') {
                    content = content + '<tr class="table-success">';
                } else if (quantity === 'FAILED' || quantity === 'UNSUCCESSFUL') {
                    content = content + '<tr class="table-danger">';
                } else if (quantity === 'INCONCLUSIVE') {
                    content = content + '<tr class="table-active">';
                } else if (quantity === 'TIMED_OUT' || quantity === 'ABORTED') {
                    content = content + '<tr class="table-warning">';
                } else {
                    content = content + '<tr>';
                }

                content = content +
                    '<td>' + quantity + '</td><td class="td-right">' + data.quantities[quantity] + '</td><td class="td-right">' + Math.round(10 * (data.quantities[quantity] / data.quantity * 100) / 10) + '%</td></tr>';

            }
            content = content + '<tr><td><i>Total</i></td><td colspan="2" class="td-right"><i>' + data.quantity + '</i></td></tr>';
        }

        content = content + '</table>';
        return content;
    }

    cy.nodes().qtip({
        content: function () {
            return getQTipContent(this.data());
        },
        position: {
            my: 'bottom center',
            at: 'top center',
            container: container
        },
        show: {
            //event: 'mouseover',
            event: 'click', //om den ska trigga på klick istället
            solo: true,
        },
        hide: {
            //event: 'mouseout'
            event: 'unfocus'
        },
        style: {
            classes: 'qtip-vici qtip-shadow',
            tip: {
                width: 16,
                height: 8
            }
        },
    });

    // Settings for panzoom
    let defaults = {
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit: function () { // whether to animate on fit
            return false;
        },
        fitAnimationDuration: 1000, // duration of animation on fit

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
    };

    cy.panzoom(defaults);

    // cy.nodes().ungrabify();     //Makes nodes ungrabbable
    cy.maxZoom(10); //same setting as panzoom for Krav 2
    cy.minZoom(0.1); //same setting as panzoom for Krav 2
}

$(document).ready(function () {
    settingsElement = getElementsSettings();
    setSettingsDefault(settingsElement);
    newSystem('Local dummy', 'http://127.0.0.1:8080/events.json');
    newSystem('Dummy', 'http://127.0.0.1:8081/events.json');
    contentGlobal = getContentElements();

    contentGlobal.loader.hide();

    contentGlobal.detailsToggle.bootstrapToggle('on');
    contentGlobal.menu.detailsToggle.hide();


    // MENU
    $('.list-group-item-action').on('click', function () {
        // e.preventDefault();
        load($(this).data('value'));
    });

    contentGlobal.detailsToggle.change(function () {
        _.defer(function () {
            load("details");
        });
    });

    // SETTINGS

    $('#btnNewSystem').click(function () {
        newSystem();
    });

    // TODO
    // $('#systemsUrlInput').change(function () {
    //     invalidateCache();
    // });

    $('#settings-aggregation').find('input').change(function () {
        invalidateCache('aggregation');
    });

    $('#settings-details').find('input').change(function () {
        invalidateCache('detailsTable');
    });

    $('#settings-eventChain').find('input').change(function () {
        invalidateCache('eventChain');
    });

    $('#settings-live').find('input').change(function () {
        invalidateCache('live');
    });

    settingsElement.system.on('changed.bs.select', function () {
        let settings = getCurrentSettings();
        resetSelections();
        disableMenuLevel(0);
        if (!isUrlValid(settings.system.url)) {
            showModal("Invalid URL: " + settings.system.url);
            return;
        }
        load('aggregation');
    });

    if (getCurrentSettings().system.url !== undefined) {
        _.defer(function () {
            load('aggregation');
        });
    }
    setMenuActive(getCurrentSettings());
});

