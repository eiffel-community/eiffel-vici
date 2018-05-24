import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {OcticonsDirective} from './octicons.directive';
import {RouterModule, Routes} from "@angular/router";
import {ViciComponent} from './vici/vici.component';
import {FormsModule} from "@angular/forms";
import {environment} from "../environments/environment";
import {MomentModule} from "angular2-moment";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AngularFontAwesomeModule} from "angular-font-awesome";
import {DataTablesModule} from "angular-datatables";

const appRoutes: Routes = [
    {
        path: ':' + environment.params.system + '/:' + environment.params.view + '/:' + environment.params.target + '',
        component: ViciComponent
    },
    // {path: '', component: ViciComponent},
    {
        path: '',
        redirectTo: environment.params.undefined + '/' + environment.views.home + '/' + environment.params.undefined,
        pathMatch: 'full'
    },
    // {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    declarations: [
        AppComponent,
        OcticonsDirective,
        ViciComponent,
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(
            appRoutes,
            // {enableTracing: true} // <-- debugging purposes only
        ),
        HttpClientModule,
        FormsModule,
        MomentModule,
        NgbModule.forRoot(),
        AngularFontAwesomeModule,
        DataTablesModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
