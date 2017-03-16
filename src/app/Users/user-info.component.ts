import { Component, OnInit, Input } from '@angular/core'

@Component(
    {
        selector: 'gg-user-info',
        templateUrl: './user-info.component.html'
    }
)

export class UserInfoComponent implements OnInit {
    ngOnInit(): void {}
    constructor() {}

    @Input() userInfo; 
  
}