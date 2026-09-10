import { Component } from 'react';
import type { ReactNode } from 'react';

// Hata sınırı: patlayan alt ağaç yerine güvenli yedek kart gösterir,
// uygulamanın tamamı kararmaz. Araç detayını ve ana gövdeyi sarar.
interface Props {
  name: string;
  children: ReactNode;
}

interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error) {
    try {
      console.error(`[zero:${this.props.name}]`, err);
    } catch {
      /* yoksay */
    }
  }

  render() {
    if (this.state.err) {
      return (
        <div
          data-testid="error-fallback"
          className="rounded-2xl border border-[#5A1E1E] bg-[#140A0A] p-5"
        >
          <p className="text-[14px] font-bold text-white">Bu bölüm açılamadı</p>
          <p className="mt-1 text-[12px] text-[#999]">
            Beklenmeyen bir hata oldu. Verilerin güvende; yeniden deneyebilirsin.
          </p>
          <button
            onClick={() => this.setState({ err: null })}
            className="mt-3 rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-[12px] text-[#CCC] hover:border-[#3A3A3A] hover:text-white"
          >
            Yeniden dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
