import os, sys
sys.path.insert(0, 'backend')
os.chdir('backend')
from dotenv import load_dotenv
load_dotenv('.env')
import anthropic

key = os.getenv('ANTHROPIC_API_KEY', '')
print('Key prefix:', key[:25])

client = anthropic.Anthropic(api_key=key)
msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=64,
    messages=[{"role": "user", "content": "Reply with exactly this JSON and nothing else: {\"test\": true}"}]
)
print('Claude response:', msg.content[0].text)
print('SUCCESS - Claude API is working!')
