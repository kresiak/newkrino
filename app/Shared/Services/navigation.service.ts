import { Injectable, Inject } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'

class NavStackElement {
    public lastPosition: number = -1
    public path: string

    constructor(lastPosition: number, path: string) {
        this.lastPosition = lastPosition
        this.path = path
    }
}

@Injectable()
export class NavigationService {

    private navStack: NavStackElement[] = []
    constructor(private router: Router, private route: ActivatedRoute) { }

    private addStackElement(lastPosition: number, path: string) {
        let element = new NavStackElement(lastPosition, path)
        this.navStack.push(element)
        return this.navStack.length - 1
    }

    maximizeOrUnmaximize(urlPath: string, id: string, currentPath: string, isRoot: boolean) {
        this.route.queryParams.first().subscribe(queryParams => {
            let lastPathId = +queryParams['lpid'];
            if (!isRoot) {
                let newPathId = this.addStackElement(lastPathId, currentPath)
                let link = [urlPath, id];
                let navigationExtras: NavigationExtras = {
                    queryParams: { 'lpid': newPathId }
                }
                this.router.navigate(link, navigationExtras);
            }
            else {
                let stackElement = this.navStack[lastPathId];
                if (stackElement) {
                    let path= stackElement.path
                    let tokens= path.split('|')

                    let cmd=tokens[0]
                    let link = [cmd];
                    if (this.isPathForDetailView(cmd)) link.push(tokens[1])
                    let state:string= tokens.slice(this.isPathForDetailView(cmd) ? 2 : 1).join('|')
                    let navigationExtras: NavigationExtras = {
                        queryParams: { }
                    }
                    if (stackElement.lastPosition && stackElement.lastPosition != -1) {
                        navigationExtras.queryParams['lpid']=stackElement.lastPosition
                    }
                    navigationExtras.queryParams['state']=state
                    this.router.navigate(link, navigationExtras);
                }
            }
        })
    }

    private isPathForDetailView(cmd: string): boolean {
        return cmd.charAt(cmd.length - 1).toUpperCase() !== 'S'
    }

    private generateState(arrPath: string[]) {
        let result = arrPath.reduce((acc, item) => {
            if (!acc.current) acc.current = acc.result
            let arr = item.split(':')
            let value = arr[1]
            switch (arr[0]) {
                case 'P':
                    acc.current.openPanelId = value
                    break
                case 'O':
                    acc.current.selectedTabId = 'tab' + value
                    break
            }
            acc.current[value] = {}
            acc.current = acc.current[value]

            return acc
        }, { result: {}, current: null })
        return result.result
    }

    initState(inputPath: string): Object {
        let tokens = inputPath.split('|')
        let viewMode = tokens[0]
        switch (viewMode) {
            case 'equipes':
                return this.generateState(tokens.slice(1))
            case 'otp':
            default:
        }
        return null
    }


}