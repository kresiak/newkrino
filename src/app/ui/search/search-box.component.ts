import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { ConfigService } from './../../Shared/Services/config.service'

@Component(
    {
        selector: 'gg-search-box',
        templateUrl: './search-box.component.html'
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
    @Output() searchChanged = new EventEmitter();

    ngOnInit(): void {
        var initialSearch = this.configService.listGetSearchText(this.objectTypeTranslationKey)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }
        this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch).subscribe(searchTxt => {
            this.configService.listSaveSearchText(this.objectTypeTranslationKey, searchTxt)            
            this.searchChanged.next(searchTxt)
        })
    }

    ngOnDestroy(): void {
    }

}

