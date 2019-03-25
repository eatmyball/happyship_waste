/*
  Description: 申请单清单页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import {Component} from '@angular/core';
import {
    NavController,
    NavParams,
    ModalController,
    LoadingController,
    AlertController,
    ViewController,
    Content
} from 'ionic-angular';
import {Service} from "../../providers/piservice/service";
import {ToastController} from 'ionic-angular';
import {ItemDetailPage} from '../item-detail/item-detail';
import {ViewChild} from "@angular/core";

/*
 Generated class for the ItemList page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-item-list',
    templateUrl: 'item-list.html'
})
export class ItemListPage {
    @ViewChild(Content) content: Content;
    itemTitle;
    items = [];

    myInput = "";
    shouldShowCancel = false;
    originalItems = [];

    ok = '确定';
    processingText = '处理中';
    infoText = '提示';
    errorText = '错误';
    loadingText = '加载中';
    editText = '编辑';
    cancelText = '取消';

    isEdit = false;
    edit;
    selectedAllCheck = false;


    constructor(public navCtrl: NavController, public navParams: NavParams, public service: Service, public toastCtrl: ToastController, public modalCtrl: ModalController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public viewCtrl: ViewController) {
        // this.service.getFromJsonFile("assets/json/list.json").subscribe((data)=>{this.items=data;console.log(this.items)},(err)=>console.log(err));
        // this.items = navParams.get("items");
        // this.originalItems = navParams.get("items");
        // this.itemTitle = navParams.get("title");
        // for (let i = 0; i < this.items.length; i++) {
        //   this.items[i].checked = false;
        //   this.originalItems[i].checked = false;
        // }
    }

    ionViewWillEnter() {
        this.viewCtrl.setBackButtonText('返回');
        this.getTransferTaskList();
    }

    getTransferTaskList() {
        let loader = this.loadingCtrl.create({
            content: this.loadingText,
        });
        loader.present();

        this.service.listTransferTaskByOperator(this.service.getCurrentUser()).subscribe((data) => {
            console.log('current user:'+this.service.getCurrentUser());
            console.log(JSON.stringify(data));
            if (data.success === true) {
                loader.dismiss();
                this.items = data.data;
                this.originalItems =data.data;
            } else {
                let alert = this.alertCtrl.create({
                    title: this.errorText,
                    message: data.data,
                    buttons: [this.ok]
                });
                loader.dismiss();
                alert.present();
            }
        }, (error) => {
            loader.dismiss();
            console.log(JSON.stringify(error));
        });
    }

    onInput(event) {

        if (this.myInput && this.myInput.trim() != "") {
            this.items = this.originalItems;
            this.items = this.items.filter((item) => {
                return (item.billNo.toString().toLowerCase().indexOf(this.myInput.toLowerCase()) > -1
                    || item.fromLocationName.toString().toLowerCase().indexOf(this.myInput.toLowerCase()) > -1
                    || item.operatorName.toString().toLowerCase().indexOf(this.myInput.toLowerCase()) > -1
                    || item.toLocationName.toString().toLowerCase().indexOf(this.myInput.toLowerCase()) > -1
                    || item.transferTool.toString().toLowerCase().indexOf(this.myInput.toLowerCase()) > -1
                    || item.patientName.toString().toLowerCase().indexOf(this.myInput.toLowerCase()) > -1);
            })
        } else {
            this.items = this.originalItems;
        }
    }

    onCancel(event) {
        // this.items = this.originalItems;
    }

    approve(item, i) {
        this.process(item, i, "A", {note: '完工', sub: ''});
    }

    openDetail(item, i) {
        let loader = this.loadingCtrl.create({
            content: this.loadingText,
        });
        loader.present();

        this.service.getTransferTaskByBillNo(item.billNo).subscribe((data) => {
            console.log(JSON.stringify(data));
            let itemModal = this.modalCtrl.create(ItemDetailPage, {
                para: item,
                index: i,
                detail: data
            });
            itemModal.onDidDismiss((data) => {
                if (data) {
                    this.showSuccess(item, data, '');
                    
                }
                else{
                    console.log("back");
                }
                //刷新列表
                this.getTransferTaskList();
            });
            loader.dismiss();
            itemModal.present();
        }, (error) => {
            console.log(JSON.stringify(error));
            loader.dismiss();
        });
    }

    process(item, i, type, data) {
        let loader = this.loadingCtrl.create({
            content: this.processingText,
        });
        loader.present();
        //console.log(item.billNo);
        this.service.updateTransferTaskStatus(item.billNo,data.note,this.service.getCurrentUser()).subscribe((data)=>{
            if (data.success === true) {
                loader.dismiss();
                this.showSuccess(item, i, type);

                //this.viewCtrl.dismiss({type: type});
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

    showSuccess(item, i, type) {
        //校验是否相同，不同则遍历查找
        //if (item.OBJECT_ID == this.items[i].OBJECT_ID) {
            this.items.splice(i, 1);
        //}

        let toast = this.toastCtrl.create({
            message: "提交成功",
            duration: 2000,
            position: "middle",
            cssClass: "toastCss"
        });
        toast.present();
    }

    doRefresh(refresher) {
        this.getTransferTaskList();
        refresher.complete();
    }

    btnEdit() {
        if (this.isEdit) {
            this.isEdit = false;
            this.edit = this.editText;
            this.selectedAllCheck = false;
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].checked = false;
            }
        } else {
            this.isEdit = true;
            this.edit = this.cancelText;
        }
        this.content.resize();
    }

    checkAll() {
        if (this.selectedAllCheck) {
            this.selectedAllCheck = false;
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].checked = false;
            }
        } else {
            this.selectedAllCheck = true;
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].checked = true;
            }
        }
    }
}
