# CFP Update Check - Changes Found
Date: 2026-11-10

## Manual Verification (Initial Batch)

### ASPLOS 2026
**Source**: https://www.asplos-conference.org/asplos2026/cfp/
**Changes**:
- Spring cycle missing `abstract_deadline`: should be `2025-03-05`
- Spring cycle `is_verified`: should be `true` (official CFP published)

**Current data**:
```json
"Spring": {
    "deadline": "2025-03-12",
    "notification": "2025-06-24",
    "is_verified": false
}
```

**Should be**:
```json
"Spring": {
    "abstract_deadline": "2025-03-05",
    "deadline": "2025-03-12",
    "notification": "2025-06-24",
    "is_verified": true
}
```

### PACT 2026
**Source**: https://pact2026.github.io/
**Status**: ✓ All data matches - NO CHANGES NEEDED

### EuroSys 2026
**Source**: https://2026.eurosys.org/
**Status**: ✓ All data matches - NO CHANGES NEEDED

### MICRO 2026
**Source**: http://www.microarch.org/micro59
**Status**: ✓ All data matches - NO CHANGES NEEDED

### CGO 2026
**Source**: https://2026.cgo.org/
**Status**: ✓ Conference dates and location match - NO CHANGES NEEDED
(Note: CFP page redirects to CGO 2027; 2026 deadlines unverified but conference already past)

### PPoPP 2026
**Source**: https://ppopp26.sigplan.org
**Status**: ✓ Conference dates and location match - NO CHANGES NEEDED

### PLDI 2026
**Source**: https://pldi26.sigplan.org
**Status**: ✓ Conference dates and location match - NO CHANGES NEEDED

### EuroSys 2027
**Source**: https://2027.eurosys.org/cfp.html
**Status**: ✓ All data matches perfectly - NO CHANGES NEEDED

### CGO 2027
**Source**: https://conf.researchr.org/home/cgo-2027
**Status**: ✓ All data matches - NO CHANGES NEEDED

### ASPLOS 2027
**Source**: https://www.asplos-conference.org/asplos2027/
**Status**: ✓ Conference dates and location match - NO CHANGES NEEDED

### PLDI 2027
**Source**: https://pldi27.sigplan.org/
**Status**: ✓ All data matches perfectly - NO CHANGES NEEDED

---

## Subagent Results (4 of 9 completed)

### From [Architecture Agent](bc-57156602-1dc6-5227-b5f8-15eb8b5cc336):
**✅ RTSS 2026**: Added abstract_deadline (May 21), updated paper deadline to May 26
- Verified 7 conferences, 1 update needed, 2 URL issues noted

### From [Security Agent](bc-75c7722c-29b6-56a4-bc3d-828e1078c99c):
**🔴 CCS 2026 Cycle-1**: Corrected to official dates (Jan 7/14, Apr 9) - previous automated push was incorrect!
**✅ NDSS 2027 Fall**: Updated notification to Dec 2
**✅ AsiaCCS 2026**: Set both cycles to is_verified=true

### From [HPC Agent](bc-d1c1679f-3670-5ccf-ab45-3d1b06033f92):
**✅ IPDPS 2026 & 2027**: Added final_notification dates (Feb 2 for both years)
- Verified 12 conference editions, most accurate

### From [ML/AI Agent](bc-de856734-7f35-5ada-98c6-de8594eaa298):
**✅ NeurIPS 2027**: Fixed URL to point to 2027 conference
- 10/15 editions fully verified, excellent accuracy overall

---

**Still waiting for 5 more subagents:**
- Networking conferences
- PL/compilers conferences  
- SE/DB/data conferences
- Remaining conferences (DAC, DATE, ICCD, etc.)
- IEEE/ACM journals
