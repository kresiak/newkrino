import {Component, Input} from '@angular/core';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-product',
        templateUrl: './product.component.html'
    }
)
export class ProductComponent
{
    @Input() product;
}