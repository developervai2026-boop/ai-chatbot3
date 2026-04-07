const [provider, setProvider] = useState('gemini');

const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  body: { 
    preferredProvider: provider 
  },
});

// UI-তে
<select value={provider} onChange={(e) => setProvider(e.target.value)}>
  <option value="gemini">Gemini 2.5 Pro (Default)</option>
  <option value="grok">Grok 4 (xAI)</option>
  <option value="deepseek">DeepSeek Chat</option>
  <option value="claude">Claude Sonnet 4.6</option>
</select>
