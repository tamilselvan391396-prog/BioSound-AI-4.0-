
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
    if (!label || score < this.minimumScore) return;

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

  render() {
    this.list.replaceChildren();

    if (!this.events.length) {
      const li = document.createElement("li");

      li.className = "muted";
      li.textContent = "Detected events will appear here.";

      this.list.append(li);
      return;
    }

    for (const event of this.events) {
      const li = document.createElement("li");

      // Display time in 12-hour format with AM/PM
      const time = new Date(event.firstSeen).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

      li.textContent =
        `${time} · ${event.category} · ${event.label} · ${Math.round(event.score * 100)}% model score`;

      this.list.append(li);
    }
  }
}
