# Error Detection and Reliable Communication

![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue)
![Jupyter Notebooks](https://img.shields.io/badge/Jupyter-Interactive-orange)
![Web Simulator](https://img.shields.io/badge/Simulator-HTML/JS-brightgreen)

This project demonstrates error detection and correction techniques using standard communication concepts. It was developed as part of a **Computer Networks Project Based Learning (PBL)** assignment to provide both theoretical understanding and practical interactive simulations.

## 🌟 Features

- **Cyclic Redundancy Check (CRC)**: Detection of burst errors and bit changes through polynomial division.
- **Hamming Code**: Detection and correction of single-bit errors using parity bits.
- **Channel Simulation**: Simulated noisy transmission channels to test robustness by introducing single or random errors.
- **Web-based Simulator**: A visual and interactive UI for transmitting, simulating noisy channels, and receiving data.
- **Jupyter Notebook Demo**: A complete theoretical walk-through using Python and Pandas.

## 📂 Project Structure

- `src/`: Core Python implementations for `crc.py`, `hamming.py`, and `channel.py`.
- `main.py`: The main command-line interface (CLI) to interactively test the error correction algorithms.
- `simulator/`: A web-based front-end simulator containing HTML, CSS, and JS files (`index.html`, `transmit.html`, etc.).
- `notebooks/`: Contains `demo.ipynb` for Jupyter interactive visualization.
- `tests/`: Test cases for the implemented algorithms.

## 🚀 Setup and Installation

### Prerequisites
Make sure you have Python 3 installed.

### Installation
1. Clone the repository and navigate into the project directory.
2. Create a virtual environment: 
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On Linux/Mac: `source venv/bin/activate`
4. Install dependencies: 
   ```bash
   pip install -r requirements.txt
   ```

## 💻 Usage

### 1. Interactive CLI Mode
Use the main CLI interface to run interactive demonstrations of CRC and Hamming Code:

```bash
python main.py
```
*You will be prompted to select a mode (CRC or Hamming Code), enter a binary data string, and observe the simulated transmission and error detection/correction.*

### 2. Web-based Visual Simulator
To use the web UI simulator, open the file `simulator/index.html` directly in your web browser. This allows you to visually follow the step-by-step process of transmitting data, introducing noise in the channel, and receiving/decoding it.

### 3. Jupyter Notebooks
For an academic deep-dive, open the provided Jupyter Notebook:
```bash
jupyter notebook
```
Then navigate to `notebooks/demo.ipynb`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is created for educational purposes as part of the Computer Networks PBL curriculum.
