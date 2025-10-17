import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RiskExposureChart({ exposure }) {
  const protocols = Object.keys(exposure.byProtocol);
  const chartData = {
    labels: protocols.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    datasets: [
      {
        data: protocols.map(p => exposure.byProtocol[p].percentage),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',  // Purple
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(34, 197, 94, 0.8)',   // Green
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(255, 255, 255)',
          padding: 15,
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const protocol = protocols[context.dataIndex];
            const data = exposure.byProtocol[protocol];
            return [
              `${context.label}: ${context.parsed}%`,
              `Amount: ${data.amount.toFixed(4)} sBTC`,
              `APY: ${data.apy}%`
            ];
          }
        }
      }
    },
    cutout: '65%',
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
