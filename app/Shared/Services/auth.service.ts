import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { Observable } from 'rxjs/Rx'
import { SelectableData } from './../Classes/selectable-data'


@Injectable()
export class AuthService {
    constructor( @Inject(DataStore) private dataStore: DataStore) { }

    private currentUserId='58020b9893e81802c5936af3';
    private currentEquipeId= '58020f2693e81802c5936afc';

    private createAnnotatedUser(user, equipes) {
        if (!user) return null;
        let filteredEquipes= equipes.filter(equipe => equipe.Users.includes(user._id));
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
            this.dataStore.getDataObservable('krinousers'),
            this.dataStore.getDataObservable('equipes'),
            (users, equipes) =>
            {
                return users.map(user => this.createAnnotatedUser(user, equipes));
            });
    }

    getUserId(): string {
        return this.currentUserId;
    }

    setUserId(id: string): void{
        this.currentUserId= id;
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

    getUserName(): string {
        return 'Alexander Kvasz';
    }

    getEquipeName(): string {
        return 'Crohn';
    }
}