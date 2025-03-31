from LMStudio import LMStudioLLM
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import PromptTemplate
import sys

def initialize_model():
    return LMStudioLLM()

def create_excitability_chain():
    #
    #promptText = """ "Évaluez la excitabilité sexuelle de la phrase suivante sur une échelle de 1 à 10. Considérez des facteurs tels que le contenu explicite, le langage suggestif et l'aptitude à évoquer une arousal. Renvoyez uniquement le score numérique."

    #Explanation:

    #Objective: The prompt is designed to assess the sexual excitability of a given phrase numerically.
    #Criteria: Factors such as explicit content, suggestive language, and potential to evoke arousal are considered.
    #Output: Only a numerical score between 1 and 10 should be returned without any additional text.
    #Phrase : {text}
    #"""

    promptText = """
    To create a system for rating the excitement of phrases in a dialogue on a scale of 1 to 10, follow this structured approach:

Criteria for Scoring Excitement/Sexuality
Explicit Language: Phrases containing explicit or suggestive words will score higher based on the directness and passion of their language.
Emotional Tone: The use of emotionally charged or intense words can elevate a phrase's excitement level.
Conciseness: Concise phrases that convey strong emotions or specific actions tend to receive higher scores.
Scoring Scale
Score 1: Phrases with no explicit content, minimal emotional impact, or lack of clarity.
Scores 2-5: Phrases that contain minor forms of explicit language but are otherwise neutral or lack emotional depth.
Score 6-8: Phrases that are emotionally engaging and use some explicit language, though not at the height of excitement.
Score 10: Phrases that maximally engage emotionally and use rich, concise, and explicit language.

Example Analysis
Dialogue: "I love you. That was amazing!"
Phrase 1: "I love you."

Explicit Language: Minimal
Emotional Tone: Neutral
Conciseness: Clear but not exciting
Score: 3
Explanation: The phrase conveys affection neutrally without explicit or emotionally charged content.

Phrase 2: "That was amazing!"
Explicit Language: Neutral
Emotional Tone: Exciting (hyperbole)
Conciseness: Very concise and impactful
Score: 6
Explanation: The phrase uses hyperbole for excitement but lacks explicit language.
Dialogue: "Can you please do that? It was so intense."

Phrase 1: "Can you please do that?"
Explicit Language: Neutral
Emotional Tone: Neutral request
Conciseness: Direct and clear
Score: 2
Explanation: A straightforward request with no explicit language or emotional impact.
Phrase 2: "It was so intense."
Explicit Language: Neutral
Emotional Tone: Intense emotional language
Conciseness: Very concise yet impactful
Score: 5
Explanation: The phrase conveys high emotion effectively but doesn't contain explicit content.

Phrase à évaluer: {input}

#Output: Only a numerical score between 1 and 10 should be returned without any additional text.
    """

    prompt = PromptTemplate.from_template(promptText)
    model = initialize_model()
    return prompt | model

def evaluate_text_excitability(text: str) -> str:
    """
    Évalue le niveau d'excitabilité d'un texte sur une échelle de 1 à 10
    
    Args:
        text (str): Le texte à évaluer
        
    Returns:
        str: Le score d'excitabilité
    """
    chain = create_excitability_chain()
    return chain.invoke({"input": text})

# Exemple d'utilisation :
if __name__ == "__main__":

    """
    # Tests
    test_phrases = [
        "Je suis un homme",
        "tu veux faire l'amour avec moi ?",
        "Laisse moi te carresser",
        "Laisse moi te sucer"
    ]
    
    for phrase in test_phrases:
        score = evaluate_text_excitability(phrase)
        print(f"Phrase: '{phrase}' -> Score: {score}")
    """

    # Get the text from the command line
    text = sys.argv[1]
    score = evaluate_text_excitability(text)
    print(f"Phrase: '{text}' -> Score: {score}")

# Chain 2

