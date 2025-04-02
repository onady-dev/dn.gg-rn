class LogStack {
  logs: string[] = [];

  addLog(log: string) {
    this.logs.push(log);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  removeLog() {
    this.logs.pop();
  }
}

export default LogStack;
