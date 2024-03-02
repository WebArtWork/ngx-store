import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { StoresComponent } from './stores.component';
import { Routes, RouterModule } from '@angular/router';
import { StoreDomainComponent } from './stores/store-domain/store-domain.component';
import { QrCodeModule } from 'ng-qrcode';
import { StoreQrcodeComponent } from './stores/store-qrcode/store-qrcode.component';

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
  StoreQrcodeComponent
	],
	providers: []

})

export class StoresModule { }
