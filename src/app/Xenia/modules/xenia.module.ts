import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from 'ng2-translate'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router';


import { UiModule } from'../../ui/modules/ui.module'
import { CommentsModule } from'../../Comments/modules/comments.module'

import { XeniaMainComponent } from '../xenia-main.component'
import { XeniaWelcomeMainComponent } from '../xenia-welcome-main.component'
import { XeniaWelcomeIntroComponent } from '../welcome/welcome-intro.component'

@NgModule({
  imports: [
    NgbModule, CommonModule, TranslateModule, RouterModule,
    FormsModule, ReactiveFormsModule, UiModule, CommentsModule
  ],
  declarations: [
    XeniaMainComponent, XeniaWelcomeMainComponent, XeniaWelcomeIntroComponent
  ],
  exports: [
      XeniaMainComponent, XeniaWelcomeMainComponent
  ],
  providers: [
    ],
  bootstrap: [
    XeniaMainComponent
  ]
})
export class XeniaModule { }

