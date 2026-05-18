import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent {
  stats = [
    { value: '2+', label: 'Years Experience' },
    { value: '1K+', label: 'Users Served' },
    { value: '5+', label: 'Microservices Built' },
    { value: 'OCI', label: 'Certified' },
  ];

  certifications = [
    //{ name: 'AZ-104: Azure Administrator', issuer: 'Microsoft', year: 'In Progress' },
    //{ name: 'AZ-500: Azure Security Engineer', issuer: 'Microsoft', year: 'In Progress' },
    { name: 'Oracle Cloud Infrastructure Foundations Associate', issuer: 'Oracle', year: '2025' },
    { name: 'Engineering Degree - Cloud Computing', issuer: 'ESPRIT', year: 'In Progress' },
  ];
}
