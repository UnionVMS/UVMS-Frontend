import {Injectable} from "@angular/core";
import {Context, Feature, UserContexts} from "../auth/user-contexts.model";
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root',
})
export class SubscriptionRightsService {
  private VIEW_SUBSCRIPTIONS_FEATURE_NAME = "VIEW_SUBSCRIPTION";
  private MANAGE_SUBSCRIPTIONS_FEATURE_NAME = "MANAGE_SUBSCRIPTION";

  private _userContexts: UserContexts;


  constructor(private authService: AuthService) {
  }

  private async userContexts() {
    if(!this._userContexts) {
      this._userContexts = <UserContexts> await this.authService.getUserContexts().toPromise();
    }
    return this._userContexts;
  }

  async canView() : Promise<boolean> {
    let userContexts = await this.userContexts();
    return this.contextContainsFeature(userContexts, this.VIEW_SUBSCRIPTIONS_FEATURE_NAME);
  }

  async canEdit(): Promise<boolean> {
    let userContexts = await this.userContexts();
    return this.contextContainsFeature(userContexts, this.MANAGE_SUBSCRIPTIONS_FEATURE_NAME);
  }

  private contextContainsFeature(userContexts: UserContexts, featureName: String) : boolean {
    let scopeName = localStorage.getItem('scopeName');
    let roleName = localStorage.getItem('roleName');
    return userContexts.contextSet.contexts.some((context: Context) =>
      context.scope && context.scope.scopeName === scopeName && context.role && context.role.roleName === roleName && context.role.features.some((feature: Feature) => feature.featureName === featureName)
    );
  }
}
