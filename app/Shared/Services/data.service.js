/*import { Injectable } from '@angular/core'
import { BehaviorSubject } from "rxjs/Rx";
import {Observable} from 'rxjs/Rx'
import 'rxjs/add/operator/asObservable';
import { ApiService } from './api.service';



@Injectable()
export class TodoStore {

    private dataStreams = {};

    constructor(private apiService: ApiService) {
    }

    dataObservable(table: string) {
        if (this.dataStreams[table]) {
            return (<BehaviorSubject<any[]>>this.dataStreams[table]).asObservable();
        }
    }

    allData(table: string): Observable<any> {
        let obs = this.apiService.crudGetRecords(table);
        obs.subscribe(
            res => {
                let data = (<Object[]>res.json());

                if (!this.dataStreams[table]) {
                    this.dataStreams[table] = new BehaviorSubject<any[]>(data)
                }
                else {
                    this.dataStreams[table].next(data);
                }
            },
            err => console.log("Error retrieving Todos")
        );
        return obs;
    }

    addData(table: string, newRecord: any): Observable<any> {

        let obs = this.apiService.crudCreateRecord(table, newRecord);

        obs.subscribe(+
                this._todos.next(this._todos.getValue().push(newTodo));
            });

        return obs;
    }

    toggleTodo(toggled: Todo): Observable {
        let obs: Observable = this.apiService.toggleTodo(toggled);

        obs.subscribe(
            res => {
                let todos = this._todos.getValue();
                let index = todos.findIndex((todo: Todo) => todo.id === toggled.id);
                let todo: Todo = todos.get(index);
                this._todos.next(todos.set(index, new Todo({ id: toggled.id, description: toggled.description, completed: !toggled.completed })));
            }
        );

        return obs;
    }


    deleteTodo(deleted: Todo): Observable {
        let obs: Observable = this.apiService.deleteTodo(deleted);

        obs.subscribe(
            res => {
                let todos: List<Todo> = this._todos.getValue();
                let index = todos.findIndex((todo) => todo.id === deleted.id);
                this._todos.next(todos.delete(index));

            }
        );

        return obs;
    }


}*/ 
//# sourceMappingURL=data.service.js.map