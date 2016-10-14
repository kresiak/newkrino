import {Component, OnInit} from '@angular/core'
import {ApiService} from './../Shared/Services/api.service'

@Component(
 {
     moduleId: module.id,
     templateUrl: './supplier-list.component.html'
 }
)
export class SupplierListComponent implements OnInit{
    constructor(private apiService: ApiService)    {}

    suppliers= [];
    alex = 'hello';

    ngOnInit():void{
        this.apiService.send('getSuppliers').subscribe(
            res =>
            {
                this.suppliers= res;
                this.alex= 'done ';
            },             
            err => console.log(err)
        );
    }

}

