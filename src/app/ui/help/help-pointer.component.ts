import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'gg-help-pointer',
    templateUrl: './help-pointer.component.html'
})

export class HelpPointerComponent implements OnInit {
  
    @Input() helpText;
    @Input() isSmall: boolean = true;

    constructor() {
    }

    ngOnInit(): void {
    }

    

}
