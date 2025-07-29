const o=new Map,i=(t,a)=>{try{const n=o.get("validation_errors");return n&&n[t]?n[t]:a||t}catch{return console.warn(`Validation error key not found: ${t}`),a||t}};export{i as g};
