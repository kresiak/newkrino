import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { SupplierService } from './Shared/Services/supplier.service';
import { ApiService } from './Shared/Services/api.service';


@Component(
    {
        //moduleId: module.id,
        templateUrl: './home.component.html'
    }
)
export class HomeComponent implements OnInit {
    private errFn = function (err) { console.log('Error: ' + err); }

    private receptionList: any;


    constructor(private supplierService: SupplierService, private apiService: ApiService) {
        
/*        var interval = Observable.interval(1000);

        var source = interval
            .take(2)
            .do(function (x) {
                console.log('Side effect');
            });

        var published = source.publishReplay(1).refCount();


        published.subscribe(x => console.log('Next sourceA: ' + x), this.errFn, () => console.log('Complete sourceA'));
        published.subscribe(x => console.log('Next sourceB: ' + x), this.errFn, () => console.log('Complete sourceB'));

        setTimeout(function () {
            published.subscribe(x => console.log('Next sourceC: ' + x), this.errFn, () => console.log('Complete sourceC'));
        }, 6000);
*/    }


    ngOnInit(): void {
        this.supplierService.getAnnotatedReceptions().map(receptions => receptions.filter(reception => !reception.data.isProcessed)).subscribe(receptions => {
            this.receptionList = receptions ? receptions : [];
        });        

        this.apiService.callWebService('krino2sap', {}).map(res => res.json()).subscribe(res => {
            let x= res
        })
    }
}