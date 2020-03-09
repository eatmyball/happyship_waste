import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
/*
  Description: 程序入口
  Author: ZhuChenjie
  Create Date: 2017-05-04
 */

import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {AboutPage} from '../pages/about/about';
import {ContactPage} from '../pages/contact/contact';
import {MyPage} from '../pages/my/my';
import {TabsPage} from '../pages/tabs/tabs';
import {ItemListPage} from '../pages/item-list/item-list';
import {ItemDetailPage} from '../pages/item-detail/item-detail';
import {ItempopoverPage} from '../pages/itempopover/itempopover';
import {HelpPage} from '../pages/help/help';
import {LoginPage} from '../pages/login/login';
import {Service} from "../providers/piservice/service";
import {IonicStorageModule} from '@ionic/storage';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {InAppBrowser} from '@ionic-native/in-app-browser';

import { SplashScreen } from '@ionic-native/splash-screen';
import { ZBar } from '@ionic-native/zbar';
import { AvailableBhtDeviciesComponent } from './../components/available-bht-devicies/available-bht-devicies';

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        ContactPage,
        MyPage,
        TabsPage,
        ItemListPage,
        ItemDetailPage,
        ItempopoverPage,
        HelpPage,
        LoginPage,
        AvailableBhtDeviciesComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp, {
            scrollAssist: false,
            autoFocusAssist: false,
            iconMode: 'ios',//  在整个应用程序中为所有图标使用的模式。可用选项："ios"，"md"
            mode: 'ios'//在整个应用程序中使用的模式。
        }),

        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AboutPage,
        ContactPage,
        MyPage,
        TabsPage,
        ItemListPage,
        ItemDetailPage,
        ItempopoverPage,
        HelpPage,
        LoginPage,
        AvailableBhtDeviciesComponent
    ],
    providers: [{
        provide: ErrorHandler,
        useClass: IonicErrorHandler
        }, 
        Service, 
        InAppBrowser, 
        SplashScreen, 
        ZBar,
        BluetoothSerial
    ]
})
export class AppModule {
}
