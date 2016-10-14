import {Injectable} from '@angular/core'
import {Http, Headers, RequestMethod, Request} from '@angular/http'
import {Observable} from 'rxjs/Observable'



@Injectable()
export class ApiService {
    constructor (
        private _http: Http
    ) {}

    // Our primary method. It accepts the name of the api request we want to make, an item if the request is a post request and the id if required
    send(name, item?, id?) {

        let url: string,                            // The url that we should post to 
            type: any,                              // Type of the request ['post', 'put', 'get', 'delete']
            body: any;                              // Body of the request

        // Set the right url using the provided name
        switch (name) {
            // Get all users
            case 'getSuppliers':
                url = 'http://localhost:1337/data/Suppliers';
                type = RequestMethod.Get;
                break;

            // All we need to do to handle new API calls is add them inside of this switch statement    
        }

        // Define the options for the request
        let options = {
            method: type,
            url: url,
            body: null,
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };

        // If the passed item is a string use it
        // Otherwise json stringify it
        if (item) {
            body = typeof item === 'string' ? item : JSON.stringify(item);
            options.body = body;
        }

        // Returns an observable 
        return this._http.request(new Request(options))
            .map(res => res.json())
            .catch(this.logError);
    }

    // Error handling 
    private logError (error: Error) {
        return Observable.throw(error || 'There was an error with the request');
    }
}
