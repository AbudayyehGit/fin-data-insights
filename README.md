# 📈 FinData Insights Engine

> Enterprise Financial Data Cleansing & Analytics Proof-of-Work MVP

An interactive financial data intelligence pipeline built with **Streamlit**, **Pandas**, **NumPy**, **Matplotlib**, and **Seaborn**. It automatically generates simulated banking transaction histories and credit risk metrics out-of-the-box, provides automated missing value imputation and date standardizing, computes parametric summary statistics, and visualizes financial time-series trends alongside Pearson correlation heatmaps.

---

## 🚀 Key Architectural Modules

1. **Synthetic Banking Generator**: Simulates realistic transaction amounts (exponentially distributed), credit ratings (Gaussian, bounded 300–850), debt-to-income ratios (Beta distribution), and controlled missingness (~2–3%).
2. **Automated Cleansing Engine**:
   - **Drop Missing**: Automatic row removal.
   - **Impute Mean (Numeric)**: Fills numeric NaNs with arithmetic averages.
   - **Impute Median (Numeric)**: Fills numeric NaNs with the 50th percentile.
   - **Date Standardization**: Chronological ordering and ISO format validation.
3. **Descriptive Profiling**: High-precision statistics (`count`, `mean`, `std`, `median`, `variance`, `min`, `25%`, `50%`, `75%`, `max`).
4. **Time-Series & Correlation Engine**:
   - Daily financial trend plotting with metric selection.
   - Annotated Pearson feature correlation matrix with coolwarm heatmap styling.

---

## 🛠️ Repository Layout

```text
FinData-Insights-Engine/
├── app.py              # Core Streamlit application
├── requirements.txt    # Python dependencies
├── .gitignore          # Production Git ignores
└── README.md           # Documentation & deployment instructions
```

---

## ⚡ Quickstart (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/FinData-Insights-Engine.git
cd FinData-Insights-Engine
```

### 2. Set up virtual environment
```bash
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Launch the Streamlit Engine
```bash
streamlit run app.py
```
Open `http://localhost:8501` in your browser.

---

## 🌐 One-Click Streamlit Community Cloud Deployment

1. Push this repository to **GitHub**.
2. Visit [share.streamlit.io](https://share.streamlit.io).
3. Select your repository: `FinData-Insights-Engine`.
4. Set **Main file path**: `app.py`.
5. Click **Deploy!**

---

## 🐳 Docker Deployment (Optional)

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

Build and run:
```bash
docker build -t findata-engine .
docker run -p 8501:8501 findata-engine
```

---

## 📄 License
MIT License. Created for enterprise financial engineering and data pipeline proof-of-work.
