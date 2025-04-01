from flask import Flask, request, jsonify
from indexChat import evaluate_text_excitability
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin

@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Le champ "text" est requis'
            }), 400

        text = data['text']
        score = evaluate_text_excitability(text)
        
        return jsonify({
            'text': text,
            'score': score
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Le serveur fonctionne correctement'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
