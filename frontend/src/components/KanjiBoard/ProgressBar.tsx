export function ProgressBar({progress}: {progress: number}) {
    return (
        <div id="disable-overlay">
          <div className="progress-container">
            <p>Preparing board...</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-percent">{Math.floor(progress)}%</span>
          </div>
        </div>
    )
}