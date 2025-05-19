from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["proman-db"]
task_collection = db["tasks"]

def analyze_complexity(text):
    """ Simple heuristic: complexity based on length and technical keywords """
    keywords = ["urgent", "critical", "complex", "important", "high priority"]
    score = len(text.split()) / 10  # word count based
    for kw in keywords:
        if re.search(kw, text, re.I):
            score += 2
    return score

def recommend_projects(tasks):
    recommendations = []
    now = datetime.now()
    for task in tasks:
        title = task.get("title", "")
        description = task.get("description", "")
        priority = task.get("priority", "low")
        deadline = task.get("deadline")
        stage = task.get("stage", "todo")
        if stage == "completed":
            continue
        # Calculate remaining time in days
        if isinstance(deadline, str):
            try:
                deadline_dt = datetime.fromisoformat(deadline)
            except:
                deadline_dt = now
        else:
            deadline_dt = deadline if deadline else now

        remaining_days = (deadline_dt - now).days
        complexity = analyze_complexity(title + " " + description)

        # Score: higher priority & nearer deadline & more complex = higher rank
        priority_score = {"high": 3, "medium": 2, "low": 1}.get(priority, 1)
        score = priority_score * 5 + max(0, 10 - remaining_days) + complexity
        recommendations.append({
            "id": str(task.get("_id")),
            "title": title,
            "description": description,
            "priority": priority,
            "deadline": deadline_dt.isoformat(),
            "stage": stage,
            "score": score
        })
    # Sort by score descending and return top 5
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:5]

@app.route("/recommend", methods=["GET"])
def recommend():
    tasks = list(task_collection.find())
    recommended = recommend_projects(tasks)
    return jsonify(recommended)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
