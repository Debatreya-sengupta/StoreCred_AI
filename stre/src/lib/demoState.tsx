"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AssessmentInputs, AssessmentResult } from './types';

interface DemoContextType {
  inputs: AssessmentInputs;
  setInputs: React.Dispatch<React.SetStateAction<AssessmentInputs>>;
  result: AssessmentResult | null;
  setResult: React.Dispatch<React.SetStateAction<AssessmentResult | null>>;
  decisionStatus: 'pending' | 'approved' | 'field_verification' | 'rejected';
  setDecisionStatus: React.Dispatch<React.SetStateAction<'pending' | 'approved' | 'field_verification' | 'rejected'>>;
  reset: () => void;
}

const defaultInputs: AssessmentInputs = {
  interiorImage: null,
  counterImage: null,
  exteriorImage: null,
  locationPincode: '',
  video: null,
  shopSizeSqFt: '',
  monthlyRent: '',
  yearsInOperation: '',
  storeType: 'general',
  ownershipType: 'owned'
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<AssessmentInputs>(defaultInputs);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<'pending' | 'approved' | 'field_verification' | 'rejected'>('pending');

  const reset = () => {
    setInputs(defaultInputs);
    setResult(null);
    setDecisionStatus('pending');
  };

  return (
    <DemoContext.Provider value={{ inputs, setInputs, result, setResult, decisionStatus, setDecisionStatus, reset }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoState must be used within a DemoProvider');
  }
  return context;
}
