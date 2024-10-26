# main.py

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    # Read the image file
    image_data = await file.read()
    
    # Process the image using Pillow
    try:
        image = Image.open(io.BytesIO(image_data))
        
        image.save("test.png")

        return JSONResponse(content={"message": "Image processed successfully!"})
    
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

