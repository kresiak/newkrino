import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { OrderService } from './order.service'
import { Observable, Subscription } from 'rxjs/Rx'


Injectable()
export class OtpChoiceService {

    constructor(@Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService,
                    @Inject(OrderService) private orderService: OrderService)
    {

    }

    determineOtp(product, quantity: number, otpsBudgetMap, currentEquipeId: string) : any
    {
        var equipeId= this.authService.getEquipeId();
        var totalPrice= +product.price * quantity * 1.21;

        var annotatedOtps: any[]=  Array.from(otpsBudgetMap.values())

        let possibleOtps= !annotatedOtps ? [] : 
            annotatedOtps.filter(otp => otp.annotation.amountAvailable > totalPrice).filter(otp => {
            let productCategories: string[]= product.categoryIds ? product.categoryIds : [];
            let allowedCategories: string[]= otp.data.categoryIds ? otp.data.categoryIds : [];
            return allowedCategories.filter(otpCategory => productCategories.includes(otpCategory)).length > 0;
        }).filter(otp => otp.data.priority > 0).sort((o1, o2) => {
            return +o1.data.priority - +o2.data.priority
        });

        var pos= 0;// Math.floor(Math.random() * possibleOtps.length)

        return possibleOtps.length > 0 ? {
            _id: possibleOtps[pos].data._id, 
            name: possibleOtps[pos].data.name} : {
                _id: undefined,
                Name: 'no available Otp'
            } ;
    }
}

