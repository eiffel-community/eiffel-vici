import {ApplicationRef, Component, ComponentFactoryResolver, Injector, OnInit, Renderer2} from '@angular/core';
import {ToolsService} from "../tools.service";
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
import * as vis from 'vis';
import {Graph2dOptions} from 'vis';
import {timer} from 'rxjs/observable/timer';

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
    public static VICI_CONSTANTS = {
        views: {
            home: 'home',
            aggregation: 'aggregation',
            details: 'details',
            detailsPlot: 'detailsPlot',
            eventChain: 'eventChain'
        },
        params: {
            system: 'eiffel-repository-id',
            view: 'view',
            target: 'target',
            undefined: 'undefined'
        },
        colors: {
            pass: '#2ecc71',
            fail: '#e74c3c',
            undefined: '#95a5a6',
        },
        messages: {
            selectSystem: 'Select a repository',
        },
        historyMaxUnits: 6,
    };
    constants = ViciComponent.VICI_CONSTANTS;

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private renderer: Renderer2,
        private tools: ToolsService,
    ) {
    }

    settings: Settings;

    systemReferences: SystemReference[];
    statusImages: string[][];

    newSettings: Set<string> = new Set<string>();

    currentSystem: string;
    currentSystemName: string;
    currentView: string;
    currentAggregationTarget: string;
    currentDetailsTarget: string;
    currentEventChainTarget: string;

    cache: CustomCache;

    aggregationNodeData: any;
    aggregationHoverNode: string;
    aggregationCy: any;
    aggregationTimeline: any;

    detailsDatatable: any;

    eventChainNodeData: any;
    eventChainHoverNode: any;
    eventChainCy: any;
    eventChainTimeline: any;

    history: Array<HistoryUnit> = [];
    newSystemInput = {
        name: '',
        url: ''
    };

    // Flags
    isUploadingRepository: boolean = false;
    isLoading: boolean = false;
    aggregationLockTooltip: boolean = false;
    eventChainLockTooltip: boolean = false;


    // Alternative to console.log, will not print in production build.
    debug(msg: any): void {
        if (!environment.production) {
            console.log(msg);
        }
    }

    private activateLoader(): void {
        this.isLoading = true;
        this.appRef.tick();
    }

    private updateSystemReferences(): void {
        let eiffelEventRepositories = this.settings.eiffelEventRepositories;
        this.systemReferences = [];
        for (let eiffelEventRepositoriesKey in eiffelEventRepositories) {
            let system = eiffelEventRepositories[eiffelEventRepositoriesKey];
            let tmp = new SystemReference();
            tmp.id = system.id;
            tmp.name = system.name;
            this.systemReferences.push(tmp);
        }
        if (this.currentSystem === undefined) {
            this.currentSystemName = this.constants.messages.selectSystem;
        } else {
            this.currentSystemName = this.settings.eiffelEventRepositories[this.currentSystem].name;
        }
    }

    uploadCurrentRepositorySettings(): void {
        this.uploadRepository(this.settings.eiffelEventRepositories[this.currentSystem], undefined);
    }

    uploadRepository(repository: System, targetUrl: string[]): void {
        this.isUploadingRepository = true;

        this.http.post<any>('/api/newEiffelRepository', repository).subscribe(result => {
            this.newSettings.delete(this.currentSystem);
            this.isUploadingRepository = false;

            if (targetUrl !== undefined) {
                this.router.navigate(targetUrl);
            }
        });
    }

    resetSettingsToServerDefault(): void {
        this.http.get<any>('/api/resetSettingsDefault').subscribe(result => {
            this.router.navigate(['']);
            window.location.reload();
        });
    }

    newSystem(): void {
        this.http.get<System>('/api/getDefaultEiffelEventRepository').subscribe(result => {
            result.name = this.newSystemInput.name;
            result.preferences.url = this.newSystemInput.url;

            this.settings.eiffelEventRepositories[result.id] = result;
            this.updateSystemReferences();
            this.clearCache(result.id, this.constants.views.home);

            this.uploadRepository(result, ['', result.id, this.constants.views.home, this.constants.params.undefined]);

            this.newSystemInput.name = '';
            this.newSystemInput.url = '';
        });
    }

    settingsInputChanged(systemId: string, view: string): void {
        this.newSettings.add(systemId);
        this.clearCache(systemId, view)
    }

    private clearCache(systemId: string, view: string): void {
        this.newSettings.add(systemId);
        switch (view) {
            case this.constants.views.aggregation:
                if (systemId === this.cache.aggregation.systemId) {
                    this.cache.aggregation.systemId = undefined;
                    this.cache.aggregation.target = undefined;
                }
                break;
            case this.constants.views.details:
                if (systemId === this.cache.details.systemId) {
                    this.cache.details.systemId = undefined;
                    this.cache.details.target = undefined;
                }
                break;
            case this.constants.views.eventChain:
                if (systemId === this.cache.eventChain.systemId) {
                    this.cache.eventChain.systemId = undefined;
                    this.cache.eventChain.target = undefined;
                }
                break;
            case this.constants.views.home:
                if (systemId === this.cache.aggregation.systemId) {
                    this.cache.aggregation.systemId = undefined;
                    this.cache.aggregation.target = undefined;
                }
                if (systemId === this.cache.details.systemId) {
                    this.cache.details.systemId = undefined;
                    this.cache.details.target = undefined;
                }
                if (systemId === this.cache.eventChain.systemId) {
                    this.cache.eventChain.systemId = undefined;
                    this.cache.eventChain.target = undefined;
                }
                break;
            default:
                break;
        }
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
        if (this.history.length > this.constants.historyMaxUnits) {
            this.history.pop();
        }
    }

    updateHistoryDates(): void {
        this.history.forEach((unit) => {
            unit.dateString = this.tools.timeago(unit.date);
        });
    }

    private setAggregationTarget(target: string): void {
        if (target === undefined) {
            this.aggregationHoverNode = undefined;
            this.aggregationLockTooltip = false;
            this.currentAggregationTarget = undefined;
        } else {
            this.aggregationHoverNode = target;
            this.aggregationLockTooltip = true;
            this.currentAggregationTarget = target;

            // this.aggregationCy.elements('node[id = ' + target + ']').select();
        }
    }

    private setChainTarget(target: string): void {
        if (target === undefined) {
            this.eventChainHoverNode = undefined;
            this.eventChainLockTooltip = false;
            this.currentEventChainTarget = undefined;
        } else {
            this.eventChainHoverNode = target;
            this.eventChainLockTooltip = true;
            this.currentEventChainTarget = target;

            // this.aggregationCy.elements('node[id = ' + target + ']').select();
        }
    }

    private renderTimeline(containerId: string, time: any): any {
        let container = document.getElementById(containerId);

        // Create a DataSet (allows two way data-binding)
        let items = new vis.DataSet([
            // {id: 1, content: 'Events', start: '2018-04-27', end: '2018-06-15'}
            {
                id: 1,
                // content: 'Events',
                start: time.start,
                end: time.finish,
                // type: 'range'
            }
        ]);

        // Configuration for the Timeline
        let options = {
            // height: '6rem',
            showCurrentTime: true,
            // end: new Date(),
        };

        // Create a Timeline
        let timeline = new vis.Timeline(container, items, options);

        return timeline;
    }


    private changeView(requestedSystem: string, requestedView: string, requestedTarget: string): void {
        if (requestedView === this.constants.views.aggregation) {
            if (requestedSystem !== undefined) {
                let repository = this.settings.eiffelEventRepositories[requestedSystem];
                this.makeHistory(requestedSystem, requestedView, requestedTarget, 'Aggregation for ' + repository.name);

                if (requestedSystem !== this.cache.aggregation.systemId) {
                    this.activateLoader();
                    if (this.aggregationTimeline !== undefined) {
                        this.aggregationTimeline.destroy();
                    }
                    this.http.post<any>('/api/aggregationGraph', repository.preferences).subscribe(result => {
                        this.debug(result);

                        this.aggregationNodeData = {};
                        for (let nodeData in result.data.elements) {
                            let tmp = result.data.elements[nodeData].data;
                            if (tmp.quantities !== undefined) {
                                let tmpTable = [];
                                for (let property in tmp.quantities) {
                                    tmpTable.push({
                                        'key': property,
                                        'value': tmp.quantities[property],
                                    })
                                }
                                if (Object.keys(tmpTable).length !== 0) {
                                    tmp['table'] = tmpTable;
                                }
                            }

                            this.aggregationNodeData[tmp.id] = tmp;
                        }

                        // this.debug(this.aggregationNodeData);

                        this.aggregationCy = this.renderCytoscape('aggregation_graph', this.statusImages, this.router, this.constants, this.currentSystem, result.data.elements, repository.preferences, undefined);

                        this.aggregationCy.on('tap', 'node', (evt) => {
                            this.setAggregationTarget(evt.target.id());
                            this.router.navigate(['', this.currentSystem, this.constants.views.details, evt.target.id()]);
                        });

                        this.aggregationCy.on('mouseover', 'node', (evt) => {
                            if (!this.aggregationLockTooltip) {
                                this.aggregationHoverNode = evt.target.id();
                            }

                        });

                        this.aggregationCy.on('mouseout ', 'node', () => {
                            if (!this.aggregationLockTooltip) {
                                this.aggregationHoverNode = undefined;
                            }
                        });

                        this.aggregationCy.on('tap', (evt) => {
                            if (evt.target === this.aggregationCy) {
                                this.router.navigate(['', this.currentSystem, this.currentView, this.constants.params.undefined]);
                            }
                        });

                        this.aggregationCy.on('cxttap', (evt) => {
                            if (evt.target === this.aggregationCy) {
                                this.router.navigate(['', this.currentSystem, this.currentView, this.constants.params.undefined]);
                            }
                        });

                        this.aggregationCy.on('cxttap ', 'node', (evt) => {
                            this.router.navigate(['', this.currentSystem, this.currentView, evt.target.id()]);
                        });
                        // Timeline
                        this.aggregationTimeline = this.renderTimeline('aggregationTimeline', result.data.time);

                        this.cache.aggregation.systemId = requestedSystem;
                        this.cache.aggregation.target = requestedTarget;
                        this.isLoading = false;
                    });
                }
            }
        } else if (requestedView === this.constants.views.details) {
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
        } else if (requestedView === this.constants.views.detailsPlot) {
            if (requestedSystem !== undefined) {
                if (requestedTarget !== undefined) {
                    let repository = this.settings.eiffelEventRepositories[requestedSystem];
                    this.makeHistory(requestedSystem, requestedView, requestedTarget, 'Table for ' + repository.name + ' ' + requestedTarget);

                    if (requestedSystem !== this.cache.detailsPlot.systemId || requestedTarget !== this.cache.detailsPlot.target) {
                        this.activateLoader();
                        repository.preferences.detailsTargetId = requestedTarget;
                        this.http.post<any>('/api/detailedPlot', repository.preferences).subscribe(result => {

                            let plotData = result.data;
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
                                    graphHeight: '500px',
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

                                let groupsData: any = groups.get();
                                let legendDiv = document.getElementById("details_plot_legend");
                                legendDiv.innerHTML = "";

                                let legendContainer = $('#details_plot_legend');


                                // get for all groups:
                                for (let i = 0; i < groupsData.length; i++) {

                                    // let container = $('<div class="legend-toggle-container"></div>');
                                    let container = $('<div class="col col-lg-3 legend-toggle-container"></div>');

                                    // get the legend for this group.
                                    let legend = plot.getLegend(groupsData[i].id, 30, 30);

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
                                    // toggle.bootstrapToggle();

                                    toggle.change(function () {
                                        // _.defer(function () {

                                        groups.update({id: i, visible: $(this).prop('checked')});

                                        // });
                                    });
                                }

                            }

                            this.cache.detailsPlot.systemId = requestedSystem;
                            this.cache.detailsPlot.target = requestedTarget;
                            this.isLoading = false;
                        });
                    }
                }
            }
        } else if (requestedView === this.constants.views.eventChain) {
            if (requestedSystem !== undefined) {
                if (requestedTarget !== undefined) {
                    let repository = this.settings.eiffelEventRepositories[requestedSystem];
                    this.makeHistory(requestedSystem, requestedView, requestedTarget, 'Event chain for ' + repository.name + ' ' + requestedTarget);
                    if (requestedSystem !== this.cache.eventChain.systemId || requestedTarget !== this.cache.eventChain.target) {
                        this.activateLoader();
                        if (this.eventChainTimeline !== undefined) {
                            this.eventChainTimeline.destroy();
                        }
                        repository.preferences.eventChainTargetId = requestedTarget;
                        this.http.post<any>('/api/eventChainGraph', repository.preferences).subscribe(result => {
                            this.debug(result);

                            this.eventChainNodeData = {};
                            for (let nodeData in result.data.elements) {
                                let tmp = result.data.elements[nodeData].data;
                                this.eventChainNodeData[tmp.id] = tmp;

                                // for(let property in tmp.times){
                                //     tmp.times.property = tmp.times.property = moment()
                                // }

                                if (tmp.quantities !== undefined) {
                                    for (let property in tmp.quantities) {
                                        if (tmp.quantities[property] > 0) {
                                            tmp.result = property;
                                            break;
                                        }
                                    }
                                }
                            }
                            this.debug(this.eventChainNodeData);
                            this.eventChainCy = this.renderCytoscape('eventchain_graph', this.statusImages, this.router, this.constants, this.currentSystem, result.data.elements, repository.preferences, requestedTarget);

                            this.eventChainCy.on('mouseover', 'node', (evt) => {
                                if (!this.eventChainLockTooltip) {
                                    this.eventChainHoverNode = evt.target.id();
                                }
                            });

                            this.eventChainCy.on('mouseout ', 'node', () => {
                                if (!this.eventChainLockTooltip) {
                                    this.eventChainHoverNode = undefined;
                                }
                            });

                            this.eventChainCy.on('tap', 'node', (evt) => {
                                this.router.navigate(['', this.currentSystem, this.constants.views.eventChain, evt.target.id()]);
                            });

                            this.eventChainCy.on('tap', (evt) => {
                                if (evt.target === this.eventChainCy) {
                                    this.setEventChainHoverTarget(undefined);
                                }
                            });

                            this.eventChainCy.on('cxttap', (evt) => {
                                if (evt.target === this.eventChainCy) {
                                    this.setEventChainHoverTarget(undefined);
                                }
                            });

                            this.eventChainCy.on('cxttap ', 'node', (evt) => {
                                this.setEventChainHoverTarget(evt.target.id());
                            });

                            // Timeline
                            this.eventChainTimeline = this.renderTimeline('eventChainTimeline', result.data.time);


                            this.cache.eventChain.systemId = requestedSystem;
                            this.cache.eventChain.target = requestedTarget;

                            this.currentAggregationTarget = result.data.targetEvent.aggregateOn;
                            this.currentDetailsTarget = result.data.targetEvent.aggregateOn;
                            this.isLoading = false;
                        });
                    }
                }
            }
        }

    }

    setEventChainHoverTarget(target: string): void {
        this.eventChainLockTooltip = target !== undefined;
        this.eventChainHoverNode = target;
    }

    private formatTime(long: number): any {
        // return moment(long).format('YYYY-MM-DD, HH:mm:ss:SSS');
        return moment(long).format('YYYY-MM-DD, HH:mm:ss');
    }


    private renderCytoscape(containerId: string, statusImages: string[][], router: Router, constants: any, currentSystem: string, data: any, preferences: Preferences, target: string): any {
        let container = $('#' + containerId);
        let style = [
            {
                selector: 'node',
                style: {
                    'background-color': this.constants.colors.undefined,
                    // 'border-color': '#000',
                    // 'border-width': '1px',
                    // 'border-style': 'solid',
                    // 'ghost': 'yes',
                    // 'ghost-offset-x': 1,
                    // 'ghost-offset-y': 1,
                    // 'ghost-opacity': 0.5,
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
                    'shape-polygon-points': '-0.95 -0.77 -0.9 -0.82 -0.85 -0.87 -0.8 -0.91 -0.74 -0.94 -0.68 -0.97 -0.62' +
                        ' -0.98 -0.56 -1 -0.5 -1 -0.44 -1 -0.38 -0.98 -0.32 -0.97 -0.26 -0.94 -0.2 -0.91 -0.15 -0.87 -0.1' +
                        ' -0.82 -0.05 -0.77 0.05 -0.67 0.1 -0.62 0.15 -0.57 0.2 -0.53 0.26 -0.5 0.32 -0.47 0.38 -0.46 0.44' +
                        ' -0.44 0.5 -0.44 0.56 -0.44 0.62 -0.46 0.68 -0.47 0.74 -0.5 0.8 -0.53 0.85 -0.57 0.9 -0.62 0.95' +
                        ' -0.67 0.95 0.77 0.9 0.82 0.85 0.87 0.8 0.91 0.74 0.94 0.68 0.97 0.62 0.98 0.56 1 0.5 1 0.44 1' +
                        ' 0.38 0.98 0.32 0.97 0.26 0.94 0.2 0.91 0.15 0.87 0.1 0.82 0.05 0.77 -0.05 0.67 -0.1 0.62 -0.15' +
                        ' 0.57 -0.2 0.53 -0.26 0.5 -0.32 0.47 -0.38 0.46 -0.44 0.44 -0.5 0.44 -0.56 0.44 -0.62 0.46 -0.68' +
                        ' 0.47 -0.74 0.5 -0.8 0.53 -0.85 0.57 -0.9 0.62 -0.95 0.67',
                    'height': 60,
                    'width': 100,
                    'background-color': this.constants.colors.undefined,
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
                    'border-color': '#000',
                    'border-width': '1px',
                    'border-style': 'solid',
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
                    'shape-polygon-points': '0 -1 -0.5 -0.75 0 -0.5 0 0.125 0 -0.5 -0.5 -0.75 -0.5 -0.125 0 0.125 -0.5 -0.125 -1 0.125 -0.5 0.375 0 0.125 -0.5 0.375 -1 0.125 -1 0.75 -0.5 1 -0.5 0.375 -0.5 1 0 0.75 0 0.125 0 0.75 0.5 1 0.5 0.375 0.5 1 1 0.75 1 0.125 0.5 0.375 0 0.125 0.5 0.375 1 0.125 0.5 -0.125 0 0.125 0.5 -0.125 0.5 -0.75 0 -0.5 0.5 -0.75 0 -1',
                    'height': 70,
                    'width': 70,
                    'border-color': '#000',
                    'border-width': '1px',
                    'border-style': 'solid',
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
                    'pie-1-background-color': this.constants.colors.pass,
                    'pie-2-background-size': function (ele) {
                        /** @namespace ele.data().quantities.FAILURE */
                        let value = (ele.data().quantities.FAILURE);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-2-background-color': this.constants.colors.fail,
                    'pie-3-background-size': function (ele) {
                        /** @namespace ele.data().quantities.INCONCLUSIVE */
                        let value = (ele.data().quantities.INCONCLUSIVE);
                        if (value === undefined) {
                            value = 0;
                        }
                        return (value * 100 / ele.data().quantity).toString() + '%';
                    },
                    'pie-3-background-color': this.constants.colors.undefined
                }
            },
            {
                selector: 'node[type ^= "EiffelEnvironmentDefinedEvent"]',
                style: {
                    'shape': 'rhomboid',
                    'height': 50,
                    'width': 50,
                    'border-width': '1px',
                }
            },
            {
                selector: 'node[type ^= "EiffelSourceChangeCreatedEvent"]',
                style: {
                    'shape': 'octagon',
                    'height': 70,
                    'width': 70,
                    'background-color': '#fff',
                    // Credit: Git Logo by Jason Long is licensed under the Creative Commons Attribution 3.0 Unported License. https://git-scm.com/downloads/logos
                    'background-image': '/assets/images/Git-Icon-Black.png',
                    'background-height': '100%',
                    'background-width': '100%',
                    'background-position-x': '0px',
                }
            },
            {
                selector: 'node[type ^= "EiffelSourceChangeSubmittedEvent"]',
                style: {
                    'shape': 'octagon',
                    'height': 70,
                    'width': 70,
                    'background-color': '#fff',
                    // Credit: Git Logo by Jason Long is licensed under the Creative Commons Attribution 3.0 Unported License. https://git-scm.com/downloads/logos
                    'background-image': '/assets/images/Git-Icon-Black.png',
                    'background-height': '100%',
                    'background-width': '100%',
                    'background-position-x': '0px',
                }
            },
            {
                selector: 'node[type ^= "TestCase"]',
                style: {
                    'background-color': this.constants.colors.undefined,
                    'shape': 'roundrectangle',
                    'height': 50,
                    'width': 80,
                    'background-image': function (ele) {
                        return statusImages[ele.data().rates.success][ele.data().rates.fail]
                    },
                    'background-height': '100%',
                    'background-width': '100%',
                    'background-position-x': '0px',
                }
            },
            {
                selector: 'node[type ^= "TestSuite"]',
                style: {
                    'shape': 'roundrectangle',
                    // 'border-style': 'double', // solid, dotted, dashed, or double.
                    // 'border-width': '6px', // The size of the node’s border.
                    'height': 80,
                    'width': 100,
                    'background-color': this.constants.colors.undefined,
                    'background-position-x': '0px',
                    'background-image': function (ele) {
                        return statusImages[ele.data().rates.success][ele.data().rates.fail]
                    },
                    'background-height': '100%',
                    'background-width': '100%',
                }
            },
            {
                selector: 'node[type $= "(Culled)"]',
                style: {
                    'background-color': this.constants.colors.undefined,
                }
            },
        ];
        let layout = {
            name: 'dagre',
            rankDir: 'RL',
            // align: 'UR',
            ranker: 'network-simplex',
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

        // let containerHeight = container.height();

        cy.fit(50);
        // cy.panBy({
        //     x: 0,
        //     y: -cy.height() * 0.1,
        // });


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
                        return '<button view-event-id="' + full.id + '" class="btn btn-info btn-sm">Graph</button>';
                    }
                }
            ];

            let columns: any = preDefColumns.concat(plotData.columns);
            columns.forEach((column) => {
                if (column.renderType === 1) {

                    column.render = (data, type, row, meta) => {
                        return this.formatTime(Number(data));
                    }
                }
            });

            let tmp = container.DataTable({
                destroy: true,
                data: plotData.data,
                columns: columns,
                scrollY: 'calc(100vh - 15rem)',
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
        this.debug('ngOnInit Vici component');

        // Init some variable values
        this.cache = new CustomCache();
        this.cache.aggregation = {systemId: undefined, target: undefined};
        this.cache.details = {systemId: undefined, target: undefined};
        this.cache.detailsPlot = {systemId: undefined, target: undefined};
        this.cache.eventChain = {systemId: undefined, target: undefined};

        // Some jQuery / Bootstrap event handling
        $('#settingsModal').on('hide.bs.modal', () => {
            this.updateSystemReferences();

            let target = undefined;
            if (this.currentView === this.constants.views.aggregation) {
                target = this.currentAggregationTarget;
            } else if (this.currentView === this.constants.views.details) {
                target = this.currentDetailsTarget;
            } else if (this.currentView === this.constants.views.eventChain) {
                target = this.currentEventChainTarget;
            }
            this.changeView(this.currentSystem, this.currentView, target);
        });

        $('#newSystemModal').on('show.bs.modal', () => {
            this.newSystemInput.name = '';
            this.newSystemInput.url = '';
        });

        $('#historyDropdown').on('show.bs.dropdown', () => {
            this.updateHistoryDates();
        });

        // Generating status images for the aggregation graph nodes.
        let canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1;
        let ctx = canvas.getContext('2d');
        this.statusImages = [];
        for (let pass = 0; pass <= 100; pass++) {
            this.statusImages[pass] = [];
            for (let fail = 0; fail + pass <= 100; fail++) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = this.constants.colors.pass;
                ctx.fillRect(0, 0, 10 * pass, 1);
                ctx.fillStyle = this.constants.colors.fail;
                ctx.fillRect(10 * pass, 0, 10 * fail, 1);
                ctx.fillStyle = this.constants.colors.undefined;
                ctx.fillRect(10 * (pass + fail), 0, 10 * (100 - (pass + fail)), 1);
                this.statusImages[pass][fail] = canvas.toDataURL('image/jpeg', 1.0);
            }
        }

        // Scheduled tasks
        timer(0, 15000).subscribe(() => {
            this.updateHistoryDates();
        });

        // Fetching and handling settings from the server.
        this.http.get<Settings>('/api/getSettings').subscribe(result => {
            this.settings = result;
            this.updateSystemReferences();
            this.route.params.subscribe((params: Params) => {
                let requestedSystem = params[this.constants.params.system];
                if (requestedSystem === this.constants.params.undefined) {
                    requestedSystem = undefined;
                }

                let requestedView = params[this.constants.params.view];
                if (requestedView === this.constants.params.undefined) {
                    requestedView = undefined;
                }

                let requestedTarget = params[this.constants.params.target];
                if (requestedTarget === this.constants.params.undefined) {
                    requestedTarget = undefined;
                }

                this.changeView(requestedSystem, requestedView, requestedTarget);

                this.currentSystem = requestedSystem;
                if (this.currentSystem === undefined) {
                    this.currentSystemName = this.constants.messages.selectSystem;
                } else {
                    this.currentSystemName = this.settings.eiffelEventRepositories[this.currentSystem].name;
                }
                this.currentView = requestedView;
                if (requestedView === this.constants.views.details || requestedView === this.constants.views.detailsPlot) {
                    this.currentDetailsTarget = requestedTarget;
                } else if (requestedView === this.constants.views.eventChain) {
                    this.currentEventChainTarget = requestedTarget;
                } else if (requestedView === this.constants.views.aggregation) {
                    this.setAggregationTarget(requestedTarget);
                }
            });
        });
    }
}
