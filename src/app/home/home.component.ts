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
  name?: string;
  roadworks?: string[];

  Direction?: string[];
  webcams?: string[];
  parkinglorry?: string[];
  warning?: string[];
  closure?: string[];
  electricchargingstation?: string[];
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
    'name',
    'roadworks',
    'Direction',
    'parkinglorry',
    'warning',
    'closure',
    'electricchargingstation',
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
              const roadWorkTitles = roadWorksData.roadworks.map(
                (work: any) => work.title
              );

              // const roadWorkId = roadWorksData.roadworks.map(
              //   (work: any) => work.identifier
              // );

              const roadWorkDescriptions = roadWorksData.roadworks.map(
                (work: any) => work.description
              );
              const RoadWorkDirection = roadWorksData.roadworks.map(
                (work: any) => work.subtitle
              );
              const firstRoadWorkDirection = RoadWorkDirection[0];
              const firstRoadWorkDescription = roadWorkDescriptions[0];

              const parkingLorryTitles = parkingLorryData.parking_lorry.map(
                (lorry: any) => lorry.title
              );

              const parkingLorryDescriptions =
                parkingLorryData.parking_lorry.map(
                  (lorry: any) => lorry.description
                );
              const firstParkingLorryDescription = parkingLorryDescriptions[0];

              const warningTitles = warningData.warning.map(
                (warning: any) => warning.title
              );
              const closureTitles = closureData.closure.map(
                (closure: any) => closure.title
              );
              const stationTitles = stationData.electric_charging_station.map(
                (station: any) => station.title
              );

              const stationDescriptions =
                stationData.electric_charging_station.map(
                  (station: any) => station.description
                );

              const firstStationDescription = stationDescriptions[0];

              return {
                name: roadName,
                roadworks: firstRoadWorkDescription,
                Direction: firstRoadWorkDirection,
                parkinglorry: firstParkingLorryDescription,
                warning: warningTitles,
                closure: closureTitles,
                electricchargingstation: firstStationDescription,
              } as RoadStatus;
            }
          ),
          catchError((error) => {
            console.error(`Error loading data for ${roadName}`, error);
            // Returning of(null) or an empty object to not interrupt the whole process
            return of(null);
          })
        );
      });

      forkJoin(observables).subscribe((results: any) => {
        this.dataSource = new MatTableDataSource(
          results.filter((result: any) => result !== null)
        );
        this.dataSource.paginator = this.paginator; // Set the paginator after the data is loaded.
        this.paginator.length = this.dataSource.data.length;
      });
    });
  }
}

// loadRoads() {
//   this.roadService.getRoads().subscribe((data) => {
//     this.dataSource = data.roads.map((name: string) => ({ name }));
//   });
// }

//   loadRoadWorks() {
//     // Önce tüm yolları çek
//     this.roadService.getRoads().subscribe((data) => {
//       // Her bir yol için roadworks bilgilerini çek
//       data.roads.forEach((roadName: string) => {
//         this.roadService.getRoadWorks(roadName).subscribe(
//           (roadWorksData) => {
//             const roadWorkTitles = roadWorksData.roadworks.map((work: any) => {
//               return work.title;
//             });
//             // Her bir roadworks bilgisini dataSource'a ekle
//             this.dataSource.push({
//               name: roadName,
//               roadworks: roadWorkTitles, // Eğer roadworks içinde özel bir alan adı varsa onu kullanabilirsiniz
//             });

//             // dataSource güncellendiğinde Angular'a değişikliği bildir
//             this.dataSource = [...this.dataSource];

//             //console.log(this.dataSource);
//           }
//           // (error) => {
//           //   console.error(`Error retrieving roadworks for ${roadName}:`, error);
//           // }
//         );
//       });
//     });
//   }

//   loadParkingLorry() {
//     // Önce tüm yolları çek
//     this.roadService.getRoads().subscribe((data) => {
//       // Her bir yol için roadworks bilgilerini çek
//       data.roads.forEach((roadName: string) => {
//         this.roadService.getParkingLorry(roadName).subscribe(
//           (parkingLorryData) => {
//             //console.log(parkingLorryData);
//             const parkingLorryTitles = parkingLorryData.parking_lorry.map(
//               (lorry: any) => {
//                 return lorry.title;
//               }
//             );
//             //console.log(parkingLorryTitles);
//             // Her bir roadworks bilgisini dataSource'a ekle
//             this.dataSource.push({
//               parkinglorry: parkingLorryTitles, // Eğer roadworks içinde özel bir alan adı varsa onu kullanabilirsiniz
//             });

//             // dataSource güncellendiğinde Angular'a değişikliği bildir
//             this.dataSource = [...this.dataSource];

//             //console.log('data soruce :', this.dataSource);
//           }
//           // (error) => {
//           //   console.error(`Error retrieving roadworks for ${roadName}:`, error);
//           // }
//         );
//       });
//     });
//   }

// loadWebcams() {
//   this.roadService.getRoads().subscribe((data) => {
//     // Her bir yol için roadworks bilgilerini çek
//     data.roads.forEach((roadName: string) => {
//       this.roadService.getWebcams(roadName).subscribe(
//         (webcamData) => {
//           console.log(webcamData);
//           const webcamTitles = webcamData.webcams.map((webcam: any) => {
//             return webcam.title;
//           });

//           // Her bir roadworks bilgisini dataSource'a ekle
//           this.dataSource.push({
//             webcams: webcamTitles, // Eğer roadworks içinde özel bir alan adı varsa onu kullanabilirsiniz
//           });

//           // dataSource güncellendiğinde Angular'a değişikliği bildir
//           this.dataSource = [...this.dataSource];

//           //console.log(this.dataSource);
//         },
//         (error) => {
//           console.error(`Error retrieving roadworks for ${roadName}:`, error);
//         }
//       );
//     });
//   });
// }
// }
