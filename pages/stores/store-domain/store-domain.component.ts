import { Component } from '@angular/core';
import { Store } from '../../../services/store.service';
import { environment } from 'src/environments/environment';
import { HttpService } from 'wacom';
import { AlertService } from 'src/app/modules/alert/alert.service';
import { ConfigService } from 'src/app/core/services/config.service';

@Component({
	selector: 'app-store-domain',
	templateUrl: './store-domain.component.html',
	styleUrl: './store-domain.component.scss'
})
export class StoreDomainComponent {
	ip = (environment as unknown as { storeIp: string })?.storeIp || '';

	domain: string;

	store: Store;

	constructor(
		public config: ConfigService,
		private _alert: AlertService,
		private _http: HttpService
	){}

	update() {
		this._http.post('/api/store/domain', {
			_id: this.store._id,
			domain: this.domain
		}, (resp) => {
			if (resp.updated) {
				this.store.domain = resp.updated;
			}

			if (resp.text) {
				this._alert.show({ text: resp.text });
			} else {
				this._alert.show({ text: 'Process failed' });
			}
		});
	}
}
