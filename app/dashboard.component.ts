import { Component, OnInit } from '@angular/core';
import { HeroService } from './hero.service';
import { Hero } from './hero';
import { Router } from '@angular/router';

@Component(
    {
        moduleId: module.id,
        selector: 'my-dashboard',
        templateUrl: 'dashboard.component.html'
    }
)
export class DashboardComponent implements OnInit {
    constructor(private heroService: HeroService, private router: Router) {

    }

    heroes: Hero[] = [];

    ngOnInit(): void {
        this.heroService.getHeroes().then(
            h => this.heroes = h.slice(1, 5));
    }

    gotoDetail(hero: Hero) {
        let link = ['/detail', hero.id];
        this.router.navigate(link);
    }
}