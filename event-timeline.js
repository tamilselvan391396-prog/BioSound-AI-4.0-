export class EventTimeline {
  constructor(
    listElement,
    {
      mergeWindowMs = 2200,
      minimumScore = 0.12
    } = {}
  ) {
    this.list = listElement;
    this.mergeWindowMs = mergeWindowMs;
    this.minimumScore = minimumScore;
    this.events = [];
  }

  add(label, category, score, timestamp = Date.now()) {
    if (!label || score < this.minimumScore) {
      return;
    }

    const previous = this.events[0];

    if (
      previous &&
      previous.label === label &&
      timestamp - previous.lastSeen <= this.mergeWindowMs
    ) {
      previous.lastSeen = timestamp;
      previous.score = Math.max(previous.score, score);
      previous.count += 1;
    } else {
      this.events.unshift({
        label,
        category,
        score,
        firstSeen: timestamp,
        lastSeen: timestamp,
        count: 1
      });

      this.events = this.events.slice(0, 30);
    }

    this.render();
  }

  clear() {
    this.events = [];
    this.render();
  }

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }

  render() {
    this.list.replaceChildren();

    if (this.events.length === 0) {
      const li = document.createElement("li");

      li.className = "muted";
      li.textContent = "Detected events will appear here.";

      this.list.appendChild(li);
      return;
    }

    for (const event of this.events) {
      const li = document.createElement("li");

      const time = this.formatTime(event.firstSeen);
      const percentage = Math.round(event.score * 100);

      li.textContent =
        `${time} · ${event.category} · ${event.label} · ${percentage}% model score`;

      this.list.appendChild(li);
    }
  }
}
