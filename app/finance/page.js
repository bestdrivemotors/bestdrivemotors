'use client';

import { useEffect, useRef, useState } from 'react';
import { validateStep1, validateStep2, validateStep3, validateStep4 } from '@/app/utils/validation';
import { SuccessModal, ErrorModal, LoadingModal } from '@/app/components/FormModals';

const STORAGE_KEY = 'finance_form_data';
const COMPLETED_STEPS_KEY = 'finance_form_completed_steps';

export default function FinancePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', 
    dateOfBirthDay: '', dateOfBirthMonth: '', dateOfBirthYear: '',
    driverLicenceType: '',
    driverLicenceNumber: '', versionNumber: '', 
    licenceExpiryDay: '', licenceExpiryMonth: '', licenceExpiryYear: '',
    maritalStatus: '',
    email: '', phone: '', licenceFront: '', licenceBack: '', currentAddress: '', suburb: '', postcode: '', residentialStatus: '',
    yearsAtAddress: '', monthsAtAddress: '', employmentStatus: '', employerName: '',
    occupation: '', yearsAtEmployment: '', monthsAtEmployment: '', income: '', payFrequency: '', dependents: '', rentMortgage: '',
    otherLoans: '', termsConsent: false, privacyConsent: false,
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedSteps = localStorage.getItem(COMPLETED_STEPS_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Ensure all fields have defined values to prevent controlled/uncontrolled warnings
      // File fields are always empty on load (cannot be persisted)
      setFormData(prev => ({
        ...prev,
        ...parsed,
        licenceFront: null,
        licenceBack: null,
        yearsAtEmployment: parsed.yearsAtEmployment ?? '',
        monthsAtEmployment: parsed.monthsAtEmployment ?? '',
      }));
    }
    if (savedSteps) setCompletedSteps(new Set(JSON.parse(savedSteps)));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...formData,
      // Exclude file objects - they cannot be serialized
      licenceFront: null,
      licenceBack: null,
    }));
    localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify(Array.from(completedSteps)));
  }, [formData, completedSteps]);

  useEffect(() => {
    setTimeout(() => {
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [currentStep]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        if (currentStep === 4) handleSubmitAll();
        else handleNextStep();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, formData, completedSteps]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : type === 'file' ? (files ? files[0] : null) : value 
    }));
    if (errorMessages[name]) {
      setErrorMessages((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateCurrentStep = () => {
    let errors = {};
    switch (currentStep) {
      case 1: errors = validateStep1(formData); break;
      case 2: errors = validateStep2(formData); break;
      case 3: errors = validateStep3(formData); break;
      case 4: errors = validateStep4(formData); break;
    }
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setShowError(true);
      return false;
    }
    return true;
  };

  const validateAllSteps = () => {
    return {
      ...validateStep1(formData), ...validateStep2(formData),
      ...validateStep3(formData), ...validateStep4(formData)
    };
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(currentStep);
      setCompletedSteps(newCompleted);
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleStepChange = (step) => {
    if (step <= Math.max(...completedSteps, 0) || step === currentStep) setCurrentStep(step);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = validateAllSteps();
    if (Object.keys(allErrors).length > 0) {
      setErrorMessages(allErrors);
      setShowError(true);
      for (let step = 1; step <= 4; step++) {
        let stepErrors = {};
        switch (step) {
          case 1: stepErrors = validateStep1(formData); break;
          case 2: stepErrors = validateStep2(formData); break;
          case 3: stepErrors = validateStep3(formData); break;
          case 4: stepErrors = validateStep4(formData); break;
        }
        if (Object.keys(stepErrors).length > 0) {
          setCurrentStep(step);
          break;
        }
      }
      return;
    }
    await submitApplication();
  };

  const handleSubmitAll = () => handleSubmit({ preventDefault: () => {} });

  const submitApplication = async () => {
    setIsLoading(true);
    try {
      // Import the combineDateFromParts function
      const { combineDateFromParts } = require('@/app/utils/validation');
      
      // Create FormData to handle file uploads
      const submitData = new FormData();
      
      // Combine date fields into single date strings
      const dateOfBirth = combineDateFromParts(formData.dateOfBirthDay, formData.dateOfBirthMonth, formData.dateOfBirthYear);
      const licenceExpiry = combineDateFromParts(formData.licenceExpiryDay, formData.licenceExpiryMonth, formData.licenceExpiryYear);
      
      // Add all fields except individual date parts and files
      Object.keys(formData).forEach(key => {
        if (!key.includes('dateOfBirth') && !key.includes('licenceExpiry') && key !== 'licenceFront' && key !== 'licenceBack') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add combined dates
      submitData.append('dateOfBirth', dateOfBirth);
      submitData.append('licenceExpiry', licenceExpiry);
      
      // Add files with proper naming: firstName_lastName_front and firstName_lastName_back
      if (formData.licenceFront) {
        const frontFileName = `${formData.firstName}_${formData.lastName}_front`;
        const frontFile = new File([formData.licenceFront], frontFileName, { type: formData.licenceFront.type });
        submitData.append('licenceFront', frontFile);
      }
      
      if (formData.licenceBack) {
        const backFileName = `${formData.firstName}_${formData.lastName}_back`;
        const backFile = new File([formData.licenceBack], backFileName, { type: formData.licenceBack.type });
        submitData.append('licenceBack', backFile);
      }
      
      const response = await fetch('/api/submit-finance', {
        method: 'POST',
        body: submitData,
      });
      const data = await response.json();
      if (response.ok) {
        setShowSuccess(true);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COMPLETED_STEPS_KEY);
        setFormData({
          firstName: '', middleName: '', lastName: '', 
          dateOfBirthDay: '', dateOfBirthMonth: '', dateOfBirthYear: '',
          driverLicenceType: '',
          driverLicenceNumber: '', versionNumber: '', 
          licenceExpiryDay: '', licenceExpiryMonth: '', licenceExpiryYear: '',
          maritalStatus: '',
          email: '', phone: '', licenceFront: '', licenceBack: '', currentAddress: '', suburb: '', postcode: '', residentialStatus: '',
          yearsAtAddress: '', monthsAtAddress: '', employmentStatus: '', employerName: '',
          occupation: '', yearsAtEmployment: '', monthsAtEmployment: '', income: '', payFrequency: '', dependents: '', rentMortgage: '',
          otherLoans: '', termsConsent: false, privacyConsent: false,
        });
        setCompletedSteps(new Set());
        setCurrentStep(1);
      } else {
        setErrorMessages({ submit: data.message || 'Failed to submit application' });
        setShowError(true);
      }
    } catch (error) {
      setErrorMessages({ submit: 'An error occurred. Please try again.' });
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepCompleted = (step) => completedSteps.has(step);
  const canAccessStep = (step) => step <= Math.max(...completedSteps, 0) || step === 1;
  const getStepStatus = (step) => {
    if (step === currentStep) return 'active';
    if (isStepCompleted(step)) return 'completed';
    if (!canAccessStep(step)) return 'disabled';
    return 'accessible';
  };

  return (
    <>
      <main className="flex flex-col items-center py-8 px-6 bg-background-dark">
        <div className="w-full max-w-7xl ">
          <div className="mb-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Secure Finance Application
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-black">Quick Finance Application</h1>
              <p className="mt-4 text-base md:text-lg text-text-muted font-light">Apply for vehicle finance with a simple, secure 4-step process.</p>
            </div>
          </div>

          <form className="flex flex-col relative border border-black" ref={formRef}>


            <input checked={currentStep === 1} className="peer/step1 hidden" id="step1" name="steps" type="radio" readOnly />
            <input checked={currentStep === 2} className="peer/step2 hidden" id="step2" name="steps" type="radio" readOnly />
            <input checked={currentStep === 3} className="peer/step3 hidden" id="step3" name="steps" type="radio" readOnly />
            <input checked={currentStep === 4} className="peer/step4 hidden" id="step4" name="steps" type="radio" readOnly />

            <div className="bg-background-dark overflow-hidden">
              <nav className="grid grid-cols-4 gap-0 relative z-10 w-full bg-card-dark/30">
                {[1, 2, 3, 4].map((step) => {
                  const status = getStepStatus(step);
                  const stepLabels = ['Personal', 'Residential', 'Employment', 'Financial'];
                  const stepIcons = ['person', 'home', 'work', 'payments'];
                  const isAccessible = canAccessStep(step);
                  return (
                    <button key={step} type="button" onClick={() => isAccessible && handleStepChange(step)} disabled={!isAccessible}
                      className={`relative flex flex-col items-center justify-center py-4 transition-all duration-300 cursor-pointer group
                        ${status === 'active' ? 'bg-card-dark' :
                          status === 'completed' ? 'bg-card-dark/60 hover:bg-card-dark' :
                          status === 'disabled' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-card-dark/50'}`}>
                      <div className="flex items-center gap-2 relative z-10">
                        <div className={`size-8 rounded-full flex items-center justify-center border transition-all duration-300
                          ${status === 'active' ? 'border-primary bg-primary text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                            status === 'completed' ? 'border-primary bg-primary/20 text-primary' :
                            status === 'disabled' ? 'border-border-grey bg-background-dark text-text-muted' :
                            'border-border-grey bg-card-dark text-text-muted hover:border-primary'}`}>
                          {status === 'completed' ? <span className="material-symbols-outlined text-sm">check</span> :
                            <span className="material-symbols-outlined text-sm">{stepIcons[step - 1]}</span>}
                        </div>
                        <span className="hidden md:block text-xs font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: status === 'active' ? '#FFFFFF' : status === 'completed' ? '#D62828' :
                            status === 'disabled' ? '#002470' : '#9CA3AF' }}>
                          {stepLabels[step - 1]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
                            <div className="bg-background-dark">
                {/* <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                  <span>Progress</span>
                  <span className="text-primary">{(currentStep - 1) * 25}%</span>
                </div> */}
                <div className="h-1 w-full overflow-hidden bg-input-bg">
                  <div className="h-full bg-primary shadow-[0_0_12px_#D4AF37] transition-all duration-700 ease-out"
                    style={{ width: `${(currentStep - 1) * 25}%` }}></div>
                </div>
              </div>


              {/* STEP 1 */}
              <section className={`${currentStep !== 1 ? 'hidden' : 'block'} animate-fade-in-slide p-4 sm:p-6 md:p-10`}>
                <div className="mb-2 flex flex-col gap-4 md:gap-6 border-b-2 border-border-grey pb-4">
                  <div className="flex flex-row items-start gap-4 md:gap-6">
                    <div className="flex size-14 md:size-16 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: '#002470', color: '#ffffff' }}>
                      <span className="material-symbols-outlined text-3xl md:text-4xl">person</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-tight">Personal Details</h2>
                  </div>
                  <p className="text-sm md:text-base text-text-muted">Please provide your legal identification details.</p>
                </div>

                <div className="mb-8">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-white px-4 py-3 rounded-lg" style={{ backgroundColor: '#002470', borderBottom: '2px solid #00173f' }}>Name Information</h3>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">First Name <span className="text-red-500">*</span></span>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g. John"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      {errorMessages.firstName && <span className="text-xs text-red-400">{errorMessages.firstName}</span>}
                    </label>
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Middle Name</span>
                      <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Optional"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.middleName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      {errorMessages.middleName && <span className="text-xs text-red-400">{errorMessages.middleName}</span>}
                    </label>
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Last Name <span className="text-red-500">*</span></span>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Doe"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      {errorMessages.lastName && <span className="text-xs text-red-400">{errorMessages.lastName}</span>}
                    </label>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-white px-4 py-3 rounded-lg" style={{ backgroundColor: '#002470', borderBottom: '2px solid #00173f' }}>Personal Information</h3>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted transition-colors">Date of Birth <span className="text-red-500">*</span></span>
                      <div className="flex gap-3 md:gap-4">
                        <input type="number" name="dateOfBirthDay" value={formData.dateOfBirthDay} onChange={handleInputChange} placeholder="Day" min="1" max="31"
                          className={`h-12 w-full rounded-lg border bg-input-bg px-3 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                        <input type="number" name="dateOfBirthMonth" value={formData.dateOfBirthMonth} onChange={handleInputChange} placeholder="Month" min="1" max="12"
                          className={`h-12 w-full rounded-lg border bg-input-bg px-3 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                        <input type="number" name="dateOfBirthYear" value={formData.dateOfBirthYear} onChange={handleInputChange} placeholder="Year" min={new Date().getFullYear() - 120} max={new Date().getFullYear() - 16}
                          className={`h-12 w-full rounded-lg border bg-input-bg px-3 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      </div>
                      {errorMessages.dateOfBirth && <span className="text-xs text-red-400">{errorMessages.dateOfBirth}</span>}
                    </div>
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Marital Status <span className="text-red-500">*</span></span>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black focus:ring-1 outline-none transition-all ${
                          errorMessages.maritalStatus ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`}>
                        <option value="">Select status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="defacto">De Facto</option>
                        <option value="divorced">Divorced</option>
                      </select>
                      {errorMessages.maritalStatus && <span className="text-xs text-red-400">{errorMessages.maritalStatus}</span>}
                    </label>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-white px-4 py-3 rounded-lg" style={{ backgroundColor: '#002470', borderBottom: '2px solid #00173f' }}>Contact Information</h3>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Email Address <span className="text-red-500">*</span></span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">mail</span>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john.doe@example.com"
                          className={`h-12 w-full rounded-lg border bg-input-bg pl-12 pr-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      </div>
                      {errorMessages.email && <span className="text-xs text-red-400">{errorMessages.email}</span>}
                    </label>
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Mobile Phone <span className="text-red-500">*</span></span>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">smartphone</span>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="021 123 4567"
                          className={`h-12 w-full rounded-lg border bg-input-bg pl-12 pr-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      </div>
                      {errorMessages.phone && <span className="text-xs text-red-400">{errorMessages.phone}</span>}
                    </label>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-white px-4 py-3 rounded-lg" style={{ backgroundColor: '#002470', borderBottom: '2px solid #00173f' }}>Driver's Licence Details</h3>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Drivers Licence Type <span className="text-red-500">*</span></span>
                      <select name="driverLicenceType" value={formData.driverLicenceType} onChange={handleInputChange}
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black focus:ring-1 outline-none transition-all ${
                          errorMessages.driverLicenceType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`}>
                        <option value="">Select type</option>
                        <option value="learners">Learners Licence</option>
                        <option value="restricted">Restricted Licence</option>
                        <option value="full">Full Licence</option>
                        <option value="overseas">Overseas Licence</option>
                      </select>
                      {errorMessages.driverLicenceType && <span className="text-xs text-red-400">{errorMessages.driverLicenceType}</span>}
                    </label>
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Drivers Licence Number <span className="text-red-500">*</span></span>
                      <input type="text" name="driverLicenceNumber" value={formData.driverLicenceNumber} onChange={handleInputChange} placeholder="e.g. AA000000" maxLength="8"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all uppercase ${
                          errorMessages.driverLicenceNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      {errorMessages.driverLicenceNumber && <span className="text-xs text-red-400">{errorMessages.driverLicenceNumber}</span>}
                    </label>
                    <label className="flex flex-col gap-2 group">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Version Number <span className="text-red-500">*</span></span>
                      <input type="text" name="versionNumber" value={formData.versionNumber} onChange={handleInputChange} maxLength="3" placeholder="e.g. 123"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.versionNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      {errorMessages.versionNumber && <span className="text-xs text-red-400">{errorMessages.versionNumber}</span>}
                    </label>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted transition-colors">Licence Expiry <span className="text-red-500">*</span></span>
                      <div className="flex gap-3 md:gap-4">
                        <input type="number" name="licenceExpiryDay" value={formData.licenceExpiryDay} onChange={handleInputChange} placeholder="Day" min="1" max="31"
                          className={`h-12 w-full rounded-lg border bg-input-bg px-3 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.licenceExpiry ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                        <input type="number" name="licenceExpiryMonth" value={formData.licenceExpiryMonth} onChange={handleInputChange} placeholder="Month" min="1" max="12"
                          className={`h-12 w-full rounded-lg border bg-input-bg px-3 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.licenceExpiry ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                        <input type="number" name="licenceExpiryYear" value={formData.licenceExpiryYear} onChange={handleInputChange} placeholder="Year" min={new Date().getFullYear()} max={new Date().getFullYear() + 30}
                          className={`h-12 w-full rounded-lg border bg-input-bg px-3 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                            errorMessages.licenceExpiry ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      </div>
                      {errorMessages.licenceExpiry && <span className="text-xs text-red-400">{errorMessages.licenceExpiry}</span>}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-white px-4 py-3 rounded-lg" style={{ backgroundColor: '#002470', borderBottom: '2px solid #00173f' }}>Licence Documentation</h3>
                  <p className="text-sm text-text-muted mb-6">Please upload clear images or PDFs of both sides of your driver's licence.</p>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <label className="flex flex-col gap-4 group cursor-pointer">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-hover:text-primary transition-colors">Licence Front (Image/PDF)</span>
                      <div className={`relative flex items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 p-8 ${
                        formData.licenceFront ? 'border-blue-600 bg-blue-50' :
                        errorMessages.licenceFront ? 'border-red-500 bg-red-500/10' :
                        'border-border-grey bg-input-bg group-hover:border-primary group-hover:bg-primary/5'}`} style={formData.licenceFront ? { borderColor: '#002470', backgroundColor: '#E8F0F8' } : {}}>
                        <input type="file" name="licenceFront" onChange={handleInputChange} accept=".jpg,.jpeg,.png,.pdf,.svg,.webp,.gif,.tiff,.tif" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                          {formData.licenceFront ? (
                            <>
                              <span className="material-symbols-outlined text-3xl" style={{ color: '#002470' }}>check_circle</span>
                              <span className="text-sm font-semibold text-center break-all" style={{ color: '#002470' }}>{formData.licenceFront.name}</span>
                              <span className="text-xs text-text-muted">Click to replace</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-3xl text-text-muted group-hover:text-primary transition-colors">cloud_upload</span>
                              <span className="text-sm font-semibold text-text-muted group-hover:text-primary transition-colors">Click to upload or drag</span>
                              <span className="text-xs text-text-muted">JPG, JPEG, PNG, PDF, SVG, WebP, GIF, TIFF (max 5MB)</span>
                            </>
                          )}
                        </div>
                      </div>
                      {errorMessages.licenceFront && <span className="text-xs text-red-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errorMessages.licenceFront}</span>}
                    </label>

                    <label className="flex flex-col gap-4 group cursor-pointer">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-hover:text-primary transition-colors">Licence Back (Image/PDF) </span>
                      <div className={`relative flex items-center justify-center rounded-lg border-2 border-dashed transition-all duration-300 p-8 ${
                        formData.licenceBack ? 'border-blue-600 bg-blue-50' :
                        errorMessages.licenceBack ? 'border-red-500 bg-red-500/10' :
                        'border-border-grey bg-input-bg group-hover:border-primary group-hover:bg-primary/5'}`} style={formData.licenceBack ? { borderColor: '#002470', backgroundColor: '#E8F0F8' } : {}}>
                        <input type="file" name="licenceBack" onChange={handleInputChange} accept=".jpg,.jpeg,.png,.pdf,.svg,.webp,.gif,.tiff,.tif"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-3 pointer-events-none">
                          {formData.licenceBack ? (
                            <>
                              <span className="material-symbols-outlined text-3xl" style={{ color: '#002470' }}>check_circle</span>
                              <span className="text-sm font-semibold text-center break-all" style={{ color: '#002470' }}>{formData.licenceBack.name}</span>
                              <span className="text-xs text-text-muted">Click to replace</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-3xl text-text-muted group-hover:text-primary transition-colors">cloud_upload</span>
                              <span className="text-sm font-semibold text-text-muted group-hover:text-primary transition-colors">Click to upload or drag</span>
                              <span className="text-xs text-text-muted">JPG, JPEG, PNG, PDF, SVG, WebP, GIF, TIFF (max 5MB)</span>
                            </>
                          )}
                        </div>
                      </div>
                      {errorMessages.licenceBack && <span className="text-xs text-red-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errorMessages.licenceBack}</span>}
                    </label>
                  </div>
                </div>

                <div className="mt-10 flex justify-end border-t border-border-grey pt-8">
                  <button type="button" onClick={handleNextStep} className="cursor-pointer flex h-12 items-center justify-center gap-3 rounded-lg bg-primary px-8 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-primary-hover hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    Next Step <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </section>

              {/* STEP 2 */}
              <section className={`${currentStep !== 2 ? 'hidden' : 'block'} animate-fade-in-slide p-4 sm:p-6 md:p-10`}>
                <div className="mb-2 flex flex-col gap-4 md:gap-6 border-b-2 border-border-grey pb-4">
                  <div className="flex flex-row items-start gap-4 md:gap-6">
                    <div className="flex size-14 md:size-16 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: '#002470', color: '#ffffff' }}>
                      <span className="material-symbols-outlined text-3xl md:text-4xl">home</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-tight">Residential Information</h2>
                  </div>
                  <p className="text-sm md:text-base text-text-muted">Where are you currently living?</p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <label className="flex flex-col gap-2 md:col-span-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Current Address <span className="text-red-500">*</span></span>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">search</span>
                      <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="Start typing your address..."
                        className={`h-12 w-full rounded-lg border bg-input-bg pl-12 pr-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.currentAddress ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    </div>
                    {errorMessages.currentAddress && <span className="text-xs text-red-400">{errorMessages.currentAddress}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Suburb <span className="text-red-500">*</span></span>
                    <input type="text" name="suburb" value={formData.suburb} onChange={handleInputChange} placeholder="e.g. Manukau"
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                        errorMessages.suburb ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    {errorMessages.suburb && <span className="text-xs text-red-400">{errorMessages.suburb}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Postcode <span className="text-red-500">*</span></span>
                    <input type="number" name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="e.g. 2104" maxLength="4"
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                        errorMessages.postcode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    {errorMessages.postcode && <span className="text-xs text-red-400">{errorMessages.postcode}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Residential Status <span className="text-red-500">*</span></span>
                    <select name="residentialStatus" value={formData.residentialStatus} onChange={handleInputChange}
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black focus:ring-1 outline-none transition-all ${
                        errorMessages.residentialStatus ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`}>
                      <option value="">Select status</option>
                      <option value="renting">Renting</option>
                      <option value="owner">Home Owner</option>
                      <option value="boarding">Boarding/Parents</option>
                    </select>
                    {errorMessages.residentialStatus && <span className="text-xs text-red-400">{errorMessages.residentialStatus}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Time at Current Address <span className="text-red-500">*</span></span>
                    <div className="flex gap-4">
                      <input type="number" name="yearsAtAddress" value={formData.yearsAtAddress} onChange={handleInputChange} placeholder="Years" min="0"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.yearsAtAddress ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      <input type="number" name="monthsAtAddress" value={formData.monthsAtAddress} onChange={handleInputChange} placeholder="Months" min="0" max="11"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.monthsAtAddress ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    </div>
                    {(errorMessages.yearsAtAddress || errorMessages.monthsAtAddress) && 
                      <span className="text-xs text-red-400">{errorMessages.yearsAtAddress || errorMessages.monthsAtAddress}</span>}
                  </label>
                </div>
                <div className="mt-10 flex justify-between border-t border-border-grey pt-8 gap-4">
                  <button type="button" onClick={handlePreviousStep} className="cursor-pointer flex h-12 items-center justify-center gap-2 rounded-lg border border-border-grey bg-transparent px-8 text-sm font-bold uppercase tracking-wide text-text-muted transition-all hover:bg-white/5 hover:text-black ">
                    <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                  </button>
                  <button type="button" onClick={handleNextStep} className="cursor-pointer flex h-12 items-center justify-center gap-3 rounded-lg bg-primary px-8 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-primary-hover hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    Next Step <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </section>

              {/* STEP 3 */}
              <section className={`${currentStep !== 3 ? 'hidden' : 'block'} animate-fade-in-slide p-4 sm:p-6 md:p-10`}>
                <div className="mb-2 flex flex-col gap-4 md:gap-6 border-b-2 border-border-grey pb-4">
                  <div className="flex flex-row items-start gap-4 md:gap-6">
                    <div className="flex size-14 md:size-16 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: '#002470', color: '#ffffff' }}>
                      <span className="material-symbols-outlined text-3xl md:text-4xl">work</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-tight">Employment Details</h2>
                  </div>
                  <p className="text-sm md:text-base text-text-muted">Tell us about your current employment.</p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Employment Status <span className="text-red-500">*</span></span>
                    <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange}
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black focus:ring-1 outline-none transition-all ${
                        errorMessages.employmentStatus ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`}>
                      <option value="">Select status</option>
                      <option value="fulltime">Full Time</option>
                      <option value="parttime">Part Time</option>
                      <option value="casual">Casual</option>
                      <option value="self">Self Employed</option>
                      <option value="beneficiary">Beneficiary</option>
                    </select>
                    {errorMessages.employmentStatus && <span className="text-xs text-red-400">{errorMessages.employmentStatus}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Employer Name <span className="text-red-500">*</span></span>
                    <input type="text" name="employerName" value={formData.employerName} onChange={handleInputChange} placeholder="Company Name"
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                        errorMessages.employerName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    {errorMessages.employerName && <span className="text-xs text-red-400">{errorMessages.employerName}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Occupation <span className="text-red-500">*</span></span>
                    <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="Job Title"
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                        errorMessages.occupation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    {errorMessages.occupation && <span className="text-xs text-red-400">{errorMessages.occupation}</span>}
                  </label>
                </div>
                <div className="mb-8 mt-6">
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Time at Current Employment <span className="text-red-500">*</span></span>
                    <div className="flex gap-4">
                      <input type="number" name="yearsAtEmployment" value={formData.yearsAtEmployment} onChange={handleInputChange} placeholder="Years" min="0"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.yearsAtEmployment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                      <input type="number" name="monthsAtEmployment" value={formData.monthsAtEmployment} onChange={handleInputChange} placeholder="Months" min="0" max="11"
                        className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.monthsAtEmployment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    </div>
                    {(errorMessages.yearsAtEmployment || errorMessages.monthsAtEmployment) && 
                      <span className="text-xs text-red-400">{errorMessages.yearsAtEmployment || errorMessages.monthsAtEmployment}</span>}
                  </label>
                  </div>
                <div className="mt-10 flex justify-between border-t border-border-grey pt-8 gap-4">
                  <button type="button" onClick={handlePreviousStep} className="cursor-pointer flex h-12 items-center justify-center gap-2 rounded-lg border border-border-grey bg-transparent px-8 text-sm font-bold uppercase tracking-wide text-text-muted transition-all hover:bg-white/5 hover:text-black ">
                    <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                  </button>
                  <button type="button" onClick={handleNextStep} className="cursor-pointer flex h-12 items-center justify-center gap-3 rounded-lg bg-primary px-8 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-primary-hover hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    Next Step <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </section>

              {/* STEP 4 */}
              <section className={`${currentStep !== 4 ? 'hidden' : 'block'} animate-fade-in-slide p-4 sm:p-6 md:p-10`}>
                <div className="mb-2 flex flex-col gap-4 md:gap-6 border-b-2 border-border-grey pb-4">
                  <div className="flex flex-row items-start gap-4 md:gap-6">
                    <div className="flex size-14 md:size-16 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: '#002470', color: '#ffffff' }}>
                      <span className="material-symbols-outlined text-3xl md:text-4xl">payments</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-tight">Financial Information</h2>
                  </div>
                  <p className="text-sm md:text-base text-text-muted">Your income and expense details help us assess affordability.</p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Income (After Tax) <span className="text-red-500">*</span></span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary font-bold">$</span>
                      <input type="number" name="income" value={formData.income} onChange={handleInputChange} placeholder="0.00" step="0.01"
                        className={`h-12 w-full rounded-lg border bg-input-bg pl-10 pr-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.income ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    </div>
                    {errorMessages.income && <span className="text-xs text-red-400">{errorMessages.income}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Pay Frequency</span>
                    <select name="payFrequency" value={formData.payFrequency} onChange={handleInputChange} className="h-12 w-full rounded-lg border border-border-grey bg-input-bg px-4 text-black focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                      <option value="">Select Pay Frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Dependents <span className="text-red-500">*</span></span>
                    <input type="number" name="dependents" value={formData.dependents} onChange={handleInputChange} placeholder="0" max="20"
                      className={`h-12 w-full rounded-lg border bg-input-bg px-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                        errorMessages.dependents ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    {errorMessages.dependents && <span className="text-xs text-red-400">{errorMessages.dependents}</span>}
                  </label>
                </div>
                <h3 className="mt-10 mb-6 text-xs font-bold uppercase tracking-widest text-text-muted border-b border-border-grey pb-2">Expenses & Commitments</h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Rent / Mortgage (Weekly) <span className="text-red-500">*</span></span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary font-bold">$</span>
                      <input type="number" name="rentMortgage" value={formData.rentMortgage} onChange={handleInputChange} placeholder="0.00" step="0.01"
                        className={`h-12 w-full rounded-lg border bg-input-bg pl-10 pr-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.rentMortgage ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    </div>
                    {errorMessages.rentMortgage && <span className="text-xs text-red-400">{errorMessages.rentMortgage}</span>}
                  </label>
                  <label className="flex flex-col gap-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted group-focus-within:text-primary transition-colors">Other Loans (Weekly) <span className="text-red-500">*</span></span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary font-bold">$</span>
                      <input type="number" name="otherLoans" value={formData.otherLoans} onChange={handleInputChange} placeholder="0.00" step="0.01"
                        className={`h-12 w-full rounded-lg border bg-input-bg pl-10 pr-4 text-black placeholder-text-muted/50 focus:ring-1 outline-none transition-all ${
                          errorMessages.otherLoans ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-border-grey focus:border-primary focus:ring-primary'}`} />
                    </div>
                    {errorMessages.otherLoans && <span className="text-xs text-red-400">{errorMessages.otherLoans}</span>}
                  </label>
                </div>
                <h3 className="mt-10 mb-6 text-xs font-bold uppercase tracking-widest text-text-muted border-b border-border-grey pb-2">Privacy & Consent</h3>
                <div className="mb-8 flex flex-col gap-6">
                  <label className="flex items-start gap-4 cursor-pointer group bg-input-bg p-4 rounded-lg border border-border-grey transition-colors hover:border-primary/50">
                    <div className="relative flex items-center mt-0.5">
                      <input type="checkbox" name="termsConsent" checked={formData.termsConsent} onChange={handleInputChange}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded border border-border-grey bg-background-dark checked:bg-primary checked:border-primary transition-all" />
                      <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 text-lg pointer-events-none font-bold">check</span>
                    </div>
                    <span className="text-sm text-text-muted group-hover:text-black transition-colors leading-relaxed">I confirm that the information provided is true and correct. I authorize Best Drive Motors to perform a credit check and use my details for the purpose of assessing this finance application. <span className="text-red-500">*</span></span>
                  </label>
                  {errorMessages.termsConsent && <span className="text-xs text-red-400">{errorMessages.termsConsent}</span>}
                  <label className="flex items-start gap-4 cursor-pointer group bg-input-bg p-4 rounded-lg border border-border-grey transition-colors hover:border-primary/50">
                    <div className="relative flex items-center mt-0.5">
                      <input type="checkbox" name="privacyConsent" checked={formData.privacyConsent} onChange={handleInputChange}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded border border-border-grey bg-background-dark checked:bg-primary checked:border-primary transition-all" />
                      <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 text-lg pointer-events-none font-bold">check</span>
                    </div>
                    <span className="text-sm text-text-muted group-hover:text-black transition-colors leading-relaxed">
                      I agree to the <a className="text-primary hover:text-primary-hover hover:underline" target="_blank" href="/privacy">Privacy Policy</a> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errorMessages.privacyConsent && <span className="text-xs text-red-400">{errorMessages.privacyConsent}</span>}
                </div>
                <div className="flex flex-col items-center gap-6 pt-8 mt-10 border-t border-border-grey">
                  <div className="flex w-full flex-col md:flex-row justify-between items-center gap-4">
                    <button type="button" onClick={handlePreviousStep} className="order-2 md:order-1 cursor-pointer flex h-14 w-full md:w-32 items-center justify-center gap-2 rounded-lg border border-border-grey bg-transparent text-sm font-bold uppercase tracking-wide text-text-muted transition-all hover:bg-white/5 hover:text-black ">
                      <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                    </button>
                    <button type="submit" onClick={handleSubmit} disabled={isLoading} className="order-1 md:order-2 w-full flex-1 rounded-lg bg-primary py-4 text-base font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.01] hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                  {/* <div className="flex items-center gap-2 text-xs text-text-muted/60">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Your data is encrypted and secure
                  </div> */}
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="Your finance application has been submitted successfully! We will review it shortly and contact you within 24 hours." />
      <ErrorModal isOpen={showError} onClose={() => setShowError(false)} errors={errorMessages} message="Please correct the errors below to continue:" />
      <LoadingModal isOpen={isLoading} message="Submitting your finance application..." />

      <style>{`
        @keyframes fade-in-slide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-slide { animation: fade-in-slide 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </>
  );
}