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

  // If a file imports calculateAge or sortByLastName
  if (content.includes('calculateAge') && !file.includes('calculateAge.ts') && !file.includes('CONTACTS.tsx')) {
      content = `import { calculateAge } from "@/utils/calculateAge"\n` + content;
  }
  if (content.includes('sortByLastName') && !file.includes('sortByLastName.ts') && !file.includes('CONTACTS.tsx')) {
      content = `import { sortByLastName } from "@/utils/sortByLastName"\n` + content;
  }

  // phoneBookMachine.ts specifically imports calculateAge and sortByLastName from CONTACTS
  if (file.includes('phoneBookMachine.ts')) {
    content = content.replace(/import CONTACTS_WITH_AGES, \{\n  calculateAge,\n  sortByLastName,\n\} from "@\/contacts\/CONTACTS"/g, 'import CONTACTS_WITH_AGES from "@/contacts/CONTACTS"');
    content = content.replace(/import CONTACTS_WITH_AGES, \{\n  calculateAge,\n  Contact,\n  sortByLastName,\n\} from "@\/contacts\/CONTACTS"/g, 'import CONTACTS_WITH_AGES from "@/contacts/CONTACTS"');
    // Also if they were imported on a single line:
    content = content.replace(/import CONTACTS_WITH_AGES, \{ calculateAge, sortByLastName \} from "@\/contacts\/CONTACTS"/g, 'import CONTACTS_WITH_AGES from "@/contacts/CONTACTS"');
  }

  // Remove original utility definitions from CONTACTS.tsx
  if (file.includes('CONTACTS.tsx')) {
    content = content.replace(/export const calculateAge = \(\{\s*birthYear,\s*birthMonth,\s*birthDay,\s*\}\: \{\s*birthYear\?\: string\s*birthMonth\?\: string\s*birthDay\?\: string\s*\}\) \=\> \{[\s\S]*?return age\n\}\n/g, 'import { calculateAge } from "@/utils/calculateAge"\n');
    content = content.replace(/export const sortByLastName = \(a\: Contact, b\: Contact\) \=\> \{[\s\S]*?return aLastName.localeCompare\(bLastName\)\n\}\n/g, 'import { sortByLastName } from "@/utils/sortByLastName"\n');
    
    // Add exports at the bottom if needed for backward compatibility
    if (!content.includes('export { calculateAge, sortByLastName }')) {
        content = content + '\nexport { calculateAge, sortByLastName }\n';
    }
  }

  fs.writeFileSync(file, content);
});

console.log('Utils refactor complete');
