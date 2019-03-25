import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { ItemListPage } from '../item-list/item-list';
import {Service} from "../../providers/piservice/service";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  version;
  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public service: Service) {
    this.version = service.version;
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('返回');
  }

  openItem()
  {
    this.navCtrl.push(ItemListPage);
  }


}
