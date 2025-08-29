document.getElementById('predictButton').addEventListener('click', sendPredictionRequest);
document.getElementById('generateRandomButton').addEventListener('click', generateRandomData);

// Add event listeners for new style-specific buttons
document.getElementById('loadVisualData').addEventListener('click', () => loadSampleData('visual'));
document.getElementById('loadAuditoryData').addEventListener('click', () => loadSampleData('auditory'));
document.getElementById('loadReadWriteData').addEventListener('click', () => loadSampleData('readwrite'));
document.getElementById('loadKinestheticData').addEventListener('click', () => loadSampleData('kinesthetic'));

let styleDistributionChart = null;
let featureImportanceChart = null;
let modelPerformanceChart = null;

const featureInputIds = [
    'T_image', 'T_video', 'T_read', 'T_audio', 'T_hierarchies', 'T_powerpoint',
    'T_concrete', 'T_result', 'N_standard_questions_correct', 'N_msgs_posted',
    'T_solve_excercise', 'N_group_discussions', 'Skipped_los', 'N_next_button_used',
    'T_spent_in_session', 'N_questions_on_details', 'N_questions_on_outlines'
];

const featureGroups = {
    'Visual': ['T_image', 'T_video', 'T_powerpoint', 'N_questions_on_outlines'],
    'Auditory': ['T_audio', 'N_msgs_posted', 'N_group_discussions'],
    'Read/Write': ['T_read', 'T_hierarchies', 'N_questions_on_details', 'N_standard_questions_correct'],
    'Kinesthetic': ['T_concrete', 'T_result', 'T_solve_excercise', 'Skipped_los', 'N_next_button_used', 'T_spent_in_session']
};

// Define approximate ranges for random data generation based on actual data_fs1.csv
const featureRanges = {
    'T_image': { min: 5.0, max: 10.0 },
    'T_video': { min: 5.0, max: 15.0 },
    'T_read': { min: 5.0, max: 15.0 },
    'T_audio': { min: 5.0, max: 10.0 },
    'T_hierarchies': { min: 2.0, max: 7.0 },
    'T_powerpoint': { min: 2.0, max: 7.0 },
    'T_concrete': { min: 2.0, max: 8.0 },
    'T_result': { min: 4.0, max: 8.0 },
    'N_standard_questions_correct': { min: 15.0, max: 100.0 },
    'N_msgs_posted': { min: 25.5, max: 250.0 },
    'T_solve_excercise': { min: 6.0, max: 12.0 },
    'N_group_discussions': { min: 5.0, max: 15.0 },
    'Skipped_los': { min: 0.0, max: 15.0 },
    'N_next_button_used': { min: 25.5, max: 250.0 },
    'T_spent_in_session': { min: 10.0, max: 25.0 },
    'N_questions_on_details': { min: 25.0, max: 150.0 },
    'N_questions_on_outlines': { min: 25.0, max: 150.0 }
};

// Sample data for each learning style, derived from data_fs1.csv
const sampleData = {
    'visual': { // Corresponds to learning_style 0
        'T_image': 5.5, 'T_video': 12.5, 'T_read': 10.5, 'T_audio': 8.5,
        'T_hierarchies': 6.5, 'T_powerpoint': 5.5, 'T_concrete': 3.0, 'T_result': 5.5,
        'N_standard_questions_correct': 27.0, 'N_msgs_posted': 106.0,
        'T_solve_excercise': 10.0, 'N_group_discussions': 8.5, 'Skipped_los': 3.5,
        'N_next_button_used': 232.5, 'T_spent_in_session': 20.0,
        'N_questions_on_details': 77.0, 'N_questions_on_outlines': 56.5
    },
    'auditory': { // Corresponds to learning_style 1
        'T_image': 5.5, 'T_video': 8.5, 'T_read': 6.0, 'T_audio': 8.0,
        'T_hierarchies': 2.5, 'T_powerpoint': 4.5, 'T_concrete': 7.5, 'T_result': 7.0,
        'N_standard_questions_correct': 82.5, 'N_msgs_posted': 168.0,
        'T_solve_excercise': 7.0, 'N_group_discussions': 10.0, 'Skipped_los': 4.0,
        'N_next_button_used': 215.5, 'T_spent_in_session': 10.0,
        'N_questions_on_details': 34.0, 'N_questions_on_outlines': 60.0
    },
    'readwrite': { // Corresponds to learning_style 2
        'T_image': 5.5, 'T_video': 5.0, 'T_read': 5.0, 'T_audio': 6.0,
        'T_hierarchies': 4.5, 'T_powerpoint': 3.0, 'T_concrete': 4.0, 'T_result': 7.5,
        'N_standard_questions_correct': 74.0, 'N_msgs_posted': 175.0,
        'T_solve_excercise': 10.0, 'N_group_discussions': 10.5, 'Skipped_los': 0.5,
        'N_next_button_used': 197.5, 'T_spent_in_session': 16.5,
        'N_questions_on_details': 44.0, 'N_questions_on_outlines': 111.0
    },
    'kinesthetic': { // Corresponds to learning_style 3
        'T_image': 5.5, 'T_video': 9.0, 'T_read': 5.5, 'T_audio': 7.5,
        'T_hierarchies': 2.5, 'T_powerpoint': 3.5, 'T_concrete': 5.5, 'T_result': 7.0,
        'N_standard_questions_correct': 47.5, 'N_msgs_posted': 61.0,
        'T_solve_excercise': 6.5, 'N_group_discussions': 11.5, 'Skipped_los': 2.5,
        'N_next_button_used': 31.0, 'T_spent_in_session': 19.5,
        'N_questions_on_details': 127.5, 'N_questions_on_outlines': 85.0
    }
};

function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('predictButton').disabled = true;
    document.getElementById('generateRandomButton').disabled = true; // Disable random button too
    // Disable style-specific buttons too
    document.getElementById('loadVisualData').disabled = true;
    document.getElementById('loadAuditoryData').disabled = true;
    document.getElementById('loadReadWriteData').disabled = true;
    document.getElementById('loadKinestheticData').disabled = true;
    document.getElementById('learningStyleResult').textContent = 'Predicting...';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('errorMessage').textContent = '';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('predictButton').disabled = false;
    document.getElementById('generateRandomButton').disabled = false; // Enable random button
    // Enable style-specific buttons
    document.getElementById('loadVisualData').disabled = false;
    document.getElementById('loadAuditoryData').disabled = false;
    document.getElementById('loadReadWriteData').disabled = false;
    document.getElementById('loadKinestheticData').disabled = false;
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = `Error: ${message}`;
    errorElement.style.display = 'block';
    document.getElementById('learningStyleResult').textContent = 'Prediction Failed';
}

async function sendPredictionRequest() {
    showLoading();

    const inputData = {};
    for (const id of featureInputIds) {
        const value = parseFloat(document.getElementById(id).value);
        if (isNaN(value)) {
            showError(`Invalid input for ${id}. Please enter a number.`);
            hideLoading();
            return;
        }
        inputData[id] = value;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById('learningStyleResult').textContent = result.learning_style;
        // The chart update is now handled by a separate function
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function generateRandomData() {
    // New, fairer approach: Pick a random style and generate data based on its profile
    const styles = Object.keys(sampleData); // ['visual', 'auditory', 'readwrite', 'kinesthetic']
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    const baseData = sampleData[randomStyle];

    // Load the base data and add some noise for variety
    for (const id of featureInputIds) {
        const baseValue = baseData[id];
        // Add a small random variance (+/- 10% of the base value)
        const noise = (Math.random() - 0.5) * (baseValue * 0.2);
        const finalValue = Math.max(0, baseValue + noise); // Ensure value is not negative
        document.getElementById(id).value = finalValue.toFixed(1);
    }

    document.getElementById('learningStyleResult').textContent = 'N/A'; // Reset prediction result
    document.getElementById('errorMessage').style.display = 'none'; // Clear any previous error
}

async function fetchChartData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/chart-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateCharts(data);
    } catch (error) {
        console.error('Could not fetch chart data:', error);
        showError('Could not load chart data from the backend.');
    }
}

function updateCharts(data) {
    if (data.style_distribution) {
        renderStyleDistributionChart(data.style_distribution);
    }
    if (data.feature_importance) {
        renderFeatureImportanceChart(data.feature_importance);
    }
    if (data.model_performance) {
        renderModelPerformanceChart(data.model_performance);
    }
}

function renderStyleDistributionChart(distributionData) {
    const ctx = document.getElementById('styleDistributionChart').getContext('2d');
    if (styleDistributionChart) {
        styleDistributionChart.destroy();
    }
    styleDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: distributionData.labels,
            datasets: [{
                label: 'Learning Style Distribution',
                data: distributionData.values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function renderFeatureImportanceChart(importanceData) {
    const canvas = document.getElementById('featureImportanceChart');
    const ctx = canvas.getContext('2d');
    
    // Dynamically adjust canvas height based on the number of features
    const barHeight = 30; // Height per bar
    const padding = 50;  // Extra padding for top/bottom
    canvas.height = (importanceData.features.length * barHeight) + padding;

    if (featureImportanceChart) {
        featureImportanceChart.destroy();
    }

    featureImportanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: importanceData.features,
            datasets: [{
                label: 'Feature Importance',
                data: importanceData.importance,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false, // Important for the container to control the size
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        autoSkip: false // Ensure all labels are shown
                    }
                }
            }
        }
    });
}

function renderModelPerformanceChart(performanceData) {
    const ctx = document.getElementById('modelPerformanceChart').getContext('2d');
    if (modelPerformanceChart) {
        modelPerformanceChart.destroy();
    }
    modelPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Accuracy', 'Precision', 'Recall'],
            datasets: [{
                label: 'Model Performance',
                data: [performanceData.accuracy, performanceData.precision, performanceData.recall],
                backgroundColor: [
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100, // Y-axis should go up to 100%
                    ticks: {
                        // Include a percentage sign in the ticks
                        callback: function(value) {
                            return value + '%'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Initial chart rendering on page load
document.addEventListener('DOMContentLoaded', fetchChartData);

function loadSampleData(style) {
    const data = sampleData[style];
    if (data) {
        for (const id of featureInputIds) {
            document.getElementById(id).value = data[id];
        }
    }
    document.getElementById('learningStyleResult').textContent = 'N/A'; // Reset prediction result
    document.getElementById('errorMessage').style.display = 'none'; // Clear any previous error
    // The chart update is now handled by a separate function
}