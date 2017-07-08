let detailsTarget = undefined;
let eventTarget = undefined;

let content = {};
let cache = {};


function newDetailsTarget(target) {
    detailsTarget = target;

    let menuDetailsMaxStringLength = 16;
    let newDetailsString = 'Details';
    if (detailsTarget !== "") {
        let detailsTargetPrint = detailsTarget;
        if (detailsTarget.length > menuDetailsMaxStringLength) {
            detailsTargetPrint = detailsTarget.substring(0, menuDetailsMaxStringLength - 3) + '...';
        }
        newDetailsString = newDetailsString + ' [' + detailsTargetPrint + ']';
    }
    $('#menu_details').html('<a href="#">' + newDetailsString + '</a>');
    load("details", getSettings(), content, cache);
}

function newEventTarget(target) {
    eventTarget = target;
    load("eventChain", getSettings(), content, cache);
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
        general: {
            timeStoreCache: 86400000,
        },
        aggregation: {},
        details: {
            target: detailsTarget,
        },
        eventChain: {
            target: eventTarget,
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

function disableMenuLevel(level) {
    $('#menu_aggregation').addClass('disabled');
    $('#menu_details').addClass('disabled');
    $('#menu_eventChain').addClass('disabled');
    $('#menu_live').addClass('disabled');
    switch (level) {
        case 4:
            $('#menu_live').removeClass('disabled');
        case 3:
            $('#menu_eventChain').removeClass('disabled');
        case 2:
            $('#menu_details').removeClass('disabled');
        case 1:
            $('#menu_aggregation').removeClass('disabled');
        default:
            break;
    }
}

function setMenuActive() {
    let settings = getSettings();
    console.log(settings);
    if (settings.system.uri === undefined) {
        disableMenuLevel(0);
    } else if (detailsTarget === undefined) {
        disableMenuLevel(1);
    } else if (eventTarget === undefined) {
        disableMenuLevel(2);
    } else {
        disableMenuLevel(3);
    }
}

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

    content = {
        cyAggregation: $('#aggregation'),
        datatableDetails: undefined,
        datatableDetailsContainer: $('#details_table'),
        cyEventChain: $('#event_chain'),
        loader: $('#loader_overlay'),
        containers: {
            aggregation: $('#aggregation_wrapper'),
            details: $('#details'),
            eventChain: $('#event_chain_wrapper'),
            live: $('#live_wrapper'),
            settings: $('#settings'),
            help: $('#help'),
        }
    };

    content.loader.hide();


    detailsTarget = undefined;


    // Menu
    $('.list-group-item-action').on('click', function () {
        // e.preventDefault();
        load($(this).data('value'), getSettings(), content, cache);
    });

    $('#settings-aggregation').find('input').change(function () {
        invalidateCache(cache, 'aggregation');
    });

    $('#settings-details').find('input').change(function () {
        invalidateCache(cache, 'details');
    });

    $('#settings-eventChain').find('input').change(function () {
        invalidateCache(cache, 'eventChain');
    });

    $('#settings-live').find('input').change(function () {
        invalidateCache(cache, 'live');
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
        load('aggregation', getSettings(), content, cache);
    });

    // settingsElement.system.on('hide.bs.select', function (e) {
    // });

    if (getSettings().system.uri !== undefined) {
        _.defer(function () {
            load('aggregation', getSettings(), content, cache);
        });
    }
    setMenuActive();
});