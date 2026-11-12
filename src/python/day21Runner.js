export class Day21Runner {
  constructor() {
    this.worker = new Worker(new URL("./day21Worker.js", import.meta.url), {
      type: "module",
    });
    this.sequence = 0;
    this.pending = null;

    this.worker.onmessage = ({ data }) => {
      if (this.pending?.id !== data.id) return;
      clearTimeout(this.pending.timer);
      const { resolve } = this.pending;
      this.pending = null;
      resolve(data);
    };

    this.worker.onerror = (event) => {
      event.preventDefault();
      this.stop(
        event.message ||
          "Python could not load. Check the internet connection and retry.",
      );
    };
  }

  request(payload) {
    if (this.pending) {
      return Promise.reject(new Error("Python is already running."));
    }

    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(
        () =>
          this.stop(
            "Python timed out. Reset the Day 21 lab and retry.",
          ),
        180000,
      );

      this.pending = { id, resolve, reject, timer };
      this.worker.postMessage({ ...payload, id });
    });
  }

  stop(message = "Stopped.") {
    this.worker.terminate();

    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(new Error(message));
      this.pending = null;
    }
  }
}
