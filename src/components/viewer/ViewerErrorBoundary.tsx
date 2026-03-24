import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return { hasError: true, message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white rounded-xl text-gray-600 text-sm">
          <span className="text-2xl">⚠️</span>
          <p className="font-semibold text-gray-700">3D 뷰어를 불러올 수 없습니다</p>
          <p className="text-xs text-gray-600 max-w-xs text-center">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-2 px-4 py-1.5 bg-black text-white text-xs rounded-full hover:bg-white transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
