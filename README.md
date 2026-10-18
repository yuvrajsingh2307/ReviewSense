# ReviewSense - Product Review Sentiment Analyzer

AI-Powered Product Review Sentiment Analysis application built with React, TypeScript, Tailwind CSS, and FastAPI.

## Features

- **Single Review Analysis**: Enter a customer review and get instant sentiment classification
- **Batch Analysis**: Upload CSV or paste multiple reviews for bulk analysis
- **Dashboard**: Visual overview of sentiment distribution and trends
- **Customer Insights**: Detailed analytics and sentiment summaries
- **NLP Pipeline**: Text preprocessing including tokenization, stopword removal, and lemmatization
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Recharts (data visualization)
- Lucide React (icons)
- React Router DOM

### Backend
- Python + FastAPI
- TextBlob (sentiment analysis)
- NLTK (NLP preprocessing)

## Project Structure

```
project/
├── backend/
│   ├── main.py           # FastAPI application
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utility functions
│   │   ├── App.tsx       # Main application
│   │   └── main.tsx      # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```
   Or with uvicorn:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Running with Backend Proxy

The Vite config proxies `/api` requests to the backend at `http://localhost:8000`. Ensure the backend is running before starting the frontend.

## API Endpoints

### GET /api/health
Health check endpoint.

### POST /api/analyze
Analyze a single review.

**Request:**
```json
{
  "review": "I absolutely love this product!"
}
```

**Response:**
```json
{
  "review": "I absolutely love this product!",
  "sentiment": "Positive",
  "score": 0.87,
  "polarity": 0.87,
  "processed_text": "absolutely love product"
}
```

### POST /api/analyze-batch
Analyze multiple reviews at once.

**Request:**
```json
{
  "reviews": ["Great product!", "Terrible experience.", "It's okay."]
}
```

### POST /api/analyze-csv
Upload a CSV file for batch analysis.

The CSV must contain a column named `review`, `text`, `content`, `feedback`, or `comment`.

## NLP Pipeline

1. **Text Preprocessing**: Convert to lowercase, remove URLs/mentions
2. **Punctuation Removal**: Remove unnecessary punctuation
3. **Tokenization**: Split text into individual words
4. **Stopword Removal**: Remove common words (the, is, at, etc.)
5. **Lemmatization**: Reduce words to base form
6. **Sentiment Analysis**: Calculate polarity using TextBlob

### Sentiment Classification

- **Polarity > 0.05**: Positive
- **Polarity < -0.05**: Negative
- **Otherwise**: Neutral

## Sample Data

The application loads with 20 sample reviews to demonstrate functionality. This data can be cleared to start fresh with your own reviews.

## Data Persistence

Reviews are stored in localStorage on the frontend. For production, a database should be added.

## Academic Disclaimer

This is an academic project demonstrating NLP concepts. It uses TextBlob's lexicon-based sentiment analysis, which is not a machine learning classifier and has not been evaluated for accuracy, precision, recall, or F1-score on a labeled test set.

## License

MIT
