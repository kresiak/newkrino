import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { ConfigService } from './../../Shared/Services/config.service'

@Component(
    {
        selector: 'gg-search-box',
        templateUrl: './search-box.component.html',
        changeDetection: ChangeDetectionStrategy.OnPush
    }
)
export class SearchBoxComponent implements OnInit {
    private searchControl = new FormControl();
    private searchForm;
    private showSearch: boolean = false


    constructor(private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSearchControl() {
        this.searchControl.setValue('')
    }

    //@Input() listName: string
    @Input() objectTypeTranslationKey: string 
    @Input() nbHits: number=0
    @Input() moneyTotal: number=0
    @Output() searchChanged = new EventEmitter(true);  // the true parameter is important to make the this.searchChanged.next() call asynchr and thus to avaoid the error: `ExpressionChangedAfterItHasBeenCheckedError` (https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4)

    ngOnInit(): void {
        var initialSearch = this.configService.listGetSearchText(this.objectTypeTranslationKey)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }
        this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch).takeWhile(() => this.isPageRunning).subscribe(searchTxt => {
            this.configService.listSaveSearchText(this.objectTypeTranslationKey, searchTxt)            
            this.searchChanged.next(searchTxt)
        })
    }

    isPageRunning: boolean= true

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}

