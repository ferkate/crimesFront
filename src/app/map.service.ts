import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Location } from "./location";
import * as L from "leaflet";
import { OriginDestPoints, MyNode } from "./coordinates";
import { CoordinatesService } from "./coordinates.service";
import { Observable } from "rxjs/Observable";

@Injectable()
export class MapService {
  public map: L.Map;
  public baseMaps: any;
  private vtLayer: any;
  public routes: any;
  private pointscount: number;
  private coordinatesPath: OriginDestPoints;
  httpOptions: any;
  urlParams: string;
  nodesArr: L.LatLngExpression[];

  constructor(private http: HttpClient) {
    this.pointscount = 0;
    const osmAttr =
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, " +
      "Tiles courtesy of <a href='http://hot.openstreetmap.org/' target='_blank'>Humanitarian OpenStreetMap Team</a>";

    const esriAttr =
      "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, " +
      "iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, " +
      "Esri China (Hong Kong), and the GIS User Community";

    const cartoAttr =
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> " +
      "&copy; <a href='http://cartodb.com/attributions'>CartoDB</a>";

    this.baseMaps = {
      OpenStreetMap: L.tileLayer(
        "http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        {
          attribution: osmAttr
        }
      ),
      Esri: L.tileLayer(
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: esriAttr
        }
      ),
      CartoDB: L.tileLayer(
        "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        {
          attribution: cartoAttr
        }
      ),
      Google: L.tileLayer(
        "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          detectRetina: true
        }
      )
    };
    this.routes = {
      Init: L.polyline([[41.8904222, -87.676472]
      ], { color: "blue" }),
    };
  }

  disableMouseEvent(elementId: string) {
    const element = <HTMLElement>document.getElementById(elementId);

    L.DomEvent.disableClickPropagation(element);
    L.DomEvent.disableScrollPropagation(element);
  }

  toggleAirPortLayer(on: boolean) {
    if (on) {
      this.http.get("assets/airports.min.geojson").subscribe(result => {
        this.vtLayer = L.vectorGrid.slicer(result);
        this.vtLayer.addTo(this.map);
      });
    } else if (this.vtLayer) {
      this.map.removeLayer(this.vtLayer);
      delete this.vtLayer;
    }
  }

  toggleMarkerEditing(on: boolean) {
    if (on) {
      this.map.on("click", this.addMarker.bind(this));
    } else {
      this.map.off("click");
    }
  }

  fitBounds(bounds: L.LatLngBounds) {
    this.map.fitBounds(bounds, {});
  }

  private addMarker(e: L.LeafletMouseEvent) {
    const shortLat = Math.round(e.latlng.lat * 1000000) / 1000000;
    const shortLng = Math.round(e.latlng.lng * 1000000) / 1000000;
    const popup = `<div>Latitude: ${shortLat}<div><div>Longitude: ${shortLng}<div>`;
    const icon = L.icon({
      iconUrl: "assets/marker-icon.png",
      shadowUrl: "assets/marker-shadow.png"
    });

    if (this.pointscount < 2) {
      if (this.pointscount === 0) {
        this.coordinatesPath = new OriginDestPoints();
        this.coordinatesPath.latitude_original = e.latlng.lat;
        this.coordinatesPath.longitude_original = e.latlng.lat;
      } else {
        this.coordinatesPath.latitude_destination = e.latlng.lat;
        this.coordinatesPath.longitude_destination = e.latlng.lat;
      }
      this.pointscount = this.pointscount + 1;

      const marker = L.marker(e.latlng, {
        draggable: true,
        icon
      })
        .bindPopup(popup, {
          offset: L.point(12, 6)
        })
        .addTo(this.map)
        .openPopup();
      marker.on("click", () => marker.remove());
    }
    if (this.pointscount === 2) {
      // build path

      this.getPath(this.coordinatesPath).subscribe(data => {
        this.convertToArray(data);
        this.routes.Init = L.polyline(this.nodesArr, { color: "red" }).addTo(this.map);
      });

      // this.getJSON().subscribe(data => {
      //   // console.log(data);
      //   this.convertToArray(data);
      //   this.routes.Init = L.polyline(this.nodesArr, { color: "red" }).addTo(this.map);
      // });
    }
  }

  public initMarkers() {
    const shortLat = Math.round(41.890275 * 1000000) / 1000000;
    const shortLng = Math.round(-87.676431 * 1000000) / 1000000;
    const popup = `<div>Latitude: ${shortLat}<div><div>Longitude: ${shortLng}<div>`;
    const icon = L.icon({
      iconUrl: "assets/marker-icon.png",
      shadowUrl: "assets/marker-shadow.png"
    });

    const marker = L.marker(new L.LatLng(-87.676431, 41.890275), {
      draggable: true,
      icon
    }).bindPopup(popup, {
      offset: L.point(12, 6)
    })
      .addTo(this.map)
      .openPopup();

    const markerTo = L.marker(new L.LatLng(-87.698992, 41.855396), {
      draggable: true,
      icon
    }).addTo(this.map);
  }

  getPath( coordinates: OriginDestPoints ) {
    // this.httpOptions = {
    //     params: new HttpParams().set("longitude_original", coordinates.longitude_original.toString())
    //     .set("latitude_original", coordinates.latitude_original.toString())
    //     .set("longitude_destination", coordinates.longitude_destination.toString())
    //     .set("latitude_destination", coordinates.latitude_destination.toString())
    //   };
    this.urlParams = "?longitude_original=" + coordinates.longitude_original.toString();
    this.urlParams += "&latitude_original=" + coordinates.latitude_original.toString();
    this.urlParams += "&longitude_destination=", coordinates.longitude_destination.toString();
    this.urlParams += "&latitude_destination=", coordinates.latitude_destination.toString();
    return this.http.get<MyNode>("http://127.0.0.1:8000/path" + this.urlParams);
  }

  getJSON(): Observable<MyNode> {
    return this.http.get<MyNode>("./assets/response.json");
  }

  convertToArray(node: MyNode) {
    this.nodesArr = new Array<L.LatLngExpression>();
    for (let i = 0; i < node.nodes.length; i++) {
      let row: L.LatLngExpression = new L.LatLng(node.nodes[i].y, node.nodes[i].x);
      this.nodesArr.push(row);
    }
    // console.log(this.nodesArr);
  }

}
