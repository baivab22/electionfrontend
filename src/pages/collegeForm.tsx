import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  Building, 
  Users, 
  BookOpen, 
  Zap, 
  Wifi, 
  Shield, 
  Leaf,
  Upload,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Calendar,
  Phone,
  Mail,
  Globe,
  Home
} from 'lucide-react';

const CollegeDataForm = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [expandedSections, setExpandedSections] = useState([0]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedSections, setSavedSections] = useState(new Set());
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    // Section 1: General College Information
    collegeName: '',
    campusType: '',
    establishmentDate: '',
    collegeId: '',
    principalName: '',
    principalContact: '',
    principalEmail: '',
    mainPhone: '',
    officialEmail: '',
    adminName: '',
    adminMobile: '',
    accountName: '',
    accountMobile: '',
    website: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonPhone: '',
    contactPersonEmail: '',

    // Section 2: Location Details
    province: '',
    district: '',
    localLevel: '',
    wardNo: '',
    streetName: '',
    landmark: '',
    coordinates: '',
    latitude: '',
    longitude: '',
    mapsLink: '',

    // Section 3: Infrastructure & Facilities
    totalLandBigaha: '',
    totalLandKatha: '',
    totalLandDhur: '',
    totalLandRopani: '',
    totalLandAna: '',
    totalLandDaam: '',
    totalLandPaisa: '',
    landAreaSquareMeter: '',
    landAcquisitionDate: '',
    landTaxStatus: '',
    areaWithLalpurja: '',
    lalpurjaAddress: '',
    areaWithBhogadhikar: '',
    bhogadhikarAddress: '',
    areaLocalGov: '',
    localGovAddress: '',
    areaOtherSources: '',
    otherSourcesAddress: '',
    areaBuildingInfra: '',
    areaPlayground: '',
    areaForestShrubs: '',
    areaPlantationGarden: '',
    areaLeaseContract: '',
    incomeFromLand: '',
    landEncroachment: '',
    encroachmentDetails: '',
    commercialUses: '',
    commercialPlan: '',
    masterPlan: '',
    masterPlanSuggestions: '',

    // Section 4: Buildings and Rooms
    buildings: {
      classroom: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      library: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      laboratory: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      canteen: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      computerRoom: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      securityQuarters: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      guestHouse: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      lectureHalls: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      rmcOffice: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      facultyRooms: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      examHall: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      auditorium: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      dormitories: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      indoorGames: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      staffHousing: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      gymnasium: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      outdoorSports: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      counsellingCenter: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      parkingLots: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      powerSupply: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      banksATM: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      studentUnion: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      medicalCenter: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' },
      recreational: { buildings: '', rooms: '', avgSize: '', capacity: '', condition: '' }
    },

    // Section 5: Health, Hygiene & Sanitation
    maleToilets: '',
    femaleToilets: '',
    disabledToilets: '',
    toiletCondition: '',
    ventilation: '',
    lighting: '',
    cleaningFrequency: '',
    sanitaryDisposal: '',
    waterSupplyType: '',
    waterAvailability: '',
    waterQuality: '',
    waterTestingFreq: '',
    drinkingWaterStations: '',
    waterTankCondition: '',
    handwashingStations: '',
    soapSanitizer: '',
    commonAreasCleanliness: '',
    drainageCondition: '',
    cleaningDisinfection: '',
    firstAidKit: '',
    healthInspections: '',
    medicalAssistance: '',
    healthAwareness: '',
    emergencyContact: '',
    fireSafety: '',
    fireExitAccess: '',
    wasteDisposalType: '',
    dustbins: '',
    wasteSegregation: '',
    wasteCollection: '',
    wasteAreaCondition: '',
    recyclingPractices: '',
    greenSpaces: '',
    sustainablePractices: '',
    renewableEnergy: '',

    // Section 6: Academic Programs & Enrollment
    totalFaculties: '',
    programsOffered: '',
    totalStudents: '',
    maleStudents: '',
    femaleStudents: '',
    otherStudents: '',
    programBreakdown: [],

    // Section 7: Project Planning
    immediateConstruction: ['', '', ''],
    futureConstruction: ['', '', ''],
    priorities: ['', '', ''],
    ongoingProjects: [],

    // Section 8: Academic & Administrative Staff
    academicStaff: [],
    adminStaff: [],

    // Section 9: Educational Tools & Technology
    classroomTech: {
      projectors: { available: false, plans: '' },
      smartBoards: { available: false, plans: '' },
      wifi: { available: false, plans: '' },
      powerBackup: { available: false, plans: '' },
      microphones: { available: false, plans: '' }
    },
    libraryResources: {
      physicalBooks: { available: false, plans: '' },
      eLibrary: { available: false, plans: '' },
      databases: { available: false, plans: '' },
      computerStations: { available: false, plans: '' },
      printingServices: { available: false, plans: '' }
    },
    labEquipment: {
      scienceLab: { available: false, plans: '' },
      engineeringLab: { available: false, plans: '' },
      itSupport: { available: false, plans: '' },
      simulationSoftware: { available: false, plans: '' },
      agricultureLab: { available: false, plans: '' }
    },
    onlineLearning: {
      lms: { available: false, plans: '' },
      onlineCourses: { available: false, plans: '' },
      remoteLearning: { available: false, plans: '' },
      recordedLectures: { available: false, plans: '' },
      workshops: { available: false, plans: '' },
      specialProvisions: { available: false, plans: '' },
      brailleBooks: { available: false, plans: '' },
      signLanguage: { available: false, plans: '' }
    },

    // Section 10: Student Enrollment and Graduation (5 years)
    enrollmentData: {
      2077: { masterEnrollment: '', masterAppeared: '', masterPassed: '', bachelorEnrollment: '', bachelorAppeared: '', bachelorPassed: '' },
      2078: { masterEnrollment: '', masterAppeared: '', masterPassed: '', bachelorEnrollment: '', bachelorAppeared: '', bachelorPassed: '' },
      2079: { masterEnrollment: '', masterAppeared: '', masterPassed: '', bachelorEnrollment: '', bachelorAppeared: '', bachelorPassed: '' },
      2080: { masterEnrollment: '', masterAppeared: '', masterPassed: '', bachelorEnrollment: '', bachelorAppeared: '', bachelorPassed: '' },
      2081: { masterEnrollment: '', masterAppeared: '', masterPassed: '', bachelorEnrollment: '', bachelorAppeared: '', bachelorPassed: '' }
    },

    // Section 11-18: Performance & Management
    expenditureFiveYears: '',
    auditReportsFiveYears: '',
    physicalInspectionReports: '',
    
    // Operational Management
    processesStreamlined: '',
    turnaroundTime: '',
    operationalCostReduction: '',
    processingTime: '',
    budgetVariance: '',
    efficiencyReviews: '',
    improvementInitiatives: '',
    sustainabilityAlignment: '',

    // Audit & Risk Management
    commonIrregularities: '',
    resolutionTime: '',
    avgResolutionTime: '',
    irregularitiesQuarter: '',
    avgResolutionDays: '',
    complianceRate: '',
    recurringIssues: '',
    riskMitigation: '',

    // Stakeholder Engagement
    stakeholderRating: '',
    communityEngagement: '',
    satisfactionRating: '',
    feedbackSubmissions: '',
    engagementEvents: '',
    newPartnerships: '',
    safetyIncidents: '',

    // Digital Infrastructure
    systemUptime: '',
    digitalPlatformEffectiveness: '',
    currentUptime: '',
    itIssuesMonthly: '',
    userSatisfactionScore: '',
    digitalToolsUpdated: '',
    operationsDigitized: '',

    // Environmental Sustainability
    energyConsumption: '',
    wasteManagement: '',
    avgEnergyConsumption: '',
    recyclingPercentage: '',
    carbonFootprint: '',
    greenCertifications: '',
    renewableEnergyPercentage: '',

    // Financial Health
    revenueStreams: '',
    budgetManagement: '',
    budgetVarianceFinance: '',
    revenueStreamCount: '',
    fundingGap: '',

    // Human Resources
    employeeTurnover: '',
    trainingImpact: '',
    monthlyTurnover: '',
    trainingHours: '',
    employeeSatisfaction: '',
    openPositions: '',

    // Campus Security & Safety
    emergencyDrills: '',
    incidentResponseTime: '',
    drillsLastMonth: '',
    avgIncidentResponse: '',
    securityBreaches: '',
    securityPersonnelRatio: '',

    // Transportation & Mobility
    transportationAccess: '',
    parkingUtilization: '',
    shuttleWaitTime: '',
    parkingOccupancy: '',
    transportationOptions: '',
    trafficIncidents: '',

    // Student Life & Activities
    clubsActivity: '',
    participationLevel: '',
    participationRate: '',
    eventsLastSemester: '',
    studentLifeSatisfaction: '',
    newClubsYear: '',

    // Research & Innovation
    researchVolume: '',
    partnershipEffectiveness: '',
    activeProjects: '',
    grantSuccessRate: '',
    publicationsPerFaculty: '',
    externalPartnerships: '',

    // Governance & Policy
    policyCompliance: '',
    governanceTransparency: '',
    complianceRateGov: '',
    policyBreaches: '',
    violationResolutionTime: '',
    governanceReviews: '',

    // Communication Systems
    communicationChannels: '',
    crisisInformation: '',
    communicationTime: '',
    communicationSatisfaction: '',
    crisisDrills: '',
    inquiryResponseTime: ''
  });

  const sections = [
    { id: 0, title: 'General Information', icon: Building, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { id: 1, title: 'Location Details', icon: MapPin, color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { id: 2, title: 'Infrastructure & Land', icon: Home, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { id: 3, title: 'Buildings & Facilities', icon: Building, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
    { id: 4, title: 'Health & Sanitation', icon: Shield, color: 'bg-gradient-to-r from-teal-500 to-teal-600' },
    { id: 5, title: 'Academic Programs', icon: BookOpen, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { id: 6, title: 'Project Planning', icon: Zap, color: 'bg-gradient-to-r from-red-500 to-red-600' },
    { id: 7, title: 'Staff Information', icon: Users, color: 'bg-gradient-to-r from-pink-500 to-pink-600' },
    { id: 8, title: 'Technology & Resources', icon: Wifi, color: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { id: 9, title: 'Performance & Analytics', icon: CheckCircle, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    { id: 10, title: 'Sustainability', icon: Leaf, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, template = {}) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const saveSection = (sectionId) => {
    setSavedSections(prev => new Set([...prev, sectionId]));
    // Here you could also save to localStorage or make an API call
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.collegeName) errors.collegeName = 'College name is required';
    if (!formData.campusType) errors.campusType = 'Campus type is required';
    if (!formData.principalName) errors.principalName = 'Principal name is required';
    if (!formData.principalEmail) errors.principalEmail = 'Principal email is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/college-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Form submitted successfully!');
        setSavedSections(new Set(sections.map(s => s.id)));
      } else {
        alert('Error submitting form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error occurred');
    }
    setLoading(false);
  };

  const InputField = ({ label, field, type = 'text', required = false, placeholder = '', error = null, icon = null }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
            error 
              ? 'border-red-300 focus:border-red-500 bg-red-50' 
              : 'border-gray-200 focus:border-blue-500 focus:bg-white'
          } hover:border-gray-300`}
          required={required}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{error}</p>}
    </div>
  );

  const SelectField = ({ label, field, options, required = false, error = null }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`w-full px-3 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
          error 
            ? 'border-red-300 focus:border-red-500 bg-red-50' 
            : 'border-gray-200 focus:border-blue-500 focus:bg-white'
        } hover:border-gray-300`}
        required={required}
      >
        <option value="">Select...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" />{error}</p>}
    </div>
  );

  const TextareaField = ({ label, field, rows = 3, placeholder = '', required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        rows={rows}
        value={formData[field] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white hover:border-gray-300 transition-all duration-300"
        required={required}
      />
    </div>
  );

  const SectionHeader = ({ section, isExpanded, onClick, isSaved }) => (
    <div 
      className={`${section.color} text-white p-6 cursor-pointer flex items-center justify-between rounded-xl mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
          <section.icon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">{section.title}</h2>
          <p className="text-sm opacity-90">Section {section.id + 1} of {sections.length}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isSaved && <CheckCircle size={20} className="text-green-300" />}
        {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
      </div>
    </div>
  );

  const BuildingRow = ({ type, label, data, onChange }) => (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
      <td className="py-3 px-2"><input type="number" value={data.buildings} onChange={(e) => onChange('buildings', e.target.value)} className="w-full px-2 py-1 border rounded text-center" /></td>
      <td className="py-3 px-2"><input type="number" value={data.rooms} onChange={(e) => onChange('rooms', e.target.value)} className="w-full px-2 py-1 border rounded text-center" /></td>
      <td className="py-3 px-2"><input type="number" value={data.avgSize} onChange={(e) => onChange('avgSize', e.target.value)} className="w-full px-2 py-1 border rounded text-center" /></td>
      <td className="py-3 px-2"><input type="number" value={data.capacity} onChange={(e) => onChange('capacity', e.target.value)} className="w-full px-2 py-1 border rounded text-center" /></td>
      <td className="py-3 px-2">
        <select value={data.condition} onChange={(e) => onChange('condition', e.target.value)} className="w-full px-2 py-1 border rounded">
          <option value="">Select</option>
          <option value="Good">Good</option>
          <option value="Poor">Poor</option>
          <option value="Needs Repairing">Needs Repairing</option>
        </select>
      </td>
    </tr>
  );

  const TechResourceRow = ({ label, data, onChange }) => (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
      <td className="py-3 px-4 text-center">
        <select value={data.available ? 'yes' : 'no'} onChange={(e) => onChange('available', e.target.value === 'yes')} className="px-3 py-1 border rounded">
          <option value="no">Not Available</option>
          <option value="yes">Available</option>
        </select>
      </td>
      <td className="py-3 px-4">
        <input 
          type="text" 
          value={data.plans} 
          onChange={(e) => onChange('plans', e.target.value)} 
          placeholder="Future plans and remarks"
          className="w-full px-2 py-1 border rounded"
        />
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                <Building className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">TU Planning Directorate</h1>
                <p className="text-gray-600 text-sm">College Information Collection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Save size={16} />
                <span>{savedSections.size}/{sections.length} Saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Form Progress</h2>
              <span className="text-blue-100 text-sm">{Math.round((savedSections.size / sections.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(savedSections.size / sections.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-8">
            {/* Section 1: General Information */}
            <SectionHeader 
              section={sections[0]} 
              isExpanded={expandedSections.includes(0)}
              onClick={() => toggleSection(0)}
              isSaved={savedSections.has(0)}
            />
            
            {expandedSections.includes(0) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl mb-6 border border-blue-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">College Basic Information</h3>
                  <button
                    onClick={() => saveSection(0)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Section</span>
                  </button>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <InputField 
                    label="College Name" 
                    field="collegeName" 
                    required 
                    placeholder="Enter full college name" 
                    error={validationErrors.collegeName}
                    icon={<Building size={16} />}
                  />
                  <SelectField 
                    label="Campus Type" 
                    field="campusType" 
                    options={[
                      { value: 'constituent', label: 'Constituent Campus' },
                      { value: 'affiliated', label: 'Affiliated College' },
                      { value: 'community', label: 'Community Campus' },
                      { value: 'private', label: 'Private College' }
                    ]}
                    required
                    error={validationErrors.campusType}
                  />
                  <InputField 
                    label="Establishment Date" 
                    field="establishmentDate" 
                    type="date" 
                    required 
                    icon={<Calendar size={16} />}
                  />
                  <InputField 
                    label="College ID" 
                    field="collegeId" 
                    placeholder="If applicable" 
                  />
                </div>

                <h4 className="text-xl font-bold text-gray-800 mt-8 mb-4">Principal/Campus Chief Information</h4>
                <div className="grid lg:grid-cols-2 gap-6">
                  <InputField 
                    label="Principal/Campus Chief Name" 
                    field="principalName" 
                    required 
                    error={validationErrors.principalName}
                    icon={<Users size={16} />}
                  />
                  <InputField 
                    label="Contact Number" 
                    field="principalContact" 
                    type="tel" 
                    required 
                    icon={<Phone size={16} />}
                  />
                  <InputField 
                    label="Email Address" 
                    field="principalEmail" 
                    type="email" 
                    required 
                    error={validationErrors.principalEmail}
                    icon={<Mail size={16} />}
                  />
                  <InputField 
                    label="Main Official Phone" 
                    field="mainPhone" 
                    type="tel" 
                    required 
                    icon={<Phone size={16} />}
                  />
                  <InputField 
                    label="Official Email" 
                    field="officialEmail" 
                    type="email" 
                    required 
                    icon={<Mail size={16} />}
                  />
                  <InputField 
                    label="Admin Chief Name" 
                    field="adminName" 
                    icon={<Users size={16} />}
                  />
                  <InputField 
                    label="Admin Chief Mobile" 
                    field="adminMobile" 
                    type="tel" 
                    icon={<Phone size={16} />}
                  />
                  <InputField 
                    label="Account Chief Name" 
                    field="accountName" 
                    icon={<Users size={16} />}
                  />
                  <InputField 
                    label="Account Chief Mobile" 
                    field="accountMobile" 
                    type="tel" 
                    icon={<Phone size={16} />}
                  />
                  <InputField 
                    label="College Website" 
                    field="website" 
                    type="url" 
                    placeholder="https://example.com" 
                    icon={<Globe size={16} />}
                  />
                </div>
                
                <h4 className="text-xl font-bold text-gray-800 mt-8 mb-4">Contact Person for Data Collection</h4>
                <div className="grid lg:grid-cols-2 gap-6">
                  <InputField 
                    label="Contact Person Name" 
                    field="contactPersonName" 
                    icon={<Users size={16} />}
                  />
                  <InputField 
                    label="Designation" 
                    field="contactPersonDesignation" 
                  />
                  <InputField 
                    label="Phone Number" 
                    field="contactPersonPhone" 
                    type="tel" 
                    icon={<Phone size={16} />}
                  />
                  <InputField 
                    label="Email Address" 
                    field="contactPersonEmail" 
                    type="email" 
                    icon={<Mail size={16} />}
                  />
                </div>
              </div>
            )}

            {/* Section 2: Location Details */}
            <SectionHeader 
              section={sections[1]} 
              isExpanded={expandedSections.includes(1)}
              onClick={() => toggleSection(1)}
              isSaved={savedSections.has(1)}
            />
            
            {expandedSections.includes(1) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl mb-6 border border-green-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Location & Address Information</h3>
                  <button
                    onClick={() => saveSection(1)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Section</span>
                  </button>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <InputField 
                    label="Province" 
                    field="province" 
                    required 
                    icon={<MapPin size={16} />}
                  />
                  <InputField 
                    label="District" 
                    field="district" 
                    required 
                    icon={<MapPin size={16} />}
                  />
                  <InputField 
                    label="Local Level (Municipality/Rural Municipality)" 
                    field="localLevel" 
                    required 
                  />
                  <InputField 
                    label="Ward No." 
                    field="wardNo" 
                    required 
                    type="number"
                  />
                  <InputField 
                    label="Street/Tole Name" 
                    field="streetName" 
                  />
                  <InputField 
                    label="Landmark" 
                    field="landmark" 
                    placeholder="Near specific temple, market, etc." 
                  />
                </div>
                
                <div className="bg-white p-6 rounded-lg mt-6 border border-green-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <MapPin className="mr-2 text-green-600" size={20} />
                    Google Maps Integration for GIS
                  </h4>
                  <p className="text-gray-600 mb-4">This section is crucial for the GIS project. Please provide exact coordinates.</p>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <InputField 
                      label="Latitude" 
                      field="latitude" 
                      placeholder="e.g., 27.7172" 
                      type="number"
                      step="any"
                    />
                    <InputField 
                      label="Longitude" 
                      field="longitude" 
                      placeholder="e.g., 85.3240" 
                      type="number"
                      step="any"
                    />
                  </div>
                  
                  <TextareaField 
                    label="Google Maps Shareable Link (Preferred)" 
                    field="mapsLink" 
                    placeholder="Paste the Google Maps URL here for accurate location"
                    rows={2}
                  />
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>How to get coordinates:</strong> Open Google Maps, find your college location, 
                      right-click on the specific point, and copy the coordinates that appear.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Infrastructure & Land */}
            <SectionHeader 
              section={sections[2]} 
              isExpanded={expandedSections.includes(2)}
              onClick={() => toggleSection(2)}
              isSaved={savedSections.has(2)}
            />
            
            {expandedSections.includes(2) && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-8 rounded-xl mb-6 border border-purple-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Infrastructure & Facilities</h3>
                  <button
                    onClick={() => saveSection(2)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Section</span>
                  </button>
                </div>

                {/* Land Area Section */}
                <div className="bg-white p-6 rounded-lg mb-6 border border-purple-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">A. Total Land Area</h4>
                  
                  <div className="grid lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-3">Traditional Measurement</h5>
                      <div className="space-y-3">
                        <InputField label="Bigaha" field="totalLandBigaha" type="number" />
                        <InputField label="Katha" field="totalLandKatha" type="number" />
                        <InputField label="Dhur" field="totalLandDhur" type="number" />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-3">Alternative Measurement</h5>
                      <div className="space-y-3">
                        <InputField label="Ropani" field="totalLandRopani" type="number" />
                        <InputField label="Ana" field="totalLandAna" type="number" />
                        <InputField label="Daam" field="totalLandDaam" type="number" />
                        <InputField label="Paisa" field="totalLandPaisa" type="number" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-700 mb-3">Standard Measurement</h5>
                      <InputField 
                        label="Area in Square Meter (as per Lalpurja)" 
                        field="landAreaSquareMeter" 
                        type="number" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <InputField 
                      label="Date of Land Acquisition" 
                      field="landAcquisitionDate" 
                      type="date" 
                    />
                    <TextareaField 
                      label="Status of Land Tax Clearance and Updating" 
                      field="landTaxStatus" 
                      placeholder="Describe current status and any updating processes"
                    />
                  </div>
                </div>

                {/* Land Ownership Breakdown */}
                <div className="bg-white p-6 rounded-lg mb-6 border border-purple-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">B. Breakdown of Land Area by Ownership Type</h4>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InputField 
                        label="Area with Lalpurja in Campus Name" 
                        field="areaWithLalpurja" 
                        type="number"
                        placeholder="Area in square meters"
                      />
                      <TextareaField 
                        label="Address of the Land" 
                        field="lalpurjaAddress" 
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <InputField 
                        label="Area with Bhogadhikar" 
                        field="areaWithBhogadhikar" 
                        type="number"
                        placeholder="Area in square meters"
                      />
                      <TextareaField 
                        label="Address of the Land" 
                        field="bhogadhikarAddress" 
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <InputField 
                        label="Area Provided by Local Government" 
                        field="areaLocalGov" 
                        type="number"
                        placeholder="Area in square meters"
                      />
                      <TextareaField 
                        label="Address of the Land" 
                        field="localGovAddress" 
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <InputField 
                        label="Area with Other Sources" 
                        field="areaOtherSources" 
                        type="number"
                        placeholder="Area in square meters"
                      />
                      <TextareaField 
                        label="Address of the Land" 
                        field="otherSourcesAddress" 
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Land Usage */}
                <div className="bg-white p-6 rounded-lg mb-6 border border-purple-200">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">C. Present Status of Land Uses and Area</h4>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <InputField 
                      label="Area Occupied by Building and Physical Infrastructure" 
                      field="areaBuildingInfra" 
                      type="number"
                      placeholder="Area in square meters"
                    />
                    <InputField 
                      label="Area Occupied by Playground" 
                      field="areaPlayground" 
                      type="number"
                      placeholder="Area in square meters"
                    />
                    <InputField 
                      label="Area Covered by Unplanned Natural Forests and Shrubs" 
                      field="areaForestShrubs" 
                      type="number"
                      placeholder="Area in square meters"
                    />
                    <InputField 
                      label="Area Occupied by Systematic Plantation and Garden" 
                      field="areaPlantationGarden" 
                      type="number"
                      placeholder="Area in square meters"
                    />
                    <InputField 
                      label="Area of Land and Buildings Given in Lease/Contract" 
                      field="areaLeaseContract" 
                      type="number"
                      placeholder="Area in square meters"
                    />
                    <InputField 
                      label="Income from Land and Property Activities" 
                      field="incomeFromLand" 
                      type="number"
                      placeholder="Amount in NPR"
                    />
                  </div>
                  
                  <div className="mt-6">
                    <SelectField 
                      label="Is there any type of encroachment in campus land?" 
                      field="landEncroachment" 
                      options={[
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' }
                      ]}
                    />
                    
                    {formData.landEncroachment === 'yes' && (
                      <TextareaField 
                        label="Details about encroachment and steps taken" 
                        field="encroachmentDetails" 
                        rows={4}
                        placeholder="Describe the situation and steps taken by campus administration and government authorities"
                      />
                    )}
                  </div>
                  
                  <div className="grid lg:grid-cols-1 gap-6 mt-6">
                    <TextareaField 
                      label="Best possible alternative commercial uses of the land" 
                      field="commercialUses" 
                      rows={3}
                    />
                    <TextareaField 
                      label="Commercial plan for use of land and property" 
                      field="commercialPlan" 
                      rows={3}
                    />
                    <SelectField 
                      label="Is there a master plan of campus development?" 
                      field="masterPlan" 
                      options={[
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' },
                        { value: 'in_progress', label: 'In Progress' }
                      ]}
                    />
                    <TextareaField 
                      label="Suggestions/recommendations regarding land and property" 
                      field="masterPlanSuggestions" 
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Buildings and Facilities */}
            <SectionHeader 
              section={sections[3]} 
              isExpanded={expandedSections.includes(3)}
              onClick={() => toggleSection(3)}
              isSaved={savedSections.has(3)}
            />
            
            {expandedSections.includes(3) && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-xl mb-6 border border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Buildings and Rooms</h3>
                  <button
                    onClick={() => saveSection(3)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Section</span>
                  </button>
                </div>

                <div className="bg-white rounded-lg overflow-hidden border border-indigo-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-indigo-600 text-white">
                        <tr>
                          <th className="py-4 px-4 text-left font-semibold">Building Type</th>
                          <th className="py-4 px-2 text-center font-semibold">No. of Buildings</th>
                          <th className="py-4 px-2 text-center font-semibold">No. of Rooms</th>
                          <th className="py-4 px-2 text-center font-semibold">Avg Room Size (sq ft)</th>
                          <th className="py-4 px-2 text-center font-semibold">Student Capacity</th>
                          <th className="py-4 px-2 text-center font-semibold">Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        <BuildingRow 
                          type="classroom" 
                          label="Classroom/Teaching" 
                          data={formData.buildings.classroom}
                          onChange={(field, value) => handleNestedChange('buildings', 'classroom', field, value)}
                        />
                        <BuildingRow 
                          type="library" 
                          label="Library" 
                          data={formData.buildings.library}
                          onChange={(field, value) => handleNestedChange('buildings', 'library', field, value)}
                        />
                        <BuildingRow 
                          type="laboratory" 
                          label="Laboratory" 
                          data={formData.buildings.laboratory}
                          onChange={(field, value) => handleNestedChange('buildings', 'laboratory', field, value)}
                        />
                        <BuildingRow 
                          type="canteen" 
                          label="Canteen" 
                          data={formData.buildings.canteen}
                          onChange={(field, value) => handleNestedChange('buildings', 'canteen', field, value)}
                        />
                        <BuildingRow 
                          type="computerRoom" 
                          label="Computer/IT Room" 
                          data={formData.buildings.computerRoom}
                          onChange={(field, value) => handleNestedChange('buildings', 'computerRoom', field, value)}
                        />
                        <BuildingRow 
                          type="securityQuarters" 
                          label="Security and Staff Quarters" 
                          data={formData.buildings.securityQuarters}
                          onChange={(field, value) => handleNestedChange('buildings', 'securityQuarters', field, value)}
                        />
                        <BuildingRow 
                          type="guestHouse" 
                          label="Guest House" 
                          data={formData.buildings.guestHouse}
                          onChange={(field, value) => handleNestedChange('buildings', 'guestHouse', field, value)}
                        />
                        <BuildingRow 
                          type="lectureHalls" 
                          label="Lecture Halls/Seminar Conference Room" 
                          data={formData.buildings.lectureHalls}
                          onChange={(field, value) => handleNestedChange('buildings', 'lectureHalls', field, value)}
                        />
                        <BuildingRow 
                          type="rmcOffice" 
                          label="RMC Office" 
                          data={formData.buildings.rmcOffice}
                          onChange={(field, value) => handleNestedChange('buildings', 'rmcOffice', field, value)}
                        />
                        <BuildingRow 
                          type="facultyRooms" 
                          label="Faculty Rooms" 
                          data={formData.buildings.facultyRooms}
                          onChange={(field, value) => handleNestedChange('buildings', 'facultyRooms', field, value)}
                        />
                        <BuildingRow 
                          type="examHall" 
                          label="Exam Hall" 
                          data={formData.buildings.examHall}
                          onChange={(field, value) => handleNestedChange('buildings', 'examHall', field, value)}
                        />
                        <BuildingRow 
                          type="auditorium" 
                          label="Auditorium" 
                          data={formData.buildings.auditorium}
                          onChange={(field, value) => handleNestedChange('buildings', 'auditorium', field, value)}
                        />
                        <BuildingRow 
                          type="dormitories" 
                          label="Student Dormitories/Hostel" 
                          data={formData.buildings.dormitories}
                          onChange={(field, value) => handleNestedChange('buildings', 'dormitories', field, value)}
                        />
                        <BuildingRow 
                          type="indoorGames" 
                          label="Indoor Games/Fitness Centre" 
                          data={formData.buildings.indoorGames}
                          onChange={(field, value) => handleNestedChange('buildings', 'indoorGames', field, value)}
                        />
                        <BuildingRow 
                          type="staffHousing" 
                          label="Faculty/Staff Housing" 
                          data={formData.buildings.staffHousing}
                          onChange={(field, value) => handleNestedChange('buildings', 'staffHousing', field, value)}
                        />
                        <BuildingRow 
                          type="gymnasium" 
                          label="Gymnasium/Fitness Center" 
                          data={formData.buildings.gymnasium}
                          onChange={(field, value) => handleNestedChange('buildings', 'gymnasium', field, value)}
                        />
                        <BuildingRow 
                          type="outdoorSports" 
                          label="Outdoor Sports Facilities" 
                          data={formData.buildings.outdoorSports}
                          onChange={(field, value) => handleNestedChange('buildings', 'outdoorSports', field, value)}
                        />
                        <BuildingRow 
                          type="counsellingCenter" 
                          label="Counselling Centre/Incubation Center" 
                          data={formData.buildings.counsellingCenter}
                          onChange={(field, value) => handleNestedChange('buildings', 'counsellingCenter', field, value)}
                        />
                        <BuildingRow 
                          type="parkingLots" 
                          label="Parking Lots & Transport Facilities" 
                          data={formData.buildings.parkingLots}
                          onChange={(field, value) => handleNestedChange('buildings', 'parkingLots', field, value)}
                        />
                        <BuildingRow 
                          type="powerSupply" 
                          label="Power Supply & Energy Plant" 
                          data={formData.buildings.powerSupply}
                          onChange={(field, value) => handleNestedChange('buildings', 'powerSupply', field, value)}
                        />
                        <BuildingRow 
                          type="banksATM" 
                          label="Banks and ATM Room" 
                          data={formData.buildings.banksATM}
                          onChange={(field, value) => handleNestedChange('buildings', 'banksATM', field, value)}
                        />
                        <BuildingRow 
                          type="studentUnion" 
                          label="Student Union/Activity Center" 
                          data={formData.buildings.studentUnion}
                          onChange={(field, value) => handleNestedChange('buildings', 'studentUnion', field, value)}
                        />
                        <BuildingRow 
                          type="medicalCenter" 
                          label="Medical & Health Center" 
                          data={formData.buildings.medicalCenter}
                          onChange={(field, value) => handleNestedChange('buildings', 'medicalCenter', field, value)}
                        />
                        <BuildingRow 
                          type="recreational" 
                          label="Recreational Facilities" 
                          data={formData.buildings.recreational}
                          onChange={(field, value) => handleNestedChange('buildings', 'recreational', field, value)}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Continue with remaining sections... */}
            
            {/* Submit Button */}
            <div className="mt-12 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={submitForm}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Submit Complete Form</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => console.log('Draft saved locally')}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save as Draft</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Make sure to save each section before final submission. All fields marked with * are required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDataForm;