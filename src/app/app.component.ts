import {Component, OnInit, ViewChild} from '@angular/core';
import {Settings} from "./settings";
import {HttpClient} from "@angular/common/http";
import {NavbarComponent} from "./navbar/navbar.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {
    title = 'app';
    settings: Settings;
    // systemReferences: SystemReference[];

    selectedSystemId: string;
    selectedDetailsTarget: string;
    selectedEventId: string;

    @ViewChild(NavbarComponent) navbarComponent;

    constructor(private http: HttpClient) {
    }


    resetSettingsFromServer(): void {
        this.http.get<Settings>('/api/getSettings').subscribe(result => {
            // console.log(result);
            // for (let eiffelEventRepositoriesKey in result.eiffelEventRepositories) {
            //     this.systems.push(result.eiffelEventRepositories[eiffelEventRepositoriesKey]);
            // }
            this.settings = result;
            console.log(this.settings);
            this.navbarComponent.updateSystemReferences(this.settings.eiffelEventRepositories);
            // this.updateSystemReferences();
        });
    }

    ngOnInit() {
        this.resetSettingsFromServer();


        // console.log(this.systems);
        // this.http.get<System>('/api/getDefaultEiffelEventRepository').subscribe(result => {
        //     console.log(result);
        //     result.name = "new";
        //     this.systems.push(result);
        //     console.log(this.systems);
        //     // this.ref.detectChanges();
        // });

    }
}
