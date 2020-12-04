import { Component, OnInit } from '@angular/core';
import { MainService } from './../main.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {
  platformVersion: string;
  constructor(private mainService: MainService) { }

  ngOnInit() {
    this.updatePlatformDependencies();
  }

  async updatePlatformDependencies() {
    const result: any = await this.mainService.getPlatformVersion();
    this.platformVersion = result.data.platformVersion;
  }

}
