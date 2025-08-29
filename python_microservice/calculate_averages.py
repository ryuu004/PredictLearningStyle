import pandas as pd

def calculate_style_averages():
    """
    Loads the dataset, groups by learning style, and calculates the mean
    for each feature.
    """
    try:
        # Load the dataset
        df = pd.read_csv('python_microservice/data_fs1.csv')
    except FileNotFoundError:
        print("Error: data_fs1.csv not found. Please ensure it's in the python_microservice directory.")
        return

    # Define the mapping for learning styles for better readability
    learning_style_mapping = {
        0: "Visual",
        1: "Auditory",
        2: "Read/Write",
        3: "Kinesthetic",
    }

    # Group by 'learning_style' and calculate the mean for all feature columns
    # The .T transposes the result for a more readable format (features as rows)
    average_by_style = df.groupby('learning_style').mean().T

    print("--- Average Feature Values per Learning Style ---")
    
    # Print the results in a formatted way
    for style_code, style_name in learning_style_mapping.items():
        print(f"\n--- {style_name} (Style {style_code}) ---")
        if style_code in average_by_style.columns:
            # Print each feature and its average value, formatted to 2 decimal places
            print(average_by_style[style_code].to_string(float_format="%.2f"))
        else:
            print(f"No data found for learning style {style_code}.")
            
    print("\n--- End of Analysis ---")


if __name__ == '__main__':
    calculate_style_averages()