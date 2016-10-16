import { Component, OnInit } from '@angular/core';
import { HeroService } from './hero.service';
import { Hero } from './hero';
import { Router } from '@angular/router';
import {SelectorData} from './ui/selector/selector-data';

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

    categories: SelectorData[]= [ 
        new SelectorData("1", "Enzymes", false),
        new SelectorData("2", "Produits chimiques", true),
        new SelectorData("3", "Informatique", false),
        new SelectorData("4", "Divers", false),
        new SelectorData("5", "Taq", true),
        new SelectorData("6", "Autres", false),
        new SelectorData("7", "Enzymes", false),
    ];

    ngOnInit(): void {
        this.heroService.getHeroes().then(
            h => this.heroes = h.slice(1, 5));
    }

    gotoDetail(hero: Hero) {
        let link = ['/detail', hero.id];
        this.router.navigate(link);
    }
}