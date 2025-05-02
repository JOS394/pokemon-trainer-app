// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Función de inicialización para asegurar que localStorage esté disponible
export function initializeApp() {
  return () => {
    return new Promise<void>((resolve) => {
      // Esperar a que el DOM esté completamente cargado
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else {
        resolve();
      }
    });
  };
}

// Configuración de proveedores para la aplicación standalone
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // Otros proveedores globales aquí...
  ]
}).catch(err => console.error(err));