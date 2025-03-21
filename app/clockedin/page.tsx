"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript interfaces
interface TimeRecord {
  employeeId: string;
  clockInTime: string;
  clockOutTime: string | null;
  date: string;
}

interface Employee {
  id: string; // E-XXXXX-Department format
  name: string;
  department: string;
  email?: string;
  phone?: string;
  // New fields
  position?: string;
  address?: string;
  hireDate?: string;
}

// Extended BusinessInfo interface
interface BusinessInfo {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  // New fields for work hours
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string[];
  established?: string;
  industry?: string; // Added industry field
}

export default function PunchClockSystem() {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees'>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    department: '',
    email: '',
    phone: '',
    position: '',
    address: '',
    hireDate: ''
  });

  // Add state for dropdowns
  const [recordsExportOpen, setRecordsExportOpen] = useState(false);
  const [employeesExportOpen, setEmployeesExportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // New states for enhanced UI
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isClockingIn, setIsClockingIn] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Add dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Company information
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "TimeTrack Pro",
    address: "123 Business Ave, Suite 200, San Francisco, CA 94107",
    phone: "(555) 123-4567",
    email: "info@timetrackpro.com",
    website: "timetrackpro.com",
    workStartTime: "09:00",
    workEndTime: "17:00",
    workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    established: "2023"
  });
  
  // Dynamic theme based on dark mode
  const theme = useMemo(() => ({
    text: darkMode ? 'gray-200' : 'gray-700',
    background: darkMode ? 'gray-800' : 'white',
    backgroundSecondary: darkMode ? 'gray-900' : 'gray-50',
    primary: 'indigo-600',
    secondary: 'purple-500',
    accent: 'indigo-400', 
    border: darkMode ? 'gray-700' : 'gray-200',
    success: 'emerald-500',
    danger: 'rose-500',
  }), [darkMode]);
  
  // Refs for handling outside clicks
  const recordsDropdownRef = useRef<HTMLDivElement>(null);
  const employeesDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

   // Helper utility functions with TypeScript fixes
const calculateLateness = (clockInTime: string): number => {
    if (!businessInfo.workStartTime) return 0;
    
    // Parse clock-in time
    const clockIn = new Date(clockInTime);
    const clockInHour = clockIn.getHours();
    const clockInMinute = clockIn.getMinutes();
    
    // Parse company start time (with type assertion to avoid potential undefined)
    const [startHour, startMinute] = businessInfo.workStartTime.split(':').map(Number);
    
    // Convert both to minutes since midnight
    const clockInMinutes = clockInHour * 60 + clockInMinute;
    const startTimeMinutes = startHour * 60 + startMinute;
    
    // Calculate lateness (if negative, employee was early)
    const latenessMinutes = clockInMinutes - startTimeMinutes;
    
    return Math.max(0, latenessMinutes); // Only return positive values (actual lateness)
  };
  
  // Calculate overtime in minutes based on clock-out time and company end time
  const calculateOvertime = (clockOutTime: string | null): number => {
    if (!clockOutTime || !businessInfo.workEndTime) return 0;
    
    // Parse clock-out time
    const clockOut = new Date(clockOutTime);
    const clockOutHour = clockOut.getHours();
    const clockOutMinute = clockOut.getMinutes();
    
    // Parse company end time (with non-null assertion since we checked above)
    const [endHour, startMinute] = businessInfo.workEndTime!.split(':').map(Number);
    
    // Convert both to minutes since midnight
    const clockOutMinutes = clockOutHour * 60 + clockOutMinute;
    const endTimeMinutes = endHour * 60 + startMinute;
    
    // Calculate overtime (if negative, employee left early)
    const overtimeMinutes = clockOutMinutes - endTimeMinutes;
    
    return Math.max(0, overtimeMinutes); // Only return positive values (actual overtime)
  };
  
  // Format minutes to hours and minutes display
  const formatMinutes = (minutes: number): string => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  
  // Check for dark mode preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
        return;
      }
      
      // If no saved preference, check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
      }
    }
  }, []);
  
  // Update document class and save preference when dark mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (recordsDropdownRef.current && !recordsDropdownRef.current.contains(event.target as Node)) {
        setRecordsExportOpen(false);
      }
      if (employeesDropdownRef.current && !employeesDropdownRef.current.contains(event.target as Node)) {
        setEmployeesExportOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Load records and employees from local storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRecords = localStorage.getItem('timeRecords');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
      
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }
    }
  }, []);
  
  // Save records and employees to local storage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeRecords', JSON.stringify(records));
    }
  }, [records]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('employees', JSON.stringify(employees));
    }
  }, [employees]);
  
  // Dashboard stats calculations
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Count of currently clocked in employees
  const clockedInEmployees = useMemo(() => 
    records.filter(record => 
      record.date === currentDate && record.clockOutTime === null
    ),
    [records, currentDate]
  );
  
  // Count of employees who worked today (clocked in at any point)
  const employeesWorkingToday = useMemo(() => {
    const employeeIds = new Set(
      records.filter(record => record.date === currentDate)
        .map(record => record.employeeId)
    );
    return employeeIds.size;
  }, [records, currentDate]);
  
  // Total hours worked today
  const hoursWorkedToday = useMemo(() => {
    const completedRecords = records.filter(
      record => record.date === currentDate && record.clockOutTime !== null
    );
    
    return completedRecords.reduce((total, record) => {
      const clockIn = new Date(record.clockInTime).getTime();
      const clockOut = new Date(record.clockOutTime!).getTime();
      return total + ((clockOut - clockIn) / (1000 * 60 * 60));
    }, 0);
  }, [records, currentDate]);
  
  // Export utility functions
  const exportAsCSV = (data: any[], filename: string) => {
    // Convert array of objects to CSV
    const headers = Object.keys(data[0] || {}).join(',');
    const csvRows = data.map(row => 
      Object.values(row).map(value => 
        `"${value === null ? '' : String(value).replace(/"/g, '""')}"`
      ).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const exportAsJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportRecords = (format: 'csv' | 'json') => {
    // Prepare records data with employee names
    const exportData = records.map(record => {
      const employee = employees.find(emp => emp.id === record.employeeId);
      return {
        employeeId: record.employeeId,
        employeeName: employee ? employee.name : 'Unknown',
        department: employee ? employee.department : 'Unknown',
        clockInTime: new Date(record.clockInTime).toLocaleString(),
        clockOutTime: record.clockOutTime ? new Date(record.clockOutTime).toLocaleString() : 'Not clocked out',
        date: record.date,
        duration: record.clockOutTime ? 
          `${((new Date(record.clockOutTime).getTime() - new Date(record.clockInTime).getTime()) / (1000 * 60 * 60)).toFixed(2)} hrs` : 
          'In progress'
      };
    });
    
    if (exportData.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'There are no records to export.',
        icon: 'info',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }
    
    if (format === 'csv') {
      exportAsCSV(exportData, `time-records-${new Date().toISOString().split('T')[0]}`);
    } else {
      exportAsJSON(exportData, `time-records-${new Date().toISOString().split('T')[0]}`);
    }
    
    Swal.fire({
      title: 'Export Successful',
      text: `Records have been exported as ${format.toUpperCase()}.`,
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };
  
  const exportEmployees = (format: 'csv' | 'json') => {
    if (employees.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'There are no employees to export.',
        icon: 'info',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }
    
    if (format === 'csv') {
      exportAsCSV(employees, `employees-${new Date().toISOString().split('T')[0]}`);
    } else {
      exportAsJSON(employees, `employees-${new Date().toISOString().split('T')[0]}`);
    }
    
    Swal.fire({
      title: 'Export Successful',
      text: `Employees have been exported as ${format.toUpperCase()}.`,
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };
  
  const handleVerification = () => {
    // Find the employee by name
    const employee = employees.find(emp => emp.name === selectedEmployeeName);
    
    if (!employee) {
      Swal.fire({
        title: 'Employee Not Found',
        text: 'Please select a valid employee from the dropdown.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Verify the ID matches
    if (employee.id !== employeeId) {
      Swal.fire({
        title: 'ID Verification Failed',
        text: 'The employee ID does not match our records.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Proceed with clocking in or out
    if (isClockingIn) {
      handleClockIn();
    } else {
      handleClockOut();
    }
    
    // Reset states
    setShowVerificationModal(false);
    setSelectedEmployeeName('');
    setEmployeeId('');
  };
  
  const handleEmployeeSelect = (employee: Employee, action: 'in' | 'out') => {
    setSelectedEmployeeName(employee.name);
    setEmployeeId('');
    setIsClockingIn(action === 'in');
    setShowVerificationModal(true);
  };
  
  const handleClockIn = () => {
    if (!employeeId.trim()) return;
    
    // Validate that employee exists
    const employeeExists = employees.some(emp => emp.id === employeeId);
    if (!employeeExists) {
      Swal.fire({
        title: 'Invalid Employee ID',
        text: 'Please use a registered employee ID.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if employee already clocked in but didn't clock out
    const existingRecord = records.find(
      record => record.employeeId === employeeId && 
      record.date === today && 
      record.clockOutTime === null
    );
    
    if (existingRecord) {
      Swal.fire({
        title: 'Already Clocked In',
        text: 'You are already clocked in! Please clock out first.',
        icon: 'warning',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const newRecord: TimeRecord = {
      employeeId,
      clockInTime: now.toISOString(),
      clockOutTime: null,
      date: today
    };
    
    setRecords([...records, newRecord]);
    setEmployeeId('');
    
    // Success confirmation
    Swal.fire({
      title: 'Clocked In!',
      text: 'You have successfully clocked in.',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  // Helper function to check if business is currently open
const isBusinessCurrentlyOpen = (businessInfo: BusinessInfo): boolean => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if today is a working day
    if (!businessInfo.workDays || !businessInfo.workDays.includes(dayOfWeek)) {
      return false;
    }
    
    // Get current time in hours and minutes
    const currentHour: number = now.getHours();
    const currentMinute: number = now.getMinutes();
    const currentTimeInMinutes: number = currentHour * 60 + currentMinute;
    
    // Parse work hours
    const [startHour, startMinute]: number[] = businessInfo.workStartTime!.split(':').map(Number);
    const [endHour, endMinute]: number[] = businessInfo.workEndTime!.split(':').map(Number);
    
    const startTimeInMinutes: number = startHour * 60 + startMinute;
    const endTimeInMinutes: number = endHour * 60 + endMinute;
    
    // Check if current time is within work hours
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  };
  
  const handleClockOut = () => {
    if (!employeeId.trim()) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Find the record to update
    const recordIndex = records.findIndex(
      record => record.employeeId === employeeId && 
      record.date === today && 
      record.clockOutTime === null
    );
    
    if (recordIndex === -1) {
      Swal.fire({
        title: 'No Active Clock-in',
        text: 'No active clock-in found for this employee ID today.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const updatedRecords = [...records];
    updatedRecords[recordIndex] = {
      ...updatedRecords[recordIndex],
      clockOutTime: now.toISOString()
    };
    
    setRecords(updatedRecords);
    setEmployeeId('');
    
    // Success confirmation
    Swal.fire({
      title: 'Clocked Out!',
      text: 'You have successfully clocked out.',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };
  
  // Generate a unique employee ID in E-XXXXX-Department format
  const generateEmployeeId = (department: string) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    return `E-${randomNum}-${department.toUpperCase()}`;
  };
  
  // Handle employee deletion with confirmation
  const handleDeleteEmployee = (employeeId: string) => {
    // Find employee name for the confirmation message
    const employee = employees.find(emp => emp.id === employeeId);
    
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${employee?.name || 'this employee'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setEmployees(employees.filter(emp => emp.id !== employeeId));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'The employee has been deleted.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    });
  };
  
  // Handle opening modal for editing
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      name: employee.name,
      department: employee.department,
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      address: employee.address || '',
      hireDate: employee.hireDate || ''
    });
    setShowModal(true);
  };
  
  // Add this to the existing state declarations at the top of the component
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Update the handleRegisterEmployee function for validation
  const handleRegisterEmployee = () => {
    // Reset errors
    setFormErrors({});
    setFormSubmitted(true);
    
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!newEmployee.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!newEmployee.department.trim()) {
      errors.department = 'Department is required';
    }
    
    // Validate email format if provided
    if (newEmployee.email && !/^\S+@\S+\.\S+$/.test(newEmployee.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate phone format if provided
    if (newEmployee.phone && !/^[0-9+\-() ]+$/.test(newEmployee.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (editingEmployee) {
      // Update existing employee
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...newEmployee, id: editingEmployee.id }
          : emp
      );
      
      setEmployees(updatedEmployees);
      Swal.fire({
        title: 'Updated!',
        text: `${newEmployee.name}'s information has been updated.`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } else {
      // Create new employee
      const id = generateEmployeeId(newEmployee.department);
      const employee: Employee = {
        ...newEmployee,
        id,
      };
      
      setEmployees([...employees, employee]);
      Swal.fire({
        title: 'Employee Registered!',
        text: `${newEmployee.name} has been successfully registered with ID: ${id}`,
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
    }
    
    // Reset form and close modal
    setNewEmployee({
      name: '',
      department: '',
      email: '',
      phone: '',
      position: '',
      address: '',
      hireDate: ''
    });
    setFormSubmitted(false);
    setEditingEmployee(null);
    setShowModal(false);
  };

  // Group records by day of week
  const recordsByDay = records.reduce((acc, record) => {
    const date = new Date(record.date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!acc[dayOfWeek]) {
      acc[dayOfWeek] = [];
    }
    
    acc[dayOfWeek].push(record);
    return acc;
  }, {} as Record<string, TimeRecord[]>);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Render the dashboard tab content with dark mode support
  const renderDashboard = () => {
    // Filter employees for search
    const filteredEmployees = employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    return (
      <>
        {/* Company Info Card - Sleek Modern Design */}
<div className={`bg-${theme.background} rounded-xl shadow-lg overflow-hidden border border-${theme.border} mb-6 transition-all duration-300 hover:shadow-xl`}>
  {/* Card Header with gradient accent */}
  <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400"></div>
  
  <div className="p-5 sm:p-6">
    {/* Company Name and Edit Button */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-5">
      <div>
        <h3 className={`text-xl sm:text-2xl font-bold text-${theme.text} transition-colors duration-200 flex items-center`}>
          {businessInfo.name}
          {businessInfo.established && (
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full ml-2 font-medium">
              Est. {businessInfo.established}
            </span>
          )}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200 mt-0.5`}>Employee Time Management System</p>
      </div>
      
      <button
        onClick={() => setShowOnboarding(true)}
        className={`text-xs flex items-center gap-1 px-3 py-2 rounded-md bg-${theme.primary}/10 text-${theme.primary} hover:bg-${theme.primary}/20 transition-colors duration-200 mt-3 sm:mt-0`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Details
      </button>
    </div>
    
    {/* Main Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column - Address & Contact Info with Sleek Design */}
      <div className="space-y-3">
        {businessInfo.address && (
          <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'} transition-all duration-200`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="break-words">{businessInfo.address}</span>
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {businessInfo.phone && (
            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'} transition-all duration-200`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="truncate">{businessInfo.phone}</span>
              </p>
            </div>
          )}
          
          {businessInfo.email && (
            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50'} transition-all duration-200`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="truncate">{businessInfo.email}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Today's Date Card */}
        <div className={`rounded-lg p-3 ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'} transition-all duration-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Today's Date</span>
            </div>
            <div className={`text-sm font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
              {new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right column - Modern Business Hours Display */}
      {businessInfo.workStartTime && businessInfo.workEndTime && (
        <div className={`rounded-xl overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800/50' : 'bg-white'} transition-all duration-300`}>
          {/* Hours Header */}
          <div className={`px-4 py-3 ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-50'} flex items-center justify-between`}>
            <h4 className="text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Business Hours
            </h4>
          </div>
          
          {/* Modern Hours Display */}
          <div className="p-5">
            {/* Hours Banner */}
            <div className={`flex items-center justify-center py-5 px-6 bg-gradient-to-r ${darkMode ? 'from-indigo-900/30 to-purple-900/30' : 'from-indigo-50 to-purple-50'} rounded-lg mb-5`}>
              <div className={`text-center ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                <div className="text-3xl font-bold">{formatTime(businessInfo.workStartTime)} - {formatTime(businessInfo.workEndTime)}</div>
                <div className={`text-xs uppercase mt-1 tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Operating Hours</div>
              </div>
            </div>
            
            {/* Working Days */}
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 uppercase tracking-wider`}>Working Days</p>
              <div className="grid grid-cols-7 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                  const fullDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index];
                  const isWorkDay = (businessInfo.workDays || []).includes(fullDay);
                  return (
                    <div key={day} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        isWorkDay 
                          ? `${darkMode ? 'bg-indigo-600/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`
                          : `${darkMode ? 'bg-gray-800/70 text-gray-500' : 'bg-gray-100 text-gray-400'}`
                      }`}>
                        {day.charAt(0)}
                      </div>
                      <span className={`text-xs ${
                        isWorkDay 
                          ? `${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`
                          : `${darkMode ? 'text-gray-500' : 'text-gray-400'}`
                      }`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Business Status Indicator */}
            <div className="mt-5 pt-4 flex justify-center border-t border-dashed border-gray-200 dark:border-gray-700">
              {/* Logic to check if business is currently open based on time and day */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isBusinessCurrentlyOpen(businessInfo) 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isBusinessCurrentlyOpen(businessInfo) 
                    ? 'bg-green-500 dark:bg-green-400'
                    : 'bg-red-500 dark:bg-red-400'
                }`}></div>
                {isBusinessCurrentlyOpen(businessInfo) ? 'Currently Open' : 'Currently Closed'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Clocked In Employees Card */}
          <div className={`bg-${theme.background} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
            <div className="p-4 md:p-6 relative">
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-${theme.primary}`}></div>
              
              <div className="flex flex-col h-full ml-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm text-gray-400 font-medium">Currently Clocked In</h3>
                  <div className={`p-1 rounded-full bg-${theme.primary}/10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-${theme.primary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${theme.text}`}>
                  {clockedInEmployees.length}
                </p>
                
                <div className="text-xs text-gray-400 mt-2 flex items-center">
                  <span>Active employees right now</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Working Today Card */}
          <div className={`bg-${theme.background} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
            <div className="p-4 md:p-6 relative">
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-${theme.success}`}></div>
              
              <div className="flex flex-col h-full ml-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm text-gray-400 font-medium">Working Today</h3>
                  <div className={`p-1 rounded-full bg-${theme.success}/10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-${theme.success}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${theme.text}`}>
                  {employeesWorkingToday}
                </p>
                
                <div className="text-xs text-gray-400 mt-2 flex items-center">
                  <span>Total employees today</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hours Worked Today Card */}
          <div className={`bg-${theme.background} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
            <div className="p-4 md:p-6 relative">
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-${theme.accent}`}></div>
              
              <div className="flex flex-col h-full ml-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm text-gray-400 font-medium">Hours Today</h3>
                  <div className={`p-1 rounded-full bg-${theme.accent}/10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-${theme.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${theme.text}`}>
                  {hoursWorkedToday.toFixed(1)}
                </p>
                
                <div className="text-xs text-gray-400 mt-2 flex items-center">
                  <span>Total hours logged</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Employees Card */}
          <div className={`bg-${theme.background} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
            <div className="p-4 md:p-6 relative">
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-${theme.secondary}`}></div>
              
              <div className="flex flex-col h-full ml-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm text-gray-400 font-medium">Total Employees</h3>
                  <div className={`p-1 rounded-full bg-${theme.secondary}/10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-${theme.secondary}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${theme.text}`}>
                  {employees.length}
                </p>
                
                <div className="text-xs text-gray-400 mt-2 flex items-center">
                  <span>Registered in system</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Clock In/Out Section */}
        <div className={`bg-${theme.background} p-6 rounded-lg shadow-md mb-8 border border-${theme.border} transition-colors duration-200`}>
          <h2 className="text-xl font-semibold mb-6 text-gray-300 border-b border-gray-700 pb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-${theme.accent}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Clock In/Out
          </h2>
          
          <div className="flex flex-col gap-4">
            {/* Employee Search Dropdown */}
            <div className="relative" ref={searchDropdownRef}>
              <div className="flex items-center p-3 bg-gray-700/30 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  className="bg-transparent border-none w-full text-gray-300 placeholder-gray-500 focus:outline-none"
                  placeholder="Search for your name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(true);
                  }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Dropdown Results */}
              {showDropdown && (
                <div className="absolute mt-1 w-full rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <div key={employee.id} className="px-2 py-1">
                          <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
                            <div>
                              <div className="text-sm font-medium text-gray-200">{employee.name}</div>
                              <div className="text-xs text-gray-400 flex items-center mt-1">
                                <span className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-xs">
                                  {employee.department}
                                </span>
                                {employee.position && (
                                  <span className="ml-1">• {employee.position}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmployeeSelect(employee, 'in');
                                }}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-1.5 rounded-md transition-colors"
                                title="Clock In"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmployeeSelect(employee, 'out');
                                }}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-1.5 rounded-md transition-colors"
                                title="Clock Out"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-gray-400">No employees found matching your search</p>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-700 px-4 py-3 flex justify-center">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setEditingEmployee(null);
                          setShowModal(true);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Add New Employee
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={() => {
                  setIsClockingIn(true);
                  setShowVerificationModal(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-md hover:from-green-600 hover:to-green-700 transition duration-300 shadow-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                </svg>
                Clock In
              </button>
              <button
                onClick={() => {
                  setIsClockingIn(false);
                  setShowVerificationModal(true);
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-md hover:from-red-600 hover:to-red-700 transition duration-300 shadow-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Clock Out
              </button>
            </div>
            
            {/* Help text */}
            <div className="mt-4 text-gray-400 text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>Search for your name from the dropdown and select the appropriate action, or use the buttons below if you already know your employee ID.</span>
            </div>
          </div>
        </div>
        
        {/* Today's Clock-ins */}
        <div className={`bg-${theme.background} p-6 rounded-lg shadow-md border border-${theme.border} transition-colors duration-200`}>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h2 className="text-xl font-semibold text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-${theme.accent}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Today's Activity
            </h2>
            <div className="flex gap-2">
              <div className="relative" ref={recordsDropdownRef}>
                <button
                 onClick={() => setRecordsExportOpen(!recordsExportOpen)}
                 className={`bg-${theme.primary} text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 shadow-sm`}>
                  Export
                </button>
                {recordsExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          exportRecords('csv');
                          setRecordsExportOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-${theme.accent}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export as CSV
                      </button>
                      <button 
                        onClick={() => {
                          exportRecords('json');
                          setRecordsExportOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-${theme.accent}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
         

          {/* Today's records table */}
          {records.filter(record => record.date === currentDate).length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700/30 text-gray-400">
                    <th className="py-3 px-4 text-left font-semibold">Employee</th>
                    <th className="py-3 px-4 text-left font-semibold">Department</th>
                    <th className="py-3 px-4 text-left font-semibold">Clock In</th>
                    <th className="py-3 px-4 text-left font-semibold">Clock Out</th>
                    <th className="py-3 px-4 text-left font-semibold">Duration</th>
                    <th className="py-3 px-4 text-left font-semibold">Lateness</th>
                    <th className="py-3 px-4 text-left font-semibold">Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {records.filter(record => record.date === currentDate)
                    .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
                    .map((record, index) => {
                    const clockIn = new Date(record.clockInTime);
                    const clockOut = record.clockOutTime ? new Date(record.clockOutTime) : null;
                    
                    const duration = clockOut
                      ? ((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2)
                      : 'In progress';
                    
                    // Calculate lateness and overtime
                    const latenessMinutes = calculateLateness(record.clockInTime);
                    const overtimeMinutes = calculateOvertime(record.clockOutTime);
                    
                    // Find employee name
                    const employee = employees.find(emp => emp.id === record.employeeId);
                    const employeeName = employee ? employee.name : 'Unknown';
                    const department = employee ? employee.department : 'Unknown';
                    
                    return (
                      <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors duration-150">
                        <td className="py-3 px-4 text-gray-300 font-medium">{employeeName}</td>
                        <td className="py-3 px-4 text-gray-300">{department}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {clockIn.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {clockOut ? clockOut.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {duration === 'In progress' ? 
                            <span className="text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full text-xs font-medium">
                              {duration}
                            </span> : 
                            <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded-full text-xs font-medium">
                              {duration} hrs
                            </span>
                          }
                        </td>
                        <td className="py-3 px-4">
                          {latenessMinutes > 0 ? (
                            <span className="text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full text-xs font-medium">
                              {formatMinutes(latenessMinutes)}
                            </span>
                          ) : (
                            <span className="text-green-400 bg-green-500/20 px-2 py-1 rounded-full text-xs font-medium">
                              On time
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {record.clockOutTime ? (
                            overtimeMinutes > 0 ? (
                              <span className="text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full text-xs font-medium">
                                {formatMinutes(overtimeMinutes)}
                              </span>
                            ) : (
                              <span className="text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full text-xs font-medium">
                                None
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-indigo-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-300 text-lg">No clock-ins recorded today</p>
              <p className="text-gray-400 text-sm mt-1">Time records will appear here when employees clock in</p>
            </div>
          )}
        </div>
      </>
    );
  };
  
  // Get filtered employees based on search and department filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchQuery || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.position && employee.position.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = !departmentFilter || 
      employee.department.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  // Updated employee render function with dark mode support
  const renderEmployees = () => {
    const uniqueDepartments = [...new Set(employees.map(emp => emp.department))];
    
    return (
      <div className={`bg-${theme.background} p-6 rounded-lg shadow-md border border-${theme.border} transition-colors duration-200`}>
        <div className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Registered Employees</h2>
            <div className="flex gap-2">
              <div className="relative" ref={employeesDropdownRef}>
                <button 
                  onClick={() => setEmployeesExportOpen(!employeesExportOpen)}
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 shadow-sm mr-2">
                  Export
                </button>
                {employeesExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          exportEmployees('csv');
                          setEmployeesExportOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export as CSV
                      </button>
                      <button 
                        onClick={() => {
                          exportEmployees('json');
                          setEmployeesExportOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingEmployee(null);
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-green-700 transition duration-300 shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Register New Employee
              </button>
            </div>
          </div>
          
          {/* Search and Filter Interface */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all duration-200"
                placeholder="Search employees by name or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 w-full sm:w-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              <select
                className="bg-transparent text-gray-700 focus:outline-none w-full"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <div 
                key={employee.id} 
                className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header - Top Gradient */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <div className="flex p-5">
                  {/* Employee Avatar */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border border-gray-200 flex items-center justify-center text-indigo-600 font-bold text-lg mr-4">
                    {employee.name.charAt(0).toUpperCase() + (employee.name.split(' ')[1]?.[0]?.toUpperCase() || '')}
                  </div>
                  
                  {/* Employee Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                          {employee.name}
                        </h3>
                        {employee.position && (
                          <div className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {employee.position}
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Actions - Visible on Hover */}
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
                          onClick={() => handleEditEmployee(employee)}
                          title="Edit employee"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          title="Delete employee"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Department Tag */}
                    <div className="mt-2 flex items-center">
                      <span className="mr-2 text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-500">{employee.department}</span>
                    </div>
                  </div>
                </div>
                
                {/* Contact Info Section */}
                <div className="p-4 border-t border-gray-100 space-y-2.5">
                  {employee.email && (
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div className="text-gray-500 truncate">{employee.email}</div>
                    </div>
                  )}
                  
                  {employee.phone && (
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div className="text-gray-500">{employee.phone}</div>
                    </div>
                  )}
                  
                  {employee.address && (
                    <div className="flex items-start text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-gray-500">{employee.address}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <p className="text-gray-500">No employees found matching your criteria</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    );
  };

  // Employee registration/edit modal with dark mode
  const renderModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${showModal ? 'visible' : 'invisible'} transition-all duration-300`}>
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden w-full max-w-lg transition-colors duration-200`}>
    {/* Header with gradient accent */}
    <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
    
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-stone-800'}`}>
          {editingEmployee ? 'Edit Employee' : 'Register New Employee'}
        </h3>
        
        <button 
          onClick={() => {
            setShowModal(false);
            setFormErrors({});
            setFormSubmitted(false);
          }}
          className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
            Full Name 
            <span className="text-red-500 ml-1">*</span>
            {formErrors.name && (
              <span className="ml-2 text-xs text-red-500">{formErrors.name}</span>
            )}
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              formErrors.name 
                ? 'border-red-500 bg-red-50' 
                : darkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                  : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            aria-required="true"
            aria-invalid={Boolean(formErrors.name)}
            aria-describedby={formErrors.name ? "name-error" : undefined}
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
            Department 
            <span className="text-red-500 ml-1">*</span>
            {formErrors.department && (
              <span className="ml-2 text-xs text-red-500">{formErrors.department}</span>
            )}
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              formErrors.department 
                ? 'border-red-500 bg-red-50' 
                : darkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.department}
            onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
            aria-required="true"
            aria-invalid={Boolean(formErrors.department)}
            aria-describedby={formErrors.department ? "department-error" : undefined}
            placeholder="Engineering"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Position
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.position}
            onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
            placeholder="Software Engineer"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
            Email
            {formErrors.email && (
              <span className="ml-2 text-xs text-red-500">{formErrors.email}</span>
            )}
          </label>
          <input
            type="email"
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              formErrors.email 
                ? 'border-red-500 bg-red-50' 
                : darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.email || ''}
            onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
            aria-invalid={Boolean(formErrors.email)}
            aria-describedby={formErrors.email ? "email-error" : undefined}
            placeholder="john.doe@company.com"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
            Phone
            {formErrors.phone && (
              <span className="ml-2 text-xs text-red-500">{formErrors.phone}</span>
            )}
          </label>
          <input
            type="tel"
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              formErrors.phone 
                ? 'border-red-500 bg-red-50' 
                : darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.phone || ''}
            onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
            aria-invalid={Boolean(formErrors.phone)}
            aria-describedby={formErrors.phone ? "phone-error" : undefined}
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Hire Date
          </label>
          <input
            type="date"
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              darkMode
                ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.hireDate || ''}
            onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})}
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Address
          </label>
          <textarea
            className={`w-full px-3 py-2.5 border rounded-lg transition-colors ${
              darkMode
                ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'border-gray-300 bg-white text-stone-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            value={newEmployee.address || ''}
            onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
            rows={3}
            placeholder="123 Main St, City, State, ZIP"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => {
            setShowModal(false);
            setFormErrors({});
            setFormSubmitted(false);
          }}
          className={`px-4 py-2.5 rounded-lg border ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          } transition-colors`}
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleRegisterEmployee}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm flex items-center gap-2"
          type="button"
        >
          {editingEmployee ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Save Changes
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Register Employee
            </>
          )}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>Fields marked with <span className="text-red-500">*</span> are required</span>
      </div>
    </div>
  </div>
</div>
  );

  // Verification modal with dark mode
  const renderVerificationModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${showVerificationModal ? 'visible' : 'invisible'} transition-all duration-300`}>
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md transition-colors duration-200 overflow-hidden`}>
    {/* Modal header with colored accent */}
    <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} flex items-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        Employee Verification
      </h3>
    </div>

    {/* Modal body */}
    <div className="p-6 space-y-4">
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Employee Name</label>
        <div className={`flex items-center w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-stone-950'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{selectedEmployeeName}</span>
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 flex items-center justify-between`}>
          <span>Employee ID</span>
          <span className="text-xs text-red-500">Required</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className={`w-full pl-10 pr-4 py-2.5 border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-stone-950'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
            placeholder="Enter your employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Enter the ID exactly as assigned to you</p>
      </div>
    </div>

    {/* Modal footer */}
    <div className={`px-6 py-4 bg-${darkMode ? 'gray-800' : 'gray-50'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
      <button
        onClick={() => setShowVerificationModal(false)}
        className={`px-4 py-2 rounded-md border ${
          darkMode 
            ? 'border-gray-600 text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
            : 'border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        } transition-colors duration-200`}
      >
        Cancel
      </button>
      <button
        onClick={handleVerification}
        className={`px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-md hover:from-indigo-700 hover:to-indigo-800 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Verify and Continue
      </button>
    </div>
  </div>
</div>
  );

  // Add onboarding state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [businessFormData, setBusinessFormData] = useState<BusinessInfo>({
    name: businessInfo.name || "TimeTrack Pro",
    address: businessInfo.address || "123 Business Ave, Suite 200, San Francisco, CA 94107",
    phone: businessInfo.phone || "(555) 123-4567",
    email: businessInfo.email || "info@timetrackpro.com",
    website: businessInfo.website || "timetrackpro.com",
    workStartTime: "09:00",
    workEndTime: "17:00",
    workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    established: "2023"
  });
  
  // Check if we've completed onboarding before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      if (onboardingCompleted) {
        setShowOnboarding(false);
      }
      
      // Load saved business info
      const savedBusinessInfo = localStorage.getItem('businessInfo');
      if (savedBusinessInfo) {
        const parsedInfo = JSON.parse(savedBusinessInfo);
        setBusinessInfo(parsedInfo);
        setBusinessFormData(parsedInfo);
      }
    }
  }, []);
  
  // Handle business form changes
  const handleBusinessFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setBusinessFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes for work days
  const handleWorkDayChange = (day: string) => {
    setBusinessFormData(prev => {
      const currentDays = prev.workDays || [];
      if (currentDays.includes(day)) {
        return { ...prev, workDays: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, workDays: [...currentDays, day] };
      }
    });
  };
  
  // Complete onboarding
  const completeOnboarding = () => {
    // Save business info
    setBusinessInfo(businessFormData);
    
    // Save to localStorage
    localStorage.setItem('businessInfo', JSON.stringify(businessFormData));
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Close onboarding
    setShowOnboarding(false);
    
    // Show success notification
    Swal.fire({
      title: 'Setup Complete!',
      text: 'Your TimeTrack Pro system is ready to use.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    });
  };
  
  // Available industry types
  const industryTypes = [
    "Retail",
    "Healthcare",
    "Education",
    "Technology",
    "Hospitality",
    "Manufacturing",
    "Finance",
    "Construction",
    "Food Service",
    "Professional Services",
    "Other"
  ];

  // Render onboarding modal
  const renderOnboardingModal = () => (
    <AnimatePresence>
      {showOnboarding && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`bg-${darkMode ? 'gray-800' : 'white'} p-0 rounded-xl shadow-2xl w-full max-w-lg border border-${darkMode ? 'gray-700' : 'gray-200'}/50 overflow-hidden flex flex-col max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header with gradient */}
            <div className={`sticky top-0 z-10 border-b border-${darkMode ? 'gray-700' : 'gray-200'}/70 bg-gradient-to-r from-${theme.primary}/90 to-${theme.accent}/90 px-6 py-5 backdrop-blur-sm`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-bold text-white flex items-center`}>
                  <div className="p-2 rounded-full bg-white/20 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Welcome to TimeTrack Pro!
                </h3>
              </div>
              <p className={`mt-1 text-sm text-white/80 ml-12`}>
                Setup your business profile to get started
              </p>
            </div>
            
            {/* Scrollable content area */}
            <div className="overflow-y-auto flex-grow px-6 py-5">
              {/* Privacy notice banner */}
              <div className="mb-6 p-0 overflow-hidden rounded-xl border border-amber-300/30 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10">
                <div className="bg-amber-200/30 dark:bg-amber-700/20 px-4 py-2.5 border-b border-amber-300/30 flex items-center">
                  <div className="p-1.5 rounded-full bg-amber-400/20 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Your Data Privacy & Security</h3>
                </div>
                
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>TimeTrack Pro operates <strong>entirely on your device</strong> - this app has <strong>zero access</strong> to your data</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-start text-amber-700 dark:text-amber-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>No accounts created</span>
                    </div>
                    <div className="flex items-start text-amber-700 dark:text-amber-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Secure local storage</span>
                    </div>
                    <div className="flex items-start text-amber-700 dark:text-amber-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                      </svg>
                      <span>Stored locally only</span>
                    </div>
                    <div className="flex items-start text-amber-700 dark:text-amber-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                      </svg>
                      <span>No cloud storage</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                completeOnboarding();
              }}>
                {/* Business Information Section */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className={`p-1.5 rounded-full bg-${theme.primary}/10 mr-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-${theme.primary}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 3H7v2h2V8zm2-3h2v2h-2V5zm2 3h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'}`}>Business Information</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1 flex items-center justify-between`}>
                        <span>Business Name</span>
                        <span className="text-xs text-red-500 font-medium">Required</span>
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={businessFormData.name}
                        onChange={handleBusinessFormChange}
                        className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                        required
                        placeholder="Enter your business name"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1 flex items-center justify-between`}>
                        <span>Industry Type</span>
                        <span className="text-xs text-red-500 font-medium">Required</span>
                      </label>
                      
                      <div className="relative">
                        <select 
                          name="industry"
                          title="Industry Type"
                          value={businessFormData.industry || ""}
                          onChange={(e) => handleBusinessFormChange(e)}
                          className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm appearance-none`}
                          required
                        >
                          <option value="" disabled>Select your industry</option>
                          {industryTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-${darkMode ? 'gray-400' : 'gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1`}>Year Established</label>
                      <input 
                        type="text" 
                        name="established"
                        value={businessFormData.established || ''}
                        onChange={handleBusinessFormChange}
                        className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                        placeholder="e.g., 2023"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Work Hours Section */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className={`p-1.5 rounded-full bg-${theme.accent}/10 mr-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-${theme.accent}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'}`}>Work Hours</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1 flex items-center justify-between`}>
                          <span>Start Time</span>
                          <span className="text-xs text-red-500 font-medium">Required</span>
                        </label>
                        <input 
                        title='Start Time'
                          type="time" 
                          name="workStartTime"
                          value={businessFormData.workStartTime}
                          onChange={handleBusinessFormChange}
                          className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1 flex items-center justify-between`}>
                          <span>End Time</span>
                          <span className="text-xs text-red-500 font-medium">Required</span>
                        </label>
                        <input 
                        title='End Time'
                          type="time" 
                          name="workEndTime"
                          value={businessFormData.workEndTime}
                          onChange={handleBusinessFormChange}
                          className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-2`}>Work Days</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div key={day} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`day-${day}`}
                              checked={(businessFormData.workDays || []).includes(day)}
                              onChange={() => handleWorkDayChange(day)}
                              className={`h-4 w-4 text-${theme.primary} focus:ring-${theme.primary} border-gray-300 rounded`}
                            />
                            <label htmlFor={`day-${day}`} className={`ml-2 block text-xs text-${darkMode ? 'gray-300' : 'gray-700'}`}>
                              {day.substring(0, 3)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information Section */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className={`p-1.5 rounded-full bg-${theme.success}/10 mr-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-${theme.success}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <h4 className={`text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'}`}>Contact Information</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1`}>Business Address</label>
                      <input 
                        type="text" 
                        name="address"
                        value={businessFormData.address || ''}
                        onChange={handleBusinessFormChange}
                        className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                        placeholder="Enter your business address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1`}>Phone Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={businessFormData.phone || ''}
                          onChange={handleBusinessFormChange}
                          className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                          placeholder="Phone number"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1`}>Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={businessFormData.email || ''}
                          onChange={handleBusinessFormChange}
                          className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium text-${darkMode ? 'gray-200' : 'gray-700'} mb-1`}>Website</label>
                      <input 
                        type="text" 
                        name="website"
                        value={businessFormData.website || ''}
                        onChange={handleBusinessFormChange}
                        className={`w-full p-3 bg-${darkMode ? 'gray-700' : 'white'} border border-${darkMode ? 'gray-600' : 'gray-300'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg focus:ring-2 focus:ring-${theme.primary} focus:border-${theme.primary} transition-all duration-200 text-sm`}
                        placeholder="e.g., timetrackpro.com"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Data backup reminder */}
                <div className={`mb-3 p-3 rounded-lg border border-${darkMode ? 'gray-700' : 'gray-200'} bg-${darkMode ? 'gray-800' : 'white'}`}>
                  <div className="flex items-start">
                    <div className={`p-1 rounded-full bg-${theme.primary}/10 mr-2 mt-0.5`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-${theme.primary}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={`text-xs text-${darkMode ? 'gray-400' : 'gray-500'}`}>
                      We recommend regularly <strong>exporting your data</strong> as a backup. Your data is stored locally, but browser cleanups can result in data loss.
                    </p>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Sticky action footer */}
            <div className={`sticky bottom-0 z-10 border-t border-${darkMode ? 'gray-700' : 'gray-200'}/70 bg-${darkMode ? 'gray-800/90' : 'white/90'} backdrop-blur-sm p-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3`}>
              <button 
                type="button"
                onClick={() => setShowOnboarding(false)}
                className={`px-4 py-2.5 bg-${darkMode ? 'gray-700' : 'gray-100'} hover:bg-${darkMode ? 'gray-600' : 'gray-200'} text-${darkMode ? 'gray-200' : 'gray-700'} rounded-lg shadow-sm font-medium transition-all duration-200 border border-${darkMode ? 'gray-600' : 'gray-200'} text-sm w-full sm:w-auto`}
              >
                Skip for Now
              </button>
              <button 
                type="submit"
                onClick={(e) => { 
                  e.preventDefault(); 
                  completeOnboarding();
                }}
                className={`px-5 py-2.5 bg-gradient-to-r from-${theme.primary} to-${theme.accent} hover:from-${theme.accent} hover:to-${theme.primary} text-white rounded-lg shadow-md font-medium transition-all duration-300 flex items-center justify-center space-x-2 text-sm w-full sm:w-auto`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Complete Setup</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // Add the onboarding modal to the component return
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">TimeTrack Pro</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? `border-indigo-500 ${darkMode ? 'text-white' : 'text-gray-900'}`
                      : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-100 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'employees'
                      ? `border-indigo-500 ${darkMode ? 'text-white' : 'text-gray-900'}`
                      : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-100 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  Employees
                </button>
              </div>
            </div>
            
            {/* Dark mode toggle button */}
            <div className="flex items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-200`}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? renderDashboard() : renderEmployees()}
      </main>

      {showModal && renderModal()}
      {showVerificationModal && renderVerificationModal()}
      {renderOnboardingModal()}
    </div>
  );
}