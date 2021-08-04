import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { MapInfoWindow, MapMarker, GoogleMap, MapDirectionsRenderer} from '@angular/google-maps'
import { locationService } from './services/locationService/locationService';
import { nearByStore } from 'src/app/models/nearByStore';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

//declare const google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  //@ViewChild(GoogleMap) map!: GoogleMap;
  @ViewChild(GoogleMap, { static: false }) map?: GoogleMap;
  @ViewChild('sidebar', { static: false }) public sideBarPanel?: HTMLDivElement;
  public title = 'Store Finder';
  public zoom = 12
  public center: google.maps.LatLngLiteral = { lat: 51.6122216, lng:5.5215954 };
  
  public latitude: any;
  public longitude: any;
  public listNearStores: any = [];
  public nearByStore: nearByStore = { addressName: "", city: "", latitude: 0, longitude: 0 };
  public markers = [] as any;
  public response: any;
  public renderer: any;
  public request: any;
  public flag_permissions: boolean = false;

  //directionsRelated Fields
  public directionsRenderer: any;
  public originLat: any;
  public originLng: any;
  public destinationLatLng: any;

  public options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    fullscreenControl: false
  };

  constructor(private locationService: locationService, private sanitized: DomSanitizer){

   }

  async ngOnInit(){
    if (navigator.geolocation) {
       
       navigator.geolocation.getCurrentPosition(
         (position)=>{
        console.log("Geolocation coordinates", this.latitude, this.longitude);
        //this.storeCurrentLocation(longitude, latitude);
        
        this.callApi(this.longitude, this.latitude);
        this.flag_permissions = true;
      });
      
  } else {
     console.log("No support for geolocation")
     this.flag_permissions = false;
  }

  }

  async ngAfterViewInit(){

  }

  async logCenter():Promise<void> {
    await this.loadMarkerData().then( (response)=>
    {
        this.centerMapOnMarkerBounds(response);
    }
    );
    
    //console.log(JSON.stringify(this.map?.getCenter()))
  }

  async centerMapOnMarkerBounds(markers: any){
    let bounds = await this.getBounds();
    this.map?.googleMap!.fitBounds(bounds);
  
  }

  async loadMarkerData():Promise<any>{
      //let nearByStore = await JSON.parse(data);

      if(this.listNearStores.length > 0){
      for(let i=0; i< this.listNearStores.length; i++){
        //console.log("nearByStore Dynamic", this.listNearStores[i]); //use i instead of 0
        
        const marker = new google.maps.Marker({
          position: { lat: this.listNearStores[i].latitude, lng: this.listNearStores[i].longitude },
          title: "Click for detailed route instructions",
          icon: "./assets/images/custom-jumbo-logo.png",
          label: {
            color: 'red',
            text: this.listNearStores[i].latitude + "," + this.listNearStores[i].longitude,
          },
         // map: this.map?.googleMap
        })
         this.markers.push(marker); 
    }
      
      }else{
        console.log("empty array found");
      }
    return this.markers;
  }

  openInfo(marker : any) {
    this.getDirectionsToClickedStore(marker.getPosition().lat(), marker.getPosition().lng());

  }

  async getDirectionsToClickedStore(destLat: number, destLng: number ){
    
    //console.log("All values in play before call =>", this.latitude);
    //console.log("All values in play before call =>", this.longitude);
    //console.log("All values in play before call =>", destLat);
    //console.log("All values in play before call =>", destLng);
    //console.log("this map instance object => ", this.map);

    const directionsDisplay = new google.maps.DirectionsRenderer();
    this.renderer = directionsDisplay;
    //optionRenderer.map? = this.map?.googleMap;
    directionsDisplay.setMap(this.map?.googleMap!);
    directionsDisplay.setPanel(
      document.getElementById("sidebar") as HTMLElement
    );

    directionsDisplay.getPanel().innerHTML = "";
    
    console.log("sideBarPanelReference => ", this.sideBarPanel);
    console.log("display center as a test : " + directionsDisplay.getMap().getCenter());


  await this.locationService.getDirectionFromPoint2Point(this.latitude, this.longitude, destLat, destLng).then(
    (response)=>{
      //console.log("respuesta ApiClient antes de => ", response);
      this.response = response;
      
    });

    let request = {
      origin: this.latitude+","+this.longitude,
      destination: this.destinationLatLng,
      travelMode:  google.maps.TravelMode.DRIVING
    }

    this.renderDirections(this.map, this.response, request);
  }



  async centerMapCurrentLocation(): Promise<any>{
    if (sessionStorage.getItem("currentLongitude") != null && sessionStorage.getItem("currentLatitude") != null) {
      this.originLat = sessionStorage.getItem("currentLatitude");
      this.originLng = sessionStorage.getItem("currentLongitude");
        this.center = {
          lat: parseFloat(this.originLat),
          lng: parseFloat(this.originLng),
        }
      
    }
  }

  async getBounds(){
    let north;
    let south;
    let east;
    let west;

  console.log("inside of bouds", this.markers[0].getPosition().lat());
    for (const marker of this.markers){
      

      // set the coordinates to marker's lat and lng on the first run.
      // if the coordinates exist, get max or min depends on the coordinates.
      north = north !== undefined ? Math.max(north, marker.getPosition().lat()) : marker.getPosition().lat();
      south = south !== undefined ? Math.min(south, marker.getPosition().lat()) : marker.getPosition().lat();
      east = east !== undefined ? Math.max(east, marker.getPosition().lng()) : marker.getPosition().lng();
      west = west !== undefined ? Math.min(west, marker.getPosition().lng()) : marker.getPosition().lng();
    };
   
      //{ north, south, east, west };

           let northeast = {
              lat : north,
              lng : east
            };
            let southwest = {
              lat : south,
              lng : west
            };
       

            //console.log("in bounds before LatLngBounds", northeast, southwest);
        let bounds = new google.maps.LatLngBounds(
          this.asLatLng(southwest),
          this.asLatLng(northeast)
        );
  
    return bounds;
  }

  renderDirections(mapVariable: any, response: any, request: any){
    //console.log("renderDirections request => ",request);
    //console.log("renderDirections response => ",response.routes);
   // console.log("renderDirections response => ",response.routes);
    this.renderer.setOptions({ 
              directions : {
                      routes : this.routesHandler(response.routes),
                      request : request
                    },
              draggable : true,
              
            
        
       //map : mapVariable
    });

    
}
 asBounds(boundsObject: any){
   //console.log("boundsObject", boundsObject);
   
    return new google.maps.LatLngBounds(this.asLatLng(boundsObject.southwest),
                                    this.asLatLng(boundsObject.northeast));
}

 asLatLng(latLngObject: any){
   //console.log("lATLngObject", latLngObject);
    return new google.maps.LatLng(latLngObject.lat, latLngObject.lng);
}

 asPath(encodedPolyObject: any){
    return google.maps.geometry.encoding.decodePath( encodedPolyObject.points );
}

routesHandler(routes: any){
  for(let x = 0; x < routes.length; x++){
        //console.log("total of routes found =>", routes.length);
        routes[x].bounds = this.asBounds(routes[x].bounds);
        routes[x].overview_path = this.asPath(routes[x].overviewPolyline);

        for(let i = 0; i < routes[x].legs.length; i++){
         // console.log("total of legs found =>", routes[x].legs.length);

          routes[x].legs[i].start_location = this.asLatLng(routes[x].legs[i].startLocation);
          routes[x].legs[i].end_location   = this.asLatLng(routes[x].legs[i].endLocation);
          routes[x].legs[i].start_address = (routes[x].legs[i].startAddress);
          routes[x].legs[i].end_address   = (routes[x].legs[i].endAddress);
          

            for(let z = 0; z < routes[x].legs[i].steps.length; z++){
              //console.log("total of steps found =>", routes[x].legs[i].steps.length);
              //console.log("passing the directions", routes[x].legs[i].steps[z].htmlInstructions);
              routes[x].legs[i].steps[z].start_location = this.asLatLng(routes[x].legs[i].steps[z].startLocation);
              routes[x].legs[i].steps[z].end_location = this.asLatLng(routes[x].legs[i].steps[z].endLocation);
              routes[x].legs[i].steps[z].instructions = routes[x].legs[i].steps[z].htmlInstructions;
              routes[x].legs[i].steps[z].path = this.asPath(routes[x].legs[i].steps[z].polyline);
              routes[x].legs[i].steps[z].travel_mode = routes[x].legs[i].steps[z].travelMode;
    
              //routes[x].legs[i].steps[z] =  routes[x].legs[i].steps[z];
            }
        }

  }
  return routes;
}

async callApi(Longitude: number, Latitude: number){
  console.log("insideCallApi");
  const url = `https://localhost/storeLocator/service/userLocation?lon=${Longitude}&lat=${Latitude}`
  //console.log(url);
  await this.locationService.sendUserLocationToService(Longitude, Latitude).then(
     (resp)=>{
      //console.log("response inside then", resp);
      
      for (let index = 0; index < resp.length; index++) {
        let values: nearByStore = { addressName: "", city: "", latitude: 0, longitude: 0 };
        console.log("b mode = ",resp[index].addressName);
        values.addressName = resp[index].addressName;
        values.city = resp[index].city.toLowerCase();
        values.latitude = parseFloat(resp[index].latitude);
        values.longitude = parseFloat(resp[index].longitude);
        this.listNearStores.push(values);
      }
    }
     
  );
  
 // await this.saveNearLocationsToLocalSorage();
  //this.pageRefresher();
}
}
