import { ChartConfiguration } from 'chart.js';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { Role } from '../../../../core/models/auth.model';

export function getUserChartOptions(
  router: Router,
  portalRoutes: PortalRouteService,
  portal: PortalKey,
): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements, chart) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const label = chart.data.labels?.[index];
        if (label === 'Customers') {
          router.navigate(portalRoutes.users(portal, 'manage'), {
            queryParams: { role: Role.Customer }
          });
        } else if (label === 'Vendors') {
          router.navigate(portalRoutes.users(portal, 'manage'), {
            queryParams: { role: Role.Vendor }
          });
        }
      }
    },
    onHover: (event, chartElement) => {
      const target = event.native?.target as HTMLElement;
      if (target)
        target.style.cursor = chartElement.length > 0 ? 'pointer' : 'default';
    },
    layout: {
      padding:
        window.innerWidth < 768
          ? { top: 10, bottom: 20, left: 60, right: 70 }
          : { top: 25, bottom: 10, left: 40, right: 50 },
    },
    plugins: {
      legend: { position: 'bottom' },
      datalabels: {
        color: '#000',
        formatter: (value, context) =>
          `${context.chart.data.labels?.[context.dataIndex]}: ${value}`,
        anchor: 'end',
        align: 'end',
        offset: 4,
        display: true,
        borderRadius: 4,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderWidth: 1,
        padding: 4
      }
    }
  };
}

export function getProductChartOptions(
  router: Router,
  portalRoutes: PortalRouteService,
): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements, chart) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const categoryName = chart.data.labels?.[index];
        if (categoryName) {
          const portal = portalRoutes.currentPortal() ?? 'admin';
          router.navigate(portalRoutes.products(portal, 'manage'), {
            queryParams: { categoryName }
          });
        }
      }
    },
    onHover: (event, chartElement) => {
      const target = event.native?.target as HTMLElement;
      if (target)
        target.style.cursor = chartElement.length > 0 ? 'pointer' : 'default';
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
      },
      y: { beginAtZero: true }
    }
  };
}

export const revenueChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
    },
    y: { beginAtZero: true }
  }
};

export const orderChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
};
