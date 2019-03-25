/*
  Description: 申请单详情页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import {Component} from '@angular/core';
import {
    NavController,
    NavParams,
    ViewController,
    AlertController,
    LoadingController,
    ModalController
} from 'ionic-angular';
import {Service} from "../../providers/piservice/service";
import {ItempopoverPage} from '../itempopover/itempopover';

import {NgZone} from '@angular/core';
import {ZBar, ZBarOptions} from "@ionic-native/zbar";

/*
 Generated class for the ItemDetail page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */

const STATUS_DISPATCHED: string = '派工';
const STATUS_RECEIVED: string = '已接受';
const STATUS_STARTED:string = '已开始';
const STATUS_COMPLETED: string = '完工';

const BTN_TEXT_RECEIVE: string = '接受派工';
const BTN_TEXT_RECEIVE_MANUAL: string = '手工接受';
const BTN_TEXT_START:string = '扫码开始';
const BTN_TEXT_COMPLETE: string = '扫码完成';
const BTN_TEXT_COMPLETE_MANUAL: string = '手工完成';

@Component({
    selector: 'page-item-detail',
    templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
    item;
    index;
    detail;
    // type;
    language;
    rejectText;
    remarkText;
    remarkPlaceholderText;
    ok;
    cancel;
    supplementText;
    delegationText;
    processingText;
    infoText;
    processedText;
    errorText;
    downloadingText;
    noReaderText;
    openErrorText;
    unknownText;

    btn_action_text: string = '';
    btn_action_text_manual: string = '';

    //contactsCallback;
    constructor(private zbar: ZBar, public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public service: Service, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public ngZone: NgZone) {
        this.item = this.navParams.get("para");
        this.index = this.navParams.get("index");
        this.detail = this.navParams.get("detail");
        console.log(this.index.items);
    }

    ionViewWillEnter() {
        if (this.detail.data.status == STATUS_DISPATCHED) {
            this.btn_action_text = BTN_TEXT_RECEIVE;
        } else if (this.detail.data.status == STATUS_RECEIVED) {
            this.btn_action_text = BTN_TEXT_START;
        }else if (this.detail.data.status == STATUS_STARTED) {
            this.btn_action_text = BTN_TEXT_COMPLETE;
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    popover(event) {
        event.preventDefault();
        let itemModal = this.modalCtrl.create(ItempopoverPage, {
            label: event.target.closest('h3').childNodes[0].data,
            value: event.target.closest('h3').childNodes[1].innerText
        });
        itemModal.onDidDismiss(data => {
            if (data) {
            }
        });
        itemModal.present();
    }

    isArray(item) {
        return item instanceof Array;
    }

    approve_manual() {
        if (this.detail.data.status == STATUS_DISPATCHED) {
            this.process(this.item, this.index, {note: STATUS_RECEIVED, supp: ''});
        } 
        // else if (this.detail.data.status == STATUS_RECEIVED) {
        //     this.process(this.item, this.index, { note: STATUS_COMPLETED, supp: '' });
        // }
        else {
            return;
        }
    }

    approve() {
        //console.log(this.item.billNo);
        if (this.detail.data.status == STATUS_DISPATCHED) {
            //直接接受任务
            this.process(this.item, this.index, { note: STATUS_RECEIVED, supp: '' });
        }else if(this.detail.data.status == STATUS_RECEIVED) {
            console.log("开始");
            let options: ZBarOptions = {
                text_title: "",
                text_instructions: "请扫描始发科室二维码",
                flash: "auto",
                drawSight: true
            };

            this.zbar.scan(options)
                .then(result => {
                    console.log(result);
                    if (result == this.detail.data.fromLocationCode) {
                        this.process(this.item, this.index, {note: STATUS_STARTED, supp: ''});
                    } else {
                        let alert = this.alertCtrl.create({
                            title: "提示",
                            message: "请扫描正确的始发科室(" + this.detail.data.fromLocationName + ")二维码",
                            buttons: ["确定"]
                        });
                        alert.present();
                    }
                    console.log(result);
                })
                .catch(error => {
                    if (error != "cancelled") {
                        alert(JSON.stringify(error));
                    }
                    console.log(error);
                });
        }else if (this.detail.data.status == STATUS_STARTED) {
            console.log("已接受");
            let options: ZBarOptions = {
                text_title: "",
                text_instructions: "请扫描目的科室二维码",
                flash: "auto",
                drawSight: true
            };

            this.zbar.scan(options)
                .then(result => {
                    console.log(result);
                    if (result == this.detail.data.toLocationCode) {
                        this.process(this.item, this.index, { note: STATUS_COMPLETED, supp: '' });
                    } else {
                        let alert = this.alertCtrl.create({
                            title: "提示",
                            message: "请扫描正确的目的科室(" + this.detail.data.toLocationName + ")二维码",
                            buttons: ["确定"]
                        });
                        alert.present();
                    }
                    console.log(result);
                })
                .catch(error => {
                    if (error != "cancelled") {
                        alert(JSON.stringify(error));
                    }
                    console.log(error);
                });
            // this.process(this.item, this.index, { note: STATUS_COMPLETED, supp: '' });
        }

    }

    back() {
        //loader.dismiss();
        this.viewCtrl.dismiss();
    }

    process(item, i, data) {
        let loader = this.loadingCtrl.create({
            content: this.processingText,
        });
        loader.present();
        //console.log(item.billNo);
        this.service.updateTransferTaskStatus(item.billNo, data.note, this.service.getCurrentUser()).subscribe((data) => {
            if (data.success === true) {
                loader.dismiss();
                this.viewCtrl.dismiss({type: i});

            } else {
                let message = '';
                if (data.MSG.item instanceof Array) {
                    for (let i = 0; i < data.MSG.item.length; i++) {
                        message += data.MSG.item[i].MESSAGE + '<br/>';
                    }
                } else {
                    message = data.MSG.item.MESSAGE;
                }
                let alert = this.alertCtrl.create({
                    title: '错误',
                    message: message,
                    buttons: ['OK']
                });
                loader.dismiss();
                alert.present();
            }
        }, (error) => {
            loader.dismiss();
            this.service.handleError(error);

        });
    }

    toDecimal2(x) {
        let f = Math.round(x * 100) / 100;
        let s = f.toString();
        let rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }

}


