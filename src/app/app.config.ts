// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideClientHydration } from '@angular/platform-browser';
// import { provideHttpClient, withFetch } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(routes),provideAnimations(), provideClientHydration(),provideHttpClient(withFetch())]
// };

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';
import { io, Socket } from 'socket.io-client';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    {
      provide: Socket,
      useFactory: () => io('http://127.0.0.1:5000'), 
    },
  ],
};
