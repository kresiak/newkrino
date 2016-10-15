import {Component, Input, OnInit} from '@angular/core';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-product-list',
        templateUrl: './product-list.component.html'
    }
)
export class ProductListComponent implements OnInit
{
    @Input() products;

    ngOnInit() : void{
        
    }
}