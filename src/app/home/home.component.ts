import { Component, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { RoadService } from '../services/road.service';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface RoadStatus {
  RoadName?: string;
  Roadworks?: string[];

  Direction?: string[];
  webcams?: string[];
  ParkingLorry?: string[];
  Warning?: string[];
  Closure?: string[];
  ElectricChargingStation?: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatPaginatorModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  dataSource: MatTableDataSource<RoadStatus> =
    new MatTableDataSource<RoadStatus>([]);
  columnsToDisplay = [
    'RoadName',
    'Roadworks',
    'Direction',
    'ParkingLorry',
    'Warning',
    'Closure',
    'ElectricChargingStation',
  ];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  toggleRow(element: RoadStatus) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }
  expandedElement: RoadStatus | null = null;

  constructor(private roadService: RoadService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.roadService.getRoads().subscribe((data) => {
      const observables = data.roads.map((roadName: string) => {
        const roadWorksObservable = this.roadService.getRoadWorks(roadName);
        const parkingLorryObservable =
          this.roadService.getParkingLorry(roadName);
        const warningObservable = this.roadService.getWarning(roadName);
        const closureObservable = this.roadService.getClosure(roadName);
        const electricChargingStationObservable =
          this.roadService.getElectricChargingStation(roadName);

        return forkJoin([
          roadWorksObservable,
          parkingLorryObservable,
          warningObservable,
          closureObservable,
          electricChargingStationObservable,
        ]).pipe(
          map(
            ([
              roadWorksData,
              parkingLorryData,
              warningData,
              closureData,
              stationData,
            ]) => {
              // Roadworks
              const roadWorkDescriptions = roadWorksData.roadworks.map(
                (work: any) => {
                  if (work.description) return work.description;
                  else return 'No Roadwork';
                }
              );
              const firstRoadWorkDescription = roadWorkDescriptions[0];

              // Direction
              const RoadWorkDirection = roadWorksData.roadworks.map(
                (work: any) => {
                  if (work.subtitle) return work.subtitle;
                  else return 'No Direction';
                }
              );
              const firstRoadWorkDirection = RoadWorkDirection[0];

              // Parking Lorry
              const parkingLorryDescriptions =
                parkingLorryData.parking_lorry.map(
                  (lorry: any) => `${lorry.title} \n ${lorry.subtitle}`
                );
              const firstParkingLorryDescription = parkingLorryDescriptions[0];

              // Warning
              const warningTitles = warningData.warning.map((warning: any) => {
                if (warning.title) return warning.title;
                else return 'No Warning';
              });

              // Closure
              const closureDescriptions = closureData.closure.map(
                (closure: any) => {
                  if (closure.future === true) {
                    const date = new Date(closure.startTimestamp);
                    const formattedDate = `${date.getDate()}.${
                      date.getMonth() + 1
                    }.${date.getFullYear()}`;
                    return `Closure on ${closure.title} from \n ${formattedDate}`;
                  } else {
                    return `No Closure`;
                  }
                }
              );

              const firstClosureDescription = closureDescriptions[0];

              // Electric Charging Station
              const stationDescriptions =
                stationData.electric_charging_station.map((station: any) => {
                  if (station.coordinate) {
                    const lat = parseFloat(station.coordinate.lat);
                    const formattedLat = isNaN(lat)
                      ? 'Invalid Lat'
                      : lat.toFixed(1);
                    const long = parseFloat(station.coordinate.long);
                    const formattedLong = isNaN(long)
                      ? 'Invalid Long'
                      : long.toFixed(1);

                    return `Station at coordinates :\n (${formattedLat} , ${formattedLong})   `;
                  } else return 'No Station';
                });

              const firstStationDescription = stationDescriptions[0];

              return {
                RoadName: roadName,
                Roadworks: firstRoadWorkDescription,
                Direction: firstRoadWorkDirection,
                ParkingLorry: firstParkingLorryDescription,
                Warning: warningTitles,
                Closure: firstClosureDescription,
                ElectricChargingStation: firstStationDescription,
              } as RoadStatus;
            }
          ),
          catchError((error) => {
            console.error(`Error loading data for ${roadName}`, error);
            return of(null);
          })
        );
      });

      forkJoin(observables).subscribe((results: any) => {
        this.dataSource = new MatTableDataSource(
          results.filter((result: any) => result !== null)
        );
        this.dataSource.paginator = this.paginator; // For pagination
        this.paginator.length = this.dataSource.data.length;
      });
    });
  }
}
