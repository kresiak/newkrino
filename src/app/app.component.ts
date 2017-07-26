import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AuthenticationStatusInfo, AuthService } from './Shared/Services/auth.service'
import { NotificationService } from './Shared/Services/notification.service'
import { BasketService } from './Shared/Services/basket.service'
import { MenuService } from './Shared/Services/menu.service'
import { DataStore } from './Shared/Services/data.service'
import { WebSocketService } from './Shared/Services/websocket.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"


@Component({
    //moduleId: module.id,
    selector: 'giga-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private dataStore: DataStore, private menuService: MenuService, private notificationService: NotificationService, private basketService: BasketService,
        private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private webSocketService: WebSocketService, private _sanitizer: DomSanitizer) {
        this.webSocketService.init()
        this.authService.initFromLocalStorage()

        setTimeout(() => {
            this.webSocketService.requeryDb()
        }, 3 * 60 * 60 * 1000)
    }

    private showScrollText: boolean = true


    private password: string = ''
    private usersShort: any[];
    private possibleEquipes: any[];
    private laboList: any[]
    private authorizationStatusInfo: AuthenticationStatusInfo

    private userValue
    private equipeValue
    private menu: any[]
    private labManagerMessages

    private isPageRunning: boolean = true

    private nbProductsInBasket: number = 0

    private needsEquipeSelection: boolean = true


    private inDbInitialisationProcess: boolean = true

    ngOnInit(): void {

        this.menuService.initializeMenus()

        this.menuService.getMenuObservable().takeWhile(() => this.isPageRunning).subscribe(menu => {
            this.menu = menu
        })

        this.notificationService.getLmWarningMessages().takeWhile(() => this.isPageRunning).subscribe(res => {
            this.labManagerMessages = res
        })

        this.basketService.getBasketItemsForCurrentUser().takeWhile(() => this.isPageRunning).subscribe(items => {
            this.nbProductsInBasket = items.length
        })

        this.dataStore.getDataObservable('labos.list').map(labos => labos.map(labo => {
            return {
                id: labo.shortcut,
                value: labo.name
            }
        })).takeWhile(() => this.isPageRunning).subscribe(res => {
            this.laboList= res
        })

        Observable.combineLatest(this.authService.getUserSimpleListObservable(), this.authService.getStatusObservable(), (usersShort, statusInfo) => {
            return {
                usersShort: usersShort,
                statusInfo: statusInfo
            }
        }).do(info => {
            this.authorizationStatusInfo = info.statusInfo
            this.usersShort= info.usersShort

            this.userValue = this.usersShort.filter(user => user.id === info.statusInfo.currentUserId)[0]

            this.needsEquipeSelection= !this.userValue ? true : !(this.usersShort.filter(u => u.id === info.statusInfo.currentUserId)[0] || {equipeNotNeeded: false}).equipeNotNeeded

        }).switchMap(info => {
            return  this.authService.getPossibleEquipeSimpleListObservable(this.authorizationStatusInfo.currentUserId)
        }).do(possibleEquipes => {
            this.possibleEquipes = possibleEquipes
            this.equipeValue = this.possibleEquipes.filter(eq => eq.id === this.authorizationStatusInfo.currentEquipeId)[0]
        })
        .takeWhile(() => this.isPageRunning).subscribe(res => {
            this.inDbInitialisationProcess= false
        })       
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    openModal(template) {
        this.showScrollText = true
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "sm" });
        var promise = ref.result;
        promise.then((res) => {
            this.passwordSave();
        }, (res) => {
            this.passwordCancel();
        });
        promise.catch((err) => {
            this.passwordCancel();
        });
    }

    private passwordSave() {
        this.authService.tryLogin(this.password)
    }

    private passwordCancel() {
    }

    userSelected(value) {
        if (this.inDbInitialisationProcess) return
        if (!value) value = ''
        if (value.id) {
            this.authService.setUserId(value.id, value.equipeNotNeeded);
        }
        else {
            this.navigateToHome()
            this.authService.setUserId('', false);
        }
    }

    equipeSelected(value) {
        if (this.inDbInitialisationProcess) return
        if (!value) value = ''
        if (value.id) {
            this.authService.setEquipeId(value.id);
        }
        else {
            this.navigateToHome()
            this.authService.setEquipeId('');
        }
    }

    laboSelected(value) {
        if (!value) return
        this.inDbInitialisationProcess= true
        this.dataStore.setLaboName(value.id)
    }

    title = 'Krino';



    autocompleListFormatter = (data: any): SafeHtml => {
        let html = `<span>${data.value}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    };

    navigateToBasket() {
        let link = ['/basket'];
        this.router.navigate(link);
    }

    navigateToHome() {
        let link = ['/home'];
        this.router.navigate(link);
    }


    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }


    disableScrolling() {
        this.showScrollText = false
        this.sleep(30 * 60 * 1000).then(() => {
            this.showScrollText = true
        });
    }

    getCurrentLabo(): string {
        return this.dataStore.getLaboName()        
    }


}

