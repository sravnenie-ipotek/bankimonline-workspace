/**
 * TEST BUG COMPONENT
 * Created temporarily to test orphan CSS detection system
 * This component exists but doesn't import its CSS file
 * Detection system should flag this as HIGH RISK
 */

import React from 'react'

const TestBugComponent: React.FC = () => {
  return (
    <div className="test-bug-container">
      <button className="test-critical-button">
        Critical Button (Should be red with fixed position)
      </button>
      <div className="test-mobile-element">
        Mobile Element (Should be responsive)
      </div>
    </div>
  )
}

export default TestBugComponent