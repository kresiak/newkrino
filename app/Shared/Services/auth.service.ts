import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { SelectableData } from './../Classes/selectable-data'

export class AuthenticationStatusInfo {
    public currentUserId: string= ''
    public currentEquipeId: string= ''
    public isLoggedIn: boolean = false
    public isLoginError: boolean = false

    constructor(currentUserId: string, currentEquipeId, isLoggedIn){
        this.currentUserId= currentUserId
        this.currentEquipeId= currentEquipeId
        this.isLoggedIn= isLoggedIn
    }    

    isReadyForPassword() {
        return this.currentUserId !== '' && this.currentEquipeId !== '' && !this.isLoggedIn
    }

    hasUserId() {
        return this.currentUserId != ''
    }

    hasEquipeId() {
        return this.currentEquipeId != ''
    }
}

@Injectable()
export class AuthService {
    constructor( @Inject(DataStore) private dataStore: DataStore) { }

    private authInfo: AuthenticationStatusInfo= new AuthenticationStatusInfo('','', false)

    private currentUserIdObservable= new BehaviorSubject(this.authInfo.currentUserId);
    private authInfoSubject: BehaviorSubject<AuthenticationStatusInfo>= new BehaviorSubject(this.authInfo)

    private emitCurrentAuthenticationStatus() {
        this.authInfoSubject.next(this.authInfo)
    }

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
        return this.authInfo.currentUserId;
    }

    getUserIdObservable(): Observable<any> {
        return this.currentUserIdObservable;
    }

    getStatusObservable() : Observable<AuthenticationStatusInfo> {
        return this.authInfoSubject
    }

    setUserId(id: string): void{
        this.authInfo.currentUserId= id
        this.authInfo.currentEquipeId= ''
        this.authInfo.isLoggedIn= false        
        this.emitCurrentAuthenticationStatus()
        this.currentUserIdObservable.next(id);
    }

    getEquipeId(): string {
        return this.authInfo.currentEquipeId;
    }

    setEquipeId(id: string): void
    {
        this.authInfo.currentEquipeId= id
        this.authInfo.isLoggedIn= false
        this.emitCurrentAuthenticationStatus()
    }

    private setLoggedIn() {
        this.authInfo.isLoggedIn= true
        this.emitCurrentAuthenticationStatus()
    }

    setLoggedOut() {
        this.authInfo.isLoggedIn= false
        this.emitCurrentAuthenticationStatus()
    }

    tryLogin(password: string) {
        this.authInfo.isLoginError= false
        this.getAnnotatedCurrentUser().first().subscribe(user => {
            if (!user.data.password || user.data.password===password) {
                this.setLoggedIn()
            }
            else {
                this.authInfo.isLoginError= true
                this.emitCurrentAuthenticationStatus()
            }
        })
    }    
    
}