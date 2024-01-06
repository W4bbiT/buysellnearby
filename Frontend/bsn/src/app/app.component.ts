import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HeaderPage } from './pages/header/header.page';
import { FooterPage } from './pages/footer/footer.page';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, HeaderPage, FooterPage],
})
export class AppComponent {
  constructor() {}
}
