function load(stage, settings, content, cache) {
    content.loader.show();
    // $("#side-menu").find("a").removeClass("active");
    // $('#menu_' + stage).addClass('active');

    let systemUri = settings.system.uri;

    setMenuActive();
    _.defer(function () {
        hideAllObjects(content.containers);

        if (stage === 'aggregation') {
            showObject(content.containers.aggregation);
            if (usableCache(cache, 'aggregation', systemUri, settings.general.timeStoreCache)) {
                console.log('Using cache for system ' + systemUri);
                content.loader.hide();
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
                            renderCytoscape(content.cyAggregation, data, settings, undefined);
                            storeCache(cache, 'aggregation', systemUri);
                        },
                        complete: function () {
                            content.loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'details') {
            content.containers.details.show();
            let detailsTarget = settings.details.target;
            if (usableCache(cache, 'details', systemUri + detailsTarget, settings.general.timeStoreCache)) {
                console.log('Using cache for ' + detailsTarget + ' from system ' + systemUri);
                content.loader.hide();
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
                            if (content.datatableDetails !== undefined) {
                                content.datatableDetails.destroy();
                                content.details.empty();
                            }
                            if (data.data.length !== 0) {
                                renderDatatable(content.datatableDetailsContainer, content.datatableDetails, data);
                                storeCache(cache, 'details', systemUri + detailsTarget);
                            } else {
                                console.log("No data");
                            }
                        },
                        complete: function () {
                            content.loader.hide();
                        }
                    });
                });
            }

        } else if (stage === 'eventChain') {
            content.containers.eventChain.show();
            let eventTarget = settings.eventChain.target;
            if (usableCache(cache, 'eventChain', systemUri + eventTarget, settings.general.timeStoreCache)) {
                console.log('Using cache for ' + eventTarget + ' from system ' + systemUri);
                content.loader.hide();
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
                            renderCytoscape(content.cyEventChain, data.elements, settings, eventTarget);
                            storeCache(cache, 'eventChain', systemUri + eventTarget);
                        },
                        complete: function () {
                            content.loader.hide();
                        }
                    });
                });
            }
        } else if (stage === 'live') {
            content.containers.live.show();
            content.loader.hide();
        } else if (stage === 'settings') {
            content.containers.settings.show();
            content.loader.hide();
        } else if (stage === 'help') {
            content.containers.help.show();
            content.loader.hide();
        } else {
            console.log("Error in mode switch");
            console.log(stage);
        }
    });
}
