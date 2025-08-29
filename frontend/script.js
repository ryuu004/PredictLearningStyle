// --- Modal Elements ---
const modal = document.getElementById('editModal');
const editDataButton = document.getElementById('editDataButton');
const closeButton = document.querySelector('.close-button');
const saveChangesButton = document.getElementById('saveChangesButton');
const resetDataButton = document.getElementById('resetDataButton');

// --- Tab Elements ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// --- Event Listeners ---
editDataButton.addEventListener('click', openModal);
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        closeModal();
    }
});
saveChangesButton.addEventListener('click', () => {
    sendPredictionRequest();
    closeModal();
});

// Add reset button functionality
if (resetDataButton) {
    resetDataButton.addEventListener('click', resetToDefaults);
}

// Tab functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
});

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
let treeVotesChart = null;
let featureRadarChart = null;
let currentFeaturesChart = null; // Original combined chart variable
let learningMaterialUsageChart = null;
let performanceActivityChart = null;
let learningFocusChart = null;

// --- New global variable to hold the tree data ---
let allTreeData = [];

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

const featureCategories = {
    'T_image': 'Learning material usage',
    'T_video': 'Learning material usage',
    'T_read': 'Learning material usage',
    'T_audio': 'Learning material usage',
    'T_hierarchies': 'Learning material usage',
    'T_powerpoint': 'Learning material usage',
    'T_concrete': 'Learning material usage',
    'T_result': 'Learning material usage',
    'N_standard_questions_correct': 'Performance & activity',
    'N_msgs_posted': 'Performance & activity',
    'T_solve_excercise': 'Performance & activity',
    'N_group_discussions': 'Performance & activity',
    'Skipped_los': 'Performance & activity',
    'N_next_button_used': 'Performance & activity',
    'T_spent_in_session': 'Performance & activity',
    'N_questions_on_details': 'Learning focus',
    'N_questions_on_outlines': 'Learning focus'
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

// Helper function for normalization
function normalizeValue(featureId, value) {
    const range = featureRanges[featureId];
    if (!range) return value; // Return original value if no range is defined

    const normalized = (value - range.min) / (range.max - range.min);
    return Math.max(0, Math.min(1, normalized)) * 100; // Normalize to 0-100 scale
}

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
        displayPredictionResult(result);
        
        // --- New: Fetch and display tree votes ---
        fetchTreeVotes(inputData);
        renderCurrentFeaturesCharts(); // Update current features charts after prediction

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function createOrUpdateChart(chartInstance, canvasId, chartType, data, options) {
    const chartContainer = document.getElementById(canvasId).parentNode;
    let canvas = document.getElementById(canvasId);

    if (chartInstance instanceof Chart) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (canvas) {
        canvas.remove();
    }
    canvas = document.createElement('canvas');
    canvas.id = canvasId;
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: chartType,
        data: data,
        options: options
    });
    return chartInstance;
}

function getFeatureDataForCategory(categoryName) {
    return featureInputIds.filter(id => featureCategories[id] === categoryName).map(id => ({
        id: id,
        label: document.querySelector(`label[for=${id}]`).textContent.split(':')[0].trim(),
        value: parseFloat(document.getElementById(id).value) || 0
    }));
}

function getChartOptions(title, categoryColor, categoryBorderColor, isTimeBased) {
    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        let value = context.raw;
                        const featureId = context.label; // In this setup, label is the feature name

                        // Find the original feature ID to check for time-based or percentage
                        const originalFeature = featureInputIds.find(id => document.querySelector(`label[for=${id}]`).textContent.split(':')[0].trim() === featureId);

                        if (originalFeature && (originalFeature.startsWith('T_') || originalFeature === 'T_spent_in_session' || originalFeature === 'T_solve_excercise')) {
                            value += 's'; // Append 's' for time-based features
                        } else if (originalFeature && originalFeature === 'N_standard_questions_correct') {
                            value += '%'; // Append '%' for percentage
                        }
                        return label + value;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: isTimeBased,
                    text: 'Time (seconds)'
                },
                ticks: {
                    callback: function(value) {
                        return isTimeBased ? value + 's' : value;
                    }
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    };
}

function renderLearningMaterialUsageChart() {
    const features = getFeatureDataForCategory('Learning material usage');
    const chartLabels = features.map(f => f.label);
    const chartData = features.map(f => f.value);

    learningMaterialUsageChart = createOrUpdateChart(
        learningMaterialUsageChart,
        'learningMaterialUsageChart',
        'bar',
        {
            labels: chartLabels,
            datasets: [{
                label: 'Learning Material Usage',
                data: chartData,
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        getChartOptions('Learning Material Usage', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 99, 132, 1)', true)
    );
}

function renderPerformanceActivityChart() {
    const features = getFeatureDataForCategory('Performance & activity');
    const chartLabels = features.map(f => f.label);
    const chartData = features.map(f => f.value);

    performanceActivityChart = createOrUpdateChart(
        performanceActivityChart,
        'performanceActivityChart',
        'bar',
        {
            labels: chartLabels,
            datasets: [{
                label: 'Performance & Activity',
                data: chartData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        getChartOptions('Performance & Activity', 'rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 1)', false) // Some performance metrics might be time-based, some not. Check individual feature.
    );
}

function renderLearningFocusChart() {
    const features = getFeatureDataForCategory('Learning focus');
    const chartLabels = features.map(f => f.label);
    const chartData = features.map(f => f.value);

    learningFocusChart = createOrUpdateChart(
        learningFocusChart,
        'learningFocusChart',
        'bar',
        {
            labels: chartLabels,
            datasets: [{
                label: 'Learning Focus',
                data: chartData,
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        getChartOptions('Learning Focus', 'rgba(255, 206, 86, 0.7)', 'rgba(255, 206, 86, 1)', false) // Some learning focus metrics might be time-based, some not.
    );
}

// This function will now dispatch to the new individual chart rendering functions
function renderCurrentFeaturesCharts() {
    renderLearningMaterialUsageChart();
    renderPerformanceActivityChart();
    renderLearningFocusChart();
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
    renderCurrentFeaturesCharts(); // Update current features charts after generating random data
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
// --- New functions for tree visualization ---

// Fetches the tree structure data on page load
async function fetchTreeStructureData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/tree-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allTreeData = await response.json();
        populateTreeSelector();
        // Render the first tree by default
        if (allTreeData.length > 0) {
            renderTree(0);
        }
    } catch (error) {
        console.error('Could not fetch tree structure data:', error);
        showError('Could not load tree visualization data from the backend.');
    }
}

// Populates the dropdown with tree options
function populateTreeSelector() {
    const selector = document.getElementById('treeSelector');
    selector.innerHTML = ''; // Clear existing options
    allTreeData.forEach(tree => {
        const option = document.createElement('option');
        option.value = tree.tree_index;
        option.textContent = `Tree #${tree.tree_index + 1}`;
        selector.appendChild(option);
    });
}

// Converts the JSON tree structure to a Mermaid flowchart string
function jsonToMermaid(node, parentId = 'n0') {
    let mermaidString = '';
    const nodeId = parentId;

    if (!node.children) { // Leaf node
        // Mermaid syntax: node_id["display text"]
        mermaidString += `${nodeId}["${node.name.replace(/"/g, '#quot;')}"]\n`;
        return mermaidString;
    }

    // Decision node
    mermaidString += `${nodeId}("${node.name.replace(/"/g, '#quot;')}")\n`;
    
    // Define children nodes
    const leftChildId = `${nodeId}_L`;
    const rightChildId = `${nodeId}_R`;

    // Create links with labels
    mermaidString += `${nodeId} -- "True" --> ${leftChildId}\n`;
    mermaidString += `${nodeId} -- "False" --> ${rightChildId}\n`;

    // Recurse for children
    mermaidString += jsonToMermaid(node.children[0], leftChildId);
    mermaidString += jsonToMermaid(node.children[1], rightChildId);

    return mermaidString;
}

// Renders the selected tree using Mermaid.js
function renderTree(treeIndex) {
    const treeData = allTreeData.find(t => t.tree_index === treeIndex);
    if (!treeData) return;

    const mermaidContainer = document.getElementById('tree-chart-container');
    const mermaidDefinition = "graph TD\n" + jsonToMermaid(treeData.structure);
    
    mermaidContainer.textContent = mermaidDefinition;
    mermaidContainer.removeAttribute('data-processed'); // Allow Mermaid to re-render
    
    // Initialize or re-render the Mermaid chart
    mermaid.init(undefined, mermaidContainer);
}

// Fetches the individual tree votes for a given prediction
async function fetchTreeVotes(inputData) {
    try {
        const response = await fetch('http://127.0.0.1:5000/predict-all-trees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        renderTreeVotesChart(result.tree_votes);
    } catch (error) {
        console.error('Could not fetch tree votes:', error);
    }
}

// Renders the bar chart showing how each tree voted
function renderTreeVotesChart(votes) {
    const ctx = document.getElementById('treeVotesChart').getContext('2d');
    
    const voteCounts = votes.reduce((acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(voteCounts);
    const data = Object.values(voteCounts);

    if (treeVotesChart) {
        treeVotesChart.destroy();
    }

    treeVotesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Votes',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // Ensure y-axis has integer steps
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// --- Modal Functions ---
function openModal() {
    modal.style.display = 'block';
    renderFeatureRadarChart(); // Update the radar chart when the modal is opened
}

function closeModal() {
    modal.style.display = 'none';
}

function renderFeatureRadarChart() {
    const ctx = document.getElementById('featureRadarChart').getContext('2d');
    const labels = featureInputIds.map(id => {
        const labelElement = document.querySelector(`label[for=${id}]`);
        // Get the full label text, including units if present
        return labelElement ? labelElement.textContent.trim() : id;
    });

    const data = featureInputIds.map(id => {
        const value = parseFloat(document.getElementById(id).value);
        return isNaN(value) ? 0 : value;
    });

    if (featureRadarChart) {
        featureRadarChart.destroy();
    }

    featureRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Student Features',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const featureId = featureInputIds[context.dataIndex];
                            let value = context.raw;

                            if (featureId.startsWith('T_') || featureId === 'T_spent_in_session' || featureId === 'T_solve_excercise') {
                                value += 's'; // Append 's' for time-based features
                            } else if (featureId === 'N_standard_questions_correct') {
                                value += '%'; // Append '%' for percentage
                            }
                            return label + value;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true, // Show angle lines for better structure
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)' // Light grid lines
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        },
                        color: '#333' // Color for feature labels
                    },
                    suggestedMin: 0,
                    // You might want to dynamically set max based on feature type or global max
                    // For now, let Chart.js determine a reasonable max
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {
                            const featureId = featureInputIds[this.tickLabels.indexOf(this.label)];
                            if (featureId.startsWith('T_') || featureId === 'T_spent_in_session' || featureId === 'T_solve_excercise') {
                                return value + 's';
                            } else if (featureId === 'N_standard_questions_correct') {
                                return value + '%';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}


// --- Event Listeners ---

// Add event listeners to input fields to update radar chart dynamically
featureInputIds.forEach(id => {
    const inputElement = document.getElementById(id);
    if (inputElement) {
        inputElement.addEventListener('input', renderFeatureRadarChart);
    }
});

// Initial chart rendering on page load
document.addEventListener('DOMContentLoaded', () => {
    mermaid.initialize({ startOnLoad: true });
    fetchChartData();
    fetchTreeStructureData(); // Fetch tree data on load
    renderCurrentFeaturesCharts(); // Initial render of current features charts
});

// Event listener for the tree selector dropdown
document.getElementById('treeSelector').addEventListener('change', (event) => {
    const selectedTreeIndex = parseInt(event.target.value, 10);
    renderTree(selectedTreeIndex);
});


function loadSampleData(style) {
    const data = sampleData[style];
    if (data) {
        for (const id of featureInputIds) {
            document.getElementById(id).value = data[id];
        }
    }
    document.getElementById('learningStyleResult').textContent = 'N/A'; // Reset prediction result
    document.getElementById('errorMessage').style.display = 'none'; // Clear any previous error
    renderCurrentFeaturesCharts(); // Update current features charts after loading sample data
}

// --- Enhanced UI Functions ---

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Reset to default values
function resetToDefaults() {
    const defaultValues = {
        'T_image': 7,
        'T_video': 10,
        'T_read': 11,
        'T_audio': 8,
        'T_hierarchies': 5,
        'T_powerpoint': 4,
        'T_concrete': 5,
        'T_result': 6,
        'N_standard_questions_correct': 60,
        'N_msgs_posted': 120,
        'T_solve_excercise': 9,
        'N_group_discussions': 10,
        'Skipped_los': 5,
        'N_next_button_used': 150,
        'T_spent_in_session': 18,
        'N_questions_on_details': 80,
        'N_questions_on_outlines': 70
    };
    
    for (const [id, value] of Object.entries(defaultValues)) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }
    
    // Update charts and clear results
    renderCurrentFeaturesCharts();
    renderFeatureRadarChart();
    document.getElementById('learningStyleResult').innerHTML = '<span class="result-label">Ready to analyze</span>';
    document.getElementById('resultDescription').innerHTML = '<p>Load data and click analyze to see your learning style prediction.</p>';
    hideResultRecommendations();
}

// Enhanced result display with recommendations
function displayPredictionResult(result) {
    const resultElement = document.getElementById('learningStyleResult');
    const descriptionElement = document.getElementById('resultDescription');
    
    resultElement.innerHTML = result.learning_style;
    
    // Add confidence indicator
    updateConfidenceIndicator(85); // Mock confidence for now
    
    // Show recommendations based on learning style
    showRecommendations(result.learning_style);
    
    // Update description
    const descriptions = {
        'Visual Learner': 'You learn best through visual aids like charts, diagrams, and images. Visual learners prefer to see information presented graphically.',
        'Auditory Learner': 'You learn best through listening and verbal instruction. Auditory learners benefit from discussions and spoken explanations.',
        'Read/Write Learner': 'You learn best through reading and writing activities. You prefer text-based information and note-taking.',
        'Kinesthetic Learner': 'You learn best through hands-on activities and physical engagement. You prefer learning by doing and experiencing.'
    };
    
    descriptionElement.innerHTML = `<p>${descriptions[result.learning_style] || 'Learning style identified successfully.'}</p>`;
}

// Update confidence indicator
function updateConfidenceIndicator(confidence) {
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');
    
    if (confidenceFill && confidenceValue) {
        confidenceFill.style.width = `${confidence}%`;
        confidenceValue.textContent = `${confidence}%`;
    }
}

// Show learning style recommendations
function showRecommendations(learningStyle) {
    const recommendationsElement = document.getElementById('resultRecommendations');
    const recommendationsList = document.getElementById('recommendationsList');
    
    const recommendations = {
        'Visual Learner': [
            'Use mind maps and flowcharts to organize information',
            'Incorporate videos and visual presentations in learning',
            'Create colorful notes with highlighting and diagrams',
            'Use flashcards with images and visual cues'
        ],
        'Auditory Learner': [
            'Participate in group discussions and study groups',
            'Listen to educational podcasts and audio materials',
            'Read aloud or use text-to-speech software',
            'Explain concepts verbally to reinforce learning'
        ],
        'Read/Write Learner': [
            'Take detailed written notes during lessons',
            'Create written summaries and outlines',
            'Use lists, bullet points, and structured formats',
            'Engage in writing exercises and journaling'
        ],
        'Kinesthetic Learner': [
            'Use hands-on activities and experiments',
            'Take frequent breaks and incorporate movement',
            'Use physical objects and manipulatives',
            'Apply learning through real-world projects'
        ]
    };
    
    if (recommendations[learningStyle] && recommendationsList) {
        recommendationsList.innerHTML = recommendations[learningStyle]
            .map(rec => `<li>${rec}</li>`)
            .join('');
        recommendationsElement.style.display = 'block';
    }
}

// Hide recommendations
function hideResultRecommendations() {
    const recommendationsElement = document.getElementById('resultRecommendations');
    if (recommendationsElement) {
        recommendationsElement.style.display = 'none';
    }
}

// Enhanced loading indicator
function showLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    
    // Disable all interactive elements
    document.getElementById('predictButton').disabled = true;
    document.getElementById('generateRandomButton').disabled = true;
    document.getElementById('loadVisualData').disabled = true;
    document.getElementById('loadAuditoryData').disabled = true;
    document.getElementById('loadReadWriteData').disabled = true;
    document.getElementById('loadKinestheticData').disabled = true;
    
    // Update result display
    const resultElement = document.getElementById('learningStyleResult');
    resultElement.innerHTML = '<span class="result-label">Analyzing...</span>';
    
    // Hide recommendations and clear error
    hideResultRecommendations();
    document.getElementById('errorMessage').style.display = 'none';
}

// Enhanced hide loading
function hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    // Re-enable all interactive elements
    document.getElementById('predictButton').disabled = false;
    document.getElementById('generateRandomButton').disabled = false;
    document.getElementById('loadVisualData').disabled = false;
    document.getElementById('loadAuditoryData').disabled = false;
    document.getElementById('loadReadWriteData').disabled = false;
    document.getElementById('loadKinestheticData').disabled = false;
}