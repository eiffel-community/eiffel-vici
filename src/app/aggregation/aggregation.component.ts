import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from "@angular/common/http";
import {Settings} from "../settings";

@Component({
    selector: 'app-aggregation',
    templateUrl: './aggregation.component.html',
    styleUrls: ['./aggregation.component.styl']
})
export class AggregationComponent implements OnInit, OnDestroy {

    private sub: any;

    @Input() settings: Settings;

    @Input() selectedSystemId: string;
    @Input() selectedDetailsTarget: string;
    @Input() selectedEventId: string;

    constructor(private route: ActivatedRoute, private http: HttpClient) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            let tmp = params['systemId']; // (+) converts string 'id' to a number
            if (tmp === 'undefined') {
                tmp = undefined;
            }

            console.log(tmp);

            if (this.selectedSystemId !== tmp) {
                this.selectedSystemId = tmp;
                this.selectedDetailsTarget = undefined;
                this.selectedEventId = undefined;

                // todo loadingscreen
                // todo use cache

                if (this.selectedSystemId !== undefined) {
                    console.log('gitting agg');
                    let preferences = this.settings.eiffelEventRepositories[this.selectedSystemId];
                    this.http.post<any>('/api/aggregationGraph', preferences).subscribe(result => {
                        console.log(result);
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
                } else {
                    // todo
                }


            }

            // In a real app: dispatch action to load the details here.

        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
