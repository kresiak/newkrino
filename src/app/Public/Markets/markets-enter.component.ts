import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
import { AuthAnoynmousService } from './../../Shared/Services/auth-anonymous.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import * as utilsdate from './../../Shared/Utils/dates'
import { UploadMetadata, FileHolder, ImageUploadComponent  } from "angular2-image-upload";

@Component(
    {
        selector: 'gg-enter-market-product',
        templateUrl: './markets-enter.component.html'
    }
)
export class MarketsEnterComponent implements OnInit {
    isPageRunning: boolean = true;
    private marketsEnterForm: FormGroup

    @ViewChild(ImageUploadComponent) imageUploadComponent: ImageUploadComponent;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder, private authAnoynmousService: AuthAnoynmousService) {
    }


    ngOnInit(): void {

        this.marketsEnterForm = this.formBuilder.group({
            nameOfProduct: ['', [Validators.required, Validators.minLength(2)]],
            package: ['', [Validators.required, Validators.minLength(2)]],
            supplier: ['', [Validators.required, Validators.minLength(2)]],
            catalogNr: [''],
            price: ['', [Validators.required]],
            justification: ['']
        });
    }

    save(formValue, isValid, resteAll: boolean) {
        this.dataStore.getDataObservable('products.market').first().map(products => products.filter(p => p.name.toUpperCase().trim() === formValue.nameOfProduct.toUpperCase().trim() && p.package.toUpperCase().trim() === formValue.package.toUpperCase().trim()))
            .switchMap(products => {
                var createItem = () => {
                    return {
                        date: utilsdate.nowFormated(),
                        userId: this.authAnoynmousService.getUserId(),
                        supplier: formValue.supplier,
                        catalogNr: formValue.catalogNr,
                        price: formValue.price,
                        justification: formValue.justification,
                        documents: this.fileDocuments.map(fn => fn.filename)
                    }
                }

                if (products.length > 0) {
                    var theProduct = products[0]
                    if (!theProduct.items) theProduct.items = []
                    theProduct.items.push(createItem())
                    return this.dataStore.updateData('products.market', theProduct._id, theProduct)
                }
                else {
                    var newProduct = {
                        name: formValue.nameOfProduct,
                        package: formValue.package,
                        items: [createItem()]
                    }
                    return this.dataStore.addData('products.market', newProduct)
                }
            }).subscribe(res => {
                this.resetMarketsEnterForm(resteAll);
            })
    }

    private fileDocuments: any[] = []

    resetMarketsEnterForm(resetAll: boolean) {
        if (resetAll) this.marketsEnterForm.controls['nameOfProduct'].setValue('')
        if (resetAll) this.marketsEnterForm.controls['package'].setValue('')
        this.marketsEnterForm.controls['supplier'].setValue('')
        this.marketsEnterForm.controls['catalogNr'].setValue('')
        this.marketsEnterForm.controls['price'].setValue('')
        this.marketsEnterForm.controls['justification'].setValue('')
        this.fileDocuments = []
        this.imageUploadComponent.deleteAll()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    private createOurFileObj(file) {
        return {
            name: file.name,
            size: file.size,
            lastModified: file.lastModified
        }
    }

    private getServerFileName(res) {
        var x = JSON.parse(res.serverResponse._body)
        var filename = x ? x.filename : 'unknown'
        return filename
    }

    onUploadFinished(res) {
        var filename = this.getServerFileName(res)

        this.fileDocuments.push(
            {
                file: this.createOurFileObj(res.file),
                filename: filename
            }
        )
    }

    onBeforeUpload = (metadata: UploadMetadata) => {
        if (!metadata || !metadata.file) {
            metadata.abort = true
            return metadata
        }
        var ab = this.createOurFileObj(metadata.file)
        var x = JSON.stringify(ab)
        if (this.fileDocuments.map(f => JSON.stringify(f.file)).includes(x))
            metadata.abort = true

        return metadata;
    };

    onRemoved(res: FileHolder) {
        var filename = this.getServerFileName(res)
        var theFile=  this.fileDocuments.filter(fn => fn.filename===filename)[0]
        if (theFile) {
            var index = this.fileDocuments.indexOf(theFile)
            if (index > -1) {
                this.fileDocuments.splice(index, 1)
            }
        }
    }
}