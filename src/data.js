export const sampleApplications = [
  { $id: "demo-1", company: "Northstar Analytics", role: "Junior Data Analyst", location: "Mumbai, Hybrid", status: "Interview", jobType: "Full-time", salary: "₹3.5–5 LPA", appliedDate: "2026-10-20", interviewDate: "2026-10-29", source: "LinkedIn", jobUrl: "https://www.linkedin.com/jobs/", notes: "Prepare SQL joins and dashboard walkthrough.", description: "Excel, SQL, Power BI, reporting, data cleaning, Python" },
  { $id: "demo-2", company: "BlueOrbit Services", role: "MIS Executive", location: "Airoli, Navi Mumbai", status: "Applied", jobType: "Full-time", salary: "₹2.8–3.6 LPA", appliedDate: "2026-10-22", interviewDate: "", source: "Naukri", jobUrl: "https://www.naukri.com/", notes: "Follow up after five business days.", description: "Advanced Excel, VLOOKUP, PivotTables, MIS reports, data validation" },
  { $id: "demo-3", company: "FinEdge Operations", role: "Data Operations Associate", location: "Thane, On-site", status: "Shortlisted", jobType: "Full-time", salary: "₹3–4 LPA", appliedDate: "2026-10-18", interviewDate: "2026-10-30", source: "Company website", jobUrl: "https://example.com", notes: "Confirm interview time with recruiter.", description: "Excel, data quality, accuracy, documentation, reporting" },
  { $id: "demo-4", company: "PixelBridge Consulting", role: "Reporting Analyst Intern", location: "Remote", status: "Rejected", jobType: "Internship", salary: "₹18k/month", appliedDate: "2026-10-10", interviewDate: "", source: "Referral", jobUrl: "", notes: "Review required Power BI experience.", description: "Power BI, DAX, SQL, KPI dashboards, stakeholder reporting" },
  { $id: "demo-5", company: "CloudNine Retail", role: "Business Data Executive", location: "Vashi, Navi Mumbai", status: "Offer", jobType: "Full-time", salary: "₹3.2 LPA", appliedDate: "2026-10-12", interviewDate: "", source: "Indeed", jobUrl: "https://in.indeed.com/", notes: "Compare role responsibilities and growth path.", description: "Excel, reporting, data management, communication, quality checks" }
];

export const emptyApplication = {
  company: "", role: "", location: "", status: "Applied", jobType: "Full-time",
  salary: "", appliedDate: new Date().toISOString().slice(0, 10), interviewDate: "",
  source: "LinkedIn", jobUrl: "", notes: "", description: ""
};

export function matchScore(description = "") {
  const skills = ["excel", "sql", "power bi", "python", "reporting", "data cleaning", "dax", "communication", "data quality", "pivot tables"];
  const text = description.toLowerCase();
  const matched = skills.filter(skill => text.includes(skill));
  const score = Math.round((matched.length / skills.length) * 100);
  return { score, matched, missing: skills.filter(skill => !text.includes(skill)) };
}
