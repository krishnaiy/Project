
"""
API Layer for Pension Calculator
Tier 2: RESTful API using Flask
"""
from flask import Flask, request, jsonify, send_from_directory
try:
    from flask_cors import CORS
except ImportError:
    # Fallback if flask_cors is not available
    CORS = None
import os
from pension_backend import PensionCalculator

app = Flask(__name__, static_folder='static', static_url_path='')
if CORS:
    CORS(app)  # Enable CORS for all routes

# Initialize calculator
calculator = PensionCalculator()


@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('static', 'index.html')


@app.route('/api/calculate/group', methods=['POST'])
def calculate_group_premium():
    """
    API endpoint for group premium calculation
    
    Request body: JSON with input parameters
    Response: JSON with calculated outputs
    """
    try:
        data = request.get_json()
        result = calculator.calculate_group_premium(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/calculate/individual', methods=['POST'])
def calculate_individual_projection():
    """
    API endpoint for individual benefit projection
    
    Request body: JSON with input parameters
    Response: JSON with calculated outputs
    """
    try:
        data = request.get_json()
        result = calculator.calculate_individual_projection(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/reverse/group', methods=['POST'])
def reverse_calculate_group():
    """
    API endpoint for reverse group premium calculation
    Changes inputs to meet desired premium output
    """
    try:
        data = request.get_json()
        result = calculator.reverse_calculate_group(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/reverse/individual', methods=['POST'])
def reverse_calculate_individual():
    """
    API endpoint for reverse individual projection
    Changes inputs to meet desired pension output
    """
    try:
        data = request.get_json()
        result = calculator.reverse_calculate_individual(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Pension Calculator API is running'
    })


if __name__ == '__main__':
    # ensure static folder exists (useful in some deployment environments)
    os.makedirs('static', exist_ok=True)

    # allow Render (and other platforms) to specify a port via environment
    port = int(os.environ.get('PORT', 5001))
    # debug mode can be toggled with ENV variable, default to False in production
    debug = os.environ.get('DEBUG', 'False').lower() in ('1', 'true', 'yes')

    print("\n" + "="*60)
    print("🚀 Pension Calculator API Server Starting...")
    print("="*60)
    print(f"📊 Backend: Python Calculation Engine")
    print(f"🔗 API Layer: Flask RESTful API")
    print(f"🌐 Frontend: HTML5 + CSS + JavaScript")
    print("="*60)
    print(f"\n🌐 Application will listen on port {port} (may be overridden by Render)")
    print("\n📡 API Endpoints:")
    print(f"   POST  /api/calculate/group")
    print(f"   POST  /api/calculate/individual")
    print(f"   POST  /api/reverse/group")
    print(f"   POST  /api/reverse/individual")
    print(f"   GET   /api/health")
    print("="*60 + "\n")

    app.run(debug=debug, host='0.0.0.0', port=port)
