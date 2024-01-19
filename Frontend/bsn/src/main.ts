import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideHttpClient } from '@angular/common/http';

import { IonicStorageModule } from '@ionic/storage-angular'; 
import { WebSocketService } from './app/services/web-socket.service';
import { AuthService } from './app/services/auth.service';
import { TokenStorageService } from './app/services/token-storage.service';
import { UsersService } from './app/services/users.service';
import { ProductsService } from './app/services/products.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(
      IonicStorageModule.forRoot()
    ),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    WebSocketService,
    AuthService,
    TokenStorageService,
    UsersService,
    ProductsService
  ],
});
