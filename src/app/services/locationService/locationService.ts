import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
  })

export class locationService{

    urlService = environment.URL_LOCATION;

    constructor(private http: HttpClient) { }

    async sendUserLocationToService(long: number, lat: number): Promise<any>{
    let url = `${this.urlService}`;
        console.log("url supposed to be called", `${url}/storeLocator/${lat}/${long}`);
    return await this.http.get(`${url}/storeLocator/${lat}/${long}`).toPromise();

    }

    async getDirectionFromPoint2Point(oriLat: number, oriLng: number, destiLat: number, destiLng: number): Promise<any>{
        let url = `${this.urlService}`;
        //let lat = 52.3738;
        //let long = 4.89093;
        console.log("url supposed to be called", `${url}/storeLocator/gApiDirection/${oriLat}/${oriLng}/${destiLat}/${destiLng}`);
        
        return await this.http.get(`${url}/storeLocator/gApiDirection/${oriLat}/${oriLng}/${destiLat}/${destiLng}`).toPromise();
    
    }
}

  