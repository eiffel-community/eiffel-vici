function renderGraph(container, data) {

    const COLOR_PASS = '#22b14c';
    const COLOR_FAIL = '#af0020';
    const COLOR_UNDEFINED = '#666';
//            $('.greeting-id').append(data.id);
//            $('.greeting-content').append(data.content);
    console.log(data);

    let cy = cytoscape({

        container: container,
        elements: data,
        layout: {
            name: 'dagre',
            rankDir: 'RL'
        },
        // Higher = faster zoom
        wheelSensitivity: 0.075,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': COLOR_UNDEFINED,
                    'border-color': '#000',
                    'border-width': '1px',
                    'border-style': 'solid',
                    'label': 'data(id)',
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
                selector: 'node[label ^= "Act"]', // All nodes with ID Activity
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
                        return (ele.data().data.SUCCESSFUL * 100 / ele.data().quantity).toString() + '%';
                    }
                }
            },
            {
                selector: 'node[label ^= "AP"]', // All nodes with ID Announcement Published
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.1 0.99 -0.27 0.96 -0.43 0.9 -0.58 0.81 -0.72 0.7 -0.83 0.56 -0.91 0.41 -0.97 0.25 -1 0.07 -0.99 -0.1 -0.96 -0.27 -0.9 -0.43 -0.81 -0.58 -0.7 -0.72 -0.56 -0.83 -0.41 -0.91 -0.25 -0.97 -0.07 -1 0.1 -0.99 0.27 -0.96 0.43 -0.9 0.58 -0.81 0.72 -0.7 0.83 -0.56 0.91 -0.41 0.97 -0.25 1 -0.07 1 0 0.98 0.17 0.94 0.34 0.87 0.5 0.77 0.64 0.64 0.77 0.5 0.87 0.34 0.94 0.17 0.98 0 1 -0.33 0.07 0.51 0.16 0.45 0.1 0.4 0.05 0.29 -0.16 0.22 -0.3 0.19 -0.42 0.17 -0.5 0.16 -0.6 0.17 -0.7 0.18 -0.78 0.26 -0.7 0.3 -0.66 0.35 -0.6 0.41 -0.5 0.47 -0.4 0.49 -0.3 0.52 -0.2 0.53 -0.1 0.54 0 0.52 0.1 0.51 0.16 0.45 0.1 0.4 0.05 0.29 -0.16 0.22 -0.3 0.19 -0.42 0.17 -0.5 0.16 -0.6 0.17 -0.7 0.18 -0.78 -0.46 -0.09 -0.61 -0.05 -0.57 0.13 -0.41 0.09',
                    'height': 90,
                    'width': 90,
                }
            },
            {
                selector: 'node[label ^= "Art"]', // All nodes with ID starting with Art (Artifact)
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '1 -0.4 0 -0.8 -1 -0.4 0 0 1 -0.4 1 0.6 0 1 0 0 0 1 -1 0.6 -1 -0.4 0 0 1 -0.4',
                    'height': 60,
                    'width': 50,
                }
            },
            {
                selector: 'node[label ^= "ArtC"]', // All nodes with ID Artifact Created
                style: {
                    'background-color': '#557e62',
                }
            },
            {
                selector: 'node[label ^= "ArtP"]', // All nodes with ID Artifact Published
                style: {
                    'background-color': '#5a617e',
                }
            },
            {
                selector: 'node[label ^= "ArtR"]', // All nodes with ID Artifact Reused
                style: {
                    'background-color': '#7e5344',
                }
            },
            {
                selector: 'node[label ^= "CDef"]', // All nodes with ID Composition Defined
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '1 0 1 0.6 0.5 0.8 0 0.6 -0.5 0.8 -1 0.6 -1 0 -0.5 -0.2 -0.5 -0.8 0 -1 0.5 -0.8 0.5 -0.2 1 0  0.5 0.2 0.5 0.8 0.5 0.2 0 0 0 0.6 0 0 -0.5 0.2 -0.5 0.8 -0.5 0.2 -1 0 -0.5 -0.2 0 0 0.5 -0.2 0 0 0 -0.6 -0.5 -0.8 0 -0.6 0.5 -0.8 0.5 -0.2 1 0',
                    'height': 70,
                    'width': 70,
                }
            },
            {
                selector: 'node[label ^= "CLM"]', // All nodes with ID Confidence Level
                style: {
                    'background-color': '#fff',
                    'width': '70px',
                    'height': '70x',
                    'pie-size': '100%',
                    'pie-1-background-size': function (ele) {
                        let value = (ele.data().data.SUCCESS);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-1-background-color': COLOR_PASS,
                    'pie-2-background-size': function (ele) {
                        let value = (ele.data().data.FAILURE);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-2-background-color': COLOR_FAIL,
                    'pie-3-background-size': function (ele) {
                        let value = (ele.data().data.INCONCLUSIVE);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-3-background-color': COLOR_UNDEFINED
                }
            },
            {
                selector: 'node[label ^= "CA"]', // All nodes with ID Configuration Applied
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.1 1 -0.17 0.77 -0.32 0.72 -0.53 0.87 -0.68 0.77 -0.6 0.53 -0.68 0.38 -0.94 0.39 -1 0.22 -0.79 0.08 -0.79 -0.08 -1 -0.22 -0.94 -0.39 -0.68 -0.38 -0.6 -0.53 -0.68 -0.77 -0.53 -0.87 -0.32 -0.72 -0.17 -0.77 -0.1 -1 0.1 -1 0.17 -0.77 0.32 -0.72 0.53 -0.87 0.68 -0.77 0.6 -0.53 0.68 -0.38 0.94 -0.39 1 -0.22 0.79 -0.08 0.79 0.08 1 0.22 0.94 0.39 0.68 0.38 0.6 0.53 0.68 0.77 0.53 0.87 0.32 0.72 0.17 0.77 0.1 1',
                    'height': 70,
                    'width': 70,
                    'pie-size': '40%',
                    'pie-1-background-size': '100%',
                    'pie-1-background-color': '#fff',
                }
            },
            {
                selector: 'node[label ^= "EDef"]', // All nodes with ID Environment Defined
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
                selector: 'node[label ^= "SCC"]', // All nodes with ID Source Change Created
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.33 -0.8 -0.35 -0.81 -0.37 -0.83 -0.39 -0.85 -0.4 -0.87 -0.4 -0.9 -0.4 -0.93 -0.39 -0.95 -0.37 -0.97 -0.35 -0.99 -0.33 -1 -0.3 -1 -0.27 -1 -0.25 -0.99 -0.23 -0.97 -0.21 -0.95 -0.2 -0.93 -0.2 -0.9 -0.2 -0.9 -0.2 -0.87 -0.21 -0.85 -0.23 -0.83 -0.25 -0.81 -0.27 -0.8 -0.27 -0.64 0.25 -0.09 0.27 -0.1 0.3 -0.1 0.33 -0.1 0.35 -0.09 0.37 -0.07 0.39 -0.05 0.4 -0.03 0.4 0 0.4 0 0.4 0.03 0.39 0.05 0.37 0.07 0.35 0.09 0.33 0.1 0.3 0.1 0.27 0.1 0.25 0.09 0.23 0.07 0.21 0.05 0.2 0.03 0.2 0 -0.27 -0.5 -0.27 0.5 -0.12 0.5 -0.3 0.7 -0.48 0.5 -0.33 0.5',
                    'height': 70,
                    'width': 70,
                }
            },
            {
                selector: 'node[label ^= "SCS"]', // All nodes with ID Source Change Submitted
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.33 -0.8 -0.35 -0.81 -0.37 -0.83 -0.39 -0.85 -0.4 -0.87 -0.4 -0.9 -0.4 -0.93 -0.39 -0.95 -0.37 -0.97 -0.35 -0.99 -0.33 -1 -0.3 -1 -0.27 -1 -0.25 -0.99 -0.23 -0.97 -0.21 -0.95 -0.2 -0.93 -0.2 -0.9 -0.2 -0.9 -0.2 -0.87 -0.21 -0.85 -0.23 -0.83 -0.25 -0.81 -0.27 -0.8 -0.27 -0.64 0.25 -0.09 0.27 -0.1 0.3 -0.1 0.33 -0.1 0.35 -0.09 0.37 -0.07 0.39 -0.05 0.4 -0.03 0.4 0 0.4 0 0.4 0.03 0.39 0.05 0.37 0.07 0.35 0.09 0.33 0.1 0.3 0.1 0.27 0.1 0.25 0.09 0.25 0.09 -0.27 0.38 -0.27 0.28 0.2 0 -0.27 -0.5 -0.27 0.5 -0.12 0.5 -0.3 0.7 -0.48 0.5 -0.33 0.5',
                    'height': 70,
                    'width': 70,
                }
            },
            {
                selector: 'node[label ^= "TC"]', // All nodes with ID Test Case
                style: {
                    'background-color': COLOR_FAIL,
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100,
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data().data.SUCCESSFUL * 100 / ele.data().quantity).toString() + '%';
                    },
                    'background-position-x': '0px'
                }
            },
            {
                selector: 'node[label ^= "TS"]', // All nodes with ID Test Suite
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
                        let success = ele.data().data.SUCCESSFUL;
                        if (success === undefined) {
                            success = 0;
                        }
                        return (success * 100 / ele.data().quantity).toString() + '%';
                    },
                }
            },
        ]
    });

    function getQTipContent(data) {
        let content = '<h4>' + data.label + '</h4>' +
            '<button type="button" class="btn btn-block btn-secondary" onclick="newDetailsTarget(\'' + data.id + '\')" value="' + data.id + '"> Show events </button>' +
            '<table class="table table-bordered table-sm table-hover table-qtip">' +
            '<tr><th>Attribute</th><th colspan="2">Amount</th></tr>'; // table header

        for (quantity in data.data) {
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
                '<td>' + quantity + '</td><td class="td-right">' + data.data[quantity] + '</td><td class="td-right">' + Math.round(10 * (data.data[quantity] / data.quantity * 100) / 10) + '%</td></tr>';
        }

        content = content + '<tr><td><i>Total</i></td><td colspan="2" class="td-right"><i>' + data.quantity + '</i></td></tr>' +
            '</table>';

        return content;
    }

    cy.nodes().qtip({
        content: function () {
//                    if (level === "aggregation") {
//                        return getTooltipContent(this.data()); // Ändra här för att ändra vad som ska vara i den
//                    } else if (level === "eventchain") {
//                        return getLevelThreeContent(this.data());
//                    }
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

let systemTarget = undefined;
let detailsTarget = undefined;

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

let cache = {};

function usableCache(cacheName, request) {
    return cache[cacheName] !== undefined && cache[cacheName].time + cacheStoreTime > Date.now() && cache[cacheName].value === request;
}

function storeCache(cacheName, value) {
    cache[cacheName] = {
        value: value,
        time: Date.now()
    };
}

function load(stage) {
    loader.show();
    $(".sidebar-nav li").removeClass("active");
    $('#menu_' + stage).addClass('active');

    _.defer(function () {
        wrapperAggregation.hide();
        containerDetails.hide();
        wrapperEventChain.hide();
        wrapperLive.hide();
        containerSettings.hide();
        containerHelp.hide();

        if (stage === 'aggregation') {
            wrapperAggregation.show();
            if (usableCache('aggregation', systemTarget)) {
                console.log('Using cache for ' + systemTarget);
                loader.hide();
            } else {
                $.ajax({
                    url: 'http://localhost:8080/api/aggregationGraph?url=' + systemTarget
                }).then(function (data) {
                    renderGraph(containerAggregation, data);
                    storeCache('aggregation', systemTarget);
                    loader.hide();
                });
            }

        } else if (stage === 'details') {
            containerDetails.show();
            if (usableCache('details', detailsTarget)) {
                console.log('Using cache for ' + detailsTarget);
                loader.hide();
            } else {
                $.ajax({
                        url: "http://localhost:8080/api/detailedEvents?name=" + detailsTarget,
                    }
                ).then(function (data) {
                    console.log(data);
                    // if (data.columns.length === 0) {
                    //     data.columns = [
                    //         {title: 'No data', data: 'noData'}
                    //     ];
                    // }
                    if (detailsDataTable !== undefined) {
                        detailsDataTable.destroy();
                        detailsTable.empty();
                    }

                    if (data.data.length !== 0) {
                        detailsDataTable = detailsTable.DataTable({
                            destroy: true,
                            data: data.data,
                            columns: data.columns,
                            // columns: [
                            //     {title: 'Name', data: 'name'},
                            //     {title: 'Id', data: 'id'}
                            // ],
                            scrollY: '80vh',
                            scrollCollapse: true,
                            lengthMenu: [[20, 200, -1], [20, 200, "All"]],
                            // paging: false,
                            // fixedHeader: {
                            //     header: true,
                            //     footer: true
                            // },
                            // autoWidth: true
                            order: [3, 'asc'],
                        });
                        storeCache('details', detailsTarget);
                    } else {
                        console.log("No data");
                    }
                    loader.hide();
                });
            }
        } else if (stage === 'eventChain') {
            wrapperEventChain.show();
            loader.hide();
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
        }
    });
}

function newDetailsTarget(target) {
    detailsTarget = target;
    let newDetailsString = 'Details';
    if (detailsTarget !== "") {
        newDetailsString = newDetailsString + ' [' + detailsTarget + ']';
    }
    $('#menu_details').html('<a href="#">' + newDetailsString + '</a>');
    load("details");
}

$(document).ready(function () {
    loader = $('#loader_overlay');

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

    systemTarget = "http://localhost:8080/events.json";
    detailsTarget = "";
    detailsDataTable = undefined;


    // Menu
    $('.menu-item').on('click', function (e) {
        // e.preventDefault();

        load($(this).data('value'));
    });

    // $('.aggregated-button').on('click', function (e) {
    //     console.log("clicked");
    //     console.log($('this').val());
    // });


    load('aggregation');
});