import { Broadcaster } from '@ionic-native/broadcaster/ngx';
import { Service } from './../../providers/piservice/service';
import { ViewChild } from '@angular/core';
import { ZBarOptions } from '@ionic-native/zbar';
import { ZBar } from '@ionic-native/zbar';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Refresher, ToastController, LoadingController, Loading } from 'ionic-angular';
import { LoginPage } from '../login/login';

/**
 * Generated class for the WorkbenchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-workbench',
  templateUrl: 'workbench.html',
})
export class WorkbenchPage {

  plus: any;

  @ViewChild(Refresher) refresher: Refresher;
  currentDeptName: string = '';
  currentDeptId: string = '';

  bagCategory = [{ title: 'A感', value: 'A', isChecked: true },
  { title: 'B损', value: 'B', isChecked: false },
  { title: 'C化', value: 'C', isChecked: false },
  { title: 'D病', value: 'D', isChecked: false },
  { title: 'E药', value: 'E', isChecked: false }];

  currentBag: WasteBagObj = new WasteBagObj();
  todayTasks: WasteBagObj[] = [];
  loading: Loading;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private zbar: ZBar,
    private alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private service: Service,
    private broadcaster:Broadcaster
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WorkbenchPage');
    this.loading = this.loadingCtrl.create({
      content: '正在为您加载，请稍候...'
    });
    this.loading.present();
    this.getTaskList();
  }

  doRefresh(event) {
    this.getTaskList();
  }

  getTaskList() {
    this.todayTasks = [];
    this.service.getMedicalWasteTransferList().subscribe(result => {
      console.log('getMedicalWasteTransferList:' + JSON.stringify(result));
      this.refresher.complete();
      if (this.loading) {
        this.loading.dismiss();
      }
      if (result) {
        if (result['success']) {
          for (let item in result['data']) {
            let bag = new WasteBagObj();
            bag.bagId = result['data'][item]['bagNo'];
            bag.departId = result['data'][item]['locationCode'];
            bag.departName = result['data'][item]['locationName'];
            bag.date = result['data'][item]['weightTime'];
            bag.category = result['data'][item]['category'];
            bag.weight = result['data'][item]['weight'];
            bag.taskId = result['data'][item]['taskNo'];
            this.currentBag.isDisable = true;
            this.todayTasks.push(bag)
          }
        }
      }
    }, error => {
      console.log('getMedicalWasteTransferList:' + JSON.stringify(error));
      this.refresher.complete();
      if (this.loading) {
        this.loading.dismiss();
      }
    })

  }

  scan2Start() {
    let options: ZBarOptions = {
      text_title: "",
      text_instructions: "请扫描科室或垃圾袋二维码",
      flash: "auto",
      drawSight: true
    };

    this.zbar.scan(options)
      .then(result => {
        console.log(result);
        if (result.indexOf("WB") >= 0) {
          if (this.currentDeptId) {
            this.createTransferTask(result, this.currentDeptId, this.currentDeptName);
          } else {
            let alert = this.alertCtrl.create({
              title: "提示",
              message: "请先扫描科室二维码",
              buttons: ["确定"]
            });
            alert.present();
          }

        } else {
          this.getDepartName(result);
        }
        console.log(result);
      })
      .catch(error => {
        if (error != "cancelled") {
          alert(JSON.stringify(error));
        }
        console.log(error);
      });
  }

  getDepartName(code: string) {
    if (code) {

      this.service.getDepartmentNameByCode(code).subscribe(result => {
        console.log('getDepartmentNameByCode:' + JSON.stringify(result));
        if (result && result['success']) {
          this.currentDeptName = result['data'];
          this.currentDeptId = code;
        } else {
          let alert = this.alertCtrl.create({
            title: "提示",
            message: "请扫描正确的科室二维码",
            buttons: ["确定"]
          });
          alert.present();
        }
      }, error => {

        let alert = this.alertCtrl.create({
          title: "提示",
          message: "请扫描正确的科室二维码:" + JSON.stringify(error),
          buttons: ["确定"]
        });
        alert.present();
      });
    } else {
      let alert = this.alertCtrl.create({
        title: "提示",
        message: "请扫描正确的科室二维码",
        buttons: ["确定"]
      });
      alert.present();
    }
  }

  onSubmitClicked() {
    if (this.currentBag.weight > 0 && this.checkNumbs(this.currentBag.weight)) {
      this.loading = this.loadingCtrl.create({
        content: '正在提交中，请稍候...',
        duration: 500
      });

      this.loading.present();
      setTimeout(() => {
        if (this.currentBag.taskId) {
          if (this.currentBag.category) {
            this.updateWeight(this.currentBag);
          } else {
            let alert = this.alertCtrl.create({
              title: "提示",
              message: "请先选择垃圾类型!",
              buttons: ["确定"]
            });
            alert.present();
          }
        } else {
          let alert = this.alertCtrl.create({
            title: "提示",
            message: "请先扫描垃圾袋!",
            buttons: ["确定"]
          });
          alert.present();
        }
      }, 500);
    } else {
      let alert = this.alertCtrl.create({
        title: "提示",
        message: "请输入正确的重量",
        buttons: ["确定"]
      });
      alert.present();
    }
  }

  createTransferTask(bagID: string, locationCode: string, deptName: string) {
    this.service.createMedicalWasteTranferTask(bagID, locationCode).subscribe(result => {
      console.log('createMedicalWasteTranferTask:' + JSON.stringify(result));
      if (result['success']) {
        this.currentBag = new WasteBagObj();
        this.currentBag.bagId = bagID;
        this.currentBag.departId = locationCode;
        this.currentBag.departName = deptName;
        this.currentBag.taskId = result['data'];
        this.currentBag.category = 'A';
        this.currentBag.isDisable = false;
      } else {
        let alert = this.alertCtrl.create({
          title: "提示",
          message: "创建任务失败:" + result['data'],
          buttons: ["确定"]
        });
        alert.present();
      }
    }, error => {
      let alert = this.alertCtrl.create({
        title: "提示",
        message: "创建失败，请稍后重试:" + JSON.stringify(error),
        buttons: ["确定"]
      });
      alert.present();
    });
  }

  updateWeight(bag: WasteBagObj) {
    this.service.updateMedicalWasteTranferTask(bag).subscribe(result => {
      console.log('updateMedicalWasteTranferTask:' + JSON.stringify(result));
      if (result['success']) {
        let alert = this.alertCtrl.create({
          title: "提示",
          message: "提交成功!",
          buttons: ["确定"]
        });
        alert.present();
        this.currentBag = new WasteBagObj();
        this.getTaskList();
      } else {
        let alert = this.alertCtrl.create({
          title: "提示",
          message: "提交失败，请稍后重试",
          buttons: ["确定"]
        });
        alert.present();
      }
    }, error => {
      let alert = this.alertCtrl.create({
        title: "提示",
        message: "提交失败，请稍后重试:" + JSON.stringify(error),
        buttons: ["确定"]
      });
      alert.present();
    });
  }



  onInputDataChanged(event: number, bag: WasteBagObj) {
    console.log("input value changed " + JSON.stringify(bag));
    bag.isDisable = false;
    if (event) {
      let weight = event.toString();
      if (weight.length > 6) {
        weight = weight.slice(0, 5);
        bag.weight = parseFloat(weight);
      }
    }
  }

  onListItemClick(bag: WasteBagObj) {
    bag.isDisable = true;
    Object.assign(this.currentBag, bag);
  }

  onCheckItemClicked(value: string) {
    for (let category of this.bagCategory) {
      if (value == category.value) {
        category.isChecked = true;
        this.currentBag.category = value;
      } else {
        category.isChecked = false;
      }
    }
  }

  checkNumbs(num: number): boolean {
    let reg = /^\d+(\.\d+)?$/g;
    return reg.test(num + '');
  }

}

export class WasteBagObj {
  taskId: string;
  bagId: string;
  weight: number;
  departId: string;
  departName: string;
  category: string;
  isDisable: boolean = true;
  date: string = '';
}
