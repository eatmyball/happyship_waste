/*
  Description: 帮助页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/*
  Generated class for the Help page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-help',
  templateUrl: 'help.html'
})
export class HelpPage {

  language;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad HelpPage');
  }

  ionViewWillEnter() {
    this.viewCtrl.setBackButtonText('返回');
  }

  // openPdf() {
  //   this.document.viewDocument('file:///android_asset/www/assets/doc/manual.pdf', 'application/pdf', {title: 'Manual'});
  // }

}
