import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  FileSearch,
  BarChart3,
  Search,
  Plus,
  Edit3,
  Trash2,
  Download,
  ExternalLink,
  Save,
  Clock,
  MapPin,
  Check,
  X,
  FileCheck,
  UserCheck,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  GripVertical,
  Award,
  User,
  Banknote,
  Upload,
  PartyPopper,
  CalendarDays,
  Camera,
  Image as ImageIcon,
  Globe,
  Mail,
  Phone,
  Menu,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Ban
} from 'lucide-react';

import { supabase } from '../supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SEO from '../components/SEO';
import JSZip from 'jszip';
import DashboardKpiMetrics from '../components/admin/DashboardKpiMetrics';
import AppliedCandidatesChart from '../components/admin/AppliedCandidatesChart';
import JobVsCandidateAnalysis from '../components/admin/JobVsCandidateAnalysis';
import RecentActivityAndActions from '../components/admin/RecentActivityAndActions';
import FuturisticAnalytics from '../components/admin/FuturisticAnalytics';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const TAB_TO_SLUG = {
  'Dashboard': 'dashboard',
  'Jobs': 'jobs',
  'Applications': 'applications',
  'Resume Manager': 'resume-manager',
  'Employees': 'employees',
  'Finance': 'finance',
  'Events': 'events',
  'Analytics': 'analytics'
};

const SLUG_TO_TAB = {
  'dashboard': 'Dashboard',
  'dashbord': 'Dashboard',
  'jobs': 'Jobs',
  'applications': 'Applications',
  'resume-manager': 'Resume Manager',
  'resumemanager': 'Resume Manager',
  'employees': 'Employees',
  'employee': 'Employees',
  'finance': 'Finance',
  'events': 'Events',
  'analytics': 'Analytics'
};

const Admin = () => {
  const { tab: tabParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication states
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // Dashboard states
  const initialTab = (tabParam && SLUG_TO_TAB[tabParam.toLowerCase()]) || 'Dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Keep activeTab in sync when URL parameter changes (e.g. back/forward navigation or direct link)
  useEffect(() => {
    if (tabParam && SLUG_TO_TAB[tabParam.toLowerCase()]) {
      const resolved = SLUG_TO_TAB[tabParam.toLowerCase()];
      if (resolved !== activeTab) {
        setActiveTab(resolved);
      }
    } else if (location.pathname === '/admin' || location.pathname === '/admin/') {
      if (activeTab !== 'Dashboard') {
        setActiveTab('Dashboard');
      }
    }
  }, [tabParam, location.pathname]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    const slug = TAB_TO_SLUG[tabId] || tabId.toLowerCase();
    navigate(`/admin/${slug}`);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [downloadingResumes, setDownloadingResumes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchName, setSearchName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterBlacklistOnly, setFilterBlacklistOnly] = useState(false);

  // Blacklisted Candidates (Emails) State
  const [blacklistedEmails, setBlacklistedEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('macenza_blacklisted_emails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [blacklistInputEmail, setBlacklistInputEmail] = useState('');
  const [blacklistInputReason, setBlacklistInputReason] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('macenza_blacklisted_emails', JSON.stringify(blacklistedEmails));
    } catch (e) {
      console.error('Failed to sync blacklisted emails:', e);
    }
  }, [blacklistedEmails]);

  // Helper to check if an email or candidate is blacklisted
  const isCandidateBlacklisted = (candidateEmail) => {
    if (!candidateEmail) return false;
    const cleanEmail = candidateEmail.trim().toLowerCase();
    return blacklistedEmails.some(b => {
      const bEmail = typeof b === 'string' ? b : b.email;
      return bEmail && bEmail.trim().toLowerCase() === cleanEmail;
    });
  };

  const getBlacklistEntry = (candidateEmail) => {
    if (!candidateEmail) return null;
    const cleanEmail = candidateEmail.trim().toLowerCase();
    return blacklistedEmails.find(b => {
      const bEmail = typeof b === 'string' ? b : b.email;
      return bEmail && bEmail.trim().toLowerCase() === cleanEmail;
    }) || null;
  };

  const handleAddBlacklistEmail = (emailToAdd, reason = '') => {
    const clean = (emailToAdd || '').trim().toLowerCase();
    if (!clean) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const alreadyExists = blacklistedEmails.some(b => (typeof b === 'string' ? b : b.email).trim().toLowerCase() === clean);
    if (alreadyExists) {
      toast.info('Candidate is already on the blacklist.');
      return;
    }
    const newEntry = {
      email: clean,
      reason: reason ? reason.trim() : 'Flagged for internal review',
      addedAt: new Date().toISOString()
    };
    setBlacklistedEmails(prev => [newEntry, ...prev]);
    setBlacklistInputEmail('');
    setBlacklistInputReason('');
    toast.success(`Flagged ${clean} on blacklist for internal review.`);
  };

  const handleRemoveBlacklistEmail = (emailToRemove) => {
    const clean = (emailToRemove || '').trim().toLowerCase();
    setBlacklistedEmails(prev => prev.filter(b => (typeof b === 'string' ? b : b.email).trim().toLowerCase() !== clean));
    toast.info(`Removed ${clean} from blacklist.`);
  };

  // Selected Candidate for Resume Preview / Recruitment Actions
  const [selectedApp, setSelectedApp] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [selectedAppResumeSignedUrl, setSelectedAppResumeSignedUrl] = useState('');

  // Slide-Over Candidate Drawer State
  const [candidateDrawerApp, setCandidateDrawerApp] = useState(null);
  const [drawerNotesText, setDrawerNotesText] = useState('');
  const [candidateDrawerAppResumeSignedUrl, setCandidateDrawerAppResumeSignedUrl] = useState('');

  // Sign resume URL for selectedApp
  useEffect(() => {
    let active = true;
    const signUrl = async () => {
      const url = selectedApp?.resume;
      if (!url) {
        setSelectedAppResumeSignedUrl('');
        return;
      }

      if (url.includes('/resumes/')) {
        try {
          const parts = url.split('/resumes/');
          if (parts.length > 1) {
            const filePath = decodeURIComponent(parts[parts.length - 1].split('?')[0]);
            const { data, error } = await supabase.storage
              .from('resumes')
              .createSignedUrl(filePath, 900); // 15 mins for reading
            if (error) throw error;
            if (active && data && data.signedUrl) {
              setSelectedAppResumeSignedUrl(data.signedUrl);
            }
          }
        } catch (err) {
          console.error('Error signing selectedApp resume:', err);
          if (active) setSelectedAppResumeSignedUrl(url); // Fallback
        }
      } else {
        setSelectedAppResumeSignedUrl(url);
      }
    };

    signUrl();
    return () => { active = false; };
  }, [selectedApp?.resume]);

  // Sign resume URL for candidateDrawerApp
  useEffect(() => {
    let active = true;
    const signUrl = async () => {
      const url = candidateDrawerApp?.resume;
      if (!url) {
        setCandidateDrawerAppResumeSignedUrl('');
        return;
      }

      if (url.includes('/resumes/')) {
        try {
          const parts = url.split('/resumes/');
          if (parts.length > 1) {
            const filePath = decodeURIComponent(parts[parts.length - 1].split('?')[0]);
            const { data, error } = await supabase.storage
              .from('resumes')
              .createSignedUrl(filePath, 900); // 15 mins for reading
            if (error) throw error;
            if (active && data && data.signedUrl) {
              setCandidateDrawerAppResumeSignedUrl(data.signedUrl);
            }
          }
        } catch (err) {
          console.error('Error signing candidateDrawerApp resume:', err);
          if (active) setCandidateDrawerAppResumeSignedUrl(url); // Fallback
        }
      } else {
        setCandidateDrawerAppResumeSignedUrl(url);
      }
    };

    signUrl();
    return () => { active = false; };
  }, [candidateDrawerApp?.resume]);

  // Job Form State
  const initialJobForm = {
    title: '',
    department: '',
    salary: '',
    employmentType: 'Full Time',
    location: '',
    experience: '',
    skills: '',
    openings: 1,
    deadline: '',
    description: '',
    requirements: '',
    benefits: '',
    status: 'Active'
  };
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobFormSuccess, setJobFormSuccess] = useState('');

  const getProfilePicture = (empName, empProfilePic) => {
    if (empProfilePic) return empProfilePic;

    const nameToImage = {
      "shashank shubham": "/Team/Shashank Shubham Founder & CEO.jpeg",
      "garima": "/Team/Garima CTO.png",
      "dipanshu shubham": "/Team/A Dipanshu Shubham CMO.png",
      "kavita": "/Team/A Kavita Markating.png",
      "divya ghalot": "/Team/A Divya Ghalot AI Engineer.png",
      "priyanka berwa": "/Team/Priyanka HR.png",
      "priyanka bairwa": "/Team/Priyanka HR.png",
      "piyush saini": "/Team/Piyush Saini Fullstack Developer.png",
      "neha jaiswal": "/Team/NEHA JAISWAL Fullstack Developer.png",
      "riva sha": "/Team/Riva Sha FullStack Developer.png",
      "riva shah": "/Team/Riva Sha FullStack Developer.png",
      "khushboo rawat": "/Team/A Khushboo Rawat Business Development Manager.png",
      "kushboo rawat": "/Team/A Khushboo Rawat Business Development Manager.png",
      "aman partha": "/Team/A Aman Partha Full Stack Developer.png",
      "aman pathra": "/Team/A Aman Partha Full Stack Developer.png",
      "gungun rawat": "/Team/Gungun UI UX Designer.jpeg",
      "gungun": "/Team/Gungun UI UX Designer.jpeg",
      "akshita kumawat": "/Team/Akshita Kumawat Full Stack.jpeg",
      "akshita": "/Team/Akshita Kumawat Full Stack.jpeg",
      "deepak gupta": "/Team/A Deepak Gupta Secutry Tester.png",
      "diksha bansal": "/Team/A Diksha Bansal AI ML.png",
      "kapil sharma": "/Team/A Kapil Sharma Backend Developer.png",
      "naman": "/Team/A Naman Business Developmenet.png",
      "preet meena": "/Team/A Preet Meena Markating.png",
      "payal meena": "/Team/A Payal Meena Ui Ux Designer.png",
      "santosh rathore": "/Team/A Santosh Rathore Salles.png",
      "anamika sharma": "/Team/Anamika Sharma Frontend Developer.png",
      "deepti solanki": "/Team/Deepti Solanki AI ML Engineer.png",
      "devendra singh": "/Team/Devendra Singh Backend Engineer.png",
      "kavita yadhav": "/Team/Kavita Yadhav Frontend Engineer.png",
      "kuldeep kothari": "/Team/Kuldeep kothari Cybersecurity Engineer.png",
      "preeti kumari": "/Team/Preeti UI UX Designer.png",
      "rohit": "/Team/Rohit Tester & Backend Developer.png",
      "yashika agarwal": "/Team/Yashika Agarwal Data Scientist.png",
      "divyanshi sen": "/Team/Divyanshi Sen Full Stack Developer.jpg"
    };

    const normalized = empName ? empName.toLowerCase().trim() : "";
    return nameToImage[normalized] || null;
  };

  const calculateWorkingDays = (startDateStr, endDateStr) => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;
    const end = endDateStr ? new Date(endDateStr) : new Date();
    if (isNaN(end.getTime())) return null;

    // Reset time components for accurate calendar date difference
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Employees states
  const [employees, setEmployees] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);

  // Predefined & Custom Roles & Departments
  const defaultRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'UI/UX Designer',
    'AI/ML Engineer',
    'Cybersecurity Engineer',
    'Data Scientist',
    'QA Tester',
    'DevOps Engineer',
    'Project Manager'
  ];

  const defaultDepartments = [
    'Engineering',
    'Sales',
    'HR',
    'Marketing',
    'Design',
    'Operations',
    'Finance',
    'Research & Development'
  ];

  const [availableRoles, setAvailableRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('macenza_custom_roles');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...defaultRoles, ...parsed]));
      }
    } catch (e) {
      console.error(e);
    }
    return defaultRoles;
  });

  const [availableDepartments, setAvailableDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem('macenza_custom_departments');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...defaultDepartments, ...parsed]));
      }
    } catch (e) {
      console.error(e);
    }
    return defaultDepartments;
  });

  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [newCustomRole, setNewCustomRole] = useState('');
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [newCustomDept, setNewCustomDept] = useState('');

  // Manager Modal state for Roles & Departments
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [editingRoleItem, setEditingRoleItem] = useState(null); // { oldName: '', newName: '' }
  const [isManagingDepts, setIsManagingDepts] = useState(false);
  const [editingDeptItem, setEditingDeptItem] = useState(null); // { oldName: '', newName: '' }

  const handleAddNewRole = (roleToAdd, callback) => {
    const trimmed = (roleToAdd || '').trim();
    if (!trimmed) return;
    if (!availableRoles.includes(trimmed)) {
      const updated = [...availableRoles, trimmed];
      setAvailableRoles(updated);
      localStorage.setItem('macenza_custom_roles', JSON.stringify(updated));
    }
    if (callback) callback(trimmed);
    setNewCustomRole('');
    setIsAddingNewRole(false);
  };

  const handleUpdateRole = (oldRole, newRole) => {
    const trimmed = (newRole || '').trim();
    if (!trimmed || trimmed === oldRole) {
      setEditingRoleItem(null);
      return;
    }
    const updated = availableRoles.map(r => r === oldRole ? trimmed : r);
    setAvailableRoles(updated);
    localStorage.setItem('macenza_custom_roles', JSON.stringify(updated));

    // Update employees with this role
    setEmployees(prev => prev.map(emp => emp.role === oldRole ? { ...emp, role: trimmed } : emp));
    if (newEmployeeForm.role === oldRole) {
      setNewEmployeeForm(prev => ({ ...prev, role: trimmed }));
    }
    if (editEmployeeForm && editEmployeeForm.role === oldRole) {
      setEditEmployeeForm(prev => ({ ...prev, role: trimmed }));
    }
    if (selectedEmployee && selectedEmployee.role === oldRole) {
      setSelectedEmployee(prev => ({ ...prev, role: trimmed }));
    }
    setEditingRoleItem(null);
    toast.success(`Role updated to "${trimmed}"`);
  };

  const handleDeleteRole = (roleToDelete) => {
    if (!confirm(`Are you sure you want to delete role "${roleToDelete}"?`)) return;
    const updated = availableRoles.filter(r => r !== roleToDelete);
    setAvailableRoles(updated);
    localStorage.setItem('macenza_custom_roles', JSON.stringify(updated));

    if (newEmployeeForm.role === roleToDelete) {
      setNewEmployeeForm(prev => ({ ...prev, role: '' }));
    }
    if (editEmployeeForm && editEmployeeForm.role === roleToDelete) {
      setEditEmployeeForm(prev => ({ ...prev, role: '' }));
    }
    toast.success(`Role "${roleToDelete}" deleted`);
  };

  const handleAddNewDept = (deptToAdd, callback) => {
    const trimmed = (deptToAdd || '').trim();
    if (!trimmed) return;
    if (!availableDepartments.includes(trimmed)) {
      const updated = [...availableDepartments, trimmed];
      setAvailableDepartments(updated);
      localStorage.setItem('macenza_custom_departments', JSON.stringify(updated));
    }
    if (callback) callback(trimmed);
    setNewCustomDept('');
    setIsAddingNewDept(false);
  };

  const handleUpdateDept = (oldDept, newDept) => {
    const trimmed = (newDept || '').trim();
    if (!trimmed || trimmed === oldDept) {
      setEditingDeptItem(null);
      return;
    }
    const updated = availableDepartments.map(d => d === oldDept ? trimmed : d);
    setAvailableDepartments(updated);
    localStorage.setItem('macenza_custom_departments', JSON.stringify(updated));

    // Update employees with this department
    setEmployees(prev => prev.map(emp => emp.department === oldDept ? { ...emp, department: trimmed } : emp));
    if (newEmployeeForm.department === oldDept) {
      setNewEmployeeForm(prev => ({ ...prev, department: trimmed }));
    }
    if (editEmployeeForm && editEmployeeForm.department === oldDept) {
      setEditEmployeeForm(prev => ({ ...prev, department: trimmed }));
    }
    if (selectedEmployee && selectedEmployee.department === oldDept) {
      setSelectedEmployee(prev => ({ ...prev, department: trimmed }));
    }
    setEditingDeptItem(null);
    toast.success(`Department updated to "${trimmed}"`);
  };

  const handleDeleteDept = (deptToDelete) => {
    if (!confirm(`Are you sure you want to delete department "${deptToDelete}"?`)) return;
    const updated = availableDepartments.filter(d => d !== deptToDelete);
    setAvailableDepartments(updated);
    localStorage.setItem('macenza_custom_departments', JSON.stringify(updated));

    if (newEmployeeForm.department === deptToDelete) {
      setNewEmployeeForm(prev => ({ ...prev, department: '' }));
    }
    if (editEmployeeForm && editEmployeeForm.department === deptToDelete) {
      setEditEmployeeForm(prev => ({ ...prev, department: '' }));
    }
    toast.success(`Department "${deptToDelete}" deleted`);
  };

  // Finance states
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('macenza_finance_bills');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [newBillForm, setNewBillForm] = useState({
    billNumber: '',
    description: '',
    amount: '',
    date: '',
    pdfDataUri: ''
  });

  useEffect(() => {
    localStorage.setItem('macenza_finance_bills', JSON.stringify(bills));
  }, [bills]);

  // Event states
  const [eventPhotos, setEventPhotos] = useState(() => {
    const saved = localStorage.getItem('macenza_event_photos');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingEventPhoto, setIsAddingEventPhoto] = useState(false);
  const [newEventPhotoForm, setNewEventPhotoForm] = useState({
    title: '',
    date: '',
    imageDataUri: ''
  });

  useEffect(() => {
    localStorage.setItem('macenza_event_photos', JSON.stringify(eventPhotos));
  }, [eventPhotos]);

  const toggleRowSelection = (e, id) => {
    e.stopPropagation();
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAllRows = (e) => {
    if (selectedRows.length === employees.length && employees.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(employees.map(emp => emp.id));
    }
  };

  const exportEmployeesToCSV = () => {
    if (employees.length === 0) {
      toast.error('No employees to export');
      return;
    }
    const headers = ['Registration No.', 'Full Name', 'Father\'s Name', 'Date of Birth', 'Email ID', 'Contact Number', 'Role', 'Department', 'Start Date', 'End Date', 'Total Working Days', 'Aadhaar No.', 'Permanent Address', 'Current Address', 'Account No.', 'IFSC Code'];
    const csvContent = [
      headers.join(','),
      ...employees.map(emp => {
        const workingDays = calculateWorkingDays(emp.start_date, emp.end_date);
        return [
          `"${emp.registration_no || ''}"`,
          `"${emp.name || ''}"`,
          `"${emp.father_name || ''}"`,
          `"${emp.dob || ''}"`,
          `"${emp.email || ''}"`,
          `"${emp.contact_number || ''}"`,
          `"${emp.role || ''}"`,
          `"${emp.department || ''}"`,
          `"${emp.start_date || ''}"`,
          `"${emp.end_date || ''}"`,
          `"${workingDays !== null ? workingDays : ''}"`,
          `"${emp.aadhaar_no || ''}"`,
          `"${emp.permanent_address || ''}"`,
          `"${emp.current_address || ''}"`,
          `"${emp.account_no || ''}"`,
          `"${emp.ifsc_detail || ''}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Employees exported successfully');
  };
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editEmployeeForm, setEditEmployeeForm] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [pendingCertNumber, setPendingCertNumber] = useState('');
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    registration_no: '',
    name: '',
    father_name: '',
    dob: '',
    email: '',
    contact_number: '',
    role: '',
    department: '',
    start_date: '',
    end_date: '',
    alt_phone: '',
    aadhaar_no: '',
    permanent_address: '',
    current_address: '',
    account_no: '',
    ifsc_detail: '',
    salary: '',
    profile_picture: '',
    documents: []
  });

  const handleProfilePictureUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditEmployeeForm(prev => ({ ...prev, profile_picture: reader.result }));
        } else {
          setNewEmployeeForm(prev => ({ ...prev, profile_picture: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBillFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBillForm(prev => ({ ...prev, pdfDataUri: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    if (!newBillForm.billNumber || !newBillForm.description || !newBillForm.amount || !newBillForm.pdfDataUri) {
      toast.error('Please fill all required fields and upload the PDF bill.');
      return;
    }

    const newBill = {
      id: 'bill_' + Date.now(),
      ...newBillForm,
      createdAt: new Date().toISOString()
    };

    setBills([newBill, ...bills]);
    setNewBillForm({ billNumber: '', description: '', amount: '', date: '', pdfDataUri: '' });
    setIsAddingBill(false);
    toast.success('Bill uploaded successfully!');
  };

  const handleDeleteBill = (id) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      setBills(bills.filter(b => b.id !== id));
      toast.success('Bill deleted successfully');
    }
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const todayMs = today.setHours(0, 0, 0, 0);

    const upcoming = employees
      .filter(emp => emp.dob)
      .map(emp => {
        const [year, month, day] = emp.dob.split('-');
        let nextBirthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));

        if (nextBirthday.getTime() < todayMs) {
          nextBirthday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
        }

        const daysUntil = Math.ceil((nextBirthday.getTime() - todayMs) / (1000 * 60 * 60 * 24));

        return {
          ...emp,
          nextBirthday,
          daysUntil
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 20);

    return upcoming;
  };

  const handleEventPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compress heavy

          setNewEventPhotoForm(prev => ({ ...prev, imageDataUri: dataUrl }));
        };
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file (JPG/PNG).');
    }
  };

  const handleAddEventPhoto = (e) => {
    e.preventDefault();
    if (!newEventPhotoForm.title || !newEventPhotoForm.imageDataUri) {
      toast.error('Please add a title and select a photo.');
      return;
    }

    const newPhoto = {
      id: 'event_' + Date.now(),
      ...newEventPhotoForm,
      createdAt: new Date().toISOString()
    };

    setEventPhotos([newPhoto, ...eventPhotos]);
    setNewEventPhotoForm({ title: '', date: '', imageDataUri: '' });
    setIsAddingEventPhoto(false);
    toast.success('Event photo added successfully!');
  };

  const handleDeleteEventPhoto = (id) => {
    if (confirm('Are you sure you want to delete this event photo?')) {
      setEventPhotos(eventPhotos.filter(p => p.id !== id));
      toast.success('Photo deleted');
    }
  };

  // Handle Authentication Subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Jobs and Applications
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all jobs from Supabase
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch all applications and populate their job relations
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*, jobId:jobs(*)')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Map snake_case database schema to camelCase expected by the React UI
      const mappedJobs = (jobsData || []).map(job => ({
        ...job,
        _id: job.id, // Keep key compatible
        employmentType: job.employment_type || job.employmentType
      }));

      const mappedApps = (appsData || []).map(app => ({
        ...app,
        _id: app.id, // Keep key compatible
        candidateName: app.candidate_name || app.candidateName,
        linkedInUrl: app.linkedin_url || app.linkedInUrl,
        portfolioUrl: app.portfolio_url || app.portfolioUrl,
        coverLetter: app.cover_letter || app.coverLetter,
        resume: app.resume_url || app.resume,
        createdAt: app.created_at || app.createdAt,
        jobId: app.jobId ? {
          ...app.jobId,
          _id: app.jobId.id,
          employmentType: app.jobId.employment_type || app.jobId.employmentType
        } : null
      }));

      setJobs(mappedJobs);
      setApplications(mappedApps);

      if (mappedApps.length > 0 && !selectedApp) {
        setSelectedApp(mappedApps[0]);
        setNotesText(mappedApps[0].notes || '');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to Supabase. Check your env keys.');
      // Local fallback for testing UI when server is loading
      setJobs([
        { _id: '1', title: 'Frontend Engineer', department: 'Engineering', salary: '$80,000 - $110,000', employmentType: 'Full Time', location: 'Remote', experience: '3+ Years', skills: 'React, Tailwind CSS, JavaScript', openings: 2, deadline: '2026-06-30', description: 'Build dynamic premium web interfaces.', status: 'Active', createdAt: new Date() },
        { _id: '2', title: 'Backend Developer', department: 'Engineering', salary: '$90,000 - $120,000', employmentType: 'Full Time', location: 'Remote', experience: '5+ Years', skills: 'Node.js, Express, MongoDB', openings: 1, deadline: '2026-07-15', description: 'Design robust backend services.', status: 'Active', createdAt: new Date() },
        { _id: '3', title: 'AI Specialist', department: 'Research', salary: '$120,000 - $160,000', employmentType: 'Full Time', location: 'Hybrid', experience: '4+ Years', skills: 'Python, PyTorch, LLMs', openings: 1, deadline: '2026-06-10', description: 'Train and optimize customized AI services.', status: 'Draft', createdAt: new Date() }
      ]);
      const mockApps = [
        { _id: 'app1', candidateName: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8901', location: 'New York', experience: '4 Years', linkedInUrl: 'https://linkedin.com/in/johndoe', portfolioUrl: 'https://johndoe.dev', coverLetter: 'I am highly interested in working at Macenza. I love AI products and high fidelity user interfaces.', resume: '', jobId: { _id: '1', title: 'Frontend Engineer' }, status: 'Applied', notes: 'Strong Javascript skills.', createdAt: new Date(Date.now() - 86400000) },
        { _id: 'app2', candidateName: 'Jane Smith', email: 'jane@example.com', phone: '+1 987 654 3210', location: 'San Francisco', experience: '6 Years', linkedInUrl: 'https://linkedin.com/in/janesmith', portfolioUrl: 'https://janesmith.design', coverLetter: 'Passionate about frontend and pixel perfect implementations.', resume: '', jobId: { _id: '1', title: 'Frontend Engineer' }, status: 'Shortlisted', notes: 'Scheduled a brief screening call.', createdAt: new Date(Date.now() - 172800000) }
      ];
      setApplications(mockApps);
      setSelectedApp(mockApps[0]);
      setNotesText(mockApps[0].notes || '');
    } finally {
      setLoading(false);
    }
  };



  const saveEmployeeSingle = async (updatedEmployee) => {
    const updatedList = employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
    setEmployees(updatedList);

    // Save image to localStorage if present
    if (updatedEmployee.profile_picture) {
      const savedPics = JSON.parse(localStorage.getItem('macenza_employee_pics') || '{}');
      savedPics[updatedEmployee.id] = updatedEmployee.profile_picture;
      localStorage.setItem('macenza_employee_pics', JSON.stringify(savedPics));
    }

    try {
      const { certificates, profile_picture, ...employeeData } = updatedEmployee;
      const { error } = await supabase
        .from('employees')
        .upsert(employeeData);
      if (error) console.error('Supabase sync failed:', error.message);
    } catch (err) {
      console.error('Supabase sync exception:', err);
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!confirm(`Are you sure you want to remove employee ${empName}?`)) return;

    const updated = employees.filter(item => item.id !== empId);
    setEmployees(updated);

    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee(null);
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', empId);
      if (error) {
        console.warn('Failed to delete employee from Supabase:', error.message);
      } else {
        const orderIds = updated.map(emp => emp.id);
        localStorage.setItem('macenza_employee_order', JSON.stringify(orderIds));
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedRows.length} selected employees?`)) return;

    const updated = employees.filter(item => !selectedRows.includes(item.id));
    setEmployees(updated);

    if (selectedEmployee && selectedRows.includes(selectedEmployee.id)) {
      setSelectedEmployee(null);
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .in('id', selectedRows);
      if (error) {
        toast.error('Failed to delete from database: ' + error.message);
      } else {
        const orderIds = updated.map(emp => emp.id);
        localStorage.setItem('macenza_employee_order', JSON.stringify(orderIds));
        toast.success(`Successfully deleted ${selectedRows.length} employees`);
        setSelectedRows([]);
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  };

  const loadEmployeeCertificates = async (employeeId) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('employee_id', employeeId);
      if (error) throw error;
      setSelectedEmployee(prev => prev && prev.id === employeeId ? { ...prev, certificates: data || [] } : prev);
    } catch (err) {
      console.warn('Failed to load certificates:', err.message);
    }
  };

  const handleUploadCertificateClick = () => {
    const certNum = prompt("Please enter the unique Certification Number:");
    if (!certNum) {
      toast.error("Certification Number is required to upload a certificate.");
      return;
    }
    setPendingCertNumber(certNum.trim().toUpperCase());

    const input = document.getElementById('certificate-file-input');
    if (input) {
      input.value = '';
      input.click();
    }
  };

  const handleCertificateFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedEmployee || !pendingCertNumber) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedEmployee.id}-${pendingCertNumber}-${Date.now()}.${fileExt}`;
      let publicUrl = '';

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('employee-certs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage
          .from('employee-certs')
          .getPublicUrl(fileName);

        publicUrl = url;
      } catch (storageErr) {
        console.warn('Supabase storage upload failed, using Object URL fallback', storageErr);
        publicUrl = URL.createObjectURL(file);
      }

      const newCert = {
        id: 'cert_' + Date.now(),
        employee_id: selectedEmployee.id,
        certification_number: pendingCertNumber,
        name: file.name,
        url: publicUrl
      };

      const { error: insertError } = await supabase
        .from('certificates')
        .insert(newCert);

      if (insertError) throw insertError;

      const updatedCerts = [...(selectedEmployee.certificates || []), newCert];
      setSelectedEmployee({ ...selectedEmployee, certificates: updatedCerts });

      toast.success('Certificate uploaded and registered successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload certificate: ' + err.message);
    } finally {
      setPendingCertNumber('');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...employees];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    setEmployees(list);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    const orderIds = employees.map(emp => emp.id);
    localStorage.setItem('macenza_employee_order', JSON.stringify(orderIds));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const newEmp = {
      ...newEmployeeForm,
      id: 'emp_' + Date.now(),
      documents: []
    };

    const updated = [...employees, newEmp];
    setEmployees(updated);

    // Save image to localStorage if present
    if (newEmp.profile_picture) {
      const savedPics = JSON.parse(localStorage.getItem('macenza_employee_pics') || '{}');
      savedPics[newEmp.id] = newEmp.profile_picture;
      localStorage.setItem('macenza_employee_pics', JSON.stringify(savedPics));
    }

    setNewEmployeeForm({
      registration_no: '',
      name: '',
      father_name: '',
      dob: '',
      email: '',
      contact_number: '',
      role: '',
      department: '',
      start_date: '',
      end_date: '',
      alt_phone: '',
      aadhaar_no: '',
      permanent_address: '',
      current_address: '',
      account_no: '',
      ifsc_detail: '',
      salary: '',
      profile_picture: '',
      documents: []
    });
    setIsAddingEmployee(false);

    try {
      const { profile_picture, ...employeeData } = newEmp;
      const { error } = await supabase
        .from('employees')
        .insert(employeeData);
      if (error) {
        console.warn('Failed to insert employee into Supabase:', error.message);
      } else {
        const orderIds = updated.map(emp => emp.id);
        localStorage.setItem('macenza_employee_order', JSON.stringify(orderIds));
        toast.success('Employee profile created successfully!');
      }
    } catch (err) {
      console.warn('Supabase insert exception:', err);
    }
  };

  const handleSaveEmployeeEdit = async (e) => {
    e.preventDefault();
    if (!editEmployeeForm) return;

    const updated = employees.map(emp =>
      emp.id === editEmployeeForm.id ? editEmployeeForm : emp
    );
    setEmployees(updated);
    setSelectedEmployee(editEmployeeForm);
    setIsEditingEmployee(false);

    // Save image to localStorage if present
    if (editEmployeeForm.profile_picture) {
      const savedPics = JSON.parse(localStorage.getItem('macenza_employee_pics') || '{}');
      savedPics[editEmployeeForm.id] = editEmployeeForm.profile_picture;
      localStorage.setItem('macenza_employee_pics', JSON.stringify(savedPics));
    }

    try {
      const { certificates, profile_picture, ...employeeData } = editEmployeeForm;
      const { error } = await supabase
        .from('employees')
        .upsert(employeeData);
      if (error) {
        console.warn('Failed to update employee in Supabase:', error.message);
        toast.error('Failed to update employee: ' + error.message);
      } else {
        toast.success('Employee profile updated successfully!');
      }
    } catch (err) {
      console.warn('Supabase update exception:', err);
      toast.error('Failed to update employee: ' + err.message);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedEmployee) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedEmployee.id}-${Date.now()}.${fileExt}`;
      let publicUrl = '';

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('employee-docs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage
          .from('employee-docs')
          .getPublicUrl(fileName);

        publicUrl = url;
      } catch (storageErr) {
        console.warn('Supabase storage upload failed, using Object URL fallback', storageErr);
        publicUrl = URL.createObjectURL(file);
      }

      const newDoc = { name: file.name, url: publicUrl };
      const updatedDocs = [...(selectedEmployee.documents || []), newDoc];
      const updatedEmployee = { ...selectedEmployee, documents: updatedDocs };
      await saveEmployeeSingle(updatedEmployee);
      setSelectedEmployee(updatedEmployee);
      toast.success('Document uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload document: ' + err.message);
    }
  };

  // Load employees from Supabase
  useEffect(() => {
    if (user) {
      const loadEmployees = async () => {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('*');
          if (error) throw error;

          const loaded = data || [];

          // Sort by registration_no
          loaded.sort((a, b) => {
            const regA = a.registration_no || '';
            const regB = b.registration_no || '';
            return regA.localeCompare(regB, undefined, { numeric: true, sensitivity: 'base' });
          });

          const savedPics = JSON.parse(localStorage.getItem('macenza_employee_pics') || '{}');
          const loadedWithPics = loaded.map(emp => ({
            ...emp,
            profile_picture: savedPics[emp.id] || emp.profile_picture || ''
          }));

          const savedOrder = localStorage.getItem('macenza_employee_order');
          if (savedOrder) {
            try {
              const orderIds = JSON.parse(savedOrder);
              loadedWithPics.sort((a, b) => {
                const indexA = orderIds.indexOf(a.id);
                const indexB = orderIds.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              });
            } catch (jsonErr) {
              console.warn('Failed to parse employee sort order:', jsonErr);
            }
          }
          setEmployees(loadedWithPics);
        } catch (err) {
          console.error('Failed to load employees from database:', err.message);
          setEmployees([]);
        }
      };

      loadEmployees();
    }
  }, [user]);

  // Trigger data fetching on user login
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSignIn = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginError('');
    setSigningIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setLoginError(err.message || 'Invalid sign-in credentials.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setLoginError('Please enter your email address first to reset password.');
      return;
    }
    try {
      setSigningIn(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin',
      });
      if (error) throw error;
      toast.success('Password reset link sent! Check your email.');
      setLoginError('');
    } catch (err) {
      console.error(err);
      setLoginError(err.message || 'Failed to send reset link.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm('Are you sure you want to sign out of the Admin Portal?')) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };





  // Update notesText when selectedApp changes
  useEffect(() => {
    if (selectedApp) {
      setNotesText(selectedApp.notes || '');
    }
  }, [selectedApp]);

  // Reset scroll position of active scrollable areas when active tab changes
  useEffect(() => {
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(el => el.scrollTo(0, 0));
  }, [activeTab]);

  // Handle Job Form Actions
  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (statusOverride = null) => {
    const jobData = {
      title: jobForm.title,
      department: jobForm.department,
      salary: jobForm.salary,
      employment_type: jobForm.employmentType, // snake_case DB mapping
      location: jobForm.location,
      experience: jobForm.experience,
      skills: jobForm.skills,
      openings: jobForm.openings,
      deadline: jobForm.deadline,
      description: jobForm.description,
      requirements: jobForm.requirements,
      benefits: jobForm.benefits,
      status: statusOverride || jobForm.status
    };

    try {
      if (editingJobId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJobId);
        if (error) throw error;
        setJobFormSuccess('Job updated successfully!');
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert([jobData]);
        if (error) throw error;
        setJobFormSuccess('Job posted successfully!');
      }

      setJobForm(initialJobForm);
      setEditingJobId(null);
      fetchData();
      setTimeout(() => setJobFormSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      toast.error('Error: ' + err.message);
    }
  };

  const handleEditJobClick = (job) => {
    setJobForm({
      title: job.title || '',
      department: job.department || '',
      salary: job.salary || '',
      employmentType: job.employmentType || 'Full Time',
      location: job.location || '',
      experience: job.experience || '',
      skills: job.skills || '',
      openings: job.openings || 1,
      deadline: job.deadline || '',
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      status: job.status || 'Active'
    });
    setEditingJobId(job._id);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete job: ' + err.message);
    }
  };

  // Handle Application recruitment actions
  const handleUpdateApplicationStatus = async (status) => {
    if (!selectedApp) return;
    const appId = selectedApp.id || selectedApp._id;
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appId)
        .select('*, jobId:jobs(*)')
        .single();

      if (error) throw error;

      const mapped = {
        ...data,
        _id: data.id,
        candidateName: data.candidate_name,
        linkedInUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
        coverLetter: data.cover_letter,
        resume: data.resume_url,
        createdAt: data.created_at || data.createdAt,
        jobId: data.jobId ? {
          ...data.jobId,
          _id: data.jobId.id,
          employmentType: data.jobId.employment_type || data.jobId.employmentType
        } : null
      };

      setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? mapped : a));
      setSelectedApp(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Error updating status: ' + err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    const appId = selectedApp.id || selectedApp._id;
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ notes: notesText })
        .eq('id', appId)
        .select('*, jobId:jobs(*)')
        .single();

      if (error) throw error;

      const mapped = {
        ...data,
        _id: data.id,
        candidateName: data.candidate_name,
        linkedInUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
        coverLetter: data.cover_letter,
        resume: data.resume_url,
        createdAt: data.created_at || data.createdAt,
        jobId: data.jobId ? {
          ...data.jobId,
          _id: data.jobId.id,
          employmentType: data.jobId.employment_type || data.jobId.employmentType
        } : null
      };

      setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? mapped : a));
      setSelectedApp(mapped);
      toast.success('Recruiter notes saved!');
    } catch (err) {
      console.error(err);
      toast.error('Error saving notes: ' + err.message);
    }
  };

  // Drawer Recruitment Handlers
  const handleDrawerStatusUpdate = async (targetApp, newStatus) => {
    if (!targetApp) return;
    const appId = targetApp.id || targetApp._id;
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId)
        .select('*, jobId:jobs(*)')
        .single();

      if (error) throw error;

      const mapped = {
        ...data,
        _id: data.id,
        candidateName: data.candidate_name,
        linkedInUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
        coverLetter: data.cover_letter,
        resume: data.resume_url,
        createdAt: data.created_at || data.createdAt,
        jobId: data.jobId ? {
          ...data.jobId,
          _id: data.jobId.id,
          employmentType: data.jobId.employment_type || data.jobId.employmentType
        } : null
      };

      setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? mapped : a));
      setCandidateDrawerApp(mapped);
      if (selectedApp && (selectedApp.id === appId || selectedApp._id === appId)) {
        setSelectedApp(mapped);
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      const updated = { ...targetApp, status: newStatus };
      setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? updated : a));
      setCandidateDrawerApp(updated);
      if (selectedApp && (selectedApp.id === appId || selectedApp._id === appId)) {
        setSelectedApp(updated);
      }
      toast.success(`Status updated to ${newStatus}`);
    }
  };

  const handleDrawerSaveNotes = async (targetApp, notes) => {
    if (!targetApp) return;
    const appId = targetApp.id || targetApp._id;
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ notes })
        .eq('id', appId)
        .select('*, jobId:jobs(*)')
        .single();

      if (error) throw error;

      const mapped = {
        ...data,
        _id: data.id,
        candidateName: data.candidate_name,
        linkedInUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
        coverLetter: data.cover_letter,
        resume: data.resume_url,
        createdAt: data.created_at || data.createdAt,
        jobId: data.jobId ? {
          ...data.jobId,
          _id: data.jobId.id,
          employmentType: data.jobId.employment_type || data.jobId.employmentType
        } : null
      };

      setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? mapped : a));
      setCandidateDrawerApp(mapped);
      if (selectedApp && (selectedApp.id === appId || selectedApp._id === appId)) {
        setSelectedApp(mapped);
      }
      toast.success('Recruiter notes saved!');
    } catch (err) {
      console.error(err);
      const updated = { ...targetApp, notes };
      setApplications(prev => prev.map(a => (a.id === appId || a._id === appId) ? updated : a));
      setCandidateDrawerApp(updated);
      if (selectedApp && (selectedApp.id === appId || selectedApp._id === appId)) {
        setSelectedApp(updated);
      }
      toast.success('Recruiter notes saved!');
    }
  };

  const handleDownloadResume = async (e, url, candidateName) => {
    e.preventDefault();
    if (!url) return;

    let downloadUrl = url;

    // Resolve private buckets dynamically via signed URLs
    if (url.includes('/employee-docs/') || url.includes('/resumes/') || url.includes('/employee-certs/')) {
      try {
        const isDocs = url.includes('/employee-docs/');
        const isCerts = url.includes('/employee-certs/');
        const bucket = isDocs ? 'employee-docs' : (isCerts ? 'employee-certs' : 'resumes');
        const separator = isDocs ? '/employee-docs/' : (isCerts ? '/employee-certs/' : '/resumes/');
        const parts = url.split(separator);
        if (parts.length > 1) {
          const filePath = decodeURIComponent(parts[parts.length - 1].split('?')[0]);
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 60);
          if (error) throw error;
          if (data && data.signedUrl) {
            downloadUrl = data.signedUrl;
          }
        }
      } catch (signError) {
        console.error('Error signing URL:', signError);
      }
    }

    const filename = candidateName
      ? `${candidateName.replace(/\s+/g, '_')}_Resume.${url.split('.').pop().split('?')[0] || 'pdf'}`
      : 'Resume.pdf';

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('Direct download via fetch failed, trying query parameter fallback', error);
      if (downloadUrl.includes('supabase.co')) {
        const fallbackUrl = downloadUrl.includes('?') ? `${downloadUrl}&download=` : `${downloadUrl}?download=`;
        const link = document.createElement('a');
        link.href = fallbackUrl;
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.open(url, '_blank');
      }
    }
  };

  const exportApplicationsToCSV = () => {
    if (filteredApplications.length === 0) {
      toast.error('No candidate applications to export');
      return;
    }
    const headers = ['Candidate Name', 'Email', 'Phone', 'Job Applied', 'Experience', 'Location', 'Applied Date', 'Status', 'Internal Review Flag', 'LinkedIn URL', 'Portfolio URL', 'Resume URL', 'Cover Letter', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredApplications.map(app => [
        `"${(app.candidateName || '').replace(/"/g, '""')}"`,
        `"${(app.email || '').replace(/"/g, '""')}"`,
        `"${(app.phone || '').replace(/"/g, '""')}"`,
        `"${(app.jobId?.title || 'General Placement').replace(/"/g, '""')}"`,
        `"${(app.experience || '').replace(/"/g, '""')}"`,
        `"${(app.location || '').replace(/"/g, '""')}"`,
        `"${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}"`,
        `"${(app.status || '').replace(/"/g, '""')}"`,
        `"${isCandidateBlacklisted(app.email) ? 'BLACKLISTED (Review)' : 'Normal'}"`,
        `"${(app.linkedInUrl || '').replace(/"/g, '""')}"`,
        `"${(app.portfolioUrl || '').replace(/"/g, '""')}"`,
        `"${(app.resume || '').replace(/"/g, '""')}"`,
        `"${(app.coverLetter || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(app.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Macenza_Applications_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications CSV exported instantly!');
  };

  const handleDownloadAllResumes = async () => {
    const appsToDownload = filteredApplications.filter(app => app.resume);

    if (applications.length === 0) {
      toast.error('No applications available to download.');
      return;
    }

    if (appsToDownload.length === 0) {
      toast.info('No resumes available for current filter selection.');
      return;
    }

    setDownloadingResumes(true);
    const toastId = toast.loading(`Starting download for ${appsToDownload.length} candidate resumes...`);

    try {
      const zip = new JSZip();
      const folder = zip.folder("Resumes");
      let completedCount = 0;
      const total = appsToDownload.length;

      // Helper function to fetch single resume with 2.5s abort timeout
      const processApp = async (app) => {
        const candidateName = (app.candidateName || 'Candidate').replace(/[^a-zA-Z0-9_\-]/g, '_');
        const jobTitle = (app.jobId?.title || 'Position').replace(/[^a-zA-Z0-9_\-]/g, '_');
        let url = app.resume;

        // Resolve private buckets dynamically via signed URLs for bulk package download
        if (url && url.includes('/resumes/')) {
          try {
            const parts = url.split('/resumes/');
            if (parts.length > 1) {
              const filePath = decodeURIComponent(parts[parts.length - 1].split('?')[0]);
              const { data, error } = await supabase.storage
                .from('resumes')
                .createSignedUrl(filePath, 60);
              if (error) throw error;
              if (data && data.signedUrl) {
                url = data.signedUrl;
              }
            }
          } catch (signError) {
            console.error('Error signing bulk resume URL:', signError);
          }
        }

        let ext = 'pdf';
        if (url && typeof url === 'string') {
          const cleanUrl = url.split('?')[0];
          const parts = cleanUrl.split('.');
          if (parts.length > 1) {
            const lastPart = parts.pop().toLowerCase();
            if (['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'].includes(lastPart)) {
              ext = lastPart;
            }
          }
        }

        const filename = `${candidateName}_${jobTitle}_Resume.${ext}`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error(`HTTP status ${response.status}`);
          const blob = await response.blob();
          folder.file(filename, blob);
        } catch (fetchErr) {
          const detailsContent = `MACENZA CAREERS - CANDIDATE RESUME SUMMARY\n` +
            `==========================================\n` +
            `Candidate Name : ${app.candidateName || 'N/A'}\n` +
            `Email          : ${app.email || 'N/A'}\n` +
            `Phone          : ${app.phone || 'N/A'}\n` +
            `Job Applied    : ${app.jobId?.title || 'N/A'}\n` +
            `Experience     : ${app.experience || 'N/A'}\n` +
            `Location       : ${app.location || 'N/A'}\n` +
            `Status         : ${app.status || 'Applied'}\n` +
            `Applied Date   : ${app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}\n` +
            `LinkedIn       : ${app.linkedInUrl || 'N/A'}\n` +
            `Portfolio      : ${app.portfolioUrl || 'N/A'}\n` +
            `Resume URL     : ${url || 'N/A'}\n\n` +
            `COVER LETTER:\n` +
            `${app.coverLetter || 'No cover letter provided.'}\n\n` +
            `NOTES:\n` +
            `${app.notes || 'No notes.'}\n`;
          folder.file(`${candidateName}_${jobTitle}_Details.txt`, detailsContent);
        } finally {
          completedCount++;
          if (completedCount % 5 === 0 || completedCount === total) {
            toast.update(toastId, {
              render: `Packaging resumes: ${completedCount} / ${total} (${Math.round((completedCount / total) * 100)}%)...`,
              isLoading: true
            });
          }
        }
      };

      // Process in parallel batches of 25 concurrently
      const BATCH_SIZE = 25;
      for (let i = 0; i < appsToDownload.length; i += BATCH_SIZE) {
        const batch = appsToDownload.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(app => processApp(app)));
      }

      toast.update(toastId, {
        render: `Compressing ${total} files into ZIP archive...`,
        isLoading: true
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `Macenza_Resumes_${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.update(toastId, {
        render: `Successfully downloaded ZIP with ${total} candidate resumes!`,
        type: 'success',
        isLoading: false,
        autoClose: 4000
      });
    } catch (zipErr) {
      console.error('Error generating resumes zip:', zipErr);
      toast.update(toastId, {
        render: 'Failed to generate resumes ZIP archive.',
        type: 'error',
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setDownloadingResumes(false);
    }
  };


  // Filter Applications
  const filteredApplications = applications.filter(app => {
    // Name / Email search
    const matchesName = app.candidateName.toLowerCase().includes(searchName.toLowerCase()) ||
      app.email.toLowerCase().includes(searchName.toLowerCase());

    // Location Filter
    const matchesLocation = !filterLocation || app.location.toLowerCase().includes(filterLocation.toLowerCase());

    // Position Filter
    const matchesPosition = !filterPosition || (app.jobId && app.jobId.title === filterPosition);

    // Experience Filter
    const matchesExperience = !filterExperience || app.experience.toLowerCase().includes(filterExperience.toLowerCase());

    // Type Filter
    const matchesType = !filterType || (app.jobId && app.jobId.employmentType === filterType);

    // Date Filter (within X days)
    let matchesDate = true;
    if (filterDate) {
      const appDate = new Date(app.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - appDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesDate = diffDays <= parseInt(filterDate);
    }

    // Blacklist filter
    const isBlacklisted = isCandidateBlacklisted(app.email);
    const matchesBlacklist = !filterBlacklistOnly || isBlacklisted;

    return matchesName && matchesLocation && matchesPosition && matchesExperience && matchesType && matchesDate && matchesBlacklist;
  });

  // Calculate Overview Stats
  const totalJobs = jobs.length;
  const totalApps = applications.length;
  const newApps = applications.filter(a => a.status === 'Applied').length;
  const shortlistedApps = applications.filter(a => a.status === 'Shortlisted').length;
  const scheduledApps = applications.filter(a => a.status === 'Interview Scheduled').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;
  const blacklistedAppsCount = applications.filter(a => isCandidateBlacklisted(a.email)).length;

  // Render Stats Card
  const renderStatsCard = (title, count, icon, subtext) => (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{count}</h3>
        </div>
        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
          {icon}
        </div>
      </div>
      <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
        <span className="text-blue-600 font-bold">{subtext}</span> overall activity
      </span>
    </div>
  );

  if (authChecking) {
    return (
      <div className="admin-panel-root min-h-screen bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-widest text-black/40 uppercase animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-panel-root min-h-screen bg-white text-black flex flex-col items-center justify-center relative overflow-hidden px-6">
        <SEO title="Admin Portal | Macenza" description="Macenza Admin Portal" canonicalPath="/admin" noindex={true} />
        {/* Futuristic glowing ambient background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <img src="/logo.svg" alt="Macenza Logo" className="w-10 h-10 object-contain rounded-2xl shadow-lg shadow-primary/20 bg-white p-1" />
          <span className="text-2xl font-black tracking-tighter text-black uppercase">MACENZA ADMIN</span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-[#EFF6FF]/60 backdrop-blur-xl border border-[#BFDBFE]/60 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-2xl relative z-10 hover:border-primary/20 transition-all duration-500 group">
          <div className="mb-8">
            <h3 className="text-3xl font-black text-black mb-2 tracking-tight">System Sign In</h3>
            <p className="text-sm text-black/55 font-medium leading-relaxed">Enter your administrator credentials to securely connect to the recruitment pipelines.</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 font-semibold rounded-2xl text-xs flex items-center gap-2.5 animate-shake">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              {loginError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-black/60 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@macenza.com"
                className="bg-white border border-[#BFDBFE] p-4 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-black/60 tracking-wider">Security Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-white border border-[#BFDBFE] p-4 rounded-2xl text-black font-semibold text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <div className="flex justify-end mt-1">
                <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-4 mt-2 bg-primary text-white rounded-full font-black text-sm tracking-wider uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all duration-300 hover:shadow-2xl active:scale-98 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {signingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Dashboard ➔
                </>
              )}
            </button>
          </form>

          {/* Database Info Tip */}
          <div className="mt-8 pt-6 border-t border-[#BFDBFE]/60 flex items-center gap-3">
            <div className="p-2 bg-[#DBEAFE] rounded-xl text-primary">
              🔒
            </div>
            <p className="text-[10px] font-bold text-black/40 leading-normal uppercase">
              Secure authentication via Macenza database firewall.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-root flex min-h-screen text-slate-900 relative overflow-hidden bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#e0f7fa]">
      <SEO title="Admin Dashboard | Macenza" description="Macenza Admin Portal" canonicalPath="/admin" noindex={true} />

      {/* Beautiful Ambient Background with Dynamic Curves and Organic Leaves (Light Blue Theme) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Radial Lighting Gradients */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-sky-300/35 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-blue-300/30 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 left-1/4 w-[750px] h-[750px] bg-cyan-200/40 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-200/35 rounded-full blur-[130px]" />

        {/* Decorative SVG: Flowing Random Curved Lines & Floating Leaves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-65"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
        >
          <defs>
            <linearGradient id="curveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="curveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="leafGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Random Organic Flowing Curve Lines */}
          <path
            d="M-50,120 Q320,40 580,240 T1100,280 T1500,140"
            fill="none"
            stroke="url(#curveGrad1)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <path
            d="M-80,480 Q240,680 620,490 T1180,620 T1520,460"
            fill="none"
            stroke="url(#curveGrad2)"
            strokeWidth="2.25"
          />
          <path
            d="M100,-40 Q400,320 820,180 T1380,420 T1550,780"
            fill="none"
            stroke="url(#curveGrad1)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M-100,750 Q280,520 720,780 T1260,700 T1520,860"
            fill="none"
            stroke="url(#curveGrad2)"
            strokeWidth="1.75"
          />
          <path
            d="M300,-60 C480,220 180,500 520,740 S980,820 1200,980"
            fill="none"
            stroke="url(#curveGrad1)"
            strokeWidth="1.25"
            strokeDasharray="3 5"
          />
          <path
            d="M-40,320 C340,160 520,380 920,210 S1320,320 1500,260"
            fill="none"
            stroke="url(#curveGrad2)"
            strokeWidth="1.75"
          />

          {/* Organic Leaf Silhouettes across canvas */}
          {/* Leaf 1 - Top Left */}
          <g transform="translate(140, 110) rotate(-28) scale(1.15)">
            <path
              d="M0,45 C-28,30 -30,-15 0,-45 C30,-15 28,30 0,45 Z"
              fill="url(#leafGrad1)"
            />
            <path d="M0,42 Q0,0 0,-40" stroke="#0284c7" strokeWidth="1" strokeOpacity="0.5" fill="none" />
            <path d="M0,15 Q-10,5 -18,2" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
            <path d="M0,5 Q12,-3 18,-6" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
            <path d="M0,-12 Q-10,-20 -15,-22" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Leaf 2 - Top Right */}
          <g transform="translate(1280, 80) rotate(42) scale(1.35)">
            <path
              d="M0,50 C-32,35 -34,-18 0,-50 C34,-18 32,35 0,50 Z"
              fill="url(#leafGrad2)"
            />
            <path d="M0,46 Q0,0 0,-44" stroke="#0369a1" strokeWidth="1" strokeOpacity="0.5" fill="none" />
            <path d="M0,18 Q-12,8 -20,4" stroke="#0369a1" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
            <path d="M0,6 Q14,-4 22,-8" stroke="#0369a1" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Leaf 3 - Mid Floating */}
          <g transform="translate(420, 360) rotate(15) scale(0.9)">
            <path
              d="M0,40 C-24,26 -26,-12 0,-40 C26,-12 24,26 0,40 Z"
              fill="url(#leafGrad3)"
            />
            <path d="M0,36 Q0,0 0,-34" stroke="#2563eb" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Leaf 4 - Center Right */}
          <g transform="translate(1040, 420) rotate(-45) scale(1.2)">
            <path
              d="M0,48 C-30,32 -32,-16 0,-48 C32,-16 30,32 0,48 Z"
              fill="url(#leafGrad1)"
            />
            <path d="M0,44 Q0,0 0,-42" stroke="#0284c7" strokeWidth="1" strokeOpacity="0.5" fill="none" />
            <path d="M0,16 Q-12,6 -18,2" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
            <path d="M0,4 Q12,-6 20,-10" stroke="#0284c7" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Leaf 5 - Bottom Left */}
          <g transform="translate(260, 720) rotate(55) scale(1.4)">
            <path
              d="M0,52 C-34,36 -36,-18 0,-52 C36,-18 34,36 0,52 Z"
              fill="url(#leafGrad2)"
            />
            <path d="M0,48 Q0,0 0,-46" stroke="#0369a1" strokeWidth="1" strokeOpacity="0.5" fill="none" />
            <path d="M0,20 Q-14,8 -22,4" stroke="#0369a1" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
            <path d="M0,7 Q14,-4 22,-8" stroke="#0369a1" strokeWidth="0.75" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Leaf 6 - Bottom Right */}
          <g transform="translate(1360, 760) rotate(-18) scale(1.1)">
            <path
              d="M0,45 C-28,30 -30,-15 0,-45 C30,-15 28,30 0,45 Z"
              fill="url(#leafGrad3)"
            />
            <path d="M0,40 Q0,0 0,-38" stroke="#2563eb" strokeWidth="0.9" strokeOpacity="0.4" fill="none" />
          </g>

          {/* Leaf 7 - Mid Left Petite */}
          <g transform="translate(70, 540) rotate(-65) scale(0.8)">
            <path
              d="M0,38 C-22,24 -24,-12 0,-38 C24,-12 22,24 0,38 Z"
              fill="url(#leafGrad1)"
            />
          </g>

          {/* Leaf 8 - Upper Mid */}
          <g transform="translate(860, 160) rotate(32) scale(0.95)">
            <path
              d="M0,42 C-26,28 -28,-14 0,-42 C28,-14 26,28 0,42 Z"
              fill="url(#leafGrad2)"
            />
            <path d="M0,38 Q0,0 0,-36" stroke="#0284c7" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
          </g>
        </svg>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-white/95 border-r border-slate-200 shadow-2xl flex flex-col justify-between h-full py-6 px-5 transition-transform duration-300 ease-in-out lg:static lg:h-screen lg:sticky lg:top-0 lg:z-0 lg:w-72 lg:bg-white/10 lg:backdrop-blur-md lg:border-r lg:border-white/20 lg:shadow-xs ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="flex flex-col gap-6 sm:gap-8 overflow-y-auto">
          {/* Brand Logo & Mobile Close Button */}
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Macenza Logo" className="w-9 h-9 object-contain drop-shadow-sm" />
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase">MACENZA ADMIN</span>
            </div>
            {/* Close button: closes drawer on mobile only */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Close side panel"
              aria-label="Close side panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'Dashboard', label: 'Dashboard', icon: "📊" },
              { id: 'Jobs', label: 'Jobs', icon: "💼" },
              { id: 'Applications', label: 'Applications', icon: "📋" },
              { id: 'Resume Manager', label: 'Resume Manager', icon: "🔍" },
              { id: 'Employees', label: 'Employee Management', icon: <Users className="w-5 h-5" /> },
              { id: 'Finance', label: 'Finance & Bills', icon: <Banknote className="w-5 h-5" /> },
              { id: 'Events', label: 'Events & Birthdays', icon: <PartyPopper className="w-5 h-5" /> },
              { id: 'Analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> }
            ].map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 group whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25 ring-1 ring-blue-500/30'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110 text-white' : 'text-cyan-600'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Sanity Studio Link */}
            <a
              href="https://macenza.sanity.studio/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 text-slate-700 hover:text-blue-700 hover:bg-white/80 group whitespace-nowrap mt-2 pt-3 border-t border-slate-200/60"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">📝</span>
              <span>Blog Editor</span>
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false);
              handleSignOut();
            }}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-xs"
          >
            <span>🚪</span> Sign Out Admin
          </button>

          {/* Info panel at bottom */}
          <div className="px-3.5 py-2 bg-white/70 border border-white/80 rounded-xl flex items-center justify-between text-slate-600 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Database</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-800">Sync Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar - Boxless Seamless Header */}
        <header className="h-16 sm:h-20 bg-transparent px-3 sm:px-6 lg:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Open / Close Side Panel Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-900/10 text-slate-800 transition-all active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
              title={isSidebarOpen ? "Close side panel" : "Open side panel"}
              aria-label={isSidebarOpen ? "Close side panel" : "Open side panel"}
            >
              <Menu className="w-5 h-5 text-slate-800" />
              <span className="hidden sm:inline text-xs font-bold text-slate-800">
                {isSidebarOpen ? 'Hide Menu' : 'Menu'}
              </span>
            </button>

            <h2 className="text-sm sm:text-lg lg:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="hidden md:inline">MACENZA CAREERS HUB</span>
              <span className="md:hidden">MACENZA</span>
              <span className="text-sky-500/60 font-normal">|</span>
              <span className="text-blue-700 italic text-xs sm:text-base lg:text-lg font-bold truncate">{activeTab}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <span className="hidden md:inline-flex text-xs sm:text-sm font-semibold text-slate-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Work Area - Transparent background to reveal blue canvas curves and leaves */}
        <div className="flex-1 p-3 sm:p-6 lg:p-10 bg-transparent overflow-y-auto overflow-x-hidden" data-lenis-prevent>
          {error && (
            <div className="bg-amber-500/10 border border-amber-400/40 p-4 rounded-2xl mb-8 flex items-center gap-3 text-amber-200 font-bold text-sm">
              <span className="w-3 h-3 bg-amber-400 rounded-full animate-ping"></span>
              {error} - Fallback mock-data environment activated for premium demonstration.
            </div>
          )}

          {/* Tab 1: Dashboard Overview */}
          {activeTab === 'Dashboard' && (
            <div className="flex flex-col gap-6 sm:gap-8 max-w-[1600px] mx-auto w-full pb-10">
              {/* Modern Executive KPI Metrics */}
              <DashboardKpiMetrics
                jobs={jobs}
                applications={applications}
                onSelectTab={handleTabSelect}
              />

              {/* Interactive Graph: Applied Candidates Growth & Stage Distribution */}
              <AppliedCandidatesChart
                applications={applications}
                onSelectCandidateTab={handleTabSelect}
              />

              {/* Deep Comparative Analysis: Job Posts vs. Applied Candidates */}
              <JobVsCandidateAnalysis
                jobs={jobs}
                applications={applications}
                onNavigateTab={handleTabSelect}
              />

              {/* Modern Recent Candidate Submissions & Command Actions */}
              <RecentActivityAndActions
                applications={applications}
                jobs={jobs}
                onNavigateTab={handleTabSelect}
                onSelectCandidate={(app) => {
                  setSelectedApp(app);
                  handleTabSelect('Resume Manager');
                }}
                onOpenCreateJob={() => {
                  setEditingJobId(null);
                  setJobForm(initialJobForm);
                  handleTabSelect('Jobs');
                }}
              />
            </div>
          )}

          {/* Tab 2: Job Posting CRUD Manager */}
          {activeTab === 'Jobs' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-stretch min-h-full xl:h-[calc(100vh-200px)] max-w-[1600px] mx-auto w-full">
              {/* Left Column: Form to create/edit jobs */}
              <div data-lenis-prevent className="xl:col-span-5 bg-white/60 backdrop-blur-md border border-white/60 p-5 sm:p-7 rounded-3xl shadow-sm flex flex-col gap-6 overflow-y-auto">
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {editingJobId ? 'Edit Job Posting' : 'Create New Job'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {editingJobId ? 'Modify role criteria and publishing status' : 'Publish open career positions to attract candidates'}
                  </p>
                </div>

                {jobFormSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {jobFormSuccess}
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Job Title</label>
                      <input
                        type="text"
                        name="title"
                        value={jobForm.title}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        required
                        placeholder="e.g. Frontend Engineer"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={jobForm.department}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        required
                        placeholder="e.g. Engineering"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Salary Range</label>
                      <input
                        type="text"
                        name="salary"
                        value={jobForm.salary}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        placeholder="e.g. $80k - $100k"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Employment Type</label>
                      <select
                        name="employmentType"
                        value={jobForm.employmentType}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={jobForm.location}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        required
                        placeholder="e.g. Remote / Hybrid"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Experience Required</label>
                      <input
                        type="text"
                        name="experience"
                        value={jobForm.experience}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        placeholder="e.g. 3+ Years"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Skills Required (Comma separated)</label>
                      <input
                        type="text"
                        name="skills"
                        value={jobForm.skills}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        placeholder="React, CSS, Node"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Number of Openings</label>
                      <input
                        type="number"
                        name="openings"
                        value={jobForm.openings}
                        onChange={handleJobFormChange}
                        min="1"
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Application Deadline</label>
                      <input
                        type="date"
                        name="deadline"
                        value={jobForm.deadline}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Status</label>
                      <select
                        name="status"
                        value={jobForm.status}
                        onChange={handleJobFormChange}
                        className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Job Description</label>
                    <textarea
                      name="description"
                      value={jobForm.description}
                      onChange={handleJobFormChange}
                      rows="3"
                      className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors resize-none placeholder:text-slate-400"
                      required
                      placeholder="Enter detailed job overview..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Responsibilities (Line separated)</label>
                    <textarea
                      name="requirements"
                      value={jobForm.requirements}
                      onChange={handleJobFormChange}
                      rows="3"
                      className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors resize-none placeholder:text-slate-400"
                      placeholder="e.g. Design sleek components&#10;Implement API routers"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Skills & Requirements</label>
                    <textarea
                      name="benefits"
                      value={jobForm.benefits}
                      onChange={handleJobFormChange}
                      rows="3"
                      className="bg-white/80 border border-slate-200 p-3 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm outline-none focus:border-cyan-500 focus:bg-white transition-colors resize-none placeholder:text-slate-400"
                      placeholder="e.g. Strong React understanding&#10;Good team collaboration"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    {editingJobId ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handlePostJob()}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                          Update Job
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingJobId(null);
                            setJobForm(initialJobForm);
                          }}
                          className="bg-white/80 hover:bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer shadow-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handlePostJob('Active')}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                          Post Job
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePostJob('Draft')}
                          className="bg-white/80 hover:bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer shadow-xs"
                        >
                          Save Draft
                        </button>
                      </div>
                    )}
                    {editingJobId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(editingJobId)}
                        className="w-full bg-rose-50 border border-rose-200 py-3 rounded-xl text-rose-700 hover:bg-rose-100 font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Job Posting
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: List of posted jobs */}
              <div data-lenis-prevent className="xl:col-span-7 bg-white/60 backdrop-blur-md border border-white/60 p-5 sm:p-7 rounded-3xl shadow-sm flex flex-col gap-6 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Active Postings List</h4>
                    <p className="text-xs text-slate-500 font-medium">Currently active career opportunities ({jobs.length})</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {jobs.map(job => (
                    <div
                      key={job._id}
                      className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        editingJobId === job._id
                          ? 'border border-cyan-500 bg-cyan-50/70 shadow-md ring-1 ring-cyan-400'
                          : 'bg-white/70 border border-slate-200/80 hover:bg-white/95 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h5 className="text-base font-bold text-slate-900">{job.title}</h5>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              job.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
                          {job.department} &bull; {job.location} &bull; {job.employmentType}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {job.skills && job.skills.split(',').map((skill, index) => (
                            <span key={index} className="text-[11px] bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md font-medium text-slate-700">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                          onClick={() => handleEditJobClick(job)}
                          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center p-8">
                      No job postings found. Create one using the form on the left.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Candidate Applications & Filters */}
          {activeTab === 'Applications' && (
            <div className="flex flex-col gap-5 sm:gap-6 max-w-[1600px] mx-auto w-full">
              {/* Filtering Suite */}
              <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col gap-4 sm:gap-5">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-cyan-600" />
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Candidate Search & Filters</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBlacklistModalOpen(true)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Manage blacklisted candidate emails"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Manage Blacklist ({blacklistedEmails.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setSearchName('');
                        setFilterLocation('');
                        setFilterPosition('');
                        setFilterExperience('');
                        setFilterType('');
                        setFilterDate('');
                        setFilterBlacklistOnly(false);
                      }}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-900 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-cyan-50/60"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4">
                  {/* Search by Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Candidate / Email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full bg-white/80 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                        placeholder="Search candidate name or email..."
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Filter by Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Location</label>
                    <input
                      type="text"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="bg-white/80 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                      placeholder="e.g. Remote"
                    />
                  </div>

                  {/* Filter by Position */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Position</label>
                    <select
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                      className="bg-white/80 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="">All Positions</option>
                      {[...new Set(jobs.map(j => j.title))].map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Experience */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Experience</label>
                    <input
                      type="text"
                      value={filterExperience}
                      onChange={(e) => setFilterExperience(e.target.value)}
                      className="bg-white/80 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 focus:bg-white transition-colors placeholder:text-slate-400"
                      placeholder="e.g. 4 Years"
                    />
                  </div>

                  {/* Filter by Employment Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-white/80 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="">All Types</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  {/* Filter by Application Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Applied Date</label>
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-white/80 border border-slate-200 px-3 py-2 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="">Any Time</option>
                      <option value="1">Last 24 Hours</option>
                      <option value="3">Last 3 Days</option>
                      <option value="7">Last Week</option>
                      <option value="30">Last Month</option>
                    </select>
                  </div>

                  {/* Filter by Blacklist Review Flag */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">Review Flag</label>
                    <button
                      type="button"
                      onClick={() => setFilterBlacklistOnly(!filterBlacklistOnly)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        filterBlacklistOnly
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{filterBlacklistOnly ? 'Blacklisted Only' : 'All Candidates'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Presentation: Table & Mobile View */}
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
                      Applications Submissions ({filteredApplications.length})
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Manage candidate records, evaluations, and bulk downloads</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={exportApplicationsToCSV}
                      disabled={filteredApplications.length === 0}
                      className="flex-1 sm:flex-none justify-center px-3.5 py-2 sm:px-4 bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-98 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                      title="Export all applications & direct resume links to CSV instantly"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadAllResumes}
                      disabled={downloadingResumes || filteredApplications.length === 0}
                      className="flex-1 sm:flex-none justify-center px-3.5 py-2 sm:px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-98 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Download ZIP package of all applicant resumes"
                    >
                      <Download className={`w-3.5 h-3.5 shrink-0 ${downloadingResumes ? 'animate-bounce' : ''}`} />
                      <span className="truncate">{downloadingResumes ? 'Packaging...' : 'Download (ZIP)'}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Card View (shown on screens < md) */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredApplications.map(app => {
                    const blacklisted = isCandidateBlacklisted(app.email);
                    return (
                    <div
                      key={app._id}
                      onClick={() => {
                        setCandidateDrawerApp(app);
                        setDrawerNotesText(app.notes || '');
                      }}
                      className={`p-4 transition-colors cursor-pointer flex flex-col gap-3 ${
                        blacklisted
                          ? 'bg-rose-50/80 hover:bg-rose-100/80 border-l-4 border-l-rose-500'
                          : 'hover:bg-slate-50/60 active:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 border ${
                            blacklisted
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          }`}>
                            {(app.candidateName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className={`text-sm font-bold truncate ${blacklisted ? 'text-rose-900 font-black' : 'text-slate-900'}`}>
                                {app.candidateName}
                              </h5>
                              {blacklisted && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white tracking-wider uppercase shrink-0">
                                  <ShieldAlert className="w-2.5 h-2.5" /> Blacklisted
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] truncate ${blacklisted ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>{app.email}</p>
                          </div>
                        </div>

                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          app.status === 'Selected' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                          app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {app.status || 'Applied'}
                        </span>
                      </div>

                      <div className={`rounded-xl p-2.5 border flex flex-col gap-1.5 text-xs ${
                        blacklisted
                          ? 'bg-rose-50/60 border-rose-200 text-rose-800'
                          : 'bg-slate-50/80 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-500 text-[11px]">Role:</span>
                          <span className="text-right truncate max-w-[200px] text-cyan-800 font-bold">
                            {app.jobId ? (typeof app.jobId === 'object' ? app.jobId.title : app.jobId) : 'General Placement'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Experience:</span>
                          <span>{app.experience || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Location:</span>
                          <span>{app.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500 text-[11px]">Applied:</span>
                          <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-slate-500">Tap candidate to view details</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCandidateDrawerApp(app);
                            setDrawerNotesText(app.notes || '');
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-cyan-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    );
                  })}

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-10 px-4 text-slate-400 italic text-xs">
                      No candidate applications match selected filters.
                    </div>
                  )}
                </div>

                {/* Desktop & Tablet Table View (shown on screens >= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                        <th className="px-6 py-3.5">Candidate</th>
                        <th className="px-5 py-3.5">Job Applied</th>
                        <th className="px-5 py-3.5">Experience</th>
                        <th className="px-5 py-3.5">Location</th>
                        <th className="px-5 py-3.5">Applied Date</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredApplications.map(app => {
                        const blacklisted = isCandidateBlacklisted(app.email);
                        return (
                        <tr
                          key={app._id}
                          className={`transition-colors font-medium ${
                            blacklisted
                              ? 'bg-rose-50/70 hover:bg-rose-100/70 border-l-4 border-l-rose-500'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                setCandidateDrawerApp(app);
                                setDrawerNotesText(app.notes || '');
                              }}
                              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
                            >
                              <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                                blacklisted
                                  ? 'bg-rose-100 text-rose-700 border-rose-300'
                                  : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              }`}>
                                {(app.candidateName || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-bold text-sm transition-colors ${
                                    blacklisted
                                      ? 'text-rose-900 font-black'
                                      : 'text-slate-900 group-hover:text-cyan-700'
                                  }`}>
                                    {app.candidateName}
                                  </span>
                                  {blacklisted && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white tracking-wider uppercase shrink-0">
                                      <ShieldAlert className="w-2.5 h-2.5" /> Blacklisted
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[11px] ${blacklisted ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>{app.email}</span>
                              </div>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-slate-800 font-semibold">
                            {app.jobId ? (typeof app.jobId === 'object' ? app.jobId.title : app.jobId) : 'General Placement'}
                          </td>
                          <td className="px-5 py-4 text-slate-600">{app.experience}</td>
                          <td className="px-5 py-4 text-slate-600">{app.location || 'Remote'}</td>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              app.status === 'Selected' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                              app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {app.status || 'Applied'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setCandidateDrawerApp(app);
                                setDrawerNotesText(app.notes || '');
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              View <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                      {filteredApplications.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-10 text-slate-400 italic">
                            No candidate applications match selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Resume Manager & Preview Panel */}
          {activeTab === 'Resume Manager' && (
            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch min-h-full max-w-[1600px] mx-auto w-full">
              {/* Candidates Side List / Pipeline */}
              <div
                data-lenis-prevent
                className={`xl:col-span-4 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col gap-3 sm:gap-4 ${
                  selectedApp ? 'hidden xl:flex' : 'flex'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-600" /> Active Pipeline ({applications.length})
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">Select candidate</span>
                </div>
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[420px] xl:max-h-[calc(100vh-280px)]">
                  {applications.map(app => {
                    const blacklisted = isCandidateBlacklisted(app.email);
                    const isSelected = selectedApp && selectedApp._id === app._id;
                    return (
                    <div
                      key={app._id}
                      onClick={() => {
                        setSelectedApp(app);
                        setNotesText(app.notes || '');
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? blacklisted
                            ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-400'
                            : 'bg-cyan-50/80 border-cyan-500 shadow-sm ring-1 ring-cyan-500'
                          : blacklisted
                            ? 'bg-rose-50/70 border-rose-300/80 hover:bg-rose-100/70 border-l-4 border-l-rose-500'
                            : 'bg-white/70 border-slate-200/80 hover:border-slate-300 hover:bg-white/95'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className={`font-bold text-sm truncate ${blacklisted ? 'text-rose-900 font-black' : 'text-slate-900'}`}>{app.candidateName}</h5>
                            {blacklisted && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-600 text-white tracking-wider uppercase shrink-0">
                                <ShieldAlert className="w-2.5 h-2.5" /> Blacklisted
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] truncate ${blacklisted ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>{app.email}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          app.status === 'Selected' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                          app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {app.status || 'Applied'}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold mb-2 truncate ${blacklisted ? 'text-rose-700 font-bold' : 'text-cyan-800 font-bold'}`}>
                        {app.jobId ? (typeof app.jobId === 'object' ? app.jobId.title : app.jobId) : 'General Placement'}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                        <span>{app.experience || 'Exp not specified'}</span>
                        <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    );
                  })}
                  {applications.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center p-8">
                      No applications recorded.
                    </p>
                  )}
                </div>
              </div>

              {/* Recruitment Review Panel & Resume Viewer */}
              <div
                data-lenis-prevent
                className={`xl:col-span-8 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5 sm:gap-6 overflow-y-auto ${
                  !selectedApp ? 'hidden xl:flex' : 'flex'
                }`}
              >
                {selectedApp ? (
                  <div className="flex flex-col gap-5 sm:gap-6 w-full">
                    {/* Mobile Back to Pipeline button */}
                    <div className="xl:hidden flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        &larr; Back to Pipeline
                      </button>
                      <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[180px]">
                        {selectedApp.candidateName}
                      </span>
                    </div>

                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 pb-4 sm:pb-5">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                          <h3 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{selectedApp.candidateName}</h3>
                          <span className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            selectedApp.status === 'Selected' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                            selectedApp.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            selectedApp.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            selectedApp.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {selectedApp.status || 'Applied'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-600">
                          Applied for: <span className="text-cyan-800 font-bold">{selectedApp.jobId ? (typeof selectedApp.jobId === 'object' ? selectedApp.jobId.title : selectedApp.jobId) : 'General Placement'}</span> &bull; {selectedApp.experience || 'N/A'}
                        </p>
                      </div>

                      {/* Download / Social Links */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {isCandidateBlacklisted(selectedApp.email) ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveBlacklistEmail(selectedApp.email)}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Remove candidate from blacklist"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Remove Blacklist</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddBlacklistEmail(selectedApp.email, 'Flagged from review panel')}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/80 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Add candidate email to blacklist"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-500" />
                            <span>Blacklist Candidate</span>
                          </button>
                        )}
                        {selectedApp.linkedInUrl && (
                          <a
                            href={selectedApp.linkedInUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 sm:p-2.5 bg-white/80 border border-slate-200 hover:bg-white rounded-xl text-slate-700 transition-colors shadow-xs"
                            title="LinkedIn Profile"
                          >
                            <Users className="w-4 h-4" />
                          </a>
                        )}
                        {selectedApp.portfolioUrl && (
                          <a
                            href={selectedApp.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 sm:p-2.5 bg-white/80 border border-slate-200 hover:bg-white rounded-xl text-slate-700 transition-colors shadow-xs"
                            title="Portfolio Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <a
                          href={selectedApp.resume}
                          onClick={(e) => handleDownloadResume(e, selectedApp.resume, selectedApp.candidateName)}
                          className="flex-1 md:flex-none justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs tracking-wide inline-flex items-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                          <Download className="w-4 h-4 shrink-0" /> <span className="truncate">Download Resume</span>
                        </a>
                      </div>
                    </div>

                    {/* Blacklist Alert Banner if Flagged */}
                    {isCandidateBlacklisted(selectedApp.email) && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                          <ShieldAlert className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-rose-900 flex items-center gap-1.5">
                              Internal Review Flag: Blacklisted Candidate
                            </h4>
                            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded-md">
                              Internal Review Only (Not Auto-Rejected)
                            </span>
                          </div>
                          <p className="text-xs text-rose-800 font-medium mt-1">
                            This candidate’s email (<span className="font-bold underline">{selectedApp.email}</span>) matches the internal blacklist registry. They were permitted to submit an application, but are displayed in red for reviewer discretion.
                          </p>
                          {getBlacklistEntry(selectedApp.email)?.reason && (
                            <p className="text-xs text-rose-900 font-semibold mt-1 bg-white/80 p-2 rounded-lg border border-rose-200 inline-block">
                              Reason: {getBlacklistEntry(selectedApp.email).reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content Split: Details/Notes & Embed Resume Viewer */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 flex-1 items-stretch">
                      {/* Details, Cover Letter, Recruiter Notes */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3">
                          <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200/80 pb-2">Profile Overview</h5>
                          <div className="flex flex-col gap-2 text-xs font-semibold">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 shrink-0">Email:</span>
                              <a href={`mailto:${selectedApp.email}`} className="text-cyan-700 select-all truncate hover:underline">{selectedApp.email || 'N/A'}</a>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 shrink-0">Phone:</span>
                              <a href={`tel:${selectedApp.phone}`} className="text-slate-700 hover:text-cyan-700 truncate">{selectedApp.phone || 'N/A'}</a>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 shrink-0">Location:</span>
                              <span className="text-slate-700 truncate">{selectedApp.location || 'Remote'}</span>
                            </div>
                          </div>
                        </div>

                        {selectedApp.coverLetter && (
                          <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                            <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200/80 pb-1.5">Cover Letter</h5>
                            <p className="text-xs text-slate-700 leading-relaxed italic break-words">"{selectedApp.coverLetter}"</p>
                          </div>
                        )}

                        {/* Recruiter Notes Block */}
                        <div className="bg-white/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 flex-1">
                          <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200/80 pb-1.5">Recruiter Evaluation Notes</h5>
                          <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            rows="3"
                            className="bg-white border border-slate-200 p-2.5 sm:p-3 rounded-xl text-slate-900 font-semibold text-xs outline-none focus:border-cyan-500 resize-none flex-1 placeholder:text-slate-400"
                            placeholder="Add evaluation summary or interview feedback..."
                          />
                          <button
                            onClick={handleSaveNotes}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-2 px-3 rounded-xl font-bold text-xs tracking-wide inline-flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Evaluation Notes
                          </button>
                        </div>
                      </div>

                      {/* Interactive PDF/Document Resume Preview */}
                      <div className="lg:col-span-7 rounded-2xl overflow-hidden flex flex-col items-stretch border border-slate-200 relative min-h-[300px] sm:min-h-[420px] bg-slate-900 shadow-sm">
                        <div className="border-b border-slate-700 px-3.5 py-2 sm:px-4 sm:py-2.5 flex justify-between items-center bg-slate-800/80 text-slate-200">
                          <span className="text-xs font-bold uppercase tracking-wider">Interactive Resume Viewer</span>
                          {selectedApp.resume && (
                            <a
                              href={selectedAppResumeSignedUrl || selectedApp.resume}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded font-extrabold uppercase hover:underline inline-flex items-center gap-1"
                            >
                              Live Preview <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex-1 w-full relative min-h-[280px] sm:min-h-[380px]">
                          {selectedApp.resume && selectedApp.resume.toLowerCase().endsWith('.pdf') ? (
                            selectedAppResumeSignedUrl ? (
                              <iframe
                                src={`${selectedAppResumeSignedUrl}#toolbar=0`}
                                className="w-full h-full border-none absolute inset-0 bg-white"
                                title="Resume Preview PDF"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-bold text-slate-400">
                                <span className="animate-pulse">Loading preview...</span>
                              </div>
                            )
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-500/15 rounded-2xl flex items-center justify-center text-cyan-300 mb-3 border border-cyan-400/30">
                                <FileSearch className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <h6 className="font-extrabold text-white text-sm sm:text-base mb-1">Resume Preview Unavailable</h6>
                              <p className="text-xs text-slate-300 max-w-[240px] mb-4">
                                Document file is safely secured. You can download or view it directly.
                              </p>
                              <a
                                href={selectedApp.resume}
                                onClick={(e) => handleDownloadResume(e, selectedApp.resume, selectedApp.candidateName)}
                                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-xs tracking-wide inline-flex items-center gap-2 transition-all active:scale-98 cursor-pointer shadow-md"
                              >
                                <Download className="w-4 h-4" /> Download Resume
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Candidate Management Action Footer */}
                    <div className="border-t border-slate-200/80 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700">Update Recruitment Stage:</span>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleUpdateApplicationStatus('Shortlisted')}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-emerald-700 font-bold text-xs tracking-wide transition-colors text-center cursor-pointer truncate shadow-xs"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleUpdateApplicationStatus('Interview Scheduled')}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-xl text-purple-700 font-bold text-xs tracking-wide transition-colors text-center cursor-pointer truncate shadow-xs"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleUpdateApplicationStatus('Selected')}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl text-teal-700 font-bold text-xs tracking-wide transition-colors text-center cursor-pointer truncate shadow-xs"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleUpdateApplicationStatus('Rejected')}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl text-rose-700 font-bold text-xs tracking-wide transition-colors text-center cursor-pointer truncate shadow-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <FileSearch className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-slate-700 text-sm font-semibold italic">No candidate selected for review.</p>
                    <p className="text-slate-500 text-xs mt-1">Select any applicant from the pipeline to preview their resume and evaluation notes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Finance */}
          {activeTab === 'Finance' && (
            <div className="flex flex-col gap-6 lg:gap-8 min-h-full lg:h-[calc(100vh-200px)]">
              {/* Add Bill Modal */}
              {isAddingBill && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingBill(false)}>
                  <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl sm:rounded-[2rem] w-full max-w-xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">Upload New Bill</h3>
                      <button onClick={() => setIsAddingBill(false)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddBill} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Bill Number</label>
                        <input type="text" required value={newBillForm.billNumber} onChange={e => setNewBillForm({ ...newBillForm, billNumber: e.target.value })} className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-900 font-semibold text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-slate-400" placeholder="e.g. INV-2026-001" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Description / Title</label>
                        <input type="text" required value={newBillForm.description} onChange={e => setNewBillForm({ ...newBillForm, description: e.target.value })} className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-900 font-semibold text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-slate-400" placeholder="e.g. Server Hosting" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Amount ($)</label>
                        <input type="number" step="0.01" required value={newBillForm.amount} onChange={e => setNewBillForm({ ...newBillForm, amount: e.target.value })} className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-900 font-semibold text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-slate-400" placeholder="0.00" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Date of Bill</label>
                        <input type="date" required value={newBillForm.date} onChange={e => setNewBillForm({ ...newBillForm, date: e.target.value })} className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-900 font-semibold text-sm outline-none focus:border-cyan-500 transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Upload PDF</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-cyan-500 transition-colors cursor-pointer bg-slate-50/70">
                          {newBillForm.pdfDataUri ? (
                            <div className="text-emerald-700 font-bold flex items-center gap-2">
                              <Check className="w-5 h-5 text-emerald-600" /> PDF Attached Successfully
                            </div>
                          ) : (
                            <div className="text-slate-600 font-semibold flex flex-col items-center gap-2">
                              <Upload className="w-6 h-6 text-cyan-600" />
                              <span>Click to browse or drag PDF here</span>
                            </div>
                          )}
                          <input type="file" accept=".pdf" onChange={handleBillFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                      </div>
                      <button type="submit" className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 w-full py-4 rounded-2xl font-black text-sm transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer">
                        Save Bill
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div data-lenis-prevent className="flex-1 w-full bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-3">
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-cyan-600" /> Finance & Bills ({bills.length})
                  </h4>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button type="button" onClick={() => setIsAddingBill(true)} className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-md text-center cursor-pointer">
                      + Upload New Bill
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-200/80 sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md">
                      <tr>
                        <th className="p-4 font-black text-xs text-slate-600 uppercase whitespace-nowrap">Bill #</th>
                        <th className="p-4 font-black text-xs text-slate-600 uppercase whitespace-nowrap">Date</th>
                        <th className="p-4 font-black text-xs text-slate-600 uppercase whitespace-nowrap">Description</th>
                        <th className="p-4 font-black text-xs text-slate-600 uppercase whitespace-nowrap">Amount</th>
                        <th className="p-4 font-black text-xs text-slate-600 uppercase whitespace-nowrap text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bills.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400 italic">
                            No bills uploaded yet.
                          </td>
                        </tr>
                      ) : (
                        bills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4 text-sm font-bold text-cyan-800 whitespace-nowrap">{bill.billNumber}</td>
                            <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{bill.date || '-'}</td>
                            <td className="p-4 text-sm font-bold text-slate-900">{bill.description}</td>
                            <td className="p-4 text-sm font-black text-emerald-700 whitespace-nowrap">${parseFloat(bill.amount).toFixed(2)}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <a href={bill.pdfDataUri} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-cyan-700 flex items-center justify-center transition-colors shadow-xs" title="View PDF">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleDeleteBill(bill.id)} className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Events */}
          {activeTab === 'Events' && (
            <div className="flex flex-col gap-6 lg:gap-8 min-h-full lg:h-[calc(100vh-200px)]">
              {/* Add Event Photo Modal */}
              {isAddingEventPhoto && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingEventPhoto(false)}>
                  <div className="bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl sm:rounded-[2rem] w-full max-w-xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">Upload Event Photo</h3>
                      <button onClick={() => setIsAddingEventPhoto(false)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddEventPhoto} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Event Title</label>
                        <input type="text" required value={newEventPhotoForm.title} onChange={e => setNewEventPhotoForm({ ...newEventPhotoForm, title: e.target.value })} className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-900 font-semibold text-sm outline-none focus:border-cyan-500 transition-all placeholder:text-slate-400" placeholder="e.g. Annual Office Party 2026" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Event Date</label>
                        <input type="date" value={newEventPhotoForm.date} onChange={e => setNewEventPhotoForm({ ...newEventPhotoForm, date: e.target.value })} className="bg-white border border-slate-200 p-3.5 rounded-2xl text-slate-900 font-semibold text-sm outline-none focus:border-cyan-500 transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Upload Compressed Photo</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-cyan-500 transition-colors cursor-pointer bg-slate-50/70">
                          {newEventPhotoForm.imageDataUri ? (
                            <img src={newEventPhotoForm.imageDataUri} alt="Preview" className="h-32 object-contain rounded-lg shadow-xs" />
                          ) : (
                            <div className="text-slate-600 font-semibold flex flex-col items-center gap-2">
                              <Camera className="w-6 h-6 text-cyan-600" />
                              <span>Click to browse or drag JPG/PNG here</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={handleEventPhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                      </div>
                      <button type="submit" className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 w-full py-4 rounded-2xl font-black text-sm transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer">
                        Save Photo
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="w-full h-full">
                {/* Birthdays */}
                <div data-lenis-prevent className="w-full bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5 overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
                    <div className="w-10 h-10 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-center">
                      <PartyPopper className="w-5 h-5 text-cyan-700" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900">Upcoming Birthdays</h4>
                      <p className="text-[11px] font-semibold text-slate-500">Celebrations in your team</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto flex flex-col gap-3 pr-2">
                    {getUpcomingBirthdays().length === 0 ? (
                      <div className="text-center text-slate-400 italic p-6">
                        No birthdays found. Add DOB to employees.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {getUpcomingBirthdays().map((emp) => (
                          <div key={emp.id} className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white/95 transition-all flex items-center justify-between gap-3.5 shadow-xs">
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <div className="w-12 h-12 bg-cyan-50/80 rounded-2xl flex flex-col items-center justify-center text-cyan-800 shrink-0 border border-cyan-200">
                                <span className="text-[10px] font-bold uppercase leading-none text-cyan-700">{emp.nextBirthday.toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-lg font-black leading-none mt-1 text-cyan-900">{emp.nextBirthday.getDate()}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
                                  {emp.name}
                                </div>
                                <div className="text-xs text-slate-500 font-medium break-words mt-0.5">
                                  {emp.department || emp.role || 'Team Member'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {emp.daysUntil === 0 ? (
                                <span className="text-[11px] font-black text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-1.5 rounded-full animate-pulse tracking-wide inline-block">
                                  TODAY! 🎉
                                </span>
                              ) : emp.daysUntil === 1 ? (
                                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1.5 rounded-full inline-block">
                                  Tomorrow
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl inline-block">
                                  In {emp.daysUntil} days
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Employees Management */}
          {activeTab === 'Employees' && (
            <>
              {/* Add Employee Modal */}
              {isAddingEmployee && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddingEmployee(false)}>
                  <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-7 md:p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-5 sm:mb-6 border-b border-slate-100 pb-3 sm:pb-4">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-lg sm:text-2xl font-black text-black tracking-tight truncate">Add Employee</h3>
                        <p className="text-[11px] sm:text-xs font-semibold text-black/45 uppercase tracking-wide mt-0.5">Create a new company record</p>
                      </div>
                      <button onClick={() => setIsAddingEmployee(false)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-black/50 hover:text-black transition-colors shrink-0 cursor-pointer">
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
                      <div className="col-span-full flex flex-col gap-1.5 items-center mb-1">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Profile Picture</label>
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#BFDBFE] flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary transition-colors bg-white">
                          {newEmployeeForm.profile_picture ? (
                            <img src={newEmployeeForm.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-primary flex flex-col items-center">
                              <span className="text-2xl">+</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleProfilePictureUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Registration No.</label>
                        <input type="text" value={newEmployeeForm.registration_no} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, registration_no: e.target.value })} placeholder="e.g. EMP-003" className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Full Name</label>
                        <input type="text" required value={newEmployeeForm.name} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, name: e.target.value })} placeholder="e.g. John Doe" className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Father's Name</label>
                        <input type="text" value={newEmployeeForm.father_name} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, father_name: e.target.value })} placeholder="e.g. Richard Doe" className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Date of Birth</label>
                        <input type="date" value={newEmployeeForm.dob} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, dob: e.target.value })} className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Email ID</label>
                        <input type="email" value={newEmployeeForm.email} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })} placeholder="e.g. john@macenza.com" className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Contact Number</label>
                        <input type="text" value={newEmployeeForm.contact_number} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, contact_number: e.target.value })} placeholder="e.g. +1 555 0103" className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      {/* Role / Designation Dropdown with Custom Add */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Role / Designation</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsManagingRoles(true)}
                              className="text-[10px] font-bold text-slate-500 hover:text-primary hover:underline flex items-center gap-1 cursor-pointer"
                              title="Edit or Delete Roles"
                            >
                              <Edit3 className="w-2.5 h-2.5" /> Manage
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingNewRole(!isAddingNewRole);
                                setNewCustomRole('');
                              }}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> {isAddingNewRole ? 'Select existing' : '+ Add'}
                            </button>
                          </div>
                        </div>
                        {isAddingNewRole ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              autoFocus
                              value={newCustomRole}
                              onChange={(e) => setNewCustomRole(e.target.value)}
                              placeholder="Enter custom role title..."
                              className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newCustomRole.trim()) {
                                    handleAddNewRole(newCustomRole, (val) => setNewEmployeeForm(prev => ({ ...prev, role: val })));
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newCustomRole.trim()) {
                                  handleAddNewRole(newCustomRole, (val) => setNewEmployeeForm(prev => ({ ...prev, role: val })));
                                }
                              }}
                              className="bg-primary text-white text-xs font-bold px-3 py-2.5 sm:py-3.5 rounded-xl hover:bg-primary-dark transition-all cursor-pointer whitespace-nowrap"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <select
                            value={newEmployeeForm.role || ''}
                            onChange={(e) => {
                              if (e.target.value === '__add_new__') {
                                setIsAddingNewRole(true);
                                setNewCustomRole('');
                              } else {
                                setNewEmployeeForm({ ...newEmployeeForm, role: e.target.value });
                              }
                            }}
                            className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all cursor-pointer"
                          >
                            <option value="">-- Select Role / Designation --</option>
                            {availableRoles.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                            {newEmployeeForm.role && !availableRoles.includes(newEmployeeForm.role) && (
                              <option value={newEmployeeForm.role}>{newEmployeeForm.role}</option>
                            )}
                            <option value="__add_new__" className="text-primary font-bold">+ Add New Role...</option>
                          </select>
                        )}
                      </div>

                      {/* Department Dropdown with Custom Add */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Department</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsManagingDepts(true)}
                              className="text-[10px] font-bold text-slate-500 hover:text-primary hover:underline flex items-center gap-1 cursor-pointer"
                              title="Edit or Delete Departments"
                            >
                              <Edit3 className="w-2.5 h-2.5" /> Manage
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingNewDept(!isAddingNewDept);
                                setNewCustomDept('');
                              }}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> {isAddingNewDept ? 'Select existing' : '+ Add'}
                            </button>
                          </div>
                        </div>
                        {isAddingNewDept ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              autoFocus
                              value={newCustomDept}
                              onChange={(e) => setNewCustomDept(e.target.value)}
                              placeholder="Enter custom department..."
                              className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newCustomDept.trim()) {
                                    handleAddNewDept(newCustomDept, (val) => setNewEmployeeForm(prev => ({ ...prev, department: val })));
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newCustomDept.trim()) {
                                  handleAddNewDept(newCustomDept, (val) => setNewEmployeeForm(prev => ({ ...prev, department: val })));
                                }
                              }}
                              className="bg-primary text-white text-xs font-bold px-3 py-2.5 sm:py-3.5 rounded-xl hover:bg-primary-dark transition-all cursor-pointer whitespace-nowrap"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <select
                            value={newEmployeeForm.department || ''}
                            onChange={(e) => {
                              if (e.target.value === '__add_new__') {
                                setIsAddingNewDept(true);
                                setNewCustomDept('');
                              } else {
                                setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value });
                              }
                            }}
                            className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all cursor-pointer"
                          >
                            <option value="">-- Select Department --</option>
                            {availableDepartments.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                            {newEmployeeForm.department && !availableDepartments.includes(newEmployeeForm.department) && (
                              <option value={newEmployeeForm.department}>{newEmployeeForm.department}</option>
                            )}
                            <option value="__add_new__" className="text-primary font-bold">+ Add New Department...</option>
                          </select>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Start Date</label>
                        <input type="date" value={newEmployeeForm.start_date} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, start_date: e.target.value })} className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">End Date (Optional)</label>
                        <input type="date" value={newEmployeeForm.end_date || ''} onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, end_date: e.target.value })} className="bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      {newEmployeeForm.start_date && (
                        <div className="md:col-span-2 bg-primary/10 border border-primary/20 rounded-xl p-2.5 sm:p-3 text-xs font-semibold text-primary flex items-center justify-between">
                          <span>Total Working Days ({newEmployeeForm.end_date ? 'Completed Period' : 'Till Today'}):</span>
                          <span className="font-black text-sm">{calculateWorkingDays(newEmployeeForm.start_date, newEmployeeForm.end_date)} days</span>
                        </div>
                      )}
                      <button type="submit" className="md:col-span-2 w-full py-3.5 sm:py-4 mt-2 bg-primary text-white rounded-xl sm:rounded-full font-black text-xs tracking-wider uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                        Create Employee Profile
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 sm:gap-8">
                {/* Main Box: Employees List */}
                <div className="w-full bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-sm overflow-hidden flex flex-col gap-5">
                  <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <h4 className="text-base sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-600" /> Employees ({employees.length})
                    </h4>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      {selectedRows.length > 0 && (
                        <button type="button" onClick={handleDeleteSelected} className="flex-1 sm:flex-none justify-center bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> <span className="truncate">Delete ({selectedRows.length})</span>
                        </button>
                      )}
                      <button type="button" onClick={exportEmployeesToCSV} className="flex-1 sm:flex-none justify-center bg-white/80 hover:bg-white text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                        <Download className="w-3.5 h-3.5 inline mr-1 text-cyan-700" /> <span className="truncate">Export CSV</span>
                      </button>
                      <button type="button" onClick={() => setIsAddingEmployee(true)} className="flex-1 sm:flex-none justify-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer truncate">
                        + Add Employee
                      </button>
                    </div>
                  </div>

                  {/* Mobile Cards View for Small Screens (< md) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setEditEmployeeForm(emp);
                          loadEmployeeCertificates(emp.id);
                        }}
                        className={`p-4 transition-colors cursor-pointer flex flex-col gap-3 rounded-2xl ${
                          selectedRows.includes(emp.id) ? 'bg-cyan-50/80 border border-cyan-300' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(emp.id)}
                              onChange={(e) => toggleRowSelection(e, emp.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer shrink-0"
                            />
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {getProfilePicture(emp.name, emp.profile_picture) ? (
                                <img src={getProfilePicture(emp.name, emp.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-sm font-bold text-slate-900 truncate">{emp.name || 'Unnamed Employee'}</h5>
                              <p className="text-[11px] font-semibold text-cyan-700 truncate">{emp.registration_no || 'No Reg ID'}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(emp.id, emp.name);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors shrink-0"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col gap-1.5 text-xs text-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Role & Dept:</span>
                            <span className="font-semibold text-slate-900 truncate max-w-[180px]">{emp.role || '-'} {emp.department ? `(${emp.department})` : ''}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Working Days:</span>
                            <span className="font-black text-cyan-900 bg-cyan-100/80 border border-cyan-200 px-2 py-0.5 rounded text-[11px]">
                              {calculateWorkingDays(emp.start_date, emp.end_date) !== null
                                ? `${calculateWorkingDays(emp.start_date, emp.end_date)} days (${emp.end_date ? 'Completed' : 'Active'})`
                                : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Duration:</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                              {emp.start_date || '-'} {emp.end_date ? `to ${emp.end_date}` : '(Present)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Email:</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[180px]">{emp.email || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Contact:</span>
                            <span className="font-semibold text-slate-800">{emp.contact_number || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Date of Birth:</span>
                            <span className="font-semibold text-slate-800">{emp.dob || '-'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[11px] font-semibold text-slate-500">Tap to view full details</span>
                          <span className="text-xs font-bold text-cyan-700 flex items-center gap-1">
                            Details <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}

                    {employees.length === 0 && (
                      <div className="p-8 text-center text-slate-400 italic text-xs">
                        No employee records found.
                      </div>
                    )}
                  </div>

                  {/* Desktop & Tablet Table (>= md) */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar relative">
                    <table className="w-full text-left border-collapse min-w-[1500px]">
                      <thead className="border-b border-slate-200/80 sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md">
                        <tr className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                          <th className="px-8 py-4 whitespace-nowrap">
                            <input type="checkbox" checked={employees.length > 0 && selectedRows.length === employees.length} onChange={toggleAllRows} className="w-4 h-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer" />
                          </th>
                          <th className="px-6 py-4 whitespace-nowrap">#</th>
                          <th className="px-6 py-4 whitespace-nowrap">Pic</th>
                          <th className="px-6 py-4 whitespace-nowrap">Registration No.</th>
                          <th className="px-6 py-4 whitespace-nowrap">Full Name</th>
                          <th className="px-6 py-4 whitespace-nowrap">Father's Name</th>
                          <th className="px-6 py-4 whitespace-nowrap">Date of Birth</th>
                          <th className="px-6 py-4 whitespace-nowrap">Address (Permanent & Current)</th>
                          <th className="px-6 py-4 whitespace-nowrap">Email ID</th>
                          <th className="px-6 py-4 whitespace-nowrap">Contact Number</th>
                          <th className="px-6 py-4 whitespace-nowrap">Aadhaar No.</th>
                          <th className="px-6 py-4 whitespace-nowrap">Alternative Phone No.</th>
                          <th className="px-6 py-4 whitespace-nowrap">Start Date</th>
                          <th className="px-6 py-4 whitespace-nowrap">End Date</th>
                          <th className="px-6 py-4 whitespace-nowrap">Working Days</th>
                          <th className="px-6 py-4 whitespace-nowrap">Account No.</th>
                          <th className="px-6 py-4 whitespace-nowrap">IFSC Code</th>
                          <th className="px-8 py-4 whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employees.map((emp, index) => (
                          <tr
                            key={emp.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setEditEmployeeForm(emp);
                              loadEmployeeCertificates(emp.id);
                            }}
                            className={`hover:bg-slate-50/60 cursor-pointer transition-colors text-sm font-semibold ${draggedIndex === index ? 'opacity-40 bg-slate-100' : selectedRows.includes(emp.id) ? 'bg-cyan-50/60' : ''}`}
                          >
                            <td className="px-8 py-5 text-sm font-black text-slate-400 whitespace-nowrap">
                              <input type="checkbox" checked={selectedRows.includes(emp.id)} onChange={(e) => toggleRowSelection(e, emp.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 cursor-pointer" />
                            </td>
                            <td className="px-6 py-5 text-sm font-black text-slate-400 whitespace-nowrap">{index + 1}</td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                {getProfilePicture(emp.name, emp.profile_picture) ? (
                                  <img src={getProfilePicture(emp.name, emp.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-cyan-800 whitespace-nowrap">{emp.registration_no || '-'}</td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-900 whitespace-nowrap">{emp.name || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.father_name || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.dob || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 max-w-[250px] truncate" title={`Perm: ${emp.permanent_address || 'N/A'} | Curr: ${emp.current_address || 'N/A'}`}>
                              {emp.permanent_address || 'Not Provided'}
                            </td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.email || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.contact_number || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.aadhaar_no || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.alt_phone || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.start_date || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.end_date || 'Present'}</td>
                            <td className="px-6 py-5 text-sm whitespace-nowrap">
                              {calculateWorkingDays(emp.start_date, emp.end_date) !== null ? (
                                <span className="font-bold text-cyan-900 bg-cyan-100/80 px-2 py-1 rounded-md text-xs border border-cyan-300/80">
                                  {calculateWorkingDays(emp.start_date, emp.end_date)} days
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.account_no || '-'}</td>
                            <td className="px-6 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">{emp.ifsc_detail || '-'}</td>
                            <td className="px-8 py-5 text-sm font-semibold text-slate-600 whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEmployee(emp.id, emp.name);
                                }}
                                className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors cursor-pointer shadow-xs"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {employees.length === 0 && (
                          <tr>
                            <td colSpan="18" className="p-8 text-center text-slate-400 italic">
                              No employee records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab 5: Analytics - Futuristic AI Talent Intelligence Center */}
          {activeTab === 'Analytics' && (
            <FuturisticAnalytics
              jobs={jobs}
              applications={applications}
              onNavigateTab={handleTabSelect}
            />
          )}

          {/* Employee Details Modal */}
          {selectedEmployee && !isEditingEmployee && (
            <div
              onClick={() => setSelectedEmployee(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4 cursor-pointer"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
                className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 md:p-8 max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative cursor-default"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-[#BFDBFE] hover:bg-[#DBEAFE] rounded-full flex items-center justify-center text-black font-black transition-colors cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg sm:text-2xl font-black text-black mb-3 sm:mb-6 pr-10">Employee Details</h3>

                {/* Profile Header */}
                <div className="bg-white border border-[#BFDBFE] rounded-2xl sm:rounded-[2rem] p-3.5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-lg sm:text-2xl shadow-md shrink-0">
                      {selectedEmployee.name ? selectedEmployee.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base sm:text-2xl font-black text-black truncate">{selectedEmployee.name}</h4>
                      <p className="text-xs sm:text-sm font-semibold text-black/55 truncate">{selectedEmployee.role || 'Team Member'} in {selectedEmployee.department || 'Macenza'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditEmployeeForm(selectedEmployee);
                      setIsEditingEmployee(true);
                    }}
                    className="w-full sm:w-auto justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-[#BFDBFE] hover:bg-[#EFF6FF] rounded-xl text-black font-bold text-xs tracking-wider uppercase inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-primary" /> Edit Profile
                  </button>
                </div>

                {/* Information Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Personal Details */}
                  <div className="bg-white border border-[#BFDBFE] p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col gap-2.5 sm:gap-3">
                    <h5 className="font-black text-black text-xs uppercase tracking-wider border-b border-[#BFDBFE] pb-2 mb-1">Personal Details</h5>

                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-black/50">Registration No.</span>
                      <span className="text-black font-bold">{selectedEmployee.registration_no || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-black/50">Father's Name</span>
                      <span className="text-black font-bold">{selectedEmployee.father_name || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-black/50">Date of Birth</span>
                      <span className="text-black font-bold">{selectedEmployee.dob || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1">
                      <span className="text-black/50">Aadhaar No.</span>
                      <span className="text-black font-bold">{selectedEmployee.aadhaar_no || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1 gap-2">
                      <span className="text-black/50 shrink-0">Email ID</span>
                      <a href={`mailto:${selectedEmployee.email}`} className="text-black font-bold truncate hover:text-primary">{selectedEmployee.email || '-'}</a>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1 gap-2">
                      <span className="text-black/50 shrink-0">Contact No.</span>
                      <a href={`tel:${selectedEmployee.contact_number}`} className="text-black font-bold hover:text-primary truncate">{selectedEmployee.contact_number || '-'}</a>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-1 gap-2">
                      <span className="text-black/50 shrink-0">Alt Phone No.</span>
                      <span className="text-black font-bold truncate">{selectedEmployee.alt_phone || '-'}</span>
                    </div>

                    <div className="text-xs font-semibold mt-2 pt-2 border-t border-[#BFDBFE]/60">
                      <span className="text-black/50 uppercase text-[9px] tracking-wider block mb-1">Permanent Address:</span>
                      <span className="text-black font-bold block leading-relaxed break-words">{selectedEmployee.permanent_address || 'Not Provided'}</span>
                    </div>
                    <div className="text-xs font-semibold mt-1">
                      <span className="text-black/50 uppercase text-[9px] tracking-wider block mb-1">Current Address:</span>
                      <span className="text-black font-bold block leading-relaxed break-words">{selectedEmployee.current_address || 'Not Provided'}</span>
                    </div>
                  </div>

                  {/* Right Column Panels */}
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {/* Professional Details */}
                    <div className="bg-white border border-[#BFDBFE] p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col gap-2.5 sm:gap-3">
                      <h5 className="font-black text-black text-xs uppercase tracking-wider border-b border-[#BFDBFE] pb-2 mb-1">Professional Details</h5>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">Role / Designation</span>
                        <span className="text-black font-bold">{selectedEmployee.role || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">Department</span>
                        <span className="text-black font-bold">{selectedEmployee.department || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">Start Date</span>
                        <span className="text-black font-bold">{selectedEmployee.start_date || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">End Date</span>
                        <span className="text-black font-bold">{selectedEmployee.end_date || 'Ongoing (Present)'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">Total Working Days</span>
                        <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded-md">
                          {calculateWorkingDays(selectedEmployee.start_date, selectedEmployee.end_date) !== null
                            ? `${calculateWorkingDays(selectedEmployee.start_date, selectedEmployee.end_date)} days`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">Base Salary</span>
                        <span className="text-black font-bold">{selectedEmployee.salary || '-'}</span>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white border border-[#BFDBFE] p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col gap-2.5 sm:gap-3">
                      <h5 className="font-black text-black text-xs uppercase tracking-wider border-b border-[#BFDBFE] pb-2 mb-1">Bank Details</h5>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">Account No.</span>
                        <span className="text-black font-bold">{selectedEmployee.account_no || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold py-1">
                        <span className="text-black/50">IFSC Detail</span>
                        <span className="text-black font-bold">{selectedEmployee.ifsc_detail || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Documents & Certifications */}
                <div className="bg-white border border-[#BFDBFE] p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col gap-3 sm:gap-4">
                  <h5 className="font-black text-black text-xs uppercase tracking-wider border-b border-[#BFDBFE] pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Employee Documents & Certifications
                  </h5>

                  <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
                    {/* General Documents */}
                    {selectedEmployee.documents && selectedEmployee.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE]/45 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-between gap-2.5 text-xs font-bold text-black group transition-all w-full sm:w-auto"
                      >
                        <a
                          href={doc.url}
                          onClick={(e) => handleDownloadResume(e, doc.url, `${selectedEmployee.name}_${doc.name}`)}
                          className="flex items-center gap-2 hover:underline truncate min-w-0"
                        >
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </a>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={doc.url}
                            onClick={(e) => handleDownloadResume(e, doc.url, `${selectedEmployee.name}_${doc.name}`)}
                            className="p-1 hover:bg-[#DBEAFE] rounded-md transition-colors text-black/60"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove document ${doc.name}?`)) {
                                const updatedDocs = selectedEmployee.documents.filter((_, dIdx) => dIdx !== idx);
                                const updatedEmp = { ...selectedEmployee, documents: updatedDocs };
                                saveEmployeeSingle(updatedEmp);
                                setSelectedEmployee(updatedEmp);
                              }
                            }}
                            className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded-md transition-colors text-black/40 cursor-pointer"
                            title="Remove Document"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Certificates */}
                    {selectedEmployee.certificates && selectedEmployee.certificates.map((cert) => (
                      <div
                        key={'cert_' + cert.id}
                        className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/50 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center justify-between gap-2.5 text-xs font-bold text-black group transition-all w-full sm:w-auto"
                      >
                        <a
                          href={cert.url}
                          onClick={(e) => handleDownloadResume(e, cert.url, `${selectedEmployee.name}_${cert.name}`)}
                          className="flex items-center gap-2 hover:underline truncate min-w-0"
                        >
                          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{cert.name} <span className="text-[10px] bg-emerald-100 border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase ml-1">{cert.certification_number}</span></span>
                        </a>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={cert.url}
                            onClick={(e) => handleDownloadResume(e, cert.url, `${selectedEmployee.name}_${cert.name}`)}
                            className="p-1 hover:bg-emerald-200 rounded-md transition-colors text-black/60"
                            title="Download Certificate"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Remove certificate ${cert.name}?`)) {
                                try {
                                  const { error } = await supabase
                                    .from('certificates')
                                    .delete()
                                    .eq('id', cert.id);
                                  if (error) throw error;

                                  const updatedCerts = selectedEmployee.certificates.filter(c => c.id !== cert.id);
                                  setSelectedEmployee({ ...selectedEmployee, certificates: updatedCerts });
                                  toast.success('Certificate removed successfully!');
                                } catch (err) {
                                  toast.error('Failed to remove certificate: ' + err.message);
                                }
                              }
                            }}
                            className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded-md transition-colors text-black/40 cursor-pointer"
                            title="Remove Certificate"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Action Upload Triggers */}
                    <div className="flex gap-2 sm:gap-3 items-center flex-wrap w-full mt-2 pt-2 border-t border-[#BFDBFE]/40">
                      <label className="flex-1 sm:flex-none border-2 border-dashed border-[#BFDBFE] hover:border-primary/50 hover:bg-[#EFF6FF]/50 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer relative">
                        <Plus className="w-4 h-4" /> Upload Document
                        <input
                          type="file"
                          onChange={handleDocumentUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleUploadCertificateClick}
                        className="flex-1 sm:flex-none border-2 border-dashed border-[#BFDBFE] hover:border-primary/50 hover:bg-[#EFF6FF]/50 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-emerald-600" /> Upload Certificate
                      </button>
                      <input
                        type="file"
                        id="certificate-file-input"
                        onChange={handleCertificateFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Edit Employee Profile Modal */}
          {isEditingEmployee && editEmployeeForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4">
              <form
                onSubmit={handleSaveEmployeeEdit}
                data-lenis-prevent
                className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 md:p-8 max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsEditingEmployee(false)}
                  className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-white border border-[#BFDBFE] hover:bg-[#DBEAFE] rounded-full flex items-center justify-center text-black font-black transition-colors cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg sm:text-2xl font-black text-black mb-4 sm:mb-6 border-b border-[#BFDBFE] pb-3 sm:pb-4 pr-10">Edit Employee Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-5">
                  {/* Left Column: Personal Info */}
                  <div className="flex flex-col gap-3.5 sm:gap-5">
                    <h5 className="font-black text-black text-xs uppercase tracking-wider mb-1 border-b border-[#BFDBFE]/40 pb-1">Personal Info</h5>

                    <div className="flex flex-col gap-1.5 items-center mb-1">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Profile Picture</label>
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#BFDBFE] flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary transition-colors bg-white">
                        {editEmployeeForm.profile_picture ? (
                          <img src={editEmployeeForm.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-primary flex flex-col items-center">
                            <span className="text-2xl">+</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleProfilePictureUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Registration No.</label>
                      <input
                        type="text"
                        value={editEmployeeForm.registration_no || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, registration_no: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editEmployeeForm.name || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, name: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Father's Name</label>
                      <input
                        type="text"
                        value={editEmployeeForm.father_name || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, father_name: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Date of Birth</label>
                      <input
                        type="date"
                        value={editEmployeeForm.dob || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, dob: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Email ID</label>
                      <input
                        type="email"
                        value={editEmployeeForm.email || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, email: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Contact Number</label>
                      <input
                        type="text"
                        value={editEmployeeForm.contact_number || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, contact_number: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Alternative Phone No.</label>
                      <input
                        type="text"
                        value={editEmployeeForm.alt_phone || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, alt_phone: e.target.value })}
                        placeholder="e.g. +1 555 0109"
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Aadhaar No.</label>
                      <input
                        type="text"
                        value={editEmployeeForm.aadhaar_no || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, aadhaar_no: e.target.value })}
                        placeholder="e.g. 1234-5678-9012"
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Permanent Address</label>
                      <input
                        type="text"
                        value={editEmployeeForm.permanent_address || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, permanent_address: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Current Address</label>
                      <input
                        type="text"
                        value={editEmployeeForm.current_address || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, current_address: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Right Column: Professional & Bank */}
                  <div className="flex flex-col gap-3.5 sm:gap-5">
                    <h5 className="font-black text-black text-xs uppercase tracking-wider mb-1 border-b border-[#BFDBFE]/40 pb-1">Professional & Bank</h5>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Account No.</label>
                      <input
                        type="text"
                        value={editEmployeeForm.account_no || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, account_no: e.target.value })}
                        placeholder="e.g. 0987654321"
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">IFSC Detail</label>
                      <input
                        type="text"
                        value={editEmployeeForm.ifsc_detail || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, ifsc_detail: e.target.value })}
                        placeholder="e.g. CHAS0001"
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Role / Designation Dropdown with Custom Add */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Role / Designation</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsManagingRoles(true)}
                            className="text-[10px] font-bold text-slate-500 hover:text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            title="Edit or Delete Roles"
                          >
                            <Edit3 className="w-2.5 h-2.5" /> Manage
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewRole(!isAddingNewRole);
                              setNewCustomRole('');
                            }}
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> {isAddingNewRole ? 'Select existing' : '+ Add'}
                          </button>
                        </div>
                      </div>
                      {isAddingNewRole ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            autoFocus
                            value={newCustomRole}
                            onChange={(e) => setNewCustomRole(e.target.value)}
                            placeholder="Enter custom role title..."
                            className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newCustomRole.trim()) {
                                  handleAddNewRole(newCustomRole, (val) => setEditEmployeeForm(prev => ({ ...prev, role: val })));
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newCustomRole.trim()) {
                                handleAddNewRole(newCustomRole, (val) => setEditEmployeeForm(prev => ({ ...prev, role: val })));
                              }
                            }}
                            className="bg-primary text-white text-xs font-bold px-3 py-2.5 sm:py-3.5 rounded-xl hover:bg-primary-dark transition-all cursor-pointer whitespace-nowrap"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <select
                          value={editEmployeeForm.role || ''}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsAddingNewRole(true);
                              setNewCustomRole('');
                            } else {
                              setEditEmployeeForm({ ...editEmployeeForm, role: e.target.value });
                            }
                          }}
                          className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="">-- Select Role / Designation --</option>
                          {availableRoles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                          {editEmployeeForm.role && !availableRoles.includes(editEmployeeForm.role) && (
                            <option value={editEmployeeForm.role}>{editEmployeeForm.role}</option>
                          )}
                          <option value="__add_new__" className="text-primary font-bold">+ Add New Role...</option>
                        </select>
                      )}
                    </div>

                    {/* Department Dropdown with Custom Add */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Department</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsManagingDepts(true)}
                            className="text-[10px] font-bold text-slate-500 hover:text-primary hover:underline flex items-center gap-1 cursor-pointer"
                            title="Edit or Delete Departments"
                          >
                            <Edit3 className="w-2.5 h-2.5" /> Manage
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewDept(!isAddingNewDept);
                              setNewCustomDept('');
                            }}
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> {isAddingNewDept ? 'Select existing' : '+ Add'}
                          </button>
                        </div>
                      </div>
                      {isAddingNewDept ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            autoFocus
                            value={newCustomDept}
                            onChange={(e) => setNewCustomDept(e.target.value)}
                            placeholder="Enter custom department..."
                            className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newCustomDept.trim()) {
                                  handleAddNewDept(newCustomDept, (val) => setEditEmployeeForm(prev => ({ ...prev, department: val })));
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newCustomDept.trim()) {
                                handleAddNewDept(newCustomDept, (val) => setEditEmployeeForm(prev => ({ ...prev, department: val })));
                              }
                            }}
                            className="bg-primary text-white text-xs font-bold px-3 py-2.5 sm:py-3.5 rounded-xl hover:bg-primary-dark transition-all cursor-pointer whitespace-nowrap"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <select
                          value={editEmployeeForm.department || ''}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsAddingNewDept(true);
                              setNewCustomDept('');
                            } else {
                              setEditEmployeeForm({ ...editEmployeeForm, department: e.target.value });
                            }
                          }}
                          className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="">-- Select Department --</option>
                          {availableDepartments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                          {editEmployeeForm.department && !availableDepartments.includes(editEmployeeForm.department) && (
                            <option value={editEmployeeForm.department}>{editEmployeeForm.department}</option>
                          )}
                          <option value="__add_new__" className="text-primary font-bold">+ Add New Department...</option>
                        </select>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Start Date</label>
                      <input
                        type="date"
                        value={editEmployeeForm.start_date || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, start_date: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">End Date (Optional)</label>
                      <input
                        type="date"
                        value={editEmployeeForm.end_date || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, end_date: e.target.value })}
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {editEmployeeForm.start_date && (
                      <div className="md:col-span-2 bg-primary/10 border border-primary/20 rounded-xl p-2.5 sm:p-3 text-xs font-semibold text-primary flex items-center justify-between">
                        <span>Total Working Days ({editEmployeeForm.end_date ? 'Completed Period' : 'Till Today'}):</span>
                        <span className="font-black text-sm">{calculateWorkingDays(editEmployeeForm.start_date, editEmployeeForm.end_date)} days</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-black/60 tracking-wider">Salary</label>
                      <input
                        type="text"
                        value={editEmployeeForm.salary || ''}
                        onChange={(e) => setEditEmployeeForm({ ...editEmployeeForm, salary: e.target.value })}
                        placeholder="e.g. $120,000"
                        className="bg-white border border-[#BFDBFE] p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-black font-semibold text-xs sm:text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 border-t border-[#BFDBFE]/60 pt-4 sm:pt-6">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none justify-center bg-primary hover:bg-primary-dark text-white font-black text-xs sm:text-sm tracking-wider uppercase py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-full shadow-lg shadow-primary/20 hover:shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer text-center"
                  >
                    SAVE CHANGES
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmployee(false)}
                    className="flex-1 sm:flex-none justify-center bg-white border-2 border-primary/20 hover:border-primary text-black font-black text-xs sm:text-sm tracking-wider uppercase py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-full transition-all duration-300 active:scale-95 cursor-pointer text-center"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      {/* Slide-Over Right Drawer for Candidate Details */}
      {candidateDrawerApp && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
            onClick={() => setCandidateDrawerApp(null)}
          />

          {/* Slide-in Panel from Right */}
          <div
            data-lenis-prevent
            className="relative w-full max-w-full sm:max-w-xl md:max-w-2xl bg-white h-[100dvh] max-h-[100dvh] shadow-2xl z-10 overflow-y-auto flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-20 shrink-0 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-extrabold text-blue-600 text-sm sm:text-base shrink-0">
                  {candidateDrawerApp.candidateName ? candidateDrawerApp.candidateName.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-black text-slate-900 leading-tight truncate">
                    {candidateDrawerApp.candidateName}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                    Applied for: <span className="text-blue-600 font-bold">{candidateDrawerApp.jobId ? (typeof candidateDrawerApp.jobId === 'object' ? candidateDrawerApp.jobId.title : candidateDrawerApp.jobId) : 'General Placement'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCandidateDrawerApp(null)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100/70 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Close"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Action Bar: Download Resume & View Portfolio */}
            <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-2">
              {/* Download Resume Button */}
              <button
                onClick={(e) => handleDownloadResume(e, candidateDrawerApp.resume, candidateDrawerApp.candidateName)}
                disabled={!candidateDrawerApp.resume}
                className={`flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-xs ${
                  candidateDrawerApp.resume
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Download Resume</span>
              </button>

              {/* View Portfolio Button */}
              {candidateDrawerApp.portfolioUrl ? (
                <a
                  href={candidateDrawerApp.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-2xs active:scale-98"
                >
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">Portfolio</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 min-w-[120px] py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">No Portfolio</span>
                </button>
              )}

              {/* LinkedIn Option */}
              {candidateDrawerApp.linkedInUrl && (
                <a
                  href={candidateDrawerApp.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 shrink-0"
                  title="LinkedIn Profile"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>LinkedIn</span>
                </a>
              )}

              {/* Blacklist Toggle Button */}
              {isCandidateBlacklisted(candidateDrawerApp.email) ? (
                <button
                  type="button"
                  onClick={() => handleRemoveBlacklistEmail(candidateDrawerApp.email)}
                  className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 shrink-0 cursor-pointer"
                  title="Remove candidate from blacklist"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Remove Blacklist</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddBlacklistEmail(candidateDrawerApp.email, 'Flagged from candidate drawer')}
                  className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 shrink-0 cursor-pointer"
                  title="Flag candidate on blacklist"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Blacklist Email</span>
                </button>
              )}
            </div>

            {/* Drawer Body Content */}
            <div className="p-3.5 sm:p-5 lg:p-6 flex flex-col gap-4 sm:gap-5 pb-8">
              {/* Blacklisted Warning Banner */}
              {isCandidateBlacklisted(candidateDrawerApp.email) && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                  <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                        Internal Review Flag: Blacklisted
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        Reviewer Notice
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 font-medium mt-1">
                      This candidate was allowed to submit an application normally, but has been flagged in red as blacklisted for internal review.
                    </p>
                    {getBlacklistEntry(candidateDrawerApp.email)?.reason && (
                      <p className="text-xs text-rose-900 font-bold mt-1.5 bg-white/80 p-2 rounded-lg border border-rose-200 inline-block">
                        Reason: {getBlacklistEntry(candidateDrawerApp.email).reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Profile Details Card */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3">
                <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider">Candidate Contact & Overview</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Email</span>
                      <a href={`mailto:${candidateDrawerApp.email}`} className="text-xs font-bold text-slate-800 hover:text-blue-600 truncate">
                        {candidateDrawerApp.email || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Phone</span>
                      <a href={`tel:${candidateDrawerApp.phone}`} className="text-xs font-bold text-slate-800 hover:text-blue-600 truncate">
                        {candidateDrawerApp.phone || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Location</span>
                      <span className="text-xs font-bold text-slate-800 truncate">{candidateDrawerApp.location || 'Remote'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Experience</span>
                      <span className="text-xs font-bold text-slate-800 truncate">{candidateDrawerApp.experience || 'Not Specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Applied Date</span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {candidateDrawerApp.createdAt ? new Date(candidateDrawerApp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 shadow-2xs min-w-0">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Status</span>
                      <span className="text-xs font-extrabold uppercase text-blue-600 truncate">{candidateDrawerApp.status || 'Applied'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {candidateDrawerApp.coverLetter && (
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2">
                  <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider">Cover Letter</h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs break-words">
                    "{candidateDrawerApp.coverLetter}"
                  </p>
                </div>
              )}

              {/* Recruitment Pipeline Status update */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
                <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider">Update Pipeline Status</h4>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                  {['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleDrawerStatusUpdate(candidateDrawerApp, statusOption)}
                      className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center truncate ${
                        candidateDrawerApp.status === statusOption
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider truncate">Internal Recruiter Notes</h4>
                  <button
                    onClick={() => handleDrawerSaveNotes(candidateDrawerApp, drawerNotesText)}
                    className="px-2.5 sm:px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> <span>Save</span>
                  </button>
                </div>
                <textarea
                  value={drawerNotesText}
                  onChange={(e) => setDrawerNotesText(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  placeholder="Add internal feedback, interview outcome, notes..."
                />
              </div>

              {/* Resume Viewer */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-slate-500 tracking-wider">Resume Document</h4>
                  {candidateDrawerApp.resume && (
                    <a
                      href={candidateDrawerAppResumeSignedUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Open Tab</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {candidateDrawerApp.resume ? (
                  candidateDrawerApp.resume.toLowerCase().endsWith('.pdf') ? (
                    candidateDrawerAppResumeSignedUrl ? (
                      <iframe
                        src={`${candidateDrawerAppResumeSignedUrl}#toolbar=0`}
                        className="w-full h-[320px] sm:h-[450px] rounded-xl border border-slate-200 bg-white shadow-xs"
                        title="Resume Preview"
                      />
                    ) : (
                      <div className="w-full h-[240px] sm:h-[450px] rounded-xl border border-slate-200 bg-slate-50 shadow-xs flex items-center justify-center text-xs font-bold text-slate-400">
                        <span className="animate-pulse">Loading preview...</span>
                      </div>
                    )
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 text-center flex flex-col items-center gap-3 shadow-2xs">
                      <FileText className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Resume Attached</p>
                        <p className="text-[11px] text-slate-400">Click below to download or view the document</p>
                      </div>
                      <button
                        onClick={(e) => handleDownloadResume(e, candidateDrawerApp.resume, candidateDrawerApp.candidateName)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download Resume
                      </button>
                    </div>
                  )
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs italic shadow-2xs">
                    No resume uploaded by candidate.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Management Modal */}
      {isBlacklistModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsBlacklistModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl z-10 overflow-hidden flex flex-col my-8">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">Blacklisted Candidates Registry</h3>
                  <p className="text-xs text-rose-100 font-medium">Internal review flags &bull; No automatic candidate rejection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBlacklistModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Notice */}
            <div className="p-4 bg-rose-50/70 border-b border-rose-100 flex items-start gap-2.5 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">How this works: </span>
                Candidates with these email addresses can still apply through the career forms as normal. However, in the Admin Panel Application and Pipeline sections, they will clearly be highlighted in <span className="font-extrabold text-rose-700">red</span> with a warning badge for your internal recruitment team to review.
              </div>
            </div>

            {/* Add Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddBlacklistEmail(blacklistInputEmail, blacklistInputReason);
              }}
              className="p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/50"
            >
              <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">Add Candidate Email to Blacklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <input
                    type="email"
                    required
                    value={blacklistInputEmail}
                    onChange={(e) => setBlacklistInputEmail(e.target.value)}
                    placeholder="Candidate email (e.g. john@domain.com)"
                    className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-rose-500 transition-colors shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={blacklistInputReason}
                    onChange={(e) => setBlacklistInputReason(e.target.value)}
                    placeholder="Reason / internal note..."
                    className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-rose-500 transition-colors shadow-2xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[38px] bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Existing Blacklist List */}
            <div className="p-5 sm:p-6 flex flex-col gap-3 max-h-[340px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">
                  Currently Blacklisted Emails ({blacklistedEmails.length})
                </h4>
                {blacklistedEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear all blacklisted candidate emails?')) {
                        setBlacklistedEmails([]);
                        toast.info('Blacklist cleared.');
                      }
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {blacklistedEmails.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-400 text-xs italic">
                  No candidates currently blacklisted. Enter an email address above to flag someone for internal review.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {blacklistedEmails.map((item, idx) => {
                    const email = typeof item === 'string' ? item : item.email;
                    const reason = typeof item === 'object' ? item.reason : '';
                    const addedAt = typeof item === 'object' && item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '';
                    return (
                      <div key={idx} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-rose-50/40 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{email}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                              {reason && <span className="text-rose-700 font-semibold truncate max-w-[200px]">{reason}</span>}
                              {addedAt && <span>&bull; Added {addedAt}</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlacklistEmail(email)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove from blacklist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBlacklistModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {isManagingRoles && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsManagingRoles(false)}>
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Manage Roles / Designations
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Edit or delete existing roles</p>
              </div>
              <button
                type="button"
                onClick={() => setIsManagingRoles(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-3">
              {availableRoles.map(role => (
                <div key={role} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors gap-2">
                  {editingRoleItem && editingRoleItem.oldName === role ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={editingRoleItem.newName}
                        onChange={(e) => setEditingRoleItem({ ...editingRoleItem, newName: e.target.value })}
                        className="bg-white border border-primary px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 outline-none flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleUpdateRole(role, editingRoleItem.newName);
                          } else if (e.key === 'Escape') {
                            setEditingRoleItem(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateRole(role, editingRoleItem.newName)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingRoleItem(null)}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-800 truncate">{role}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingRoleItem({ oldName: role, newName: role })}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit role"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManagingRoles(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Departments Modal */}
      {isManagingDepts && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsManagingDepts(false)}>
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Manage Departments
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Edit or delete existing departments</p>
              </div>
              <button
                type="button"
                onClick={() => setIsManagingDepts(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-3">
              {availableDepartments.map(dept => (
                <div key={dept} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors gap-2">
                  {editingDeptItem && editingDeptItem.oldName === dept ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={editingDeptItem.newName}
                        onChange={(e) => setEditingDeptItem({ ...editingDeptItem, newName: e.target.value })}
                        className="bg-white border border-primary px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 outline-none flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleUpdateDept(dept, editingDeptItem.newName);
                          } else if (e.key === 'Escape') {
                            setEditingDeptItem(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateDept(dept, editingDeptItem.newName)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDeptItem(null)}
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-800 truncate">{dept}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingDeptItem({ oldName: dept, newName: dept })}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit department"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDept(dept)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManagingDepts(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar theme="colored" />
    </div>
  );
};

export default Admin;
