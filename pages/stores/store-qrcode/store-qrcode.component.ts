import { Component } from '@angular/core';
import { Store } from '../../../services/store.service';

@Component({
  selector: 'app-store-qrcode',
  templateUrl: './store-qrcode.component.html',
  styleUrl: './store-qrcode.component.scss'
})
export class StoreQrcodeComponent {
	store: Store;
}
