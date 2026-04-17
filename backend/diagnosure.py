import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle

try:
    train_df = pd.read_csv("training.csv", encoding='latin-1')
    test_df = pd.read_csv("testing.csv", encoding='latin-1')
except Exception as e:
    print("Error reading CSV files:", e)
    exit()

print("✅ Training Data Shape:", train_df.shape)
print("✅ Testing Data Shape:", test_df.shape)

target_col = None
if "Prognosis" in train_df.columns:
    target_col = "Prognosis"
elif "prognosis" in train_df.columns:
    target_col = "prognosis"
else:
    raise ValueError("❌ Could not find 'Prognosis' column in training data!")

X_train = train_df.drop(columns=[target_col])
Y_train = train_df[target_col]
X_test = test_df.drop(columns=[target_col])
Y_test = test_df[target_col]

X_test = X_test.reindex(columns=X_train.columns, fill_value=0)

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, Y_train)

y_pred = model.predict(X_test)
print("\n✅ Model Accuracy:", accuracy_score(Y_test, y_pred))
print("\nClassification Report:\n", classification_report(Y_test, y_pred))

pickle.dump(model, open("disease_prediction_model.sav", "wb"))
print("\n💾 Model saved as disease_prediction_model.sav")
