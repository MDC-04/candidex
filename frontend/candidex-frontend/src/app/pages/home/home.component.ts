import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';

interface HomeTile {
  title: string;
  description: string;
  icon: string;
  route: string;
  accentClass: string;
  stat?: string;
  badge?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatRippleModule,
    MatChipsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  tiles: HomeTile[] = [
    {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble de vos candidatures et statistiques',
      icon: 'dashboard',
      route: '/dashboard',
      accentClass: 'tile-dashboard',
      stat: 'Statistiques',
    },
    {
      title: 'Candidatures',
      description: 'Gérez toutes vos candidatures en un seul endroit',
      icon: 'list_alt',
      route: '/applications',
      accentClass: 'tile-applications',
      stat: 'Liste complète',
    },
    {
      title: 'Pipeline',
      description: 'Visualisez votre pipeline de recrutement en kanban',
      icon: 'view_kanban',
      route: '/pipeline',
      accentClass: 'tile-pipeline',
      stat: 'Vue kanban',
      //badge: 'MVP',
    },
    {
      title: 'Entretiens',
      description: 'Planifiez et préparez vos entretiens à venir',
      icon: 'event',
      route: '/interviews',
      accentClass: 'tile-interviews',
      stat: 'Agenda',
      //badge: 'Nouveau',
    },
    {
      title: 'Profil',
      description: 'Modifiez vos informations personnelles et votre CV',
      icon: 'person',
      route: '/profile',
      accentClass: 'tile-profile',
      stat: 'Mon compte',
    },
  ];
}
