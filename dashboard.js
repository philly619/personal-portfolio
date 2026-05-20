// Dashboard Management System

let currentUser = checkAuth();

// ============ INITIALIZE DASHBOARD ============
document.addEventListener('DOMContentLoaded', function() {
  if (currentUser) {
    loadUserData();
    initializeNavigation();
    initializeJobsManager();
    initializeCVBuilder();
    initializeProfileSettings();
    updateStats();
  }
});

// ============ LOAD USER DATA ============
function loadUserData() {
  document.getElementById('userName').textContent = `Welcome, ${currentUser.fullname}!`;
  document.getElementById('userEmail').textContent = currentUser.email;
}

// ============ NAVIGATION ============
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const section = this.getAttribute('data-section');
      
      // Remove active from all links and sections
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
      
      // Add active to clicked link and corresponding section
      this.classList.add('active');
      document.getElementById(section).classList.add('active');
    });
  });
}

// ============ UPDATE STATS ============
function updateStats() {
  const appliedJobs = currentUser.jobs.filter(j => j.status === 'applied').length;
  const interestedJobs = currentUser.jobs.filter(j => j.status === 'interested').length;
  const cvCount = currentUser.cvs ? currentUser.cvs.length : 0;

  document.getElementById('appliedCount').textContent = appliedJobs;
  document.getElementById('interestedCount').textContent = interestedJobs;
  document.getElementById('cvCount').textContent = cvCount;
}

// ============ JOBS MANAGER ============
function initializeJobsManager() {
  const addJobBtn = document.getElementById('addJobBtn');
  const jobModal = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const closeBtn = jobModal.querySelector('.close');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Open modal
  addJobBtn.addEventListener('click', () => {
    jobForm.reset();
    jobModal.classList.add('show');
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    jobModal.classList.remove('show');
  });

  window.addEventListener('click', (e) => {
    if (e.target === jobModal) {
      jobModal.classList.remove('show');
    }
  });

  // Submit form
  jobForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const job = {
      id: Date.now(),
      title: document.getElementById('jobTitle').value,
      company: document.getElementById('company').value,
      location: document.getElementById('jobLocation').value,
      status: document.getElementById('jobStatus').value,
      applicationDate: document.getElementById('applicationDate').value,
      description: document.getElementById('jobDescription').value
    };

    currentUser.jobs.push(job);
    saveUserData();
    jobModal.classList.remove('show');
    renderJobs('all');
    updateStats();
    showSuccessModal('Job added successfully!');
  });

  // Filter tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      renderJobs(filter);
    });
  });

  renderJobs('all');
}

// ============ RENDER JOBS ============
function renderJobs(filter = 'all') {
  const jobsList = document.getElementById('jobsList');
  let filteredJobs = currentUser.jobs;

  if (filter === 'applied') {
    filteredJobs = currentUser.jobs.filter(j => j.status === 'applied');
  } else if (filter === 'interested') {
    filteredJobs = currentUser.jobs.filter(j => j.status === 'interested');
  }

  if (filteredJobs.length === 0) {
    jobsList.innerHTML = '<p class="no-data">No jobs to display. Click "Add Job" to get started.</p>';
    return;
  }

  jobsList.innerHTML = filteredJobs.map(job => `
    <div class="job-card">
      <div class="job-card-header">
        <div>
          <h3>${job.title}</h3>
          <div class="job-card-meta">
            <span>${job.company}</span>
            <span>${job.location}</span>
            ${job.applicationDate ? `<span>${formatDate(job.applicationDate)}</span>` : ''}
          </div>
        </div>
        <span class="job-status ${job.status === 'applied' ? 'status-applied' : 'status-interested'}">
          ${job.status.toUpperCase()}
        </span>
      </div>
      <p class="job-description">${job.description}</p>
      <div class="job-actions">
        <button class="btn-edit" onclick="editJob(${job.id})">Edit</button>
        <button class="btn-delete" onclick="deleteJob(${job.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// ============ EDIT JOB ============
function editJob(jobId) {
  const job = currentUser.jobs.find(j => j.id === jobId);
  if (!job) return;

  document.getElementById('jobTitle').value = job.title;
  document.getElementById('company').value = job.company;
  document.getElementById('jobLocation').value = job.location;
  document.getElementById('jobStatus').value = job.status;
  document.getElementById('applicationDate').value = job.applicationDate;
  document.getElementById('jobDescription').value = job.description;

  deleteJob(jobId);
  document.getElementById('jobModal').classList.add('show');
}

// ============ DELETE JOB ============
function deleteJob(jobId) {
  currentUser.jobs = currentUser.jobs.filter(j => j.id !== jobId);
  saveUserData();
  renderJobs('all');
  updateStats();
}

// ============ CV BUILDER ============
function initializeCVBuilder() {
  const cvForm = document.getElementById('cvForm');
  const addExperienceBtn = document.getElementById('addExperienceBtn');
  const addEducationBtn = document.getElementById('addEducationBtn');
  const addSkillBtn = document.getElementById('addSkillBtn');
  const previewCvBtn = document.getElementById('previewCvBtn');
  const downloadCvBtn = document.getElementById('downloadCvBtn');

  addExperienceBtn.addEventListener('click', addExperienceField);
  addEducationBtn.addEventListener('click', addEducationField);
  addSkillBtn.addEventListener('click', addSkillField);
  previewCvBtn.addEventListener('click', previewCV);
  downloadCvBtn.addEventListener('click', downloadCV);

  cvForm.addEventListener('submit', function(e) {
    e.preventDefault();
    saveCV();
  });

  // Add initial empty fields
  if (document.getElementById('experienceContainer').children.length === 0) {
    addExperienceField();
    addEducationField();
    addSkillField();
  }
}

// ============ ADD EXPERIENCE FIELD ============
function addExperienceField() {
  const container = document.getElementById('experienceContainer');
  const id = Date.now();
  const html = `
    <div class="experience-entry" id="exp-${id}">
      <div class="form-group">
        <label for="jobTitle-${id}">Job Title</label>
        <input type="text" id="jobTitle-${id}" name="jobTitle" placeholder="e.g., Senior Developer">
      </div>
      <div class="form-group">
        <label for="company-${id}">Company</label>
        <input type="text" id="company-${id}" name="company" placeholder="e.g., Tech Corp">
      </div>
      <div class="form-group">
        <label for="startDate-${id}">Start Date</label>
        <input type="month" id="startDate-${id}" name="startDate">
      </div>
      <div class="form-group">
        <label for="endDate-${id}">End Date</label>
        <input type="month" id="endDate-${id}" name="endDate">
      </div>
      <div class="form-group">
        <label for="jobDesc-${id}">Description</label>
        <textarea id="jobDesc-${id}" name="jobDesc" rows="2" placeholder="Job responsibilities..."></textarea>
      </div>
      <button type="button" class="btn-secondary" onclick="removeField('exp-${id}')">Remove</button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

// ============ ADD EDUCATION FIELD ============
function addEducationField() {
  const container = document.getElementById('educationContainer');
  const id = Date.now();
  const html = `
    <div class="education-entry" id="edu-${id}">
      <div class="form-group">
        <label for="school-${id}">School/University</label>
        <input type="text" id="school-${id}" name="school" placeholder="e.g., University Name">
      </div>
      <div class="form-group">
        <label for="degree-${id}">Degree</label>
        <input type="text" id="degree-${id}" name="degree" placeholder="e.g., Bachelor of Science">
      </div>
      <div class="form-group">
        <label for="field-${id}">Field of Study</label>
        <input type="text" id="field-${id}" name="field" placeholder="e.g., Computer Science">
      </div>
      <div class="form-group">
        <label for="gradDate-${id}">Graduation Date</label>
        <input type="month" id="gradDate-${id}" name="gradDate">
      </div>
      <button type="button" class="btn-secondary" onclick="removeField('edu-${id}')">Remove</button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

// ============ ADD SKILL FIELD ============
function addSkillField() {
  const container = document.getElementById('skillsContainer');
  const id = Date.now();
  const html = `
    <div class="skill-entry" id="skill-${id}">
      <div class="form-group">
        <label for="skill-${id}">Skill</label>
        <input type="text" id="skill-${id}" name="skill" placeholder="e.g., JavaScript">
      </div>
      <button type="button" class="btn-secondary" onclick="removeField('skill-${id}')">Remove</button>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
}

// ============ REMOVE FIELD ============
function removeField(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.remove();
  }
}

// ============ PREVIEW CV ============
function previewCV() {
  const fullName = document.getElementById('cvFullName').value || 'Your Name';
  const email = document.getElementById('cvEmail').value || 'email@example.com';
  const phone = document.getElementById('cvPhone').value || '';
  const location = document.getElementById('cvLocation').value || '';
  const summary = document.getElementById('cvSummary').value || '';

  let previewHTML = `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px;">
      <h2 style="margin: 0; color: #4B0E22; font-size: 1.8rem;">${fullName}</h2>
      <p style="margin: 5px 0; color: #666;">${email}${phone ? ' | ' + phone : ''}${location ? ' | ' + location : ''}</p>
    </div>
  `;

  if (summary) {
    previewHTML += `
      <div style="margin-bottom: 15px;">
        <h3 style="color: #4B0E22; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Professional Summary</h3>
        <p style="color: #666; line-height: 1.6;">${summary}</p>
      </div>
    `;
  }

  // Experience
  const experiences = document.querySelectorAll('.experience-entry');
  if (experiences.length > 0 && document.querySelector('[id^="jobTitle-"]').value) {
    previewHTML += '<h3 style="color: #4B0E22; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 15px;">Work Experience</h3>';
    experiences.forEach(exp => {
      const jobTitle = exp.querySelector('[name="jobTitle"]').value;
      const company = exp.querySelector('[name="company"]').value;
      const startDate = exp.querySelector('[name="startDate"]').value;
      const endDate = exp.querySelector('[name="endDate"]').value;
      const jobDesc = exp.querySelector('[name="jobDesc"]').value;

      if (jobTitle || company) {
        previewHTML += `
          <div style="margin-bottom: 10px;">
            <p style="margin: 5px 0; font-weight: bold; color: #333;">${jobTitle} at ${company}</p>
            <p style="margin: 5px 0; color: #888; font-size: 0.9rem;">${startDate} - ${endDate || 'Present'}</p>
            <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">${jobDesc}</p>
          </div>
        `;
      }
    });
  }

  // Education
  const educations = document.querySelectorAll('.education-entry');
  if (educations.length > 0 && document.querySelector('[id^="school-"]').value) {
    previewHTML += '<h3 style="color: #4B0E22; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 15px;">Education</h3>';
    educations.forEach(edu => {
      const school = edu.querySelector('[name="school"]').value;
      const degree = edu.querySelector('[name="degree"]').value;
      const field = edu.querySelector('[name="field"]').value;
      const gradDate = edu.querySelector('[name="gradDate"]').value;

      if (school || degree) {
        previewHTML += `
          <div style="margin-bottom: 10px;">
            <p style="margin: 5px 0; font-weight: bold; color: #333;">${degree} in ${field || 'Study'}</p>
            <p style="margin: 5px 0; color: #888; font-size: 0.9rem;">${school}</p>
            <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">Graduated: ${gradDate || 'N/A'}</p>
          </div>
        `;
      }
    });
  }

  // Skills
  const skills = document.querySelectorAll('.skill-entry');
  const skillValues = Array.from(skills).map(s => s.querySelector('[name="skill"]').value).filter(v => v);
  if (skillValues.length > 0) {
    previewHTML += '<h3 style="color: #4B0E22; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 15px;">Skills</h3>';
    previewHTML += `<p style="color: #666;">${skillValues.join(' • ')}</p>`;
  }

  document.getElementById('cvPreviewContent').innerHTML = previewHTML;
  showSuccessModal('CV preview updated!');
}

// ============ SAVE CV ============
function saveCV() {
  const cv = {
    id: Date.now(),
    fullName: document.getElementById('cvFullName').value,
    email: document.getElementById('cvEmail').value,
    phone: document.getElementById('cvPhone').value,
    location: document.getElementById('cvLocation').value,
    summary: document.getElementById('cvSummary').value,
    experiences: [],
    educations: [],
    skills: [],
    createdAt: new Date().toISOString()
  };

  // Collect experiences
  document.querySelectorAll('.experience-entry').forEach(exp => {
    const jobTitle = exp.querySelector('[name="jobTitle"]').value;
    if (jobTitle) {
      cv.experiences.push({
        jobTitle: jobTitle,
        company: exp.querySelector('[name="company"]').value,
        startDate: exp.querySelector('[name="startDate"]').value,
        endDate: exp.querySelector('[name="endDate"]').value,
        description: exp.querySelector('[name="jobDesc"]').value
      });
    }
  });

  // Collect educations
  document.querySelectorAll('.education-entry').forEach(edu => {
    const school = edu.querySelector('[name="school"]').value;
    if (school) {
      cv.educations.push({
        school: school,
        degree: edu.querySelector('[name="degree"]').value,
        field: edu.querySelector('[name="field"]').value,
        gradDate: edu.querySelector('[name="gradDate"]').value
      });
    }
  });

  // Collect skills
  document.querySelectorAll('.skill-entry').forEach(skill => {
    const skillName = skill.querySelector('[name="skill"]').value;
    if (skillName) {
      cv.skills.push(skillName);
    }
  });

  if (!currentUser.cvs) {
    currentUser.cvs = [];
  }

  currentUser.cvs.push(cv);
  saveUserData();
  updateStats();
  showSuccessModal('CV saved successfully!');
}

// ============ DOWNLOAD CV ============
function downloadCV() {
  if (!document.getElementById('cvFullName').value) {
    alert('Please fill in at least your name before downloading');
    return;
  }

  previewCV();
  
  const content = document.getElementById('cvPreviewContent').innerText;
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${document.getElementById('cvFullName').value}_CV.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  showSuccessModal('CV downloaded successfully!');
}

// ============ PROFILE SETTINGS ============
function initializeProfileSettings() {
  const profileForm = document.getElementById('profileForm');
  
  // Load current data
  document.getElementById('profileFullName').value = currentUser.fullname;
  document.getElementById('profileEmail').value = currentUser.email;
  document.getElementById('profileBio').value = currentUser.bio || '';

  profileForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword && newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    currentUser.fullname = document.getElementById('profileFullName').value;
    currentUser.bio = document.getElementById('profileBio').value;

    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].fullname = currentUser.fullname;
      users[userIndex].bio = currentUser.bio;
      if (newPassword) {
        users[userIndex].password = btoa(newPassword);
      }
    }

    localStorage.setItem('portfolio_users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    loadUserData();
    profileForm.reset();
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileBio').value = currentUser.bio;
    showSuccessModal('Profile updated successfully!');
  });
}

// ============ SAVE USER DATA ============
function saveUserData() {
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      ...currentUser
    };
    localStorage.setItem('portfolio_users', JSON.stringify(users));
  }
}

// ============ SUCCESS MODAL ============
function showSuccessModal(message) {
  const modal = document.getElementById('successModal');
  document.getElementById('successMessage').textContent = message;
  modal.classList.add('show');
  setTimeout(() => {
    modal.classList.remove('show');
  }, 2000);
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('show');
}

// ============ HELPER FUNCTIONS ============
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}