import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { NavigationService } from './../Shared/Services/navigation.service'


@Component(
    {
        selector: 'gg-sap-sheet',
        templateUrl: './sap-sheet.component.html'
    }
)
export class SapSheetComponent implements OnInit {
    constructor(private navigationService: NavigationService) {
    }

    @Input() sapItem: any
    @Input() isFacture: boolean= false
    @Input() path: string

    private sortedItems

    ngOnInit(): void {
        this.sortedItems= this.sapItem.items.sort((a,b) => a.poste-b.poste)
    }


 /*   navigateToProduct(productId) {
        this.navigationService.maximizeOrUnmaximize('/product', productId, this.path, false)
    }*/


}
