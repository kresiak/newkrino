import { Component } from '@angular/core'
import { Observable } from 'rxjs/Rx'



@Component(
    {
        moduleId: module.id,
        templateUrl: './home.component.html'
    }
)
export class HomeComponent {
    private errFn = function (err) { console.log('Error: ' + err); }

    constructor() {
        
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


}