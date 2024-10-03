const ctx = document.getElementById('pressureChart').getContext('2d');
const pressureChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['1 Jun', '5 Jun', '10 Jun', '15 Jun', '20 Jun', '25 Jun', '30 Jun'],
        datasets: [{
            label: 'Pressão Arterial (mmHg)',
            data: [120, 122, 121, 123, 120, 124, 122],
            borderColor: '#FF5733',
            backgroundColor: 'rgba(255, 87, 51, 0.2)',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Dias de Junho'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Pressão Arterial (mmHg)'
                },
                beginAtZero: false
            }
        }
    }
});
