import {ApplicationRef, Component, ComponentFactoryResolver, Injector, OnInit, Renderer2} from '@angular/core';
import {environment} from "../../environments/environment";
import {Settings} from "../settings";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {System} from "../system";
import {SystemReference} from "../system-reference";
import {Preferences} from "../preferences";
import * as moment from 'moment';
import * as cytoscape from 'cytoscape';
import * as dagre from 'cytoscape-dagre';
import * as panzoom from 'cytoscape-panzoom';
import {CustomCache} from "../custom-cache";
import {HistoryUnit} from "../history-unit";

// Register cy plugins.
cytoscape.use(dagre);
panzoom(cytoscape);

@Component({
    selector: 'app-vici',
    templateUrl: './vici.component.html',
    styleUrls: [
        './vici.component.styl',
    ]
})
export class ViciComponent implements OnInit {
    settings: Settings;

    systemReferences: SystemReference[];
    statusImages: string[][];

    constants = environment;
    newSettings: Set<string> = new Set<string>();

    currentSystem: string;
    currentSystemName: string;
    currentView: string;
    currentDetailsTarget: string;
    currentEventChainTarget: string;

    cache: CustomCache;

    aggregationNodeData: any;
    aggregationHoverNode: string;

    aggregationCy: any;
    eventChainCy: any;
    detailsDatatable: any;

    history: Array<HistoryUnit> = [];
    newSystemInput = {
        name: '',
        url: ''
    };

    // Flags
    isUploadingRepository: boolean = false;
    isLoading: boolean = false;


    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private renderer: Renderer2,
    ) {
    }

    private activateLoader(): void {
        this.isLoading = true;
        this.appRef.tick();
    }

    private updateSystemReferences(eiffelEventRepositories: { [id: string]: System }): void {
        this.systemReferences = [];
        for (let eiffelEventRepositoriesKey in eiffelEventRepositories) {
            let system = eiffelEventRepositories[eiffelEventRepositoriesKey];
            let tmp = new SystemReference();
            tmp.id = system.id;
            tmp.name = system.name;
            this.systemReferences.push(tmp);
        }
    }

    uploadCurrentRepositorySettings(): void {
        this.isUploadingRepository = true;
        let repository = this.settings.eiffelEventRepositories[this.currentSystem];
        this.http.post<any>('/api/newEiffelRepository', repository).subscribe(result => {
            this.newSettings.delete(this.currentSystem);
            this.isUploadingRepository = false;
        });
    }

    settingsInputChanged(systemId: string): void {
        this.newSettings.add(systemId);
    }

    resetSettingsToServerDefault(): void {
        this.http.get<any>('/api/resetSettingsDefault').subscribe(result => {
            this.router.navigate(['']);
            window.location.reload();
        });
    }

    // WIP/TODO
    newSystem(): void {
        this.newSystemInput.name = '';
        this.newSystemInput.url = '';
    }

    private makeHistory(systemId: string, view: string, target: string, msg: string): void {
        for (let step = 0; step < this.history.length; step++) {
            let unit = this.history[step];
            if (unit.systemId === systemId && unit.view === view && unit.target === target) {
                this.history.splice(step, 1);
                break;
            }
        }
        this.history.unshift(new HistoryUnit(systemId, view, target, msg));
        if (this.history.length > environment.historyMaxUnits) {
            this.history.pop();
        }
    }

    private changeView(requestedSystem: string, requestedView: string, requestedTarget: string): void {
        if (requestedView === environment.views.aggregation) {
            if (requestedSystem !== undefined) {
                let repository = this.settings.eiffelEventRepositories[requestedSystem];
                this.makeHistory(requestedSystem, requestedView, requestedTarget, 'Aggregation for ' + repository.name)

                if (requestedSystem !== this.cache.aggregation.systemId) {

                    // todo loadingscreen
                    // todo use cache

                    this.activateLoader();
                    this.http.post<any>('/api/aggregationGraph', repository.preferences).subscribe(result => {
                        this.aggregationCy = this.renderCytoscape('aggregation_graph', this.statusImages, this.router, this.constants, this.currentSystem, result.data, repository.preferences, undefined);
                        // console.log(result);
                        this.aggregationNodeData = {};
                        for (let nodeData in result.data) {
                            let tmp = result.data[nodeData].data;
                            if (tmp.quantities !== undefined && Object.keys(tmp.quantities).length !== 0 && tmp.quantities.constructor === Object) {
                                let rates = {
                                    success: 0,
                                    fail: 0,
                                    unknown: 0,
                                };

                                if (tmp.quantities.SUCCESS !== undefined) {
                                    rates.success = Math.round((100 * tmp.quantities.SUCCESS) / tmp.quantity);
                                } else if (tmp.quantities.SUCCESSFUL !== undefined) {
                                    rates.success = Math.round((100 * tmp.quantities.SUCCESSFUL) / tmp.quantity);
                                }

                                if (tmp.quantities.UNSUCCESSFUL !== undefined) {
                                    rates.fail = Math.round((100 * tmp.quantities.UNSUCCESSFUL) / tmp.quantity);
                                } else if (tmp.quantities.FAILURE !== undefined) {
                                    rates.fail = Math.round((100 * tmp.quantities.FAILURE) / tmp.quantity);
                                } else if (tmp.quantities.FAILED !== undefined) {
                                    rates.fail = Math.round((100 * tmp.quantities.FAILED) / tmp.quantity);
                                }

                                rates.unknown = 100 - rates.success - rates.fail;

                                tmp['rates'] = rates;
                            }
                            this.aggregationNodeData[tmp.id] = tmp;
                        }
                        // console.log(this.aggregationNodeData);

                        this.aggregationCy.on('tap', 'node', (evt) => {
                            let node = evt.target;
                            this.router.navigate(['', this.currentSystem, this.constants.views.details, node.id()]);
                        });

                        this.aggregationCy.on('mouseover', 'node', (evt) => {
                            let node = evt.target;
                            this.aggregationHoverNode = node.id();
                        });

                        this.aggregationCy.on('mouseout ', 'node', () => {
                            this.aggregationHoverNode = undefined;
                        });

                        this.cache.aggregation.systemId = requestedSystem;
                        this.cache.aggregation.target = requestedTarget;
                        this.isLoading = false;
                    });

                    // _.defer(function () {
                    //     $.ajax({
                    //         type: "POST",
                    //         contentType: 'application/json; charset=utf-8',
                    //         dataType: 'json',
                    //         url: '/api/aggregationGraph',
                    //         data: JSON.stringify(preferences),
                    //         success: function (data) {
                    //             let graphData = data.data;
                    //             renderCytoscape(contentGlobal.cyAggregation, graphData, preferences, undefined);
                    //             storeCache(stage, preferences.url);
                    //             /** @namespace data.timeCollected */
                    //             updateEventsCollectedTime('Events collected', data.timeCollected);
                    //         },
                    //         error: function (jqXHR, textStatus, errorThrown) {
                    //             showModal('<p>Wops! I could not fetch data from the given url :( check that the event repository server is running and the correct url is given in the settings.</p><div class="alert alert-danger" role="alert">' + jqXHR.responseText + '</div>');
                    //             resetSelections();
                    //             disableMenuLevel(0);
                    //             renderCytoscape(contentGlobal.cyAggregation, undefined, preferences, undefined);
                    //             storeCache(stage, preferences.url);
                    //             updateEventsCollectedTime("Failed to fetch events", Date.now());
                    //         },
                    //         complete: function (jqXHR, textStatus) {
                    //             fetchCompleted();
                    //         }
                    //     });
                    // });

                }
            }
        } else if (requestedView === environment.views.details) {
            if (requestedSystem !== undefined) {
                if (requestedTarget !== undefined) {
                    let repository = this.settings.eiffelEventRepositories[requestedSystem];
                    this.makeHistory(requestedSystem, requestedView, requestedTarget, 'Table for ' + repository.name + ' ' + requestedTarget);

                    if (requestedSystem !== this.cache.details.systemId || requestedTarget !== this.cache.details.target) {
                        this.activateLoader();

                        // Kills the previous datatable to avoid errors.
                        if (this.detailsDatatable !== undefined) {
                            this.detailsDatatable.clear();
                            this.detailsDatatable.destroy();
                            this.detailsDatatable = undefined;
                        }

                        repository.preferences.detailsTargetId = requestedTarget;
                        this.http.post<any>('/api/detailedEvents', repository.preferences).subscribe(result => {
                            this.detailsDatatable = this.renderDatatables('details_table', result, requestedSystem);
                            this.cache.details.systemId = requestedSystem;
                            this.cache.details.target = requestedTarget;
                            this.isLoading = false;
                        });
                    }
                }
            }
        } else if (requestedView === environment.views.eventChain) {
            if (requestedSystem !== undefined) {
                if (requestedTarget !== undefined) {
                    let repository = this.settings.eiffelEventRepositories[requestedSystem];
                    this.makeHistory(requestedSystem, requestedView, requestedTarget, 'Event chain for ' + repository.name + ' ' + requestedTarget);
                    if (requestedSystem !== this.cache.eventchain.systemId || requestedTarget !== this.cache.eventchain.target) {
                        this.activateLoader();
                        repository.preferences.eventChainTargetId = requestedTarget;
                        this.http.post<any>('/api/eventChainGraph', repository.preferences).subscribe(result => {
                            // console.log(result);
                            this.eventChainCy = this.renderCytoscape('eventchain_graph', this.statusImages, this.router, this.constants, this.currentSystem, result.data.elements, repository.preferences, requestedTarget);
                            this.cache.eventchain.systemId = requestedSystem;
                            this.cache.eventchain.target = requestedTarget;

                            this.currentDetailsTarget = result.data.targetEvent.aggregateOn;
                            this.isLoading = false;
                        });
                    }
                }
            }
        }

    }

    private formatTime(long: number): any {
        return moment(long).format('YYYY-MM-DD, HH:mm:ss:SSS');
    }


    private renderCytoscape(containerId: string, statusImages: string[][], router: Router, constants: any, currentSystem: string, data: any, preferences: Preferences, target: string): any {
        let container = $('#' + containerId);
        let style = [
            {
                selector: 'node',
                style: {
                    'background-color': environment.colors.undefined,
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
                    'background-color': environment.colors.undefined,
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
                    'pie-1-background-color': environment.colors.pass,
                    'pie-2-background-size': function (ele) {
                        /** @namespace ele.data().quantities.FAILURE */
                        let value = (ele.data().quantities.FAILURE);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-2-background-color': environment.colors.fail,
                    'pie-3-background-size': function (ele) {
                        /** @namespace ele.data().quantities.INCONCLUSIVE */
                        let value = (ele.data().quantities.INCONCLUSIVE);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-3-background-color': environment.colors.undefined
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
                    'background-color': environment.colors.undefined,
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
                    'background-color': environment.colors.undefined,
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
                    'background-color': environment.colors.undefined,
                }
            },
        ];
        let layout = {
            name: 'dagre',
            rankDir: 'RL',
        };

        // if (target !== undefined) { TODO
        //     style.push({
        //         selector: 'node[id ^= "' + target + '"]',
        //         style: {
        //             'border-width': '8px', // The size of the node’s border.
        //             'border-color': '#ffea22',
        //         }
        //     });
        //     if (preferences.eventChainTimeRelativeXAxis) {
        //         layout = {
        //             name: 'preset',
        //         }
        //     }
        // }


        let cy = cytoscape({

            container: container,
            elements: data,
            layout: layout,
            // Higher = faster zoom
            wheelSensitivity: 0.075,
            style: style
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

        return cy;
    }

    private renderDatatables(parentDivId: string, data: any, activeSystem: string): any {
        $('#' + parentDivId).html('<table id="' + parentDivId + '_dataTableContainer" class="table table-striped table-bordered" cellspacing="0" width="100%"></table>');
        let container = $('#' + parentDivId + '_dataTableContainer');

        let plotData = data.data;

        if (plotData.data.length !== 0) {
            let preDefColumns = [
                {
                    title: 'Chain',
                    render: function (data: any, type: any, full: any) {
                        return '<button view-event-id="' + full.id + '" class="btn btn-default btn-xs row-button">Graph</button>';
                    }
                }
            ];

            let tmp = container.DataTable({
                destroy: true,
                data: plotData.data,
                columns: preDefColumns.concat(plotData.columns),
                scrollY: '80vh',
                scrollCollapse: true,
                lengthMenu: [[20, 200, -1], [20, 200, "All"]],
                order: [4, 'asc'],

            });

            this.renderer.listen('document', 'click', (event) => {
                if (event.target.getAttribute("view-event-id")) {
                    // this.router.navigate(['', activeSystem, this.constants.views.eventChain, event.target.getAttribute("view-person-id")]);
                    this.router.navigate(['', activeSystem, this.constants.views.eventChain, event.target.getAttribute("view-event-id")]);
                }
            });

            return tmp;
        }
        return undefined;
    }


    ngOnInit() {
        if (!environment.production) {
            console.log('Vici ngOnInit called.');
        }

        this.currentSystemName = undefined;
        this.currentDetailsTarget = undefined;
        this.currentEventChainTarget = undefined;

        this.cache = new CustomCache();
        this.cache.aggregation = {systemId: undefined, target: undefined};
        this.cache.details = {systemId: undefined, target: undefined};
        this.cache.eventchain = {systemId: undefined, target: undefined};

        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 1;
        let ctx = canvas.getContext('2d');
        this.statusImages = [];
        for (let pass = 0; pass <= 100; pass++) {
            this.statusImages[pass] = [];
            for (let fail = 0; fail + pass <= 100; fail++) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = environment.colors.pass;
                ctx.fillRect(0, 0, pass, 1);
                ctx.fillStyle = environment.colors.fail;
                ctx.fillRect(pass, 0, fail, 1);
                ctx.fillStyle = environment.colors.undefined;
                ctx.fillRect(pass + fail, 0, (100 - (pass + fail)), 1);
                this.statusImages[pass][fail] = canvas.toDataURL('image/jpeg', 1.0);
            }
        }

        this.http.get<Settings>('/api/getSettings').subscribe(result => {
            this.settings = result;
            this.updateSystemReferences(this.settings.eiffelEventRepositories);
            this.route.params.subscribe((params: Params) => {
                let requestedSystem = params[environment.params.system];
                if (requestedSystem === environment.params.undefined) {
                    requestedSystem = undefined;
                }

                let requestedView = params[environment.params.view];
                if (requestedView === environment.params.undefined) {
                    requestedView = undefined;
                }

                let requestedTarget = params[environment.params.target];
                if (requestedTarget === environment.params.undefined) {
                    requestedTarget = undefined;
                }

                this.changeView(requestedSystem, requestedView, requestedTarget);

                this.currentSystem = requestedSystem;
                if (this.currentSystem === undefined) {
                    this.currentSystemName = environment.messages.selectSystem;
                } else {
                    this.currentSystemName = this.settings.eiffelEventRepositories[this.currentSystem].name;
                }
                this.currentView = requestedView;
                if (requestedView === environment.views.details || requestedView === environment.views.aggregation) {
                    this.currentDetailsTarget = requestedTarget;
                } else if (requestedView === environment.views.eventChain) {
                    this.currentEventChainTarget = requestedTarget;
                }
            });
        });
    }
}
