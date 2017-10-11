import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { ConfigService } from './../../Shared/Services/config.service'
import * as comparatorsUtils from './../../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-search-box',
        templateUrl: './search-box.component.html'
    }
)
export class SearchBoxComponent implements OnInit {
    allObjects: any;
    private searchControl = new FormControl();
    private searchForm;
    private showSearch: boolean = false

    private objects

    private nbHitsShown: number = 10
    private nbHitsIncrement: number = 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)

    private moneyTotal: number = 0
    private objectTypeText: string


    constructor(private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSearchControl() {
        this.searchControl.setValue('')
    }

    @Input() objectTypeTranslationKey: string
    @Input() objectsObservable: Observable<any>
    @Input() hasReport: boolean = false
    @Input() fnFilterObjects
    @Input() fnCalculateTotal

    @Output() listChanged = new EventEmitter(true);  // the true parameter is important to make the this.searchChanged.next() call asynchr and thus to avaoid the error: `ExpressionChangedAfterItHasBeenCheckedError` (https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4)
    @Output() reportNeeded = new EventEmitter(true);

    ngOnInit(): void {
        this.nbHitsShownObservable.next(this.nbHitsShown = this.configService.listGetNbHits(this.objectTypeTranslationKey, this.nbHitsShown))

        var initialSearch = this.configService.listGetSearchText(this.objectTypeTranslationKey)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }

        Observable.combineLatest(this.objectsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch).takeWhile(() => this.isPageRunning), (objects, searchTxt: string) => {
            this.configService.listSaveSearchText(this.objectTypeTranslationKey, searchTxt)
            let txt: string = searchTxt.trim().toUpperCase();
            return objects.filter(object => !this.fnFilterObjects || this.fnFilterObjects(object, txt))
        }).do(objects => {
            this.nbHits = objects.length
            this.moneyTotal = this.fnCalculateTotal ? this.fnCalculateTotal(objects) : 0
            this.allObjects = objects            
        }).switchMap(objects => {
            return this.nbHitsShownObservable.map(nbItems => {
                return objects.slice(0, nbItems)
            })
        }).takeWhile(() => this.isPageRunning).subscribe(o => {
            if (!comparatorsUtils.softCopy(this.objects, o))
                this.objects = comparatorsUtils.clone(o)
            this.listChanged.next(this.objects)
        })

        this.configService.getTranslationWord('GENERAL.' + this.objectTypeTranslationKey).subscribe(txt => {
            this.objectTypeText= txt
        })
    }

    isPageRunning: boolean = true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    private moreHits() {
        this.nbHitsShown += this.nbHitsIncrement
        this.configService.listSaveNbHits(this.objectTypeTranslationKey, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    createReport() {
        this.reportNeeded.next(this.allObjects)
    }
}

