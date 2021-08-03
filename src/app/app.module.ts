import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { ComponentsModule } from './components/component.module';
import { AppComponent } from './app.component';

import { HttpClient, HttpClientModule , HTTP_INTERCEPTORS} from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    GoogleMapsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
