import os
import json
import logging
from pypdf import PdfReader
import google.generativeai as genai

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_obj):
    """
    Extracts all text from a PDF file-like object using pypdf.
    """
    try:
        reader = PdfReader(file_obj)
        text_content = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        return "\n--- Page Break ---\n".join(text_content)
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise ValueError(f"Failed to read PDF file: {str(e)}")

def parse_outline_with_gemini(pdf_text):
    """
    Uses Gemini API to structure the raw course text into a clean modules/lessons JSON.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not configured. "
            "Please add it to Render's Environment Variables settings."
        )

    # Configure Gemini SDK
    genai.configure(api_key=api_key)

    system_prompt = (
        "You are an expert curriculum designer and education assistant. "
        "Your task is to analyze the provided course outline text and extract "
        "a structured syllabus consisting of modules and lessons. "
        "You must structure the output strictly as a JSON array of modules. "
        "Do not include any Markdown formatting like ```json or ``` blocks. Just output raw JSON.\n\n"
        "Each module object in the array must have the following fields:\n"
        "- 'title': A short, clear name for the module (e.g., 'Introduction to Ethics')\n"
        "- 'description': A brief, one or two-sentence description of what this module covers.\n"
        "- 'lessons': A list of lesson objects belonging to this module.\n\n"
        "Each lesson object must have the following fields:\n"
        "- 'title': The lesson name.\n"
        "- 'description': A brief summary of what the lesson covers.\n"
        "- 'type': The lesson content type, which must be either 'video', 'document', or 'text'. "
        "Choose 'video' if the outline suggests a lecture/presentation, 'document' if it implies "
        "reading materials/handouts, or 'text' for generic text lessons.\n"
        "- 'duration': An estimated duration in minutes to complete this lesson (integer, default 15).\n\n"
        "Strict Guidelines:\n"
        "1. Standardise and clean the titles. Remove prefix numbering like 'Module 1:', 'Lesson 3.2:', etc.\n"
        "2. If the outline is flat, group related topics logically into modules containing at most 5-7 lessons each.\n"
        "3. Ensure the output is valid JSON."
    )

    try:
        # We use gemini-1.5-flash as the fast, cost-effective default model
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_prompt
        )

        response = model.generate_content(
            pdf_text,
            generation_config={"response_mime_type": "application/json"}
        )

        # Parse output to verify it is valid JSON
        result_text = response.text.strip()
        parsed_json = json.loads(result_text)
        return parsed_json
    except json.JSONDecodeError as jde:
        logger.error(f"Gemini did not return valid JSON: {response.text}")
        raise ValueError("AI parsing error: The structured course layout returned by the model was invalid.")
    except Exception as e:
        logger.error(f"Gemini generation error: {str(e)}")
        raise ValueError(f"AI Service Error: {str(e)}")
