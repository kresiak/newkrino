import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-equipe-group-detail',
        templateUrl: './equipe-group-detail.component.html'
    }
)
export class EquipeGroupDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private orderService: OrderService, private authService: AuthService) {
    }

    @Input() equipeGroupObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean=false
    
    @Input() initialTab: string = '';
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }    



    ngOnInit(): void {
        this.stateInit();
        this.equipeGroupObservable.subscribe(eq => {
            this.equipeGroup = eq;
        });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
    }


/*    @Input() selectedTabId;
    @Output() tabChanged = new EventEmitter();
*/
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private equipeGroup: any;

    commentsUpdated(comments) {
        if (this.equipeGroup && comments) {
            this.equipeGroup.data.comments = comments;
            this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
        }
    }

    public beforeTabChange($event: NgbTabChangeEvent) {       
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    nameUpdated(name) {
        this.equipeGroup.data.name = name;
        this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
    }

    descriptionUpdated(name) {
        this.equipeGroup.data.description = name;
        this.dataStore.updateData('equipes.groups', this.equipeGroup.data._id, this.equipeGroup.data);
    }
}