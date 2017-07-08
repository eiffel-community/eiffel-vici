function formatTime(long) {
    return moment(long).format('YYYY-MM-DD, HH:mm:ss:SSS');
}

function renderGraph(container, data, settings, target) {

    const COLOR_PASS = '#22b14c';
    const COLOR_FAIL = '#af0020';
    const COLOR_UNDEFINED = '#666';
//            $('.greeting-id').append(data.id);
//            $('.greeting-content').append(data.content);

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
                    let value = (ele.data().quantities.SUCCESS);
                    if (value === undefined) {
                        value = 0;
                    }
                    return (value * 100 / ele.data().quantity).toString() + '%';
                },
                'pie-1-background-color': COLOR_PASS,
                'pie-2-background-size': function (ele) {
                    let value = (ele.data().quantities.FAILURE);
                    if (value === undefined) {
                        value = 0;
                    }
                    return (value * 100 / ele.data().quantity).toString() + '%';
                },
                'pie-2-background-color': COLOR_FAIL,
                'pie-3-background-size': function (ele) {
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

let detailsTarget = undefined;
let eventTarget = undefined;

let loader = undefined;

let wrapperAggregation = undefined;
let containerAggregation = undefined;
let containerDetails = undefined;
let wrapperEventChain = undefined;
let containerEventChain = undefined;
let wrapperLive = undefined;
let containerLive = undefined;
let containerSettings = undefined;
let containerHelp = undefined;

let detailsTable = undefined;
let detailsDataTable = undefined;

let cacheStoreTime = 86400000;

let menuDetailsMaxStringLength = 16;

let cache = {};

function usableCache(cacheName, system) {
    return cache[cacheName] !== undefined && cache[cacheName].time + cacheStoreTime > Date.now() && cache[cacheName].system === system;
}

function storeCache(cacheName, system) {
    cache[cacheName] = {
        system: system,
        time: Date.now()
    };
}

function invalidateCache(cacheName) {
    if (cacheName === undefined) {
        cache = {};
        console.log('Invalidated cache for ' + cacheName)
    } else {
        cache[cacheName] = undefined;
        console.log('Invalidated all cache')
    }
}

function load(stage) {
    loader.show();
    $(".sidebar-nav li").removeClass("active");
    $('#menu_' + stage).addClass('active');

    let settings = getSettings();
    _.defer(function () {
        wrapperAggregation.hide();
        containerDetails.hide();
        wrapperEventChain.hide();
        wrapperLive.hide();
        containerSettings.hide();
        containerHelp.hide();

        if (stage === 'aggregation') {
            wrapperAggregation.show();
            if (usableCache('aggregation', settings.systems[systemSelected])) {
                console.log('Using cache for system ' + settings.systems[systemSelected]);
                loader.hide();
            } else {
                _.defer(function () {
                    console.log(settings);
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/aggregationGraph',
                        data: JSON.stringify(settings),
                        success: function (data) {
                            console.log(data);
                            renderGraph(containerAggregation, data, settings, undefined);
                            storeCache('aggregation', settings.systems[systemSelected]);
                        },
                        complete: function () {
                            loader.hide();
                        }
                    });
                });
            }

        } else if (stage === 'details') {
            containerDetails.show();
            if (usableCache('details', detailsTarget)) {
                console.log('Using cache for ' + detailsTarget);
                loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: "/api/detailedEvents?name=" + detailsTarget,
                        data: JSON.stringify(settings),
                        success: function (data) {
                            console.log(data);
                            if (detailsDataTable !== undefined) {
                                detailsDataTable.destroy();
                                detailsTable.empty();
                            }

                            let preDefColumns = [
                                {
                                    title: 'Chain',
                                    data: null,
                                    defaultContent: '<button class="btn btn-default row-button">Graph</button>'
                                }
                            ];

                            if (data.data.length !== 0) {
                                detailsDataTable = detailsTable.DataTable({
                                    destroy: true,
                                    data: data.data,
                                    columns: preDefColumns.concat(data.columns),
                                    scrollY: '80vh',
                                    scrollCollapse: true,
                                    lengthMenu: [[20, 200, -1], [20, 200, "All"]],
                                    order: [4, 'asc'],
                                });
                                storeCache('details', detailsTarget);

                                detailsTable.find('tbody').on('click', 'button', function () {
                                    let data = detailsDataTable.row($(this).parents('tr')).data();
                                    newEventTarget(data.id);
                                });
                            } else {
                                console.log("No data");
                            }
                        },
                        complete: function () {
                            loader.hide();
                        }
                    });
                });
            }

        } else if (stage === 'eventChain') {
            wrapperEventChain.show();
            if (usableCache('eventChain', eventTarget)) {
                console.log('Using cache for ' + eventTarget);
                loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/eventChainGraph?id=' + eventTarget,
                        data: JSON.stringify(settings),
                        success: function (data) {
                            console.log(data);
                            renderGraph(containerEventChain, data.elements, settings, eventTarget);
                            storeCache('eventChain', eventTarget);
                        },
                        complete: function () {
                            loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'live') {
            wrapperLive.show();
            loader.hide();
        } else if (stage === 'settings') {
            containerSettings.show();
            loader.hide();
        } else if (stage === 'help') {
            containerHelp.show();
            loader.hide();
        } else {
            console.log("Error in mode switch");
            console.log(stage);
        }
    });
}

function newDetailsTarget(target) {
    detailsTarget = target;
    let newDetailsString = 'Details';
    if (detailsTarget !== "") {
        let detailsTargetPrint = detailsTarget;
        if (detailsTarget.length > menuDetailsMaxStringLength) {
            detailsTargetPrint = detailsTarget.substring(0, menuDetailsMaxStringLength - 3) + '...';
        }
        newDetailsString = newDetailsString + ' [' + detailsTargetPrint + ']';
    }
    $('#menu_details').html('<a href="#">' + newDetailsString + '</a>');
    load("details");
}

function newEventTarget(target) {
    eventTarget = target;
    load("eventChain");
}

let settingsElement = undefined;

function getSettings() {
    let systemCount = settingsElement.systems.find('.panel').length;
    let systems = {};
    for (let i = 0; i < systemCount; i++) {
        systems[$('#systemName\\[' + i + '\\]').val()] = $('#systemUri\\[' + i + '\\]').val()
    }
    // console.log(systems);

    return {
        systems: systems,

        system: {
            name: settingsElement.system.val(),
            uri: systems[settingsElement.system.val()],
        },
        aggregation: {},
        details: {},
        eventChain: {
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

function setSettingsDefault() {

    settingsElement.upStream.prop('checked', true).change();
    settingsElement.downStream.prop('checked', true).change();
    settingsElement.steps.val(5);
    settingsElement.maxConnections.val(16);
    settingsElement.relativeXAxis.prop('checked', false).change();

    settingsElement.systems.html('');
    newSystem('Dummy', 'http://localhost:8081/events.json');

    settingsElement.system.selectpicker('val', undefined);
}

function newSystem(name, uri) {
    if (name === undefined) {
        name = '';
    }
    if (uri === undefined) {
        uri = '';
    }
    let settings = getSettings();
    let count = _.size(settings.systems);
    settingsElement.systems.append(
        '<div class="panel panel-default">' +
        '<div class="input-group">' +
        '<span class="input-group-addon">Name</span>' +
        '<input id="systemName[' + count + ']" type="text" class="form-control" ' +
        'placeholder="My system" value="' + name + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">URI</span>' +
        '<input id="systemUri[' + count + ']" type="text" class="form-control" ' +
        'placeholder="http://localhost:8081/events.json" value="' + uri + '"/>' +
        '</div>' +
        '</div>'
    );
}

let systemSelected = 'Dummy';

$(document).ready(function () {
    settingsElement = {
        upStream: $('#upStream'),
        downStream: $('#downStream'),
        steps: $('#steps'),
        maxConnections: $('#maxConnections'),
        relativeXAxis: $('#relativeXAxis'),

        system: $('#systemSelect'),
        systems: $('#systemCollapse'),
    };

    setSettingsDefault();

    loader = $('#loader_overlay');
    loader.hide();

    wrapperAggregation = $('#aggregation_wrapper');
    containerAggregation = $('#aggregation');
    containerDetails = $('#details');
    wrapperEventChain = $('#event_chain_wrapper');
    containerEventChain = $('#event_chain');
    wrapperLive = $('#live_wrapper');
    containerLive = $('#live');
    containerSettings = $('#settings');
    containerHelp = $('#help');

    detailsTable = $('#details_table');

    detailsTarget = "";


    // Menu
    $('.menu-item').on('click', function () {
        // e.preventDefault();
        load($(this).data('value'));
    });

    $('#settings-aggregation').find('input').change(function () {
        invalidateCache('aggregation');
    });

    $('#settings-details').find('input').change(function () {
        invalidateCache('details');
    });

    $('#settings-eventChain').find('input').change(function () {
        invalidateCache('eventChain');
    });

    $('#settings-live').find('input').change(function () {
        invalidateCache('live');
    });

    settingsElement.system.on('show.bs.select', function () {
        let settings = getSettings();

        settingsElement.system.html('');
        for (let key in settings.systems) {
            settingsElement.system.append('<option>' + key + '</option>');
        }
        settingsElement.system.selectpicker('refresh');
    });

    settingsElement.system.on('changed.bs.select', function () {
        load('aggregation');
    });

    if (getSettings().system.uri !== undefined) {
        _.defer(function () {
            load('aggregation');
        });
    }
});