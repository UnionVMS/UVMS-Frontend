import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {SubscriptionRightsService} from "../../services/subscription-rights.service";

@Injectable()
export class EditSubscriptionsGuard implements CanActivate {

  constructor(private subscriptionRightsService: SubscriptionRightsService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree>  {
    return this.subscriptionRightsService.canEdit().then(canEdit => {
      if(canEdit) {
        return true
      } else {
        return this.router.parseUrl('/subscriptions/manage-subscriptions');
      }
    });
  }
}
