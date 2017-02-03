import {Observable} from 'rxjs/Rx';
import {Injectable, Inject} from '@angular/core'
import { DataStore } from './data.service'

@Injectable()
export class WebSocketService{

    constructor(@Inject(DataStore) private dataStore: DataStore)
    {

    }

    
    ws: WebSocket;
    private url = 'ws://localhost:1337';  //   'ws://139.165.56.57:3002';

    init() {
        this.createObservableSocket().subscribe(data => {
            let obj= JSON.parse(data)
            if (obj && obj.collectionsUpdated){
                (obj.collectionsUpdated as any[]).forEach(collection => {
                    this.dataStore.triggerDataNext(collection)
                })
            }
        })
    }

    createObservableSocket():Observable<any>{

        this.ws = new WebSocket(this.url);

        return new Observable(
          observer => {

            this.ws.onmessage = (event) =>
                      observer.next(event.data);

            this.ws.onerror = (event) => observer.error(event);

            this.ws.onclose = (event) => observer.complete();

        }
     );
    }

    sendMessage(message: any){
        this.ws.send(message);
    }
}