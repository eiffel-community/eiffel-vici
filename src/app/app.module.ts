import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';


import {AppComponent} from './app.component';
import {NavbarComponent} from './navbar/navbar.component';
import {OcticonsDirective} from './octicons.directive';
import {RouterModule, Routes} from "@angular/router";
import {AggregationComponent} from './aggregation/aggregation.component';
import {DetailsComponent} from './details/details.component';
import {EventchainComponent} from './eventchain/eventchain.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {StartComponent} from './start/start.component';

const appRoutes: Routes = [
    // {path: '', redirectTo: '/', pathMatch: 'full'},
    {path: '', component: StartComponent},
    {path: 'aggregation', redirectTo: '', pathMatch: 'full'},
    {path: 'aggregation/:systemId', component: AggregationComponent},

    // {path: 'details', component: DetailsComponent},
    {path: 'details/:detailsTarget', component: DetailsComponent},
    // {path: 'eventchain', component: EventchainComponent},
    {path: 'eventchain/:targetEventId', component: EventchainComponent},
    // {path: 'details', component: DetailsComponent},
    // { path: 'hero/:id',      component: HeroDetailComponent },
    // {
    //     path: 'heroes',
    //     component: HeroListComponent,
    //     data: { title: 'Heroes List' }
    // },
    // { path: '',
    //     redirectTo: '/heroes',
    //     pathMatch: 'full'
    // },
    // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        OcticonsDirective,
        AggregationComponent,
        DetailsComponent,
        EventchainComponent,
        StartComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(
            appRoutes,
            // {enableTracing: true} // <-- debugging purposes only
        ),
        NgbModule.forRoot(),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
