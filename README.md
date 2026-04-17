# DiagnoSure-Disease-Prediction-Model-

## 📌 Overview

This project is a **full-stack disease prediction system** that allows users to input symptoms and receive predicted diseases along with possible related conditions.

It integrates:

* Machine Learning for prediction
* Flask backend API for processing
* Frontend interface for user interaction

---

## 🚀 Features

### 🔹 User Features

* Enter symptoms manually or select from suggestions
* Get predicted disease instantly
* View possible related conditions
* User profile management
* OTP-based login system

### 🔹 Technical Features

* REST API using Flask
* ML model trained using Random Forest
* Symptom normalization using fuzzy matching
* Dynamic frontend interaction using JavaScript
* JSON-based communication between frontend & backend

---

## 🧠 Tech Stack

**Frontend**

* HTML, CSS, JavaScript

**Backend**

* Python (Flask)

**Machine Learning**

* Scikit-learn
* Pandas, NumPy

**Database**

* MongoDB (for user profiles)

---

## ⚙️ Project Structure

```
Disease-Prediction-System/
│
├── backend/
│   ├── api.py                 
│   ├── diagnosure.py         
│   ├── disease_prediction_model.sav
│   ├── training.csv
|   ├── testing.csv
│
├── frontend/
│   ├── index.html
│   ├── chat.html
│   ├── profile.html
│   ├── chat.js
│   ├── login.js
│   ├── profile.js
│   ├── styles.css
│
├── README.md
```

---

## 🧪 How It Works

1. User enters symptoms in the frontend
2. Frontend sends request to Flask API (`/predict`)
3. Backend processes symptoms using normalization & fuzzy matching
4. ML model predicts disease
5. Response sent back and displayed to user

---

## ▶️ How to Run 
* Run backend:

```bash
python diagnosure.py
```
```bash
python api.py
```
* Run frontend: Open in browser


## 📊 Model Details

* Algorithm: Random Forest Classifier
* Input: Binary symptom vector
* Output: Predicted disease
* Accuracy: ~ 60%

## ⭐ Conclusion

This project demonstrates the integration of **Machine Learning + Backend API + Frontend UI** to build a real-world application.

---
