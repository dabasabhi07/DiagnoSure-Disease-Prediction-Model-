from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from difflib import get_close_matches

app = Flask(__name__)
CORS(app)

# Load model
model = pickle.load(open("disease_prediction_model.sav", "rb"))

# Load training data
df = pd.read_csv("training.csv", encoding="latin-1")

# Normalize CSV columns
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace("\"", "", regex=False)
    .str.replace(",", "", regex=False)
    .str.replace("(", "", regex=False)
    .str.replace(")", "", regex=False)
    .str.replace("’", "", regex=False)
    .str.replace("'", "", regex=False)
    .str.replace(" ", "_")
)

target_col = "prognosis"
symptom_columns = df.drop(columns=[target_col]).columns.tolist()


def map_symptom(user_symptom):
    user_symptom = user_symptom.lower().replace(" ", "_")
    match = get_close_matches(user_symptom, symptom_columns, n=1, cutoff=0.6)
    return match[0] if match else None


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    symptoms = data.get("symptoms", [])

    # normalize user symptoms
    symptoms = [
        s.lower()
         .replace(",", "")
         .replace("\"", "")
         .replace("(", "")
         .replace(")", "")
         .replace("’", "")
         .replace("'", "")
         .replace(" ", "_")
        for s in symptoms
    ]

    feature_vector = [1 if col in symptoms else 0 for col in symptom_columns]

    input_data = np.array(feature_vector).reshape(1, -1)
    prediction = model.predict(input_data)[0]

    # calculate possible conditions
    disease_scores = []

    for _, row in df.iterrows():
        disease = row[target_col].strip()
        score = sum(1 for s in symptoms if s in symptom_columns and row[s] == 1)
        disease_scores.append((disease, score))

    disease_scores = sorted(disease_scores, key=lambda x: x[1], reverse=True)
    possible_conditions = [d for (d, s) in disease_scores[:10] if s > 0]

    return jsonify({
        "prediction": prediction,
        "details": {
            "received_symptoms": symptoms,
            "matched_symptom_count": int(sum(feature_vector)),
            "possible_conditions": possible_conditions
        }
    })


@app.route("/symptoms", methods=["GET"])
def get_symptoms():
    return jsonify({"symptoms": symptom_columns})


if __name__ == "__main__":
    app.run(debug=True)