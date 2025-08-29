# File: backend/analyze.py
import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

def get_style_distribution():
    try:
        df = pd.read_csv('python_microservice/data_fs1.csv')
        distribution = df['learning_style'].value_counts()
        
        learning_style_mapping = {
            0: "Visual",
            1: "Auditory",
            2: "Read/Write",
            3: "Kinesthetic",
        }

        # Sort by index to ensure consistent order
        distribution = distribution.sort_index()

        return {
            "labels": [learning_style_mapping.get(i, "Unknown") for i in distribution.index],
            "values": distribution.tolist()
        }
    except FileNotFoundError:
        return {"error": "Dataset not found."}
    except Exception as e:
        return {"error": str(e)}

def get_feature_importance():
    try:
        model = joblib.load('random_forest_model.joblib')
        
        feature_columns = [
            'T_image', 'T_video', 'T_read', 'T_audio', 'T_hierarchies', 'T_powerpoint',
            'T_concrete', 'T_result', 'N_standard_questions_correct', 'N_msgs_posted',
            'T_solve_excercise', 'N_group_discussions', 'Skipped_los', 'N_next_button_used',
            'T_spent_in_session', 'N_questions_on_details', 'N_questions_on_outlines'
        ]

        importance = model.feature_importances_
        # Create a mapping of feature names to their importance scores
        feature_importance = sorted(zip(feature_columns, importance), key=lambda x: x[1], reverse=True)

        # Limit to the top 10 features to prevent the chart from being too long
        top_10_features = feature_importance[:10]

        return {
            "features": [f[0] for f in top_10_features],
            "importance": [f[1] for f in top_10_features]
        }
    except FileNotFoundError:
        return {"error": "Model not found."}
    except Exception as e:
        return {"error": str(e)}

def get_model_performance():
    try:
        df = pd.read_csv('python_microservice/data_fs1.csv')
        model = joblib.load('random_forest_model.joblib')

        feature_columns = [
            'T_image', 'T_video', 'T_read', 'T_audio', 'T_hierarchies', 'T_powerpoint',
            'T_concrete', 'T_result', 'N_standard_questions_correct', 'N_msgs_posted',
            'T_solve_excercise', 'N_group_discussions', 'Skipped_los', 'N_next_button_used',
            'T_spent_in_session', 'N_questions_on_details', 'N_questions_on_outlines'
        ]
        
        X = df[feature_columns]
        y = df['learning_style']

        # Simple train-test split for consistent evaluation
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        y_pred = model.predict(X_test)
        
        # Return scores as percentages
        return {
            "accuracy": accuracy_score(y_test, y_pred) * 100,
            "precision": precision_score(y_test, y_pred, average='macro') * 100,
            "recall": recall_score(y_test, y_pred, average='macro') * 100
        }
    except FileNotFoundError:
        return {"error": "Dataset or model not found."}
    except Exception as e:
        return {"error": str(e)}

def get_all_chart_data():
    return {
        "style_distribution": get_style_distribution(),
        "feature_importance": get_feature_importance(),
        "model_performance": get_model_performance()
    }