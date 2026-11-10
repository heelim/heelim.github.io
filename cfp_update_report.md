# CFP Update Report
## Networking and Distributed Systems Conferences Check
Date: November 10, 2026

---

## 1. NSDI (Networked Systems Design and Implementation)

### NSDI 2026
**URL Checked:** https://www.usenix.org/conference/nsdi26

**Official Data:**
- Date: May 4-6, 2026 (CONFERENCE COMPLETED)
- Location: Renton, WA, USA
- Deadlines: Already passed

**cfp.json Data:**
- Date: May 4-6, 2026
- Location: Renton, WA, USA
- Spring: deadline 2025-04-25, notification 2025-07-24
- Fall: deadline 2025-09-18, notification 2025-12-09

**Status:** ✅ **MATCHES** - Data is consistent

---

### NSDI 2027
**URL Checked:** https://www.usenix.org/conference/nsdi27

**Official Data:**
- Date: May 11-13, 2027
- Location: Providence, RI, USA
- Spring Cycle:
  - Abstract deadline: April 16, 2026
  - Paper deadline: April 23, 2026
  - **Notification: July 23, 2026** (not July 1)
- Fall Cycle:
  - Abstract deadline: September 10, 2026
  - Paper deadline: September 17, 2026
  - **Notification: December 8, 2026** (not December 1)

**cfp.json Data:**
- Date: May 11-13, 2027
- Location: Providence, RI, USA
- Spring: abstract_deadline 2026-04-16, deadline 2026-04-23, notification **2026-07-01** ❌
- Fall: abstract_deadline 2026-09-10, deadline 2026-09-17, notification **2026-12-01** ❌
- is_verified: true

**Changes Required:**
1. ❌ **Spring notification**: Should be **2026-07-23** (currently 2026-07-01)
2. ❌ **Fall notification**: Should be **2026-12-08** (currently 2026-12-01)

---

### NSDI 2028
**URL Checked:** https://www.usenix.org/conference/nsdi28

**Status:** ⚠️ **Could not verify** - Page protected by Cloudflare

**cfp.json Data:**
- Date: May 9-11, 2028
- Location: Santa Clara, CA, USA
- Estimated deadlines (is_verified: false)

**Note:** Cannot verify at this time due to website protection

---

## 2. SIGCOMM

### SIGCOMM 2026
**URL Checked:** http://conferences.sigcomm.org/sigcomm/2026

**Official Data:**
- **Date: August 17-21, 2026** (5 days)
- Location: Denver, CO, USA (Colorado Convention Center)
- Paper submission deadline already passed
- Conference currently ongoing/completed

**cfp.json Data:**
- Date: **August 5-7, 2026** ❌ (3 days)
- Location: Denver, CO, USA
- Abstract deadline: 2026-01-30
- Deadline: 2026-02-06
- Notification: April 2026
- is_verified: true

**Changes Required:**
1. 🚨 **CRITICAL: Date is completely wrong!**
   - Should be: **August 17-21, 2026**
   - Currently: August 5-7, 2026
2. 🚨 **start_date**: Should be **2026-08-17** (currently 2026-08-05)
3. 🚨 **finish_date**: Should be **2026-08-21** (currently 2026-08-07)

---

### SIGCOMM 2027
**URL Checked:** https://conferences.sigcomm.org/sigcomm/2027/

**Official Data:**
- Date: August 8-12, 2027
- Location: Bangkok, Thailand (Queen Sirikit National Convention Center)
- Main Conference Paper Submission: February 2, 2027

**cfp.json Data:**
- Date: August 8-12, 2027
- Location: Bangkok, Thailand
- Deadline: 2027-02-02
- is_verified: true

**Status:** ✅ **MATCHES** - Data is consistent

---

## 3. MobiCom (Mobile Computing and Networking)

### MobiCom 2026
**URL Checked:** https://www.sigmobile.org/mobicom/2026/

**Official Data:**
- Date: October 26-30, 2026
- Location: Austin, Texas, USA
- **Summer Deadlines** (Cycle 1):
  - Abstract: August 27, 2025
  - Submission: September 3, 2025
  - Early Notification: October 28, 2025
  - Final Notification: November 24, 2025
- **Winter Deadlines** (Cycle 2):
  - Abstract: March 6, 2026
  - Submission: March 13, 2026
  - Early Notification: May 21, 2026
  - **Final Notification: June 29, 2026** (not June 22)

**cfp.json Data:**
- Date: October 26-30, 2026
- Location: Austin, TX, USA
- Only has "Cycle-2":
  - abstract_deadline: 2026-03-06
  - deadline: 2026-03-13
  - early_notification: 2026-05-21
  - notification: **2026-06-22** ❌
- is_verified: true

**Changes Required:**
1. ❌ **Cycle-2 notification**: Should be **2026-06-29** (currently 2026-06-22)
2. ℹ️ **Missing Summer/Cycle-1 data** (already passed, may not need to add)

---

### MobiCom 2027
**URL Checked:** https://www.sigmobile.org/mobicom/2027/

**Official Data:**
- Date: October 18-22, 2027
- Location: Not specified yet
- **Summer Deadlines** (Cycle 1):
  - Abstract: August 26, 2026
  - Submission: September 2, 2026
  - Early Notification: October 23, 2026
  - Final Notification: November 19, 2026
- Winter Deadlines: TBD

**cfp.json Data:**
- Date: October 18-22, 2027
- Location: "" (empty)
- Cycle-1: abstract_deadline 2026-08-26, deadline 2026-09-02, early_notification 2026-10-23, notification 2026-11-19, is_verified: true
- Estimated (Cycle-2): has estimated data, is_verified: false

**Status:** ✅ **MATCHES** for Cycle-1 - Data is consistent

---

## 4. CoNEXT (Conference on emerging Networking EXperiments and Technologies)

### CoNEXT 2026
**URL Checked:** https://conferences2.sigcomm.org/co-next/2026

**Official Data (from JavaScript variables):**
- Date: December 7-10, 2026
- Location: Jaarbeurs Convention Centre, Utrecht, The Netherlands

**cfp.json Data:**
- Date: December 7-10, 2026
- Location: Utrecht, The Netherlands
- Winter: deadline 2025-12-11, notification **2025-12-08** ⚠️ (notification before deadline!)
- June: abstract_deadline 2026-05-29, deadline 2026-06-05, early_notification "July, 2026", notification 2026-09-11, is_verified: true

**Status:** ✅ **Dates and location match**
**Warning:** ⚠️ Winter cycle has **notification date before deadline** (Dec 8 notification vs Dec 11 deadline) - likely a data error

---

### CoNEXT 2027
**URL Checked:** https://conferences2.sigcomm.org/co-next/2027/

**Official Data (from JavaScript variables):**
- Date: December 6-9, 2027 (To be confirmed)
- Location: Rio de Janeiro, Brazil

**cfp.json Data:**
- Date: December 6-9, 2027
- Location: Rio de Janeiro, Brazil
- Winter: abstract_deadline 2026-11-27, deadline 2026-12-04, early_notification "February 2027", notification 2027-03-31, is_verified: true

**Status:** ✅ **MATCHES** - Data is consistent

**Note:** Official site indicates dates are "To be confirmed"

---

## 5. ICDCS (International Conference on Distributed Computing Systems)

### ICDCS 2026
**URL Checked:** https://icdcs2026.icdcs.org

**Official Data:**
- Date: **June 22-25, 2026** (4 days)
- Location: South Korea
- Paper Abstract Registration: **January 21, 2026**
- Paper Submission Due: **January 21, 2026**
- Author Notification: **April 27, 2026**
- Camera-Ready: May 14, 2026

**cfp.json Data:**
- Date: June 22-25, 2026
- **start_date: 2026-07-01** ❌ (July 1 - wrong!)
- **finish_date: 2026-06-25** ❌ (finish before start - impossible!)
- Location: South Korea
- Deadline: **2025-12-12** ❌ (December 12, 2025 - wrong!)
- Notification: "" (empty)
- is_verified: true

**Changes Required:**
1. 🚨 **start_date**: Should be **2026-06-22** (currently 2026-07-01)
2. 🚨 **finish_date**: Currently correct as 2026-06-25
3. 🚨 **Deadline**: Should be **2026-01-21** (currently 2025-12-12)
4. ❌ **Notification**: Should be **2026-04-27** (currently empty)
5. ⚠️ **Note**: Official CFP shows abstract and paper deadline are the same date (Jan 21)

---

### ICDCS 2027
**URL Checked:** https://icdcs2027.icdcs.org/

**Official Data:**
- Date: July 5-8, 2027
- Location: Melbourne, Australia
- No specific deadlines posted yet (early stage)

**cfp.json Data:**
- Date: July 5-8, 2027
- Location: Melbourne, Australia
- Estimated: deadline 2026-12-12, notification "" (empty), is_verified: false

**Status:** ✅ **Location confirmed**
ℹ️ Deadlines are marked as "Estimated" - cannot verify yet as official CFP not posted

---

## Summary of Required Changes

### Critical Issues (Data Errors):
1. 🚨 **SIGCOMM 2026**: Conference dates completely wrong (Aug 5-7 should be Aug 17-21)
2. 🚨 **ICDCS 2026**: Wrong start_date (July 1 should be June 22) and wrong deadline (Dec 12, 2025 should be Jan 21, 2026)

### Important Updates:
3. ❌ **NSDI 2027**: Two notification dates are off by ~week (Spring: July 1 → July 23; Fall: Dec 1 → Dec 8)
4. ❌ **MobiCom 2026**: Cycle-2 notification date is off by 1 week (June 22 → June 29)

### Data Quality Issues:
5. ⚠️ **CoNEXT 2026**: Winter cycle has impossible dates (notification Dec 8 before deadline Dec 11)

### Verification Status:
- **NSDI 2028**: Could not verify due to website protection
- **ICDCS 2027**: No official CFP posted yet, estimated dates unverified

---

## Unverified Entries That Now Have Official Data

### Became Verified:
- **NSDI 2027**: Was marked verified (true) but has incorrect notification dates
- **SIGCOMM 2026**: Was marked verified (true) but has completely wrong conference dates
- **MobiCom 2026**: Was marked verified (true) but has incorrect notification date
- **ICDCS 2026**: Was marked verified (true) but has multiple data errors

---

## Recommendations

1. **Immediate Action Required**:
   - Fix SIGCOMM 2026 dates (critical error)
   - Fix ICDCS 2026 dates and deadlines (multiple errors)

2. **High Priority**:
   - Update NSDI 2027 notification dates
   - Update MobiCom 2026 notification date

3. **Review**:
   - Investigate CoNEXT 2026 Winter cycle impossible dates
   - Monitor NSDI 2028 when page becomes accessible
   - Update ICDCS 2027 when official CFP is posted

4. **Data Quality**:
   - Review verification process for entries marked as "verified"
   - Several verified entries contained incorrect data
