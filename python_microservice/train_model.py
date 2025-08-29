import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
from imblearn.over_sampling import RandomOverSampler

def train_and_save_model():
    # Load the dataset
    try:
        df = pd.read_csv('python_microservice/data_fs1.csv')
    except FileNotFoundError:
        print("Error: data_fs1.csv not found. Please ensure it's in the python_microservice directory.")
        return

    feature_columns = [
        'T_image', 'T_video', 'T_read', 'T_audio', 'T_hierarchies', 'T_powerpoint',
        'T_concrete', 'T_result', 'N_standard_questions_correct', 'N_msgs_posted',
        'T_solve_excercise', 'N_group_discussions', 'Skipped_los', 'N_next_button_used',
        'T_spent_in_session', 'N_questions_on_details', 'N_questions_on_outlines'
    ]
    X = df[feature_columns]
    y = df['learning_style']

    X = X.apply(pd.to_numeric, errors='coerce')
    y = y.apply(pd.to_numeric, errors='coerce')
    combined = pd.concat([X, y], axis=1).dropna()
    X = combined[feature_columns]
    y = combined['learning_style']

    if X.empty or y.empty:
        print("Error: Data is empty after preprocessing. Cannot train model.")
        return
    
    ros = RandomOverSampler(random_state=42)
    X_resampled, y_resampled = ros.fit_resample(X, y)
    
    print("Distribution of learning styles after oversampling:")
    print(pd.Series(y_resampled).value_counts())
    print("\nPercentage distribution after oversampling:")
    print(pd.Series(y_resampled).value_counts(normalize=True) * 100)

    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained with accuracy: {accuracy:.2f}")

    joblib.dump(model, 'random_forest_model.joblib')
    print("Model saved as random_forest_model.joblib")

if __name__ == '__main__':
    print("Training Random Forest model...")
    train_and_save_model()