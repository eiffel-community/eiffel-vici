import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from "@angular/router";

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.styl']
})
export class DetailsComponent implements OnInit {

    constructor(
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        // this.route.params.forEach((params: Params) => {
        //     $scope.message = params;
        //     console.log(params);
        //     // if (params['aggregationKey'] !== undefined) {
        //     //     console.log(params['aggregationKey'])
        //     // } else {
        //     //     //    TODO
        //     // }
        // });
    }

}
