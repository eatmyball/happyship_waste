/*
  Description: 申请单弹出页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/*
  Generated class for the Itempopover page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-itempopover',
  templateUrl: 'itempopover.html'
})
export class ItempopoverPage {

  label;
  value;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.label = this.navParams.get("label");
    this.value = this.navParams.get("value");
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
