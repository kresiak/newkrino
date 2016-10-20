import { Injectable } from '@angular/core'

@Injectable()
export class AuthService
{
    getUserId() : string{
        return '58020b9893e81802c5936af3';
    }

    isAuthenticated() : boolean
    {
        return true;
    }

    getEquipeId() : string {
        return '58020f2693e81802c5936afc';
    }

    getUserName() : string{
        return 'Alexander Kvasz';
    }

    getEquipeName() : string {
        return 'Crohn';
    }
}