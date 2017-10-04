import { Component, Input, Output, ViewEncapsulation, ViewChild, EventEmitter, OnInit } from '@angular/core';
import * as moment from "moment"
import { DataStore } from './../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component({
    selector: 'gg-comments-tab-title',
    templateUrl: './comments-tab-title.component.html'
})
export class CommentsTabTitleComponent implements OnInit {
    nbMessages: number;
    @Input() id: string;

    constructor(private dataStore: DataStore, private authService: AuthService) {
    }
    
    private authorizationStatusInfo: AuthenticationStatusInfo

    ngOnInit(): void {
        
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).do(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        }).switchMap(noUse => {
            return this.dataStore.getDataObservable('messages').takeWhile(() => this.isPageRunning)    
        }).subscribe(messages => {
            this.nbMessages= messages.filter(m => m.isPrivate && m.toUserId===this.authorizationStatusInfo.currentUserId && this.id === m.id && !m.isRead).length
        })
    }

    private isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}
