import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { StoresComponent } from './stores.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: StoresComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CoreModule
	],
	declarations: [
		StoresComponent
	],
	providers: []

})

export class StoresModule { }
