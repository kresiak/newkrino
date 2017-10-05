import { Component, Input, Output, ViewEncapsulation, ViewChild, EventEmitter, OnInit } from '@angular/core';
import * as moment from "moment"
import { DataStore } from './../Shared/Services/data.service'
import { NotificationService } from '../Shared/Services/notification.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component({
    selector: 'gg-comments-tab',
    templateUrl: './comments-tab.component.html'
})
export class CommentsTabComponent implements OnInit {
    privateMessages: any[];
    @Input() data;
    @Input() dbTable;
    @Input() dontShowOldMessages: boolean= false   
    @Output() commentsUpdated = new EventEmitter() 


    constructor(private dataStore: DataStore, private authService: AuthService, private notificationService: NotificationService) {
    }
    
    private authorizationStatusInfo: AuthenticationStatusInfo

    ngOnInit(): void {
        
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).do(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        }).switchMap(statusInfo => {
            return this.notificationService.getPrivateMessagesAboutObject(statusInfo.currentUserId, this.data._id).takeWhile(() => this.isPageRunning)    
        }).subscribe(messages => {
            this.privateMessages= messages
        })
    }

    private isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    commentsHaveBeenUpdated(comments) {
        if (this.data && comments) {
            this.data.comments = comments;
            this.dataStore.updateData(this.dbTable, this.data._id, this.data);
            this.commentsUpdated.next('')
        }
    }

    setMessagesAsRead() {
        this.privateMessages.forEach(m => {
            m.isRead= true
            this.dataStore.updateData('messages', m._id, m)
        })
    }

}
