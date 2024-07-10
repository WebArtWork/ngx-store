import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { MongoService, AlertService } from 'wacom';

export interface Store {
	_id: string;
	author: string;
	moderators: string[];
	active: boolean;
	name: string;
	domain: string;
	markup: number;
	description: string;
	theme: string;
	indexPage: string;
	data: Record<string, unknown>,
	variables: Record<string, unknown>
}

interface StoreConfig {
	defaultIndexPage: string;
	pageTitle: string;
	docTitle: string;
	pages: {
		page: string;
		url: string;
		json: string;
	}[];
}

@Injectable({
	providedIn: 'root'
})
export class StoreService {
	config = (environment as unknown as { store: StoreConfig }).store || {
		defaultIndexPage: '',
		pageTitle: 'Stores',
		docTitle: 'Store',
		pages: []
	};

	stores: Store[] = [];

	_stores: any = {};

	new(): Store {
		return {} as Store;
	}

	constructor(
		private mongo: MongoService,
		private alert: AlertService
	) {
		this.stores = mongo.get('store', {
			replace: {
				data: mongo.beObj
			}
		}, (arr: any, obj: any) => {
			this._stores = obj;
		});
	}

	create(
		store: Store = this.new(),
		callback = (created: Store) => {},
		text = 'store has been created.'
	) {
		if (store._id) {
			this.save(store);
		} else {
			this.mongo.create('store', store, (created: Store) => {
				callback(created);
				this.alert.show({ text });
			});
		}
	}

	doc(storeId: string): Store {
		if(!this._stores[storeId]){
			this._stores[storeId] = this.mongo.fetch('store', {
				query: {
					_id: storeId
				}
			});
		}
		return this._stores[storeId];
	}

	update(
		store: Store,
		callback = (created: Store) => {},
		text = 'store has been updated.'
	): void {
		this.mongo.afterWhile(store, ()=> {
			this.save(store, callback, text);
		});
	}

	save(
		store: Store,
		callback = (created: Store) => {},
		text = 'store has been updated.'
	): void {
		this.mongo.update('store', store, () => {
			if(text) this.alert.show({ text, unique: store });
		});
	}

	delete(
		store: Store,
		callback = (created: Store) => {},
		text = 'store has been deleted.'
	): void {
		this.mongo.delete('store', store, () => {
			if(text) this.alert.show({ text });
		});
	}
}
