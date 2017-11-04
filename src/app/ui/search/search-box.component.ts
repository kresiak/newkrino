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

    private nbHitsShown: number = 20
    private nbHitsIncrement: number = 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)

    private moneyTotal: number = 0
    private objectTypeText: string

    private isReverse: boolean = false
    private isReverseObservable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isReverse)

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
    @Input() sortFunctionObservable: Observable<any>

    @Output() listChanged = new EventEmitter(true);  // the true parameter is important to make the this.searchChanged.next() call asynchr and thus to avaoid the error: `ExpressionChangedAfterItHasBeenCheckedError` (https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4)
    @Output() reportNeeded = new EventEmitter(true);

    private explainedComplexQuery: string = ''

    private createFilterFn(searchString: string) {
        if (!this.fnFilterObjects) return (object) => true
        var txt = searchString.toUpperCase()
        var orList = txt.split(' OR ').map(terme => terme.split(' AND ').map(e => e.trim()).filter(e => e != '')).filter(andList => andList && andList.length > 0)

        var fn= txt => '<b>' + txt + '</b>'
        var fn2= txt => ' <b>' + txt + '</b> '

        this.explainedComplexQuery = orList.reduce((acc, andList) => {
            var andText = andList.reduce((acc2, tokenTxt: string) => {
                var isNot = tokenTxt.startsWith('NOT ')
                var tokenTxtChanged= isNot ? (fn('[ ') + fn('NOT ') + tokenTxt.substr(4) + fn(' ]')) : tokenTxt
                return acc2 + (acc2 ? fn2('AND') : '') + tokenTxtChanged
            }, '')
            var andTextChanged= (andList && andList.length > 1) ?  (fn('[ ') + andText + fn(' ]')) : andText
            return acc + (acc ? fn2('OR') : '') + andTextChanged
        }, '')

        if (this.explainedComplexQuery.trim().toUpperCase() === txt.trim().toUpperCase()) this.explainedComplexQuery = ''      // hide it if it doesn't bring any extra info

        return object => {
            if (!orList || orList.length === 0) return true
            return orList.reduce((isOrListOkSoFar, andList: any[]) => {
                if (isOrListOkSoFar) return true
                var isThisOk: boolean = andList.reduce((isAndListOkSoFar, tokenTxt: string) => {
                    if (!isAndListOkSoFar) return false
                    var isNot = tokenTxt.startsWith('NOT ')
                    var txtToSearch = isNot ? tokenTxt.substring(4).trim() : tokenTxt
                    var result = this.fnFilterObjects(object, txtToSearch)
                    return isNot ? !result : result
                }, true)
                return isThisOk
            }, false)
        }
    }

    ngOnInit(): void {
        this.nbHitsShownObservable.next(this.nbHitsShown = this.configService.listGetNbHits(this.objectTypeTranslationKey, this.nbHitsShown))

        var initialSearch = this.configService.listGetSearchText(this.objectTypeTranslationKey)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }

        Observable.combineLatest(this.objectsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch).takeWhile(() => this.isPageRunning), (objects, searchTxt: string) => {
            this.configService.listSaveSearchText(this.objectTypeTranslationKey, searchTxt)
            var filterFn = this.createFilterFn(searchTxt)
            return objects.filter(object => filterFn(object))
        }).do(objects => {
            this.nbHits = objects.length
            this.moneyTotal = this.fnCalculateTotal ? this.fnCalculateTotal(objects) : 0
            this.allObjects = objects
        }).switchMap(objects => {
            if (!this.sortFunctionObservable) return Observable.from([objects])
            var objectsCopy = comparatorsUtils.clone(objects)
            return this.sortFunctionObservable.map(fn => {
                return fn ? objectsCopy.sort(fn) : objects
            })
        }).switchMap(objects => {
            var objectsCopy = comparatorsUtils.clone(objects)
            return this.isReverseObservable.map(isReverse => {
                return isReverse ? objectsCopy.reverse() : objects
            })
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
            this.objectTypeText = txt
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

    private allHits() {
        this.nbHitsShown = this.nbHits
        this.configService.listSaveNbHits(this.objectTypeTranslationKey, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    createReport() {
        this.reportNeeded.next(this.allObjects)
    }

    private reverseHits() {
        this.isReverse = !this.isReverse
        this.isReverseObservable.next(this.isReverse)
    }

}

