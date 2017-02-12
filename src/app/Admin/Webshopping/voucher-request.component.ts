import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"
import { OrderService } from '../../Shared/Services/order.service'
import { ProductService } from '../../Shared/Services/product.service'
import { DataStore } from './../../Shared/Services/data.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-voucher-request',
        templateUrl: './voucher-request.component.html'
    }
)

export class AdminWebShoppingVoucherRequestComponent {
    private voucherForm: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder, private orderService: OrderService, private productService: ProductService, private _sanitizer: DomSanitizer) {

    }

    @Input() openRequest: any
    private otpList: any

    ngOnInit(): void {

        this.voucherForm = this.formBuilder.group({
            sapId: ['', [Validators.required, Validators.minLength(5)]],
            otp: ['', [Validators.required, Validators.minLength(5)]]
        })

        this.orderService.getAnnotatedOpenOtpsByCategory(this.openRequest.categoryId).subscribe(otps => {
            this.otpList = otps.map(otp => {
                return {
                    id: otp.data._id,
                    value: otp.data.name
                }
            })
        })
    }

    save(formValue, isValid) {
        var data= {
            userId: this.openRequest.userId,
            supplierId: this.openRequest.supplierId,
            categoryId: this.openRequest.categoryId,
            sapId: formValue.sapId,
            otpId: formValue.otp.id
        }

        this.productService.createVoucher(data)
        
    }

    reset() {
        this.voucherForm.reset();
    }

    autocompleListFormatter = (data: any): SafeHtml => {
        let html = `<span>${data.value}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
}