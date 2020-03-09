import { AvailableBhtDeviciesComponent } from './../../components/available-bht-devicies/available-bht-devicies';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Broadcaster } from '@ionic-native/broadcaster/ngx';
import { Service } from './../../providers/piservice/service';
import { ViewChild, NgZone, EventEmitter } from '@angular/core';
import { ZBarOptions } from '@ionic-native/zbar';
import { ZBar } from '@ionic-native/zbar';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Refresher, ToastController, LoadingController, Loading, Content, Popover, PopoverController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Observable } from 'rxjs/Observable';

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

  isDebug:boolean = false; //手机调试模式，打开以后可以看到扫码按钮

  isBtConnect:boolean = false;

  btName:string = '蓝牙未连接'; //已连接设备名称
  btBtnText:string = '扫描';//扫描按钮文字
  popover:Popover;
  //已配对
  paired: Array<BlueToothDeviceModel> = [];
  //未配对
  unPair: Array<BlueToothDeviceModel> = [];


  plus: any;

  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(Content) content: Content;

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
    public popoverCtrl: PopoverController,
    private loadingCtrl: LoadingController,
    private service: Service,
    private zone: NgZone,
    private bluetooth: BluetoothSerial
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WorkbenchPage');
    this.loading = this.loadingCtrl.create({
      content: '正在为您加载，请稍候...'
    });
    this.loading.present();
    this.getTaskList();
    this.addReceiver();
    this.service.getOffLineTask().then(value=>{

      if(value) {
        this.currentBag = value;
        this.currentDeptId = this.currentBag.departId;
        this.currentDeptName = this.currentBag.departName;
        if(this.currentDeptId&&this.currentDeptName) {
          this.showOffLineTask('您有一个离线的任务未提交，是否要继续提交?');
        }
        
      }
    });
  }

  ionViewDidLeave() {
    //移除广播事件
    (<any>window).broadcaster.removeEventListener('com.scanner.broadcast', this.broadcastListener);
  }



  doRefresh(event) {
    this.getTaskList();
  }

  showBtDevicies(event) {
    if(!this.isBtConnect) {
      this.bluetooth.isEnabled().then(data => {
        console.log("connectSmartLink: " + JSON.stringify(data));
        this.loading = this.loadingCtrl.create({
          content: '获取蓝牙设备中'
        });
        this.loading.present();
        this.getBondedDevices().then(() => {
          this.loading.dismiss();
          let params = {};
          params['paired'] = this.paired;
          params['callback'] = this.deviceCallback;
          this.popover = this.popoverCtrl.create(AvailableBhtDeviciesComponent, params);
          this.popover.present({
            ev: event
          });
        }).catch(error => {
          this.presentToast("蓝牙连接错误: " + JSON.stringify(error),2000);
          this.toastCtrl.create({
  
          }).present();
          this.loading.dismiss();
        });
      }).catch(error => {
        this.loading.dismiss();
        console.log("connectSmartLink error: " + JSON.stringify(error));
        this.presentToast("蓝牙未开启，请开启蓝牙后连接", 2000);
      });
    }else {
      this.bluetooth.disconnect().then(data=>{
        this.presentToast("蓝牙已断开", 1500);
        this.zone.run(()=>{
          this.btName = '蓝牙未连接';
          this.btBtnText = '扫描';
          this.isBtConnect = false;
        });
      });
      
    }
    
  }

    /**
   * 蓝牙设备选择回调事件
   */
  deviceCallback = (item) => {
    let address = item.getAddress();
    let name = item.getName();
    if (address) {
      // let timer = setTimeout(()=>{
      //   this.bluetooth.disconnect();
      //   this.presentToast("蓝牙连接超时，请重试", 1500);
      //   this.loading.dismiss();
      // }, 30000);
      this.loading = this.loadingCtrl.create({
        content: '蓝牙连接中'
      });
      this.loading.present();
      this.bluetooth.isConnected().then(data => {
        console.log("isConnected: " + data);
        this.bluetooth.disconnect().then(data => {
          console.log("disconnect: " + JSON.stringify(data));
          this.doConnect(address, name);
        }).catch(error => {
          console.log("disconnect error: " + JSON.stringify(error));
          this.isBtConnect = false;
        });
      }).catch(error => {
        console.log("isConnected error: " + JSON.stringify(error));
        this.doConnect(address, name);
      });
    } else {
      this.loading.dismiss();
      this.presentToast('无法连接，请稍后重试！', 2000);
      this.isBtConnect = false;
    }
  };

  doConnect(address: string, name: string) {
    this.bluetooth.connect(address).subscribe(success => {
      if (success === "OK") {
        this.isBtConnect = true;
        this.zone.run(()=>{
          this.btName = name + '已连接';
          this.btBtnText = '断开';
        });
        console.log("bluetooth connect " + name);
        this.loading.dismiss();
        this.popover.dismiss();
        // this.startRead();
        this.subscribeBluetooth('kg')
      } else {
        alert('蓝牙连接失败:'+JSON.stringify(success));
        this.isBtConnect = false;
        this.zone.run(()=>{
          this.btName = '蓝牙未连接';
          this.btBtnText = '扫描';
        });
      }
    }, error => {
      this.zone.run(() => {
        this.isBtConnect = false;
        this.btName = '蓝牙未连接';
        this.btBtnText = '扫描';
        this.loading.dismiss();
        alert(JSON.stringify(error));
      });
    });
  }

  /**
   * 开始监听蓝牙数据
   */
  lastBtData = '';
  lastWeight:number = 0;
  subscribeBluetooth(params: string){
    this.bluetooth.isConnected().then(()=>{
      this.bluetooth.clear();
      this.bluetooth.subscribe(params).subscribe(data=>{
       if(data) {
         console.log("bluetooth receive " + data);
         //不再重复拿取重量
         if(this.lastBtData != data) {
           this.lastBtData = data;
           let str = parseFloat(data.replace(' ','').replace('+','').replace('kg','')).toString();
           console.log("data format:" + str);
           try{
             this.lastWeight = parseFloat(parseFloat(str).toFixed(2));
           }catch(error){
             console.log("bluetooth data format error:" + JSON.stringify(error));
           }
         }
       }
     }, error=>{
       console.log("bluetooth error: " + error);
       this.bluetooth.disconnect().then(()=>{
        this.presentToast("蓝牙已断开，请重新连接", 1500);
        this.isBtConnect = false;
       })
     });
    }).catch(error=>{
      this.presentToast("蓝牙已断开，请重新连接", 1500);
      this.isBtConnect = false;
    });
  }

  /**
   * 获取绑定设备
   */
  getBondedDevices(): Promise<any> {
    this.paired = [];
    return this.bluetooth.list().then(data => {
      console.log('bonded:' + JSON.stringify(data));
      for (let item of data) {
        let name = item['name'];
        if(name == 'HC-06') {
          let device = new BlueToothDeviceModel();
          device.setId(item['id']);
          device.setAddress(item['address']);
          device.setClass(item['class']);
          device.setName(item['name']);
          this.paired.push(device);
        }
      }
    });
  }

  // /**
  //  * 发送获取重量指令
  //  */
  // sendBtCmd() {
  //   if (this.bluetooth.isConnected()) {
  //     let cmd = 'R'.charCodeAt(0);
  //     console.log('send bluetooth cmd:' + cmd);
  //     this.bluetooth.write(cmd).then(data=>{
  //       this.presentToast("正在获取重量，请稍候!", 1500);
  //     }, error=>{
  //       this.presentToast("发送失败，请稍后重试!", 1500);
  //     });
  //   } else {
  //     this.presentToast("蓝牙已断开，请重新连接", 1500);
  //   }
  // }

  /**
   * 获取重量
   */
  getBagWeight() {
    this.bluetooth.isConnected().then(()=>{
      this.zone.run(()=>{
        if(this.currentBag) {
          this.currentBag.weight = this.lastWeight;
          this.currentBag.isDisable = false;
        }
      });
    }).catch(error=>{
      this.presentToast("蓝牙未连接，请链接蓝牙后再试", 1500);
      this.isBtConnect = false;
    });

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
            if (bag.weight) {
              bag.isCommit = true;
            } else {
              bag.isCommit = false;
            }
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
        this.getScanResult(result);
      })
      .catch(error => {
        if (error != "cancelled") {
          alert(JSON.stringify(error));
        }
        console.log(error);
      });
  }

  getScanResult(result: string) {
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
  }

  getDepartName(code: string) {
    if (code) {

      this.service.getDepartmentNameByCode(code).subscribe(result => {
        console.log('getDepartmentNameByCode:' + JSON.stringify(result));
        if (result && result['success']) {
          this.zone.run(() => {
            this.currentDeptName = result['data'];
            this.currentDeptId = code;
            if(!this.checkItemNotCommit()) {
              let alert = this.alertCtrl.create({
                title: "提示",
                message: "您有未提交的任务，还请先称重后提交!",
                buttons: ["确定"]
              });
              alert.present();
            }
          })
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
        if (this.currentBag.bagId) {
          //判断是否有任务ID
          if(this.currentBag.taskId) {
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
          } 
          // 提示用户已经将数据保存到缓存中了，
          else {
            this.service.saveOffLineTask(this.currentBag);
            this.showOffLineTask('当前网络不佳，已保存数据，是否重新提交?');
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
        this.zone.run(() => {
          this.currentBag = new WasteBagObj();
          this.currentBag.bagId = bagID;
          this.currentBag.departId = locationCode;
          this.currentBag.departName = deptName;
          this.currentBag.taskId = result['data'];
          this.currentBag.category = 'A';
          this.currentBag.isDisable = false;
          this.currentBag.isCommit = false;
        });
      } else {
        let alert = this.alertCtrl.create({
          title: "提示",
          message: "创建任务失败:" + result['data'],
          buttons: ["确定"]
        });
        alert.present();
      }
    }, error => {
      // let alert = this.alertCtrl.create({
      //   title: "提示",
      //   message: "创建失败，请稍后重试:" + JSON.stringify(error),
      //   buttons: ["确定"]
      // });
      // alert.present();
      //网络异常或没有网络，无法获取taskID
      this.zone.run(() => {
        this.currentBag = new WasteBagObj();
        this.currentBag.bagId = bagID;
        this.currentBag.departId = locationCode;
        this.currentBag.departName = deptName;
        this.currentBag.category = 'A';
        this.currentBag.isDisable = false;
        this.currentBag.isCommit = false;
      });
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
        this.zone.run(() => {
          this.currentBag = new WasteBagObj();
        });
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
    if (!this.currentBag.category) {
      this.currentBag.category = 'A';
    }
    this.goToTop();
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

  addReceiver() {
    (<any>window).broadcaster.addEventListener('com.wisebox.happyship.mwts.broadcast', this.broadcastListener);
  }

  broadcastListener = (data) => {
    let result = data['data'];
    if (result) {
      let data: string = String(result).trim();
      console.log("com.scanner.broadcast received:[" + data + "]");
      this.getScanResult(data)
    } else {
      let alert = this.alertCtrl.create({
        title: "提示",
        message: "扫描结果异常,请稍后再试!",
        buttons: ["确定"]
      });
      alert.present();
    }
  }

  goToTop() {

    this.content.scrollToTop();
    console.log('Scroll to top!!!');
  }

  checkItemNotCommit():boolean {
    for(let index in this.todayTasks) {
      let item = this.todayTasks[index];
      if(!item.isCommit) {
        return false;
      }
    }
    return true;
  }

  showOffLineTask(msg:string) {
    let alert = this.alertCtrl.create({
      title: "提示",
      message: msg,
      buttons: [{
        text:"确定",
        handler:()=>{
          //再做一次提交
          this.service.createMedicalWasteTranferTask(this.currentBag.bagId, this.currentBag.departId).subscribe(result => {
            console.log('createMedicalWasteTranferTask:' + JSON.stringify(result));
            if (result['success']) {
              let taskId = result['data'];
              if(taskId) {
                this.service.updateTaskWeight(taskId, this.currentBag.weight, this.currentBag.category).subscribe(result => {
                  if (result['success']) {
                    let alert = this.alertCtrl.create({
                      title: "提示",
                      message: "提交成功!",
                      buttons: ["确定"]
                    });
                    alert.present();
                    this.zone.run(() => {
                      this.currentBag = new WasteBagObj();
                    });
                    this.getTaskList();
                  } else {
                    this.service.saveOffLineTask(null);
                    let alert = this.alertCtrl.create({
                      title: "提示",
                      message: "提交失败,请将垃圾袋二维码拍照保存提交给管理员处理!",
                      buttons: ["确定"]
                    });
                    alert.present();
                  }
                }, error=>{
                  this.service.saveOffLineTask(null);
                let alert = this.alertCtrl.create({
                  title: "提示",
                  message: '提交失败,请将垃圾袋二维码拍照保存提交给管理员处理!',
                  buttons: ["确定"]
                });
                alert.present();
                });
              }else {
                this.service.saveOffLineTask(null);
                let alert = this.alertCtrl.create({
                  title: "提示",
                  message: '创建任务失败,请将垃圾袋二维码拍照保存提交给管理员处理!',
                  buttons: ["确定"]
                });
                alert.present();
              }
              
            }else {
              this.service.saveOffLineTask(null);
              let alert = this.alertCtrl.create({
                title: "提示",
                message: "创建任务失败:" + result['data']+'请将垃圾袋二维码拍照保存提交给管理员处理!',
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
      },{text:'取消'}],
    });
    alert.present();
  }

  presentToast(msg: string, duration: number) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration,
      position: "bottom"
    });
    toast.present();
  }

}

export class WasteBagObj {
  taskId: string = '';
  bagId: string = '';
  weight: number;
  departId: string = '';
  departName: string = '';
  category: string = '';
  isDisable: boolean = true;
  isCommit: boolean = false;
  date: string = '';
}

/**
 * 蓝牙设备模型类
 */
export class BlueToothDeviceModel{

  private id:string;
  private _class:number;
  private name:string;
  private address:string;

  constructor() {
      
  }
  
  public setId(v : string) {
      this.id = v;
  }

  
  public getId() : string {
      return this.id;
  }

  
  public setClass(v : number) {
      this._class = v;
  }

  
  public getClass() : number {
      return this._class;
  }

  
  public setName(v : string) {
      this.name = v;
  }

  
  public getName() : string {
      return this.name;
  }
  
  
  public setAddress(v : string) {
      this.address = v;
  }
  
  
  public getAddress() : string {
      return this.address
  }
}
