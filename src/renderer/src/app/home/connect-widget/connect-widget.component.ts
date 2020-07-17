import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DecebotService } from '../../core/services';

const CONNECTED_STRING = 'COMPONENTS.CONNECT_WIDGET.CONNECTED';
const DISCONNECTED_STRING = 'COMPONENTS.CONNECT_WIDGET.DISCONNECTED';
const CONNECTING_STRING = 'COMPONENTS.CONNECT_WIDGET.CONNECTING';

@Component({
  selector: 'app-connect-widget',
  templateUrl: './connect-widget.component.html',
  styleUrls: ['./connect-widget.component.css'],
})
export class ConnectWidgetComponent implements OnInit {
  connectionStatusString = DISCONNECTED_STRING;
  toggleDisabled = false;
  connectionStatus = false;

  constructor(private decebot: DecebotService) {}

  ngOnInit(): void {}

  async onConnectionChange(event: MatSlideToggleChange) {
    this.toggleDisabled = true;
    this.connectionStatus = event.checked;
    try {
      if (event.checked) {
        this.connectionStatusString = CONNECTING_STRING;
        await this.decebot.connect();
        this.connectionStatusString = CONNECTED_STRING;
      } else {
        await this.decebot.disconnect();
        this.connectionStatusString = DISCONNECTED_STRING;
      }
    } catch (e) {
      this.connectionStatus = false;
      this.connectionStatusString = DISCONNECTED_STRING;
    } finally {
      this.toggleDisabled = false;
    }
  }
}
