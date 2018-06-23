import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { HttpClient, HttpParams } from "@angular/common/http";
import { OriginDestPoints, MyNode } from "./coordinates";
import { Observable } from "rxjs/Observable";

@Injectable()
export class CoordinatesService {
  isLogin = new BehaviorSubject<boolean>(false);
  token: string;
  httpOptions: any;

  constructor(private http: HttpClient) { }

  getPath( coordinates: OriginDestPoints ) {
    this.httpOptions = {
        params: new HttpParams().set("longitude_original", coordinates.longitude_original.toString())
        .set("latitude_original", coordinates.latitude_original.toString())
        .set("longitude_destination", coordinates.longitude_destination.toString())
        .set("latitude_destination", coordinates.latitude_destination.toString())
      };
    return this.http.get<MyNode>("http://127.0.0.1:8000/path", this.httpOptions);
  }

  public getJSON(): Observable<any> {
    return this.http.get("./assets/response.json");
  }

}
