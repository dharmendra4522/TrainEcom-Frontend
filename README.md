# TrainEcom Frontend

Angular frontend for the TrainEcom e-commerce platform. It provides shopping flows for customers and management portals for administrators and vendors.

## Features

- Customer authentication, profile management, and account pages
- Product, brand, and category browsing
- Shopping cart and wishlist
- Checkout and order history
- Vendor dashboard, product management, order management, and profile management
- Admin dashboard, users, brands, categories, products, orders, reports, notifications, and settings
- Role-based routing and management-access guards
- JWT authentication with HTTP interceptors
- NgRx state management and Store Devtools support
- Angular Material and Bootstrap UI components
- Server-sent event support for real-time notifications

## Tech Stack

- Angular 18
- TypeScript 5.5
- Angular Material
- Bootstrap 5
- NgRx Store and Effects
- RxJS
- Chart.js and ng2-charts
- Angular CLI 18
- Karma and Jasmine

## Prerequisites

- Node.js 18 or newer
- npm
- Angular CLI 18

Install the Angular CLI globally if it is not already available:

```bash
npm install -g @angular/cli@18
```

## Getting Started

1. Clone the repository.
2. Open a terminal in the project directory.
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open `https://train-ecom-frontend-fawn.vercel.app/`.

The development server reloads automatically when source files change.

## Backend Configuration

API settings are stored in `src/environments/environment.ts`.

The default development configuration uses:

```text
https://ecomm-cddbdhgwe9feadgw.centralindia-01.azurewebsites.net/api
```

To use a local backend, update `apiBaseUrl` in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5009/api'
};
```

Authentication requests, protected API calls, and HTTP error handling are configured through the interceptors in `src/app/core/interceptors/`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the development server |
| `npm run build` | Creates a production build |
| `npm run watch` | Builds continuously using the development configuration |
| `npm test` | Runs unit tests with Karma |

You can also use Angular CLI commands directly, for example:

```bash
npx ng build
npx ng test
npx ng generate component component-name
```

## Project Structure

```text
src/
  app/
    core/
      config/       Application configuration
      guards/       Authentication and role-based route guards
      interceptors/ HTTP authentication and error interceptors
      models/       Shared TypeScript models
      services/     Shared application services
      store/        NgRx reducers, actions, and effects
      utils/        Core utility helpers
    features/
      auth/         Login, registration, and password flows
      brand/        Brand management
      cart/         Shopping cart
      checkout/     Checkout flow
      dashboard/    Admin and vendor dashboards
      home/         Storefront home page
      notification/ Notification history
      orders/       Customer, vendor, and admin order flows
      products/     Product browsing and management
      reports/      Administrative reports
      settings/     Application settings
      users/        User and profile management
    shared/
      components/   Reusable components
      layouts/      Main and authentication layouts
      directives/   Shared directives
      utils/        Shared utility helpers
  environments/   Environment configuration
  public/         Static assets
```

## Build

Create a production build:

```bash
npm run build
```

Build output is written to `dist/train-ecom-frontend/`.

## Testing

Run the unit test suite:

```bash
npm test
```

Tests are written with Jasmine and executed in a Chrome browser through Karma.

## Route Areas

- `/` - Storefront home
- `/products` - Product catalog
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/account/*` - Customer account pages
- `/vendor/*` - Vendor portal
- `/admin/*` - Administration portal
