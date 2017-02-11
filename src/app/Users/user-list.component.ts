import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import {ProductService} from './../Shared/Services/product.service'
import {Observable, Subscription} from 'rxjs/Rx'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
 {
     selector: 'gg-user-list',
     templateUrl: './user-list.component.html'
 }
)
export class UserListComponent implements OnInit{

    constructor(private authService: AuthService)    {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    
    users: any
    openPanelId: string= "";
    @Input() usersObservable: Observable<any>;
    @Input() state;
    @Input() path: string= 'users'
    @Output() stateChanged= new EventEmitter();
    
    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;    
    private subscriptionUsers: Subscription 

    ngOnInit():void{
        this.stateInit();         

        this.subscriptionUsers= Observable.combineLatest(this.usersObservable, this.searchControl.valueChanges.startWith(''), (users, searchTxt: string) => {
            if (searchTxt.trim() === '') return users;
            return users.filter(user => user.data.name.toUpperCase().includes(searchTxt.toUpperCase()) || user.data.firstName.toUpperCase().includes(searchTxt.toUpperCase()));
        }).subscribe(users => this.users = users);
        
    }

    ngOnDestroy(): void {
         this.subscriptionUsers.unsubscribe()
    }

    getUserObservable(id: string) : Observable<any>
    {
        return this.usersObservable.map(users=> users.filter(s => {
            return s.data._id===id
        }

        )[0]);
    }
    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState)
        {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }            
    };
    
    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId)
    {
            this.state[objectId]= newState;
            this.stateChanged.next(this.state);
    }


    
}

