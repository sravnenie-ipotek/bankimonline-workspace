/**
 * Step Navigation Component
 * Action 4 from Confluence requirements
 * Shows step progress and current step indicator
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  currentStep: 1 | 2;
}

const StepNavigation: React.FC<Props> = ({ currentStep }) => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      title: t('registration.step1_title'),
      isActive: currentStep === 1,
      isCompleted: currentStep > 1
    },
    {
      number: 2,
      title: t('registration.step2_title'),
      isActive: currentStep === 2,
      isCompleted: false
    }
  ];

  return (
    <div className="mb-8">
      {/* Background container with shadow */}
      <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Item */}
              <div className="flex items-center space-x-3">
                {/* Step Number Circle */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    step.isActive
                      ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                      : step.isCompleted
                      ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                      : 'border-gray-500 text-gray-400'
                  }`}
                >
                  {step.isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>

                {/* Step Title */}
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      step.isActive
                        ? 'text-yellow-400'
                        : step.isCompleted
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepNavigation; 