const fs = require('fs');
const path = require('path');

const directoriesToProcess = [
  path.join(__dirname, 'src/dashboard/pages/customer'),
  path.join(__dirname, 'src/dashboard/pages/admin'),
  path.join(__dirname, 'src/dashboard/components'),
  path.join(__dirname, 'src/dashboard/layouts')
];

const replacements = {
  // Surfaces
  'bg-surface-container-lowest': 'bg-white',
  'bg-surface-container-low': 'bg-gray-50',
  'bg-surface-container-high': 'bg-gray-100',
  'bg-surface-container-highest': 'bg-gray-200',
  'bg-surface-container': 'bg-gray-100',
  'bg-background': 'bg-gray-50',
  
  // Text
  'text-on-surface-variant': 'text-gray-500',
  'text-on-surface': 'text-gray-900',
  'text-on-background': 'text-gray-900',
  
  // Primary (emerald)
  'text-primary': 'text-emerald-600',
  'bg-primary-fixed-dim': 'bg-emerald-200',
  'bg-primary-fixed': 'bg-emerald-100',
  'bg-primary': 'bg-emerald-500',
  'text-on-primary-fixed-variant': 'text-emerald-700',
  'text-on-primary-fixed': 'text-emerald-800',
  'text-on-primary': 'text-white',
  'var(--primary)': '#10b981',
  '\\[var\\(--primary\\)\\]': 'emerald-500', // for focus:ring-[var(--primary)] etc
  
  // Secondary / Outlines
  'bg-secondary-container': 'bg-blue-100',
  'text-on-secondary-container': 'text-blue-700',
  'bg-outline-variant': 'bg-gray-200',
  'border-outline-variant': 'border-gray-200',
  'border-outline': 'border-gray-300',
  'text-outline-variant': 'text-gray-300',
  'text-outline': 'text-gray-400',
  
  // Font classes (to be removed or mapped)
  'font-h1 text-h1': 'text-4xl font-bold',
  'font-h2 text-h2': 'text-3xl font-bold',
  'font-h3 text-h3': 'text-2xl font-bold',
  'font-body-lg text-body-lg': 'text-lg',
  'font-body-md text-body-md': 'text-base',
  'font-label-sm text-label-sm': 'text-sm font-medium',
  'font-button text-button': 'text-sm font-bold',
  'font-h1': 'font-bold',
  'font-h2': 'font-bold',
  'font-h3': 'font-bold',
  'text-h1': 'text-4xl',
  'text-h2': 'text-3xl',
  'text-h3': 'text-2xl',
  'font-body-lg': '',
  'text-body-lg': 'text-lg',
  'font-body-md': '',
  'text-body-md': 'text-base',
  'font-label-sm': 'font-medium',
  'text-label-sm': 'text-sm',
  'font-button': 'font-bold',
  'text-button': 'text-sm'
};

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Perform replacements
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(regex, value);
      }
      
      // Fix specific leftover dynamic vars
      content = content.replace(/focus:ring-\[var\(--primary\)\\]/g, 'focus:ring-emerald-500');
      content = content.replace(/hover:text-\[var\(--primary\)\\]/g, 'hover:text-emerald-600');
      content = content.replace(/hover:bg-\[var\(--primary\)\\]/g, 'hover:bg-emerald-500');
      content = content.replace(/focus:border-\[var\(--primary\)\\]/g, 'focus:border-emerald-500');
      content = content.replace(/bg-\[var\(--primary\)\\]/g, 'bg-emerald-500');
      content = content.replace(/ring-\[var\(--primary\)\\]/g, 'ring-emerald-500');
      content = content.replace(/var\(--primary\)/g, '#10b981');
      
      // Cleanup extra spaces left by empty string replacements
      content = content.replace(/\s+/g, ' ');
      // Fix formatting for jsx string literals (quick hack for spaces)
      content = content.replace(/ className=" /g, ' className="');
      content = content.replace(/ "/g, '"');
      
      if (content !== originalContent) {
        // Need to be careful not to completely break the file formatting. The \s+ replacement is too aggressive.
        // Let's do it better.
      }
    }
  }
}

// Rewriting without aggressive whitespace
function processDirectorySafe(directory) {
  if (!fs.existsSync(directory)) return;
  
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectorySafe(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Specific combined font replacements
      const fontCombos = [
        ['font-h1 text-h1', 'text-4xl font-bold'],
        ['font-h2 text-h2', 'text-3xl font-bold'],
        ['font-h3 text-h3', 'text-2xl font-bold'],
        ['font-body-lg text-body-lg', 'text-lg'],
        ['font-body-md text-body-md', 'text-base'],
        ['font-label-sm text-label-sm', 'text-sm font-medium'],
        ['font-button text-button', 'text-sm font-bold']
      ];
      
      for (const [key, value] of fontCombos) {
        content = content.replace(new RegExp(key, 'g'), value);
      }
      
      for (const [key, value] of Object.entries(replacements)) {
        // Skip combos we already did
        if (key.includes(' ')) continue;
        
        // Use word boundary for tailwind classes
        // but for \[var\(--primary\)\] we need a different regex
        if (key.includes('\\[')) {
          content = content.replace(new RegExp(key, 'g'), value);
        } else {
          content = content.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
        }
      }
      
      // Fix leftover empty classes like `className="   "` -> `className=""`
      content = content.replace(/className="\s+"/g, 'className=""');
      content = content.replace(/className=' ' /g, 'className="" ');
      
      if (content !== originalContent) {
        console.log(`Updated ${fullPath}`);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDirectorySafe(directoriesToProcess[0]);
processDirectorySafe(directoriesToProcess[1]);
processDirectorySafe(directoriesToProcess[2]);
processDirectorySafe(directoriesToProcess[3]);

console.log('Done replacing tokens.');
