import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { SelectableData } from './../Classes/selectable-data'


@Injectable()
export class AuthService {
    constructor( @Inject(DataStore) private dataStore: DataStore) { }

    private currentUserId='58402ef9f9690561d454c337';
    private currentEquipeId= '58404ee1280a8833c87528d8';

    private currentUserIdObservable= new BehaviorSubject(this.currentUserId);

    private createAnnotatedUser(user, equipes) {
        if (!user) return null;
        let filteredEquipes= equipes.filter(equipe => equipe.userIds && equipe.userIds.includes(user._id));
        return {
            data: user,
            annotation: {
                fullName: user.firstName + ' ' +user.name,
                equipes: filteredEquipes
            }
        };
    }

    getAnnotatedUsers(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('users.krino'),
            this.dataStore.getDataObservable('equipes'),
            (users, equipes) =>
            {
                return users.map(user => this.createAnnotatedUser(user, equipes));
            });
    }

    getSelectableUsers(): Observable<SelectableData[]> {
        return this.getAnnotatedUsers().map(annotatedUsers => {
            return annotatedUsers.sort((user1, user2) => { return user1.annotation.fullName < user2.annotation.fullName ? -1 : 1; }).
                filter(user => ! user.data.isBlocked).
                map(user => new SelectableData(user.data._id, user.annotation.fullName))
        })
    }

    getAnnotatedCurrentUser(): Observable<any>
    {
        return Observable.combineLatest(this.getAnnotatedUsers(), this.currentUserIdObservable, (users, userId) => {
            let usersFiltered=users.filter(user => user.data._id===userId);
            return usersFiltered.length === 0 ? null : usersFiltered[0]; 
        });
    }

    getUserId(): string {
        return this.currentUserId;
    }

    getUserIdObservable(): Observable<any> {
        return this.currentUserIdObservable;
    }

    setUserId(id: string): void{
        this.currentUserId= id;
        this.currentUserIdObservable.next(id);
    }

    isAuthenticated(): boolean {
        return true;
    }

    getEquipeId(): string {
        return this.currentEquipeId;
    }

    setEquipeId(id: string): void
    {
        this.currentEquipeId= id;
    }

}