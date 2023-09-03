import { Component } from '@angular/core';
import { FormService } from 'src/app/modules/form/form.service';
import { StoreService, Store } from 'src/app/core/services/store.service';
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { AlertService, CoreService, MongoService } from 'wacom';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { TagService } from 'src/app/modules/tag/services/tag.service';

@Component({
	templateUrl: './stores.component.html',
	styleUrls: ['./stores.component.scss']
})
export class StoresComponent {
	columns = ['name', 'description', 'domain', 'markup'];

	form: FormInterface;

	config = {
		create: () => {
			this._form
				.modal<Store>(this.form, {
					label: this._translate.translate('Common.Create'),
					click: (created: unknown, close: () => void) => {
						this._ss.create(created as Store);
						close();
					}
				})
				.then(this._ss.create.bind(this));
		},
		update: (doc: Store) => {
			this._form
				.modal<Store>(this.form, [], doc)
				.then((updated: Store) => {
					if (updated) {
						this._core.copy(updated, doc);
						this._ss.save(doc);
					}
				});
		},
		delete: (doc: Store) => {
			this._alert.question({
				text: this._translate.translate(
					'Common.Are you sure you want to delete this store?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: () => {
							this._ss.delete(doc);
						}
					}
				]
			});
		}
	};

	get rows(): Store[] {
		return this._ss.stores;
	}

	constructor(
		private _translate: TranslateService,
		private _alert: AlertService,
		private _mongo: MongoService,
		private _form: FormService,
		private _core: CoreService,
		private _ts: ThemeService,
		private _ss: StoreService,
		private _tss: TagService
	) {
		this._mongo.on('theme', () => {
			this.form = this._form.getForm('store', {
				formId: 'store',
				title: 'Store',
				components: [
					{
						name: 'Photo',
						key: 'thumb',
						fields: [
							{
								name: 'Label',
								value: 'Header picture'
							}
						]
					},
					{
						name: 'Text',
						key: 'name',
						focused: true,
						fields: [
							{
								name: 'Placeholder',
								value: 'fill your name'
							},
							{
								name: 'Label',
								value: 'Name'
							}
						]
					},
					{
						name: 'Text',
						key: 'description',
						fields: [
							{
								name: 'Placeholder',
								value: 'fill your description'
							},
							{
								name: 'Label',
								value: 'Description'
							}
						]
					},
					{
						name: 'Text',
						key: 'domain',
						fields: [
							{
								name: 'Placeholder',
								value: 'fill your domain'
							},
							{
								name: 'Label',
								value: 'Domain'
							}
						]
					},
					{
						name: 'Text',
						key: 'website',
						fields: [
							{
								name: 'Placeholder',
								value: 'fill your website'
							},
							{
								name: 'Label',
								value: 'Website'
							}
						]
					},
					{
						name: 'Number',
						key: 'markup',
						fields: [
							{
								name: 'Placeholder',
								value: 'fill your markup'
							},
							{
								name: 'Label',
								value: 'Markup'
							}
						]
					},
					{
						name: 'Select',
						key: 'tag',
						fields: [
							{
								name: 'Placeholder',
								value: 'Select tag'
							},
							{
								name: 'Items',
								value: this._tss.group('product')
							}
						]
					},
					{
						name: 'Select',
						key: 'theme',
						fields: [
							{
								name: 'Placeholder',
								value: 'Select theme'
							},
							{
								name: 'Items',
								value: this._ts.themes
							}
						]
					}
				]
			});
		});
	}
}
