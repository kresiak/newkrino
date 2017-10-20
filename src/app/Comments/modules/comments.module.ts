import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from 'ng2-translate'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { UiModule } from'../../ui/modules/ui.module'

import { CommentComponent } from '../comment.component'
import { CommentsTabComponent } from '../comments-tab.component'
import { CommentsTabTitleComponent } from '../comments-tab-title.component'
import { CommentsComponent } from '../comments.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule, UiModule, TranslateModule, NgbModule
  ],
  declarations: [
      CommentComponent, CommentsComponent, CommentsTabComponent, CommentsTabTitleComponent
  ],
  exports: [
      CommentComponent, CommentsComponent, CommentsTabComponent, CommentsTabTitleComponent
  ],
  providers: [
    ],
  bootstrap: []
})
export class CommentsModule { }

