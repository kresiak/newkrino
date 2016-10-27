import { Component, Input, Output, OnInit, OnChanges, AfterViewInit, ViewEncapsulation, EventEmitter, ElementRef, Inject, HostBinding, HostListener } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'gg-editor',
    host: {
        'class': 'editor'
    },
    templateUrl: './editor.html',
    encapsulation: ViewEncapsulation.None
})
export class Editor implements OnInit, AfterViewInit, OnChanges{
    // Content that will be edited and displayed
    @Input() content;
    // Creating a host element class attribute binding from the editMode property
    @Input() @HostBinding('class.editor--edit-mode') editMode = false;
    @Input() showControls;
    @Input() isMonetary: boolean= false;
    @Output() editSaved = new EventEmitter();
    @Output() editableInput = new EventEmitter();
    private editableContentElement;

    // We use ElementRef in order to obtain our editable element for later use
    constructor( private elementRef:ElementRef) {
        
    }

    resetContent(newcontent)
    {
        this.content= newcontent;
        this.setEditableContent(newcontent);
    }

    ngAfterViewInit():void
    {
        this.setEditableContent(this.content);
    }

    ngOnInit():void 
    {
        this.editableContentElement = this.elementRef.nativeElement.querySelector('.editor__editable-content');
    }

    // We need to make sure to reflect to our editable element if content gets updated from outside
    ngOnChanges(changes) {
        if (changes.content && this.editableContentElement) {
            this.setEditableContent(changes.content.currentValue);
        }
    }

    // This returns the content of our content editable
    getEditableContent() {
        return this.editableContentElement.textContent;
    }

    // This sets the content of our content editable
    setEditableContent(content) {
        this.editableContentElement.textContent = content;
    }

    // This annotation will create a click event listener on the host element that will invoke the underlying method
    @HostListener('click')
    focusEditableContent() {
        if (this.editMode) {
            this.editableContentElement.focus();
        }
    }

    // Method that will be invoked if our editable element is changed
    onInput() {
        // Emit a editableInput event with the edited content
        this.editableInput.next(this.getEditableContent());
    }

    // On save we reflect the content of the editable element into the content field and emit an event
    save() {
        this.content = this.getEditableContent();
        this.editSaved.next(this.content);
        // Setting editMode to false to switch the editor back to viewing mode
        this.editMode = false;
    }

    // Canceling the edit will not reflect the edited content and switch back to viewing mode
    cancel() {
        this.setEditableContent(this.content);
        this.editableInput.next(this.getEditableContent());
        this.editMode = false;
    }

    // The edit method will initialize the editable element and set the component into edit mode
    edit() {
        this.editMode = true;
    }
}
