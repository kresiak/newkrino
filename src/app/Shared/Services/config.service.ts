import { Injectable, Inject } from '@angular/core'

Injectable()
export class ConfigService {

    constructor( ) {

    }

    isProduction(): boolean {
        return false
    }

}