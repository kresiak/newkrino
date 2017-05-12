import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'gg-text-compact',
    templateUrl: './text-compact.component.html'
})

export class TextCompactComponent implements OnInit {
  
    @Input() text;
    @Input() numberOfChar = 20;

    constructor() {
    }

    ngOnInit(): void {
    }

    numberOfCharacters() {
        return this.text.substring(0,this.numberOfChar)+'...';
    }
}
