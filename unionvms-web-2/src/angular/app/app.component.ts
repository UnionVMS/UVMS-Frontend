import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd, Data } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'uvms-poc';

  constructor(
    router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(map(route => {
        let effectiveTitle = (route.data as BehaviorSubject<Data>).value.pageTitle;
        while (route.firstChild) {
          route = route.firstChild;
          const pageTitle = (route.data as BehaviorSubject<Data>).value.pageTitle;
          if (pageTitle) {
            effectiveTitle = pageTitle;
          }
        }
        return effectiveTitle;
      }))
      .subscribe(effectiveTitle => {
        if (effectiveTitle) {
          titleService.setTitle(effectiveTitle + ' - ' + 'UnionVMS');
        } else {
          titleService.setTitle('UnionVMS');
        }
      });
  }
}
