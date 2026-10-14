import { ChartConfiguration, Chart } from 'chart.js';
import { Router } from '@angular/router';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { Role } from '../../../../core/models/auth.model';
import { OrderStatus } from '../../../../core/models/order.model';

// user chart
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
        window.innerWidth <= 992
          ? { top: 15, bottom: 15, left: 15, right: 15 }
          : { top: 22, bottom: 20, left: 20, right: 20 }
    },
    plugins: {
      legend: { position: 'bottom' },
      datalabels: {
        color: '#000',
        font: (context: { chart: Chart }) => {
          const w = context.chart.width;
          if (w < 200) return { size: 6.5 };
          if (w < 300) return { size: 8 };
          return { size: 12 };
        },
        formatter: (value, context) =>
          `${context.chart.data.labels?.[context.dataIndex]}: ${value}`,
        anchor: 'end',
        align: (context: { chart: Chart }) =>
          context.chart.width < 200 ? 'start' : 'end',
        clamp: true,
        offset: 2,
        display: true,
        borderRadius: 3,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderWidth: 1,
        padding: { top: 2, bottom: 2, left: 3, right: 3 }
      }
    }
  };
}


// category chart
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
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${value} Products`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        stacked: true,
        beginAtZero: true
      }
    }
  };
}

// revenue chart
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

// order chart
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

export function getOrderChartOptions(
  router: Router,
  portalRoutes: PortalRouteService,
  portal: PortalKey,
  selectedYear: number | null,
): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements, chart) => {
      if (elements && elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const monthIndex = element.index;

        const month = monthIndex + 1; // Convert to 1-based month
        const datasetLabel = String(
          chart.data.datasets[datasetIndex].label || '',
        );
        let orderStatus: OrderStatus | undefined = undefined;
        if (datasetLabel === 'Active Orders') {
          orderStatus = OrderStatus.Active;
        } else if (datasetLabel === 'Delivered Orders') {
          orderStatus = OrderStatus.Delivered;
        } else if (datasetLabel === 'Cancelled Orders') {
          orderStatus = OrderStatus.Cancelled;
        } else if (datasetLabel === 'Shipped Orders') {
          orderStatus = OrderStatus.Shipped;
        }
        const year = selectedYear ?? new Date().getFullYear();

        router.navigate(portalRoutes.orders(portal, 'manage'), {
          queryParams: {
            orderStatus: orderStatus,
            month: month,
            year: year
          }
        });
      }
    },
    onHover: (event, chartElement) => {
      const target = event.native?.target as HTMLElement;
      if (target)
        target.style.cursor = chartElement.length > 0 ? 'pointer' : 'default';
    },
    plugins: {
      datalabels: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(Number(value))
              ? value
              : '';
          }
        }
      }
    }
  };
}
