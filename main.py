from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import uvicorn

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


class CodeRequest(BaseModel):
    code: str
    task: str  
    language: str


genai.configure(api_key="AIzaSyA8iDWA2jHImpRtnLO3ZQXMMQwRUQKL_D4")  
model = genai.GenerativeModel("gemini-2.5-flash")

@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/process/")
async def process_code(request: CodeRequest):
    prompt = f"Please {request.task} this {request.language} code:\n\n{request.code}"
    response = model.generate_content(prompt)
    return {"response": response.text}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)


