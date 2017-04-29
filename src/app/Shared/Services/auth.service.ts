import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AdminService } from './admin.service'
import { Observable, BehaviorSubject, ReplaySubject, Subscription } from 'rxjs/Rx'
import { SelectableData } from './../Classes/selectable-data'

// helper class
// ============

export class AuthenticationStatusInfo {
    public currentUserId: string = ''
    public currentEquipeId: string = ''
    public isLoggedIn: boolean = false
    public isLoginError: boolean = false
    public needsEquipeSelection: boolean = true
    private annotatedUser: any = null

    public annotatedUserList: any[]
    public equipeList: any[] = []

    constructor(currentUserId: string, currentEquipeId, isLoggedIn) {
        this.currentUserId = currentUserId
        this.currentEquipeId = currentEquipeId
        this.isLoggedIn = isLoggedIn
    }

    setAnnotatedUser(user) {
        this.annotatedUser= user
    }


    isReadyForPassword() {
        return this.currentUserId !== '' && (this.currentEquipeId !== '' || !this.needsEquipeSelection) && !this.isLoggedIn
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

// Service
// =======

@Injectable()
export class AuthService {
    constructor( @Inject(DataStore) private dataStore: DataStore,  @Inject(AdminService) private adminService: AdminService) {
        this.getAnnotatedUsersLight().subscribe(users => {
            if (users && users.length > 0) {
                this.authInfo.annotatedUserList = users.filter(user => !user.data.isBlocked)   
            }
        })        
    }

    private authInfo: AuthenticationStatusInfo = new AuthenticationStatusInfo('', '', false)
    private authInfoSubject: ReplaySubject<AuthenticationStatusInfo> = new ReplaySubject(1)


    // Login/Logout services + helper
    // ==============================

    private emitCurrentAuthenticationStatus() {
        this.authInfoSubject.next(this.authInfo)
    }


    private usersSubscription: Subscription

    private prepareUserId(id: string) {
        this.authInfo.currentUserId = id

        if (this.usersSubscription) this.usersSubscription.unsubscribe()

        this.usersSubscription = this.getAnnotatedUsersLight().subscribe(users => {
            if (users && users.length > 0) {
                let user = users.filter(user => user.data._id === this.authInfo.currentUserId)[0]   
                this.authInfo.needsEquipeSelection= user ? !user.annotation.equipeNotNeeded : true
                this.authInfo.equipeList = !user ? [] : user.annotation.equipes.sort((a, b) => { return a.name < b.name ? -1 : 1; })
                this.emitCurrentAuthenticationStatus()
            }
        })
    }
    
    private LSUserKey: string = 'krinoUser'
    private LSEquipeKey: string = 'krinoEquipe'

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


    setUserId(id: string): void {
        if (this.authInfo.currentUserId !== id) {
            this.authInfo.currentEquipeId = ''
            this.authInfo.logout()
            localStorage.setItem(this.LSUserKey, id)
            this.prepareUserId(id)
            //this.currentUserIdObservable.next(id);
        }
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
            if ((!user.data.password && user.data.password != '') || user.data.password === password) {
                this.authInfo.setAnnotatedUser(user)
                this.setLoggedIn()
            }
            else {
                this.authInfo.isLoginError = true
                this.emitCurrentAuthenticationStatus()
            }
        })
    }



    // helper functions for general public services
    // ============================================

    public readonly systemGroupUserId: string= 'SystemGroupUser'


    private createGroupingUser(password: string) {
        return {
            data: { 
                _id: this.systemGroupUserId,
                password: password
            },
            annotation: {
                fullName: 'System: Group Orders',
                equipes: [],
                isSystem: true,
                equipeNotNeeded: true
            }
        }
    }


    private createAnnotatedUser(user, equipes, labo) {
        if (!user) return null;
        let filteredEquipes = equipes.filter(equipe => equipe.userIds && equipe.userIds.includes(user._id));
        return {
            data: user,
            annotation: {
                fullName: user.firstName + ' ' + user.name,
                isSecrExec: labo && labo.data.secrExecIds && labo.data.secrExecIds.includes(user._id),
                equipesLeading: equipes.filter(eq => eq.managerIds && eq.managerIds.includes(user._id)).map(eq => eq._id),
                equipes: filteredEquipes,
                equipesTxt: (filteredEquipes && filteredEquipes.length > 0) ? filteredEquipes.map(eq => eq.name).reduce((a, b) => a + ', ' + b) : ''
            }
        };
    }

    private getAnnotatedUsersLight(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('users.krino'),
            this.dataStore.getDataObservable('equipes'),
            this.adminService.getLabo(),
            (users, equipes, labo) => {
                var list: any[]= users.map(user => this.createAnnotatedUser(user, equipes, labo)).sort((a, b) => { return a.annotation.fullName.toUpperCase() < b.annotation.fullName.toUpperCase() ? -1 : 1; });
                list.push(this.createGroupingUser(labo.data.passwordGroupOrdersUser))
                return list
            });
    }

    // General services: about users, equipes, current user
    // =====================================================

    getAnnotatedUsers(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedUsersLight(), this.getUserIdObservable(), (annotatedUsers: any[], currentUserId) => {
            annotatedUsers.forEach(user => {
                user.annotation.isCurrentUser= user.data._id===currentUserId
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

    getAnnotatedAdminUsers(): Observable<any> {
        return this.getAnnotatedUsers().map(users => users.filter(s => {
            return s.data.isAdmin
        }));
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

    getEquipeId(): string {
        return this.authInfo.currentEquipeId;
    }


    // Services for getting the observables to track login changes
    // ===========================================================

    getUserIdObservable(): Observable<any> {
        return this.authInfoSubject.map(authInfo => authInfo.currentUserId);
    }

    getStatusObservable(): Observable<AuthenticationStatusInfo> {
        return this.authInfoSubject
    }



    // should not be here
    // ==================

    isProduction() {
        return true;
    }


}