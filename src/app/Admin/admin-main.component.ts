import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { ActivatedRoute} from '@angular/router'


@Component(
    {
        //moduleId: module.id,
        templateUrl: './admin-main.component.html'
    }
)

export class AdminMainComponent {
    constructor(private authService: AuthService, private route: ActivatedRoute) {

    }

    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription 

    @Input() state;
    @Output() stateChanged = new EventEmitter()
      
    initTabId= ''
    initTabId2= ''

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })        
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
    }    

    ngOnInit(): void {
        this.stateInit();

        this.route.queryParams.first().subscribe(queryParams => {
            this.initTabId = queryParams['tab'];
            this.initTabId2= queryParams['tab2'];
        })     
        
    }

    public beforeTabChange($event: NgbTabChangeEvent) {        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };
        
}