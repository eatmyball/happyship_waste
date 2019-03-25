/*
  Description: 联系我们页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import {Service} from "../../providers/piservice/service";

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController, public http: Http, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public service: Service, public viewCtrl: ViewController) {
  }

  ionViewWillEnter() {
    //设置返回按钮文本
    this.viewCtrl.setBackButtonText('返回');
  }

}


