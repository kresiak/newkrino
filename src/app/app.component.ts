import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router} from '@angular/router'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AuthenticationStatusInfo, AuthService } from './Shared/Services/auth.service'
import { ProductService } from './Shared/Services/product.service'
import { MenuService } from './Shared/Services/menu.service'
import { WebSocketService } from './Shared/Services/websocket.service';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"


@Component({
    //moduleId: module.id,
    selector: 'giga-app',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private authService: AuthService, private menuService: MenuService, private productService: ProductService, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private webSocketService: WebSocketService, private _sanitizer: DomSanitizer) {
        this.webSocketService.init()
        this.authService.initFromLocalStorage()
    }

    private subscriptionAuthorization: Subscription 
    private subscriptionBasketItems: Subscription 
    private subscriptionRouterEvents: Subscription 
    private subscriptionMenu: Subscription 


    private password: string = ''
    //private users;
    private usersShort: any[];
    private possibleEquipes: any[];
    private authorizationStatusInfo: AuthenticationStatusInfo
    private initializingUser: boolean= false
    private initializingEquipe: boolean= false

    private userValue
    private equipeValue
    private menu: any[] 

    private nbProductsInBasket: number = 0

    ngOnInit(): void {

        this.menuService.initializeMenus()

        this.subscriptionMenu= this.menuService.getMenuObservable().subscribe(menu => {
            this.menu= menu
        })

        this.subscriptionBasketItems= this.productService.getBasketItemsForCurrentUser().subscribe(items => {
            this.nbProductsInBasket= items.length
        })

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.initializingUser= true
            this.initializingEquipe= true
            this.authorizationStatusInfo = statusInfo
            this.usersShort = statusInfo.annotatedUserList.map(user => {
                return {
                    id: user.data._id,
                    value: user.annotation.fullName
                }
            })

            this.userValue= this.usersShort.filter(user => user.id === statusInfo.currentUserId)[0]

            this.possibleEquipes = !statusInfo.equipeList ? [] : statusInfo.equipeList.map(eq => {
                    return {
                        id: eq._id,
                        value: eq.name
                    }
                })

            this.equipeValue= this.possibleEquipes.filter(eq => eq.id === statusInfo.currentEquipeId)[0]
        })
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionBasketItems.unsubscribe()
         this.subscriptionRouterEvents.unsubscribe()
         this.subscriptionMenu.unsubscribe()
    }
    

    openModal(template) {
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
        if (!value) value = ''
        if (value.id) {
            this.authService.setUserId(value.id);
        }
        else {
            this.authService.setUserId('');
        }
    }

    equipeSelected(value) {
        if (!value) value = ''
        if (value.id) {
            this.authService.setEquipeId(value.id);
        }
        else {
            this.authService.setEquipeId('');
        }
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
    

}

