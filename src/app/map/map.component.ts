import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs/Rx";
import * as L from "leaflet";
import { GeocodingService } from "../geocoding.service";
import { MapService } from "../map.service";
import { Location } from "../location";

import "rxjs/add/operator/catch";
import { Cluster, Points, Path } from "../clusters";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit {
  address: string;

  constructor(
    private mapService: MapService,
    private geocoder: GeocodingService
  ) {
    this.address = "";
  }

  ngOnInit() {
    this.geocoder
      .getInitLocation()
      .catch(err => {
        console.error(err);

        // default map location
        const location = new Location();
        location.address = "Chicago, IL, USA";
        location.latlng = L.latLng(41.881832, -87.623177);

        return Observable.of(location);
      })
      .subscribe((location: Location) => {
        const map = L.map("map", {
          zoomControl: false,
          center: location.latlng,
          zoom: 12,
          minZoom: 4,
          maxZoom: 19,
          layers: [this.mapService.baseMaps.Google, this.mapService.routes.Init]
        });

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.layers(this.mapService.baseMaps, this.mapService.routes).addTo(map);
        L.geoJSON(Cluster).addTo(map);
        // L.geoJSON(Points,
        //   {
        //     pointToLayer: function(feature, latlng) {
        //       const icon = L.icon({
        //         iconUrl: "assets/marker-icon.png",
        //         shadowUrl: "assets/marker-shadow.png"
        //       });
        //         return L.marker(latlng, {icon: icon});
        //     }
        //   }
        // ).addTo(map);
        // L.geoJSON(Path).addTo(map);
        L.control.scale().addTo(map);

        this.address = location.address;
        this.mapService.map = map;
        // this.mapService.initMarkers();
      });
  }
}
