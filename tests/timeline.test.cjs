const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
function compile(file,deps={}){const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const c={exports:{},require:n=>{assert.ok(n in deps,n);return deps[n];},Intl,Date,URL};vm.runInNewContext(source,c);return c.exports;}
const lib=compile('src/lib/timeline.ts');
function game(id,releaseYear=1994,popularity=1){return {id,title:id,releaseYear,platform:'PlayStation',genre:'Puzzle',imageUrl:'',popularity,views:0};}

test('timeline excludes unknown epoch and out-of-range dates but preserves dated 1970 records',()=>{
 const records=lib.timelineYears([game('unknown',1970),{...game('epoch',1970),releaseDate:'1970-01-01'}, {...game('dated',1970),releaseDate:'1970-06-01'},game('future',2027),game('past',1969),game('current',2026)],[],[],2026);
 assert.equal(records[0].games.length,1);assert.equal(records[0].games[0].id,'dated');assert.equal(records.at(-1).games[0].id,'current');assert.equal(records.some(y=>y.year===2027),false);
});
test('year grouping removes duplicate ids, caps games per year, and keeps console narratives as events',()=>{
 const g=Array.from({length:25},(_,i)=>game('game-'+i,1994,i));g.push(g[24]);
 const records=lib.timelineYears(g,[{id:'platform',name:'PlayStation',releaseYear:1994,manufacturer:'Sony'},{id:'platform',name:'PlayStation',releaseYear:1994,manufacturer:'Sony'}],[{id:'event',year:1994,title:'기기 이야기',description:'기록',type:'console'}],2026);
 const y=records.find(y=>y.year===1994);assert.equal(y.games.length,20);assert.equal(y.games[0].id,'game-24');assert.equal(y.platforms.length,1);assert.equal(y.events.length,1);
});
test('search normalizes text and category filters keep years and source records intact',()=>{
 const source=lib.timelineYears([{...game('puzzle'),title:'Ｔｅｓｔ Game'}],[{id:'p',name:'기기',releaseYear:1994,manufacturer:'Sony'}],[{id:'e',year:1994,title:'추억',description:'한국어 사건 설명',type:'event'}],2026);
 const found=lib.filterTimeline(source,{query:'test',games:true,platforms:true,events:true}).find(y=>y.year===1994);assert.equal(found.games.length,1);assert.equal(found.platforms.length,0);
 const events=lib.filterTimeline(source,{query:'한국어',games:false,platforms:false,events:true}).find(y=>y.year===1994);assert.equal(events.events.length,1);assert.equal(source.find(y=>y.year===1994).games.length,1);
 const empty=lib.filterTimeline(source,{query:'',games:false,platforms:false,events:false});assert.equal(empty.every(y=>lib.timelineRecordCount(y)===0),true);
});
test('shared year links reject malformed and future values',()=>{
 assert.equal(lib.parseTimelineYear('1994',2026),1994);
 for(const s of ['2027','1969','1994-extra','NaN','','1994.5'])assert.equal(lib.parseTimelineYear(s,2026),null);
});

function actions(role=null){const calls={events:[],platforms:[],sql:[]};const deps={
 '@/lib/prisma':{prisma:{timelineEvent:{findMany:async q=>{calls.events.push(q);return [{id:'e',year:1994,title:'공개 사건',type:'event',description:'설명',country:null,game:{title:'비공개 게임',releaseYear:1994,status:'PENDING',deletedAt:null},platform:{name:'기기',releaseYear:1994,status:'APPROVED'}}];}},platform:{findMany:async q=>{calls.platforms.push(q);return [];}},$queryRaw:async q=>{calls.sql.push(q);return [];}}},
 '@prisma/client':{Prisma:{sql:(strings,...values)=>({strings,values})}},
 'next-auth':{getServerSession:async()=>role?{user:{role}}:null},'@/lib/auth':{authOptions:{}},
 '@/lib/timeline':{...lib,currentTimelineYear:()=>2026},'@/lib/slug':{getGameSlug:()=> 'game',getPlatformSlug:()=> 'platform'},
 };return {api:compile('src/app/actions/timeline.ts',deps),calls};}
test('public event reads hide invisible records and unpublished related-document links',async()=>{
 const {api,calls}=actions();const rows=await api.getPublicTimelineEvents();assert.equal(calls.events[0].where.isVisible,true);assert.equal(calls.events[0].where.year.lte,2026);assert.equal(rows[0].gameHref,undefined);assert.equal(rows[0].platformHref,'/platforms/platform');assert.equal(rows[0].game,undefined);
});
test('the existing admin event reader still requires an allowed role',async()=>{
 for(const role of [null,'USER']){const {api,calls}=actions(role);assert.equal((await api.getTimelineEvents()).length,0);assert.equal(calls.events.length,0);}
 const {api,calls}=actions('ADMIN');await api.getTimelineEvents();assert.equal(calls.events.length,1);assert.equal(calls.events[0].where,undefined);
});
test('game selection binds the per-year cap and filters unapproved, deleted, unreleased rows before ranking',async()=>{
 const {api,calls}=actions();await api.getTopGamesForTimeline();const query=calls.sql[0];const sql=query.strings.join('?');assert.equal(query.values[0],1970);assert.equal(query.values[1],2026);assert.equal(query.values[2],20);
 assert.match(sql,/g\."status"='APPROVED'/);assert.match(sql,/g\."deletedAt" IS NULL/);assert.match(sql,/g\."releaseStatus"='RELEASED'/);assert.match(sql,/ROW_NUMBER\(\) OVER \(PARTITION BY g\."releaseYear"/);
 await api.getPlatformsForTimeline();assert.equal(calls.platforms[0].where.status,'APPROVED');assert.equal(calls.platforms[0].select.requestedById,undefined);
});
