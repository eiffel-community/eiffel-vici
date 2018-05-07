import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SystemReference} from "../system-reference";
import {System} from "../system";

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.styl']
})
export class NavbarComponent implements OnInit {
    // @Input() settings: Settings;
    systemReferences: SystemReference[];
    // @Input() selectedSystemId: string;
    // @Input() selectedDetailsTarget: string;
    // @Input() selectedEventId: string;

    constructor(private http: HttpClient) {
    }

    updateSystemReferences(eiffelEventRepositories: { [id: string]: System }): void {
        console.log(this.systemReferences);
        this.systemReferences = [];
        for (let eiffelEventRepositoriesKey in eiffelEventRepositories) {
            let system = eiffelEventRepositories[eiffelEventRepositoriesKey];
            let tmp = new SystemReference();
            tmp.id = system.id;
            tmp.name = system.name;
            this.systemReferences.push(tmp);
        }
        console.log(this.systemReferences);
    }


    ngOnInit() {

    }

}
