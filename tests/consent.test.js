import test from 'node:test';
import assert from 'node:assert/strict';
import {adDecision, excludedFromAds} from '../src/utils/consent.js';
const accepted=()=>({cmpStatus:'loaded',eventStatus:'useractioncomplete',gdprApplies:true,tcString:'synthetic-test-only',purpose:{consents:{1:true,3:true,4:true},legitimateInterests:{2:true,7:true,9:true,10:true}},vendor:{consents:{755:true},legitimateInterests:{755:true}}});
test('unknown, failed, open UI and reject remain paused',()=>{
 for(const tc of [undefined,{}, {...accepted(),gdprApplies:undefined},{...accepted(),eventStatus:'cmpuishown'},{...accepted(),purpose:{}},{...accepted(),vendor:{}},{...accepted(),tcString:''}]) assert.equal(adDecision(tc,true),false);
 assert.equal(adDecision(accepted(),false),false);
});
test('accept and stored consent enable; withdrawal disables',()=>{
 assert.equal(adDecision(accepted(),true),true);
 assert.equal(adDecision({...accepted(),eventStatus:'tcloaded'},true),true);
 const tc=accepted();tc.purpose.consents[1]=false;assert.equal(adDecision(tc,true),false);
});
test('explicit non-EU determination enables, no geographic guessing',()=>{
 assert.equal(adDecision({cmpStatus:'loaded',eventStatus:'tcloaded',gdprApplies:false},true),true);
 assert.equal(adDecision({gdprApplies:false},true),false);
});
test('publisher restrictions override legal basis',()=>{
 for(const restriction of [0,1])assert.equal(adDecision({...accepted(),publisher:{restrictions:{2:{755:restriction}}}},true),false);
 assert.equal(adDecision({...accepted(),publisher:{restrictions:{2:{755:2}}}},true),true);
});
test('editor routes excluded with trailing slashes',()=>{
 for(const p of ['/builder','/builder/','/templates','/templates/'])assert.equal(excludedFromAds(p),true);
 assert.equal(excludedFromAds('/blog'),false);
});
