import { Component, OnInit } from '@angular/core';
import { HeroService } from './hero.service';
import { Hero } from './hero';
import { Router } from '@angular/router';
import {SelectableData} from './Shared/Classes/selectable-data';
import {Observable, BehaviorSubject} from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        selector: 'my-dashboard',
        templateUrl: 'dashboard.component.html'
    }
)
export class DashboardComponent implements OnInit {
    constructor(private heroService: HeroService, private router: Router) {
        this.selectableCategoriesObservable= Observable.from([this.selectableData]);

        var self= this;
        this.selectedIdsObservable= new BehaviorSubject<string[]>([]);
        this.selectedIdsObservable.next(this.selectedIds);
        var self= this;
        window.setTimeout(function(){
            self.selectedIds.push("2");
            self.selectedIdsObservable.next(self.selectedIds);
        },5000);
    }

    heroes: Hero[] = [];
    
    selectableCategoriesObservable : Observable<SelectableData[]>; 

    selectableData: SelectableData[]= [ 
        new SelectableData("1", "Enzymes"),
        new SelectableData("2", "Produits chimiques"),
        new SelectableData("3", "Informatique"),
        new SelectableData("4", "Divers"),
        new SelectableData("5", "Taq"),
        new SelectableData("6", "Autres"),
        new SelectableData("7", "Enzymes"),
    ];

    selectedIds: string[]= ["1","5"];
    selectedIdsObservable: BehaviorSubject<string[]>;

    selectedChanged(newSelection: string[])
    {
       this.selectedIdsObservable.next(newSelection);
    }

    ngOnInit(): void {
        this.heroService.getHeroes().then(h => this.heroes = h.slice(1, 5));
    }

    gotoDetail(hero: Hero) {
        let link = ['/detail', hero.id];
        this.router.navigate(link);
    }
}