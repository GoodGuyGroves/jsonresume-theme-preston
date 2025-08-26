const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');

// Register partials
function registerPartials() {
  const partialsDir = path.join(__dirname, 'src', 'partials');
  const partialFiles = [
    'sidebar',
    'introduction',
    'experience', 
    'education',
    'skills'
  ];

  partialFiles.forEach(partial => {
    try {
      const partialPath = path.join(partialsDir, `${partial}.hbs`);
      if (fs.existsSync(partialPath)) {
        const template = fs.readFileSync(partialPath, 'utf8');
        handlebars.registerPartial(partial, template);
      }
    } catch (err) {
      console.warn(`Could not load partial ${partial}:`, err.message);
    }
  });
}

// Register helpers
handlebars.registerHelper({
  formatDate: function(dateString) {
    if (!dateString) return 'Present';
    if (typeof dateString !== 'string') return 'Present';
    
    const date = moment(dateString);
    return date.isValid() ? date.format('MMM YYYY') : dateString;
  },
  
  removeProtocol: function(url) {
    if (!url || typeof url !== 'string') return '';
    return url.replace(/^https?:\/\//, '');
  },
  
  lowercase: function(str) {
    return (str && typeof str === 'string') ? str.toLowerCase() : '';
  },
  
  uppercase: function(str) {
    return (str && typeof str === 'string') ? str.toUpperCase() : '';
  },
  
  eq: function(a, b) {
    return a === b;
  },
  
  ne: function(a, b) {
    return a !== b;
  },
  
  or: function(a, b) {
    return a || b;
  },
  
  and: function(a, b) {
    return a && b;
  },

  join: function(array, separator) {
    if (!array || !Array.isArray(array)) return '';
    const sep = separator || ', ';
    return array.join(sep);
  },

  phone: function(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') return '';
    return phoneNumber.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  },

  skillLevel: function(level) {
    const levels = {
      'Beginner': '★☆☆☆☆',
      'Intermediate': '★★★☆☆', 
      'Advanced': '★★★★☆',
      'Expert': '★★★★★'
    };
    return levels[level] || level;
  }
});

function render(resume) {
  try {
    registerPartials();
    
    const css = fs.readFileSync(path.join(__dirname, 'src', 'style.css'), 'utf8');
    const template = fs.readFileSync(path.join(__dirname, 'src', 'resume.hbs'), 'utf8');
    
    const compiled = handlebars.compile(template);
    
    return compiled({
      style: css,
      resume: resume
    });
  } catch (error) {
    console.error('Error rendering resume:', error);
    throw error;
  }
}

module.exports = { render };