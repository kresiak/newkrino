import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { PrestationService } from './../Shared/Services/prestation.service'
import {AuthService} from './../Shared/Services/auth.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from './../Shared/Services/product.service'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-prestation-detail',
        templateUrl: './prestation-detail.html'
    }
)
export class PrestationDetailComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private prestationService: PrestationService, private authService: AuthService, private productService: ProductService) {
    }

    @Input() prestationObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged = new EventEmitter();
    private prestation: any;
    private manipsPossible: any;
    private manipsObservable: Observable<any>;

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }


    private formManipSheet: FormGroup;
    private stockProductsObservable: Observable<any>;
    private collapseStatus= {};

    isCollapseOpen(id)
    {
        if (! (id in this.collapseStatus)) this.collapseStatus[id]= true;
        return this.collapseStatus[id];
    }

    toggleCollapse(id)
    {
        if (! (id in this.collapseStatus)) this.collapseStatus[id]= true;
        this.collapseStatus[id] = ! this.collapseStatus[id];  
    }

    formManipSheetBuild(possibleManips, currentPrestation) {
        this.formManipSheet= new FormGroup({});
        let manipsSheet= currentPrestation.data.manips;
        possibleManips.forEach(manip => {
            var grpManip= new FormGroup({});
            this.formManipSheet.addControl(manip.data._id, grpManip );
            let manipSheet= manipsSheet ? manipsSheet.filter(manipInSheet => manipInSheet.manipId===manip.data._id)[0] : null;
            grpManip.addControl('useManip', new FormControl(manipSheet));

            manip.annotation.products.forEach(product => {
                let prodInSheet= manipSheet && manipSheet.products ? manipSheet.products.filter(prod => prod.productId===product.data._id)[0] : null; 
                var grpProduct= new FormGroup({});
                grpManip.addControl(product.data._id, grpProduct);
                grpProduct.addControl('nbUnits', new FormControl(prodInSheet ? prodInSheet.quantity : ''))
            })
        });
    }

    getStockProductObservable(id: string): Observable<any> {
        return this.stockProductsObservable.map(products => 
        {
            let product= products.filter(s => s.key === id)[0];
            return product; 
        } );
    }

    ngOnInit(): void {
        this.stateInit();

        this.stockProductsObservable = this.productService.getAnnotatedAvailableStockProductsAll();

        this.prestationObservable.subscribe(prestation => {
            this.prestation = prestation;            
            this.manipsObservable = this.prestationService.getAnnotatedManipsByLabel(this.prestation.data.labelId);
            this.manipsObservable.subscribe(manips => {
                this.manipsPossible= manips;
                if (manips) this.formManipSheetBuild(manips, prestation);
            });

        });
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    reset() {
        this.formManipSheetBuild(this.manipsPossible, this.prestation);
    }

    save(formValue, isValid) {
        if (!isValid) return;
        let manipsData= this.manipsPossible.filter(manip => formValue[manip.data._id] && formValue[manip.data._id].useManip).map(manip => {
            return {
                manipId: manip.data._id,                
                products: manip.annotation.products.filter(product => formValue[manip.data._id][product.data._id] && +formValue[manip.data._id][product.data._id].nbUnits).map(product =>
                    {
                        return {
                            productId: product.data._id,
                            quantity: +formValue[manip.data._id][product.data._id].nbUnits
                        }
                    }
                )
            };
        })
        this.prestation.data.manips= manipsData;

        this.prestationService.updatePrestation(this.prestation.data);
    }

    logHours(nbHours, manip)
    {
        if (! +nbHours || +nbHours <= 0) return;
        if (!manip.worklogs) 
            manip.worklogs=[];
        manip.worklogs.push({
            nbHours: + nbHours,
            userId: this.authService.getUserId(),
            date: new Date()
        });
        
        this.prestationService.updatePrestation(this.prestation.data);
    }
}