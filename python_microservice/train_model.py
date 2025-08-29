import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import json
from imblearn.over_sampling import RandomOverSampler

def export_tree_structure(model, feature_names, class_names, max_depth=3):
    """Exports the structure of all trees in a Random Forest model to a list of dictionaries."""
    tree_structures = []
    for i, estimator in enumerate(model.estimators_):
        tree = estimator.tree_
        
        def recurse(node_id, depth):
            # Stop if max depth is reached or it's a leaf node
            if depth >= max_depth or tree.feature[node_id] == -2:
                class_counts = tree.value[node_id][0]
                majority_class_index = class_counts.argmax()
                class_name = class_names.get(majority_class_index, f"Class {majority_class_index}")
                # Indicate if this is a truncated branch
                node_text = f"{class_name}\\n(n={int(sum(class_counts))})"
                if depth >= max_depth and tree.feature[node_id] != -2:
                    node_text += "\\n(...)" # Add ellipsis to show it's truncated
                return {"name": node_text}

            feature_name = feature_names[tree.feature[node_id]]
            threshold = round(tree.threshold[node_id], 2)
            
            node_name = f"{feature_name} <= {threshold}"
            
            left_child = recurse(tree.children_left[node_id], depth + 1)
            right_child = recurse(tree.children_right[node_id], depth + 1)
            
            return {"name": node_name, "children": [left_child, right_child]}

        tree_structures.append({"tree_index": i, "structure": recurse(0, 0)})
    return tree_structures

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

    # --- New: Export tree structures to JSON ---
    print("Exporting tree structures to JSON...")
    class_names_map = {
        0: "Visual",
        1: "Auditory",
        2: "Read/Write",
        3: "Kinesthetic"
    }
    # Export with a max depth of 3 for readability
    tree_data = export_tree_structure(model, feature_columns, class_names_map, max_depth=3)
    
    try:
        with open('python_microservice/random_forest_trees.json', 'w') as f:
            json.dump(tree_data, f, indent=2)
        print("Tree structures saved to python_microservice/random_forest_trees.json")
    except Exception as e:
        print(f"Error saving tree structures: {e}")

if __name__ == '__main__':
    print("Training Random Forest model...")
    train_and_save_model()