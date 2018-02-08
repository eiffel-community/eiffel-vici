// Constants
const COLOR_PASS = '#22b14c';
const COLOR_FAIL = '#af0020';
const COLOR_UNDEFINED = '#666';

const STAGE_AGGREGATION = 'aggregation';
const STAGE_DETAILS = 'details';
const STAGE_DETAILS_TABLE = 'details_table';
const STAGE_DETAILS_PLOT = 'details_plot';
const STAGE_EVENTCHAIN = 'eventChain';
const STAGE_LIVE = 'live';
const STAGE_SETTINGS = 'settings';
const STAGE_HELP = 'help';

// Global variables
let isFetching = false;

let contentGlobal = undefined;
let settingsElement = undefined;
let cache = {};
let currentStage = undefined;
let statusImages = undefined;

let liveFetch = undefined;
let lastLiveFetch = undefined;

let eventTypes = undefined;

// FORMATTING
function formatTime(long) {
    return moment(long).format('YYYY-MM-DD, HH:mm:ss:SSS');
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
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
    contentGlobal.loader.show();
    _.defer(function () {
        $.ajax({
            type: "POST",
            contentType: 'text/plain; charset=utf-8',
            dataType: 'text',
            url: '/api/removeEiffelEventRepository',
            data: id,
            success: function (data) {
                $('#eiffelEventRepository\\[' + id + '\\]_panel').remove();
                $('#eiffelEventPreferences\\[' + id + '\\]').remove();

                updateSystemSelector();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showModal('<p>Wops! I could not delete the repository :( check that the event repository server is running.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                contentGlobal.loader.hide();
            }
        });
    });
}

function uploadEiffelRepository(repository) {
    contentGlobal.loader.show();
    _.defer(function () {
        $.ajax({
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            url: '/api/newEiffelRepository',
            data: JSON.stringify(repository),
            success: function (data) {
                disableUploadButtonsForRepo(repository.id);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showModal('<p>Wops! I could not upload/update the repository :( check that the event repository server is running.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                contentGlobal.loader.hide();
            }
        });
    });
}

function enableUploadButtonsForRepo(id) {
    $('#eiffelEventRepository\\[' + id + '\\]_btmUpload').prop('disabled', false);
    $('#eiffelEventRepositoryPreferences\\[' + id + '\\]_btmUpload').prop('disabled', false);
}

function disableUploadButtonsForRepo(id) {
    $('#eiffelEventRepository\\[' + id + '\\]_btmUpload').prop('disabled', true);
    $('#eiffelEventRepositoryPreferences\\[' + id + '\\]_btmUpload').prop('disabled', true);
}

function newSystem(eiffelEventRepository) {
    if (eiffelEventRepository === undefined) {
        console.log("Fetching default preferences.");
        contentGlobal.loader.show();
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: '/api/getDefaultEiffelEventRepository',
            success: function (data) {
                initializeSystem(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showModal('<p>Could not fetch a new repository from server, something is wrong, check that server is running or check server log.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
            },
            complete: function (jqXHR, textStatus) {
                contentGlobal.loader.hide();
            }
        });
    } else {
        initializeSystem(eiffelEventRepository);
    }
}

function initializeSystem(eiffelEventRepository) {
    let repo_id = eiffelEventRepository.id;

    if (eiffelEventRepository.name === undefined) {
        eiffelEventRepository.name = "No name";
    }
    if (eiffelEventRepository.preferences.url === undefined) {
        eiffelEventRepository.preferences.url = '';
    }

    // Adding the system panel in manage systems
    settingsElement.systems.append(
        '<div class="panel panel-default" id="eiffelEventRepository[' + repo_id + ']_panel">' +
        '<div class="input-group">' +
        '<span class="input-group-addon repo_id-span">' + repo_id + '</span><span class="input-group-addon">Name</span>' +
        '<input id="eiffelEventRepository[' + repo_id + ']_name"  class="form-control" placeholder="My system" value="' + eiffelEventRepository.name + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">URL</span>' +
        '<input id="eiffelEventRepository[' + repo_id + ']_url"  class="form-control systemsUrlInput" placeholder="http://127.0.0.1:8080/events.json" value="' + eiffelEventRepository.preferences.url + '"/>' +
        '</div>' +
        '<span class="input-group-addon"><button id="eiffelEventRepository[' + repo_id + ']_btmUpload" type="button" class="btn btn-info">' +
        '<span class="glyphicon glyphicon-upload" aria-hidden="true"></span></button></span>' +
        '<span class="input-group-addon"><button id="eiffelEventRepository[' + repo_id + ']_btmRemove" type="button" class="btn btn-danger">' +
        '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button></span>' +
        '</div>'
    );

    // Adding the settings content
    let eersc = '<div id="eiffelEventPreferences[' + repo_id + ']">';

    // General settings
    eersc += '<div id="eiffelEventRepository[' + repo_id + ']_settingsGeneral">' +
        '<h4>General</h4>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Time to keep caches (ms)</span><input id="eiffelEventRepository[' + repo_id + ']_cacheLifeTimeMs" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '</div>';
    // Aggregation node graph settings
    eersc += '<div id="eiffelEventRepository[' + repo_id + ']_settingsAggregation">' +
        '<h4>Aggregation</h4>';

    /** @namespace eiffelEventRepository.preferences.aggregateOn */
    for (let type in eiffelEventRepository.preferences.aggregateOn) {
        eersc += '<div class="input-group settings-row">' +
            '<span class="input-group-addon">' + type + '</span><input id="eiffelEventRepository[' + repo_id + ']_aggregateOn' + type + '" type="text" class="form-control" placeholder="' + eiffelEventRepository.preferences.aggregateOn[type] + '"/>' +
            '</div>';
    }

    eersc += '</div>';
    // Details view settings
    eersc += '<div id="eiffelEventRepository[' + repo_id + ']_settingsDetails">' +
        '<h4>Details</h4>';

    eersc += '</div>';
    // Event chain settings
    eersc += '<div id="eiffelEventRepository[' + repo_id + ']_settingsEventChain">' +
        '<h4>Event Chain</h4>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Maximum jumps</span><input id="eiffelEventRepository[' + repo_id + ']_eventChainMaxSteps" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Maximum connections/node</span><input id="eiffelEventRepository[' + repo_id + ']_eventChainMaxConnections" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '<div class="input-group settings-row"><label class="checkbox-inline">' +
        '<input class="set-bootstraptoggle" type="checkbox" data-toggle="toggle" id="eiffelEventRepository[' + repo_id + ']_eventChainGoUpStream"/> Follow links <b>up</b> stream</label>' +
        '</div>';

    eersc += '<div class="input-group settings-row"><label class="checkbox-inline">' +
        '<input class="set-bootstraptoggle" type="checkbox" data-toggle="toggle" id="eiffelEventRepository[' + repo_id + ']_eventChainGoDownStream"/> Follow links <b>down</b> stream</label>' +
        '</div>';

    eersc += '<div class="input-group settings-row"><label class="checkbox-inline">' +
        '<input class="set-bootstraptoggle" type="checkbox" data-toggle="toggle" id="eiffelEventRepository[' + repo_id + ']_eventChainTimeRelativeXAxis"/> Node x-position defined by actual timestamp</label>' +
        '</div>';

    eersc += '</div>';
    // Live stream settings
    eersc += '<div id="eiffelEventRepository[' + repo_id + ']_settingsLive">' +
        '<h5>Live</h5>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Number of base events (latest)</span><input id="eiffelEventRepository[' + repo_id + ']_streamBaseEvents" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '<div class="input-group settings-row">' +
        '<span class="input-group-addon">Time between updates (ms)</span><input id="eiffelEventRepository[' + repo_id + ']_streamRefreshIntervalMs" type="number" class="form-control" placeholder="Positive integer"/>' +
        '</div>';

    eersc += '</div>';

    eersc += '<button id="eiffelEventRepositoryPreferences[' + repo_id + ']_btmUpload" type="button" class="btn btn-info">' +
        '<span class="glyphicon glyphicon-upload" aria-hidden="true"></span></button>';

    eersc += '</div>';
    settingsElement.settingsContent.append(eersc);

    // Apply bootstrap
    $('.set-bootstraptoggle').bootstrapToggle();

    // Apply correct settings
    for (let type in eiffelEventRepository.preferences.aggregateOn) {
        let value = eiffelEventRepository.preferences.aggregateOn[type];
        // if (value === undefined) {
        //     value = 'null';
        // }
        $('#eiffelEventRepository\\[' + repo_id + '\\]_aggregateOn' + type).val(value);
    }

    /** @namespace eiffelEventRepository.preferences */
    $('#eiffelEventRepository\\[' + repo_id + '\\]_cacheLifeTimeMs').val(eiffelEventRepository.preferences.cacheLifeTimeMs);
    // TODO previous links
    if (eiffelEventRepository.preferences.eventChainGoUpStream) {
        $('#eiffelEventRepository\\[' + repo_id + '\\]_eventChainGoUpStream').bootstrapToggle('on');
    }
    if (eiffelEventRepository.preferences.eventChainGoDownStream) {
        $('#eiffelEventRepository\\[' + repo_id + '\\]_eventChainGoDownStream').bootstrapToggle('on');
    }
    $('#eiffelEventRepository\\[' + repo_id + '\\]_eventChainMaxSteps').val(eiffelEventRepository.preferences.eventChainMaxSteps);
    $('#eiffelEventRepository\\[' + repo_id + '\\]_eventChainMaxConnections').val(eiffelEventRepository.preferences.eventChainMaxConnections);
    if (eiffelEventRepository.preferences.eventChainTimeRelativeXAxis) {
        $('#eiffelEventRepository\\[' + repo_id + '\\]_eventChainTimeRelativeXAxis').bootstrapToggle('on');
    }

    $('#eiffelEventRepository\\[' + repo_id + '\\]_streamBaseEvents').val(eiffelEventRepository.preferences.streamBaseEvents);
    $('#eiffelEventRepository\\[' + repo_id + '\\]_streamRefreshIntervalMs').val(eiffelEventRepository.preferences.streamRefreshIntervalMs);

    // Applying functions
    $('#eiffelEventRepository\\[' + repo_id + '\\]_btmUpload').click(function () {
        let settings = getCurrentSettings();
        uploadEiffelRepository(settings.eiffelEventRepositories[repo_id]);
    });

    $('#eiffelEventRepositoryPreferences\\[' + repo_id + '\\]_btmUpload').click(function () {
        let settings = getCurrentSettings();
        uploadEiffelRepository(settings.eiffelEventRepositories[repo_id]);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_btmRemove').click(function () {
        removeSystemWithID(repo_id);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_name').change(function () {
        enableUploadButtonsForRepo(repo_id);
        updateSystemSelector();
    }).keyup(function () {
        enableUploadButtonsForRepo(repo_id);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_url').change(function () {
        enableUploadButtonsForRepo(repo_id);
        invalidateCache();
    }).keyup(function () {
        enableUploadButtonsForRepo(repo_id);
    });

    $('#eiffelEventPreferences\\[' + repo_id + '\\]').find('input').change(function () {
        enableUploadButtonsForRepo(repo_id);
    }).keyup(function () {
        enableUploadButtonsForRepo(repo_id);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_settingsGeneral').find('input').change(function () {
        invalidateCache();
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_settingsAggregation').find('input').change(function () {
        invalidateCache(STAGE_AGGREGATION);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_settingsDetails').find('input').change(function () {
        invalidateCache(STAGE_DETAILS_TABLE);
        invalidateCache(STAGE_DETAILS_PLOT);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_settingsEventChain').find('input').change(function () {
        invalidateCache(STAGE_EVENTCHAIN);
    });

    $('#eiffelEventRepository\\[' + repo_id + '\\]_settingsLive').find('input').change(function () {
        invalidateCache(STAGE_LIVE);
    });

    // Refresh
    updateSystemSelector();
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
                eventTypes = data.types;
                /** @namespace data.eiffelEventRepositories */
                for (let id in data.eiffelEventRepositories) {
                    newSystem(data.eiffelEventRepositories[id]);
                    disableUploadButtonsForRepo(id);
                }
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

function getCurrentSettingsForId(repositoryLocalId) {
    let aggregateOn = {};

    eventTypes.forEach(function (type) {
        aggregateOn[type] = $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_aggregateOn' + type).val().replace(/\s/g, '');
        if (aggregateOn[type].length < 1) {
            aggregateOn[type] = undefined;
        }
    });

    return {
        id: repositoryLocalId,
        name: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_name').val(),
        preferences: {
            aggregateOn: aggregateOn,
            url: $('#eiffelEventRepository\\[' + repositoryLocalId + '\\]_url').val(),
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
    let nameToId = {};
    $(".repo_id-span").each(function (index) {
        let repo_id = $(this).text();

        repositories[repo_id] = getCurrentSettingsForId(repo_id);
        nameToId[repositories[repo_id].name] = repo_id;
    });

    let name = settingsElement.system.val();
    let id = nameToId[name];
    let selectedEiffelEventRepository = undefined;
    if (id !== undefined) {
        selectedEiffelEventRepository = repositories[id];
    }

    // return settings object
    return {
        eiffelEventRepositories: repositories,
        selectedEiffelEventRepository: selectedEiffelEventRepository,
    };
}

function updateSystemSelector() {
    settingsElement.system.html('');
    let settings = getCurrentSettings();
    for (let key in settings.eiffelEventRepositories) {
        settingsElement.system.append('<option>' + settings.eiffelEventRepositories[key].name + '</option>');
    }
    settingsElement.system.selectpicker('refresh');
    triggerSystemSelect();
    settingsSelectRepository();
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
        time: Date.now(),
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
            systemStatusUpdateText: $('#last_fetch_status_text'),
            details: $('#menu_details'),
            detailsToggle: $('#menu_details_toggle'),
            eventChain: $('#menu_eventChain'),
            live: $('#menu_live'),
        },
        timeago: {
            dataUpdated: $('time#data_updated_timeago'),
        },
        settingsResetButton: $('#systemResetButton'),
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
    if (settings.selectedEiffelEventRepository === undefined) {
        disableMenuLevel(0);
    } else if (settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.id].preferences.detailsTargetId === '') {
        disableMenuLevel(1);
    } else if (settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.id].preferences.eventChainTargetId === '') {
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


    // get for all groups:
    for (let i = 0; i < groupsData.length; i++) {

        // let container = $('<div class="legend-toggle-container"></div>');
        let container = $('<div class="col col-lg-3 legend-toggle-container"></div>');

        // get the legend for this group.
        let legend = graph2d.getLegend(groupsData[i].id, 30, 30);

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

            groups.update({id: i, visible: $(this).prop('checked')});

            // });
        });
    }
}

function updateEventsCollectedTime(msg, lastDataCollectedAt) {
    contentGlobal.menu.systemStatusUpdateText.html(msg + ' ');
    contentGlobal.timeago.dataUpdated.timeago("update", new Date(lastDataCollectedAt));
}

function fetchCompleted() {
    contentGlobal.menu.systemForceUpdate.show();
    contentGlobal.loader.hide();
}

function load(stage, useCache) {
    let settings = getCurrentSettings();
    let preferences = undefined;
    if (settings.selectedEiffelEventRepository !== undefined) {
        preferences = settings.selectedEiffelEventRepository.preferences;
    }

    if (useCache === false && preferences !== undefined) {
        // invalidateCache();
        preferences.cacheLifeTimeMs = -1;
    }

    if (stage === STAGE_LIVE && currentStage === STAGE_LIVE) {

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

        if (stage === STAGE_AGGREGATION) {
            contentGlobal.containers.aggregation.show();
            if (preferences === undefined || usableCache(stage, preferences.url, preferences.cacheLifeTimeMs) === true) {
                console.log('Using cache for system ' + preferences.url + '. Or no repository.');
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/aggregationGraph',
                        data: JSON.stringify(preferences),
                        success: function (data) {
                            let graphData = data.data;
                            renderCytoscape(contentGlobal.cyAggregation, graphData, preferences, undefined);
                            storeCache(stage, preferences.url);
                            /** @namespace data.timeCollected */
                            updateEventsCollectedTime('Events collected', data.timeCollected);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            showModal('<p>Wops! I could not fetch data from the given url :( check that the event repository server is running and the correct url is given in the settings.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
                            resetSelections();
                            disableMenuLevel(0);
                            renderCytoscape(contentGlobal.cyAggregation, undefined, preferences, undefined);
                            storeCache(stage, preferences.url);
                            updateEventsCollectedTime("Failed to fetch events", Date.now());
                        },
                        complete: function (jqXHR, textStatus) {
                            fetchCompleted();
                        }
                    });
                });
            }
        } else if (stage === STAGE_DETAILS) {
            contentGlobal.menu.detailsToggle.show();
            contentGlobal.containers.details.show();

            let detailsTarget = preferences.detailsTargetId;

            // Table
            if (contentGlobal.detailsToggle.prop('checked')) {
                contentGlobal.detailsTable.show();
                contentGlobal.detailsPlot.hide();

                if (usableCache('detailsTable', preferences.url + detailsTarget, preferences.cacheLifeTimeMs)) {
                    console.log('Using cache for ' + detailsTarget + ' from system ' + preferences.url);
                    contentGlobal.loader.hide();
                } else {
                    _.defer(function () {
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: "/api/detailedEvents",
                            data: JSON.stringify(preferences),
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

                                    storeCache('detailsTable', preferences.url + detailsTarget);
                                } else {
                                    console.log("No data");
                                }
                                updateEventsCollectedTime('Events collected', data.timeCollected);
                            },
                            error: function () {
                                updateEventsCollectedTime('Failed to details', Date.now());
                            },
                            complete: function () {
                                fetchCompleted();
                            }
                        });
                    });
                }

            } else { // Plot
                contentGlobal.detailsTable.hide();
                contentGlobal.detailsPlot.show();

                if (usableCache('detailsPlot', preferences.url + detailsTarget, preferences.cacheLifeTimeMs)) {
                    console.log('Using cache for ' + detailsTarget + ' from system ' + preferences.url);
                    contentGlobal.loader.hide();
                } else {
                    _.defer(function () {
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: "/api/detailedPlot",
                            data: JSON.stringify(preferences),
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

                                    // console.log(groups);
                                    // console.log(dataset);
                                    // console.log(options);
                                    document.getElementById('details_plot').innerHTML = '';
                                    let plot = new vis.Graph2d(document.getElementById('details_plot'), dataset, groups, options);

                                    populateExternalLegend(groups, plot);

                                    storeCache('detailsPlot', preferences.url + detailsTarget);
                                } else {
                                    console.log("No data");
                                }
                                updateEventsCollectedTime('Events collected', data.timeCollected);
                            },
                            error: function () {
                                updateEventsCollectedTime('Failed to fetch plot', Date.now());
                            },
                            complete: function () {
                                fetchCompleted();
                            }
                        });
                    });
                }
            }
        } else if (stage === STAGE_EVENTCHAIN) {
            contentGlobal.containers.eventChain.show();
            let eventTarget = preferences.eventChainTargetId;
            if (usableCache(stage, preferences.url + eventTarget, preferences.cacheLifeTimeMs)) {
                console.log('Using cache for ' + eventTarget + ' from system ' + preferences.url);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        url: '/api/eventChainGraph',
                        data: JSON.stringify(preferences),
                        success: function (data) {
                            let graphData = data.data;
                            renderCytoscape(contentGlobal.cyEventChain, graphData.elements, preferences, eventTarget);
                            storeCache(stage, preferences.url + eventTarget);
                            updateEventsCollectedTime('Events collected', data.timeCollected);
                        },
                        error: function () {
                            updateEventsCollectedTime('Failed to fetch event-chain', Date.now());
                        },
                        complete: function () {
                            fetchCompleted();
                        }
                    });
                });
            }
        } else if (stage === STAGE_LIVE) {
            liveFetch = true;
            contentGlobal.containers.live.show();

            if (!(lastLiveFetch === undefined || Date.now() - lastLiveFetch > preferences.streamRefreshIntervalMs) && usableCache(stage, preferences.url, preferences.cacheLifeTimeMs)) {
                console.log('Using cache for live view from system ' + preferences.url);
                contentGlobal.loader.hide();
            } else {
                _.defer(function () {
                    if (!isFetching) {
                        isFetching = true;
                        $.ajax({
                            type: "POST",
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            url: '/api/liveEventChainGraph',
                            data: JSON.stringify(preferences),
                            success: function (data) {
                                let graphData = data.data;
                                renderCytoscape(contentGlobal.cyLiveEventChain, graphData.elements, preferences);
                                storeCache(stage, preferences.url);
                                updateEventsCollectedTime('Events collected', data.timeCollected);
                            },
                            error: function () {
                                updateEventsCollectedTime('Failed live fetch', data.timeCollected);
                            },
                            complete: function () {
                                fetchCompleted();
                                isFetching = false;
                            }
                        });
                    }
                });
                lastLiveFetch = Date.now();
            }
        } else if (stage === STAGE_SETTINGS) {
            settingsSelectRepository(settings.selectedEiffelEventRepository);
            contentGlobal.containers.settings.show();
            contentGlobal.loader.hide();
        } else if (stage === STAGE_HELP) {
            contentGlobal.containers.help.show();
            contentGlobal.loader.hide();
        } else {
            console.log("Error in mode switch: " + stage);
        }
    });
}

function newDetailsTarget(target) {
    settingsElement.detailsTarget.html(target);

    load(STAGE_DETAILS);
}

function newEventChainTarget(target) {
    settingsElement.eventChainTarget.html(target);

    load(STAGE_EVENTCHAIN);
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

function renderCytoscape(container, data, preferences, target) {
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
        {
            selector: 'node[type $= "(Culled)"]',
            style: {
                'background-color': COLOR_UNDEFINED,
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
        if (preferences.eventChainTimeRelativeXAxis) {
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

        // Not aggregated
        if (target !== undefined) {
            /** @namespace data.quantities */
            for (let quantity in data.quantities) {
                if (data.quantities[quantity] === 0) {
                    continue;
                }
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

            if (data.type.endsWith('(Culled)')) {
                content += '<tr><td><button type="button" class="btn btn-block btn-secondary" onclick="newEventChainTarget(\'' + data.id + '\')"> Expand </button></td></tr>'
            } else {
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

function settingsSelectRepository(repository) {
    $('#settings_content').children().hide();
    if (repository === undefined) {
        $('#settings_currentEiffelEventRepositoryHeader').html('Choose a repository to modify in the side menu');
    } else {
        $('#settings_currentEiffelEventRepositoryHeader').html(repository.name);
        $('#eiffelEventPreferences\\[' + repository.id + '\\]').show();
    }
}

function triggerSystemSelect() {
    resetSelections();
    disableMenuLevel(0);
    let settings = getCurrentSettings();
    if (settings.selectedEiffelEventRepository !== undefined) {
        settingsSelectRepository(settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.id]);
        setMenuActive(settings);
        if (currentStage !== STAGE_SETTINGS) {
            load(STAGE_AGGREGATION);
        }
    }
}

// This will run then DOM is completely loaded
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

    generateStatusImages();

    // MENU

    $('.list-group-item-action').on('click', function () {
        // e.preventDefault();
        load($(this).data('value'));
    });

    contentGlobal.detailsToggle.change(function () {
        _.defer(function () {
            load(STAGE_DETAILS);
        });
    });

    // SETTINGS

    $('#btnNewSystem').click(function () {
        newSystem();
    });


    settingsElement.system.on('changed.bs.select', function () {
        triggerSystemSelect();
    });

    contentGlobal.systemForceUpdateButton.click(function () {
        if (currentStage !== undefined) {
            invalidateCache();
            load(currentStage, false);
        }
    });

    contentGlobal.settingsResetButton.click(function () {
        contentGlobal.loader.show();
        $.ajax({
            type: "POST",
            url: '/api/resetSettingsDefault',
            success: function (data) {
                window.location.reload()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                contentGlobal.loader.hide();
                showModal('<p>Wops! I could not reset settings :( check that the event repository server is running and the correct url is given in the settings.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
            }
        });
    });

    if (getCurrentSettings().selectedEiffelEventRepository !== undefined) {
        _.defer(function () {
            load(STAGE_AGGREGATION);
        });
    }
    setMenuActive(getCurrentSettings());

    jQuery("time.timeago").timeago();

    let interval0 = window.setInterval(function () {
        if (liveFetch === true) {
            let settings = getCurrentSettings();
            if (lastLiveFetch === undefined || Date.now() - lastLiveFetch > settings.eiffelEventRepositories[settings.selectedEiffelEventRepository.id].preferences.streamRefreshIntervalMs) {
                load('live', false);
            }
        }
    }, 1000);
});

