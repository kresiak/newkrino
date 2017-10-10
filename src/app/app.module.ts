import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule, Http } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartistModule, ChartistComponent } from 'angular2-chartist';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { ImageUploadModule } from "angular2-image-upload"

import { Ng2SimplePageScrollModule } from 'ng2-simple-page-scroll/ng2-simple-page-scroll';

import { AppComponent } from './app.component'
import { HomeComponent } from './home.component'

import { AdminMainComponent } from './Admin/admin-main.component'
import { AdminWebShoppingComponent } from './Admin/Webshopping/component'
import { AdminAK } from './Admin/AK/component'
import { AdminLabo } from './Admin/Laboratory/component'
import { LaboratoryEnterComponent } from './Admin/Laboratory/laboratory-enter.component'
import { AdminWebShoppingVoucherRequestListComponent } from './Admin/Webshopping/voucher-request-list.component'
import { AdminWebShoppingVoucherRequestComponent } from './Admin/Webshopping/voucher-request.component'
import { MonitoringDetailComponent } from './Admin/Monitoring/monitoring-detail.component'

import { VoucherListComponent } from './Admin/Webshopping/voucher-list.component'
import { VoucherDetailComponent } from './Admin/Webshopping/voucher-detail.component'

import { SupplierInfoComponent } from './Suppliers/supplier-info.component';
import { SupplierListComponent } from './Suppliers/supplier-list.component';
import { SupplierListComponentRoutable } from './Suppliers/supplier-list.routable.component'
import { SupplierDetailComponent } from './Suppliers/supplier-detail.component';
import { SupplierDetailComponentRoutable } from './Suppliers/supplier-detail.routable.component';
import { SupplierEprocShoppingComponent } from './Suppliers/supplier-eproc-shopping';


import { ProductGridComponent } from './Products/product-grid.component';
import { ProductGridBasketComponent } from './Products/product-grid-basket.component';
import { ProductListComponent } from './Products/product-list.component';
import { ProductListComponentRoutable } from './Products/product-list.routable.component'
import { ProductEnterComponent } from './Products/product-enter.component'
import { ProductDetailComponent } from './Products/product-detail.component'
import { ProductDetailComponentRoutable } from './Products/product-detail.routable.component'
import { ProductFridgeOrderButtonComponent } from './Products/product-fridge-order-button.component'

import { SupplierSapDetailComponent } from './Suppliers/supplier-sap-detail.component'
import { SupplierSapListComponent } from './Suppliers/supplier-sap-list.component'

import { CategoryListComponent } from './Categories/category-list.component'
import { CategoryListComponentRoutable } from './Categories/category-list.routable.component'
import { CategoryDetailComponent } from './Categories/category-detail.component'

import { CategoryEnterComponent } from './Categories/category-enter.component'

import { CategoryDetailComponentRoutable } from './Categories/category-detail.routable.component'

import { OtpListComponent } from './Otps/otp-list.component';
import { OtpListComponentRoutable } from './Otps/otp-list.routable.component';
import { OtpDetailComponent } from './Otps/otp-detail.component';
import { OtpDetailComponentRoutable } from './Otps/otp-detail.routable.component';
import { OtpEnterComponent } from './Otps/otp-enter.component';
import { OtpSapByDateComponent } from './Otps/otp-sap-date.component';
import { OtpPeriodDetailComponent } from './Otps/otp-period-detail.component';
import { OtpCheckerComponent } from './Otps/otp-checker.component'

import { PlatformMainComponent } from './Platforms/platform-main-component'
import { PlatformMachinesComponent } from './Platforms/platform-machines.component'
import { PlatformServicesComponent } from './Platforms/platform-services.component'
import { PlatformServiceStepListComponent } from './Platforms/platform-service-step-list.component'
import { PlatformServiceListComponent } from './Platforms/platform-service-list.component'
import { PlatformServiceDetailComponent } from './Platforms/platform-service-detail.component'
import { PlatformServiceStepDetailComponent } from './Platforms/platform-service-step-detail.component'
import { PlatformServiceStepClientTypeCostComponent } from './Platforms/platform-service-step-clientType-cost.component'
import { PlatformLabourComponent } from './Platforms/platform-labour.component'
import { PlatformClientComponent } from './Platforms/platform-clientTypes.component'
import { PlatformCorrectionComponent } from './Platforms/platform-correction.component'
import { PlatformServiceSnapshotsComponent } from './Platforms/platform-service-snapshots.component'
import { PlatformServiceSnapshotListComponent } from './Platforms/platform-service-snapshot-list.component'
import { PlatformServiceSnapshotDetailComponent } from './Platforms/platform-service-snapshot-detail.component'
import { PlatformServiceCompareComponent } from './Platforms/platform-service-compare.component'
import { PlatformServiceCompareBaseComponent } from './Platforms/platform-service-compare-base.component'
import { PlatformClientsComponent } from './Platforms/platform-clients.component'
import { PlatformEnterprisesComponent } from './Platforms/platform-enterprises.component'
import { PlatformOffersComponent } from './Platforms/platform-offers.component'
import { PlatformOfferDetailComponent } from './Platforms/platform-offer-detail.component'
import { PlatformOfferListComponent } from './Platforms/platform-offer-list.component'

import { PublicMainComponent } from './Public/public-main-component'
import { MarketsMainComponent } from './Public/Markets/markets-main.component'
import { MarketsEnterComponent } from './Public/Markets/markets-enter.component'
import { SigninEnterComponent } from './Public/Identification/signin-enter.component'
import { RegisterEnterComponent } from './Public/Identification/register-enter.component'

import { UserListComponentRoutable } from './Users/user-list.routable.component'
import { UserListComponent } from './Users/user-list.component'
import { UserEnterComponent } from './Users/user-enter.component'
import { UserDetailComponent } from './Users/user-detail.component';
import { UserDetailComponentRoutable } from './Users/user-detail.routable.component';
import { UserInfoComponent } from './Users/user-info.component';

import { EquipeDetailComponent } from './Equipes/equipe-detail.component'
import { EquipeDetailComponentRoutable } from './Equipes/equipe-detail.routable.component'
import { EquipeListComponent } from './Equipes/equipe-list.component'
import { EquipeListComponentRoutable } from './Equipes/equipe-list.routable.component'
import { EquipeEnterComponent } from './Equipes/equipe-enter.component'
import { EquipeGroupEnterComponent } from './Equipes/equipe-group-enter.component'
import { EquipeGroupListComponent } from './Equipes/equipe-group-list.component'
import { EquipeGroupDetailComponent } from './Equipes/equipe-group-detail.component'
import { EquipeGiftEnterComponent } from './Equipes/equipe-gift-enter.component'
import { EquipeGiftGridComponent } from './Equipes/equipe-gift-grid.component'
import { EquipeBilanComponent } from './Equipes/equipe-bilan.component'
import { EquipeDebtDetailsComponent } from './Equipes/equipe-debt-details.component'


import { BasketRoutableComponent } from './Orders/basket.routable.component'
import { PreOrderComponent } from './Orders/pre-order.component'
import { OrderComponentRoutable } from './Orders/order-detail.routable.component'
import { OrderDetailComponent } from './Orders/order-detail.component'
import { OrderListComponent } from './Orders/order-list.component'
import { OrderListComponentRoutable } from './Orders/order-list.routable.component'
import { OrderFridgeListComponent } from './Orders/order-fridge-list.component'

import { SapComponentRoutable } from './Sap/sap-detail.routable.component'
import { SapDetailComponent } from './Sap/sap-detail.component'
import { SapSheetComponent } from './Sap/sap-sheet.component'
import { SapListComponentRoutable } from './Sap/sap-list.routable.component'
import { SapListComponent } from './Sap/sap-list.component'
import { SapListBySapIdsComponent } from './Sap/sap-list-by-sapids.component'


import { StockDetailComponent } from './Stock/stock-detail.component'
import { StockListComponent } from './Stock/stock-list.component'
import { StockComponentRoutable } from './Stock/stock.routable.component'
import { StockProductEnterComponent } from './Stock/stock-product-order.component'
import { StockOrderListComponent } from './Stock/stock-order-list.component'
import { StockOrderDetailComponent } from './Stock/stock-order-detail.component'

import { ReceptionDetailComponent } from './Reception/reception-detail.component'
import { CommunicationEnterComponent } from './Communication/communication-enter.component'

import { DashboardComponent } from './Dashboard/dashboard.component'
import { DashletComponent } from './Dashboard/dashlet.component'
import { MyKrinoComponent } from './Dashboard/mykrino.component'
import { UnMaximizeComponent } from './Dashboard/unmaximize.component'

import { Editor } from './ui/editor/editor'
import { EditorAutocomplete } from './ui/editor/editor-autocomplete'
import { EditorAutocompleteText } from './ui/editor/editor-autocomplete-text'
import { EditorNumber } from './ui/editor/editor-number'
import { EditorDate } from './ui/editor/editor-date'
import { EditorBoolean } from './ui/editor/editor-boolean'
import { Checkbox } from './ui/checkbox/checkbox'
import { SelectorComponent } from './ui/selector/selector.component'
import { CommentComponent } from './Comments/comment.component'
import { CommentsTabComponent } from './Comments/comments-tab.component'
import { CommentsTabTitleComponent } from './Comments/comments-tab-title.component'
import { CommentsComponent } from './Comments/comments.component'
import { HelpPointerComponent } from './ui/help/help-pointer.component'
import { DatePointerComponent } from './ui/help/date-pointer.component'
import { TextCompactComponent } from './ui/help/text-compact.component'

import { SearchBoxComponent } from './ui/search/search-box.component'


import { PlatformService } from './Shared/Services/platform.service';
import { AdminService } from './Shared/Services/admin.service';
import { WebSocketService } from './Shared/Services/websocket.service';
import { NavigationService } from './Shared/Services/navigation.service';
import { ApiService } from './Shared/Services/api.service';
import { ProductService } from './Shared/Services/product.service'
import { SupplierService } from './Shared/Services/supplier.service'
import { OrderService } from './Shared/Services/order.service'
import { OtpService } from './Shared/Services/otp.service'
import { ConfigService } from './Shared/Services/config.service'
import { EquipeService } from './Shared/Services/equipe.service'
import { StockService } from './Shared/Services/stock.service'
import { BasketService } from './Shared/Services/basket.service'
import { NotificationService } from './Shared/Services/notification.service'
import { VoucherService } from './Shared/Services/voucher.service'
import { DataStore } from './Shared/Services/data.service';
import { AuthService } from './Shared/Services/auth.service'
import { OtpChoiceService } from './Shared/Services/otp-choice.service'
import { UserService } from './Shared/Services/user.service'
import { SapService } from './Shared/Services/sap.service'
import { MenuService } from './Shared/Services/menu.service'
import { ChartService } from './Shared/Services/chart.service'
import { AuthAnoynmousService } from './Shared/Services/auth-anonymous.service'

import { FullDatePipe } from './Shared/Pipes/fulldate.pipe'
import { ShortDatePipe } from './Shared/Pipes/shortdate.pipe'
import { FromNowPipe } from './Shared/Pipes/fromnow.pipe'

import { RainbowDirective } from './Shared/Directives/test.directive'

import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate'

//import {MomentModule} from 'angular2-moment';

@NgModule({
  imports: [
    //        MomentModule,
    ChartistModule,
    BrowserModule,
    FormsModule, ReactiveFormsModule,
    HttpModule,
    Ng2AutoCompleteModule,
    NgbModule.forRoot(),
    Ng2SimplePageScrollModule.forRoot(),
    ImageUploadModule.forRoot(),
    TranslateModule.forRoot(
      {
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, '/krino/i18n', '.json'),
        deps: [Http]
      }
    ),
    RouterModule.forRoot([
      { path: "admin", component: AdminMainComponent },
      { path: "basket", component: BasketRoutableComponent },
      { path: "suppliers", component: SupplierListComponentRoutable },
      { path: "equipes", component: EquipeListComponentRoutable },
      { path: "orders", component: OrderListComponentRoutable },
      { path: "saps", component: SapListComponentRoutable },
      { path: "categories", component: CategoryListComponentRoutable },
      { path: "otps", component: OtpListComponentRoutable },
      { path: 'otp/:id', component: OtpDetailComponentRoutable },
      { path: 'supplier/:id', component: SupplierDetailComponentRoutable },
      { path: 'product/:id', component: ProductDetailComponentRoutable },
      { path: 'category/:id', component: CategoryDetailComponentRoutable },
      { path: 'equipe/:id', component: EquipeDetailComponentRoutable },
      { path: 'user/:id', component: UserDetailComponentRoutable },
      { path: 'users', component: UserListComponentRoutable },
      { path: "products", component: ProductListComponentRoutable },
      { path: "dashboard", component: DashboardComponent },
      { path: "mykrino", component: MyKrinoComponent },
      { path: "home", component: HomeComponent },
      { path: "stock", component: StockComponentRoutable },
      { path: "unmaximize", component: UnMaximizeComponent },
      { path: "", component: HomeComponent, pathMatch: 'full' },
      { path: 'preorder/:id', component: PreOrderComponent },
      { path: 'order/:id', component: OrderComponentRoutable },
      { path: 'sap/:id', component: SapComponentRoutable },
      { path: 'reception', component: ReceptionDetailComponent },
      { path: 'communication', component: CommunicationEnterComponent },
      { path: 'platform', component: PlatformMainComponent },
      { path: 'public', component: PublicMainComponent },
      { path: '**', redirectTo: '/home' }
    ])
  ],
  declarations: [AppComponent, HomeComponent,
    VoucherListComponent, VoucherDetailComponent, MonitoringDetailComponent,
    AdminMainComponent, AdminWebShoppingComponent, AdminWebShoppingVoucherRequestListComponent, AdminWebShoppingVoucherRequestComponent, AdminAK, AdminLabo,
    CommentComponent, CommentsComponent, CommentsTabComponent, CommentsTabTitleComponent, LaboratoryEnterComponent,
    SupplierListComponent, SupplierDetailComponent, SupplierListComponentRoutable, SupplierDetailComponentRoutable, SupplierInfoComponent, SupplierEprocShoppingComponent,
    ProductGridComponent, ProductGridBasketComponent, ProductEnterComponent, ProductListComponent, ProductListComponentRoutable, ProductDetailComponent, ProductDetailComponentRoutable,
    ProductFridgeOrderButtonComponent,
    OtpListComponent, OtpDetailComponent, OtpDetailComponentRoutable, OtpListComponentRoutable, OtpEnterComponent, OtpSapByDateComponent, OtpPeriodDetailComponent, OtpCheckerComponent,

    CategoryListComponent, CategoryDetailComponent, CategoryListComponentRoutable, CategoryEnterComponent, CategoryDetailComponentRoutable,
    ReceptionDetailComponent, CommunicationEnterComponent,
    StockComponentRoutable, StockListComponent, StockProductEnterComponent, StockOrderListComponent, StockOrderDetailComponent, StockDetailComponent,
    DashboardComponent, DashletComponent, MyKrinoComponent, UnMaximizeComponent,
    UserEnterComponent, UserListComponentRoutable, UserListComponent, UserDetailComponent, UserDetailComponentRoutable, UserInfoComponent,
    EquipeDetailComponent, EquipeListComponent, EquipeListComponentRoutable, EquipeEnterComponent, EquipeDetailComponentRoutable, EquipeGroupEnterComponent, EquipeGroupListComponent, EquipeGroupDetailComponent, EquipeGiftEnterComponent,
    EquipeGiftGridComponent, EquipeBilanComponent, EquipeDebtDetailsComponent,
    PreOrderComponent, OrderDetailComponent, OrderComponentRoutable, BasketRoutableComponent,
    OrderListComponent, OrderListComponentRoutable, OrderFridgeListComponent,
    SapComponentRoutable, SapDetailComponent, SapSheetComponent, SapListComponentRoutable, SapListComponent, SapListBySapIdsComponent,
    Editor, EditorNumber, EditorDate, EditorBoolean, Checkbox, SelectorComponent, EditorAutocomplete, EditorAutocompleteText,
    FullDatePipe, ShortDatePipe, FromNowPipe, HelpPointerComponent, DatePointerComponent, TextCompactComponent,  SearchBoxComponent,
    SupplierSapDetailComponent, SupplierSapListComponent,
    PlatformMainComponent, PlatformMachinesComponent, PlatformServicesComponent, PlatformServiceStepListComponent, PlatformServiceStepDetailComponent, PlatformServiceSnapshotsComponent, PlatformServiceSnapshotListComponent,
    PlatformLabourComponent, PlatformClientComponent, PlatformCorrectionComponent, PlatformServiceListComponent, PlatformServiceDetailComponent, PlatformServiceCompareComponent, PlatformServiceCompareBaseComponent, PlatformClientsComponent,
    PlatformServiceSnapshotDetailComponent, PlatformServiceStepClientTypeCostComponent, PlatformEnterprisesComponent, PlatformOffersComponent, PlatformOfferDetailComponent, PlatformOfferListComponent,
    PublicMainComponent, MarketsMainComponent, MarketsEnterComponent, SigninEnterComponent, RegisterEnterComponent,
    RainbowDirective
  ],
  providers: [NavigationService, OtpChoiceService, ApiService, DataStore, AuthService, ProductService, SupplierService, OrderService, UserService, ChartService, WebSocketService, MenuService,
    AdminService, SapService, OtpService, EquipeService, StockService, VoucherService, BasketService, NotificationService, ConfigService, PlatformService, AuthAnoynmousService],
  bootstrap: [AppComponent]
})
export class AppModule { }
