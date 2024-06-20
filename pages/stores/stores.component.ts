import { Component } from '@angular/core';
import { FormService } from 'src/app/modules/form/form.service';
import {
	StoreService,
	Store
} from 'src/app/modules/store/services/store.service';
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { AlertService, CoreService, HttpService, MongoService } from 'wacom';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { ThemeService } from 'src/app/modules/theme/services/theme.service';
import { TagService } from 'src/app/modules/tag/services/tag.service';
import { FormComponentInterface } from '../../../form/interfaces/component.interface';
import { ModalService } from '../../../modal/modal.service';
import { StoreDomainComponent } from './store-domain/store-domain.component';
import { StoreQrcodeComponent } from './store-qrcode/store-qrcode.component';
import { StoreTransferComponent } from './store-transfer/store-transfer.component';
import { Planfeature, PlanfeatureService } from 'src/app/modules/plan/services/planfeature.service';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
	templateUrl: './stores.component.html',
	styleUrls: ['./stores.component.scss']
})
export class StoresComponent {
	title = this._ss.config.pageTitle;
	columns = ['enabled', 'name', 'domain'];
	features: Planfeature[] = [];
	form: FormInterface;
	variables: FormComponentInterface[] = [];
	formVariables: FormInterface = this._form.getForm('variables', {
		formId: 'variables',
		title: 'Variables',
		components: this.variables
	});
	fetchedTheme: string;
	setVariables(doc: Store = {} as Store) {
		if (doc.theme && this.fetchedTheme !== doc.theme) {
			this.variables.splice(0, this.variables.length);
			this.features.splice(0, this.features.length);
			this.fetchedTheme = doc.theme;
			this._http.get(
				`/api/theme/template/variables/${doc.theme}`,
				(resp) => {
					let focused = true;
					doc.variables = doc.variables || {};
					for (const variable in resp.variables) {
						const name =
							resp.variablesInfo[variable]?.name || 'Text';
						this.variables.push({
							focused: focused && name === 'Text' ? true : false,
							key: variable,
							root: true,
							name,
							fields: [
								{
									name: 'Placeholder',
									value: 'fill ' + variable
								},
								{
									name: 'Label',
									value: variable
								}
							]
						});
						if (name === 'Text') {
							focused = false;
						}

						doc.variables[variable] =
							typeof doc.variables[variable] === 'undefined'
								? resp.variables[variable]
								: doc.variables[variable];
					}
				}
			);

			this.features.splice(0, this.features.length);
			const theme = this._ts.doc(doc.theme);
			for (const featureId of (theme.features || [])) {
				this.features.push(this._ufs.doc(featureId));
			}
		}
	}

	config = {
		create: () => {
			this._form
				.modal<Store>(
					this.form,
					{
						label: this._translate.translate('Common.Create'),
						click: (created: unknown, close: () => void) => {
							this._ss.create(created as Store);
							close();
						}
					},
					this._ss.config.defaultIndexPage
						? {
								indexPage: this._ss.config.defaultIndexPage
						  }
						: {}
				)
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

					this.setVariables(doc as Store);
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
		},
		buttons: [
			{
				icon: 'text_fields',
				click: (store: Store) => {
					store.variables = store.variables || {};
					this._form
						.modal<Record<string, unknown>>(
							this.formVariables,
							[],
							store.variables
						)
						.then((updated: Record<string, unknown>) => {
							this._core.copy(updated, store.variables);
							this._ss.save(store);
						});
				}
			},
			{
				icon: 'cloud_download',
				click: (store: Store) => {
					this._modal.show({
						component: StoreDomainComponent,
						store
					});
				}
			},
			{
				icon: 'qr_code',
				click: (store: Store) => {
					this._modal.show({
						component: StoreQrcodeComponent,
						store
					});
				}
			},
			this.us.role('agent') || this.us.role('admin')
				? {
						icon: 'people',
						click: (store: Store) => {
							this._modal.show({
								component: StoreTransferComponent,
								store
							});
						}
				  }
				: null
		]
	};

	get rows(): Store[] {
		return this._ss.stores;
	}

	update(store: Store) {
		this._ss.update(store);
	}

	constructor(
		private _translate: TranslateService,
		private _ufs: PlanfeatureService,
		private _alert: AlertService,
		private _mongo: MongoService,
		private _modal: ModalService,
		private _http: HttpService,
		private _form: FormService,
		private _core: CoreService,
		private _ts: ThemeService,
		private _ss: StoreService,
		private _tss: TagService,
		public us: UserService
	) {
		if (this.us.role('admin')) {
			this.columns.push('author');
			this.columns.push('agent');
		} else if (
			this.us.role('agent')
		) {
			this.columns.push('location');
			this.columns.push('author');
		}
		this._mongo.on('store theme', () => {
			for (const doc of this.rows) {
				this.setVariables(doc);
			}
		});
		this._mongo.on('theme tag', () => {
			const pages = this._ss.config.pages.map((p) => {
				return {
					_id: p.page,
					name: p.page
				};
			});
			this.form = this._form.getForm('store', {
				formId: 'store',
				title: this._ss.config.docTitle,
				components: [
					{
						name: 'Photo',
						key: 'favicon',
						fields: [
							{
								name: 'Label',
								value: 'Favicon'
							},
							{
								name: 'Width',
								value: 64
							},
							{
								name: 'Height',
								value: 64
							}
						]
					},
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
						name: 'Select',
						key: 'features',
						fields: [
							{
								name: 'Placeholder',
								value: 'Select features'
							},
							{
								name: 'Items',
								value: this.features
							},
							{
								name: 'Multiple',
								value: true
							}
						]
					},
					// {
					// 	name: 'Text',
					// 	key: 'location',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'fill location'
					// 		},
					// 		{
					// 			name: 'Label',
					// 			value: 'Location'
					// 		}
					// 	]
					// },
					// {
					// 	name: 'Text',
					// 	key: 'domain',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'fill your domain'
					// 		},
					// 		{
					// 			name: 'Label',
					// 			value: 'Domain'
					// 		}
					// 	]
					// },
					// {
					// 	name: 'Text',
					// 	key: 'website',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'fill your website'
					// 		},
					// 		{
					// 			name: 'Label',
					// 			value: 'Website'
					// 		}
					// 	]
					// },
					// {
					// 	name: 'Number',
					// 	key: 'markup',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'fill your markup'
					// 		},
					// 		{
					// 			name: 'Label',
					// 			value: 'Markup'
					// 		}
					// 	]
					// },
					// {
					// 	name: 'Select',
					// 	key: 'indexPage',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'Select default page'
					// 		},
					// 		{
					// 			name: 'Items',
					// 			value: pages
					// 		}
					// 	]
					// },
					// {
					// 	name: 'Select',
					// 	key: 'tag',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'Select tag'
					// 		},
					// 		{
					// 			name: 'Items',
					// 			value: this._tss.group('store')
					// 		}
					// 	]
					// },
					// {
					// 	name: 'Select',
					// 	key: 'headerTags',
					// 	fields: [
					// 		{
					// 			name: 'Placeholder',
					// 			value: 'Select tags'
					// 		},
					// 		{
					// 			name: 'Items',
					// 			value: this._core.splice(
					// 				this._tss.group('store'),
					// 				this._tss.tags
					// 			)
					// 		},
					// 		{
					// 			name: 'Multiple',
					// 			value: true
					// 		}
					// 	]
					// },
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
								value: this._ts.byModule['store']
							}
						]
					},
					{
						name: 'Text',
						key: 'currency',
						fields: [
							{
								name: 'Placeholder',
								value: 'fill custom currency'
							},
							{
								name: 'Label',
								value: 'Currency'
							}
						]
					},
				]
			});
		});
	}
}
