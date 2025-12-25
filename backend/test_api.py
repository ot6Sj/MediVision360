import requests
import json

print("Testing OpenFDA API...")

queries = ["PARACETAMOL", "ACETAMINOPHEN", "AMOXICILLIN"]

for query in queries:
    url = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:\"{query}\"&limit=1"
    
    print(f"\nScanning: {query}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('results'):
                result = data['results'][0]
                brand = result.get('openfda', {}).get('brand_name', ['N/A'])[0]
                generic = result.get('openfda', {}).get('generic_name', ['N/A'])[0]
                purpose = result.get('purpose', ['N/A'])[0][:200]
                
                print(f"FOUND: {brand} ({generic})")
            else:
                print("No results")
        else:
            print("Error connecting")
    except Exception as e:
        print(f"Error: {e}")
