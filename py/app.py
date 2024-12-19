from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from flask_cors import CORS

model = tf.keras.models.load_model('character_recommendation_model.keras')

df = pd.read_csv('data4.4b.csv', sep=';')
df = df.fillna('').astype(str)

all_characters = pd.unique(df.values.ravel())
unique_characters = set()
for team in all_characters:
    if team.strip():
        unique_characters.update(team.split(';'))
unique_characters = sorted(unique_characters)

encoder = LabelEncoder()
encoder.fit(unique_characters)
app = Flask(__name__)
CORS(app) 

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json 
    input_character = data.get('character', '')
    
    if input_character not in encoder.classes_:
        return jsonify({'error': 'Character not recognized'}), 400
    
    input_index = encoder.transform([input_character])[0]
    predicted_probs = model.predict(np.array([[input_index]]))
    predicted_indices = np.argsort(predicted_probs[0])[-3:][::-1]
    predicted_characters = encoder.inverse_transform(predicted_indices)

    return jsonify({'predicted_characters': predicted_characters.tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
