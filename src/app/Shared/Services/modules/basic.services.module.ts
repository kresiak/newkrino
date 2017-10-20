import { NgModule } from '@angular/core';

import { AdminService } from '../admin.service';
import { ApiService } from '../api.service';
import { ProductService } from '../product.service'
import { DataStore } from '../data.service';
import { AuthService } from '../auth.service'
import { ConfigService } from '../config.service'
import { WebSocketService } from '../websocket.service'

@NgModule({
    providers: [ ]
})
export class BasicServicesModule {
  static forRoot() {
    return {
      ngModule: BasicServicesModule,
      providers: [ WebSocketService, ConfigService, ApiService, DataStore, AuthService, AdminService, ProductService  ]
    }
  }
}