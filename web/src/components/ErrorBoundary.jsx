import { Component } from 'react';

/** Last-resort guard so a rendering bug shows a recoverable message instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error('[ui]', err); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-6 text-center font-ui">
        <p className="text-xl font-bold text-maroon">کچھ مسئلہ پیش آیا</p>
        <p className="text-ink-soft">براہ کرم صفحہ دوبارہ کھولیں۔</p>
        <button type="button" className="btn btn-primary" onClick={() => { window.location.href = '/dashboard'; }}>مرکزی صفحہ</button>
      </div>
    );
  }
}
