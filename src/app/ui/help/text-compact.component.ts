import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'gg-text-compact',
    templateUrl: './text-compact.component.html'
})

export class TextCompactComponent implements OnInit {
  
    @Input() text;
    @Input() numberOfChar = 15;
    @Input() extraTooltipText: string = '';
    
    constructor() {
    }

    ngOnInit(): void {
    }

    shortText() {
        if (this.text.length > (this.numberOfChar + 3)) {
            var lengthText = this.text.substring(this.numberOfChar)
            var addNumberOfChar = lengthText.indexOf(' ')
            var firstSpace = this.numberOfChar + addNumberOfChar
            
                if (this.extraTooltipText == '') {
                    return this.text.substring(0, firstSpace)+'...'
                }
                else {
                    return this.text.substring(0, firstSpace)+'...' +  this.extraTooltipText
                }
        }
        else return this.text;
    }
    

}
