const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const dirs = ['components', 'utils', 'contacts', 'app'];
let files = [];
dirs.forEach(d => {
  files = files.concat(walkSync(path.join(__dirname, '..', d)));
});

files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix DialogState imports
  content = content.replace(/import \{ DialogState \} from "@\/components\/ContactDialog"/g, 'import { DialogState } from "@/types"');
  if (content.includes('import ContactActionDialog, { DialogState } from "@/components/ContactDialog"')) {
    content = content.replace('import ContactActionDialog, { DialogState } from "@/components/ContactDialog"', 
    'import ContactActionDialog from "@/components/ContactDialog"\nimport { DialogState } from "@/types"');
  }

  // Fix Contact imports
  content = content.replace(/import \{ Contact \} from "@\/contacts\/CONTACTS"/g, 'import { Contact } from "@/types"');
  // phoneBookMachine.ts specifically imports Contact in a multiline import:
  // import CONTACTS_WITH_AGES, { calculateAge, Contact, sortByLastName } from "@/contacts/CONTACTS"
  if (content.includes('Contact,') && content.includes('@/contacts/CONTACTS')) {
      content = content.replace('Contact,', '');
      content = `import { Contact } from "@/types"\n` + content;
  }

  // Fix AgeRange imports
  content = content.replace(/import \{ AgeRange \} from "@\/contacts\/AGE_RANGES"/g, 'import { AgeRange } from "@/types"');

  // Remove original type definitions
  if (file.includes('AGE_RANGES.tsx')) {
    content = content.replace(/export type AgeRange = \{[\s\S]*?\}\n/, 'import { AgeRange } from "@/types"\n');
  }
  if (file.includes('ContactDialog.tsx')) {
    content = content.replace(/export type DialogState = \{[\s\S]*?\}\n/, '');
    if (!content.includes('@/types')) {
      content = content.replace('import { Contact } from "@/contacts/CONTACTS"', 'import { Contact, DialogState } from "@/types"');
    }
  }
  if (file.includes('CONTACTS.tsx')) {
    content = content.replace(/export type Contact = \{[\s\S]*?\}\n/, 'import { Contact } from "@/types"\n');
  }

  fs.writeFileSync(file, content);
});

console.log('Types refactor complete');
