import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service';
import { SelectableData } from './../Shared/Classes/selectable-data'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-product',
        templateUrl: './product.component.html'
    }
)
export class ProductComponent implements OnInit {
    constructor(private dataStore: DataStore) {    }

    ngOnInit(): void {
        this.selectableCategoriesObservable = this.dataStore.getDataObservable('Categories').map(categories => {
            return categories.map(category =>
                new SelectableData(category._id, category.Description)
            )
        });
        this.selectedDataObservable = this.productObservable.map(product => product.Categorie);
        this.productObservable.subscribe(product => {
            this.product = product;
        });
    }

    @Input() productObservable: Observable<any>;
    private product;
    private selectableCategoriesObservable: Observable<any>;
    private selectedDataObservable: Observable<any>;

    // =======================
    // Feedback from controls
    // =======================

    descriptionUpdated(desc: string) {
        this.product.Description = desc;
        this.dataStore.updateData('Produits', this.product._id, this.product);
    }

    categorySelectionChanged(selectedIds: string[]) {
        this.product.Categorie = selectedIds;
        this.dataStore.updateData('Produits', this.product._id, this.product);
    }

    categoryHasBeenAdded(newCategory: string)
    {
        this.dataStore.addData('Categories', {'Description': newCategory});
    }
}