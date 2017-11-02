import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router';


import { UiModule } from'../../ui/modules/ui.module'
import { CommentsModule } from'../../Comments/modules/comments.module'

import { XeniaMainComponent } from '../xenia-main.component'
import { XeniaWelcomeMainComponent } from '../xenia-welcome-main.component'
import { XeniaWelcomeIntroComponent } from '../welcome/welcome-intro.component'
import { XeniaWelcomeNameComponent } from '../welcome/welcome-name.component'
import { XeniaWelcomeNameConfirmComponent } from '../welcome/welcome-name-confirm.component'
import { XeniaWelcomeEmailComponent } from '../welcome/welcome-email.component'
import { XeniaWelcomePiComponent } from '../welcome/welcome-pi.component'
import { XeniaWelcomeFinalComponent } from '../welcome/welcome-final.component'

import { XeniaWelcomeService } from '../services/welcome.service'


@NgModule({
  imports: [
    NgbModule, CommonModule, TranslateModule, RouterModule,
    FormsModule, ReactiveFormsModule, UiModule, CommentsModule
  ],
  declarations: [
    XeniaMainComponent, XeniaWelcomeMainComponent, 
    XeniaWelcomeIntroComponent, XeniaWelcomeNameComponent, XeniaWelcomeNameConfirmComponent, XeniaWelcomeEmailComponent, XeniaWelcomePiComponent, XeniaWelcomeFinalComponent
  ],
  exports: [
      XeniaMainComponent, XeniaWelcomeMainComponent
  ],
  providers: [
      XeniaWelcomeService
    ],
  bootstrap: [
    XeniaMainComponent
  ]
})
export class XeniaModule { }

