"use client";
import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fallback">
          <h1>Something went wrong.</h1>
          <p>Reload the page.</p>
          <button onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </main>
      );
    return this.props.children;
  }
}
