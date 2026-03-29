# AI-Driven Safe Ride Assist

A smart, automated emergency escalation system designed to enhance safety in ride-sharing platforms (like Rapido, Uber, etc.). Built during a generative AI hackathon, this project simulates a real-time reactive workflow that protects riders and drivers through continuous monitoring and automated multi-stage interventions.

## 🌟 The Problem
Safety incidents and ride deviations often go unnoticed until manually reported. We need a proactive, AI-driven system that can automatically identify anomalies (like unexpected, prolonged stops) and autonomously verify the safety of both the rider and driver, escalating appropriately if someone is in trouble.

## 💡 The Solution
This web-based functional prototype simulates the backend logic and the front-end user experience of our **Emergency Stop Safety Workflow**. 

The simulation features a split-view design:
- **Left Panel (Admin/AI Core Dashboard):** Simulates the backend infrastructure monitoring the ride telemetry and logging the autonomous decisions.
- **Right Panel (Rider App UI):** Simulates the rider's smartphone interface during the ride, rendering emergency prompts, incoming calls, and live map updates.

## ⚙️ Automated Safety Workflow
Our AI system executes the following timeline completely autonomously:
1. **Anomaly Detection:** The system detects an unexpected stop that exceeds safe thresholds.
2. **Rider Notification:** An immediate "Are you safe?" notification is pushed to the rider's phone with a 10-second countdown.
3. **Automated Rider Call:** If the notification is ignored, the backend triggers an automated VoIP call (Twilio) to the rider.
4. **Driver Escalation:** If the rider call goes unanswered (simulating distress or inability to respond), the system assumes immediate danger and rings the driver.
5. **Emergency Dispatch:** If the driver gives a suspicious answer or ignores the call, the system enters `EMERGENCY` mode—dispatching nearby rescue drivers (rendered dynamically on the map) and sharing vital location links with local authorities.

## 🚀 How to Run the Simulator
Because this was designed for easy hackathon judging, there is no complex backend required to view the demo!

1. Clone this repository to your local machine:
```bash
git clone https://github.com/your-username/ai-driven-safe-ride-assist.git
```
2. Open the project folder.
3. Double-click the `index.html` file to open it in any modern web browser.
4. Use the **Admin Tools** on the left to trigger a "Sudden Stop" and watch the automated sequence unfold!

## 🛠️ Tech Stack
- **HTML5:** Semantic structure for the split-screen simulator.
- **Vanilla CSS3:** Advanced UI rendering, glassmorphism design, and custom keyframe animations.
- **JavaScript (Vanilla):** The core State Machine powering the automated timers, transitions, and logging. 
## Team
- Mallishwari Dandike(@Mallishwari07)
- Nivasini Bhukya(@nivasini33)
- Manisha Maram(@Manisha77-debug)
- Gagana Keerthika Yamcham(@gagana215)
---
*Built with ❤️ for a safer riding experience.*
