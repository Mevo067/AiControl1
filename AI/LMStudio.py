from typing import Optional, List, Dict, Any
import requests
from langchain_core.language_models.llms import LLM

class LMStudioLLM(LLM):
    endpoint: str = "http://localhost:1234/v1/chat/completions"

    

    def _call(self, prompt: str, stop: Optional[List[str]] = None, **kwargs: Any) -> str:
        response = requests.post(self.endpoint, json={"messages": [{"role": "user", "content": prompt}]})
        return response.json()["choices"][0]["message"]["content"]
    
    @property
    def _llm_type(self) -> str:
        return "lmstudio"

