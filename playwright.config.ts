import { defineConfig } from "@playwright/test";
export default defineConfig({testDir:"./tests/e2e",fullyParallel:true,retries:0,reporter:"list",use:{baseURL:"http://127.0.0.1:3000",trace:"retain-on-failure"},projects:[
 {name:"mobile",use:{viewport:{width:320,height:800}}},
 {name:"tablet",use:{viewport:{width:768,height:1024}}},
 {name:"desktop",use:{viewport:{width:1440,height:900}}},
],webServer:{command:"npm run dev",url:"http://127.0.0.1:3000",reuseExistingServer:true,timeout:120000}});
