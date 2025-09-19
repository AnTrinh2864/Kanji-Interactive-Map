# Backend---------------------------------------------------
cd backend
python -m venv venv
# Backend activate venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
# Backend dependancies
pip install fastapi uvicorn httpx python-dotenv
# or
pip install requirement.txt
# Backend security
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=kanjialive-api.p.rapidapi.com
# run Backend
uvicorn app.main:app --reload

# Frontend-----------------------------------------------
cd frontend
npm create vite@latest
# choose React + TypeScript
cd frontend
npm install
# UI libraries
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority tailwind-variants clsx
npm install lucide-react
npm install @radix-ui/react-dialog
npm install axios reactflow @react-spring/web
# run frontend
npm run dev


