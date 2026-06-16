# Error Detection and Reliable Communication Simulator

![Web Simulator](https://img.shields.io/badge/Simulator-HTML/JS-brightgreen)
![Status](https://img.shields.io/badge/Status-Complete-blue)

This project demonstrates error detection and correction techniques using standard communication concepts. It was developed as part of a **Computer Networks Project Based Learning (PBL)** assignment to provide a visual and interactive simulation of data transmission over noisy channels.

## 🌟 Features

- **Cyclic Redundancy Check (CRC)**: Visual demonstration of detection of burst errors and bit changes through polynomial division.
- **Hamming Code**: Visual demonstration of detection and correction of single-bit errors using parity bits.
- **Interactive Channel Simulation**: A web-based noisy transmission channel where you can manually click on bits to introduce errors and test the robustness of the algorithms.
- **Step-by-Step Visualization**: The UI breaks down the complex mathematical XOR steps and parity calculations in real-time.

## 📂 Project Structure

- `simulator/`: Contains the complete web-based front-end simulator (HTML, CSS, and vanilla JS logic).
  - `index.html`: The main entry point.
  - `app.js` & `script.js`: The core logic for encoding, decoding, and UI interaction.
- `CN_PBL_Report.tex`: The original LaTeX report document detailing the theory and implementation.

## 🚀 Setup and Usage

Because this project is entirely built with web technologies (HTML, CSS, JavaScript), there is no backend server or installation process required!

### 1. Launch the Simulator
To use the visual simulator, simply open the `simulator/index.html` file directly in your preferred web browser. 

### 2. How to Use
1. **Transmit Mode:** Select either CRC or Hamming Code, enter a binary data string, and encode it.
2. **Channel Mode:** Watch the bits travel across the channel. You can click on any bit to intentionally "flip" it and simulate a transmission error.
3. **Receive Mode:** Move to the receiver to decode the message. Watch the simulator correctly identify (and in the case of Hamming, correct) the errors you introduced!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is created for educational purposes as part of the Computer Networks PBL curriculum.
