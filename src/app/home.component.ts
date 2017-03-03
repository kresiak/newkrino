import { Component, OnInit } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { SupplierService } from './Shared/Services/supplier.service';
import { ProductService } from './Shared/Services/product.service'
import { ApiService } from './Shared/Services/api.service';
import { OrderService } from './Shared/Services/order.service'
import { SapService } from './Shared/Services/sap.service'


@Component(
    {
        //moduleId: module.id,
        templateUrl: './home.component.html'
    }
)
export class HomeComponent implements OnInit {
    private errFn = function (err) { console.log('Error: ' + err); }

    private receptionList: any;
    private messageList: any;


    constructor(private supplierService: SupplierService, private apiService: ApiService, private orderService: OrderService, private productService: ProductService, private sapService: SapService) {

    /*            var interval = Observable.interval(1000);
        
                var source = interval
                    .take(2)
                    .do(function (x) {
                        console.log('Side effect');
                    });
        
                var published = source.share();
        
        
                published.subscribe(x => console.log('Next sourceA: ' + x), this.errFn, () => console.log('Complete sourceA'));
                published.subscribe(x => console.log('Next sourceB: ' + x), this.errFn, () => console.log('Complete sourceB'));
        
                setTimeout(function () {
                    published.subscribe(x => console.log('Next sourceC: ' + x), this.errFn, () => console.log('Complete sourceC'));
                }, 6000);*/

/*        var state = 5
        var realSource = Observable.create(observer => {
            console.log("creating expensive HTTP-based emission");
            observer.next(state++);
            //observer.complete();

            return () => {
                console.log('unsubscribing from source')
            }
        });


        var source = Observable.of('')
            .do(() => console.log('stream subscribed'))
            .ignoreElements()
            .concat(realSource)
            .do(null, null, () => console.log('stream completed'))
            .publishReplay()
            .refCount()
            ;

        var subscription1 = source.subscribe({ next: (v) => console.log('observerA: ' + v) });
        subscription1.unsubscribe();

        var subscription2 = source.subscribe(v => console.log('observerB: ' + v));
        subscription2.unsubscribe();

        var subscription3 = source.subscribe(v => console.log('observerC: ' + v));
        subscription3.unsubscribe();

        var subscription4 = source.subscribe(v => console.log('observerD: ' + v));
*/

    }

/*    private s1: Subscription
    private s2: Subscription
*/
    ngOnInit(): void {

        //this.productService.flagStockProducts()

        this.supplierService.getAnnotatedReceptions().map(receptions => receptions.filter(reception => !reception.data.isProcessed)).subscribe(receptions => {
            this.receptionList = receptions ? receptions : [];
        });

        /*        this.apiService.callWebService('krino2sap', {}).map(res => res.json()).subscribe(res => {
                    let x= res
                })
        */
        this.orderService.getAnnotatedMessages().map(messages => messages.filter(message => !message.data.isDisabled)).subscribe(res => {
            this.messageList = res
        })


/*        this.sapService.getSapOtpMapObservable().subscribe(res => {
            let x = res
        })
*/
        //var obs= this.sapService.getSapIdMapObservable()

/*        console.log('in home init')

        this.s1= this.sapService.getSapIdMapObservable().subscribe(res => {
            console.log('hi: ' + res.size)
            let map = res
        })
        this.s2= this.sapService.getSapIdMapObservable().subscribe(res => {
            console.log('hi2: ' + res.size)
            let map = res
        })
*/
    }

    ngOnDestroy(): void {
/*        console.log('in home destroy')
        this.s1.unsubscribe()
        this.s2.unsubscribe()
*/    }
    
}