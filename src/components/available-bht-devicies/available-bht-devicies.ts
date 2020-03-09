import { BlueToothDeviceModel } from './../../pages/workbench/workbench';
import { NavParams } from 'ionic-angular';
import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";

/**
 * Generated class for the AvailableBhtDeviciesComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'available-bht-devicies',
  templateUrl: 'available-bht-devicies.html'
})
export class AvailableBhtDeviciesComponent {

  @Output('outputEvent') outputEvent = new EventEmitter<any>();

  disabled: boolean = false;
  scanning: string = "扫描中...";
  scan: string = "扫描";
  tips: string = this.scan;

  //连结过的设备
  pairedDevices: Array<BlueToothDeviceModel> = [];
  //未连接过的设备
  unPairedDevices: Array<BlueToothDeviceModel> = [];

  callback: any;

  constructor(private params: NavParams, public bluetooth: BluetoothSerial, public cd: ChangeDetectorRef) {
    console.log('Hello AvailableBhtDeviciesComponent Component');
    this.pairedDevices = this.params.get('paired');
    // this.unPairedDevices = this.params.get('unPair');
    this.callback = this.params.get('callback');
  }

  ionViewWillEnter() {
    this.getUnpairedDevicies();
  }

  onItemClick(item: BlueToothDeviceModel) {
    this.callback(item);
  }

  /**
   * 获取未配对的设备
   */
  getUnpairedDevicies(): void {
    this.disabled = true;
    this.tips = this.scanning;
    this.unPairedDevices = [];
    this.bluetooth.setDeviceDiscoveredListener().subscribe(data => {
      let name = data['name'];
      if(name == 'HC-06') {
        let device = new BlueToothDeviceModel();
        device.setId(data['id']);
        device.setAddress(data['address']);
        device.setClass(data['class']);
        device.setName(data['name']);
        this.unPairedDevices.push(device);
        this.cd.detectChanges();
      }
    }, error => {
      alert(JSON.stringify(error));
    });

    this.bluetooth.discoverUnpaired().then(data => {
      this.disabled = false;
      this.tips = this.scan;
    }).catch(error => {
      alert(JSON.stringify(error));
    });
  }

  doScan() {
    this.getUnpairedDevicies();
  }
}
