/*
  Description: 设置页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import {Component} from '@angular/core';
import {NavController, NavParams, AlertController} from 'ionic-angular';

import {Service} from "../../providers/piservice/service";
import {ContactPage} from '../contact/contact';
import {HelpPage} from '../help/help';
import {AboutPage} from "../about/about";

/*
 Generated class for the My page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-my',
  templateUrl: 'my.html'
})
export class MyPage {

  langs: [{}];
  changeLangTitle = '设置语言';
  cancel = '取消';
  ok = '确定';
  logoutTitle = '退出';
  logoutConfirm = '确定退出？';
  english = '英语';
  constructor(public navCtrl: NavController, public navParams: NavParams, public service: Service, public alertCtrl: AlertController) {
  }

  ionViewWillEnter() {
  }

  openHelp() {
    this.navCtrl.push(HelpPage, {});
  }

  openContact() {
    this.navCtrl.push(ContactPage, {});
  }

  about() {
    this.navCtrl.push(AboutPage, {});
  }

  logout() {
    let alert = this.alertCtrl.create({
      title: this.logoutTitle,
      message: this.logoutConfirm,
      buttons: [{
        text: this.ok,
        handler: () => {
          this.service.doLogout();
        }
      }, {
        text: this.cancel
      }],
      enableBackdropDismiss: false
    });
    alert.present();
  }

}
