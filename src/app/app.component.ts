import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RoadService } from './services/road.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HomeComponent,
    HttpClientModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [RoadService],
})
export class AppComponent {
  title = 'road-api';
}
