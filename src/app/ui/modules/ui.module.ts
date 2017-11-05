import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { Editor } from '../editor/editor'
import { EditorAutocomplete } from '../editor/editor-autocomplete'
import { EditorAutocompleteText } from '../editor/editor-autocomplete-text'
import { EditorNumber } from '../editor/editor-number'
import { EditorDate } from '../editor/editor-date'
import { EditorBoolean } from '../editor/editor-boolean'
import { Checkbox } from '../checkbox/checkbox'
import { CheckboxDelete } from '../confirmation/checkbox-delete.component'
import { ButtonActionConfirm } from '../confirmation/button-action.component'


import { SelectorComponent } from '../selector/selector.component'
import { HelpPointerComponent } from '../help/help-pointer.component'
import { DatePointerComponent } from '../help/date-pointer.component'
import { TextCompactComponent } from '../help/text-compact.component'

import { SearchBoxComponent } from '../search/search-box.component'

import { FullDatePipe } from '../../Shared/Pipes/fulldate.pipe'
import { ShortDatePipe } from '../../Shared/Pipes/shortdate.pipe'
import { FromNowPipe } from '../../Shared/Pipes/fromnow.pipe'

import { ModalConfirmComponent } from '../modal/modal-confirm.component'

@NgModule({
  imports: [
    Ng2AutoCompleteModule, NgbModule, CommonModule, TranslateModule,
    FormsModule, ReactiveFormsModule    
  ],
  declarations: [
    Editor, EditorNumber, EditorDate, EditorBoolean, Checkbox, CheckboxDelete, ButtonActionConfirm, SelectorComponent, EditorAutocomplete, EditorAutocompleteText,
    HelpPointerComponent, DatePointerComponent, TextCompactComponent,  SearchBoxComponent,
    FullDatePipe, ShortDatePipe, FromNowPipe, ModalConfirmComponent
  ],
  exports: [
    Editor, EditorNumber, EditorDate, EditorBoolean, Checkbox, CheckboxDelete, ButtonActionConfirm, SelectorComponent, EditorAutocomplete, EditorAutocompleteText,
    HelpPointerComponent, DatePointerComponent, TextCompactComponent,  SearchBoxComponent,
    FullDatePipe, ShortDatePipe, FromNowPipe,
    ModalConfirmComponent
  ],
  providers: [
    ],
  entryComponents: [
    ModalConfirmComponent
  ],
  bootstrap: []
})
export class UiModule { }
