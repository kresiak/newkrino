import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { Observable, BehaviorSubject, ReplaySubject, Subscription } from 'rxjs/Rx'
import { SelectableData } from './../Classes/selectable-data'

export class AuthenticationStatusInfo {
    public currentUserId: string = ''
    public currentEquipeId: string = ''
    public isLoggedIn: boolean = false
    public isLoginError: boolean = false
    public annotatedUser: any = null

    public annotatedUserList: any[]
    public equipeList: any[] = []

    constructor(currentUserId: string, currentEquipeId, isLoggedIn) {
        this.currentUserId = currentUserId
        this.currentEquipeId = currentEquipeId
        this.isLoggedIn = isLoggedIn
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

    logout() {
        this.isLoggedIn = false
        this.annotatedUser = null
    }

    isAdministrator() {
        return this.annotatedUser && this.annotatedUser.data.isAdmin
    }

    isReceptionist() {
        return this.annotatedUser && this.annotatedUser.data.isReceptionist
    }

    isLabManager() {
        return this.annotatedUser && this.annotatedUser.data.isLabManager
    }

    isProgrammer() {
        return this.annotatedUser && this.annotatedUser.data.isProgrammer
    }


}

@Injectable()
export class AuthService {
    constructor( @Inject(DataStore) private dataStore: DataStore) {

    }


    initFromLocalStorage(): void {
        var equipeFromLS = localStorage.getItem(this.LSEquipeKey)
        if (equipeFromLS) {
            this.authInfo.currentEquipeId = equipeFromLS
        }
        var userFromLS = localStorage.getItem(this.LSUserKey)
        if (userFromLS) {
            this.prepareUserId(userFromLS)
        }
        else {
            this.prepareUserId('')
        }
    }

    private LSUserKey: string = 'krinoUser'
    private LSEquipeKey: string = 'krinoEquipe'


    private authInfo: AuthenticationStatusInfo = new AuthenticationStatusInfo('', '', false)

    private authInfoSubject: ReplaySubject<AuthenticationStatusInfo> = new ReplaySubject(1)

    private emitCurrentAuthenticationStatus() {
        this.authInfoSubject.next(this.authInfo)
    }

    private createAnnotatedUser(user, equipes) {
        if (!user) return null;
        let filteredEquipes = equipes.filter(equipe => equipe.userIds && equipe.userIds.includes(user._id));
        return {
            data: user,
            annotation: {
                fullName: user.firstName + ' ' + user.name,
                equipes: filteredEquipes,
                equipesTxt: (filteredEquipes && filteredEquipes.length > 0) ? filteredEquipes.map(eq => eq.name).reduce((a, b) => a + ', ' + b) : ''
            }
        };
    }

    getAnnotatedUsersLight(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('users.krino'),
            this.dataStore.getDataObservable('equipes'),
            (users, equipes, authStatus) => {
                return users.map(user => this.createAnnotatedUser(user, equipes)).sort((a, b) => { return a.annotation.fullName.toUpperCase() < b.annotation.fullName.toUpperCase() ? -1 : 1; });
            });
    }

    getAnnotatedUsers(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedUsersLight(), this.getUserIdObservable(), (annotatedUsers: any[], currentUserId) => {
            annotatedUsers.forEach(annotatedUser => {
                annotatedUser.annotation.isCurrentUser= annotatedUser.data._id===currentUserId
            })
            return annotatedUsers
        })
    }


    getAnnotatedUsersByEquipeId(equipeId: string): Observable<any> {
        return this.getAnnotatedUsers().map(annotUsers => {
            return annotUsers.filter(annotUser => annotUser.annotation && annotUser.annotation.equipes && annotUser.annotation.equipes.map(eq => eq._id).includes(equipeId));
        })
    }

    getAnnotatedUserById(id: string): Observable<any> {
        return this.getAnnotatedUsers().map(users => users.filter(s => {
            return s.data._id === id
        })[0]);
    }


    getSelectableUsers(keepBlocked: boolean=false): Observable<SelectableData[]> {
        return this.getAnnotatedUsers().map(annotatedUsers => {
            return annotatedUsers.sort((user1, user2) => { return user1.annotation.fullName < user2.annotation.fullName ? -1 : 1; }).
                filter(user => keepBlocked || !user.data.isBlocked).
                map(user => new SelectableData(user.data._id, user.annotation.fullName))
        })
    }

    getAnnotatedCurrentUser(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedUsers(), this.getUserIdObservable(), (users, userId) => {
            let usersFiltered = users.filter(user => user.data._id === userId);
            return (!usersFiltered || usersFiltered.length === 0) ? null : usersFiltered[0];
        });
    }

    getUserId(): string {
        return this.authInfo.currentUserId;
    }

    getUserIdObservable(): Observable<any> {
        return this.authInfoSubject.map(authInfo => authInfo.currentUserId);
    }

    getStatusObservable(): Observable<AuthenticationStatusInfo> {
        return this.authInfoSubject
    }

    private prepareUserId(id: string) {
        this.authInfo.currentUserId = id

        var usersSubscription = this.getAnnotatedUsersLight().subscribe(users => {
            if (users && users.length > 0) {
                this.authInfo.annotatedUserList = users.filter(user => !user.data.isBlocked)
                let annotatedUser = users.filter(user => user.data._id === this.authInfo.currentUserId)[0]
                this.authInfo.equipeList = !annotatedUser ? [] : annotatedUser.annotation.equipes.sort((a, b) => { return a.name < b.name ? -1 : 1; })
                this.emitCurrentAuthenticationStatus()
                //usersSubscription.unsubscribe()
            }
        })
    }


    setUserId(id: string): void {
        if (this.authInfo.currentUserId !== id) {
            this.authInfo.currentEquipeId = ''
            this.authInfo.logout()
            localStorage.setItem(this.LSUserKey, id)
            this.prepareUserId(id)
            //this.currentUserIdObservable.next(id);
        }
    }

    getEquipeId(): string {
        return this.authInfo.currentEquipeId;
    }

    setEquipeId(id: string): void {
        if (this.authInfo.currentEquipeId !== id) {
            this.authInfo.currentEquipeId = id
            this.authInfo.logout()
            localStorage.setItem(this.LSEquipeKey, id)
            this.emitCurrentAuthenticationStatus()
        }
    }

    private setLoggedIn() {
        this.authInfo.isLoggedIn = true
        this.emitCurrentAuthenticationStatus()
    }

    setLoggedOut() {
        this.authInfo.isLoggedIn = false
        this.emitCurrentAuthenticationStatus()
    }

    tryLogin(password: string) {
        this.authInfo.isLoginError = false
        this.getAnnotatedCurrentUser().first().subscribe(user => {
            if (!user.data.password || user.data.password === password) {
                this.authInfo.annotatedUser = user
                this.setLoggedIn()
            }
            else {
                this.authInfo.isLoginError = true
                this.emitCurrentAuthenticationStatus()
            }
        })
    }

    isProduction() {
        return true;
    }


}