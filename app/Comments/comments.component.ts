import {Component, Input, Output, ViewEncapsulation, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {Editor} from '../ui/editor/editor'
import {UserService} from '../Shared/Services/user.service'

@Component({
  moduleId: module.id,
  selector: 'gg-comments',
  host: {
    'class': 'comments'
  },
  templateUrl: './comments.component.html'
})
export class CommentsComponent implements OnInit {
  @Input() comments;
  @Output() commentsUpdated = new EventEmitter();
  // We are using an editor for adding new comments and control it directly using a reference
  @ViewChild(Editor) newCommentEditor;

  
  constructor(private userService: UserService) {
  }

  ngOnInit():void{
    if (!this.comments)
    {
      this.comments= [];
    }
  }

  onChanges(changes) {
    if (changes.comments && changes.comments.currentValue === undefined) {
      this.comments = [];
    }
  }

  addNewComment() {
    this.userService.getCurrentUserObjectForComment().first().subscribe(userrecord =>
    {
      const comments = this.comments.slice();
      comments.splice(0, 0, {
        user: userrecord,
        time: +new Date(),
        content: this.newCommentEditor.getEditableContent()
      });
      this.commentsUpdated.next(comments);
      this.newCommentEditor.setEditableContent('');
    });
  }

  onCommentEdited(comment, content) {
    const comments = this.comments.slice();
    if (content.length === 0) {
      comments.splice(comments.indexOf(comment), 1);
    } else {
      comments.splice(comments.indexOf(comment), 1, {
        user: comment.user,
        time: comment.time,
        content
      });
    }
    this.commentsUpdated.next(comments);
  }
}
