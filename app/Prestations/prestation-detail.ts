import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { PrestationService } from './../Shared/Services/prestation.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-prestation-detail',
        templateUrl: './prestation-detail.html'
    }
)
export class PrestationDetailComponent implements OnInit {
    constructor(private formBuilder: FormBuilder, private prestationService: PrestationService) {
    }

    private formManipSheet: FormGroup;

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

    /*    private getManipsObservable(): Observable<any>
        {
            return this.prestationObservable.map(prestation => prestation.annotation.manips);
        }
    */


    formBuild(manips, prestation) {

        let groupConfig = {};
        let manipsSheet= prestation.data.manips;
        manips.forEach(manip => {
            let groupConfig2 = {};
            let manipSheet= manipsSheet && manipsSheet[manip.data._id] ? manipsSheet[manip.data._id] : null;
            groupConfig2['useManip'] = [manipSheet ? manipSheet.useManip  : ''];
            manip.annotation.products.forEach(product => {
                groupConfig2[product.data._id] = this.formBuilder.group({
                    nbUnits: [manipSheet && manipSheet[product.data._id] ? manipSheet[product.data._id].nbUnits : '']
                });
            })
            groupConfig[manip.data._id] = this.formBuilder.group(groupConfig2);
        });
        this.formManipSheet = this.formBuilder.group(groupConfig);
    }


    ngOnInit(): void {

        this.stateInit();
        this.prestationObservable.subscribe(prestation => {
            this.prestation = prestation;
            this.manipsObservable = this.prestationService.getAnnotatedManipsByLabel(this.prestation.data.labelId);
            this.manipsObservable.subscribe(manips => {
                this.manipsPossible= manips;
                if (manips) this.formBuild(manips, prestation);
            });

        });
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    reset() {
        this.formBuild(this.manipsPossible, this.prestation);
    }

    save(formValue, isValid) {
        if (!isValid) return;
        this.prestation.data.manips= formValue;

        this.prestationService.updatePrestation(this.prestation.data);
    }
}