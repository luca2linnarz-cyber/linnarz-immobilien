import git from 'isomorphic-git';
import fs from 'node:fs';
const dir=process.cwd();
await git.init({fs,dir,defaultBranch:'main'});
for(const name of fs.readdirSync(dir)){if(['.git','node_modules','.next','reference','tsconfig.tsbuildinfo'].includes(name))continue;await git.add({fs,dir,filepath:name});}
const sha=await git.commit({fs,dir,message:'Build responsive Linnarz Immobilien website and restore castle hero asset',author:{name:'Codex',email:'codex@localhost'}});
await git.addRemote({fs,dir,remote:'origin',url:'https://github.com/luca2linnarz-cyber/linnarz-immobilien.git',force:true});
console.log(sha);
