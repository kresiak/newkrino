import {Component, Input, Output, ViewEncapsulation, EventEmitter} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'gg-comment',
  host: {
    'class': 'comment'
  },
  templateUrl: './comment.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class CommentComponent {
  constructor()
  {
  }

  @Input() time;
  @Input() user;
  @Input() content;
  @Output() commentEdited = new EventEmitter();

  onEditSaved(content) {
    this.commentEdited.next(content);
  }
}
