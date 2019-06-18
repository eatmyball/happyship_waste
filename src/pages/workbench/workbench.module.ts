import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkbenchPage } from './workbench';

@NgModule({
  declarations: [
    WorkbenchPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkbenchPage),
  ],
})
export class WorkbenchPageModule {}
