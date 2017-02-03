import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import {PageScrollService} from 'ng2-page-scroll/ng2-page-scroll';
import { DOCUMENT } from '@angular/platform-browser'



@Component(
    {
        //moduleId: module.id,
        selector: 'gg-equipe-list',
        templateUrl: './equipe-list.component.html'
    }
)
export class EquipeListComponent implements OnInit {
    constructor(private orderService: OrderService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    equipesObservable: Observable<any>;
    equipes: any

    @Input() state;
    @Input() initialTabInEquipeDetail: string = '';
    @Input() path: string= 'equipes'
    @Output() stateChanged = new EventEmitter();


    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;

    ngOnInit(): void {
        this.stateInit();
        this.equipesObservable = this.orderService.getAnnotatedEquipes();

        Observable.combineLatest(this.equipesObservable, this.searchControl.valueChanges.startWith(''), (equipes, searchTxt: string) => {
            if (searchTxt.trim() === '') return equipes;
            return equipes.filter(otp => otp.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || otp.data.description.toUpperCase().includes(searchTxt.toUpperCase()));
        }).subscribe(equipes => this.equipes = equipes);
        
    }

    getEquipeObservable(id: string): Observable<any> {
        return this.equipesObservable.map(equipes => equipes.filter(s => s.data._id === id)[0]);
    }



    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }
}

