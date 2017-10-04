import { Component, Input, Output, ViewEncapsulation, ViewChild, EventEmitter, OnInit } from '@angular/core';
import * as moment from "moment"
import { DataStore } from './../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component({
    selector: 'gg-comments-tab',
    templateUrl: './comments-tab.component.html'
})
export class CommentsTabComponent implements OnInit {
    privateMessages: any[];
    @Input() data;
    @Input() dbTable;


    constructor(private dataStore: DataStore, private authService: AuthService) {
    }
    
    private authorizationStatusInfo: AuthenticationStatusInfo

    ngOnInit(): void {
        
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).do(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        }).switchMap(noUse => {
            return this.dataStore.getDataObservable('messages').takeWhile(() => this.isPageRunning)    
        }).subscribe(messages => {
            this.privateMessages= messages.filter(m => m.isPrivate && m.toUserId===this.authorizationStatusInfo.currentUserId && !m.isRead)
        })
    }

    private isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    commentsUpdated(comments) {
        if (this.data && comments) {
            this.data.comments = comments;
            this.dataStore.updateData(this.dbTable, this.data._id, this.data);
        }
    }

    setMessagesAsRead() {
        this.privateMessages.forEach(m => {
            m.isRead= true
            this.dataStore.updateData('messages', m._id, m)
        })
    }

}
