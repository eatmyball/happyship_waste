/*
  Description: Tab页面
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import { Component, ViewChild } from '@angular/core';

import { MyPage } from '../my/my';
import {Tabs, App} from "ionic-angular";
import {Service} from "../../providers/piservice/service";
import {ItemListPage} from "../item-list/item-list";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  firsttime = true;
  @ViewChild('mainTabs') tabs:Tabs;
  tab2Root: any = ItemListPage;
  tab3Root: any = MyPage;

  params = {
    tabselected: true
  };

  constructor(public app: App, public service: Service) {
  }

  initActingItem() {
    // console.log('tabselect');
    // this.params.tabselected = true;

  //   this.service.setActingLastRefresh();
  //   if (!this.firsttime) {
  //     this.app.getRootNav().getActiveChildNav().getSelected().setRoot(ActingitemPage);
  //   }
  //   this.firsttime = false;
  }
}
