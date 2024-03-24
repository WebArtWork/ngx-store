import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { StoresComponent } from './stores.component';
import { Routes, RouterModule } from '@angular/router';
import { StoreDomainComponent } from './store-domain/store-domain.component';
import { QrCodeModule } from 'ng-qrcode';
import { StoreQrcodeComponent } from './store-qrcode/store-qrcode.component';
import { StoreTransferComponent } from './store-transfer/store-transfer.component';

const routes: Routes = [{
	path: '',
	component: StoresComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		QrCodeModule,
		CoreModule
	],
	declarations: [
		StoreDomainComponent,
		StoresComponent,
  StoreQrcodeComponent,
  StoreTransferComponent
	],
	providers: []

})

export class StoresModule { }
