const COLOR_PASS = '#22b14c';
const COLOR_FAIL = '#af0020';
const COLOR_UNDEFINED = '#666';

let contentGlobal = undefined;
let settingsElement = undefined;
let cache = {};
let currentStage = undefined;
let statusImages = undefined;

let liveFetch = undefined;
let lastLiveFetch = undefined;

// FORMATTING
function formatTime(long) {
    return moment(long).format('YYYY-MM-DD, HH:mm:ss:SSS');
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

        liveStartingEvents: $('#setting_live_amount_starting_event'),
        liveTimeInterval: $('#setting_live_time_between_updates'),

        settingsContent: $('#settings_content'),
        system: $('#systemSelect'),
        systemSettingsSelect: $('#settingsSystemSelect'),
        systems:
            $('#systemsSettings'),
    };
}

function removeSystemWithID(id) {
    console.log('removing ' + id);
    $('#eiffelEventRepository\\[' + id + '\\]_panel').remove();
    $('#eiffelEventRepositorySettings\\[' + id + '\\]').remove();

    updateSystemSelector();
}

function addSystemToUI(eiffelEventRepository) {

    let settings = getCurrentSettings();

    if (eiffelEventRepository.id === undefined) {
        let repositoryAmount = Object.keys(settings.eiffelEventRepositories).length;
        let i = 0;
        let count = 0;
        while (count < repositoryAmount) {
            let potentialSystem = $('#eiffelEventRepository\\[' + i + '\\]_name');
            if (potentialSystem.length) {
                count++;
            }
            i++;
        }
        eiffelEventRepository.id = i;
    }


    if (eiffelEventRepository.name === undefined) {
        let tmpName = eiffelEventRepository.id;
        while (settings.eiffelEventRepositories[tmpName] !== undefined) {
            tmpName++;
        }
        eiffelEventRepository.name = tmpName;
    }
    if (eiffelEventRepository.url === undefined) {
        eiffelEventRepository.url = '';
    }

    // let count = _.size(getCurrentSettings().systems);

    // Adding the system panel in manage systems
    settingsElement.systems.append(
        '<div class="panel panel-default" id="eiffelEventRepository[' + eiffelEventRepository.id + ']_panel">' +
        '<div class="input-group">' +
        '<span class="input-group-addon">' + eiffelEventRepository.id + '</span><span class="input-group-addon">Name</span>' +
        '<input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_name"  class="form-control" placeholder="My system" value="' + eiffelEventRepository.name + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">URL</span>' +
        '<input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_url"  class="form-control systemsUrlInput" placeholder="http://127.0.0.1:8080/events.json" value="' + eiffelEventRepository.url + '"/>' +
        '</div>' +
        '<span class="input-group-addon"><button id="eiffelEventRepository[' + eiffelEventRepository.id + ']_btmRemove" type="button" class="btn btn-danger">' +
        '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button></span>' +
        '</div>'
    );

    $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_btmRemove').click(function () {
        removeSystemWithID(eiffelEventRepository.id);
    });

    // Adding the settings content
    let eersc = '<div id="eiffelEventRepositorySettings[' + eiffelEventRepository.id + ']">';

    // General settings
    eersc += '<div id="eiffelEventRepository[' + eiffelEventRepository.id + ']_settingsGeneral">' +
        '<h4>General</h4>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Time to keep caches (ms)</span><input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_cacheLifeTimeMs" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '</div>';
    // Aggregation node graph settings
    eersc += '<div id="eiffelEventRepository[' + eiffelEventRepository.id + ']_settingsAggregation">' +
        '<h4>Aggregation</h4>';

    eersc += '</div>';
    // Details view settings
    eersc += '<div id="eiffelEventRepository[' + eiffelEventRepository.id + ']_settingsDetails">' +
        '<h4>Details</h4>';

    eersc += '</div>';
    // Event chain settings
    eersc += '<div id="eiffelEventRepository[' + eiffelEventRepository.id + ']_settingsEventChain">' +
        '<h4>Event Chain</h4>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Maximum jumps</span><input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_eventChainMaxSteps" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Maximum connections/node</span><input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_eventChainMaxConnections" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '<div class="input-group settings-row"><label class="checkbox-inline">' +
        '<input class="set-bootstraptoggle" type="checkbox" data-toggle="toggle" id="eiffelEventRepository[' + eiffelEventRepository.id + ']_eventChainGoUpStream"/> Follow links <b>up</b> stream</label>' +
        '</div>';

    eersc += '<div class="input-group settings-row"><label class="checkbox-inline">' +
        '<input class="set-bootstraptoggle" type="checkbox" data-toggle="toggle" id="eiffelEventRepository[' + eiffelEventRepository.id + ']_eventChainGoDownStream"/> Follow links <b>down</b> stream</label>' +
        '</div>';

    eersc += '<div class="input-group settings-row"><label class="checkbox-inline">' +
        '<input class="set-bootstraptoggle" type="checkbox" data-toggle="toggle" id="eiffelEventRepository[' + eiffelEventRepository.id + ']_eventChainTimeRelativeXAxis"/> Node x-position defined by actual timestamp</label>' +
        '</div>';

    eersc += '</div>';
    // Live stream settings
    eersc += '<div id="eiffelEventRepository[' + eiffelEventRepository.id + ']_settingsLive">' +
        '<h5>Live</h5>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Number of base events (latest)</span><input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_streamBaseEvents" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Time between updates (ms)</span><input id="eiffelEventRepository[' + eiffelEventRepository.id + ']_streamRefreshIntervalMs" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '</div>';

    eersc += '</div>';
    settingsElement.settingsContent.append(eersc);

    // Apply bootstrap
    $('.set-bootstraptoggle').bootstrapToggle();

    // Apply correct settings
    setCurrentSettingsForEiffelEventRepository(eiffelEventRepository);

    // Applying functions
    $('#systemsSettings').find('input').change(function () {
        updateSystemSelector();
    });
    updateSystemSelector();

    return eiffelEventRepository;
}

function newSystem(eiffelEventRepository) {
    if (eiffelEventRepository === undefined) {
        contentGlobal.loader.show();
        $.ajax({
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            url: '/api/getDefaultEiffelEventRepository',
            // async: false, // NOT asyncronous
            success: function (data) {
                addSystemToUI(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showModal('<p>Could not fetch a new repository from server, something is wrong, check that server is running or check server log.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                contentGlobal.loader.hide();
            }
        });
    } else {
        addSystemToUI(eiffelEventRepository);
    }
}


function getSettingsFromServer() {
    contentGlobal.loader.show();

    _.defer(function () {
        $.ajax({
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            url: '/api/getSettings',
            // data: JSON.stringify(settings),
            success: function (data) {
                console.log(data);
                /** @namespace data.eiffelEventRepositories */
                data.eiffelEventRepositories.forEach(function (eiffelEventRepository) {
                    newSystem(eiffelEventRepository);
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showModal('<p>Could not fetch settings from server, something is wrong, check that server is running or check server log.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                contentGlobal.loader.hide();
            }
        });
    });
}

function saveSettings() {

}

function setSettingsDefault(settingsElement) {
    settingsElement.cacheKeepTime.val(86400000);

    settingsElement.upStream.prop('checked', true).change();
    settingsElement.downStream.prop('checked', true).change();
    settingsElement.steps.val(5);
    settingsElement.maxConnections.val(16);
    settingsElement.relativeXAxis.prop('checked', false).change();

    settingsElement.liveStartingEvents.val(2);
    settingsElement.liveTimeInterval.val(2000);

    settingsElement.systems.html('');

    settingsElement.system.selectpicker('val', undefined);
}

function setCurrentSettingsForEiffelEventRepository(eiffelEventRepository) {
    $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_cacheLifeTimeMs').val(eiffelEventRepository.repositorySettings.cacheLifeTimeMs);
    // TODO previous links
    if (eiffelEventRepository.repositorySettings.eventChainGoUpStream) {
        $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_eventChainGoUpStream').bootstrapToggle('on');
    }
    if (eiffelEventRepository.repositorySettings.eventChainGoDownStream) {
        $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_eventChainGoDownStream').bootstrapToggle('on');
    }
    $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_eventChainMaxSteps').val(eiffelEventRepository.repositorySettings.eventChainMaxSteps);
    $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_eventChainMaxConnections').val(eiffelEventRepository.repositorySettings.eventChainMaxConnections);
    if (eiffelEventRepository.repositorySettings.eventChainTimeRelativeXAxis) {
        $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_eventChainTimeRelativeXAxis').bootstrapToggle('on');
    }

    $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_streamBaseEvents').val(eiffelEventRepository.repositorySettings.streamBaseEvents);
    $('#eiffelEventRepository\\[' + eiffelEventRepository.id + '\\]_streamRefreshIntervalMs').val(eiffelEventRepository.repositorySettings.streamRefreshIntervalMs);
}

function getCurrentSettingsForId(repositoryLocalId) {
    return {
        name: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_name').val(),
        url: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_url').val(),
        repositorySettings: {
            cacheLifeTimeMs: parseInt($('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_cacheLifeTimeMs').val()),

            detailsTargetId: settingsElement.detailsTarget.html(),

            eventChainTargetId: settingsElement.eventChainTarget.html(),

            eventChainBannedLinks: [
                "PREVIOUS_VERSION",
            ],

            eventChainGoUpStream: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_eventChainGoUpStream').prop('checked'),
            eventChainGoDownStream: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_eventChainGoDownStream').prop('checked'),
            eventChainMaxSteps: parseInt($('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_eventChainMaxSteps').val()),
            eventChainMaxConnections: parseInt($('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_eventChainMaxConnections').val()),
            eventChainTimeRelativeXAxis: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_eventChainTimeRelativeXAxis').prop('checked'),

            streamBaseEvents: parseInt($('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_streamBaseEvents').val()),
            streamRefreshIntervalMs: parseInt($('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_streamRefreshIntervalMs').val()),
        },
    };
}

function getCurrentSettings() {
    // Find systems
    let repositories = {};
    let systemCount = settingsElement.systems.find('.panel').length;
    let i = 0;
    let count = 0;
    while (count < systemCount) {
        let potentialSystemObject = $('#eiffelEventRepository\\[' + i + '\\]_name');
        // Check if jQuery object exists
        if (potentialSystemObject.length) {
            repositories[potentialSystemObject.val()] = getCurrentSettingsForId(i);
            count++;
        }
        i++;
    }

    // return settings object
    return {
        eiffelEventRepositories: repositories,
        selectedEiffelEventRepository: {
            name: settingsElement.system.val(),
            url: repositories[settingsElement.system.val()],
        },
    };
}

function updateSystemSelector() {
    settingsElement.system.html('');
    settingsElement.systemSettingsSelect.html('');
    let settings = getCurrentSettings();
    for (let key in settings.eiffelEventRepositories) {
        settingsElement.system.append('<option>' + key + '</option>');
        settingsElement.systemSettingsSelect.append('<option>' + key + '</option>');
    }
    settingsElement.system.selectpicker('refresh');
    settingsElement.systemSettingsSelect.selectpicker('refresh');
}


function resetSelections() {
    settingsElement.eventChainTarget.html("");
    settingsElement.detailsTarget.html("");
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
        cyLiveEventChain: $('#live_chain'),
        loader: $('#loader_overlay'),
        systemForceUpdateButton: $('#button_system_force_fetch'),
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
            systemForceUpdate: $('#menu_system_force_fetch'),
            details: $('#menu_details'),
            detailsToggle: $('#menu_details_toggle'),
            eventChain: $('#menu_eventChain'),
            live: $('#menu_live'),
        },
        timeago: {
            dataUpdated: $('time#data_updated_timeago'),
        }
    }
        ;
}

function disableMenuLevel(level) {

    contentGlobal.menu.aggregation.addClass('disabled');
    contentGlobal.menu.details.addClass('disabled');
    contentGlobal.menu.eventChain.addClass('disabled');
    contentGlobal.menu.live.addClass('disabled');
    if (level === 0) {
        settingsElement.system.selectpicker('val', undefined);
    }
    switch (level) {
        case 4:
        case 3:
            contentGlobal.menu.eventChain.removeClass('disabled');
        case 2:
            contentGlobal.menu.details.removeClass('disabled');
        case 1:
            contentGlobal.menu.aggregation.removeClass('disabled');
            contentGlobal.menu.live.removeClass('disabled');
        default:
            break;
    }
}

function setMenuActive(settings) {
    if (settings.selectedEiffelEventRepository.url === undefined) {
        disableMenuLevel(0);
    } else if (settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.name].repositorySettings.detailsTargetId === '') {
        disableMenuLevel(1);
    } else if (settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.name].repositorySettings.eventChainTargetId === '') {
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

function updateEventsCollectedTime(lastDataCollectedAt) {
    contentGlobal.timeago.dataUpdated.timeago("update", new Date(lastDataCollectedAt));
}

function load(stage, useCache) {
    let settings = getCurrentSettings();
    let repository = settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.name];

    if (useCache === false) {
        invalidateCache();
        repository.repositorySettings.cacheLifetimeMs = 0;
    }

    if (stage === 'live' && currentStage === 'live') {

    } else {
        contentGlobal.loader.show();
    }

    currentStage = stage;
    setMenuActive(settings);
    contentGlobal.menu.detailsToggle.hide();

    liveFetch = false;
    _.defer(function () {
        for (let container in contentGlobal.containers) {
            contentGlobal.containers[container].hide();
        }

        if (stage === 'aggregation') {
            contentGlobal.containers.aggregation.show();
            if (usableCache(stage, repository.url, repository.repositorySettings.cacheLifetimeMs) === true) {
                console.log('Using cache for system ' + repository.url);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/aggregationGraph',
                        data: JSON.stringify(repository),
                        success: function (data) {
                            let graphData = data.data;
                            renderCytoscape(contentGlobal.cyAggregation, graphData, repository.repositorySettings, undefined);
                            storeCache(stage, repository.url);
                            /** @namespace data.timeCollected */
                            updateEventsCollectedTime(data.timeCollected);
                            contentGlobal.menu.systemForceUpdate.show();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            showModal('<p>Wops! I could not fetch data from the given url :( check that the event repository server is running and the correct url is given in the settings.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
                            resetSelections();
                            disableMenuLevel(0);
                            renderCytoscape(contentGlobal.cyAggregation, undefined, repository.repositorySettings, undefined);
                            storeCache(stage, repository.url);
                            contentGlobal.menu.systemForceUpdate.hide();
                        },
                        complete: function (jqXHR, textStatus) {
                            // console.log(jqXHR);
                            // console.log(textStatus);
                            contentGlobal.loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'details') {
            contentGlobal.menu.detailsToggle.show();
            contentGlobal.containers.details.show();

            let detailsTarget = repository.repositorySettings.detailsTargetId;

            // Table
            if (contentGlobal.detailsToggle.prop('checked')) {
                contentGlobal.detailsTable.show();
                contentGlobal.detailsPlot.hide();

                if (usableCache('detailsTable', repository.url + detailsTarget, repository.repositorySettings.cacheLifetimeMs)) {
                    console.log('Using cache for ' + detailsTarget + ' from system ' + repository.url);
                    contentGlobal.loader.hide();
                } else {
                    _.defer(function () {
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: "/api/detailedEvents",
                            data: JSON.stringify(repository),
                            success: function (data) {
                                let plotData = data.data;
                                if (contentGlobal.datatableDetails !== undefined) {
                                    contentGlobal.datatableDetails.destroy();
                                    contentGlobal.datatableDetailsContainer.empty();
                                }
                                if (plotData.data.length !== 0) {

                                    let preDefColumns = [
                                        {
                                            title: 'Chain',
                                            data: null,
                                            defaultContent: '<button class="btn btn-default btn-xs row-button">Graph</button>'
                                        }
                                    ];
                                    contentGlobal.datatableDetails = datatable = contentGlobal.datatableDetailsContainer.DataTable({
                                        destroy: true,
                                        data: plotData.data,
                                        columns: preDefColumns.concat(plotData.columns),
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

                                    storeCache('detailsTable', repository.url + detailsTarget);
                                } else {
                                    console.log("No data");
                                }
                                /** @namespace data.timeCollected */
                                updateEventsCollectedTime(data.timeCollected);
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

                if (usableCache('detailsPlot', repository.url + detailsTarget, repository.repositorySettings.cacheLifetimeMs)) {
                    console.log('Using cache for ' + detailsTarget + ' from system ' + repository.url);
                    contentGlobal.loader.hide();
                } else {
                    _.defer(function () {
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: "/api/detailedPlot",
                            data: JSON.stringify(repository),
                            success: function (data) {
                                let plotData = data.data;
                                if (plotData !== undefined && plotData.items.length !== 0) {
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


                                    let dataset = new vis.DataSet(plotData.items);
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
                                        start: plotData.timeLast - 345600000,
                                        end: plotData.timeLast,
                                    };

                                    console.log(groups);
                                    console.log(dataset);
                                    console.log(options);
                                    document.getElementById('details_plot').innerHTML = '';
                                    let plot = new vis.Graph2d(document.getElementById('details_plot'), dataset, groups, options);

                                    populateExternalLegend(groups, plot);


                                    storeCache('detailsPlot', repository.url + detailsTarget);
                                } else {
                                    console.log("No data");
                                }
                                /** @namespace data.timeCollected */
                                updateEventsCollectedTime(data.timeCollected);
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
            let eventTarget = repository.repositorySettings.eventChainTargetId;
            if (usableCache(stage, repository.url + eventTarget, repository.repositorySettings.cacheLifetimeMs)) {
                console.log('Using cache for ' + eventTarget + ' from system ' + repository.url);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/eventChainGraph',
                        data: JSON.stringify(repository),
                        success: function (data) {
                            let graphData = data.data;
                            renderCytoscape(contentGlobal.cyEventChain, graphData.elements, repository.repositorySettings, eventTarget);
                            storeCache(stage, repository.url + eventTarget);
                            /** @namespace data.timeCollected */
                            updateEventsCollectedTime(data.timeCollected);
                        },
                        complete: function () {
                            contentGlobal.loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'live') {
            liveFetch = true;
            contentGlobal.containers.live.show();

            if (!(lastLiveFetch === undefined || Date.now() - lastLiveFetch > repository.repositorySettings.streamRefreshIntervalMs) && usableCache(stage, systemUrl, settings.general.cacheLifetimeMs)) {
                console.log('Using cache for live view from system ' + repository.url);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/liveEventChainGraph',
                        data: JSON.stringify(repository),
                        success: function (data) {
                            console.log(data);
                            let graphData = data.data;
                            renderCytoscape(contentGlobal.cyLiveEventChain, graphData.elements, repository);
                            storeCache(stage, repository.url);
                            /** @namespace data.timeCollected */
                            updateEventsCollectedTime(data.timeCollected);
                        },
                        complete: function () {
                            contentGlobal.loader.hide();
                        }
                    });
                });
                lastLiveFetch = Date.now();
            }
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

function generateStatusImages() {
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 1;
    let ctx = canvas.getContext('2d');
    statusImages = [];
    for (let pass = 0; pass <= 100; pass++) {
        statusImages[pass] = [];
        for (let fail = 0; fail + pass <= 100; fail++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = COLOR_PASS;
            ctx.fillRect(0, 0, pass, 1);
            ctx.fillStyle = COLOR_FAIL;
            ctx.fillRect(pass, 0, fail, 1);
            ctx.fillStyle = COLOR_UNDEFINED;
            ctx.fillRect(pass + fail, 0, (100 - (pass + fail)), 1);
            statusImages[pass][fail] = canvas.toDataURL('image/jpeg', 1.0);
        }
    }
}

function renderCytoscape(container, data, repositorySettings, target) {
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
                'background-color': COLOR_UNDEFINED,
                'background-position-x': '0px',
                'background-image': function (ele) {
                    if (ele.data().quantities.SUCCESSFUL === undefined) {
                        ele.data().quantities.SUCCESSFUL = 0;
                    }
                    if (ele.data().quantities.UNSUCCESSFUL === undefined) {
                        ele.data().quantities.UNSUCCESSFUL = 0;
                    }
                    return statusImages[Math.floor((ele.data().quantities.SUCCESSFUL / ele.data().quantity) * 100)][Math.floor((ele.data().quantities.UNSUCCESSFUL / ele.data().quantity) * 100)]
                },
                'background-height': '100%',
                'background-width': '100%',
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
                'background-color': COLOR_UNDEFINED,
                'shape': 'rectangle',
                'height': 50,
                'width': 100,
                'background-image': function (ele) {
                    if (ele.data().quantities.SUCCESSFUL === undefined) {
                        ele.data().quantities.SUCCESSFUL = 0;
                    }
                    if (ele.data().quantities.UNSUCCESSFUL === undefined) {
                        ele.data().quantities.UNSUCCESSFUL = 0;
                    }
                    return statusImages[Math.floor((ele.data().quantities.SUCCESSFUL / ele.data().quantity) * 100)][Math.floor((ele.data().quantities.UNSUCCESSFUL / ele.data().quantity) * 100)]
                },
                'background-height': '100%',
                'background-width': '100%',
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
                'background-color': COLOR_UNDEFINED,
                'background-position-x': '0px',
                'background-image': function (ele) {
                    if (ele.data().quantities.SUCCESSFUL === undefined) {
                        ele.data().quantities.SUCCESSFUL = 0;
                    }
                    if (ele.data().quantities.FAILED === undefined) {
                        ele.data().quantities.FAILED = 0;
                    }
                    return statusImages[Math.floor((ele.data().quantities.SUCCESSFUL / ele.data().quantity) * 100)][Math.floor((ele.data().quantities.FAILED / ele.data().quantity) * 100)]
                },
                'background-height': '100%',
                'background-width': '100%',
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
        if (repositorySettings.eventChainTimeRelativeXAxis) {
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
    // Datatables errors now prints in console instead of alert
    $.fn.dataTableExt.sErrMode = 'throw';

    contentGlobal = getContentElements();

    contentGlobal.loader.hide();

    contentGlobal.detailsToggle.bootstrapToggle('on');
    contentGlobal.menu.detailsToggle.hide();
    contentGlobal.menu.systemForceUpdate.hide();

    getSettingsFromServer();

    settingsElement = getElementsSettings();
    setSettingsDefault(settingsElement);

    generateStatusImages();

    // newSystem('Local static dummy file', 'localFile[reference-data-set]');
    // newSystem('EER static dummy file', 'http://127.0.0.1:8081/reference-data-set');
    // newSystem('EER [live] dummy event stream', 'http://127.0.0.1:8081/live[reference-data-set]');
    // newSystem('Docker EER static dummy file', 'http://dummy-er:8081/reference-data-set');
    // newSystem('Docker EER [live] dummy event stream', 'http://dummy-er:8081/live[reference-data-set]');


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
        resetSelections();
        disableMenuLevel(0);
        load('aggregation');
        settingsElement.systemSettingsSelect.selectpicker('val', settingsElement.system.val());

    });

    settingsElement.system.on('changed.bs.select', function () {

    });

    contentGlobal.systemForceUpdateButton.click(function () {
        if (currentStage !== undefined) {
            load(currentStage, false);
        }
    });

    if (getCurrentSettings().selectedEiffelEventRepository.url !== undefined) {
        _.defer(function () {
            load('aggregation');
        });
    }
    setMenuActive(getCurrentSettings());

    jQuery("time.timeago").timeago();

    let interval0 = window.setInterval(function () {
        if (liveFetch === true) {
            let settings = getCurrentSettings();
            if (lastLiveFetch === undefined || Date.now() - lastLiveFetch > settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.name].repositorySettings.streamRefreshIntervalMs) {
                load('live', false);
            }
        }
    }, 1000);
});

