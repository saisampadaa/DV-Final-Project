
# Global Economic Trends: Analyzing GDP Growth across Countries

---

## 📚 Group 9 Members:
- Abhiram Kattunga
- Sai Surya Teja Medisetty
- Sai Sampadaa Gomatham
- Jayanth Kodamanchili

---

## 🌎 Project Description:
This project visualizes **Global GDP Metrics** including:
- GDP Growth (%)
- GDP per Capita Growth (%)
- GDP per Capita (USD)

It uses an interactive dashboard to allow users to explore economic growth trends across different countries over time.  
The dataset covers **over 200 countries** from **1960 to 2020**.

---

## ⚙️ How to Run the Project

You have **two ways** to run the project locally:

---

### 🔵 Option 1: Run using Live Server (VS Code)

1. Download and extract the project ZIP.
2. Open the project folder in **Visual Studio Code (VSCode)**.
3. Install the **Live Server** extension (if not already installed).
4. Right-click on `index.html` and select **"Open with Live Server"**.
5. The project will launch in your browser at:
  http://127.0.0.1:5500/
✅ Your `index.html` will now load live in the browser!

---

### 🟢 Option 2: Run using Python Simple HTTP Server

1. Download and extract the project ZIP.
2. Open a terminal (Command Prompt or Terminal) and navigate to the project folder (`Final_Project/`).
3. Run the following command based on your Python setup:

- If using Python 3:
  ```bash
  python -m http.server 5500
  ```

- (If `python` doesn't work, try):
  ```bash
  python3 -m http.server 5500
  ```

4. Open your browser and visit:
    http://localhost:5500
 ✅ Your `index.html` will now load live in the browser!

---

## 🚀 Notes:
- Make sure **port 5500** is not already in use by another application.
- If needed, you can change `5500` to another available port (like `8000` or `8080`) by editing the command:
```bash
python -m http.server 8000

---

## 📚 How to Read the Visualization

The dashboard consists of multiple visual components:

- **Metric Dropdown**:  
- Choose between:
 - `GDP Growth (%)`
 - `GDP Per Capita Growth (%)`
 - `GDP Per Capita (USD)`

- **Country Selector**:  
- Select any specific country to view its historical GDP trend over the years.

---

### 🧭 What Each Axis Represents:

- **Line Chart (Country Trend)**:
- **X-axis**: Years (from 1960 to 2020)
- **Y-axis**: Value of the selected metric (depends on dropdown choice)

- **World Choropleth Map**:
- **Color Encoding**: 
 - The darker the color, the higher the value of the selected metric.
 - Lighter shades represent lower values.

- **Bar Chart (on comparison popup)**:
- **X-axis**: Different countries
- **Y-axis**: Metric value for a particular year

---

## 📈 Visualization Idioms (Explained Separately)

We used different idioms to communicate the data clearly:

| Visualization Type | Idiom | Detailed Explanation |
|:---|:---|:---|
| **Choropleth Map** | Geographic Encoding | Colors represent the intensity of the selected metric for each country. Darker countries have higher values, lighter ones lower values. Helps identify global economic hotspots visually. |
| **Line Chart** | Temporal Trend Encoding | A line chart shows how a single country's GDP metric changed over time (1960–2020). Useful for observing upward or downward economic trends year-over-year. |
| **Bar Chart** | Comparison Encoding | Bar charts compare different countries' GDP values at a single point in time (single year), helping in cross-country comparison for a selected year. |

---

## 📦 Libraries and Dependencies Used

- **D3.js**  
Used for:
- Creating the choropleth map
- Binding data dynamically
- Smooth transitions and interactions  
**CDN**:
```html
<script src="https://d3js.org/d3.v7.min.js"></script>


#Final_Project/
├── index.html
├── style.css
├── script.js
├── data/
│   ├── gdp_growth.csv
│   ├── gdp_per_capita_growth.csv
│   └── gdp_per_capita.csv
├── images/
│   └──  (project images like background images, icons, screenshots, etc.)


