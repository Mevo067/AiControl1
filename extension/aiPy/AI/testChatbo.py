from LMStudio import LMStudioLLM
from langchain_core.messages  import HumanMessage, AIMessage

model = LMStudioLLM()

messages = [HumanMessage(content="Hello, how are you?"), AIMessage(content="I'm fine, thank you for asking.")]


print(model.invoke(messages))