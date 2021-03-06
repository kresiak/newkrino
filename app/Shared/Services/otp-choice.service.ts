import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { OrderService } from './order.service'
import { Observable } from 'rxjs/Rx'


Injectable()
export class OtpChoiceService {

    constructor(@Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService,
                    @Inject(OrderService) private orderService: OrderService)
    {

    }

    determineOtp(product, quantity: number, annotatedOtps: any[]) : any
    {
        var equipeId= this.authService.getEquipeId();
        var totalPrice= +product.price * quantity * 1.21;

        let possibleOtps= !annotatedOtps ? [] : 
            annotatedOtps.filter(otp => otp.annotation.amountAvailable > totalPrice).filter(otp => {
            let productCategories: string[]= product.categoryIds ? product.categoryIds : [];
            let allowedCategories: string[]= otp.data.categoryIds ? otp.data.categoryIds : [];
            return allowedCategories.filter(otpCategory => productCategories.includes(otpCategory)).length > 0;
        });

        return possibleOtps.length > 0 ? {
            _id: possibleOtps[0].data._id, 
            name: possibleOtps[0].data.name} : {
                _id: undefined,
                Name: 'no available Otp'
            } ;
    }
}

