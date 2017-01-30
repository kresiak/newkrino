import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-reception-detail',
        templateUrl: './reception-detail.component.html'
    }
)

export class ReceptionDetailComponent implements OnInit {
    constructor(private dataStore: DataStore ) {
    }

    ngOnInit(): void {
    }
    
}
