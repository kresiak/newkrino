import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'gg-text-compact',
    templateUrl: './text-compact.component.html'
})

export class TextCompactComponent implements OnInit {
  
    @Input() text;
    @Input() numberOfChar = 15;

    constructor() {
    }

    ngOnInit(): void {
    }

    numberOfCharacters() {
        if (this.text.length > (this.numberOfChar + 3)) { 
            return this.text.substring(0,this.numberOfChar)+'...'}
        else return this.text;
    }
}
