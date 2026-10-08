const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');

// Register partials
function registerPartials() {
  const partialsDir = path.join(__dirname, 'src', 'partials');
  const partialFiles = [
    'sidebar',
    'header',
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
  // A date range, or the one date there is; `ongoing` (work) reads a missing end as Present
  period: function(start, end, ongoing) {
    const format = (d) => {
      const date = moment(d);
      return date.isValid() ? date.format('MMM YYYY') : d;
    };
    if (!start && !end) return '';
    if (!end) return ongoing === true ? `${format(start)} - Present` : format(start);
    if (!start) return format(end);
    return `${format(start)} - ${format(end)}`;
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
  },

  groupBy: function(array, key) {
    if (!Array.isArray(array)) return [];
    return array.reduce((groups, item) => {
      const groupKey = item[key] || 'Other';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
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