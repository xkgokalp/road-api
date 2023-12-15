import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoadService {
  private roadsUrl = 'https://verkehr.autobahn.de/o/autobahn';

  constructor(private http: HttpClient) {}

  getRoads(): Observable<any> {
    return this.http.get<any>(this.roadsUrl);
  }

  getRoadWorks(road: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/${road}/services/roadworks`);
  }

  getRoadWorksDetails(roadWorkId: string): Observable<any> {
    return this.http.get<any>(
      `${this.roadsUrl}/details/roadworks/${roadWorkId}`
    );
  }

  getWebcams(road: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/${road}/services/webcam`);
  }

  getWebcamDetails(webcamId: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/details/webcam/${webcamId}`);
  }

  getParkingLorry(road: string): Observable<any> {
    return this.http.get<any>(
      `${this.roadsUrl}/${road}/services/parking_lorry`
    );
  }

  getParkingLorryDetails(parkingLorryId: string): Observable<any> {
    return this.http.get<any>(
      `${this.roadsUrl}/details/parking_lorry/${parkingLorryId}`
    );
  }

  getWarning(road: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/${road}/services/warning`);
  }

  getWarningDetails(warningId: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/details/warning/${warningId}`);
  }

  getClosure(road: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/${road}/services/closure`);
  }

  getClosureDetails(closureId: string): Observable<any> {
    return this.http.get<any>(`${this.roadsUrl}/details/closure/${closureId}`);
  }

  getElectricChargingStation(road: string): Observable<any> {
    return this.http.get<any>(
      `${this.roadsUrl}/${road}/services/electric_charging_station`
    );
  }

  getElectricChargingStationDetails(StationId: string): Observable<any> {
    return this.http.get<any>(
      `${this.roadsUrl}/details/electric_charging_station/${StationId}`
    );
  }
}
