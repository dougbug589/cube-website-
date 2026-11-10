'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Users,
  Plus,
  Archive,
  ArchiveRestore,
  X,
  Search,
  Filter,
  Briefcase,
  Building2,
  Trees,
  Navigation as NavigationIcon,
  ShieldCheck,
  Award,
  Edit3,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  HeartPulse,
  IdCard,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { addTeamMemberAction, updateTeamMemberAction, deleteTeamMemberAction } from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

export interface TeamMember {
  id?: string;
  name: string;
  designation: string;
  category: string;
  department?: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  age?: string;
  qualification?: string;
  experience?: string;
  employeeId?: string;
  joiningDate?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  status?: string;
  archiveRemark?: string;
  archivedAt?: string;
}

interface TeamClientProps {
  initialMembers: TeamMember[];
}

const CATEGORIES = [
  { id: 'all', label: 'All Personnel', icon: Users },
  { id: 'leadership', label: 'Executive Leadership', icon: Award },
  { id: 'board', label: 'Governing Board', icon: ShieldCheck },
  { id: 'advisory', label: 'IIT Advisory Panel', icon: Briefcase },
  { id: 'Building & Construction', label: 'Building & Construction', icon: Building2 },
  { id: 'Environment & Sustainability', label: 'Environment & Sustainability', icon: Trees },
  { id: 'Urban Planning & Transportation', label: 'Urban Planning & Transportation', icon: NavigationIcon },
  { id: 'Admin', label: 'Admin & Operations', icon: Briefcase },
];

export default function TeamClient({ initialMembers }: TeamClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  useEffect(() => { setMembers(initialMembers); }, [initialMembers]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [archiveModalTarget, setArchiveModalTarget] = useState<TeamMember | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [category, setCategory] = useState('Building & Construction');
  const [image, setImage] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setDesignation('');
    setCategory(selectedCategory !== 'all' ? selectedCategory : 'Building & Construction');
    setImage('');
    setBio('');
    setEmail('');
    setPhone('');
    setAge('');
    setQualification('');
    setExperience('');
    setEmployeeId('');
    setJoiningDate('');
    setBloodGroup('');
    setEmergencyContact('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name || '');
    setDesignation(member.designation || '');
    setCategory(member.category || member.department || 'Building & Construction');
    setImage(member.image || '');
    setBio(member.bio || '');
    setEmail(member.email || '');
    setPhone(member.phone || '');
    setAge(member.age || '');
    setQualification(member.qualification || '');
    setExperience(member.experience || '');
    setEmployeeId(member.employeeId || '');
    setJoiningDate(member.joiningDate || '');
    setBloodGroup(member.bloodGroup || '');
    setEmergencyContact(member.emergencyContact || '');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check 10MB limit upfront
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert('File size (' + sizeMB + ' MB) exceeds 10 MB maximum criteria. Please choose an image under 10 MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert('Error uploading photo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation) {
      alert('Please fill out Member Name and Designation.');
      return;
    }

    setLoading(true);
    try {
      if (editingMember) {
        // Edit existing member
        const idOrName = editingMember.id || editingMember.name;
        const res = await updateTeamMemberAction(idOrName, {
          name,
          designation,
          category,
          department: category,
          image: image || editingMember.image || '/images/team/team_unknown.png',
          bio,
          email,
          phone,
          age,
          qualification,
          experience,
          employeeId,
          joiningDate,
          bloodGroup,
          emergencyContact,
        });

        if (res.success && res.member) {
          setMembers(
            members.map((m) =>
              m.id === idOrName || m.name === idOrName ? { ...m, ...res.member } : m
            )
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || 'Failed to update member');
        }
      } else {
        // Add new member
        const res = await addTeamMemberAction({
          name,
          designation,
          category,
          department: category,
          image: image || '/images/team/team_unknown.png',
          bio,
          email,
          phone,
          age,
          qualification,
          experience,
          employeeId,
          joiningDate,
          bloodGroup,
          emergencyContact,
        });

        if (res.success && res.member) {
          setMembers([res.member, ...members]);
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    const idOrName = archiveModalTarget.id || archiveModalTarget.name;
    setLoading(true);
    try {
      const res = await deleteTeamMemberAction(idOrName, archiveRemark);
      if (res.success) {
        setMembers(
          members.map((m) => {
            if (m.id === idOrName || m.name === idOrName) {
              return {
                ...m,
                status: 'archived',
                archiveRemark,
                archivedAt: new Date().toISOString(),
              };
            }
            return m;
          })
        );
        setArchiveModalTarget(null);
        setArchiveRemark('');
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to archive member');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreMember = async (member: TeamMember) => {
    const idOrName = member.id || member.name;
    if (!confirm(`Restore ${member.name} back to published status?`)) return;
    setLoading(true);
    try {
      const res = await deleteTeamMemberAction(idOrName);
      if (res.success) {
        setMembers(
          members.map((m) => {
            if (m.id === idOrName || m.name === idOrName) {
              return { ...m, status: 'published', archiveRemark: undefined };
            }
            return m;
          })
        );
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore member');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = (member: TeamMember) => {
    if (member.status === 'archived') {
      handleRestoreMember(member);
    } else {
      setArchiveModalTarget(member);
      setArchiveRemark('');
    }
  };

  // Filter members by category, search query, and archived status
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const isArchived = m.status === 'archived';
      if (showArchived) {
        if (!isArchived) return false;
      } else {
        if (isArchived) return false;
      }

      // Category matching
      if (selectedCategory !== 'all') {
        const cat = (m.category || '').toLowerCase();
        const dept = (m.department || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();

        if (sel === 'leadership' && !cat.includes('leadership')) return false;
        else if (sel === 'board' && !cat.includes('board')) return false;
        else if (sel === 'advisory' && !cat.includes('advisory')) return false;
        else if (sel.includes('building') && !(dept.includes('building') || cat.includes('building'))) return false;
        else if (sel.includes('environment') && !(dept.includes('environment') || cat.includes('environment'))) return false;
        else if (sel.includes('urban') && !(dept.includes('urban') || cat.includes('urban'))) return false;
        else if (sel.includes('admin') && !(dept.includes('admin') || cat.includes('admin'))) return false;
      }

      // Search matching across name, role, email, phone, employeeId
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const n = (m.name || '').toLowerCase();
        const d = (m.designation || '').toLowerCase();
        const em = (m.email || '').toLowerCase();
        const ph = (m.phone || '').toLowerCase();
        const eid = (m.employeeId || '').toLowerCase();
        return n.includes(q) || d.includes(q) || em.includes(q) || ph.includes(q) || eid.includes(q);
      }

      return true;
    });
  }, [members, selectedCategory, searchQuery, showArchived]);

  const activeCount = members.filter((m) => m.status !== 'archived').length;
  const archivedCount = members.filter((m) => m.status === 'archived').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded border border-[#BBD6EA]">
              Personnel &amp; Team CMS
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs text-[#6B7280] font-medium">Full Profile Editing (Name, Role, Phone, Age, Qualification)</span>
          </div>
          <h1 className="text-2xl font-serif text-[#24272B] mt-1">
            Institutional Leadership &amp; Team Directory
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Active / Archive View Filter */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 rounded-full border text-xs font-medium flex items-center space-x-2 transition ${
              showArchived
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? `Viewing Archived (${archivedCount})` : `Archived (${archivedCount})`}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold text-xs flex items-center space-x-2 shadow-2xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition ${
                  isSelected
                    ? 'bg-[#070E5C] text-white border-[#070E5C] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team member by name, role, phone, email, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#070E5C] bg-[#FAFAFA]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>
        {/* Image Upload Requirements Guideline */}
        <div className="p-3 bg-[#EAF2F8]/60 border border-[#BBD6EA] rounded-xl flex items-center justify-between text-xs text-[#070E5C]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[10px] uppercase bg-[#070E5C] text-white px-2 py-0.5 rounded">Standard</span>
            <span className="font-medium">
              Font matches live site (Inter &amp; Manrope display). Upload square/circular portraits (JPG, PNG, WebP) under 5MB with light or professional backdrop.
            </span>
          </div>
        </div>
      </div>

      {/* Directory Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <b>{filteredMembers.length}</b> personnel {showArchived ? '(Archived Records)' : ''}
        </span>
        <span>
          Active: <b>{activeCount}</b> &bull; Archived: <b>{archivedCount}</b>
        </span>
      </div>

      {/* Team Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-medium text-sm text-slate-600">No personnel found in this category.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member, i) => {
            const isArchived = member.status === 'archived';
            return (
              <div
                key={member.id || member.name || i}
                className={`bg-white p-5 rounded-2xl border shadow-2xs flex flex-col justify-between space-y-3.5 transition-all group ${
                  isArchived ? 'border-amber-200 bg-amber-50/30 opacity-75' : 'border-[#E5E7EB] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between space-x-3.5">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="relative h-14 w-14 rounded-full bg-[#F7F7F4] overflow-hidden shrink-0 border border-[#E5E7EB]">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className={`object-cover ${isArchived ? 'grayscale' : ''}`}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-[#070E5C]">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2 py-0.5 rounded border border-[#BBD6EA]">
                          {member.department || member.category}
                        </span>
                        {isArchived && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Archived
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#24272B] truncate mt-1">{member.name}</h3>
                      <p className="text-xs text-[#6B7280] font-medium truncate mt-0.5">{member.designation}</p>
                    </div>
                  </div>

                  {/* Actions: Edit & Archive */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-1.5 rounded-xl bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] transition text-xs"
                      title="Edit Personal & Professional Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchiveClick(member)}
                      className={`p-1.5 rounded-xl transition ${
                        isArchived
                          ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                          : 'text-slate-400 bg-slate-50 hover:bg-amber-100 hover:text-amber-800'
                      }`}
                      title={isArchived ? 'Restore to Active Directory' : 'Archive with Audit Remark'}
                    >
                      {isArchived ? (
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional Personal Details Pill Preview */}
                {(member.phone || member.email || member.age || member.qualification || member.employeeId) && (
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                    {member.phone && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <Phone className="w-3 h-3 text-[#070E5C] shrink-0" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <Mail className="w-3 h-3 text-[#070E5C] shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.age && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Age: {member.age} yrs</span>
                      </div>
                    )}
                    {member.qualification && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.qualification}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Optional Archive Remark Banner */}
                {member.archiveRemark && (
                  <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-900 bg-amber-50/60 p-2.5 rounded-xl">
                    <span className="font-bold text-[10px] uppercase text-amber-800 tracking-wider flex items-center gap-1">
                      <Archive className="w-3 h-3" /> Archive Remark
                    </span>
                    <p className="italic mt-0.5">&quot;{member.archiveRemark}&quot;</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Member Modal with Personal Details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#E5E7EB] space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-xl font-serif text-[#24272B]">
                  {editingMember ? 'Edit Personal & Member Details' : 'Add New Member to Directory'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update name, designation, contact numbers, age, qualifications, and personal records.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Category / Discipline */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Category / Discipline Vertical <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white font-medium text-xs"
                >
                  <optgroup label="Our Team (Discipline Verticals)">
                    <option value="Building & Construction">Building &amp; Construction</option>
                    <option value="Environment & Sustainability">Environment &amp; Sustainability</option>
                    <option value="Urban Planning & Transportation">Urban Planning &amp; Transportation</option>
                    <option value="Admin">Admin &amp; Operations</option>
                  </optgroup>
                  <optgroup label="Institutional Governance">
                    <option value="leadership">Executive Leadership</option>
                    <option value="board">Governing Board Member</option>
                    <option value="advisory">IIT Technical Advisory Panel</option>
                  </optgroup>
                </select>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Full Name &amp; Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Joseph"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Designation / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Manager / Structural Lead"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none text-xs"
                  />
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-[#070E5C]" />
                  <span>Personal &amp; Contact Details (Admin Only)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="person@cubeiitm.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 38"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Employee ID / Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CUBE-EMP-042"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Blood Group</label>
                    <input
                      type="text"
                      placeholder="e.g. O+ / B+"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      placeholder="+91 94440 00000"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Qualification / Degrees</label>
                    <input
                      type="text"
                      placeholder="e.g. M.Tech Structural Engineering, IIT Madras"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Years of Experience / Joining Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 12+ Years (Joined 2019)"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">
                      Upload Photograph
                    </label>
                    <span className="text-[10px] font-bold text-[#070E5C] bg-[#EAF2F8] px-2 py-0.5 rounded border border-[#BBD6EA]">
                      Max: 10 MB Criteria
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 rounded-xl border border-dashed border-[#BBD6EA] bg-[#EAF2F8]/30 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#EAF2F8] file:text-[#070E5C]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP (under 10 MB size limit).
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Or Photo URL Path
                  </label>
                  <input
                    type="text"
                    placeholder="/images/team/... or /uploads/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] font-mono text-[11px] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                  />
                </div>
              </div>

              {/* Bio / Institutional Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">
                    Bio / Responsibilities Overview
                  </label>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Matches Website Typography (Inter/Sans)
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Key responsibilities, project leadership, or professional summary..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none text-xs font-sans text-[#24272B] leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Font is automatically matched and normalized to the public website style.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[#4A5568] hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-5 py-2 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white font-semibold shadow-2xs transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingMember ? 'Update Member Profile' : 'Add Member to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Archive Remark Modal */}
      {archiveModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Archive Team Member</h3>
                  <p className="text-[11px] text-slate-400">
                    Archiving {archiveModalTarget.name} &bull; Save audit remark
                  </p>
                </div>
              </div>
              <button
                onClick={() => setArchiveModalTarget(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-semibold">{archiveModalTarget.name}</span> ({archiveModalTarget.designation}) will be safely hidden from the public directory. It will never be deleted and can be restored anytime.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Tenure completed / moved to external government deputation / project wrapped up."
                  value={archiveRemark}
                  onChange={(e) => setArchiveRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-200 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArchiveModalTarget(null)}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition"
                >
                  {loading ? 'Archiving...' : 'Save Remark & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
