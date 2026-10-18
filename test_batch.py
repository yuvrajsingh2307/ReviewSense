import urllib.request, json

# Test batch analysis
print('=== Test: Batch Analysis ===')
reviews = [
    'I absolutely love this product!',
    'Terrible experience, would not buy again.',
    'The product is okay, nothing special.',
    'Amazing quality and fast delivery.',
    'Not worth the price at all.'
]
data = json.dumps({'reviews': reviews}).encode()
req = urllib.request.Request('http://localhost:8000/api/analyze-batch', data=data, headers={'Content-Type': 'application/json'})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print('Total:', result['total'])
print('Positive:', result['positive_count'], 'Neutral:', result['neutral_count'], 'Negative:', result['negative_count'])
print('Average score:', result['average_score'])
print('Distribution:', result['sentiment_distribution'])
print()
print('Individual results:')
for r in result['results']:
    print('  [%s] score=%.2f: %s...' % (r['sentiment'], r['score'], r['review'][:60]))
