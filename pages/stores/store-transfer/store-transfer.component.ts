import { Component } from '@angular/core';
import { Store } from '../../../services/store.service';
import { AlertService, HttpService } from 'wacom';
import { UserService } from 'src/app/core';
import { TranslateService } from 'src/app/modules/translate/translate.service';

@Component({
	selector: 'app-store-transfer',
	templateUrl: './store-transfer.component.html',
	styleUrl: './store-transfer.component.scss'
})
export class StoreTransferComponent {
	get title(): string {
		return 'Change ownership' + (this.us.role('admin') ? ' or agent' : '');
	}
	constructor(
		private _translate: TranslateService,
		private _alert: AlertService,
		private _http: HttpService,
		public us: UserService
	) {}
	userId: string;
	store: Store;
	changeOwnership() {
		if (this.userId) {
			this._alert.question({
				unique: 'storeownership',
				text: this._translate.translate(
					'Store.Are you sure you want to transfer ownership?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: () => {
							this._http.post(
								'/api/store/change/ownership',
								{
									storeId: this.store._id,
									userId: this.userId
								},
								(changed) => {
									if (changed) {
										this._alert.show({
											text: this._translate.translate(
												'Store.Ownership changed'
											)
										});
									} else {
										this._alert.show({
											text: this._translate.translate(
												'Store.There been a server error'
											)
										});
									}
								}
							);
						}
					}
				]
			});
		} else {
			this._alert.error({
				text: this._translate.translate(
					'Store.Please select user to transfer ownership'
				)
			});
		}
	}
	changeAgent() {
		if (this.userId) {
			this._alert.question({
				unique: 'storeagent',
				text: this._translate.translate(
					'Store.Are you sure you want to transfer agent?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: () => {
							this._http.post(
								'/api/store/change/agent',
								{
									storeId: this.store._id,
									userId: this.userId
								},
								(changed) => {
									if (changed) {
										this._alert.show({
											text: this._translate.translate(
												'Store.Agent changed'
											)
										});
									} else {
										this._alert.show({
											text: this._translate.translate(
												'Store.There been a server error'
											)
										});
									}
								}
							);
						}
					}
				]
			});
		} else {
			this._alert.error({
				text: this._translate.translate(
					'Store.Please select user to transfer agent'
				)
			});
		}
	}
}
