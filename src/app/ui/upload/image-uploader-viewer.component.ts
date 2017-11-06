import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { DataStore } from './../../Shared/Services/data.service'

@Component({
    selector: 'gg-image-uploader-viewer',
    templateUrl: 'image-uploader-viewer.component.html'
})
export class ImageUploaderViewerComponent {

    @Input() documents = []
    @Input() canUserChange: boolean = false
    @Output() imagesChanged = new EventEmitter()

    @ViewChild('uploader') imageUploadComponent;

    constructor(private dataStore: DataStore) { }

    deleteDocument(docPos) {
        this.documents.splice(docPos, 1)
        this.imagesChanged.next(this.documents)
    }

    onUploadFinished(newDocuments) {
        if (newDocuments && newDocuments.length === 1) {
            this.documents.push(newDocuments[0])
            this.imageUploadComponent.clearPictures()
            this.imagesChanged.next(this.documents)
        }
    }

}