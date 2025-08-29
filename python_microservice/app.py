# File: backend/app.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib # For saving and loading the model
from imblearn.over_sampling import RandomOverSampler # Add this import
import analyze
import json

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

model = None
feature_columns = None
learning_style_mapping = {
    0: "Visual Learner",
    1: "Auditory Learner",
    2: "Read/Write Learner",
    3: "Kinesthetic Learner",
    # Add more mappings if your 'learning_style' column has more unique values
}

@app.route('/chart-data', methods=['GET'])
def chart_data():
    """Endpoint to provide data for the frontend charts."""
    return jsonify(analyze.get_all_chart_data())

@app.route('/tree-data', methods=['GET'])
def tree_data():
    """Endpoint to provide the exported decision tree structures."""
    try:
        with open('python_microservice/random_forest_trees.json', 'r') as f:
            trees = json.load(f)
        return jsonify(trees)
    except FileNotFoundError:
        return jsonify({"error": "Tree data not found. Please train the model first."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def load_model():
    global model, feature_columns
    try:
        model = joblib.load('random_forest_model.joblib')
        # Assuming feature_columns are saved or can be derived.
        # In a real application, you'd save/load these alongside the model.
        feature_columns = [
            'T_image', 'T_video', 'T_read', 'T_audio', 'T_hierarchies', 'T_powerpoint',
            'T_concrete', 'T_result', 'N_standard_questions_correct', 'N_msgs_posted',
            'T_solve_excercise', 'N_group_discussions', 'Skipped_los', 'N_next_button_used',
            'T_spent_in_session', 'N_questions_on_details', 'N_questions_on_outlines'
        ]
        print("Model loaded successfully.")
    except FileNotFoundError:
        print("Error: random_forest_model.joblib not found. Please train the model first.")
        model = None
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or feature_columns is None:
        return jsonify({'error': 'Model not trained. Please start the server to train the model.'}), 500

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Prepare input for prediction
    try:
        input_df = pd.DataFrame([data])
        # Ensure all expected feature columns are present, fill missing with 0 or a reasonable default
        for col in feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0 # Or a more appropriate default/imputation
        input_df = input_df[feature_columns] # Ensure column order matches training
        input_df = input_df.apply(pd.to_numeric, errors='coerce').fillna(0) # Convert to numeric and fill any new NaNs
    except Exception as e:
        return jsonify({'error': f'Invalid input data format: {str(e)}'}), 400

    # Make prediction
    try:
        prediction_numeric = model.predict(input_df)[0]
        predicted_style = learning_style_mapping.get(prediction_numeric, "Unknown Learning Style")
        return jsonify({'learning_style': predicted_style, 'raw_prediction': int(prediction_numeric)}), 200
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/predict-all-trees', methods=['POST'])
def predict_all_trees():
    """Endpoint to get the prediction from each individual tree in the forest."""
    if model is None:
        return jsonify({'error': 'Model not trained.'}), 500

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        input_df = pd.DataFrame([data])
        # Data preparation (same as in /predict)
        for col in feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[feature_columns]
        input_df = input_df.apply(pd.to_numeric, errors='coerce').fillna(0)
    except Exception as e:
        return jsonify({'error': f'Invalid input data format: {str(e)}'}), 400

    try:
        # Get prediction from each tree
        predictions = [estimator.predict(input_df)[0] for estimator in model.estimators_]
        # Map numeric predictions to string labels
        labeled_predictions = [learning_style_mapping.get(int(p), "Unknown") for p in predictions]
        return jsonify({'tree_votes': labeled_predictions})
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/')
def index():
    return "Learning Style ML Backend is running!"

if __name__ == '__main__':
    print("Loading Random Forest model...")
    load_model()
    app.run(debug=True, port=5000) # Run Flask app on port 5000